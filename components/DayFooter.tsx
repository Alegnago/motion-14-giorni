"use client";
import Link from "next/link";
import { animate, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { useProgress, writeProgress } from "@/lib/progress";

export function DayFooter({ n, next }: { n: number; next?: { n: number; title: string } }) {
  const p = useProgress();
  const key = "d" + n;
  const done = !!p.done[key];
  const reduce = useReducedMotion();
  const btn = useRef<HTMLButtonElement>(null);
  const [saved, setSaved] = useState(false);

  const toggle = () => {
    writeProgress({ ...p, done: { ...p.done, [key]: !done } });
    // momento raro (14 volte in tutto): qui il rimbalzo è permesso
    if (!done && !reduce && btn.current) {
      animate(btn.current, { transform: ["scale(0.94)", "scale(1)"] }, { type: "spring", bounce: 0.2, duration: 0.45 });
    }
  };

  return (
    <section className="sec notes" id="sec-notes">
      <h2>Note</h2>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <label htmlFor="notes-ta" className="out">
          Cosa hai capito, dubbi, interazioni trovate.
        </label>
        <span className={`saved${saved ? " on" : ""}`} aria-live="polite">
          {saved ? "Salvato in questo browser" : ""}
        </span>
      </div>
      <textarea
        id="notes-ta"
        value={p.notes[key] || ""}
        onChange={(e) => {
          writeProgress({ ...p, notes: { ...p.notes, [key]: e.target.value } });
          setSaved(true);
        }}
      />
      <div className="endbar">
        <button ref={btn} type="button" className={`btn${done ? "" : " primary"}`} onClick={toggle}>
          {done ? "Fatto ✓ (annulla)" : "Segna il giorno come fatto"}
        </button>
        {next && (
          <Link className="btn" href={`/giorno/${next.n}`}>
            Giorno {next.n}: {next.title} →
          </Link>
        )}
      </div>
    </section>
  );
}
