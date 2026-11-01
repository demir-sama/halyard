export default function About() {
  return (<main className="prose prose-invert mx-auto max-w-3xl px-6 py-14">
    <h1 className="text-4xl font-semibold">About Halyard</h1>
    <p className="mt-4 text-white/70">A halyard is the line that raises a sail. Portaldot V3 runs two execution surfaces — a Substrate/WASM runtime and an EVM — and every serious app ends up talking to both. Halyard is the single line that keeps them hoisted: health probing, cross-VM consistency checks, chain-identity pinning and a failover JSON-RPC gateway.</p>
    <h2 className="mt-8 text-2xl font-semibold">Why it matters</h2>
    <ul className="mt-3 list-disc pl-6 text-white/70"><li>Node operators see head, finality lag, runtime version and peers per endpoint.</li><li>dApp teams get one URL per VM that survives a node outage.</li><li>Chain ID + genesis pinning stops apps from silently writing to the wrong network.</li></ul>
    <h2 className="mt-8 text-2xl font-semibold">Built for</h2><p className="mt-3 text-white/70">DoraHacks Portaldot Hacker House 2026 — middleware & node tooling track.</p></main>);
}
