import Console from "@/components/Console";
export default function Home() {
  return (<main className="mx-auto max-w-6xl px-6 py-14">
    <p className="text-xs uppercase tracking-[.3em] text-amber-300">Portaldot V3 · Substrate + EVM</p>
    <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-tight">One rope for both runtimes.</h1>
    <p className="mt-4 max-w-2xl text-white/60">Halyard is a dual-VM RPC control plane: it probes every Portaldot V3 endpoint, checks that Substrate and EVM agree on the chain, and routes your dApp’s JSON-RPC through healthy nodes with automatic failover.</p>
    <div className="mt-10"><Console /></div></main>);
}
