"use client";
import { motion } from "framer-motion";
export default function Logo({ size = 32, animate = false }: { size?: number; animate?: boolean }) {
  const d = animate ? { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 1.4, ease: "easeInOut" as const } } : {};
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Halyard">
      <defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FCD38D" /><stop offset="1" stopColor="#E8590C" /></linearGradient></defs>
      <rect width="64" height="64" rx="16" fill="#0E1118" stroke="#ffffff14" />
      <motion.path d="M32 8v48" stroke="url(#hg)" strokeWidth="4" strokeLinecap="round" fill="none" {...d} />
      <motion.path d="M14 20l18 10 18-10" stroke="url(#hg)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" {...d} />
      <motion.path d="M14 44l18-10 18 10" stroke="url(#hg)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" {...d} />
      <circle cx="32" cy="32" r="5" fill="#FCD38D" />
    </svg>
  );
}
