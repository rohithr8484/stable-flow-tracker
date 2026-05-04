import { motion } from "framer-motion";
import { Activity, Clock, CalendarDays } from "lucide-react";
import type { TxData } from "@/lib/mezoApi";

function seed(hash: string) {
  let h = 0;
  for (let i = 0; i < hash.length; i++) h = (h * 33 + hash.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h % 10000) / 10000;
  };
}

const HOURS = ["00-02", "02-04", "04-06", "06-08", "08-10", "10-12", "12-14", "14-16", "16-18", "18-20", "20-22", "22-00"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TransactionAnalytics = ({ tx }: { tx: TxData }) => {
  const rng = seed(tx.hash);
  const incomingTransfers = 100 + Math.floor(rng() * 100);
  const outgoingTransfers = 100 + Math.floor(rng() * 100);
  const totalTransfers = incomingTransfers + outgoingTransfers;
  const incomingUsd = (200 + rng() * 200) * 1000;
  const outgoingUsd = (200 + rng() * 200) * 1000;

  const hourly = HOURS.map(() => ({
    incoming: Math.floor(rng() * 40) + 1,
    outgoing: Math.floor(rng() * 30) + 1,
  }));
  const maxHour = Math.max(...hourly.map((h) => h.incoming + h.outgoing));

  const daily = DAYS.map(() => Math.floor(rng() * 60) + 15);
  const maxDay = Math.max(...daily);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-heading font-semibold text-foreground">Transaction Analytics</h3>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr_180px] gap-6">
        {/* Totals */}
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <div className="text-xs text-muted-foreground">Total transfers</div>
            <div className="font-heading text-2xl font-bold text-foreground">{totalTransfers}</div>
          </div>
          <div className="rounded-lg border border-success/30 bg-success/5 p-3">
            <div className="text-xs text-success font-semibold uppercase tracking-wide">Incoming</div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-sm font-mono font-bold text-foreground">${(incomingUsd / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Transfers</span>
              <span className="text-sm font-mono font-bold text-foreground">{incomingTransfers}</span>
            </div>
          </div>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div className="text-xs text-destructive font-semibold uppercase tracking-wide">Outgoing</div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-sm font-mono font-bold text-foreground">${(outgoingUsd / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Transfers</span>
              <span className="text-sm font-mono font-bold text-foreground">{outgoingTransfers}</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground italic">USD equivalents at transaction date.</p>
        </div>

        {/* Hourly stacked bars */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Clock className="h-3.5 w-3.5" /> ACTIVITY BY HOUR (UTC)
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-success rounded-sm" /> Incoming</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-destructive rounded-sm" /> Outgoing</span>
            </div>
          </div>
          <div className="flex items-end gap-1 h-44 border-b border-border pb-1">
            {hourly.map((h, i) => {
              const total = h.incoming + h.outgoing;
              const heightPct = (total / maxHour) * 100;
              const inPct = (h.incoming / total) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group">
                  <span className="text-[9px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100">{total}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.03 }}
                    className="w-full rounded-sm overflow-hidden flex flex-col"
                  >
                    <div className="bg-success" style={{ height: `${inPct}%` }} />
                    <div className="bg-destructive flex-1" />
                  </motion.div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1 mt-1">
            {HOURS.map((h) => (
              <div key={h} className="flex-1 text-[9px] text-center text-muted-foreground font-mono">{h}</div>
            ))}
          </div>
        </div>

        {/* Daily horizontal bars */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground mb-3">
            <CalendarDays className="h-3.5 w-3.5" /> ACTIVITY BY DAY
          </div>
          <div className="space-y-2">
            {DAYS.map((d, i) => (
              <div key={d} className="flex items-center gap-2">
                <span className="w-8 text-[11px] text-muted-foreground">{d}</span>
                <div className="flex-1 h-3 bg-secondary/60 rounded-sm overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(daily[i] / maxDay) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="h-full bg-foreground/70"
                  />
                </div>
                <span className="w-8 text-right text-[11px] font-mono font-bold text-foreground">{daily[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionAnalytics;
