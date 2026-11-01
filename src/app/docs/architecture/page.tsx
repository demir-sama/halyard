export default function P() { return (<>
<h1>Architecture</h1>
<pre><code>{`  ┌─────────── your dApp / wallet / indexer ───────────┐
  │   /api/rpc/evm          /api/rpc/substrate          │
  └───────────┬───────────────────────┬────────────────┘
              ▼                       ▼
     ┌──────────────── Halyard gateway ────────────────┐
     │ policy filter → rank(score, breaker) → forward   │
     │        ▲                                         │
     │   health ledger  ◄── probe loop (/api/probe)     │
     │   fingerprint pins (genesis, chainId, runtime)   │
     └──────┬──────────────┬──────────────┬────────────┘
            ▼              ▼              ▼
     Substrate node   Substrate node   EVM RPC  …  (env lists)`}</code></pre>
<h2>Components</h2>
<ul><li><code>src/lib/portaldot.ts</code> — endpoint registry (from env), JSON-RPC client with timeouts, probes, and the <code>forward()</code> failover loop.</li>
<li><code>src/lib/health.ts</code> — rolling 60-sample ledger per endpoint, 0–100 scoring, circuit breaker, ranking.</li>
<li><code>src/lib/fingerprint.ts</code> — pinned identity and the checks applied on every probe.</li>
<li><code>src/app/api/*</code> — Next.js route handlers: probe, two RPC gateways, block inspector.</li>
<li><code>src/components/Console.tsx</code> — the live UI.</li></ul>
<h2>Request lifecycle</h2>
<ul><li>The body is validated (single or batch ≤ 50) and checked against the deny policy.</li><li>Endpoints for that VM are ranked: open breakers are skipped, then sorted by score.</li><li>Halyard forwards to each in turn with a 10 s timeout; success and failure are written to the ledger.</li><li>The first success is returned with <code>x-halyard-upstream</code> / <code>x-halyard-tried</code> headers.</li></ul>
<h2>State</h2><p>The ledger is in-process memory. On a long-running Node server it accumulates continuously; on serverless it lives for the lifetime of a warm instance, and the probe endpoint re-seeds it. A shared store (Redis/KV) is a drop-in extension point.</p>
</>); }
