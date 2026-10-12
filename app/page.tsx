import Link from "next/link";
import { DAYS } from "@/lib/days";
import { readSkill } from "@/lib/skills";
import { DayTransition } from "@/components/DayTransition";

export default function Intro() {
  return (
    <DayTransition key={0} n={0}>
      <div className="intro">
        <p className="eyebrow">Corso di studio personale</p>
        <h1 className="dt">Motion in 14 giorni</h1>
        <p className="goal">
          Il testo originale delle skill di Emil Kowalski, un giorno alla volta, con esempi live inseriti subito dopo la regola che mostrano.
        </p>
        <div className="btns">
          <Link className="btn primary" href="/giorno/1">
            Inizia dal giorno 1
          </Link>
        </div>

        <h2>Com&apos;è fatto un giorno</h2>
        <ul>
          <li>
            <b>Lettura</b>: le sezioni delle skill, non modificate. Puoi passare dalla vista formattata al file .md grezzo.
          </li>
          <li>
            <b>Esempi live</b>: quasi sempre un confronto A/B, sbagliato contro giusto, nel punto esatto del testo.
          </li>
          <li>
            <b>Laboratorio</b>: un componente scritto male da correggere. La soluzione resta nascosta finché non la chiedi.
          </li>
          <li>
            <b>Da telefono</b>: esercizi solo a tocchi, con il codice sempre visibile.
          </li>
          <li>
            <b>Verifica</b>: tre domande con risposta nascosta. <b>Note</b>: le tue, salvate in questo browser.
          </li>
        </ul>
        <p>
          In alto, <b>Rallenta</b> porta ogni animazione della pagina a 2× o 4× più lenta. È lo strumento di debug che Emil consiglia: usalo spesso.
        </p>

        <h2>Cosa non è</h2>
        <p>
          Non è il corso animations.dev. Mancano i suoi walkthrough, gli esercizi guidati e il Discord. Il testo delle skill è di Emil, sotto licenza MIT;
          demo, laboratori, domande e ordine dei giorni sono scritti a partire da quel testo.
        </p>

        <h2>Il piano</h2>
        <div className="plan">
          {DAYS.map((d, i) => (
            <Link key={i} href={`/giorno/${i + 1}`}>
              <span className="n">
                Giorno {String(i + 1).padStart(2, "0")} · {d.time}
              </span>
              <span className="t">{d.title}</span>
              <span className="f">{[...new Set(d.read.map((r) => r.f.split("/")[1] || r.f))].join(", ")}</span>
            </Link>
          ))}
        </div>

        <h2>Fonte e licenza</h2>
        <p>
          Repository{" "}
          <a href="https://github.com/emilkowalski/skills" target="_blank" rel="noopener">
            github.com/emilkowalski/skills
          </a>
          , ramo main, scaricato il 12 ottobre 2026.
        </p>
        <div className="lic">{readSkill("LICENSE")}</div>
      </div>
    </DayTransition>
  );
}
