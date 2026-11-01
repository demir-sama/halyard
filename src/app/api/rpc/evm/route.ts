import { NextResponse } from "next/server";
import { forward } from "@/lib/portaldot";
export const dynamic = "force-dynamic";
const DENY = /^(personal_|admin_|debug_|miner_|engine_|eth_sign$|eth_signTransaction$|eth_sendTransaction$|author_(insertKey|rotateKeys|removeExtrinsic|hasKey|hasSessionKeys)$|system_(addReservedPeer|removeReservedPeer|addLogFilter|resetLogFilter)$|offchain_)/;
const CORS = { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "access-control-expose-headers": "x-halyard-upstream, x-halyard-tried" };
export function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const calls = Array.isArray(body) ? body : [body];
  if (!body || calls.length === 0 || calls.length > 50 || calls.some((c) => typeof c?.method !== "string" || DENY.test(c.method)))
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "invalid or disallowed request (Halyard policy)" } }, { status: 400, headers: CORS });
  try {
    const { upstream, tried, json } = await forward("evm", body);
    return NextResponse.json(json, { headers: { ...CORS, "x-halyard-upstream": upstream, "x-halyard-tried": tried.join(",") } });
  } catch (e) {
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32603, message: "all upstreams failed: " + (e as Error).message } }, { status: 502, headers: CORS });
  }
}
