const C = ({ c }: { c: string }) => <pre className="mt-2 overflow-auto rounded-lg bg-black/50 p-3 text-xs text-emerald-200">{c}</pre>;
export default function Docs() {
  return (<main className="mx-auto max-w-3xl px-6 py-14 text-white/75">
    <h1 className="text-4xl font-semibold text-white">Docs</h1>
    <h2 className="mt-8 text-xl font-semibold text-white">Network</h2>
    <C c={`Substrate RPC  https://test-node-v3.portaldot.dev  (wss://test-node-v3.portaldot.dev)\nEVM RPC        https://test-evm-rpc-v3.portaldot.dev\nEVM chain ID   420420777 (0x190f1ca9)\nExplorer       https://scanner-testnet-v3.portaldot.dev`} />
    <h2 className="mt-8 text-xl font-semibold text-white">Gateway endpoints</h2>
    <p>Point any client at Halyard instead of a single node:</p>
    <C c={`POST /api/rpc/evm        # ethers / viem / MetaMask-compatible JSON-RPC\nPOST /api/rpc/substrate  # Substrate JSON-RPC (HTTP)\nGET  /api/probe          # health + cross-VM report`} />
    <C c={`curl -X POST $HALYARD/api/rpc/evm -H 'content-type: application/json' \\\n  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}'`} />
    <p className="mt-2">Response header <code>x-halyard-upstream</code> tells you which node served the call.</p>
    <h2 className="mt-8 text-xl font-semibold text-white">Configuration</h2>
    <C c={`PORTALDOT_SUBSTRATE_RPCS=url1,url2\nPORTALDOT_EVM_RPCS=url1,url2`} />
    <h2 className="mt-8 text-xl font-semibold text-white">Safety</h2><p>Signing/admin namespaces (personal_, admin_, debug_, eth_sign) are refused at the gateway.</p></main>);
}
