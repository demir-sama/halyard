// Portaldot V3 network registry + JSON-RPC helpers (server-side).
import { record, rank } from "./health";
import { checkEvm, checkSubstrate, type Check } from "./fingerprint";
export type Vm = "substrate" | "evm";
export interface Endpoint { id: string; vm: Vm; url: string; label: string; }

const list = (v: string | undefined, d: string[]) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : d);

export const NETWORK = {
  name: "Portaldot V3 Testnet",
  evmChainId: 420420777,
  explorer: "https://scanner-testnet-v3.portaldot.dev",
  token: "tPOT",
};

export function endpoints(): Endpoint[] {
  const sub = list(process.env.PORTALDOT_SUBSTRATE_RPCS, ["https://test-node-v3.portaldot.dev"]);
  const evm = list(process.env.PORTALDOT_EVM_RPCS, ["https://test-evm-rpc-v3.portaldot.dev"]);
  return [
    ...sub.map((url, i) => ({ id: `sub-${i}`, vm: "substrate" as const, url, label: new URL(url).host })),
    ...evm.map((url, i) => ({ id: `evm-${i}`, vm: "evm" as const, url, label: new URL(url).host })),
  ];
}

export async function rpc<T = unknown>(url: string, method: string, params: unknown[] = [], timeoutMs = 8000) {
  const t0 = performance.now();
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  const json = await res.json();
  const ms = Math.round(performance.now() - t0);
  if (json.error) throw Object.assign(new Error(json.error.message ?? "rpc error"), { ms });
  return { result: json.result as T, ms };
}

export interface ProbeResult {
  endpoint: Endpoint; ok: boolean; latencyMs: number; error?: string;
  head?: number; finalized?: number; chain?: string; runtime?: string; chainId?: number; genesis?: string; peers?: number; checks?: Check[];
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
      return { ...out, checks: checkEvm(out) };
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
    return { ...out, checks: checkSubstrate(out) };
  } catch (err) {
    record(e.id, false, 0);
    return { endpoint: e, ok: false, latencyMs: -1, error: (err as Error).message };
  }
}

// Failover: try healthy endpoints of a VM in latency order.
export async function forward(vm: Vm, body: unknown) {
  const eps = rank(endpoints().filter((e) => e.vm === vm));
  let lastErr = "no endpoints";
  const tried: string[] = [];
  for (const e of eps) {
    tried.push(e.label);
    const t0 = performance.now();
    try {
      const r = await fetch(e.url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
      if (r.ok) { record(e.id, true, Math.round(performance.now() - t0)); return { upstream: e.label, tried, json: await r.json() }; }
      lastErr = `HTTP ${r.status}`; record(e.id, false, 0);
    } catch (err) { lastErr = (err as Error).message; record(e.id, false, 0); }
  }
  throw new Error(lastErr);
}
