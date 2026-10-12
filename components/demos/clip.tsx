"use client";
// Giorno 7: clip-path (hold, tab, slider, reveal) e stagger.
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { play } from "../SlowMo";
import { DemoCard, Dot, EO } from "./kit";

function HoldCol({ label, cls }: { label: ReactNode; cls: string }) {
  const [out, setOut] = useState("–");
  const btn = useRef<HTMLButtonElement>(null);
  return (
    <div className="p">
      <span className="lab-l">{label}</span>
      <button
        ref={btn}
        className={`hold ${cls}`}
        type="button"
        onPointerDown={() => setOut("tieni…")}
        onPointerUp={() => setOut((o) => (o === "tieni…" ? "annullato" : o))}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span>Tieni premuto per eliminare</span>
        <span
          className="ov"
          aria-hidden="true"
          onTransitionEnd={(e) => { if (e.propertyName === "clip-path" && btn.current?.matches(":active")) setOut("eliminato ✓"); }}
        >
          Tieni premuto per eliminare
        </span>
      </button>
      <span className="out">{out}</span>
    </div>
  );
}

export function Hold() {
  return (
    <DemoCard title="Tieni premuto per eliminare" rule="Regola: lento dove l'utente decide, veloce dove il sistema risponde." note="Premi e lascia a metà. In A il rosso torna indietro lentamente, come se il sistema esitasse.">
      <div className="ab">
        <HoldCol label={<><Dot k="x" /> simmetrico: 2s e 2s</>} cls="hold-a" />
        <HoldCol label={<><Dot k="v" /> 2s linear · rilascio 200ms ease-out</>} cls="hold-b" />
      </div>
    </DemoCard>
  );
}

const TAB_NAMES = ["Issue", "Progetti", "Cicli", "Viste"];

function ClipTabs() {
  const [cur, setCur] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const [clip, setClip] = useState<string>();
  useLayoutEffect(() => {
    const measure = () => {
      const w = wrap.current, b = btns.current[cur];
      if (!w || !b) return;
      const L = b.offsetLeft, R = w.clientWidth - (b.offsetLeft + b.offsetWidth);
      setClip(`inset(3px ${R}px 3px ${L}px round 8px)`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap.current!);
    return () => ro.disconnect();
  }, [cur]);
  return (
    <div className="tabs tabs-b" ref={wrap}>
      {TAB_NAMES.map((n, i) => (
        <button key={n} type="button" ref={(el) => { btns.current[i] = el; }} onClick={() => setCur(i)}>{n}</button>
      ))}
      {/* la copia in stile attivo: si vede solo dove il clip la lascia scoperta */}
      <div className="copy" aria-hidden="true" style={{ clipPath: clip }}>
        {TAB_NAMES.map((n) => <button key={n} type="button" tabIndex={-1}>{n}</button>)}
      </div>
    </div>
  );
}

export function Tabs() {
  const [a, setA] = useState(0);
  return (
    <DemoCard title="Tab con cambio colore perfetto" rule="Regola: duplica la lista in stile attivo e anima il clip-path." note="A 4×: in A testo e sfondo cambiano in due tempi; in B si muovono insieme, perché è un solo elemento che si rivela.">
      <div className="ab">
        <div className="p">
          <span className="lab-l"><Dot k="m" /> colore animato tab per tab</span>
          <div className="tabs tabs-a">
            {TAB_NAMES.map((n, i) => <button key={n} type="button" className={i === a ? "on" : ""} onClick={() => setA(i)}>{n}</button>)}
          </div>
        </div>
        <div className="p"><span className="lab-l"><Dot k="v" /> copia ritagliata con clip-path</span><ClipTabs /></div>
      </div>
    </DemoCard>
  );
}

export function Compare() {
  const [v, setV] = useState(50);
  return (
    <DemoCard title="Slider prima / dopo" rule="Regola: clip-path: inset(0 X% 0 0) sull'immagine sopra. Nessun DOM in più.">
      <div className="cmp">
        <div className="lay after">dopo</div>
        <div className="lay before" style={{ clipPath: `inset(0 ${100 - v}% 0 0)` }}>prima</div>
      </div>
      <div className="ctl" style={{ margin: "12px 0 0" }}>
        <label>Divisore <input type="range" min={0} max={100} value={v} onChange={(e) => setV(+e.target.value)} /></label>
      </div>
    </DemoCard>
  );
}

export function Reveal() {
  const [on, setOn] = useState(false);
  return (
    <DemoCard title="Reveal con clip-path" rule="Regola: da inset(0 0 100% 0) a inset(0 0 0 0). Solo per pagine marketing, una volta.">
      <div className="ctl"><button className="btn small primary" type="button" onClick={() => setOn(!on)}>Rivela / nascondi</button></div>
      <div className={`reveal ${on ? "on" : ""}`} />
    </DemoCard>
  );
}

const ROWS = ["Nuova issue assegnata", "Ciclo 14 iniziato", "Commento di Marta", "Progetto archiviato", "Due PR da rivedere", "Build verde"];
const stLabel = (v: number) => (v === 0 ? "tutto insieme" : v < 30 ? "quasi insieme" : v <= 80 ? "consigliato ✓" : `lento: l'ultima riga parte dopo ${v * 5}ms`);

export function Stagger() {
  const [gap, setGap] = useState(50);
  const list = useRef<HTMLDivElement>(null);
  const run = () =>
    [...list.current!.children].forEach((d, i) =>
      play(d, [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: EO, delay: i * gap, fill: "backwards" }),
    );
  return (
    <DemoCard title="Stagger di una lista" rule="Regola: 30–80ms tra gli elementi. Decorativo: non blocca mai l'interazione.">
      <div className="ctl">
        <label>Ritardo tra righe <input type="range" min={0} max={200} step={10} value={gap} onChange={(e) => setGap(+e.target.value)} /></label>
        <span className="out">{gap}ms · {stLabel(gap)}</span>
        <button className="btn small primary" type="button" onClick={run}>Riproduci</button>
      </div>
      <div className="stg" ref={list}>{ROWS.map((t) => <div key={t}>{t}</div>)}</div>
    </DemoCard>
  );
}
