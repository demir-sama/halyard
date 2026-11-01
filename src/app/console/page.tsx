import Console from "@/components/Console";
export const metadata = { title: "Console" };
export default function Page() {
  return (<main className="mx-auto max-w-6xl px-5 py-12"><p className="font-mono text-xs uppercase tracking-[.3em] text-amber-300">Live control plane</p>
    <h1 className="mt-2 text-4xl font-semibold">Console</h1><p className="mt-2 text-white/55">Probes refresh every 6 seconds against the Portaldot V3 testnet.</p>
    <div className="mt-8"><Console /></div></main>);
}
