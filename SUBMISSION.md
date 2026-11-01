# DoraHacks BUIDL — Portaldot Hacker House 2026

**Name:** Halyard
**Tagline:** One rope for both runtimes — the dual-VM RPC control plane for Portaldot V3.
**Track:** Middleware / multi-chain infrastructure / node tooling
**GitHub:** https://github.com/demir-sama/halyard
**Live demo:** https://halyard-sama-5806.vercel.app
**Demo video:** <YOUTUBE_URL>

## Problem
Portaldot V3 runs a Substrate/WASM runtime and an EVM side by side. Real apps need both, yet hardcode a single RPC URL per side. Outages, a lagging EVM adapter, or an endpoint quietly pointed at a different network are discovered by users, not developers.

## Solution
Halyard treats RPC as a control plane:
1. **Probes** every Substrate and EVM endpoint (head, finality, runtime, peers, chain ID, genesis).
2. **Proves consistency** across runtimes — head drift and finality lag.
3. **Pins identity** — Substrate + EVM genesis, chain ID 420420777, runtime spec `portaldot-v3 ≥ 3002`.
4. **Routes** JSON-RPC through `/api/rpc/evm` and `/api/rpc/substrate` with scored failover and a circuit breaker; signing/admin methods are refused.
5. **Drills** outages live: "Kill primary" forces the primary to fail on real traffic; the breaker opens after 3 failures, traffic fails over (HTTPS → WSS ingress), then recovers half-open.
6. **Quarantines** wrong-network nodes — a mainnet sentinel is probed and rejected by fingerprint, never routed.
7. **Inspects** any block height from both runtimes side by side.

## Portaldot integration (live, verified against V3 testnet)
- Substrate RPC: `system_chain`, `system_health`, `chain_getHeader`, `chain_getFinalizedHead`, `chain_getBlockHash`, `chain_getBlock`, `state_getRuntimeVersion`
- EVM RPC: `eth_chainId`, `eth_blockNumber`, `eth_getBlockByNumber`, plus full pass-through
- Measured: drift 0, finality lag 2–3 blocks, both endpoints scoring 89–96.

## Why it wins
- Infra that only makes sense on a dual-VM chain — single-VM tools can't see cross-runtime drift.
- Zero-config, zero-keys, open source; any wallet/indexer can use it today.
- Complements app-layer tools (indexers, contract workspaces) by giving them a resilient upstream.

## Roadmap
WebSocket subscriptions gateway · shared health store (KV) · alert webhooks · mainnet preset · `@halyard/client` SDK (viem + polkadot.js) · on-chain health attestations.
