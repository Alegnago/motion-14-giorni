"use client";
// Cambio di giorno direzionale: avanti entra da destra, indietro da sinistra.
// Navigazione frequente → breve e sottile: 10px + dissolvenza, 150ms, ease-out forte.
// Con reduced motion resta solo la dissolvenza.
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

let lastDay = -1;

export function DayTransition({ n, children }: { n: number; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [dir] = useState(() => (lastDay < 0 || lastDay === n ? 0 : n > lastDay ? 1 : -1));
  useEffect(() => {
    lastDay = n;
  }, [n]);
  const x = reduce ? 0 : dir * 10;
  return (
    <motion.div
      // primo caricamento: nessuna direzione da mostrare, e l'HTML statico non deve uscire con opacity 0
      initial={dir === 0 ? false : { opacity: 0, transform: `translateX(${x}px)` }}
      animate={{ opacity: 1, transform: "translateX(0px)" }}
      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
