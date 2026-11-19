export const PWA_THEME_COLOR = "#07090a";
export const PWA_BACKGROUND_COLOR = "#07090a";

export const PWA_ICONS = [
  {
    src: "/icons/icon-192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/icons/icon-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/icons/icon-maskable-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
] as const;

export const APPLE_TOUCH_ICON = "/apple-touch-icon.png";

export const ADD_TO_HOME_SCREEN_HINT =
  "Lägg till appen på hemskärmen så öppnas den helskärm, utan webbläsarens adressfält.";

export const IOS_ADD_TO_HOME_SCREEN_STEPS =
  "På iPhone: öppna i Safari, tryck Dela och välj Lägg till på hemskärmen.";

export const ANDROID_ADD_TO_HOME_SCREEN_STEPS =
  "På Android: öppna menyn i Chrome och välj Installera app eller Lägg till på startskärmen.";

export const ADD_TO_HOME_SCREEN_DISMISS_KEY = "cf-hide-a2hs";

export function buildWebAppManifest() {
  return {
    name: "CrossFit Träning",
    short_name: "CrossFit",
    description: "Pass, timer, logg och mål",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone" as const,
    background_color: PWA_BACKGROUND_COLOR,
    theme_color: PWA_THEME_COLOR,
    lang: "sv",
    icons: PWA_ICONS.map((icon) => ({ ...icon })),
  };
}

/** Paths that must stay reachable without a session (manifest, icons, Next assets). */
export function isPublicAssetPath(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/manifest.webmanifest") return true;
  if (pathname === APPLE_TOUCH_ICON) return true;
  if (pathname.startsWith("/icons/")) return true;
  return false;
}

export function isStandaloneDisplayMode(options: {
  mediaMatches?: boolean;
  iosStandalone?: boolean;
}): boolean {
  return Boolean(options.mediaMatches || options.iosStandalone);
}

export function shouldOfferAddToHomeScreen(options: {
  standalone: boolean;
  dismissed: boolean;
}): boolean {
  return !options.standalone && !options.dismissed;
}
