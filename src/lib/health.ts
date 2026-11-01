// In-process health ledger: rolling latency/error history, scoring and circuit breaker.
// State lives per server instance (warm serverless instances / long-running node).
import type { Endpoint } from "./portaldot";

type Sample = { t: number; ok: boolean; ms: number };
type State = { samples: Sample[]; fails: number; openUntil: number };
const g = globalThis as unknown as { __halyard?: Map<string, State> };
const ledger = (g.__halyard ??= new Map());

export const BREAKER = { threshold: 3, cooldownMs: 30_000, window: 60 };

function st(id: string): State {
  let s = ledger.get(id);
  if (!s) ledger.set(id, (s = { samples: [], fails: 0, openUntil: 0 }));
  return s;
}

export function record(id: string, ok: boolean, ms: number) {
  const s = st(id);
  s.samples.push({ t: Date.now(), ok, ms });
  if (s.samples.length > BREAKER.window) s.samples.shift();
  if (ok) s.fails = 0;
  else if (++s.fails >= BREAKER.threshold) s.openUntil = Date.now() + BREAKER.cooldownMs;
}

export function breaker(id: string): "closed" | "open" | "half-open" {
  const s = st(id);
  if (s.openUntil === 0) return "closed";
  return Date.now() < s.openUntil ? "open" : "half-open";
}

/** 0–100. Weighted: success rate 60%, latency 30% (p50 vs 2s budget), freshness 10%. */
export function score(id: string) {
  const s = st(id).samples;
  if (!s.length) return { score: 50, uptime: null as number | null, p50: null as number | null, p95: null as number | null, n: 0 };
  const ok = s.filter((x) => x.ok);
  const lat = ok.map((x) => x.ms).sort((a, b) => a - b);
  const q = (p: number) => (lat.length ? lat[Math.min(lat.length - 1, Math.floor(p * lat.length))] : null);
  const uptime = ok.length / s.length;
  const p50 = q(0.5);
  const latScore = p50 == null ? 0 : Math.max(0, 1 - p50 / 2000);
  const fresh = s[s.length - 1].ok ? 1 : 0;
  return { score: Math.round(100 * (0.6 * uptime + 0.3 * latScore + 0.1 * fresh)), uptime, p50, p95: q(0.95), n: s.length };
}

export function history(id: string) { return st(id).samples.slice(-40); }

/** Order endpoints for routing: skip open breakers, best score first. */
export function rank(eps: Endpoint[]) {
  const usable = eps.filter((e) => breaker(e.id) !== "open");
  const pool = usable.length ? usable : eps; // never route to nothing
  return [...pool].sort((a, b) => score(b.id).score - score(a.id).score);
}
