import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Sans, Amatic_SC, Caveat } from "next/font/google";
import { APPLE_TOUCH_ICON, PWA_THEME_COLOR } from "@/lib/pwa";
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
  description: "WOD, timer, logg och mål",
  applicationName: "CrossFit Träning",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CrossFit",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: APPLE_TOUCH_ICON, sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: PWA_THEME_COLOR,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body
        className={`${plex.variable} ${barlow.variable} ${amatic.variable} ${caveat.variable} min-h-dvh font-sans text-stone-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
