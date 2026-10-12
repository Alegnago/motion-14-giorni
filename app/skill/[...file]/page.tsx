import { notFound } from "next/navigation";
import { listSkillFiles, readSkill, sliceMd } from "@/lib/skills";
import { renderMd } from "@/lib/markdown";
import { ViewSwitch } from "@/components/ViewSwitch";

export function generateStaticParams() {
  return listSkillFiles().map((f) => ({ file: f.split("/") }));
}

export default async function SkillFile(props: PageProps<"/skill/[...file]">) {
  const { file } = await props.params;
  const f = file.join("/");
  if (!listSkillFiles().includes(f)) notFound();
  const text = readSkill(f);
  const isMd = f.endsWith(".md");
  return (
    <div>
      <p className="eyebrow">Appendice</p>
      <h1 className="dt">{f.replace("skills/", "")}</h1>
      <ViewSwitch
        title="Il file"
        formatted={isMd ? <div className="md" dangerouslySetInnerHTML={{ __html: renderMd(sliceMd(text).md) }} /> : <pre className="raw">{text}</pre>}
        raw={<pre className="raw">{text}</pre>}
      />
    </div>
  );
}
