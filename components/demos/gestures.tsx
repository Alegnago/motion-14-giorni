"use client";
// Giorno 8: drag to dismiss, rubber-band, proiezione del momentum.
// Ogni posizione è un motion value: animate() riparte dal valore sullo schermo, e al rilascio riceve la velocità del dito.
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { DemoCard, Dot, rubber, spring, tracker } from "./kit";

type Drag = { on: boolean; start: number; base: number; trk: ReturnType<typeof tracker> };
const newDrag = (): Drag => ({ on: false, start: 0, base: 0, trk: tracker() });

export function Sheet() {
  const [flickOn, setFlickOn] = useState(true);
  const [rubberOn, setRubberOn] = useState(true);
  const [out, setOut] = useState("–");
  const [dragging, setDragging] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  const open = useRef(false);
  const d = useRef(newDrag());
  // NaN = mai aperto: resta il translateY(100%) del CSS, qualunque sia l'altezza
  const y = useMotionValue(NaN);
  const transform = useTransform(y, (v) => (Number.isNaN(v) ? "translateY(100%)" : `translateY(${v}px)`));

  const show = () => {
    if (Number.isNaN(y.get())) y.jump(sheet.current!.offsetHeight);
    open.current = true;
    animate(y, 0, spring({ duration: 0.45, bounce: 0 }));
  };
  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    if (d.current.on || !open.current) return; // multi-touch: il secondo dito non prende il controllo
    y.stop();
    d.current = { on: true, start: e.clientY, base: y.get(), trk: tracker() };
    d.current.trk.add(e.clientY);
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!d.current.on) return;
    d.current.trk.add(e.clientY);
    let ny = d.current.base + e.clientY - d.current.start;
    if (ny < 0) ny = rubberOn ? -rubber(-ny, sheet.current!.offsetHeight) : 0;
    y.set(ny);
  };
  const end = () => {
    if (!d.current.on) return;
    d.current.on = false;
    setDragging(false);
    const H = sheet.current!.offsetHeight;
    const moved = y.get() - d.current.base, v = d.current.trk.v(), flick = Math.abs(v) > 0.11;
    // Apple: chiudere o tornare si decide dal segno della velocità al rilascio, non dalla posizione.
    let close = y.get() >= H * 0.5, why = close ? "chiuso per distanza" : "torna su";
    if (flick && v < 0) { close = false; why = "flick verso l'alto → resta aperto"; }
    else if (flick && v > 0 && flickOn) { close = true; why = "chiuso per velocità"; }
    open.current = !close;
    // un po' di rimbalzo solo se il gesto aveva slancio
    animate(y, close ? H : 0, spring(flick ? { duration: 0.3, bounce: 0.2 } : { duration: 0.45, bounce: 0 }, v * 1000));
    setOut(`${Math.round(moved)}px · ${v.toFixed(2)} px/ms → ${why}`);
  };

  return (
    <DemoCard title="Drag to dismiss" rule="Regola: chiudi per velocità, non solo per distanza. Pointer capture, multi-touch, rubber-band. Riprendi da dove si trova." note="Da telefono si sente meglio. Togli il flick e prova a chiudere con un colpo corto: non basta più. Poi lascialo e riprendilo mentre torna su: non salta.">
      <div className="ctl">
        <label><input type="checkbox" checked={flickOn} onChange={(e) => setFlickOn(e.target.checked)} /> chiudi con un flick (velocità &gt; 0.11 px/ms)</label>
        <label><input type="checkbox" checked={rubberOn} onChange={(e) => setRubberOn(e.target.checked)} /> rubber-band verso l&apos;alto</label>
      </div>
      <div className="phone tall">
        <div style={{ padding: 14 }}><button className="btn small" type="button" onClick={show}>Apri sheet</button></div>
        <motion.div ref={sheet} className={`sheet ${dragging ? "dragging" : ""}`} style={{ transform }} onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
          <div className="handle" />
          <p><b>Trascina giù</b> per chiudere.</p>
          <p>Prova un colpo corto e veloce, poi tira verso l&apos;alto.</p>
          <p className="out">{out}</p>
        </motion.div>
      </div>
    </DemoCard>
  );
}

