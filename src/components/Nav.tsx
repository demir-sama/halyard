"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Logo from "./Logo";
const links = [["/console", "Console"], ["/docs", "Docs"], ["/about", "About"]] as const;
export default function Nav() {
  const p = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-white/[.06] bg-[#07090D]/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-[.18em] text-sm"><Logo size={30} /> HALYARD</Link>
        <div className="flex items-center gap-1 text-sm">
          {links.map(([h, l]) => { const on = p.startsWith(h); return (
            <Link key={h} href={h} className={`relative rounded-full px-3.5 py-1.5 transition ${on ? "text-black" : "text-white/65 hover:text-white"}`}>
              {on && <motion.span layoutId="nav" className="absolute inset-0 rounded-full bg-amber-300" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative">{l}</span></Link>); })}
          <a href="https://github.com/demir-sama/halyard" className="ml-2 hidden rounded-full border border-white/10 px-3.5 py-1.5 text-white/65 hover:text-white sm:block">GitHub</a>
        </div>
      </nav>
    </header>
  );
}
