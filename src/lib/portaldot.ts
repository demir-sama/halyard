// Portaldot V3 network registry + JSON-RPC helpers (server-side).
import { ledger as defaultLedger, record, type Ledger } from "./health";
import { checkEvm, checkSubstrate, type Check } from "./fingerprint";
export type Vm = "substrate" | "evm";
export type Role = "primary" | "sentinel";
export interface Endpoint { id: string; vm: Vm; url: string; label: string; role: Role; transport: "https" | "wss"; }

const list = (v: string | undefined, d: string[]) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : d);

export const NETWORK = {
  name: "Portaldot V3 Testnet",
  evmChainId: 420420777,
  explorer: "https://scanner-testnet-v3.portaldot.dev",
  token: "tPOT",
};

const mk = (vm: Vm, role: Role, prefix: string) => (url: string, i: number): Endpoint => ({
  id: `${prefix}-${i}`, vm, url, role, transport: url.startsWith("ws") ? "wss" : "https",
  label: new URL(url).host + (url.startsWith("ws") ? " · ws" : ""),
});

/** Routable endpoints (failover pool) plus sentinels (probed + fingerprinted, never routed). */
export function endpoints(): Endpoint[] {
  const sub = list(process.env.PORTALDOT_SUBSTRATE_RPCS, ["https://test-node-v3.portaldot.dev", "wss://test-node-v3.portaldot.dev"]);
  const evm = list(process.env.PORTALDOT_EVM_RPCS, ["https://test-evm-rpc-v3.portaldot.dev"]);
  const sentinels = list(process.env.HALYARD_SENTINEL_RPCS, ["wss://mainnet.portaldot.io"]);
  return [...sub.map(mk("substrate", "primary", "sub")), ...evm.map(mk("evm", "primary", "evm")), ...sentinels.map(mk("substrate", "sentinel", "sen"))];
}
export const routable = (vm: Vm) => endpoints().filter((e) => e.vm === vm && e.role === "primary");

/** One-shot JSON-RPC over WebSocket (Node 22+ global WebSocket). Returns the parsed reply. */
export function wsCall(url: string, payload: string, timeoutMs = 8000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const t = setTimeout(() => { ws.close(); reject(new Error("ws timeout")); }, timeoutMs);
    ws.onopen = () => ws.send(payload);
    ws.onmessage = (ev) => { clearTimeout(t); ws.close(); try { resolve(JSON.parse(String(ev.data))); } catch (e) { reject(e); } };
    ws.onerror = () => { clearTimeout(t); reject(new Error("ws connection failed")); };
  });
}

async function raw(url: string, body: unknown, timeoutMs: number): Promise<unknown> {
  if (url.startsWith("ws")) return wsCall(url, JSON.stringify(body), timeoutMs);
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function rpc<T = unknown>(url: string, method: string, params: unknown[] = [], timeoutMs = 8000) {
  const t0 = performance.now();
  const json = (await raw(url, { jsonrpc: "2.0", id: 1, method, params }, timeoutMs)) as { result?: T; error?: { message?: string } };
  const ms = Math.round(performance.now() - t0);
  if (json.error) throw Object.assign(new Error(json.error.message ?? "rpc error"), { ms });
  return { result: json.result as T, ms };
}

export interface ProbeResult {
  endpoint: Endpoint; ok: boolean; latencyMs: number; error?: string;
  head?: number; finalized?: number; chain?: string; runtime?: string; chainId?: number; genesis?: string; peers?: number; checks?: Check[];
}

function quarantine<T extends { endpoint: Endpoint; checks: Check[] }>(r: T): T {
  const bad = r.checks.filter((c) => !c.pass);
  if (bad.length) defaultLedger.quarantined.set(r.endpoint.id, bad.map((c) => c.label).join(", ") + " mismatch");
  else defaultLedger.quarantined.delete(r.endpoint.id);
  return r;
}

export async function probe(e: Endpoint): Promise<ProbeResult> {
  try {
    if (e.vm === "evm") {
      const [cid, bn, blk] = await Promise.all([
        rpc<string>(e.url, "eth_chainId"),
        rpc<string>(e.url, "eth_blockNumber"),
        rpc<{ hash: string }>(e.url, "eth_getBlockByNumber", ["0x0", false]),
      ]);
      const out = { endpoint: e, ok: true, latencyMs: bn.ms, chainId: parseInt(cid.result, 16), head: parseInt(bn.result, 16), genesis: blk.result?.hash };
      record(e.id, true, bn.ms);
      return quarantine({ ...out, checks: checkEvm(out) });
    }
    const [chain, header, fin, ver, gen, health] = await Promise.all([
      rpc<string>(e.url, "system_chain"),
      rpc<{ number: string }>(e.url, "chain_getHeader"),
      rpc<string>(e.url, "chain_getFinalizedHead"),
      rpc<{ specName: string; specVersion: number }>(e.url, "state_getRuntimeVersion"),
      rpc<string>(e.url, "chain_getBlockHash", [0]),
      rpc<{ peers: number }>(e.url, "system_health").catch(() => ({ result: { peers: -1 }, ms: 0 })),
    ]);
    const finHeader = await rpc<{ number: string }>(e.url, "chain_getHeader", [fin.result]);
    record(e.id, true, header.ms);
    const out = {
      endpoint: e, ok: true, latencyMs: header.ms, chain: chain.result,
      head: parseInt(header.result.number, 16), finalized: parseInt(finHeader.result.number, 16),
      runtime: `${ver.result.specName}@${ver.result.specVersion}`, genesis: gen.result, peers: health.result.peers,
    };
    return quarantine({ ...out, checks: checkSubstrate(out) });
  } catch (err) {
    record(e.id, false, 0);
    return { endpoint: e, ok: false, latencyMs: -1, error: (err as Error).message };
  }
}

export type Hop = { endpoint: string; id: string; ok: boolean; ms: number; error?: string; breaker: string };

/** Scored failover. `opts.fail` forces named endpoints to fail (outage drills, isolated ledger only). */
export async function forward(vm: Vm, body: unknown, opts: { ledger?: Ledger; fail?: Set<string>; pool?: Endpoint[] } = {}) {
  const L = opts.ledger ?? defaultLedger;
  const eps = L.rank(opts.pool ?? routable(vm));
  const hops: Hop[] = [];
  for (const e of eps) {
    const t0 = performance.now();
    try {
      if (opts.fail?.has(e.id)) { await new Promise((r) => setTimeout(r, 40)); throw new Error("simulated outage"); }
      const json = await raw(e.url, body, 10000);
      const ms = Math.round(performance.now() - t0);
      L.record(e.id, true, ms);
      hops.push({ endpoint: e.label, id: e.id, ok: true, ms, breaker: L.breaker(e.id) });
      return { upstream: e.label, tried: hops.map((h) => h.endpoint), hops, json };
    } catch (err) {
      L.record(e.id, false, 0);
      hops.push({ endpoint: e.label, id: e.id, ok: false, ms: Math.round(performance.now() - t0), error: (err as Error).message, breaker: L.breaker(e.id) });
    }
  }
  throw Object.assign(new Error(hops.length ? hops[hops.length - 1].error : "no endpoints"), { hops });
}
