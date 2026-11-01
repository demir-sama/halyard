export default function P() { return (<>
<h1>Quickstart</h1>
<h2>1 · Use the hosted gateway</h2>
<p>Replace your Portaldot RPC URL with Halyard&apos;s. With <code>viem</code>:</p>
<pre><code>{`import { createPublicClient, http, defineChain } from "viem";

const portaldotV3 = defineChain({
  id: 420420777,
  name: "Portaldot V3 Testnet",
  nativeCurrency: { name: "tPOT", symbol: "tPOT", decimals: 18 },
  rpcUrls: { default: { http: ["https://<your-halyard>/api/rpc/evm"] } },
});

const client = createPublicClient({ chain: portaldotV3, transport: http() });
console.log(await client.getBlockNumber());`}</code></pre>
<p>Note: the EVM denomination is exposed by the runtime via <code>revive.nativeToEthRatio</code>; check it before displaying balances.</p>
<p>With <code>curl</code> (Substrate):</p>
<pre><code>{`curl -s -X POST https://<your-halyard>/api/rpc/substrate \\
  -H 'content-type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"chain_getHeader","params":[]}' -i`}</code></pre>
<p>The <code>x-halyard-upstream</code> response header names the node that served you; <code>x-halyard-tried</code> lists failover attempts.</p>
<h2>2 · Add to MetaMask</h2>
<table><tbody><tr><th>Network name</th><td>Portaldot V3 Testnet (Halyard)</td></tr><tr><th>RPC URL</th><td>https://&lt;your-halyard&gt;/api/rpc/evm</td></tr><tr><th>Chain ID</th><td>420420777</td></tr><tr><th>Symbol</th><td>tPOT</td></tr><tr><th>Explorer</th><td>https://scanner-testnet-v3.portaldot.dev</td></tr></tbody></table>
<h2>3 · Run your own</h2>
<pre><code>{`git clone https://github.com/demir-sama/halyard && cd halyard
cp .env.example .env.local
npm install && npm run dev   # http://localhost:3000`}</code></pre>
</>); }
