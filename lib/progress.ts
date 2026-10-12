"use client";
// Progressi e note, salvati in questo browser. Stessa chiave dell'Artifact.
import { useSyncExternalStore } from "react";

export type Progress = { done: Record<string, boolean>; notes: Record<string, string> };

const KEY = "m14-progress";
const EVT = "m14-progress";
const EMPTY: Progress = { done: {}, notes: {} };
let cache: Progress | null = null;

function read(): Progress {
  if (cache) return cache;
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    cache = v && typeof v === "object" ? { done: v.done || {}, notes: v.notes || {} } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

export function writeProgress(next: Progress) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  window.dispatchEvent(new Event(EVT));
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVT, cb);
      return () => window.removeEventListener(EVT, cb);
    },
    read,
    () => EMPTY,
  );
}
