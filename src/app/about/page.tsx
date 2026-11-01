import Logo from "@/components/Logo";
export const metadata = { title: "About" };
export default function About() {
  return (<main className="doc mx-auto max-w-3xl px-5 py-16">
    <Logo size={72} animate />
    <h1 className="mt-6">About Halyard</h1>
    <p>A halyard is the line that raises a sail. Lose it and the sail drops, no matter how good the boat is. For apps on Portaldot V3, that line is the RPC connection — and V3 needs two of them.</p>
    <h2>The problem</h2>
    <p>Portaldot V3 runs a Substrate/WASM runtime and an EVM over the same chain. A serious app talks to both: Solidity contracts through the EVM, native accounts, staking or ink! through Substrate. Today each team hardcodes one URL per side and finds out about outages, lagging adapters or the wrong network from their users.</p>
    <h2>What Halyard does</h2>
    <p>It treats RPC as a control plane, not a string. Halyard probes every endpoint on both runtimes, proves they describe the same chain, scores them, and routes traffic to the best one with a circuit breaker. One gateway URL per VM, with the evidence visible in a live console.</p>
    <h2>Why dual-VM matters</h2>
    <ul><li>Cross-runtime drift is a failure mode unique to chains like V3; single-VM tools can&apos;t see it.</li><li>Chain-ID + genesis pinning stops apps from signing against the wrong network after an endpoint change.</li><li>Operators get a neutral, public view of whether their node agrees with the rest.</li></ul>
    <h2>How it differs</h2>
    <table><thead><tr><th></th><th>Halyard</th><th>Contract workspaces (e.g. PalletDock)</th><th>Raw public RPC</th></tr></thead><tbody>
      <tr><td>Layer</td><td>RPC / infra</td><td>App data (deploy, index, read API)</td><td>Single node</td></tr>
      <tr><td>Both runtimes</td><td>Yes, compared live</td><td>EVM-first</td><td>One per URL</td></tr>
      <tr><td>Failover</td><td>Scored + breaker</td><td>—</td><td>—</td></tr>
      <tr><td>Accounts / DB</td><td>None needed</td><td>Required</td><td>—</td></tr></tbody></table>
    <p>They are complementary: an indexer can point at Halyard instead of a single node.</p>
    <h2>Built for</h2><p>DoraHacks Portaldot Hacker House 2026 — middleware, multi-chain infrastructure and node tooling. Open source under MIT.</p>
  </main>);
}
