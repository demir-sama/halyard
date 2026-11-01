export default function P() { return (<>
<h1>API reference</h1>
<h2>GET /api/probe</h2><p>Probes every endpoint and returns health, fingerprint checks and cross-VM signals.</p>
<pre><code>{`{
  "network": { "name": "Portaldot V3 Testnet", "evmChainId": 420420777, ... },
  "results": [{
    "endpoint": { "id": "sub-0", "vm": "substrate", "label": "test-node-v3.portaldot.dev" },
    "ok": true, "latencyMs": 412, "head": 283120, "finalized": 283117,
    "runtime": "portaldot-v3@3002", "genesis": "0xd4f9…83bd", "peers": 1,
    "checks": [{ "label": "Substrate genesis", "pass": true, ... }],
    "health": { "score": 91, "uptime": 1, "p50": 410, "p95": 760, "breaker": "closed", "history": [...] }
  }, ...],
  "crossVm": { "drift": 0, "finalityLag": 3, "chainIdMatch": true, "fingerprintOk": true }
}`}</code></pre>
<h2>POST /api/rpc/evm · POST /api/rpc/substrate</h2>
<p>Standard JSON-RPC 2.0, single or batch (max 50). CORS enabled.</p>
<table><thead><tr><th>Header</th><th>Meaning</th></tr></thead><tbody><tr><td><code>x-halyard-upstream</code></td><td>endpoint that answered</td></tr><tr><td><code>x-halyard-tried</code></td><td>endpoints attempted, in order</td></tr></tbody></table>
<p>Refused namespaces (HTTP 400, code -32600): <code>personal_*</code>, <code>admin_*</code>, <code>debug_*</code>, <code>miner_*</code>, <code>engine_*</code>, <code>offchain_*</code>, <code>eth_sign</code>, <code>eth_signTransaction</code>, <code>eth_sendTransaction</code>, key-management <code>author_*</code> and node-admin <code>system_*</code> calls. Signed raw transactions (<code>eth_sendRawTransaction</code>, <code>author_submitExtrinsic</code>) are allowed.</p>
<p>If every upstream fails: HTTP 502, code -32603.</p>
<h2>GET /api/block?n=&lt;height&gt;</h2><p>Returns the same height from both runtimes. Omit <code>n</code> for the latest.</p>
<pre><code>{`{ "n": 283120,
  "substrate": { "hash": "0x…", "parentHash": "0x…", "stateRoot": "0x…", "extrinsics": 2 },
  "evm": { "hash": "0x…", "parentHash": "0x…", "timestamp": "2026-11-01T22:06:00.000Z", "txs": 0, "gasUsed": 0 } }`}</code></pre>
</>); }
