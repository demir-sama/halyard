// Network identity pinning for Portaldot V3 testnet (observed live 2026-11-01).
export const PINNED = {
  substrateGenesis: process.env.HALYARD_PIN_SUBSTRATE_GENESIS ?? "0xd4f9acbcf7f52388d8b095abe3c198d19fc510e0343e643e87cfbccb155283bd",
  evmGenesis: process.env.HALYARD_PIN_EVM_GENESIS ?? "0x7c05b2dc7486f81a693d676553fa13f380b5be16da7c739b182931cd6cf07001",
  evmChainId: Number(process.env.HALYARD_PIN_CHAIN_ID ?? 420420777),
  specName: process.env.HALYARD_PIN_SPEC_NAME ?? "portaldot-v3",
  minSpecVersion: Number(process.env.HALYARD_PIN_MIN_SPEC ?? 3002),
};
export type Check = { key: string; label: string; expected: string; actual: string; pass: boolean };
export function checkSubstrate(r: { genesis?: string; runtime?: string }): Check[] {
  const [name, ver] = (r.runtime ?? "@").split("@");
  return [
    { key: "sgen", label: "Substrate genesis", expected: PINNED.substrateGenesis, actual: r.genesis ?? "—", pass: r.genesis === PINNED.substrateGenesis },
    { key: "spec", label: "Runtime spec name", expected: PINNED.specName, actual: name || "—", pass: name === PINNED.specName },
    { key: "ver", label: "Runtime spec version", expected: `≥ ${PINNED.minSpecVersion}`, actual: ver || "—", pass: Number(ver) >= PINNED.minSpecVersion },
  ];
}
export function checkEvm(r: { genesis?: string; chainId?: number }): Check[] {
  return [
    { key: "cid", label: "EVM chain ID", expected: String(PINNED.evmChainId), actual: String(r.chainId ?? "—"), pass: r.chainId === PINNED.evmChainId },
    { key: "egen", label: "EVM genesis hash", expected: PINNED.evmGenesis, actual: r.genesis ?? "—", pass: r.genesis === PINNED.evmGenesis },
  ];
}
