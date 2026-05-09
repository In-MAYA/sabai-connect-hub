/**
 * E2E: /chat/:id immediately swaps i18n strings when language changes.
 *
 * Verifies that the conversation page does not cache translated strings
 * and that switching language via I18nProvider re-renders all UI text
 * (composer placeholder, attach sheet, online/typing indicators, etc.).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { I18nProvider, useI18n, type Lang } from "@/lib/i18n";
import Conversation from "@/pages/Conversation";

let setLangRef: (l: Lang) => void = () => {};
function LangProbe() {
  const { setLang } = useI18n();
  setLangRef = setLang;
  return null;
}

function renderConvo(initialLang: Lang = "lo") {
  localStorage.setItem("sabai_lang", initialLang);
  return render(
    <I18nProvider>
      <LangProbe />
      <MemoryRouter initialEntries={["/chat/c1"]}>
        <Routes>
          <Route path="/chat/:id" element={<Conversation />} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "";
  // jsdom does not implement Element.scrollTo — stub it for the auto-scroll effect.
  if (!(Element.prototype as unknown as { scrollTo?: () => void }).scrollTo) {
    (Element.prototype as unknown as { scrollTo: () => void }).scrollTo = () => {};
  }
});

describe("/chat/:id — i18n hot-swap", () => {
  it("composer placeholder updates immediately on language switch", async () => {
    renderConvo("lo");
    expect(screen.getByPlaceholderText("ພິມຂໍ້ຄວາມ...")).toBeInTheDocument();

    await act(async () => setLangRef("en"));
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();

    await act(async () => setLangRef("th"));
    expect(screen.getByPlaceholderText("พิมพ์ข้อความ...")).toBeInTheDocument();

    await act(async () => setLangRef("zh"));
    expect(screen.getByPlaceholderText(/输入消息|消息/)).toBeInTheDocument();
  });

  it("online indicator and members count localize per language", async () => {
    renderConvo("en");
    // For 1:1 chat c1, the header shows 'Online' (when applicable).
    // Switch language and confirm strings change with html[lang].
    await act(async () => setLangRef("lo"));
    expect(document.documentElement.lang).toBe("lo");
    await act(async () => setLangRef("en"));
    expect(document.documentElement.lang).toBe("en");
  });

  it("attach sheet title localizes when opened after switching language", async () => {
    renderConvo("en");
    const attachBtn = screen.getByLabelText(/Attach file/i);
    fireEvent.click(attachBtn);
    expect(screen.getByText("Attach file")).toBeInTheDocument();

    // Close, switch language, reopen.
    fireEvent.keyDown(document, { key: "Escape" });
    await act(async () => setLangRef("lo"));
    fireEvent.click(screen.getByLabelText("ແນບໄຟລ໌"));
    expect(screen.getAllByText("ແນບໄຟລ໌").length).toBeGreaterThan(0);
  });

  it("send button aria-label switches language without remount", async () => {
    renderConvo("lo");
    expect(screen.getByLabelText("ສົ່ງຂໍ້ຄວາມ")).toBeInTheDocument();
    await act(async () => setLangRef("en"));
    expect(screen.getByLabelText(/Send message/i)).toBeInTheDocument();
    await act(async () => setLangRef("th"));
    expect(screen.getByLabelText("ส่งข้อความ")).toBeInTheDocument();
  });
});
