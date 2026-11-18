import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  ADD_TO_HOME_SCREEN_HINT,
  ANDROID_ADD_TO_HOME_SCREEN_STEPS,
  APPLE_TOUCH_ICON,
  IOS_ADD_TO_HOME_SCREEN_STEPS,
  PWA_BACKGROUND_COLOR,
  PWA_THEME_COLOR,
  buildWebAppManifest,
  isPublicAssetPath,
  isStandaloneDisplayMode,
  shouldOfferAddToHomeScreen,
} from "./pwa.ts";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "../../public");

function pngSize(relativePath: string) {
  const buf = readFileSync(join(publicDir, relativePath));
  assert.equal(buf.subarray(0, 8).toString("binary"), "\x89PNG\r\n\x1a\n");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe("buildWebAppManifest", () => {
  const manifest = buildWebAppManifest();

  it("names the app and opens standalone without browser chrome", () => {
    assert.equal(manifest.name, "CrossFit Träning");
    assert.equal(manifest.short_name, "CrossFit");
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.start_url, "/");
    assert.equal(manifest.scope, "/");
    assert.equal(manifest.lang, "sv");
    assert.equal(manifest.theme_color, PWA_THEME_COLOR);
    assert.equal(manifest.background_color, PWA_BACKGROUND_COLOR);
    assert.equal(PWA_THEME_COLOR, "#07090a");
  });

  it("lists 192, 512 and maskable PNG icons", () => {
    const bySize = Object.fromEntries(
      manifest.icons.map((icon) => [`${icon.sizes}:${icon.purpose}`, icon])
    );
    assert.equal(bySize["192x192:any"]?.src, "/icons/icon-192.png");
    assert.equal(bySize["512x512:any"]?.src, "/icons/icon-512.png");
    assert.equal(bySize["512x512:maskable"]?.src, "/icons/icon-maskable-512.png");
    assert.ok(manifest.icons.every((icon) => icon.type === "image/png"));
  });
});

describe("PWA icon files", () => {
  it("ships PNG icons at the sizes browsers require", () => {
    assert.deepEqual(pngSize("icons/icon-192.png"), { width: 192, height: 192 });
    assert.deepEqual(pngSize("icons/icon-512.png"), { width: 512, height: 512 });
    assert.deepEqual(pngSize("icons/icon-maskable-512.png"), {
      width: 512,
      height: 512,
    });
    assert.deepEqual(pngSize(APPLE_TOUCH_ICON.slice(1)), {
      width: 180,
      height: 180,
    });
  });
});

describe("isPublicAssetPath", () => {
  it("lets the browser fetch the manifest and icons without a session", () => {
    assert.equal(isPublicAssetPath("/manifest.webmanifest"), true);
    assert.equal(isPublicAssetPath("/icons/icon-192.png"), true);
    assert.equal(isPublicAssetPath("/icons/icon-512.png"), true);
    assert.equal(isPublicAssetPath(APPLE_TOUCH_ICON), true);
    assert.equal(isPublicAssetPath("/favicon.ico"), true);
  });

  it("does not treat app pages as public assets", () => {
    assert.equal(isPublicAssetPath("/"), false);
    assert.equal(isPublicAssetPath("/login"), false);
    assert.equal(isPublicAssetPath("/workouts"), false);
  });
});

describe("add-to-home-screen helpers", () => {
  it("hides the prompt when already installed or dismissed", () => {
    assert.equal(isStandaloneDisplayMode({ mediaMatches: true }), true);
    assert.equal(isStandaloneDisplayMode({ iosStandalone: true }), true);
    assert.equal(isStandaloneDisplayMode({}), false);
    assert.equal(
      shouldOfferAddToHomeScreen({ standalone: false, dismissed: false }),
      true
    );
    assert.equal(
      shouldOfferAddToHomeScreen({ standalone: true, dismissed: false }),
      false
    );
    assert.equal(
      shouldOfferAddToHomeScreen({ standalone: false, dismissed: true }),
      false
    );
  });

  it("keeps Swedish install copy", () => {
    assert.match(ADD_TO_HOME_SCREEN_HINT, /hemskärmen/);
    assert.match(IOS_ADD_TO_HOME_SCREEN_STEPS, /Safari/);
    assert.match(ANDROID_ADD_TO_HOME_SCREEN_STEPS, /Chrome/);
  });
});
