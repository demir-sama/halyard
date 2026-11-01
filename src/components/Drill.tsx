"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
type Hop = { id: string; endpoint: string; ok: boolean; ms: number; breaker: string; error?: string };
type Step = { step: number; phase: string; ok: boolean; upstream?: string; hops: Hop[]; ms: number; error?: string; result?: unknown };
type D = { vm: string; target: string; pool: { id: string; label: string }[]; method: string; timeline: Step[]; final: { id: string; breaker: string; score: number }[] };
export default function Drill() {
  const [vm, setVm] = useState<"substrate" | "evm">("substrate");
  const [d, setD] = useState<D | null>(null);
  const [shown, setShown] = useState(0);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true); setD(null); setShown(0);
    const r: D = await fetch(`/api/drill?vm=${vm}`).then((x) => x.json());
    setD(r); setBusy(false);
    for (let i = 1; i <= r.timeline.length; i++) { await new Promise((z) => setTimeout(z, 550)); setShown(i); }
  };
  const cur = d?.timeline[shown - 1];
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className="text-[11px] uppercase tracking-widest text-white/45">Outage drill · circuit breaker + failover</div>
          <p className="mt-1 max-w-xl text-xs text-white/45">Replays real {vm === "evm" ? "eth_blockNumber" : "chain_getHeader"} calls against Portaldot V3 while forcing the primary endpoint to fail. Runs on an isolated ledger — live routing is untouched.</p></div>
        <div className="flex items-center gap-2">
          <select value={vm} onChange={(e) => setVm(e.target.value as "evm" | "substrate")} className="rounded-lg border border-white/10 bg-black/40 p-2 text-sm"><option value="substrate">Substrate pool</option><option value="evm">EVM pool</option></select>
          <button onClick={run} disabled={busy || (d != null && shown < d.timeline.length)} className="rounded-lg bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50">{busy ? "Running…" : "Kill primary"}</button>
        </div>
      </div>
      {d && <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-2">{d.pool.map((p) => { const h = cur?.hops.find((x) => x.id === p.id); const brk = (() => { for (let i = shown - 1; i >= 0; i--) { const x = d.timeline[i].hops.find((y) => y.id === p.id); if (x) return x.breaker; } return "closed"; })();
          const served = cur?.ok && cur.upstream === p.label;
          return (<motion.div key={p.id} animate={{ borderColor: served ? "rgba(52,211,153,.6)" : brk === "open" ? "rgba(239,68,68,.6)" : "rgba(255,255,255,.08)" }} className="rounded-xl border bg-black/30 p-3 font-mono text-xs">
            <div className="flex items-center justify-between"><span className="text-white/80">{p.label}{p.id === d.target && <span className="ml-2 rounded bg-red-500/20 px-1.5 text-[10px] text-red-300">TARGET</span>}</span>
              <span className={brk === "open" ? "text-red-400" : brk === "half-open" ? "text-amber-300" : "text-emerald-300"}>breaker {brk}</span></div>
            <div className="mt-1 text-white/40">{h ? (h.ok ? `served in ${h.ms} ms` : `failed: ${h.error}`) : shown ? "skipped" : "idle"}</div>
          </motion.div>); })}
          {d.pool.length < 2 && <p className="text-xs text-amber-300/80">Only one public EVM endpoint exists today, so the breaker opens and Halyard fails fast with a JSON-RPC error instead of hanging. Add secondaries with <code>PORTALDOT_EVM_RPCS</code>.</p>}
        </div>
        <div className="max-h-80 space-y-1.5 overflow-auto pr-1">
          <AnimatePresence>{d.timeline.slice(0, shown).map((t) => (
            <motion.div key={t.step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3 rounded-lg bg-white/[.03] p-2 font-mono text-[11px]">
              <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${t.ok ? "bg-emerald-400" : "bg-red-500"}`} />
              <span className="w-6 text-white/40">#{t.step}</span>
              <span className={`w-16 ${t.phase === "outage" ? "text-red-300" : "text-emerald-300"}`}>{t.phase}</span>
              <span className="flex-1 text-white/70">{t.hops.map((h) => `${h.ok ? "✓" : "✗"} ${h.endpoint}`).join("  →  ") || "—"}{t.hops.some((h) => !h.ok && h.breaker === "open") && <span className="ml-2 text-red-400">⚡ breaker opened</span>}</span>
              <span className="text-white/40">{t.ms}ms</span>
            </motion.div>))}</AnimatePresence>
          {shown === d.timeline.length && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2 text-xs text-white/55">
            {d.timeline.filter((t) => t.ok).length}/{d.timeline.length} requests answered during the drill. Final: {d.final.map((f) => `${f.id} ${f.breaker} (${f.score})`).join(" · ")}</motion.p>}
        </div>
      </div>}
    </div>);
}
