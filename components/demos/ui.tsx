"use client";
// Giorni 5, 6 e 10: bottoni, popover, tooltip, toast, crossfade, drawer, modal, accordion.
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { play, slowFactor } from "../SlowMo";
import { DemoCard, Dot, ED, EO, PopMenu, useClientValue, useRM } from "./kit";

export function Press() {
  return (
    <DemoCard title="Il bottone ti ha sentito?" rule="Regola: transform: scale(0.97) su :active." note="Tieni premuto. B si abbassa: scala anche testo e icone, ed è quello che lo rende fisico.">
      <div className="ab">
        <div className="p"><span className="lab-l"><Dot k="x" /> nessun feedback</span><button className="btn primary nopress" type="button">Salva modifiche</button></div>
        <div className="p"><span className="lab-l"><Dot k="v" /> scale(0.97) · 160ms ease-out</span><button className="btn primary" type="button">Salva modifiche</button></div>
      </div>
    </DemoCard>
  );
}

function MenuCol({ label, origin, from, ms }: { label: ReactNode; origin: string; from: number; ms: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="p">
      <span className="lab-l">{label}</span>
      <button className="btn small" type="button" onClick={() => setOpen(!open)}>Menu ▾</button>
      <div className="drop" style={{ height: 110 }}>
        <PopMenu style={{ transformOrigin: origin, opacity: open ? 1 : 0, transform: `scale(${open ? 1 : from})`, transition: `opacity ${ms}ms ${EO}, transform ${ms}ms ${EO}` }} />
      </div>
    </div>
  );
}

export function Scale0() {
  return (
    <DemoCard title="Da dove nasce un menu" rule="Regola: mai da scale(0). Parti da 0.9–0.97 con opacity 0." note="A esce “dal nulla”. B ha già una forma, come un palloncino sgonfio.">
      <div className="ab">
        <MenuCol label={<><Dot k="x" /> da scale(0)</>} origin="top left" from={0} ms={200} />
        <MenuCol label={<><Dot k="v" /> da scale(0.95) + opacity</>} origin="top left" from={0.95} ms={200} />
      </div>
    </DemoCard>
  );
}

export function Origin() {
  return (
    <DemoCard title="Popover che esce dal bottone" rule="Regola: popover dal trigger. Eccezione: i modal restano centrati." note="La scala qui è esagerata (0.88) per vederlo. Nel lavoro vero 0.95 basta.">
      <div className="ab">
        <MenuCol label={<><Dot k="x" /> transform-origin: center</>} origin="center" from={0.88} ms={220} />
        <MenuCol label={<><Dot k="v" /> origin sul trigger (top left)</>} origin="top left" from={0.88} ms={220} />
      </div>
    </DemoCard>
  );
}

const TOOLS = ["Grassetto", "Corsivo", "Sottolineato", "Barrato", "Annulla"];
const GLYPHS = "BIUS↺";

function ToolBar({ instant }: { instant: boolean }) {
  const [on, setOn] = useState<{ i: number; instant: boolean } | null>(null);
  const timer = useRef(0), cool = useRef(0), warm = useRef(false);
  const show = (i: number) => {
    clearTimeout(timer.current); clearTimeout(cool.current);
    if (instant && warm.current) setOn({ i, instant: true });
    else timer.current = window.setTimeout(() => { setOn({ i, instant: false }); warm.current = true; }, 500);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOn(null);
    cool.current = window.setTimeout(() => { warm.current = false; }, 400);
  };
  return (
    <div className="tt-bar">
      {TOOLS.map((n, i) => (
        <button key={n} className="tt-btn" type="button" aria-label={n} onPointerEnter={() => show(i)} onPointerLeave={hide} onFocus={() => show(i)} onBlur={hide}>
          {GLYPHS[i]}
          <span className={`tt ${on?.i === i ? "on" : ""} ${on?.i === i && on.instant ? "instant" : ""}`} aria-hidden="true">{n}</span>
        </button>
      ))}
    </div>
  );
}

export function Tooltips() {
  return (
    <DemoCard title="Tooltip in una toolbar" rule="Regola: ritardo iniziale, poi i vicini si aprono subito e senza animazione." note="Scorri col mouse lungo la barra (o usa Tab). Su touch non c'è hover: questa demo è da desktop.">
      <div className="ab">
        <div className="p"><span className="lab-l"><Dot k="x" /> ritardo + animazione ogni volta</span><ToolBar instant={false} /></div>
        <div className="p"><span className="lab-l"><Dot k="v" /> dopo il primo: istantanei</span><ToolBar instant /></div>
      </div>
    </DemoCard>
  );
}

const slot = (i: number) => `translateY(${-i * 12}px) scale(${(1 - i * 0.05).toFixed(2)})`;

