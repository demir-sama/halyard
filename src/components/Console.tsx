"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Drill from "./Drill";
type Check = { key: string; label: string; expected: string; actual: string; pass: boolean };
type R = { quarantined?: string | null; endpoint: { id: string; vm: string; label: string; role: string }; ok: boolean; latencyMs: number; error?: string; head?: number; finalized?: number; chain?: string; runtime?: string; chainId?: number; genesis?: string; peers?: number; checks?: Check[];
  health: { score: number; uptime: number | null; p50: number | null; p95: number | null; n: number; breaker: string; history: { ok: boolean; ms: number }[] } };
type P = { at: string; results: R[]; crossVm: { drift: number | null; finalityLag: number | null; chainIdMatch: boolean; fingerprintOk: boolean; up: number; total: number } };
type B = { n: number; substrate: { hash: string; parentHash: string; extrinsics: number }; evm: { hash: string; timestamp: string; txs: number; gasUsed: number } | null; error?: string };
const short = (h?: string) => (h ? `${h.slice(0, 10)}…${h.slice(-6)}` : "—");
const METHODS: Record<string, [string, unknown[]][]> = {
  evm: [["eth_blockNumber", []], ["eth_chainId", []], ["eth_gasPrice", []], ["net_version", []], ["eth_getBalance", ["0x0000000000000000000000000000000000000000", "latest"]], ["eth_getBlockByNumber", ["latest", false]]],
  substrate: [["system_chain", []], ["system_health", []], ["chain_getHeader", []], ["chain_getFinalizedHead", []], ["state_getRuntimeVersion", []], ["system_properties", []], ["rpc_methods", []]],
};
function Tab({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className={`relative rounded-full px-4 py-1.5 text-sm ${on ? "text-black" : "text-white/60"}`}>{on && <motion.span layoutId="vmtab" className="absolute inset-0 rounded-full bg-amber-300" />}<span className="relative">{children}</span></button>;
}
export default function Console() {
  const [d, setD] = useState<P | null>(null);
  const [vm, setVm] = useState<"evm" | "substrate">("evm");
  const [m, setM] = useState(0);
  const [params, setParams] = useState("[]");
  const [out, setOut] = useState<{ via: string; tried: string; ms: number; body: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [bn, setBn] = useState("");
  const [blk, setBlk] = useState<B | null>(null);
  useEffect(() => { let live = true; const tick = () => fetch("/api/probe").then((r) => r.json()).then((p) => live && setD(p)).catch(() => {}); tick(); const t = setInterval(tick, 6000); return () => { live = false; clearInterval(t); }; }, []);
  useEffect(() => { setParams(JSON.stringify(METHODS[vm][m][1])); }, [vm, m]);
  const send = async () => {
    setBusy(true); const t0 = performance.now();
    let p: unknown[] = []; try { p = JSON.parse(params); } catch { setOut({ via: "-", tried: "-", ms: 0, body: "params must be a JSON array" }); setBusy(false); return; }
    const r = await fetch(`/api/rpc/${vm}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: METHODS[vm][m][0], params: p }) });
    setOut({ via: r.headers.get("x-halyard-upstream") ?? "—", tried: r.headers.get("x-halyard-tried") ?? "—", ms: Math.round(performance.now() - t0), body: JSON.stringify(await r.json(), null, 2) }); setBusy(false);
  };
  const inspect = async () => { setBlk(null); setBlk(await fetch(`/api/block${bn ? `?n=${bn}` : ""}`).then((r) => r.json())); };
  const stats: [string, string, string, boolean | null][] = [
    ["Cross-VM drift", d?.crossVm.drift != null ? `${d.crossVm.drift}` : "—", "Substrate head − EVM head", d ? Math.abs(d.crossVm.drift ?? 99) <= 2 : null],
    ["Finality lag", d?.crossVm.finalityLag != null ? `${d.crossVm.finalityLag}` : "—", "blocks behind best", d ? (d.crossVm.finalityLag ?? 99) <= 10 : null],
    ["Fingerprint", d ? (d.crossVm.fingerprintOk ? "PINNED" : "DRIFT") : "—", "genesis · chain ID · runtime", d ? d.crossVm.fingerprintOk : null],
    ["Pool up", d ? `${d.crossVm.up}/${d.crossVm.total}` : "—", "routable endpoints, both VMs", d ? d.crossVm.up === d.crossVm.total : null],
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map(([k, v, s, good]) => (
          <div key={k} className="card p-5"><div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-white/45">{k}{good != null && <span className={`h-2 w-2 rounded-full ${good ? "bg-emerald-400" : "bg-red-500"}`} />}</div>
            <motion.div key={v} initial={{ opacity: 0.2, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-3xl font-semibold text-amber-300">{v}</motion.div>
            <div className="text-xs text-white/35">{s}</div></div>))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {!d && [0, 1].map((i) => <div key={i} className="card h-72 animate-pulse" />)}
        {d?.results.map((r) => (
          <motion.div key={r.endpoint.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 font-mono text-sm">
            <div className="flex items-center justify-between">
              <span className="flex gap-1.5"><span className={`rounded-md px-2 py-0.5 text-[11px] uppercase ${r.endpoint.vm === "evm" ? "bg-orange-500/15 text-orange-300" : "bg-amber-400/15 text-amber-200"}`}>{r.endpoint.vm}</span>{r.endpoint.role === "sentinel" && <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[11px] uppercase text-sky-300">sentinel</span>}</span>
              <span className="flex items-center gap-3 text-xs"><span className={`rounded px-1.5 py-0.5 ${r.health.breaker === "closed" ? "text-emerald-300" : "bg-red-500/20 text-red-300"}`}>breaker {r.health.breaker}</span>
                <span className="flex items-center gap-1.5"><motion.span animate={{ opacity: [1, .3, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} className={`h-2 w-2 rounded-full ${r.ok ? "bg-emerald-400" : "bg-red-500"}`} />{r.ok ? `${r.latencyMs} ms` : "down"}</span></span>
            </div>
            {r.quarantined && <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">QUARANTINED — {r.chain ?? "foreign network"}: {r.quarantined}. Never routed.</div>}
            <div className="mt-3 flex items-end justify-between"><div className="truncate text-white/85">{r.endpoint.label}</div>
              <div className="text-right"><div className="text-3xl font-semibold text-white">{r.health.score}</div><div className="text-[10px] uppercase text-white/40">score</div></div></div>
            <div className="mt-3 flex h-10 items-end gap-[3px]">{r.health.history.map((h, i) => <motion.div key={i} initial={{ height: 0 }} animate={{ height: h.ok ? `${Math.max(8, Math.min(100, h.ms / 15))}%` : "100%" }} className={`flex-1 rounded-sm ${h.ok ? "bg-gradient-to-t from-orange-600 to-amber-300" : "bg-red-500"}`} />)}</div>
            <div className="mt-1 text-[10px] text-white/35">uptime {r.health.uptime != null ? (r.health.uptime * 100).toFixed(0) + "%" : "—"} · p50 {r.health.p50 ?? "—"} ms · p95 {r.health.p95 ?? "—"} ms · n={r.health.n}</div>
            {r.ok ? <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs text-white/55">
              <dt>head</dt><dd className="text-white/85">#{r.head}</dd>
              {r.finalized != null && <><dt>finalized</dt><dd>#{r.finalized}</dd></>}
              {r.runtime && <><dt>runtime</dt><dd>{r.runtime}</dd></>}
              {r.chainId != null && <><dt>chainId</dt><dd>{r.chainId}</dd></>}
              {r.peers != null && r.peers >= 0 && <><dt>peers</dt><dd>{r.peers}</dd></>}
            </dl> : <p className="mt-3 text-xs text-red-400">{r.error}</p>}
            {r.checks && <div className="mt-4 space-y-1 border-t border-white/5 pt-3">{r.checks.map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-2 text-[11px]" title={`expected ${c.expected}`}><span className="text-white/50">{c.label}</span><span className={c.pass ? "text-emerald-300" : "text-red-400"}>{c.pass ? "✓" : "✗"} {c.actual.startsWith("0x") ? short(c.actual) : c.actual}</span></div>))}</div>}
          </motion.div>))}
      </div>
      <Drill />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="text-[11px] uppercase tracking-widest text-white/45">RPC playground · scored failover</div>
            <div className="flex rounded-full border border-white/10 p-0.5"><Tab on={vm === "evm"} onClick={() => { setVm("evm"); setM(0); }}>EVM</Tab><Tab on={vm === "substrate"} onClick={() => { setVm("substrate"); setM(0); }}>Substrate</Tab></div></div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <select value={m} onChange={(e) => setM(+e.target.value)} className="rounded-lg border border-white/10 bg-black/40 p-2.5 font-mono text-sm">{METHODS[vm].map(([n], i) => <option key={n} value={i}>{n}</option>)}</select>
            <input value={params} onChange={(e) => setParams(e.target.value)} className="flex-1 rounded-lg border border-white/10 bg-black/40 p-2.5 font-mono text-xs" aria-label="params" />
            <button onClick={send} disabled={busy} className="rounded-lg bg-amber-300 px-5 py-2.5 font-semibold text-black transition hover:bg-amber-200 disabled:opacity-50">{busy ? "…" : "Send"}</button></div>
          {out && <div className="mt-3"><div className="font-mono text-[11px] text-white/45">upstream <span className="text-amber-300">{out.via}</span> · tried {out.tried} · {out.ms} ms round-trip</div>
            <pre className="mt-2 max-h-80 overflow-auto rounded-lg border border-white/5 bg-black/50 p-3 font-mono text-xs text-emerald-200">{out.body}</pre></div>}
        </div>
        <div className="card p-5">
          <div className="text-[11px] uppercase tracking-widest text-white/45">Cross-VM block inspector</div>
          <div className="mt-4 flex gap-2"><input value={bn} onChange={(e) => setBn(e.target.value.replace(/\D/g, ""))} placeholder="height (blank = latest)" className="flex-1 rounded-lg border border-white/10 bg-black/40 p-2.5 font-mono text-sm" />
            <button onClick={inspect} className="rounded-lg border border-amber-300/40 px-4 text-amber-200 hover:bg-amber-300/10">Inspect</button></div>
          {blk && (blk.error ? <p className="mt-3 text-sm text-red-400">{blk.error}</p> :
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="rounded-lg bg-amber-400/5 p-3"><div className="text-amber-200">SUBSTRATE #{blk.n}</div><div className="mt-2 text-white/55">hash {short(blk.substrate.hash)}</div><div className="text-white/55">parent {short(blk.substrate.parentHash)}</div><div className="text-white/80">{blk.substrate.extrinsics} extrinsics</div></div>
              <div className="rounded-lg bg-orange-500/5 p-3"><div className="text-orange-300">EVM #{blk.n}</div>{blk.evm ? <><div className="mt-2 text-white/55">hash {short(blk.evm.hash)}</div><div className="text-white/55">{blk.evm.timestamp.replace("T", " ").slice(0, 19)}Z</div><div className="text-white/80">{blk.evm.txs} txs · gas {blk.evm.gasUsed}</div></> : <div className="mt-2 text-white/50">not exposed</div>}</div>
            </motion.div>)}
        </div>
      </div>
    </div>);
}
