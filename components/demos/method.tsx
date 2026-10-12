"use client";
// Giorni 10–13: la sequenza di animate, main thread, reduced motion, hover, review.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { play, slowFactor } from "../SlowMo";
import { DemoCard, Dot, ED, useMedia, useRM } from "./kit";

const STEPS = ["Deve animarsi?", "Scopo", "Strumento", "Proprietà", "Curva e durata", "Interruzione e uscita", "Reduced motion e hover"];
const CASES: Record<string, string[]> = {
  "Command palette (⌘K)": ["100+ volte al giorno, da tastiera. Nessuna animazione: ti fermi qui."],
  "Dropdown menu": ["Decine di volte/occasionale: animazione breve.", "Coerenza spaziale: esce dal trigger.", "CSS transition (o data-starting-style di Base UI).", "opacity + transform: scale(0.95 → 1), transform-origin sul trigger.", "var(--ease-out), 200ms (range 150–250).", "Transition, quindi si ritargetta. Esce per la stessa via.", "Reduced: solo opacity. Hover delle voci dentro (hover: hover) and (pointer: fine)."],
  Toast: ["Occasionale: animazione standard.", "Coerenza spaziale: entra ed esce dal basso; evita la comparsa brusca.", "CSS transition + @starting-style (fallback data-mounted).", "transform: translateY(100%) + opacity.", "ease, 400ms: eccezione motivata dalla personalità del componente (Sonner).", "Transition, mai keyframes: arrivano a raffica. Swipe con chiusura per velocità.", "Reduced: fade senza traslazione."],
  "Celebrazione onboarding": ["Rara, prima volta: qui vive il budget di delight.", "Delight (permesso solo a questo livello).", "Motion (spring) o WAAPI.", "transform e opacity; stagger 30–80ms.", "Spring con bounce 0.2–0.3.", "Non blocca mai l'interazione mentre gira.", "Reduced: niente movimento, resta un fade."],
  "Hover su riga di tabella": ["Decine di volte al giorno: quasi impercettibile o niente.", "Indicazione di stato (quale riga stai per aprire).", "CSS transition.", "Solo background-color.", "ease, circa 100–150ms, oppure nessuna transizione.", "Transition: segue il mouse senza ripartire.", "Dentro (hover: hover) and (pointer: fine)."],
  "Bottom sheet mobile con drag": ["Occasionale: standard, ma guidato dal dito.", "Coerenza spaziale + manipolazione diretta.", "Componente pronto (Vaul) via pick-ui-library, oppure Motion.", "transform: translateY(%) scritto direttamente sull'elemento, niente CSS variable.", "Apertura: var(--ease-drawer) 500ms. Dopo un drag: spring che eredita la velocità.", "Chiusura per velocità (0.11 px/ms), rubber-band verso l'alto, pointer capture.", "Reduced: dissolvenza al posto della slide."],
};

