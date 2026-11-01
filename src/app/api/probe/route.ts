import { NextResponse } from "next/server";
import { endpoints, probe, NETWORK } from "@/lib/portaldot";
export const dynamic = "force-dynamic";
export async function GET() {
  const results = await Promise.all(endpoints().map(probe));
  const sub = results.find((r) => r.endpoint.vm === "substrate" && r.ok);
  const evm = results.find((r) => r.endpoint.vm === "evm" && r.ok);
  const drift = sub?.head != null && evm?.head != null ? sub.head - evm.head : null;
  return NextResponse.json({ network: NETWORK, at: new Date().toISOString(), results, crossVm: { drift, finalityLag: sub ? (sub.head ?? 0) - (sub.finalized ?? 0) : null, chainIdMatch: evm?.chainId === NETWORK.evmChainId } });
}
