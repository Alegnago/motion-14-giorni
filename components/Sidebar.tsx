"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DAYS } from "@/lib/days";
import { useProgress } from "@/lib/progress";

export function Sidebar() {
  const path = usePathname();
  const { done } = useProgress();
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
      <div className="dayl">
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
