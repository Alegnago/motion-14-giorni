"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DAYS } from "@/lib/days";
import { useProgress } from "@/lib/progress";

export function Sidebar() {
  const path = usePathname();
  const { done } = useProgress();
  const list = useRef<HTMLDivElement>(null);
  const [clip, setClip] = useState<{ ring: string; fill: string } | null>(null);
  const [ready, setReady] = useState(false);

  // Indicatore del giorno attivo: due layer (bordo e fondo) ritagliati con clip-path sulla riga corrente.
  // Solo CSS: si muove durante il cambio pagina, quando il main thread è occupato (caso Vercel).
  useLayoutEffect(() => {
    const l = list.current;
    const el = l?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!l || !el) return setClip(null);
    const measure = () => {
      const t = el.offsetTop, b = l.clientHeight - (t + el.offsetHeight);
      const L = el.offsetLeft, R = l.clientWidth - (L + el.offsetWidth);
      setClip({ ring: `inset(${t}px ${R}px ${b}px ${L}px round 9px)`, fill: `inset(${t + 1}px ${R + 1}px ${b + 1}px ${L + 1}px round 8px)` });
    };
    measure();
    // su telefono i giorni sono una striscia orizzontale: il giorno attivo deve restare visibile
    if (matchMedia("(max-width: 860px)").matches) el.scrollIntoView({ inline: "nearest", block: "nearest" });
    const ro = new ResizeObserver(measure);
    ro.observe(l);
    return () => ro.disconnect();
  }, [path]);

  // la prima misura avviene senza transizione
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(id);
  }, []);

  const item = (href: string, n: string, t: string, isDone = false, dot = true) => {
    const cur = path === href || (href !== "/" && path.startsWith(href + "/"));
    return (
      <Link key={href} href={href} className={`dayb${isDone ? " done" : ""}`} aria-current={cur ? "page" : undefined}>
        <span className="n">{n}</span>
        <span className="t">{t}</span>
        {dot ? <span className="c" aria-hidden="true" /> : <span />}
      </Link>
    );
  };
  return (
    <nav className="side" aria-label="Giorni">
      <div className="dayl" ref={list} data-ind={clip ? "" : undefined} data-ready={ready || undefined}>
        <span className="dayi dayi-ring" aria-hidden="true" style={{ clipPath: clip?.ring }} />
        <span className="dayi dayi-fill" aria-hidden="true" style={{ clipPath: clip?.fill }} />
        {item("/", "00", "Come funziona", false, false)}
        {DAYS.map((d, i) => item(`/giorno/${i + 1}`, String(i + 1).padStart(2, "0"), d.title, !!done["d" + (i + 1)]))}
        {item("/skill", "+", "Tutte le skill", false, false)}
      </div>
      <p className="sync">Progressi e note salvati in questo browser.</p>
    </nav>
  );
}

export function ProgressCount() {
  const { done } = useProgress();
  const n = Object.values(done).filter(Boolean).length;
  return <span className="prog">{n}/14 giorni</span>;
}
