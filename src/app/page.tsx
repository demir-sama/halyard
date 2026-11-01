import Hero from "@/components/Hero";
import Link from "next/link";
const F = [
  ["Dual-VM probing", "Head, finality, runtime, peers, chain ID and genesis from Substrate and EVM nodes every few seconds."],
  ["Network fingerprint", "Pins genesis hashes, EVM chain ID and runtime spec. A node that drifts to another network is flagged instantly."],
  ["Scored failover", "Every endpoint gets a 0–100 score from uptime and p50 latency. Requests go to the best one first."],
  ["Circuit breaker", "Three consecutive failures open the breaker for 30 s; traffic skips the node until a half-open retry succeeds."],
  ["Cross-VM inspector", "Look up one block height from both runtimes side by side — hashes, extrinsics, EVM txs, gas."],
  ["Drop-in RPC", "Point ethers, viem, MetaMask or polkadot.js HTTP at /api/rpc/evm or /api/rpc/substrate. CORS on, signing methods off."],
];
export default function Home() {
  return (<main>
    <Hero />
    <section className="mx-auto max-w-6xl px-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {F.map(([t, d], i) => (<div key={t} className="card group p-6 transition hover:border-amber-300/30">
          <div className="font-mono text-xs text-amber-300/70">0{i + 1}</div>
          <h3 className="mt-3 text-lg font-semibold">{t}</h3><p className="mt-2 text-sm leading-relaxed text-white/55">{d}</p></div>))}
      </div>
      <div className="card mt-16 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
        <div><h2 className="text-2xl font-semibold">Replace one fragile URL with a control plane.</h2><p className="mt-2 text-white/55">Open source, zero keys, public Portaldot V3 testnet by default.</p></div>
        <Link href="/docs" className="rounded-full bg-white px-6 py-3 font-semibold text-black">Read the docs</Link>
      </div>
    </section>
  </main>);
}
