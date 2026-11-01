# DoraHacks — Portaldot Hacker House 2026 (DRAFT)
**Project:** Halyard  **Track:** Middleware / Multi-chain infra / Node tooling
**Tagline:** One rope for both runtimes.
**Pitch:** Portaldot V3 runs a Substrate/WASM runtime and an EVM side by side. Halyard is the control plane between apps and nodes: it continuously probes both VMs, proves they describe the same chain (drift, finality lag, chain-ID/genesis pinning) and serves a failover JSON-RPC gateway so dApps keep working when a node drops.
**Portaldot integration:** live Substrate RPC (system_chain, chain_getHeader, chain_getFinalizedHead, state_getRuntimeVersion, system_health) and EVM RPC (eth_chainId, eth_blockNumber, eth_getBlockByNumber) against V3 testnet.
**Links:** GitHub: https://github.com/demir-sama/halyard · Demo: TBD · Video: TBD