export function Wizard() {
  const rm = useRM();
  const [kase, setKase] = useState(Object.keys(CASES)[0]);
  const [shown, setShown] = useState(0);
  const prev = useRef(0);
  const wz = useRef<HTMLDivElement>(null);
  const a = CASES[kase];
  // il passo appena rivelato passa da sfocato a nitido invece di cambiare di colpo
  useLayoutEffect(() => {
    const spans = [...wz.current!.querySelectorAll(".wz-s > div > span")];
    spans.slice(prev.current, shown).forEach((sp, j) =>
      play(sp, rm ? [{ opacity: 0.4 }, { opacity: 1 }] : [{ filter: "blur(5px)", opacity: 0.4 }, { filter: "blur(0)", opacity: 1 }], { duration: 200, easing: "ease", delay: j * 40, fill: "backwards" }),
    );
    prev.current = shown;
  }, [shown, kase, rm]);
  return (
    <DemoCard title="La sequenza, caso per caso" rule="Prova a rispondere tu a ogni passo, poi rivela.">
      <div className="ctl">
        <label>Caso{" "}
          <select className="appsel" value={kase} onChange={(e) => { prev.current = 0; setShown(0); setKase(e.target.value); }}>
            {Object.keys(CASES).map((k) => <option key={k}>{k}</option>)}
          </select>
        </label>
      </div>
      <div className="wz" ref={wz}>
        {STEPS.map((s, i) => {
          const hid = i >= shown, stop = a.length === 1 && i === 0;
          const txt = a[i] || (a.length === 1 ? "—" : "");
          return (
            <div key={s} className={`wz-s ${stop && !hid ? "stop" : ""} ${hid ? "hid" : ""}`}>
              <span className="n">{i + 1}</span>
              <div><b>{s}</b><span>{hid ? "Pensaci prima di rivelare." : txt}</span></div>
            </div>
          );
        })}
      </div>
      <div className="btns" style={{ marginTop: 10 }}>
        <button className="btn small primary" type="button" onClick={() => setShown(Math.min(7, shown + 1))}>Rivela il passo successivo</button>
        <button className="btn small" type="button" onClick={() => setShown(7)}>Mostra tutto</button>
      </div>
    </DemoCard>
  );
}

export function Busy() {
  const rm = useRM();
  const [toggled, setToggled] = useState<boolean | null>(null);
  const playing = toggled ?? !rm;
  const [out, setOut] = useState("–");
  const track = useRef<HTMLDivElement>(null);
  const ball = useRef<HTMLDivElement>(null);
  const tf = useRef<HTMLDivElement>(null);
  const t = useRef(0);

  // il loop rAF gira solo mentre la demo è in riproduzione: in pausa non occupa il main thread
  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      t.current += (now - last) / 1000 / slowFactor();
      last = now;
      const W = Math.max(0, track.current!.clientWidth - 34);
      const k = (Math.sin((t.current * Math.PI) / 1.6 - Math.PI / 2) + 1) / 2;
      ball.current!.style.left = 5 + k * W + "px";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => {
    const setW = () => tf.current!.style.setProperty("--w", Math.max(0, track.current!.clientWidth - 34) + "px");
    setW();
    const ro = new ResizeObserver(setW);
    ro.observe(track.current!);
    return () => ro.disconnect();
  }, []);

  const block = () => {
    setOut("bloccato…");
    setTimeout(() => {
      const end = performance.now() + 1500;
      while (performance.now() < end) { /* main thread occupato apposta */ }
      setOut("sbloccato. Chi si è fermato?");
    }, 60);
  };
  return (
    <DemoCard title="Quando il main thread è occupato" rule="Regola: CSS e WAAPI su transform girano fuori dal main thread. Un loop rAF no." note="Durante il blocco i primi due si fermano. Il verde continua: è sul compositor. Succede così durante caricamenti e hydration.">
      <div className={playing ? "playing" : ""}>
        <div className="busy-r"><span className="lab-l"><Dot k="x" /> JS + rAF (left)</span><div className="track" ref={track}><div className="ball" ref={ball} style={{ background: "var(--bad)" }} /></div></div>
        <div className="busy-r"><span className="lab-l"><Dot k="m" /> CSS su left</span><div className="track"><div className="mv-left" /></div></div>
        <div className="busy-r"><span className="lab-l"><Dot k="v" /> CSS su transform</span><div className="track"><div className="mv-tf" ref={tf} /></div></div>
        <div className="ctl" style={{ marginTop: 12 }}>
          <button className="btn small" type="button" onClick={() => setToggled(!playing)}>Avvia / ferma</button>
          <button className="btn primary small" type="button" onClick={block}>Blocca il main thread 1,5 s</button>
          <span className="out">{out}</span>
        </div>
      </div>
    </DemoCard>
  );
}

