import Link from "next/link";
export default function Footer() {
  return (<footer className="mt-24 border-t border-white/[.06]"><div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-xs text-white/40 sm:flex-row sm:justify-between">
    <span>Halyard — dual-VM RPC control plane for Portaldot V3. MIT.</span>
    <span className="flex gap-4"><Link href="/docs">Docs</Link><Link href="/about">About</Link><a href="https://scanner-testnet-v3.portaldot.dev">Explorer</a><a href="https://github.com/demir-sama/halyard">GitHub</a></span></div></footer>);
}
