import { NextResponse } from "next/server";
import { endpoints, probe, NETWORK } from "@/lib/portaldot";
import { breaker, history, score } from "@/lib/health";
export const dynamic = "force-dynamic";
export async function GET() {
  const results = (await Promise.all(endpoints().map(probe))).map((r) => ({ ...r, health: { ...score(r.endpoint.id), breaker: breaker(r.endpoint.id), history: history(r.endpoint.id) } }));
  const sub = results.find((r) => r.endpoint.vm === "substrate" && r.ok);
  const evm = results.find((r) => r.endpoint.vm === "evm" && r.ok);
  const drift = sub?.head != null && evm?.head != null ? sub.head - evm.head : null;
  const checks = results.flatMap((r) => r.checks ?? []);
  return NextResponse.json({
    network: NETWORK, at: new Date().toISOString(), results,
    crossVm: { drift, finalityLag: sub ? (sub.head ?? 0) - (sub.finalized ?? 0) : null, chainIdMatch: evm?.chainId === NETWORK.evmChainId, fingerprintOk: checks.length > 0 && checks.every((c) => c.pass) },
  }, { headers: { "cache-control": "no-store" } });
}
