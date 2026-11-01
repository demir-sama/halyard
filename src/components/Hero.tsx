"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Logo from "./Logo";
type Live = { results: { endpoint: { vm: string }; ok: boolean; head?: number; latencyMs: number }[]; crossVm: { drift: number | null; fingerprintOk: boolean } };
const up = (i: number) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.12 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } });
export default function Hero() {
  const [l, setL] = useState<Live | null>(null);
  useEffect(() => { const f = () => fetch("/api/probe").then((r) => r.json()).then(setL).catch(() => {}); f(); const t = setInterval(f, 8000); return () => clearInterval(t); }, []);
  const sub = l?.results.find((r) => r.endpoint.vm === "substrate");
  const evm = l?.results.find((r) => r.endpoint.vm === "evm");
  return (
    <section className="relative overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-20 md:grid-cols-[1.1fr_.9fr] md:pt-28">
        <div>
          <motion.div {...up(0)} className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/5 px-3 py-1 text-xs text-amber-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live on Portaldot V3 testnet
          </motion.div>
          <motion.h1 {...up(1)} className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
            One rope for <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-600 bg-clip-text text-transparent">both runtimes.</span>
          </motion.h1>
          <motion.p {...up(2)} className="mt-6 max-w-xl text-lg text-white/60">
            Halyard is the RPC control plane for Portaldot V3. It probes Substrate and EVM nodes, proves they describe the same chain, and routes your app through the healthiest endpoint — with a circuit breaker when one goes dark.
          </motion.p>
          <motion.div {...up(3)} className="mt-9 flex flex-wrap gap-3">
            <Link href="/console" className="rounded-full bg-amber-300 px-6 py-3 font-semibold text-black shadow-[0_0_40px_-8px_rgba(252,211,141,.7)] transition hover:bg-amber-200">Open console →</Link>
            <Link href="/docs/quickstart" className="rounded-full border border-white/15 px-6 py-3 text-white/80 transition hover:border-white/40">Use as RPC in 30s</Link>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .3, duration: .9 }} className="relative">
          <svg viewBox="0 0 400 360" className="w-full">
            <defs><linearGradient id="rope" x1="0" x2="1"><stop offset="0" stopColor="#FCD38D" /><stop offset="1" stopColor="#E8590C" /></linearGradient></defs>
            {[[80, 70], [320, 70]].map(([x, y], i) => (
              <motion.path key={i} d={`M200 180 C ${200} ${120}, ${x} ${y + 60}, ${x} ${y}`} stroke="url(#rope)" strokeWidth="2" fill="none" strokeDasharray="6 8"
                animate={{ strokeDashoffset: [0, -56] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} />))}
            <motion.path d="M200 180 L200 310" stroke="url(#rope)" strokeWidth="2" strokeDasharray="6 8" animate={{ strokeDashoffset: [0, 56] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} />
          </svg>
          <div className="absolute left-[2%] top-[6%] card w-40 p-3 font-mono text-xs"><div className="text-amber-300">SUBSTRATE · WASM</div><div className="mt-1 text-white/80">#{sub?.head ?? "…"}</div><div className="text-white/40">{sub ? `${sub.latencyMs} ms` : "probing"}</div></div>
          <div className="absolute right-[2%] top-[6%] card w-40 p-3 font-mono text-xs"><div className="text-orange-400">EVM · 420420777</div><div className="mt-1 text-white/80">#{evm?.head ?? "…"}</div><div className="text-white/40">{evm ? `${evm.latencyMs} ms` : "probing"}</div></div>
          <div className="absolute left-1/2 top-[40%] -translate-x-1/2"><motion.div animate={{ boxShadow: ["0 0 0 0 rgba(252,211,141,.5)", "0 0 0 22px rgba(252,211,141,0)"] }} transition={{ repeat: Infinity, duration: 2 }} className="rounded-2xl"><Logo size={64} animate /></motion.div></div>
          <div className="absolute bottom-[2%] left-1/2 card w-56 -translate-x-1/2 p-3 text-center font-mono text-xs"><div className="text-white/50">YOUR dAPP</div><div className="mt-1 text-white/80">drift {l?.crossVm.drift ?? "…"} · fingerprint {l ? (l.crossVm.fingerprintOk ? "✓" : "✗") : "…"}</div></div>
        </motion.div>
      </div>
    </section>
  );
}
