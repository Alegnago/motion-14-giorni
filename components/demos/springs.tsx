"use client";
// Giorno 4 e 9: spring di Motion, mouse tracking, interruzioni.
import { animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { play, useSlow } from "../SlowMo";
import { DemoCard, Dot, EO, simulate, spring, toPhysics, type Apple, type Physics } from "./kit";

const tx = (v: number) => `translateX(${v}px)`;

const PRESETS: [string, Apple | Physics][] = [
  ["Emil · Apple-style", { duration: 0.5, bounce: 0.2 }],
  ["Critico (bounce 0)", { duration: 0.4, bounce: 0 }],
  ["Apple drawer", { duration: 0.3, bounce: 0.2 }],
  ["Emil · fisica", { stiffness: 100, damping: 10, mass: 1 }],
  ["Il tuo MOTION.smoothing", { stiffness: 120, damping: 20, mass: 0.6 }],
];

export function SpringLab() {
  const [mode, setMode] = useState<"a" | "p">("a");
  const [a, setA] = useState<Apple>({ duration: 0.5, bounce: 0.2 });
  const [ph, setPh] = useState<Physics>({ stiffness: 100, damping: 10, mass: 1 });
  const p = mode === "a" ? a : ph;
  const phys = toPhysics(p);
  const { pts, settle } = useMemo(() => simulate(phys), [phys.stiffness, phys.damping, phys.mass]); // eslint-disable-line react-hooks/exhaustive-deps
  const zeta = phys.damping / (2 * Math.sqrt(phys.stiffness * phys.mass));
  const x = useMotionValue(0);
  const transform = useTransform(x, tx);
  const track = useRef<HTMLDivElement>(null);
  const side = useRef(0);
  const go = () => {
    side.current = side.current ? 0 : 1;
    animate(x, side.current * Math.max(0, track.current!.clientWidth - 44), spring(p));
  };
  const path = "M0 120 " + pts.map(([t, v]) => `L${((t / 1.6) * 320).toFixed(1)} ${(120 - v * 80).toFixed(1)}`).join(" ");
  return (
    <DemoCard title="Laboratorio spring" rule="Apple: duration + bounce. Fisica: stiffness, damping, mass." note="La conversione Apple → fisica qui è un'approssimazione (ζ = 1 − bounce). “Il tuo MOTION.smoothing” è il valore che usi in micro-interactions per il tilt.">
      <div className="presets">
        {PRESETS.map(([n, v]) => (
          <button key={n} className="btn small" type="button" onClick={() => ("stiffness" in v ? (setPh(v), setMode("p")) : (setA(v), setMode("a")))}>{n}</button>
        ))}
      </div>
      <div className="ctl">
        <span className="seg" role="group" aria-label="Modalità">
          <button type="button" aria-pressed={mode === "a"} onClick={() => setMode("a")}>Apple: durata + bounce</button>
          <button type="button" aria-pressed={mode === "p"} onClick={() => setMode("p")}>Fisica: k · c · m</button>
        </span>
      </div>
      {mode === "a" ? (
        <div className="ctl">
          <label>durata <input type="range" min={0.15} max={1.2} step={0.05} value={a.duration} onChange={(e) => setA({ ...a, duration: +e.target.value })} /></label>
          <label>bounce <input type="range" min={0} max={0.6} step={0.05} value={a.bounce} onChange={(e) => setA({ ...a, bounce: +e.target.value })} /></label>
        </div>
      ) : (
        <div className="ctl">
          <label>stiffness <input type="range" min={20} max={800} step={5} value={ph.stiffness} onChange={(e) => setPh({ ...ph, stiffness: +e.target.value })} /></label>
          <label>damping <input type="range" min={1} max={60} step={0.5} value={ph.damping} onChange={(e) => setPh({ ...ph, damping: +e.target.value })} /></label>
          <label>mass <input type="range" min={0.2} max={5} step={0.1} value={ph.mass} onChange={(e) => setPh({ ...ph, mass: +e.target.value })} /></label>
        </div>
      )}
      <svg className="sp-plot" viewBox="0 0 320 140" preserveAspectRatio="none" aria-hidden="true">
        <path className="tg" d="M0 40 H320" />
        <path className="ln" d={path} />
        <text x="4" y="36">target</text>
        <text x="290" y="134">1,6 s</text>
      </svg>
      <div className="track" ref={track}><motion.div className="ball" style={{ transform }} /></div>
      <div className="ctl">
        <button className="btn small primary" type="button" onClick={go}>Avvia (inverti)</button>
        <span className="out">
          k {phys.stiffness.toFixed(0)} · c {phys.damping.toFixed(1)} · m {phys.mass} · ζ {zeta.toFixed(2)} · si ferma ≈ {Math.round(settle * 1000)}ms
        </span>
      </div>
    </DemoCard>
  );
}

function Tilt({ label, springy }: { label: string; springy: boolean }) {
  const s = useSlow();
  const rx = useMotionValue(0), ry = useMotionValue(0);
  // useSpring di Motion, come nella skill: stiffness 100, damping 10. "Rallenta" scala il tempo.
  const cfg = { stiffness: 100 / (s * s), damping: 10 / s, restDelta: 0.05 };
  const sx = useSpring(rx, cfg), sy = useSpring(ry, cfg);
  const transform = useTransform(springy ? [sx, sy] : [rx, ry], ([X, Y]: number[]) => `rotateX(${X}deg) rotateY(${Y}deg)`);
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    rx.set(-ny * 14); ry.set(nx * 18);
  };
  const reset = () => { rx.set(0); ry.set(0); };
  return (
    <div className="p">
      <span className="lab-l">{label}</span>
      <div className="tilt-wrap" onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
        <motion.div className="tilt" style={{ transform }}>muovi qui</motion.div>
      </div>
    </div>
  );
}

