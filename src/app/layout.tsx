import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/site.css";
import { asset } from "@/lib/paths";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const textFont = Instrument_Sans({ subsets: ["latin"], variable: "--font-text", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "CALCE — The Cultural Salon", template: "%s · CALCE" },
  description: "A museum of contemporary art built of stone and light. Visit four exhibitions in the building or walk through them in a real-time 3D museum.",
  icons: { icon: asset("/icon.svg") },
  openGraph: { siteName: "CALCE — The Cultural Salon", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#F5F0E7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${textFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
