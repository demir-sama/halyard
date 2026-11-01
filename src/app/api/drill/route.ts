import { NextResponse } from "next/server";
import { forward, routable, type Vm } from "@/lib/portaldot";
import { Ledger } from "@/lib/health";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
// Outage drill: replays real JSON-RPC traffic against Portaldot V3 while forcing one endpoint
// to fail, using an isolated ledger (production routing is never affected).
export async function GET(req: Request) {
  const u = new URL(req.url);
  const vm = (u.searchParams.get("vm") === "evm" ? "evm" : "substrate") as Vm;
  const pool = routable(vm);
  const target = u.searchParams.get("target") ?? pool[0]?.id;
  const steps = Math.min(12, Math.max(3, Number(u.searchParams.get("steps") ?? 8)));
  if (!pool.some((e) => e.id === target)) return NextResponse.json({ error: "unknown target" }, { status: 400 });
  // Priority mode keeps the target first in line so the breaker trip is visible step by step.
  const L = new Ledger({ threshold: 3, cooldownMs: 30_000, window: 60 }, "priority");
  const ordered = [pool.find((e) => e.id === target)!, ...pool.filter((e) => e.id !== target)];
  const method = vm === "evm" ? "eth_blockNumber" : "chain_getHeader";
  const timeline = [];
  for (let i = 0; i < steps; i++) {
    const recover = i >= steps - 2; // last two steps: outage ends, breaker half-opens via cooldown skip
    if (recover && i === steps - 2) L.expireCooldowns();
    const t0 = performance.now();
    try {
      const r = await forward(vm, { jsonrpc: "2.0", id: i + 1, method, params: [] }, { ledger: L, pool: ordered, fail: recover ? new Set() : new Set([target]) });
      const res = (r.json as { result?: unknown }).result;
      timeline.push({ step: i + 1, phase: recover ? "recovery" : "outage", ok: true, upstream: r.upstream, hops: r.hops, ms: Math.round(performance.now() - t0), result: typeof res === "object" ? (res as { number?: string }).number : res });
    } catch (e) {
      timeline.push({ step: i + 1, phase: recover ? "recovery" : "outage", ok: false, hops: (e as { hops?: unknown }).hops ?? [], ms: Math.round(performance.now() - t0), error: (e as Error).message });
    }
  }
  return NextResponse.json({ vm, target, pool: pool.map((e) => ({ id: e.id, label: e.label })), method, timeline, final: pool.map((e) => ({ id: e.id, breaker: L.breaker(e.id), ...L.score(e.id) })) });
}
