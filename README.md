<p align="center"><img src="public/logo.svg" width="80" /></p>
<h1 align="center">Halyard</h1>
<p align="center"><b>One rope for both runtimes.</b><br/>The dual-VM RPC control plane for Portaldot V3 — Substrate/WASM + EVM.</p>

Portaldot V3 exposes a Substrate runtime and an EVM over the same chain. Halyard probes every endpoint on both, proves they describe the same network, scores them, and serves a failover JSON-RPC gateway per VM with a circuit breaker.

## Features
| | |
|---|---|
| **Dual-VM probing** | best/finalized head, runtime, peers, chain ID, genesis, latency per endpoint |
| **Cross-VM signals** | head drift (Substrate − EVM) and GRANDPA finality lag |
| **Network fingerprint** | pinned Substrate + EVM genesis, chain ID 420420777, runtime `portaldot-v3 ≥ 3002` |
| **Scored failover** | 0–100 score from uptime + p50 latency over 60 samples |
| **Circuit breaker** | 3 failures → open 30 s → half-open trial |
| **Gateways** | `POST /api/rpc/evm`, `POST /api/rpc/substrate` — batch, CORS, signing/admin methods refused |
| **Block inspector** | `GET /api/block?n=` — same height from both runtimes |
| **Console** | live dashboard, latency history, RPC playground |
| **Docs** | `/docs` — quickstart, dual-VM, architecture, API, fingerprint, config |

## Quick start
```bash
cp .env.example .env.local   # optional; defaults = public V3 testnet
npm install && npm run dev
```
```bash
curl -s -X POST http://localhost:3000/api/rpc/evm -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}' -i | grep -i halyard
```

## Network (Portaldot V3 testnet)
Substrate `https://test-node-v3.portaldot.dev` · EVM `https://test-evm-rpc-v3.portaldot.dev` · chain ID `420420777` · explorer https://scanner-testnet-v3.portaldot.dev

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind v4 · framer-motion. No database, no keys.

MIT License.
