// Health ledger: rolling latency/error history, scoring, circuit breaker, quarantine.
// The default ledger lives per server instance; drills use an isolated ledger.
import type { Endpoint } from "./portaldot";

type Sample = { t: number; ok: boolean; ms: number };
type State = { samples: Sample[]; fails: number; openUntil: number };
export const BREAKER = { threshold: 3, cooldownMs: 30_000, window: 60 };

export class Ledger {
  private m = new Map<string, State>();
  quarantined = new Map<string, string>(); // id -> reason (fingerprint mismatch)
  /** "score": best score first. "priority": configured order (primary-first), breaker still applies. */
  constructor(private cfg = BREAKER, public mode: "score" | "priority" = "score") {}
  private st(id: string) { let s = this.m.get(id); if (!s) this.m.set(id, (s = { samples: [], fails: 0, openUntil: 0 })); return s; }
  record(id: string, ok: boolean, ms: number) {
    const s = this.st(id);
    s.samples.push({ t: Date.now(), ok, ms });
    if (s.samples.length > this.cfg.window) s.samples.shift();
    if (ok) { s.fails = 0; s.openUntil = 0; }
    else if (++s.fails >= this.cfg.threshold) s.openUntil = Date.now() + this.cfg.cooldownMs;
  }
  breaker(id: string): "closed" | "open" | "half-open" {
    const s = this.st(id);
    if (s.openUntil === 0) return "closed";
    return Date.now() < s.openUntil ? "open" : "half-open";
  }
  /** 0–100: success rate 60%, latency 30% (p50 vs 2 s budget), last result 10%. */
  score(id: string) {
    const s = this.st(id).samples;
    if (!s.length) return { score: 50, uptime: null as number | null, p50: null as number | null, p95: null as number | null, n: 0 };
    const lat = s.filter((x) => x.ok).map((x) => x.ms).sort((a, b) => a - b);
    const q = (p: number) => (lat.length ? lat[Math.min(lat.length - 1, Math.floor(p * lat.length))] : null);
    const uptime = lat.length / s.length, p50 = q(0.5);
    const latScore = p50 == null ? 0 : Math.max(0, 1 - p50 / 2000);
    return { score: Math.round(100 * (0.6 * uptime + 0.3 * latScore + 0.1 * (s[s.length - 1].ok ? 1 : 0))), uptime, p50, p95: q(0.95), n: s.length };
  }
  /** Fast-forward cooldowns so open breakers become half-open (used by drills). */
  expireCooldowns() { for (const s of this.m.values()) if (s.openUntil > 0) s.openUntil = 1; }
  history(id: string) { return this.st(id).samples.slice(-40); }
  /** Routing order: drop quarantined + open breakers, best score first; never route to nothing healthy-looking if avoidable. */
  rank(eps: Endpoint[]) {
    const safe = eps.filter((e) => !this.quarantined.has(e.id));
    const usable = safe.filter((e) => this.breaker(e.id) !== "open");
    const pool = usable.length ? usable : safe;
    if (this.mode === "priority") return pool;
    return [...pool].sort((a, b) => this.score(b.id).score - this.score(a.id).score || eps.indexOf(a) - eps.indexOf(b));
  }
}

const g = globalThis as unknown as { __halyardLedger?: Ledger };
export const ledger = (g.__halyardLedger ??= new Ledger());
export const record = ledger.record.bind(ledger);
export const breaker = ledger.breaker.bind(ledger);
export const score = ledger.score.bind(ledger);
export const history = ledger.history.bind(ledger);
export const rank = ledger.rank.bind(ledger);
