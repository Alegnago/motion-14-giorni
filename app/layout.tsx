import type { Metadata } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { Sidebar, ProgressCount } from "@/components/Sidebar";
import { SlowMoProvider, SlowMoControl } from "@/components/SlowMo";
import "./globals.css";

const display = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["500", "700"] });
const body = Geist({ variable: "--font-geist", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Motion in 14 giorni",
  description: "Corso di 14 giorni sulle skill di Emil Kowalski: testo originale, demo live dentro la lettura, laboratorio ed esercizi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <SlowMoProvider>
          <header className="top">
            <Link className="brand" href="/" aria-label="Introduzione">
              <svg viewBox="-8 -8 116 116" aria-hidden="true">
                <rect className="mark-box" x="-4" y="-4" width="108" height="108" rx="18" />
                <path className="mark-curve" d="M0 100 C 23 0, 32 0, 100 0" />
              </svg>
              Motion in 14 giorni
            </Link>
            <span className="top-sp" />
            <ProgressCount />
            <SlowMoControl />
          </header>
          <div className="shell">
            <Sidebar />
            <main>
              <div className="col" id="main">
                {children}
              </div>
            </main>
          </div>
        </SlowMoProvider>
      </body>
    </html>
  );
}
