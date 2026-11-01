export default function P() { return (<>
<h1>Halyard documentation</h1>
<p>Halyard is an open-source RPC control plane for <strong>Portaldot V3</strong>. It sits between your application and Portaldot nodes, continuously probes both execution surfaces — the Substrate/WASM runtime and the EVM — and serves a failover JSON-RPC gateway for each.</p>
<h2>What you get</h2>
<ul><li><strong>Health probing</strong> of every configured Substrate and EVM endpoint: best and finalized head, runtime version, peers, chain ID, genesis, latency.</li>
<li><strong>Cross-VM consistency</strong>: head drift between runtimes and finality lag.</li>
<li><strong>Network fingerprint</strong>: genesis hashes, EVM chain ID and runtime spec are pinned; mismatches are flagged.</li>
<li><strong>Scored failover with a circuit breaker</strong> for <code>/api/rpc/evm</code> and <code>/api/rpc/substrate</code>.</li>
<li><strong>Cross-VM block inspector</strong> at <code>/api/block</code>.</li></ul>
<h2>Who it is for</h2>
<ul><li>dApp teams who need a stable RPC URL for Portaldot V3 wallets and frontends.</li><li>Node operators who want to see whether their node agrees with the network.</li><li>Infra builders composing multi-endpoint or multi-region setups.</li></ul>
</>); }