function ToastCol({ label, mode }: { label: ReactNode; mode: "k" | "t" }) {
  const [ids, setIds] = useState<number[]>([]);
  const nodes = useRef(new Map<number, HTMLDivElement>());
  const seen = useRef(new Set<number>());
  const anims = useRef(new Map<number, Animation>());
  const n = useRef(0);
  // posizioni scritte a mano dopo il render: è proprio la differenza tra keyframes e transition
  useLayoutEffect(() => {
    ids.forEach((id, i) => {
      const t = nodes.current.get(id);
      if (!t) return;
      t.style.zIndex = String(10 - i);
      const fresh = !seen.current.has(id);
      seen.current.add(id);
      if (mode === "t") {
        if (fresh) { t.style.transform = "translateY(100%)"; t.style.opacity = "0"; void t.offsetHeight; }
        t.style.transform = slot(i);
        t.style.opacity = i > 2 ? "0" : "1";
      } else {
        const from = fresh ? { transform: "translateY(100%)", opacity: 0 } : { transform: slot(i - 1), opacity: 1 };
        anims.current.get(id)?.cancel();
        anims.current.set(id, play(t, [from, { transform: slot(i), opacity: i > 2 ? 0 : 1 }], { duration: 400, easing: "ease", fill: "forwards" }));
      }
    });
  }, [ids, mode]);
  const add = () => setIds((l) => [++n.current, ...l].slice(0, 4));
  return (
    <div className="p">
      <span className="lab-l">{label}</span>
      <button className="btn small" type="button" onClick={add}>Aggiungi toast</button>
      <div className="ts-area">
        {ids.map((id) => (
          <div key={id} className={`ts ${mode === "t" ? "ts-tr" : ""}`} ref={(el) => { if (el) nodes.current.set(id, el); else nodes.current.delete(id); }}>
            Evento {id} salvato
          </div>
        ))}
      </div>
    </div>
  );
}

export function Toast() {
  return (
    <DemoCard title="Toast aggiunti a raffica" rule="Regola: transition per tutto ciò che si attiva velocemente. I keyframes ripartono da zero." note="Clicca 5 volte velocemente su entrambi. A 2× le differenze si vedono meglio.">
      <div className="ab">
        <ToastCol label={<><Dot k="x" /> keyframes</>} mode="k" />
        <ToastCol label={<><Dot k="v" /> transition (come Sonner)</>} mode="t" />
      </div>
    </DemoCard>
  );
}

function Crossfade({ blur }: { blur: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <button className={`xf ${blur ? "blur" : ""}`} type="button" onClick={() => setDone(!done)}>
      <span className={done ? "off" : ""}>Copia link</span>
      <span className={done ? "" : "off"}>Copiato ✓</span>
    </button>
  );
}

export function Blur() {
  return (
    <DemoCard title="Crossfade di un'etichetta" rule="Regola: se un crossfade non si assesta, aggiungi un blur leggero." note="Guardalo a 4×. In A vedi due scritte sovrapposte, in B una sola cosa che si trasforma.">
      <div className="ab">
        <div className="p"><span className="lab-l"><Dot k="m" /> solo opacity</span><Crossfade blur={false} /></div>
        <div className="p"><span className="lab-l"><Dot k="v" /> opacity + blur(2px) + press</span><Crossfade blur /></div>
      </div>
    </DemoCard>
  );
}

export function Starting() {
  const [toasts, setToasts] = useState<{ id: number; out: boolean }[]>([]);
  const n = useRef(0);
  const ok = useClientValue(() => "CSSStartingStyleRule" in window, true);
  const show = () => {
    const id = ++n.current, S = slowFactor();
    setToasts((l) => [...l, { id, out: false }]);
    setTimeout(() => {
      setToasts((l) => l.map((t) => (t.id === id ? { ...t, out: true } : t)));
      setTimeout(() => setToasts((l) => l.filter((t) => t.id !== id)), 450 * S);
    }, 1600 * S);
  };
  return (
    <DemoCard title="@starting-style: entrata senza JS" rule="Regola: sostituisce il pattern useEffect → mounted." note="Il CSS di questo toast è identico all'esempio nella skill: opacity e translateY(100%) dentro @starting-style.">
      <div className="ctl">
        <button className="btn small primary" type="button" onClick={show}>Mostra toast</button>
        <span className="out">
          Il tuo browser {ok ? "supporta @starting-style ✓" : "non supporta @starting-style: il toast appare senza animazione"}
        </span>
      </div>
      <div className="ss-area">
        {toasts.map((t) => <div key={t.id} className={`ss-toast ${t.out ? "out" : ""}`}>Nuovo messaggio da Giulia</div>)}
      </div>
    </DemoCard>
  );
}

