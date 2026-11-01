import { NextResponse } from "next/server";
import { endpoints, rpc } from "@/lib/portaldot";
import { rank } from "@/lib/health";
export const dynamic = "force-dynamic";
// Cross-VM block inspector: the same height seen from Substrate and from the EVM.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("n");
  const sub = rank(endpoints().filter((e) => e.vm === "substrate"))[0];
  const evm = rank(endpoints().filter((e) => e.vm === "evm"))[0];
  try {
    const n = q ? Number(q) : parseInt((await rpc<{ number: string }>(sub.url, "chain_getHeader")).result.number, 16);
    if (!Number.isInteger(n) || n < 0) return NextResponse.json({ error: "n must be a non-negative integer" }, { status: 400 });
    const hash = (await rpc<string | null>(sub.url, "chain_getBlockHash", [n])).result;
    if (!hash) return NextResponse.json({ error: `block ${n} not found` }, { status: 404 });
    const [blk, eb] = await Promise.all([
      rpc<{ block: { header: { parentHash: string; stateRoot: string }; extrinsics: string[] } }>(sub.url, "chain_getBlock", [hash]),
      rpc<{ hash: string; timestamp: string; transactions: string[]; gasUsed: string; parentHash: string; stateRoot: string } | null>(evm.url, "eth_getBlockByNumber", ["0x" + n.toString(16), false]),
    ]);
    return NextResponse.json({
      n,
      substrate: { hash, parentHash: blk.result.block.header.parentHash, stateRoot: blk.result.block.header.stateRoot, extrinsics: blk.result.block.extrinsics.length },
      evm: eb.result && { hash: eb.result.hash, parentHash: eb.result.parentHash, timestamp: new Date(parseInt(eb.result.timestamp, 16) * 1000).toISOString(), txs: eb.result.transactions.length, gasUsed: parseInt(eb.result.gasUsed, 16) },
    });
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 502 }); }
}
