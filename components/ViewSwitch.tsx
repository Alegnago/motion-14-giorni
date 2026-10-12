"use client";
// Vista formattata (con le demo) o file .md grezzo. Entrambe restano montate,
// così le demo non perdono lo stato quando passi al grezzo e torni.
import { useSyncExternalStore } from "react";
import { Segmented } from "./Segmented";

type View = "fmt" | "raw";
const KEY = "m14-view";
const EVT = "m14-view";

function readView(): View {
  try {
    const v = localStorage.getItem(KEY);
    return v === '"raw"' || v === "raw" ? "raw" : "fmt";
  } catch {
    return "fmt";
  }
}

function setView(v: View) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
  window.dispatchEvent(new Event(EVT));
}

export function ViewSwitch({ title, formatted, raw, rawNote }: { title: string; formatted: React.ReactNode; raw: React.ReactNode; rawNote?: string }) {
  const view = useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVT, cb);
      return () => window.removeEventListener(EVT, cb);
    },
    readView,
    () => "fmt" as View,
  );
  return (
    <>
      <div className="viewbar" id="sec-read">
        <h2>{title}</h2>
        <Segmented<View>
          label="Vista"
          value={view}
          onChange={setView}
          options={[
            { value: "fmt", label: "Formattato + esempi" },
            { value: "raw", label: "Grezzo .md" },
          ]}
        />
      </div>
      <div hidden={view !== "fmt"}>{formatted}</div>
      <div hidden={view !== "raw"}>
        {raw}
        {rawNote && (
          <p className="demo-note" style={{ borderRadius: 10, marginTop: 12 }}>
            {rawNote}
          </p>
        )}
      </div>
    </>
  );
}
