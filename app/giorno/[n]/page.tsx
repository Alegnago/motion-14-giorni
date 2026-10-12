import { notFound } from "next/navigation";
import { DAYS } from "@/lib/days";
import { readSkill, sliceMd, chunks } from "@/lib/skills";
import { renderMd } from "@/lib/markdown";
import { DayTransition } from "@/components/DayTransition";
import { ViewSwitch } from "@/components/ViewSwitch";
import { Demo } from "@/components/demos";
import { DayFooter } from "@/components/DayFooter";

export function generateStaticParams() {
  return DAYS.map((_, i) => ({ n: String(i + 1) }));
}

export async function generateMetadata(props: PageProps<"/giorno/[n]">) {
  const { n } = await props.params;
  const d = DAYS[Number(n) - 1];
  return { title: d ? `Giorno ${n}: ${d.title} · Motion in 14 giorni` : "Motion in 14 giorni" };
}

export default async function DayPage(props: PageProps<"/giorno/[n]">) {
  const { n: param } = await props.params;
  const n = Number(param);
  const d = DAYS[n - 1];
  if (!d) notFound();

  // Ogni demo va sotto la prima sezione il cui titolo inizia con il suo prefisso.
  const used = new Set<number>();
  const formatted: React.ReactNode[] = [];
  const raw: React.ReactNode[] = [];
  d.read.forEach((r, ri) => {
    const sl = sliceMd(readSkill(r.f), r.from, r.to);
    const src = (
      <p className="src" key={`s${ri}`}>
        <span>{r.f}</span>
        <span>
          righe {sl.a}–{sl.b}
        </span>
      </p>
    );
    formatted.push(src);
    raw.push(
      <div key={`r${ri}`}>
        {src}
        <pre className="raw">{sl.md}</pre>
      </div>,
    );
    chunks(sl.md).forEach((c, ci) => {
      formatted.push(<div className="md" key={`m${ri}-${ci}`} dangerouslySetInnerHTML={{ __html: renderMd(c.md) }} />);
      d.demos.forEach(([id, after], di) => {
        if (!used.has(di) && c.h && c.h.startsWith(after)) {
          used.add(di);
          formatted.push(<Demo key={`d${di}`} id={id} />);
        }
      });
    });
  });
  d.demos.forEach(([id], di) => {
    if (!used.has(di)) formatted.push(<Demo key={`d${di}`} id={id} />);
  });

  const files = [...new Set(d.read.map((r) => r.f.replace("skills/", "")))];
  const next = n < DAYS.length ? { n: n + 1, title: DAYS[n].title } : undefined;

  return (
    <DayTransition key={n} n={n}>
      <p className="eyebrow">
        Giorno {String(n).padStart(2, "0")} di 14 · {d.time}
      </p>
      <h1 className="dt">{d.title}</h1>
      <p className="goal">{d.goal}</p>
      <div className="files">
        {files.map((f) => (
          <span className="chip" key={f}>
            {f}
          </span>
        ))}
      </div>
      <p className="before">
        <b>Prima di leggere</b>
        {d.before}
      </p>

      <ViewSwitch
        title="Il testo di Emil"
        formatted={formatted}
        raw={raw}
        rawNote={d.demos.length ? `Le ${d.demos.length} demo live compaiono nella vista “Formattato + esempi”, accanto alla regola che mostrano.` : undefined}
      />

      <section className="sec" id="sec-lab">
        <h2>{d.lab ? "Laboratorio" : "Esercizio"}</h2>
        {d.task && <div className="task" dangerouslySetInnerHTML={{ __html: d.task }} />}
        {d.lab && (
          <div className="lab">
            <div className="lab-task">
              <b>Laboratorio.</b> In migrazione: per ora lo trovi nella versione Artifact.
              <div dangerouslySetInnerHTML={{ __html: d.labTask || "" }} />
            </div>
          </div>
        )}
      </section>

      <section className="sec chk" id="sec-chk">
        <h2>Verifica</h2>
        {d.check.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>

      <DayFooter n={n} next={next} />
    </DayTransition>
  );
}
