// Lettura dei file di Emil da content/emil (solo lato server, a build time).
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "content", "emil");

export function readSkill(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

export function listSkillFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".md") || e.name === "LICENSE") out.push(path.relative(ROOT, p));
    }
  };
  walk(ROOT);
  return out.filter((f) => f !== "SOURCE.md").sort();
}

const FENCE = /^(```|~~~)/;

/** Taglia un file dal titolo che inizia con `from` fino a quello che inizia con `to` (escluso). */
export function sliceMd(text: string, from?: string, to?: string) {
  const lines = text.replace(/\r/g, "").split("\n");
  const find = (prefix: string, start: number) => {
    let fence = false;
    for (let i = start; i < lines.length; i++) {
      if (FENCE.test(lines[i])) fence = !fence;
      if (!fence && lines[i].startsWith(prefix)) return i;
    }
    return -1;
  };
  let s = 0;
  let e = lines.length;
  if (from) {
    s = find(from, 0);
    if (s < 0) return { md: "> Sezione non trovata: " + from, a: 0, b: 0 };
  } else if (lines[0] === "---") {
    const j = lines.indexOf("---", 1);
    if (j > 0) s = j + 1;
  }
  if (to) {
    const j = find(to, s + 1);
    if (j >= 0) e = j;
  }
  return { md: lines.slice(s, e).join("\n"), a: s + 1, b: e };
}

/** Divide il markdown in blocchi, uno per titolo, ignorando i # dentro i blocchi di codice. */
export function chunks(md: string): { h: string; md: string }[] {
  const out: { h: string; lines: string[] }[] = [];
  let cur: { h: string; lines: string[] } | null = null;
  let fence = false;
  for (const l of md.split("\n")) {
    if (FENCE.test(l)) fence = !fence;
    if (!fence && /^#{1,6} /.test(l)) {
      if (cur) out.push(cur);
      cur = { h: l, lines: [l] };
    } else {
      if (!cur) cur = { h: "", lines: [] };
      cur.lines.push(l);
    }
  }
  if (cur) out.push(cur);
  return out.map((c) => ({ h: c.h, md: c.lines.join("\n") }));
}
