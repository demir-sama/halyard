export default function P() { return (<>
<h1>Fingerprint & failover</h1>
<h2>Network fingerprint</h2>
<p>Every probe compares the endpoint against pinned identity values:</p>
<table><thead><tr><th>Check</th><th>Default pin</th></tr></thead><tbody>
<tr><td>Substrate genesis</td><td><code>0xd4f9acbc…155283bd</code></td></tr><tr><td>Runtime spec name</td><td><code>portaldot-v3</code></td></tr><tr><td>Runtime spec version</td><td>≥ 3002</td></tr>
<tr><td>EVM chain ID</td><td>420420777</td></tr><tr><td>EVM genesis hash</td><td><code>0x7c05b2dc…7cf07001</code></td></tr></tbody></table>
<p>Any failure flips <code>crossVm.fingerprintOk</code> to false and is highlighted in the console. Pins are overridable by env so the same build can target mainnet or a local dev chain.</p>
<h2>Quarantine & sentinels</h2>
<p>An endpoint that fails any fingerprint check is <strong>quarantined</strong>: it stays visible in the console but is removed from routing until it passes again. Halyard also probes <em>sentinel</em> endpoints (default <code>wss://mainnet.portaldot.io</code>, set with <code>HALYARD_SENTINEL_RPCS</code>). Sentinels are never routed; they demonstrate, live, that a node on another Portaldot network is detected and rejected.</p>
<h2>Transports</h2><p>Endpoints may be <code>https://</code> or <code>wss://</code>. The default Substrate pool uses both transports of the V3 test node, so a broken HTTP ingress fails over to the WebSocket ingress.</p>
<h2>Scoring</h2>
<pre><code>{`score = 100 × (0.6 × uptime + 0.3 × max(0, 1 − p50/2000ms) + 0.1 × lastOk)`}</code></pre>
<p>Uptime and p50 come from the last 60 samples (probes and real proxied traffic).</p>
<h2>Circuit breaker</h2>
<ul><li><strong>closed</strong> — normal.</li><li><strong>open</strong> — 3 consecutive failures; endpoint skipped for 30 s.</li><li><strong>half-open</strong> — cooldown elapsed; the next request is a trial. Success closes it, failure re-opens it.</li></ul>
<p>If every endpoint is open, Halyard still tries them all rather than failing closed.</p>
</>); }
