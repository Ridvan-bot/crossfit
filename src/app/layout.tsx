import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Sans, Amatic_SC, Caveat } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow",
});

const amatic = Amatic_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-amatic",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "CrossFit Träning",
  description: "Pass, timer, logg och mål",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body
        className={`${plex.variable} ${barlow.variable} ${amatic.variable} ${caveat.variable} min-h-dvh bg-stone-950 font-sans text-stone-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