export function Pct() {
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);
  const col = (label: ReactNode, closed: string) => (
    <div className="p">
      <span className="lab-l">{label}</span>
      <div className="phone">
        <div className="drawer" style={{ transform: open ? "translateY(0)" : closed, transition: `transform 500ms ${ED}` }}>
          <div className="handle" />
          <p><b>Impostazioni rapide</b></p>
          <div className="more" hidden={!long}>
            {["Wi-Fi", "Bluetooth", "Hotspot", "Luminosità", "Non disturbare"].map((x) => <p key={x}>{x}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <DemoCard title="Nascondere un drawer di altezza variabile" rule="Regola: translateY(100%) si muove della propria altezza, qualunque sia." note="Attiva “contenuto lungo” con i drawer chiusi: A spunta fuori dal fondo.">
      <div className="ctl">
        <button className="btn small primary" type="button" onClick={() => setOpen(!open)}>Apri / chiudi</button>
        <label><input type="checkbox" checked={long} onChange={(e) => setLong(e.target.checked)} /> contenuto lungo</label>
      </div>
      <div className="ab">
        {col(<><Dot k="x" /> translateY(120px)</>, "translateY(120px)")}
        {col(<><Dot k="v" /> translateY(100%)</>, "translateY(100%)")}
      </div>
    </DemoCard>
  );
}

export function Orbit() {
  const rm = useRM();
  const [toggled, setToggled] = useState<boolean | null>(null);
  const playing = toggled ?? !rm;
  return (
    <DemoCard title="Orbita 3D solo con CSS" rule="Regola: rotateY + translateZ + preserve-3d per profondità vera." note="Sono gli stessi keyframes della skill. Il pallino passa dietro e davanti: è 3D, non un'ellisse.">
      <div className={`orbit ${playing ? "playing" : ""}`}><div className="center" /><div className="moon" /></div>
      <div className="btns" style={{ marginTop: 10 }}>
        <button className="btn small" type="button" onClick={() => setToggled(!playing)}>Avvia / ferma</button>
      </div>
    </DemoCard>
  );
}

export function ModalRecipe() {
  const [open, setOpen] = useState(false);
  const t = `opacity 250ms ${EO}, transform 250ms ${EO}`;
  return (
    <DemoCard title="Ricetta: modal" rule="opacity + scale(0.96), 250ms ease-out, origin al centro, backdrop insieme.">
      <button className="btn small primary" type="button" onClick={() => setOpen(true)}>Apri modal</button>
      <div className="stage" style={{ height: 200, marginTop: 10 }}>
        <div onClick={() => setOpen(false)} style={{ position: "absolute", inset: 0, background: "rgb(0 0 0 / .35)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: `opacity 250ms ${EO}` }} />
        <div
          role="dialog"
          aria-hidden={!open}
          style={{ position: "absolute", left: "50%", top: "50%", width: 210, margin: "-70px 0 0 -105px", padding: 14, borderRadius: 14, background: "var(--surface)", boxShadow: "var(--shadow)", opacity: open ? 1 : 0, transform: open ? "scale(1)" : "scale(.96)", transformOrigin: "center", pointerEvents: open ? "auto" : "none", transition: t }}
        >
          <b>Archiviare il ciclo?</b>
          <p style={{ margin: "6px 0 10px", color: "var(--muted)", fontSize: 13 }}>Le issue aperte passano al prossimo.</p>
          <button className="btn small" type="button" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>Chiudi</button>
        </div>
      </div>
    </DemoCard>
  );
}

const FAQ = [
  ["Cos'è un ciclo?", "Un periodo di lavoro di una o due settimane con le issue pianificate."],
  ["Posso spostare una issue?", "Sì: trascinala in un altro ciclo o usa il menu azioni."],
  ["Cosa succede alle issue aperte?", "A fine ciclo passano automaticamente al successivo."],
];

function AccItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  return (
    <>
      <button type="button" aria-expanded={open} onClick={() => { setH(body.current!.scrollHeight); setOpen(!open); }}>
        <span>{q}</span><span className="pl" aria-hidden="true">+</span>
      </button>
      <div ref={body} style={{ height: open ? h : 0, opacity: open ? 1 : 0 }}>
        <div className="in">{a}</div>
      </div>
    </>
  );
}

export function Accordion() {
  return (
    <DemoCard title="Ricetta: accordion" rule="height + opacity, 200ms ease-out, altezza misurata in JS. Una delle poche eccezioni a transform/opacity.">
      <div className="acc">{FAQ.map(([q, a]) => <AccItem key={q} q={q} a={a} />)}</div>
    </DemoCard>
  );
}
