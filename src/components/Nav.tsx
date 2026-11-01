import Link from "next/link";
export default function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B0D12]/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-wide">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-8 w-8" /> HALYARD
        </Link>
        <div className="flex gap-6 text-sm text-white/70">
          <Link href="/" className="hover:text-amber-300">Console</Link>
          <Link href="/docs" className="hover:text-amber-300">Docs</Link>
          <Link href="/about" className="hover:text-amber-300">About</Link>
        </div>
      </nav>
    </header>
  );
}
