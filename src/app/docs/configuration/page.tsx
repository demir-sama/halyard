export default function P() { return (<>
<h1>Configuration & local dev</h1>
<p>No keys are required. Defaults target the public Portaldot V3 testnet.</p>
<table><thead><tr><th>Variable</th><th>Default</th><th>Purpose</th></tr></thead><tbody>
<tr><td><code>PORTALDOT_SUBSTRATE_RPCS</code></td><td>https://test-node-v3.portaldot.dev</td><td>comma-separated Substrate HTTP endpoints</td></tr>
<tr><td><code>PORTALDOT_EVM_RPCS</code></td><td>https://test-evm-rpc-v3.portaldot.dev</td><td>comma-separated EVM endpoints</td></tr>
<tr><td><code>HALYARD_PIN_SUBSTRATE_GENESIS</code></td><td>testnet genesis</td><td>expected Substrate genesis</td></tr>
<tr><td><code>HALYARD_PIN_EVM_GENESIS</code></td><td>testnet EVM genesis</td><td>expected EVM block 0 hash</td></tr>
<tr><td><code>HALYARD_PIN_CHAIN_ID</code></td><td>420420777</td><td>expected EVM chain ID</td></tr>
<tr><td><code>HALYARD_PIN_SPEC_NAME</code></td><td>portaldot-v3</td><td>expected runtime spec</td></tr>
<tr><td><code>HALYARD_PIN_MIN_SPEC</code></td><td>3002</td><td>minimum runtime version</td></tr></tbody></table>
<h2>Local development</h2>
<pre><code>{`npm install
npm run dev        # dev server
npm run build && npm start   # production`}</code></pre>
<h2>Running against a local Portaldot node</h2>
<p>Download the dev node from the Portaldot developer docs, start it with RPC enabled, then:</p>
<pre><code>{`PORTALDOT_SUBSTRATE_RPCS=http://127.0.0.1:9944 \\
HALYARD_PIN_SUBSTRATE_GENESIS=<your dev genesis> npm run dev`}</code></pre>
<h2>Deploy</h2><p>Import the repository into Vercel. No environment variables are needed for the testnet.</p>
</>); }
