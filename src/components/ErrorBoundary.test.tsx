import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";
import { SectionErrorBoundary } from "./SectionErrorBoundary";

function Boom({ message = "boom" }: { message?: string }): JSX.Element {
  throw new Error(message);
}

describe("Error logging", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("ErrorBoundary logs the error with tag, error object and component stack", () => {
    render(
      <ErrorBoundary>
        <Boom message="root-crash" />
      </ErrorBoundary>,
    );

    const tagged = errorSpy.mock.calls.find(
      (args) => typeof args[0] === "string" && args[0].includes("[ErrorBoundary]"),
    );
    expect(tagged).toBeDefined();

    const err = tagged!.find((a) => a instanceof Error) as Error | undefined;
    expect(err).toBeInstanceOf(Error);
    expect(err!.message).toBe("root-crash");

    const stack = tagged!.find(
      (a) => typeof a === "string" && /Boom|at\s/.test(a),
    );
    expect(stack).toBeDefined();
  });

  it("SectionErrorBoundary logs with the section name in the tag", () => {
    render(
      <SectionErrorBoundary name="MessageList">
        <Boom message="section-crash" />
      </SectionErrorBoundary>,
    );

    const tagged = errorSpy.mock.calls.find(
      (args) =>
        typeof args[0] === "string" &&
        args[0].includes("[SectionErrorBoundary:MessageList]"),
    );
    expect(tagged).toBeDefined();

    const err = tagged!.find((a) => a instanceof Error) as Error | undefined;
    expect(err?.message).toBe("section-crash");
  });

  it("renders fallback after logging without throwing again (no cascade crash)", () => {
    expect(() =>
      render(
        <ErrorBoundary>
          <SectionErrorBoundary name="Inner">
            <Boom message="inner" />
          </SectionErrorBoundary>
          <p>still here</p>
        </ErrorBoundary>,
      ),
    ).not.toThrow();

    // Outer boundary did not trigger — sibling content remains.
    expect(screen.getByText("still here")).toBeInTheDocument();
    // Inner section shows its fallback alert.
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("logs once per crash (does not loop / re-log on same error)", () => {
    render(
      <SectionErrorBoundary name="Once">
        <Boom message="single" />
      </SectionErrorBoundary>,
    );

    const tagged = errorSpy.mock.calls.filter(
      (args) =>
        typeof args[0] === "string" &&
        args[0].includes("[SectionErrorBoundary:Once]"),
    );
    expect(tagged).toHaveLength(1);
  });
});