export function Reduced() {
  const rm = useRM();
  const [sim, setSim] = useState<boolean | null>(null);
  const r = sim ?? rm;
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(true);
  const style = {
    transition: instant ? "none" : r ? "opacity 200ms ease" : `transform 380ms ${ED}`,
    transform: r || open ? "none" : "translateX(110%)",
    opacity: r ? (open ? 1 : 0) : 1,
  };
  return (
    <DemoCard title="Reduced motion: meno, non zero" rule="Regola: via movimento e posizione, resta l'opacità che aiuta a capire.">
      <div className="ctl">
        <label><input type="checkbox" checked={r} onChange={(e) => { setInstant(true); setSim(e.target.checked); }} /> simula reduced motion</label>
        <span className="out">Il tuo sistema: {rm ? "reduce" : "no-preference"}</span>
        <button className="btn small primary" type="button" onClick={() => { setInstant(false); setOpen(!open); }}>Apri / chiudi</button>
      </div>
      <div className="stage"><div className="panel" style={style}>Pannello laterale</div></div>
    </DemoCard>
  );
}

export function Hover() {
  const fine = useMedia("(hover: hover) and (pointer: fine)");
  return (
    <DemoCard title="Hover appiccicoso" rule="Regola: @media (hover: hover) and (pointer: fine) attorno agli hover animati." note="Da telefono: tocca A e poi lo sfondo. A resta sollevata. B no.">
      <p className="out" style={{ margin: "0 0 10px" }}>
        Questo dispositivo: (hover: hover) and (pointer: fine) = {fine ? "vero, hai un mouse" : "falso, schermo touch"}
      </p>
      <div className="ab">
        <div className="p"><span className="lab-l"><Dot k="x" /> :hover senza media query</span><div className="hc hc-a" tabIndex={0}>Tocca o passa sopra</div></div>
        <div className="p"><span className="lab-l"><Dot k="v" /> :hover protetto</span><div className="hc hc-b" tabIndex={0}>Tocca o passa sopra</div></div>
      </div>
    </DemoCard>
  );
}

type Verdict = "Approva" | "Finding" | "Blocca";
const SPOT: [string, Verdict, string, string, string][] = [
  [".dropdown {\n  transition: all 300ms ease-in;\n}", "Blocca", "transition: all 300ms ease-in", "transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out)", "`all` anima anche quello che non volevi; ease-in sulla UI è un blocco automatico."],
  [".popover[data-starting-style] {\n  opacity: 0;\n  transform: scale(0);\n}", "Blocca", "transform: scale(0)", "transform: scale(0.95)", "Nulla nasce dal nulla: scale(0) è nella lista dei blocchi."],
  ["// Command palette, si apre con ⌘K\n<motion.div\n  initial={{ opacity: 0, y: 8 }}\n  animate={{ opacity: 1, y: 0 }}\n/>", "Blocca", "animazione di apertura", "nessuna animazione", "Azione da tastiera, 100+ volte al giorno: si apre e basta."],
  [".toast {\n  animation: slideUp 400ms ease;\n}", "Finding", "keyframes sul toast", "transition: transform 400ms ease, opacity 400ms ease + @starting-style", "I toast arrivano a raffica: i keyframes ripartono da zero, le transition si ritargettano."],
  [".button { transition: transform 160ms var(--ease-out); }\n.button:active { transform: scale(0.97); }", "Approva", "—", "—", "Proprietà esplicita, durata da pressione, curva forte, scala nel range."],
  [".card { transition: transform 200ms var(--ease-out); }\n.card:hover { transform: translateY(-4px); }", "Finding", ".card:hover non protetto", "@media (hover: hover) and (pointer: fine) { .card:hover { … } }", "Su touch il tap attiva l'hover e resta appiccicato."],
  [".drawer { height: 0; transition: height 500ms ease; }\n.drawer.open { height: 420px; }", "Blocca", "animazione di height", "transform: translateY(100%) → translateY(0), 500ms var(--ease-drawer)", "Proprietà di layout facile da sostituire: non-GPU e correggibile, quindi blocco."],
  [".hold .overlay { transition: clip-path 2s linear; }\n.hold:active .overlay { clip-path: inset(0); }", "Finding", "stessa durata in pressione e rilascio", "rilascio: clip-path 200ms var(--ease-out); pressione: 2s linear", "Tempi simmetrici su pressione e rilascio: il rilascio deve essere scattante."],
  ["// indicatore tab durante il cambio pagina\n<motion.div animate={{ x: offset }} />", "Finding", "animate={{ x }}", "animate={{ transform: `translateX(${offset}px)` }} oppure CSS", "Gli shorthand x/y girano sul main thread: durante la navigazione perdono frame (caso Vercel)."],
  [".modal {\n  transform-origin: var(--transform-origin);\n}", "Finding", "origin dal trigger sul modal", "transform-origin: center", "Il modal non è ancorato a un trigger: resta centrato."],
  [".menu-item {\n  transition: background-color 150ms ease;\n}", "Approva", "—", "—", "Cambio di colore: ease va bene, breve, nessun movimento."],
  ["/* lista di 40 righe vista tutto il giorno */\n.row {\n  animation: fadeIn 300ms var(--ease-out) backwards;\n  animation-delay: calc(var(--i) * 120ms);\n}", "Finding", "stagger da 120ms su 40 righe", "nessuno stagger (o 30–80ms solo su ingressi occasionali)", "L'ultima riga arriva dopo quasi 5 secondi, e la lista si vede di continuo."],
];

