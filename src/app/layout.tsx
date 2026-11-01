import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
export const metadata: Metadata = {
  title: { default: "Halyard — dual-VM RPC control plane for Portaldot V3", template: "%s · Halyard" },
  description: "Probe, fingerprint and fail over Portaldot V3 Substrate + EVM endpoints from one gateway.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={`${sans.variable} ${mono.variable}`}><body className="min-h-screen bg-[#07090D] font-sans text-white antialiased"><Nav />{children}<Footer /></body></html>);
}
