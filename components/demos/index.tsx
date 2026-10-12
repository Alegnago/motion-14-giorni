"use client";
// Registro delle demo: lib/days.ts le richiama per id, la pagina del giorno le inserisce nel testo.
import type { ComponentType } from "react";
import { Material, Symmetric, Tracking } from "./apple";
import { Duration, Easing, Freq, Gallery, Purpose, Spinner } from "./basics";
import { Compare, Hold, Reveal, Stagger, Tabs } from "./clip";
import { Projection, Rubber, Sheet } from "./gestures";
import { Busy, Hover, Reduced, Spot, Wizard } from "./method";
import { Interrupt, Mouse, SpringLab } from "./springs";
import { Accordion, Blur, ModalRecipe, Orbit, Origin, Pct, Press, Scale0, Starting, Toast, Tooltips } from "./ui";

const DEMOS: Record<string, ComponentType> = {
  gallery: Gallery, freq: Freq, purpose: Purpose, easing: Easing, duration: Duration, spinner: Spinner,
  springlab: SpringLab, mouse: Mouse, interrupt: Interrupt,
  press: Press, scale0: Scale0, origin: Origin, tooltips: Tooltips, toast: Toast, blur: Blur, starting: Starting, pct: Pct, orbit: Orbit,
  hold: Hold, tabs: Tabs, compare: Compare, reveal: Reveal, stagger: Stagger,
  sheet: Sheet, rubber: Rubber, projection: Projection,
  symmetric: Symmetric, material: Material, tracking: Tracking,
  wizard: Wizard, modalrec: ModalRecipe, accordion: Accordion, busy: Busy, reduced: Reduced, hover: Hover, spot: Spot,
};

export function Demo({ id }: { id: string }) {
  const C = DEMOS[id];
  if (!C) return <p className="demo-note">Demo “{id}” non trovata.</p>;
  return <C />;
}
