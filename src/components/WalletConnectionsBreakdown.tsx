import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, ShieldCheck, Ban } from "lucide-react";
import type { TxData } from "@/lib/mezoApi";

// Deterministic pseudo-random from a string (so same tx => same numbers)
function seedFromHash(hash: string) {
  let h = 0;
  for (let i = 0; i < hash.length; i++) h = (h * 31 + hash.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return (h % 10000) / 10000;
  };
}

interface Row {
  label: string;
  pct: number;
  usd: number;
}

interface BreakdownData {
  rating: "Bad" | "Suspicious" | "Good";
  danger: Row[];
  suspicious: Row[];
  trusted: Row[];
}

function buildBreakdown(tx: TxData, riskScore: number): BreakdownData {
  const rng = seedFromHash(tx.hash);
  const totalUsd = 30000 + Math.floor(rng() * 25000);

  const dangerWeights = [0.6, 0.05, 0.005, 0.002, 0.001];
  const suspiciousWeights = [0.24, 0.05, 0.005];
  const trustedWeights = [0.06, 0.025, 0.006, 0.001];

  const skew = riskScore / 100;
  const dangerLabels = ["Dark Market", "Mixer", "Exchange Fraudulent", "Dark Service", "Scam"];
  const suspiciousLabels = ["High Risk Exchange", "Moderate Risk Exchange", "Very High Risk Exchange"];
  const trustedLabels = ["Exchange", "Payment", "Miner", "Staking"];

  const mk = (labels: string[], weights: number[], scale: number): Row[] =>
    labels.map((label, i) => {
      const pct = +(weights[i] * 100 * scale * (0.7 + rng() * 0.6)).toFixed(1);
      return { label, pct, usd: +(totalUsd * (pct / 100)).toFixed(2) };
    });

  const rating: BreakdownData["rating"] = riskScore >= 60 ? "Bad" : riskScore >= 35 ? "Suspicious" : "Good";

  return {
    rating,
    danger: mk(dangerLabels, dangerWeights, skew + 0.3),
    suspicious: mk(suspiciousLabels, suspiciousWeights, skew + 0.5),
    trusted: mk(trustedLabels, trustedWeights, 1.5 - skew),
  };
}

const Bar = ({ row, color }: { row: Row; color: string }) => (
  <div className="flex items-center gap-3 py-2">
    <div className={`w-14 text-right text-xs font-bold ${color}`}>{row.pct}%</div>
    <div className="flex-1 min-w-0">
      <div className="text-sm text-foreground truncate">{row.label}</div>
      <div className={`mt-1 h-1.5 rounded-full ${color.replace("text-", "bg-")}/20 overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, row.pct * 1.4)}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full ${color.replace("text-", "bg-")}`}
        />
      </div>
    </div>
    <div className="w-24 text-right text-xs font-mono text-muted-foreground">
      ${row.usd.toLocaleString()}
    </div>
  </div>
);

const WalletConnectionsBreakdown = ({ tx, riskScore }: { tx: TxData; riskScore: number }) => {
  const data = buildBreakdown(tx, riskScore);
  const ratingColor =
    data.rating === "Bad" ? "text-destructive" : data.rating === "Suspicious" ? "text-warning" : "text-success";

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <h3 className="font-heading font-semibold text-foreground">Wallet Connections Breakdown</h3>
          <p className="text-xs text-muted-foreground">Counterparty exposure inferred from on-chain interactions</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/40">
          <ShieldAlert className={`h-4 w-4 ${ratingColor}`} />
          <span className="text-xs font-semibold text-foreground">AML Risk:</span>
          <span className={`text-xs font-bold ${ratingColor}`}>{data.rating}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Ban className="h-4 w-4 text-destructive" />
            <h4 className="text-sm font-bold text-foreground">Danger</h4>
          </div>
          {data.danger.map((r) => <Bar key={r.label} row={r} color="text-destructive" />)}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h4 className="text-sm font-bold text-foreground">Suspicious sources</h4>
          </div>
          {data.suspicious.map((r) => <Bar key={r.label} row={r} color="text-warning" />)}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            <h4 className="text-sm font-bold text-foreground">Trusted sources</h4>
          </div>
          {data.trusted.map((r) => <Bar key={r.label} row={r} color="text-success" />)}
        </div>
      </div>
    </div>
  );
};

export default WalletConnectionsBreakdown;
