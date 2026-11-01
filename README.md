# Halyard — dual-VM RPC control plane for Portaldot V3

Halyard probes every Portaldot V3 endpoint (Substrate/WASM + EVM), checks that both runtimes agree on the chain (head drift, finality lag, chain-ID + genesis pinning) and exposes a failover JSON-RPC gateway per VM.

## Features
- `/api/probe` — live head, finalized head, runtime version, peers, chain ID, genesis per endpoint + cross-VM report
- `/api/rpc/evm`, `/api/rpc/substrate` — failover JSON-RPC proxy, `x-halyard-upstream` header, signing/admin methods refused
- Console UI with live latency trace and RPC playground; About + Docs pages

## Run
```bash
cp .env.example .env.local
npm i && npm run dev
```
Network: Substrate `https://test-node-v3.portaldot.dev`, EVM `https://test-evm-rpc-v3.portaldot.dev`, chain ID 420420777, explorer https://scanner-testnet-v3.portaldot.dev
