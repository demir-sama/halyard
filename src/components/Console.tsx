"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
type R = { endpoint: { id: string; vm: string; label: string }; ok: boolean; latencyMs: number; error?: string; head?: number; finalized?: number; chain?: string; runtime?: string; chainId?: number; genesis?: string; peers?: number };
type P = { at: string; results: R[]; crossVm: { drift: number | null; finalityLag: number | null; chainIdMatch: boolean }; network: { name: string; explorer: string } };
export default function Console() {
  const [d, setD] = useState<P | null>(null);
  const [hist, setHist] = useState<number[]>([]);
  const [method, setMethod] = useState("eth_blockNumber");
  const [out, setOut] = useState("");
  useEffect(() => {
    let live = true;
    const tick = async () => { const p: P = await fetch("/api/probe").then((r) => r.json()); if (!live) return; setD(p); setHist((h) => [...h.slice(-39), p.results.find((r) => r.ok)?.latencyMs ?? 0]); };
    tick(); const t = setInterval(tick, 6000); return () => { live = false; clearInterval(t); };
  }, []);
  const send = async () => {
    const vm = method.startsWith("eth_") || method.startsWith("net_") ? "evm" : "substrate";
    const r = await fetch(`/api/rpc/${vm}`, { method: "POST", body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: [] }) });
    setOut(`via ${r.headers.get("x-halyard-upstream") ?? "?"}\n` + JSON.stringify(await r.json(), null, 2));
  };
  const max = Math.max(1, ...hist);
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {[["Cross-VM drift", d?.crossVm.drift ?? "—", "Substrate head − EVM head"], ["Finality lag", d?.crossVm.finalityLag ?? "—", "blocks behind best"], ["Chain ID pinned", d ? (d.crossVm.chainIdMatch ? "MATCH" : "MISMATCH") : "—", "expects 420420777"]].map(([k, v, s]) => (
          <motion.div key={String(k)} layout className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
            <div className="text-xs uppercase tracking-widest text-white/50">{k}</div>
            <motion.div key={String(v)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-3xl font-semibold text-amber-300">{String(v)}</motion.div>
            <div className="text-xs text-white/40">{s}</div>
          </motion.div>))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>{d?.results.map((r) => (
          <motion.div key={r.endpoint.id} initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-white/10 bg-white/[.03] p-5 font-mono text-sm">
            <div className="mb-3 flex items-center justify-between"><span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs uppercase text-amber-300">{r.endpoint.vm}</span>
              <span className="flex items-center gap-2"><motion.span animate={{ opacity: [1, .3, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} className={`h-2 w-2 rounded-full ${r.ok ? "bg-emerald-400" : "bg-red-500"}`} />{r.ok ? `${r.latencyMs} ms` : "down"}</span></div>
            <div className="text-white/80">{r.endpoint.label}</div>
            {r.ok ? <dl className="mt-3 grid grid-cols-2 gap-1 text-xs text-white/60">
              <dt>head</dt><dd>#{r.head}</dd>
              {r.finalized != null && <><dt>finalized</dt><dd>#{r.finalized}</dd></>}
              {r.runtime && <><dt>runtime</dt><dd>{r.runtime}</dd></>}
              {r.chainId && <><dt>chainId</dt><dd>{r.chainId}</dd></>}
              {r.peers != null && r.peers >= 0 && <><dt>peers</dt><dd>{r.peers}</dd></>}
              <dt>genesis</dt><dd className="truncate">{r.genesis}</dd></dl> : <p className="mt-2 text-red-400">{r.error}</p>}
          </motion.div>))}</AnimatePresence>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
        <div className="mb-3 text-xs uppercase tracking-widest text-white/50">Latency trace (live)</div>
        <div className="flex h-24 items-end gap-1">{hist.map((h, i) => <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(h / max) * 100}%` }} className="flex-1 rounded-t bg-gradient-to-t from-orange-600 to-amber-300" />)}</div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
        <div className="mb-3 text-xs uppercase tracking-widest text-white/50">Gateway playground — routed with failover</div>
        <div className="flex gap-2"><select value={method} onChange={(e) => setMethod(e.target.value)} className="flex-1 rounded-lg bg-black/40 p-2 font-mono text-sm">
          {["eth_blockNumber", "eth_chainId", "eth_gasPrice", "net_version", "system_chain", "system_health", "chain_getHeader", "state_getRuntimeVersion", "rpc_methods"].map((m) => <option key={m}>{m}</option>)}</select>
          <button onClick={send} className="rounded-lg bg-amber-400 px-4 font-semibold text-black hover:bg-amber-300">Send</button></div>
        {out && <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-black/50 p-3 text-xs text-emerald-200">{out}</pre>}
      </div>
    </div>);
}
