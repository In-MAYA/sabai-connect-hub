import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  transparent?: boolean;
  className?: string;
  large?: boolean;
}

export function PageHeader({ title, subtitle, back, right, transparent, className, large }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header
      className={cn(
        "sticky top-0 z-30 safe-top",
        transparent ? "bg-transparent" : "bg-background/85 backdrop-blur-xl border-b border-border/60",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-4 h-14">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center transition-smooth"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className={cn("font-display font-bold truncate", large ? "text-2xl" : "text-lg")}>{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        {right && <div className="flex items-center gap-1">{right}</div>}
      </div>
    </header>
  );
}