function SpotItem({ it, pick, onPick }: { it: (typeof SPOT)[number]; pick?: Verdict; onPick: (v: Verdict) => void }) {
  const [code, verdict, before, after, why] = it;
  const [open, setOpen] = useState(false);
  return (
    <div className="sp-i">
      <pre>{code}</pre>
      <div className="ctl" style={{ margin: 0 }}>
        <span className="seg" role="group" aria-label="Verdetto">
          {(["Approva", "Finding", "Blocca"] as Verdict[]).map((v) => (
            <button key={v} type="button" aria-pressed={pick === v} onClick={() => onPick(v)}>{v}</button>
          ))}
        </span>
        <button className="btn small" type="button" onClick={() => setOpen(!open)}>Soluzione</button>
      </div>
      <div className="sp-ans" hidden={!open}>
        <span className={`verdict ${verdict}`}>{verdict}</span>
        {pick && (pick === verdict ? " · hai indovinato" : ` · tu: ${pick}`)}
        {before === "—" ? (
          <p style={{ margin: "6px 0 0" }}>{why}</p>
        ) : (
          <div className="tw">
            <table>
              <thead><tr><th>Before</th><th>After</th><th>Why</th></tr></thead>
              <tbody><tr><td><code>{before}</code></td><td><code>{after}</code></td><td>{why}</td></tr></tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function Spot() {
  const [picks, setPicks] = useState<(Verdict | undefined)[]>([]);
  const tot = picks.filter(Boolean).length;
  const ok = picks.filter((p, i) => p && p === SPOT[i][1]).length;
  return (
    <DemoCard title="Fai la review" rule="Per ogni snippet: Approva, Finding o Blocca. Poi guarda la soluzione nel formato Before | After | Why." note="I verdetti seguono i criteri di blocco di review-animations: regressione del feel, tastiera/alta frequenza, scale(0) o ease-in, animazione non-GPU facile da correggere.">
      <div className="spot">
        {SPOT.map((it, i) => (
          <SpotItem key={i} it={it} pick={picks[i]} onPick={(v) => setPicks((p) => { const n = [...p]; n[i] = v; return n; })} />
        ))}
        <p className="out">{tot ? `${ok} giusti su ${tot} risposte` : ""}</p>
      </div>
    </DemoCard>
  );
}
