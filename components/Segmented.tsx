"use client";
// Selettore a segmenti con indicatore che scorre.
// Ricetta "Tab indicator" della skill animate: una copia della lista in stile attivo,
// ritagliata con clip-path sull'opzione scelta. Testo e sfondo cambiano insieme,
// perché è un solo elemento che si rivela, non due colori che si interpolano.
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Option<T extends string> = { value: T; label: string };

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const [clip, setClip] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const index = options.findIndex((o) => o.value === value);

  // misura la posizione dell'opzione scelta (anche quando cambia la larghezza)
  useLayoutEffect(() => {
    const measure = () => {
      const w = wrap.current;
      const b = btns.current[index];
      if (!w || !b) return;
      const L = b.offsetLeft;
      const R = w.clientWidth - (b.offsetLeft + b.offsetWidth);
      setClip(`inset(2px ${R}px 2px ${L}px round 7px)`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [index]);

  // la prima misura avviene senza transizione: l'indicatore parte già al suo posto
  useEffect(() => {
    // setTimeout e non requestAnimationFrame: rAF non scatta nelle schede in background
    const id = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(id);
  }, []);

  return (
    <div ref={wrap} className={`segc segc-${size}`} role="radiogroup" aria-label={label} data-ready={ready || undefined}>
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            btns.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
      <div className="segc-copy" aria-hidden="true" style={{ clipPath: clip ?? "inset(50%)" }}>
        {options.map((o) => (
          <span key={o.value}>{o.label}</span>
        ))}
      </div>
    </div>
  );
}
