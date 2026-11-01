import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
export const metadata: Metadata = { title: "Halyard — dual-VM RPC control plane for Portaldot V3", description: "Probe, compare and fail over Portaldot V3 Substrate + EVM endpoints from one gateway." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="min-h-screen bg-[#0B0D12] text-white antialiased"><Nav />{children}</body></html>);
}
