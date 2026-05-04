import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Short label of the section, e.g. "MessageList". Used in dev logs and aria. */
  name?: string;
  /** Optional custom fallback. If provided, replaces the default UI. */
  fallback?: ReactNode;
  /** Tailwind classes for fallback container sizing. */
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Lightweight error boundary for sub-sections of a page.
 * Keeps the rest of the page interactive when one section crashes.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[SectionErrorBoundary${this.props.name ? `:${this.props.name}` : ""}]`,
      error,
      info.componentStack,
    );
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;

    return (
      <div
        role="alert"
        aria-label={this.props.name ? `${this.props.name} error` : "Section error"}
        className={
          "m-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3 " +
          (this.props.className ?? "")
        }
      >
        <div className="h-9 w-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">โหลดส่วนนี้ไม่สำเร็จ</p>
          {import.meta.env.DEV ? (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 break-words">
              {this.state.error?.message ?? "Unknown error"}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              กรุณาลองใหม่อีกครั้ง
            </p>
          )}
          <button
            onClick={this.reset}
            className="mt-2 inline-flex items-center gap-1 h-8 px-3 rounded-full bg-background border border-border text-xs font-semibold hover:bg-muted transition-smooth"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }
}

export default SectionErrorBoundary;
