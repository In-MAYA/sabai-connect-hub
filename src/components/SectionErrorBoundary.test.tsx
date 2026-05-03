import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SectionErrorBoundary } from "./SectionErrorBoundary";

function Boom({ message = "boom" }: { message?: string }): JSX.Element {
  throw new Error(message);
}

function Safe() {
  return <p>safe content</p>;
}

describe("SectionErrorBoundary", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("renders children when no error", () => {
    render(
      <SectionErrorBoundary name="Test">
        <Safe />
      </SectionErrorBoundary>,
    );
    expect(screen.getByText("safe content")).toBeInTheDocument();
  });

  it("renders fallback UI with the error message when a child throws", () => {
    render(
      <SectionErrorBoundary name="Test">
        <Boom message="kaboom" />
      </SectionErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("โหลดส่วนนี้ไม่สำเร็จ")).toBeInTheDocument();
    expect(screen.getByText(/kaboom/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ลองใหม่/ })).toBeInTheDocument();
  });

  it("does not affect siblings outside the boundary when one section crashes", () => {
    render(
      <div>
        <p>outside content</p>
        <SectionErrorBoundary name="Crash">
          <Boom />
        </SectionErrorBoundary>
        <p>another sibling</p>
      </div>,
    );
    expect(screen.getByText("outside content")).toBeInTheDocument();
    expect(screen.getByText("another sibling")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders a custom fallback when provided", () => {
    render(
      <SectionErrorBoundary fallback={<div>custom fallback</div>}>
        <Boom />
      </SectionErrorBoundary>,
    );
    expect(screen.getByText("custom fallback")).toBeInTheDocument();
    expect(screen.queryByText("โหลดส่วนนี้ไม่สำเร็จ")).not.toBeInTheDocument();
  });

  it("recovers and renders children after retry when child no longer throws", () => {
    let shouldThrow = true;
    function Maybe() {
      if (shouldThrow) throw new Error("nope");
      return <p>recovered</p>;
    }

    const { rerender } = render(
      <SectionErrorBoundary name="Retry">
        <Maybe />
      </SectionErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: /ลองใหม่/ }));
    rerender(
      <SectionErrorBoundary name="Retry">
        <Maybe />
      </SectionErrorBoundary>,
    );
    expect(screen.getByText("recovered")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
