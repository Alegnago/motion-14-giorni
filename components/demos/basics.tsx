"use client";
// Giorni 1–3: vocabolario, frequenza e scopo, easing e durata.
import { useRef, useState } from "react";
import { play, slowFactor } from "../SlowMo";
import { Curve, DemoCard, Dot, EIO, EO, PopMenu, springEasing, toPhysics } from "./kit";

const FX: Record<string, (box: HTMLElement, dots: HTMLElement) => void> = {
  "Fade in": (box) => play(box, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: EO }),
  "Slide in": (box) => play(box, [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: EO }),
  "Scale in": (box) => play(box, [{ opacity: 0, transform: "scale(.9)" }, { opacity: 1, transform: "none" }], { duration: 250, easing: EO }),
  "Pop in": (box) => {
    const pop = springEasing(toPhysics({ duration: 0.45, bounce: 0.35 }));
    play(box, [{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
    play(box, [{ transform: "scale(.8)" }, { transform: "none" }], { duration: pop.ms, easing: pop.easing });
  },
  Stagger: (_, dots) =>
    [...dots.children].forEach((d, i) =>
      play(d, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 0.25, transform: "none" }], { duration: 300, easing: EO, delay: i * 60, fill: "backwards" }),
    ),
  Shake: (box) => play(box, [0, -9, 9, -6, 6, -3, 3, 0].map((x) => ({ transform: `translateX(${x}px)` })), { duration: 420, easing: "ease-out" }),
  Pulse: (box) => play(box, [{ transform: "scale(1)" }, { transform: "scale(1.07)" }, { transform: "scale(1)" }], { duration: 700, easing: "ease-in-out", iterations: 2 }),
  Rotate: (box) => play(box, [{ transform: "rotate(0)" }, { transform: "rotate(90deg)" }], { duration: 400, easing: EIO }),
  "3D flip": (box) =>
    play(box, [{ transform: "perspective(400px) rotateY(0)" }, { transform: "perspective(400px) rotateY(180deg)" }, { transform: "perspective(400px) rotateY(360deg)" }], { duration: 900, easing: EIO }),
};

export function Gallery() {
  const box = useRef<HTMLDivElement>(null);
  const dots = useRef<HTMLDivElement>(null);
  return (
    <DemoCard title="Il glossario in movimento" rule="Clicca un termine. Con 4× in alto lo vedi al rallentatore." note="Pop in usa una spring vera (bounce 0.35): nota l'overshoot che lo distingue da Scale in.">
      <div className="g-stage">
        <div className="g-box" ref={box} />
        <div className="g-dots" ref={dots}>
          {[0, 1, 2, 3, 4].map((i) => <i key={i} />)}
        </div>
      </div>
      <div className="btns">
        {Object.keys(FX).map((k) => (
          <button key={k} className="btn small" type="button" onClick={() => FX[k](box.current!, dots.current!)}>{k}</button>
        ))}
      </div>
    </DemoCard>
  );
}

function Palette({ label, animated }: { label: string; animated: boolean }) {
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(0);
  return (
    <div className="p">
      <span className="lab-l">{label}</span>
      <button className="btn small" type="button" onClick={() => { if (!open) setN(n + 1); setOpen(!open); }}>Apri / chiudi ⌘K</button>
      <div className={`pal ${animated ? "pal-anim" : ""} ${open ? "open" : ""}`}>
        <div className="q">Cerca un comando…</div>
        <div className="r">Nuova issue</div>
        <div className="r">Vai al progetto</div>
        <div className="r">Cambia tema</div>
      </div>
      <span className="out">{n} aperture</span>
    </div>
  );
}

export function Freq() {
  return (
    <DemoCard title="Command palette: animata o no?" rule="Regola: 100+ volte al giorno → nessuna animazione. Mai." note="Aprile e chiudile 15 volte ciascuna, di fila. A diventa un'attesa. B sembra più veloce anche se “manca” qualcosa.">
      <div className="ab">
        <Palette label="A · animata 250ms" animated />
        <Palette label="B · nessuna animazione" animated={false} />
      </div>
    </DemoCard>
  );
}

const PURPOSES = ["Scegli…", "Feedback", "Coerenza spaziale", "Indicazione di stato", "Spiegazione", "Evitare un cambio brusco", "Non animare"];
const PURPOSE_ITEMS = [
  ["Apertura della command palette con ⌘K", "Non animare", "Azione da tastiera, centinaia di volte al giorno."],
  ["Toast che entra dal basso ed esce dal basso", "Coerenza spaziale", "Stessa direzione in entrata e uscita: lo swipe per chiudere diventa ovvio."],
  ["Bottone che si abbassa quando lo premi", "Feedback", "Conferma che l'interfaccia ti ha sentito."],
  ["Bottone “Salva” che diventa “Salvato ✓”", "Indicazione di stato", "Rende leggibile il cambio di stato."],
  ["Animazione in landing che mostra come funziona la sync", "Spiegazione", "Marketing: qui la durata può essere più lunga."],
  ["Le card della dashboard ruotano un po' all'hover", "Non animare", "Decine di volte al giorno e lo scopo è solo “è bello”."],
  ["Un pannello che senza transizione fa saltare il layout", "Evitare un cambio brusco", "Un elemento che compare di colpo sembra rotto."],
];

