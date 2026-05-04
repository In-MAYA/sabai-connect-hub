import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, Link } from "react-router-dom";
import { ErrorBoundary } from "./ErrorBoundary";
import { SectionErrorBoundary } from "./SectionErrorBoundary";

/**
 * End-to-end style test in production mode.
 *
 * Goal: simulate a real user journey through the app and confirm that:
 *  - When a route or a section crashes, the UI never exposes raw error
 *    messages, stack traces, or "details (dev)" affordances.
 *  - The error is still logged via console.error with the proper tags
 *    and the original Error object (so monitoring keeps working).
 *  - The rest of the app remains usable (navigation, sibling sections).
 */

const SECRET = "DB_PASSWORD=hunter2 stacktrace://internal/path/leak";

function CrashPage(): JSX.Element {
  throw new Error(SECRET);
}

function CrashingWidget(): JSX.Element {
  throw new Error(SECRET);
}

function HomePage() {
  return (
    <div>
      <h1>Home</h1>
      <Link to="/danger">go to danger</Link>
      <Link to="/mixed">go to mixed</Link>
    </div>
  );
}

function MixedPage() {
  return (
    <div>
      <h1>Mixed</h1>
      <SectionErrorBoundary name="Widget">
        <CrashingWidget />
      </SectionErrorBoundary>
      <p>still alive sibling</p>
      <Link to="/">back home</Link>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/danger"
            element={
              <ErrorBoundary>
                <CrashPage />
              </ErrorBoundary>
            }
          />
          <Route path="/mixed" element={<MixedPage />} />
        </Routes>
      </MemoryRouter>
    </ErrorBoundary>
  );
}

describe("E2E (production mode): boundaries never leak raw error details", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  const originalDev = import.meta.env.DEV;
  const originalProd = import.meta.env.PROD;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (import.meta.env as { DEV: boolean }).DEV = false;
    (import.meta.env as { PROD: boolean }).PROD = true;
  });

  afterEach(() => {
    errorSpy.mockRestore();
    (import.meta.env as { DEV: boolean }).DEV = originalDev;
    (import.meta.env as { PROD: boolean }).PROD = originalProd;
  });

  function assertNoLeak(container: HTMLElement) {
    // Raw secret/stack must never appear anywhere in rendered DOM
    expect(container.textContent ?? "").not.toContain("hunter2");
    expect(container.textContent ?? "").not.toContain("stacktrace://");
    expect(container.textContent ?? "").not.toContain(SECRET);
    // Dev-only affordance must be absent
    expect(screen.queryByText(/รายละเอียด/)).not.toBeInTheDocument();
  }

  function assertLogged(tag: string) {
    const tagged = errorSpy.mock.calls.find(
      (args) => typeof args[0] === "string" && (args[0] as string).includes(tag),
    );
    expect(tagged, `expected a console.error tagged with ${tag}`).toBeDefined();
    const err = tagged!.find((a) => a instanceof Error) as Error | undefined;
    expect(err?.message).toBe(SECRET);
  }

  it("page-level crash: shows generic UI, hides secret, but logs it", () => {
    const { container } = render(<App />);

    // Navigate to the crashing route
    fireEvent.click(screen.getByRole("link", { name: /go to danger/i }));

    // Generic, user-safe message
    expect(screen.getByText("เกิดข้อผิดพลาด")).toBeInTheDocument();
    expect(
      screen.getByText(/มีบางอย่างผิดพลาด/),
    ).toBeInTheDocument();

    assertNoLeak(container);
    assertLogged("[ErrorBoundary]");
  });

  it("section-level crash: sibling stays usable, secret hidden, error logged", () => {
    const { container } = render(<App />);

    fireEvent.click(screen.getByRole("link", { name: /go to mixed/i }));

    // The crashed widget shows the generic section fallback
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("โหลดส่วนนี้ไม่สำเร็จ")).toBeInTheDocument();
    expect(within(alert).getByText("กรุณาลองใหม่อีกครั้ง")).toBeInTheDocument();

    // Sibling content still rendered → page is not blank
    expect(screen.getByText("still alive sibling")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back home/i })).toBeInTheDocument();

    assertNoLeak(container);
    assertLogged("[SectionErrorBoundary:Widget]");
  });

  it("after a section crash, navigation still works (no global blank screen)", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: /go to mixed/i }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /back home/i }));
    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
