import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  reload = () => {
    window.location.reload();
  };

  goHome = () => {
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    const message = this.state.error?.message ?? "Unknown error";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-sky px-6">
        <div className="phone-frame bg-background w-full max-w-md rounded-3xl shadow-glow p-8 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mb-5">
            <AlertTriangle className="h-10 w-10" strokeWidth={2.2} />
          </div>
          <h1 className="font-display font-bold text-xl">เกิดข้อผิดพลาด</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            มีบางอย่างผิดพลาด ลองรีเฟรชหน้าหรือกลับไปหน้าหลัก
          </p>

          <details className="mt-4 w-full text-left">
            <summary className="text-[11px] text-muted-foreground cursor-pointer select-none">
              รายละเอียด
            </summary>
            <pre className="mt-2 text-[11px] font-mono bg-muted/60 rounded-xl p-3 overflow-auto max-h-40 whitespace-pre-wrap break-words">
              {message}
            </pre>
          </details>

          <div className="mt-6 w-full grid grid-cols-2 gap-2">
            <Button
              onClick={this.reload}
              className="h-12 rounded-2xl bg-gradient-primary font-semibold shadow-glow"
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              รีเฟรช
            </Button>
            <Button
              onClick={this.goHome}
              variant="outline"
              className="h-12 rounded-2xl font-semibold"
            >
              <Home className="h-4 w-4 mr-1.5" />
              หน้าหลัก
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
