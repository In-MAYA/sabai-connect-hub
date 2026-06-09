import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Send,
  Banknote,
  ShoppingBag,
  Gift,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Txn = {
  id: string;
  kind: "in" | "out";
  label: string;
  date: string;
  amount: number;
  icon: typeof ShoppingBag;
};

const seedTxns: Txn[] = [
  { id: "t1", kind: "in", label: "Top up · Mobile Banking", date: "Today · 10:24", amount: 500, icon: Plus },
  { id: "t2", kind: "out", label: "Sora Cafe · Sky Latte", date: "Today · 09:12", amount: -220, icon: ShoppingBag },
  { id: "t3", kind: "in", label: "Reward bonus", date: "Yesterday", amount: 50, icon: Gift },
  { id: "t4", kind: "out", label: "Transfer to @pim_ch", date: "2 days ago", amount: -180, icon: Send },
  { id: "t5", kind: "in", label: "Sale · Sky Pro Headphones", date: "3 days ago", amount: 1290, icon: Banknote },
];

export default function Wallet() {
  const { t } = useI18n();
  const [balance] = useState(1250);

  const notReady = (label: string) =>
    toast.info(label, { description: t("wallet.comingSoon") });

  const actions = [
    { icon: Plus, label: t("wallet.topup") },
    { icon: Send, label: t("wallet.transfer") },
    { icon: ArrowUpRight, label: t("wallet.withdraw") },
  ];

  return (
    <div className="pb-10">
      <PageHeader title={t("wallet.title")} back />

      {/* Balance card */}
      <div className="px-4 mt-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary text-primary-foreground p-5 shadow-glow">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -right-4 bottom-0 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2 opacity-90">
              <WalletIcon className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {t("wallet.balance")}
              </span>
            </div>
            <p className="mt-3 font-display text-4xl font-extrabold">
              ฿{balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-5 grid grid-cols-3 gap-3">
        {actions.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => notReady(label)}
            className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-muted/50 hover:bg-muted active:scale-95 transition-smooth"
          >
            <div className="h-11 w-11 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-soft">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold">{label}</span>
          </button>
        ))}
      </div>

      {/* History */}
      <div className="px-4 mt-7">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
          {t("wallet.history")}
        </h3>
        <div className="rounded-2xl border bg-card divide-y divide-border/60 overflow-hidden">
          {seedTxns.map((tx) => {
            const Icon = tx.icon;
            const isIn = tx.kind === "in";
            return (
              <div key={tx.id} className="flex items-center gap-3 px-3 py-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
                    isIn ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{tx.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{tx.date}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isIn ? (
                    <ArrowDownLeft className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />
                  )}
                  <span
                    className={cn(
                      "font-display font-bold text-sm",
                      isIn ? "text-success" : "text-destructive",
                    )}
                  >
                    {isIn ? "+" : "-"}฿{Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
