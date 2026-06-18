import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useParams } from "react-router-dom";
import Contacts from "@/pages/Contacts";
import { I18nProvider } from "@/lib/i18n";
import { chats, users } from "@/lib/mock-data";
import { setPermission } from "@/lib/contacts";

function ChatStub() {
  const { id = "" } = useParams();
  return <div data-testid="chat-route">chat:{id}</div>;
}

const renderApp = () =>
  render(
    <I18nProvider>
      <MemoryRouter initialEntries={["/contacts"]}>
        <Routes>
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/chat/:id" element={<ChatStub />} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );

describe("Contacts → chat navigation", () => {
  beforeEach(() => {
    setPermission("granted");
  });

  it("opens the existing chat for a registered contact (not /chat/<userId>)", async () => {
    renderApp();
    // Wait until at least one known registered contact row renders
    const name = users[0].name; // u1 — has chat c1
    const row = await screen.findByText(name, {}, { timeout: 4000 });
    await act(async () => {
      fireEvent.click(row);
    });
    await waitFor(() => {
      const node = screen.getByTestId("chat-route");
      // Must resolve to a real chat id (c1) — never the raw user id
      expect(node.textContent).not.toBe(`chat:${users[0].id}`);
      // And must match an actual chat in the store
      const id = node.textContent!.replace("chat:", "");
      expect(chats.some((c) => c.id === id)).toBe(true);
    });
  });
});