function RubberRow({ label, soft }: { label: ReactNode; soft: boolean }) {
  const row = useRef<HTMLDivElement>(null);
  const d = useRef(newDrag());
  const x = useMotionValue(0);
  const transform = useTransform(x, (v) => `translateX(${v}px)`);
  const max = () => Math.max(0, row.current!.clientWidth - 44);
  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    if (d.current.on) return;
    x.stop();
    d.current = { on: true, start: e.clientX, base: x.get(), trk: tracker() };
    d.current.trk.add(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!d.current.on) return;
    d.current.trk.add(e.clientX);
    const W = row.current!.clientWidth, M = max();
    let nx = d.current.base + e.clientX - d.current.start;
    if (nx < 0) nx = soft ? -rubber(-nx, W) : 0;
    else if (nx > M) nx = soft ? M + rubber(nx - M, W) : M;
    x.set(nx);
  };
  const end = () => {
    if (!d.current.on) return;
    d.current.on = false;
    animate(x, Math.min(Math.max(x.get(), 0), max()), spring({ duration: 0.45, bounce: 0 }, d.current.trk.v() * 1000));
  };
  return (
    <div>
      <span className="lab-l">{label}</span>
      <div className="rb" ref={row}>
        <motion.div className="knob" style={{ transform }} onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end} />
      </div>
    </div>
  );
}

export function Rubber() {
  return (
    <DemoCard title="Bordo morbido" rule="Regola: oltre il limite resisti progressivamente, non fermarti di colpo." note="Trascina il quadrato oltre i bordi.">
      <RubberRow label={<><Dot k="x" /> muro: si ferma di colpo</>} soft={false} />
      <RubberRow label={<><Dot k="v" /> rubber-band (Apple, c = 0.55)</>} soft />
    </DemoCard>
  );
}

const STEP = 172, MIN_X = -(STEP * 5);
// Proiezione di Apple (Designing Fluid Interfaces): dove si fermerebbe il gesto con una decelerazione 0.998
const project = (vPxS: number, rate = 0.998) => ((vPxS / 1000) * rate) / (1 - rate);

export function Projection() {
  const [proj, setProj] = useState(true);
  const [out, setOut] = useState("–");
  const d = useRef(newDrag());
  const x = useMotionValue(0);
  const transform = useTransform(x, (v) => `translateX(${v}px)`);
  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    if (d.current.on) return;
    x.stop();
    d.current = { on: true, start: e.clientX, base: x.get(), trk: tracker() };
    d.current.trk.add(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!d.current.on) return;
    d.current.trk.add(e.clientX);
    let nx = d.current.base + e.clientX - d.current.start;
    if (nx > 0) nx = rubber(nx, 300);
    if (nx < MIN_X) nx = MIN_X - rubber(MIN_X - nx, 300);
    x.set(nx);
  };
  const end = () => {
    if (!d.current.on) return;
    d.current.on = false;
    const v = d.current.trk.v() * 1000, p = proj ? project(v) : 0;
    const target = Math.min(0, Math.max(MIN_X, Math.round((x.get() + p) / STEP) * STEP));
    setOut(`velocità ${Math.round(v)} px/s · proiezione ${Math.round(p)}px → card ${Math.round(-target / STEP) + 1}`);
    animate(x, target, spring(Math.abs(v) > 110 ? { duration: 0.3, bounce: 0.2 } : { duration: 0.5, bounce: 0 }, v));
  };
  return (
    <DemoCard title="Lancia il carosello" rule="Regola: scegli lo snap dal punto in cui il gesto sta andando, non da dove l'hai lasciato." note="Fai un flick veloce in entrambe le modalità. Con la proiezione un colpo piccolo ti porta lontano.">
      <div className="ctl">
        <span className="seg" role="group" aria-label="Proiezione">
          <button type="button" aria-pressed={!proj} onClick={() => setProj(false)}>Snap dal punto di rilascio</button>
          <button type="button" aria-pressed={proj} onClick={() => setProj(true)}>Proiezione del momentum</button>
        </span>
        <span className="out">{out}</span>
      </div>
      <div className="car" onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
        <motion.div className="car-t" style={{ transform }}>
          {[1, 2, 3, 4, 5, 6].map((n) => <div key={n}>{n}</div>)}
        </motion.div>
      </div>
    </DemoCard>
  );
}
