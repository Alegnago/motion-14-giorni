"use client";
// "Rallenta": porta ogni animazione CSS e WAAPI della pagina a 2× o 4×.
// Il metodo di debug che consiglia Emil: guardare il movimento al rallentatore.
import { createContext, useContext, useEffect, useState } from "react";
import { Segmented } from "./Segmented";

type Speed = "1" | "2" | "4";
const SlowCtx = createContext<number>(1);
export const useSlow = () => useContext(SlowCtx);

let factor = 1;
const roots = new Set<Document | ShadowRoot>();

/** Applica il rallentatore a un documento o a uno shadow root (anteprime del laboratorio). */
export function watchSlow(root: Document | ShadowRoot) {
  if (roots.has(root)) return;
  roots.add(root);
  const fix = (e: Event) => {
    const t = e.target as Element | null;
    if (!t?.getAnimations || t.closest("[data-noslow]")) return;
    t.getAnimations().forEach((a) => (a.playbackRate = 1 / factor));
  };
  root.addEventListener("transitionrun", fix, true);
  root.addEventListener("animationstart", fix, true);
}

/** element.animate() che rispetta il rallentatore. */
export function play(node: Element, kf: Keyframe[], opts: KeyframeAnimationOptions) {
  const a = node.animate(kf, opts);
  a.playbackRate = 1 / factor;
  return a;
}

export function slowFactor() {
  return factor;
}

export function SlowMoProvider({ children }: { children: React.ReactNode }) {
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    watchSlow(document);
  }, []);
  useEffect(() => {
    factor = speed;
    document.getAnimations?.().forEach((a) => {
      // il controllo "Rallenta" non rallenta se stesso
      const target = (a.effect as KeyframeEffect | null)?.target;
      if (target instanceof Element && target.closest("[data-noslow]")) return;
      a.playbackRate = 1 / speed;
    });
  }, [speed]);
  return (
    <SlowCtx.Provider value={speed}>
      <SlowSetter.Provider value={setSpeed}>{children}</SlowSetter.Provider>
    </SlowCtx.Provider>
  );
}

const SlowSetter = createContext<(n: number) => void>(() => {});

export function SlowMoControl() {
  const speed = useSlow();
  const set = useContext(SlowSetter);
  return (
    <span className="slow" data-noslow>
      <span className="lbl">Rallenta</span>
      <Segmented<Speed>
        size="sm"
        label="Velocità delle animazioni"
        value={String(speed) as Speed}
        onChange={(v) => set(Number(v))}
        options={[
          { value: "1", label: "1×" },
          { value: "2", label: "2×" },
          { value: "4", label: "4×" },
        ]}
      />
    </span>
  );
}
