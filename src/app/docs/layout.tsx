"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { DOCS } from "./nav";
export default function L({ children }: { children: React.ReactNode }) {
  const p = usePathname(); const i = DOCS.findIndex(([h]) => h === p); const next = DOCS[i + 1];
  return (<div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[210px_1fr]">
    <aside className="md:sticky md:top-20 md:self-start"><div className="mb-3 font-mono text-[11px] uppercase tracking-[.25em] text-amber-300">Documentation</div>
      <nav className="flex gap-1 overflow-x-auto md:flex-col">{DOCS.map(([h, l]) => (<Link key={h} href={h} className={`relative whitespace-nowrap rounded-lg px-3 py-2 text-sm ${p === h ? "text-white" : "text-white/50 hover:text-white/80"}`}>
        {p === h && <motion.span layoutId="docnav" className="absolute inset-0 rounded-lg bg-white/[.06]" />}<span className="relative">{l}</span></Link>))}</nav></aside>
    <motion.article key={p} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="doc min-w-0 max-w-3xl">{children}
      {next && <Link href={next[0]} className="card mt-12 block p-5 hover:border-amber-300/30"><div className="text-xs text-white/40">Next</div><div className="mt-1 font-semibold text-amber-200">{next[1]} →</div></Link>}</motion.article></div>);
}