export function Purpose() {
  const [picks, setPicks] = useState(() => PURPOSE_ITEMS.map(() => PURPOSES[0]));
  const [checked, setChecked] = useState(false);
  const ok = PURPOSE_ITEMS.filter((it, i) => picks[i] === it[1]).length;
  return (
    <DemoCard title="Qual è lo scopo?" rule="Regola: ogni animazione deve rispondere a “perché si anima?”.">
      <div className="qz">
        {PURPOSE_ITEMS.map(([q, a, why], i) => {
          const good = picks[i] === a;
          return (
            <div className="qz-row" key={q}>
              <span>{q}</span>
              <select aria-label="Scopo" value={picks[i]} onChange={(e) => setPicks(picks.map((p, j) => (j === i ? e.target.value : p)))}>
                {PURPOSES.map((o) => <option key={o}>{o}</option>)}
              </select>
              <span className={`mk ${checked ? (good ? "ok" : "no") : ""}`}>{checked ? (good ? "✓" : "✗") : ""}</span>
              {checked && <span className="sol">{(good ? "" : `Risposta: ${a}. `) + why}</span>}
            </div>
          );
        })}
        <div className="btns">
          <button className="btn small primary" type="button" onClick={() => setChecked(true)}>Controlla</button>
          <span className="out">{checked ? `${ok}/${PURPOSE_ITEMS.length}` : ""}</span>
        </div>
      </div>
    </DemoCard>
  );
}

const CURVES: [string, number[], "x" | "m" | "v", string][] = [
  ["ease-in", [0.42, 0, 1, 1], "x", "parte lenta: il primo frame, quello che guardi, è fermo"],
  ["ease-out (CSS)", [0, 0, 0.58, 1], "m", "direzione giusta, ma debole"],
  ["ease-out forte", [0.23, 1, 0.32, 1], "v", "movimento subito, arrivo morbido"],
];

export function Easing() {
  const [open, setOpen] = useState(false);
  return (
    <DemoCard title="Stessa durata, tre curve" rule="Regola: mai ease-in sulla UI. Curve custom più forti di quelle CSS." note="Tutti e tre durano 300ms. Prova a 4×: guarda solo i primi 50ms.">
      <div className="btns" style={{ marginBottom: 12 }}>
        <button className="btn primary small" type="button" onClick={() => setOpen(!open)}>Apri / chiudi tutti</button>
      </div>
      <div className="ab">
        {CURVES.map(([name, c, k, why]) => {
          const cb = `cubic-bezier(${c.join(",")})`;
          return (
            <div className="p" key={name}>
              <span className="lab-l"><Dot k={k} /> {name} · 300ms</span>
              <Curve c={c} />
              <div className="drop">
                <PopMenu className={open ? "open" : ""} style={{ transition: `opacity 300ms ${cb}, transform 300ms ${cb}` }} />
              </div>
              <span className="out">{why}</span>
            </div>
          );
        })}
      </div>
    </DemoCard>
  );
}

const zone = (v: number) =>
  v < 100 ? "troppo veloce per vederlo" : v <= 160 ? "range: feedback di pressione" : v <= 250 ? "range dropdown ✓" : v <= 300 ? "al limite della UI" : v <= 500 ? "da modal/drawer, lento per un menu" : "marketing, non UI";

export function Duration() {
  const [ms, setMs] = useState(400);
  const [open, setOpen] = useState(false);
  return (
    <DemoCard title="Quanto deve durare un dropdown?" rule="Regola: dropdown 150–250ms. UI sotto i 300ms." note="Parti da 400ms e scendi finché smetti di “aspettare” il menu.">
      <div className="ctl">
        <label>Durata <input type="range" min={60} max={800} step={10} value={ms} onChange={(e) => setMs(+e.target.value)} /></label>
        <span className="out">{ms}ms · {zone(ms)}</span>
        <button className="btn small primary" type="button" onClick={() => setOpen(!open)}>Apri / chiudi</button>
      </div>
      <div className="drop">
        <PopMenu className={open ? "open" : ""} style={{ transition: `opacity ${ms}ms ${EO}, transform ${ms}ms ${EO}` }} />
      </div>
    </DemoCard>
  );
}

export function Spinner() {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const timer = useRef(0);
  const start = () => {
    clearTimeout(timer.current);
    setState("busy");
    timer.current = window.setTimeout(() => setState("done"), 3000 * slowFactor());
  };
  const out = state === "idle" ? "–" : state === "busy" ? "carico…" : "pronto, 3 s esatti";
  return (
    <DemoCard title="Due spinner, stesso tempo di attesa" rule="Regola: uno spinner più veloce fa sembrare il caricamento più breve.">
      <div className="btns" style={{ marginBottom: 12 }}>
        <button className="btn primary small" type="button" onClick={start}>Simula caricamento (3 s)</button>
      </div>
      <div className="ab">
        {[["A · 1,4 s per giro", "1.4s"], ["B · 0,55 s per giro", ".55s"]].map(([lab, d]) => (
          <div className="p" key={lab}>
            <span className="lab-l">{lab}</span>
            <div className="spin" style={{ animationDuration: d, visibility: state === "busy" ? "visible" : "hidden" }} />
            <span className="out">{out}</span>
          </div>
        ))}
      </div>
    </DemoCard>
  );
}