export function Mouse() {
  return (
    <DemoCard title="Mouse tracking: diretto o con spring" rule="Regola: il valore legato al mouse senza movimento sembra artificiale. È solo decorativo." note="Su un grafico bancario niente spring: il dato non deve “dondolare”.">
      <div className="ab">
        <Tilt label="A · legato al puntatore" springy={false} />
        <Tilt label="B · useSpring (k100, c10)" springy />
      </div>
    </DemoCard>
  );
}

export function Interrupt() {
  const track = useRef<HTMLDivElement>(null);
  const kf = useRef<HTMLDivElement>(null);
  const anim = useRef<Animation | null>(null);
  const [to, setTo] = useState(0);
  const x = useMotionValue(0);
  const transform = useTransform(x, tx);
  const flip = () => {
    const W = Math.max(0, track.current!.clientWidth - 34);
    const next = to ? 0 : W, from = to ? W : 0;
    anim.current?.cancel();
    anim.current = play(kf.current!, [{ transform: `translateX(${from}px)` }, { transform: `translateX(${next}px)` }], { duration: 700, easing: EO, fill: "forwards" });
    setTo(next);
    animate(x, next, spring({ duration: 0.7, bounce: 0.1 }));
  };
  return (
    <DemoCard title="Cambia idea a metà" rule="Regola: transition e spring ripartono da dove sono. I keyframes ripartono da zero." note="Clicca due volte di fila, velocemente. Il pallino rosso salta all'inizio. La spring conserva anche la velocità.">
      <div className="ir"><span className="lab-l"><Dot k="x" /> keyframes</span><div className="track" ref={track}><div className="ball" ref={kf} /></div></div>
      <div className="ir"><span className="lab-l"><Dot k="m" /> CSS transition</span><div className="track"><div className="ball" style={{ transition: `transform 700ms ${EO}`, transform: `translateX(${to}px)` }} /></div></div>
      <div className="ir"><span className="lab-l"><Dot k="v" /> spring (Motion)</span><div className="track"><motion.div className="ball" style={{ transform }} /></div></div>
      <div className="btns"><button className="btn primary small" type="button" onClick={flip}>Inverti direzione</button></div>
    </DemoCard>
  );
}
