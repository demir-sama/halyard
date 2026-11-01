export default function P() { return (<>
<h1>Portaldot V3: two runtimes, one chain</h1>
<p>Portaldot V3 (testnet rolled out 23 Oct 2026) is a Substrate-based chain that exposes two execution surfaces over the same blocks:</p>
<table><thead><tr><th></th><th>Substrate / WASM</th><th>EVM</th></tr></thead><tbody>
<tr><td>Endpoint</td><td><code>wss://test-node-v3.portaldot.dev</code> (also HTTPS)</td><td><code>https://test-evm-rpc-v3.portaldot.dev</code></td></tr>
<tr><td>Identity</td><td>genesis hash, ss58 prefix 42</td><td>chain ID 420420777 (<code>0x190f1ca9</code>)</td></tr>
<tr><td>Contracts</td><td>ink! / pallet-revive</td><td>Solidity via JSON-RPC</td></tr>
<tr><td>Typical tooling</td><td>polkadot.js, the Portaldot Python SDK</td><td>ethers, viem, MetaMask</td></tr></tbody></table>
<p>Because both views come from the same chain, their heads should move together. When they don&apos;t, something is wrong: a lagging EVM RPC adapter, a node stuck on a fork, or an endpoint that silently points at another network. Most apps only watch one side. Halyard watches both.</p>
<h2>Signals Halyard derives</h2>
<ul><li><strong>Drift</strong> = Substrate best head − EVM head. Healthy: |drift| ≤ 2.</li>
<li><strong>Finality lag</strong> = best − finalized (GRANDPA). Healthy: ≤ 10 blocks.</li>
<li><strong>Fingerprint</strong>: both genesis hashes, the EVM chain ID and the runtime spec name/version.</li></ul>
<h2>Explorer & network</h2><p>Testnet explorer: <a href="https://scanner-testnet-v3.portaldot.dev">scanner-testnet-v3.portaldot.dev</a>. The native token is POT (tPOT on testnet).</p>
</>); }
