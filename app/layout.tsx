import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ScrollEffects } from "./components/ScrollEffects";
import { CookieNotice } from "./components/CookieNotice";
import "./globals.css";

export const dynamic = "force-static";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pracht Performance | Strategie, Digital & Objektservice",
  description: "Pracht Performance verbindet Strategie, Marketing, Webdesign und Objektservice zu klarer, messbarer Wirkung.",
  openGraph: {
    title: "Pracht Performance",
    description: "Wirkung beginnt mit klarer Richtung.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Pracht Performance" }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body className={geist.variable}><ScrollEffects />{children}<CookieNotice /></body></html>;
}
