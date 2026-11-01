import { NextResponse } from "next/server";
import { forward } from "@/lib/portaldot";
export const dynamic = "force-dynamic";
const DENY = /^(author_|personal_|admin_|debug_|eth_sign$|eth_sendTransaction$)/;
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const calls = Array.isArray(body) ? body : [body];
  if (!body || calls.some((c) => !c?.method || DENY.test(c.method) && c.method !== "author_submitExtrinsic"))
    return NextResponse.json({ error: "invalid or disallowed request" }, { status: 400 });
  try {
    const { upstream, json } = await forward("evm", body);
    return NextResponse.json(json, { headers: { "x-halyard-upstream": upstream } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
