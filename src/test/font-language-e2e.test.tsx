/**
 * E2E: Language switching applies the correct font tokens immediately
 * across every primary route (/auth, /chats, /feed, /shop, /profile).
 *
 * jsdom does not apply imported CSS files to elements, so we verify the
 * font policy in two complementary ways:
 *   1. Static contract — `src/index.css` defines the expected rules
 *      (Montserrat default, Phetsarath OT/Noto Sans Lao for html[lang="lo"]).
 *   2. Runtime contract — switching language via the I18nProvider updates
 *      `document.documentElement.lang` synchronously, which is the hook
 *      every component relies on for the locale-aware font cascade.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { I18nProvider, useI18n, type Lang } from "@/lib/i18n";
import Auth from "@/pages/Auth";
import Chats from "@/pages/Chats";
import Feed from "@/pages/Feed";
import Shop from "@/pages/Shop";
import Profile from "@/pages/Profile";

// react-router's useNavigate is used by Auth/Profile — stub it so we can
// render the pages outside of a full router tree.
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return { ...actual, useNavigate: () => () => {} };
});

const indexCss = readFileSync(
  resolve(__dirname, "../index.css"),
  "utf8",
);

/** Test harness: exposes setLang to the test body. */
let setLangRef: (l: Lang) => void = () => {};
function LangProbe() {
  const { setLang } = useI18n();
  setLangRef = setLang;
  return null;
}

function renderWithProviders(ui: React.ReactNode, initialPath = "/") {
  return render(
    <I18nProvider>
      <LangProbe />
      <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
    </I18nProvider>,
  );
}

beforeEach(() => {
  // Reset persisted language so each test starts from the default ("lo").
  localStorage.clear();
  document.documentElement.lang = "";
});

describe("Font policy — static CSS contract", () => {
  it("applies Montserrat as the default body font", () => {
    expect(indexCss).toMatch(/body\s*{[^}]*font-family:\s*['"]Montserrat['"]/);
  });

  it("forces Phetsarath OT + Noto Sans Lao when html[lang=\"lo\"]", () => {
    // The Lao override must use !important and target every descendant
    // (excluding opt-out class and SVG glyphs) so Tailwind utilities like
    // font-display / font-sans / font-mono cannot break the cascade.
    expect(indexCss).toMatch(
      /html\[lang="lo"\][\s\S]*?font-family:\s*['"]Phetsarath OT['"]\s*,\s*['"]Noto Sans Lao['"][\s\S]*?!important/,
    );
    expect(indexCss).toContain('*:not(.allow-latin-font):not(svg):not(svg *)');
  });

  it("loads the required webfonts", () => {
    expect(indexCss).toContain("Montserrat");
    expect(indexCss).toContain("Noto+Sans+Lao");
    expect(indexCss).toMatch(/Phetsarath/);
  });
});

describe("Language switching — runtime contract on every primary route", () => {
  const routes: { name: string; path: string; element: React.ReactNode }[] = [
    { name: "/auth", path: "/auth", element: <Auth /> },
    { name: "/chats", path: "/chats", element: <Chats /> },
    { name: "/feed", path: "/feed", element: <Feed /> },
    { name: "/shop", path: "/shop", element: <Shop /> },
    { name: "/profile", path: "/profile", element: <Profile /> },
  ];

  for (const route of routes) {
    it(`updates html[lang] immediately on ${route.name}`, async () => {
      renderWithProviders(route.element, route.path);

      // Default locale is Lao — the Phetsarath OT cascade must be active.
      expect(document.documentElement.lang).toBe("lo");

      // Switch to English → Montserrat default applies.
      await act(async () => setLangRef("en"));
      expect(document.documentElement.lang).toBe("en");

      // Switch to Thai → Montserrat default still applies (no Lao override).
      await act(async () => setLangRef("th"));
      expect(document.documentElement.lang).toBe("th");

      // Switch back to Lao → Phetsarath OT cascade re-engages.
      await act(async () => setLangRef("lo"));
      expect(document.documentElement.lang).toBe("lo");

      // The page must remain mounted (no crash on locale change).
      expect(document.body.firstChild).toBeTruthy();
    });
  }

  it("persists the chosen language to localStorage for next visit", async () => {
    renderWithProviders(<Shop />, "/shop");
    await act(async () => setLangRef("en"));
    expect(localStorage.getItem("sabai_lang")).toBe("en");
    await act(async () => setLangRef("zh"));
    expect(localStorage.getItem("sabai_lang")).toBe("zh");
  });

  it("renders Lao copy under lang=\"lo\" and English copy under lang=\"en\" on /shop", async () => {
    renderWithProviders(<Shop />, "/shop");

    // Lao default: title is "ຮ້ານຄ້າ".
    expect(screen.getAllByText("ຮ້ານຄ້າ").length).toBeGreaterThan(0);
    expect(document.documentElement.lang).toBe("lo");

    await act(async () => setLangRef("en"));
    expect(document.documentElement.lang).toBe("en");
    // English title is "Shop".
    expect(screen.getAllByText("Shop").length).toBeGreaterThan(0);
  });
});
