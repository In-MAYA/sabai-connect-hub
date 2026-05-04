import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ErrorBoundary } from "./ErrorBoundary";
import { SectionErrorBoundary } from "./SectionErrorBoundary";

function Boom({ message = "secret-internal-detail" }: { message?: string }): JSX.Element {
  throw new Error(message);
}

describe("Boundaries in production mode", () => {
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

  it("ErrorBoundary does not expose error message in the UI but still logs it", () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Boom message="secret-internal-detail" />
        </ErrorBoundary>
      </MemoryRouter>,
    );

    // Generic message is shown
    expect(screen.getByText("เกิดข้อผิดพลาด")).toBeInTheDocument();
    // Raw error details are NOT shown
    expect(screen.queryByText(/secret-internal-detail/)).not.toBeInTheDocument();
    expect(screen.queryByText(/รายละเอียด/)).not.toBeInTheDocument();

    // But it IS logged
    const tagged = errorSpy.mock.calls.find(
      (args) => typeof args[0] === "string" && args[0].includes("[ErrorBoundary]"),
    );
    expect(tagged).toBeDefined();
    const err = tagged!.find((a) => a instanceof Error) as Error | undefined;
    expect(err?.message).toBe("secret-internal-detail");
  });

  it("SectionErrorBoundary hides the raw error message in the UI but logs it", () => {
    render(
      <SectionErrorBoundary name="MessageList">
        <Boom message="kaboom-internal" />
      </SectionErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("โหลดส่วนนี้ไม่สำเร็จ")).toBeInTheDocument();
    expect(screen.queryByText(/kaboom-internal/)).not.toBeInTheDocument();

    const tagged = errorSpy.mock.calls.find(
      (args) =>
        typeof args[0] === "string" &&
        args[0].includes("[SectionErrorBoundary:MessageList]"),
    );
    expect(tagged).toBeDefined();
    const err = tagged!.find((a) => a instanceof Error) as Error | undefined;
    expect(err?.message).toBe("kaboom-internal");
  });
});
