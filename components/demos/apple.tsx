"use client";
// Giorno 9: percorsi simmetrici, materiali, tipografia.
import { useRef, useState, type ReactNode } from "react";
import { DemoCard, Dot, ED } from "./kit";

function Panel({ label, exitDown }: { label: ReactNode; exitDown: boolean }) {
  const [open, setOpen] = useState(false);
  const pn = useRef<HTMLDivElement>(null);
  const toggle = () => {
    const p = pn.current!;
    if (!open) {
      // A rientra sempre da destra, anche se era uscito in basso: riposizionalo senza transizione
      if (exitDown) { p.style.transition = "none"; p.style.transform = "translateX(110%)"; void p.offsetWidth; }
      p.style.transition = `transform 380ms ${ED}`;
      p.style.transform = "none";
    } else p.style.transform = exitDown ? "translateY(120%)" : "translateX(110%)";
    setOpen(!open);
  };
  return (
    <div className="p">
      <span className="lab-l">{label}</span>
      <button className="btn small" type="button" onClick={toggle}>Apri / chiudi</button>
      <div className="stage"><div className="panel" ref={pn}>Dettagli</div></div>
    </div>
  );
}

export function Symmetric() {
  return (
    <DemoCard title="Da dove esce?" rule="Regola: se sparisce in un modo, deve tornare da lì.">
      <div className="ab">
        <Panel label={<><Dot k="x" /> entra da destra, esce in basso</>} exitDown />
        <Panel label={<><Dot k="v" /> entra ed esce da destra</>} exitDown={false} />
      </div>
    </DemoCard>
  );
}

const Tiles = () => (
  <div className="tiles">
    {["t1", "t2", "t3", "t1", "t2"].map((t, i) => <div key={i} className={t} />)}
  </div>
);

export function Material() {
  return (
    <DemoCard title="Barra opaca o materiale" rule="Regola: barre come layer traslucidi, col contenuto che scorre sotto." note="Scorri dentro i due riquadri. Se hai attivato “riduci trasparenza” nel sistema, B diventa solida: è voluto.">
      <div className="ab">
        <div className="p"><span className="lab-l">opaca, bordo pieno</span><div className="mat"><div className="bar op">Libreria</div><Tiles /></div></div>
        <div className="p"><span className="lab-l">materiale traslucido</span><div className="mat"><div className="bar gl">Libreria</div><Tiles /></div></div>
      </div>
    </DemoCard>
  );
}

export function Tracking() {
  const [size, setSize] = useState(48);
  const [track, setTrack] = useState(0.05);
  const [apple, setApple] = useState(false);
  // regola Apple: da 14px a 48px il tracking scende da +0.01em a −0.025em e il leading da 1.5 a 1.05
  const k = Math.min(1, Math.max(0, (size - 14) / (48 - 14)));
  const tk = apple ? +(0.01 + (-0.025 - 0.01) * k).toFixed(3) : track;
  const lh = apple ? +(1.5 + (1.05 - 1.5) * k).toFixed(2) : 1.4;
  return (
    <DemoCard title="Tracking per dimensione" rule="Regola: titoli grandi con tracking negativo e leading stretto; testo piccolo vicino a 0.">
      <div className="ctl">
        <label>dimensione <input type="range" min={12} max={72} value={size} onChange={(e) => setSize(+e.target.value)} /></label>
        <label>tracking <input type="range" min={-0.06} max={0.08} step={0.005} value={tk} disabled={apple} onChange={(e) => setTrack(+e.target.value)} /></label>
        <label><input type="checkbox" checked={apple} onChange={(e) => setApple(e.target.checked)} /> regola Apple</label>
      </div>
      <p className="trk-h" style={{ fontSize: size, letterSpacing: `${tk}em`, lineHeight: lh }}>Ascolta ovunque</p>
      <p className="out">{size}px · letter-spacing {tk}em · line-height {lh}</p>
    </DemoCard>
  );
}
