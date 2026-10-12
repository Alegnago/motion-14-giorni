import { Marked } from "marked";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const md = new Marked({ gfm: true });
md.use({
  renderer: {
    // I link interni del repo (RECIPES.md, AUDIT.md…) qui non esistono: restano testo.
    link(href: string, _title: string | null | undefined, text: string) {
      if (/^https?:/.test(href)) return `<a href="${esc(href)}" target="_blank" rel="noopener">${text}</a>`;
      return `<span class="xref">${text}</span>`;
    },
    table(header: string, body: string) {
      return `<div class="tw"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
    },
  },
});

export function renderMd(src: string): string {
  return md.parse(src) as string;
}
