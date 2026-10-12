"use client";
// Pezzi comuni delle demo: la card, le curve, le spring di Motion che rispettano "Rallenta".
import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { slowFactor } from "../SlowMo";

export const EO = "cubic-bezier(0.23, 1, 0.32, 1)";
export const EIO = "cubic-bezier(0.77, 0, 0.175, 1)";
export const ED = "cubic-bezier(0.32, 0.72, 0, 1)";

export const reduced = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Media query come stato React: sul server vale false, dopo l'idratazione il valore vero. */
export function useMedia(q: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia(q);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => matchMedia(q).matches,
    () => false,
  );
}
export const useRM = () => useMedia("(prefers-reduced-motion: reduce)");

const noop = () => () => {};
/** Valore che esiste solo nel browser (supporto CSS, media query statiche): sul server usa il fallback. */
export const useClientValue = <T,>(get: () => T, server: T) => useSyncExternalStore(noop, get, () => server);

export function DemoCard({ title, rule, note, children }: { title: string; rule?: string; note?: string; children: ReactNode }) {
  return (
    <section className="demo">
      <header className="demo-head">
        <span className="demo-tag">Esempio live</span>
        <span className="demo-title">{title}</span>
        {rule && <span className="demo-rule">{rule}</span>}
      </header>
      <div className="demo-body">{children}</div>
      {note && <p className="demo-note">{note}</p>}
    </section>
  );
}

/** Pallino del confronto A/B: x sbagliato, m migliorabile, v giusto. */
export const Dot = ({ k }: { k: "x" | "m" | "v" }) => <span className={k}>●</span>;

export function PopMenu({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`pop ${className}`} style={style}>
      <div>Profilo</div>
      <div>Impostazioni</div>
      <div>Esci</div>
    </div>
  );
}

export function Curve({ c: [x1, y1, x2, y2] }: { c: number[] }) {
  return (
    <svg className="curve" viewBox="-6 -6 112 112" aria-hidden="true">
      <path className="ax" d="M0 0 V100 H100" />
      <path className="d" d="M0 100 L100 0" />
      <path className="c" d={`M0 100 C ${x1 * 100} ${100 - y1 * 100}, ${x2 * 100} ${100 - y2 * 100}, 100 0`} />
    </svg>
  );
}

/* ---------- spring ---------- */

export type Apple = { duration: number; bounce: number };
export type Physics = { stiffness: number; damping: number; mass: number };

/** Apple → fisica: ζ = 1 − bounce, periodo = durata. Serve per il grafico e il calcolo di ζ. */
export function toPhysics(p: Apple | Physics): Physics {
  if ("stiffness" in p) return p;
  const w = (2 * Math.PI) / p.duration;
  return { stiffness: w * w, damping: 2 * (1 - p.bounce) * w, mass: 1 };
}

/**
 * Opzioni di spring per animate() di Motion, rallentate dal controllo "Rallenta".
 * La velocità è in px/s; a 4× il tempo scorre 4 volte più lento, quindi anche lei si divide.
 * Senza velocità esplicita Motion eredita quella attuale del valore: è ciò che rende l'interruzione continua.
 */
export function spring(p: Apple | Physics, velocity?: number) {
  const s = slowFactor();
  const { stiffness, damping, mass } = toPhysics(p);
  return {
    type: "spring" as const,
    stiffness: stiffness / (s * s),
    damping: damping / s,
    mass,
    restDelta: 0.3,
    restSpeed: 1,
    ...(velocity !== undefined && { velocity: velocity / s }),
  };
}

/** Integra la spring (verso 1) per disegnarne la curva e stimare quando si ferma. */
export function simulate(p: Physics, T = 1.6) {
  const pts: [number, number][] = [];
  let x = 0, v = 0, t = 0, settle = T, still = 0;
  const h = 1 / 600;
  for (let i = 0; t < T; i++) {
    const a = (-p.stiffness * (x - 1) - p.damping * v) / p.mass;
    v += a * h; x += v * h; t += h;
    if (i % 6 === 0) pts.push([t, x]);
    if (Math.abs(x - 1) < 0.002 && Math.abs(v) < 0.01) { still += h; if (still > 0.05 && settle === T) settle = t - 0.05; }
    else { still = 0; settle = T; }
  }
  return { pts, settle };
}

/** Converte una spring in una curva CSS linear(), per usarla in WAAPI. */
export function springEasing(p: Physics) {
  if (!CSS.supports("transition-timing-function", "linear(0, 1)")) return { easing: EO, ms: 450 };
  let x = 0, v = 0, t = 0;
  const h = 1 / 1000, xs = [0];
  while (t < 3) {
    const a = (-p.stiffness * (x - 1) - p.damping * v) / p.mass;
    v += a * h; x += v * h; t += h; xs.push(x);
    if (t > 0.1 && Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.005) break;
  }
  const n = 48, out: string[] = [];
  for (let i = 0; i <= n; i++) out.push(xs[Math.round((i / n) * (xs.length - 1))].toFixed(4));
  out[n] = "1";
  return { easing: `linear(${out.join(", ")})`, ms: Math.round(t * 1000) };
}

/** Velocità del dito negli ultimi 100ms, in px/ms, limitata a ±8. */
export function tracker() {
  const pts: { x: number; t: number }[] = [];
  return {
    add(x: number) {
      const t = performance.now();
      pts.push({ x, t });
      while (pts.length > 2 && t - pts[0].t > 100) pts.shift();
    },
    v() {
      if (pts.length < 2) return 0;
      const a = pts[0], b = pts[pts.length - 1];
      return Math.max(-8, Math.min(8, (b.x - a.x) / Math.max(8, b.t - a.t)));
    },
    reset() { pts.length = 0; },
  };
}

/** Rubber-band di Apple: oltre il bordo segue sempre meno. */
export const rubber = (over: number, dim: number, c = 0.55) => (over * dim * c) / (dim + c * over);
