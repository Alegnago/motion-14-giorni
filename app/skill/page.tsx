import Link from "next/link";
import { listSkillFiles } from "@/lib/skills";

export const metadata = { title: "Tutte le skill · Motion in 14 giorni" };

export default function AllSkills() {
  const files = listSkillFiles();
  return (
    <div>
      <p className="eyebrow">Appendice</p>
      <h1 className="dt">Tutte le skill</h1>
      <p className="goal">Ogni file del repository di Emil, compresi quelli fuori dal corso (animate-expo, write-swift, ask-sonner).</p>
      <div className="plan">
        {files.map((f) => (
          <Link key={f} href={`/skill/${f}`}>
            <span className="t">{f.replace("skills/", "")}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
