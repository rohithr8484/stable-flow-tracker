import { motion } from "framer-motion";
import { FileCheck, AlertTriangle, CheckCircle, Trophy, Crown, Medal, Award } from "lucide-react";
import Navbar from "@/components/Navbar";

const complianceItems = [
  { label: "AML Screening", status: "pass", detail: "All addresses cleared" },
  { label: "KYC Verification", status: "pass", detail: "Identity verified" },
  { label: "OFAC Check", status: "warning", detail: "1 flagged entity" },
  { label: "Travel Rule", status: "pass", detail: "Compliant" },
  { label: "Transaction Monitoring", status: "pass", detail: "No anomalies" },
  { label: "Sanctions Screening", status: "warning", detail: "Pending review" },
];

const statusIcon = {
  pass: <CheckCircle className="h-4 w-4 text-success" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning" />,
  fail: <AlertTriangle className="h-4 w-4 text-destructive" />,
};

type LeaderRow = {
  rank: number;
  alias: string;
  address: string;
  txCount: number;
  volume: string;
  score: number;
};

const leaderboard: LeaderRow[] = [
  { rank: 1, alias: "Aurora Capital", address: "0x9c2f…41Ae", txCount: 4821, volume: "$182.4M", score: 98 },
  { rank: 2, alias: "vitalik.eth", address: "0xd8dA…6045", txCount: 3914, volume: "$144.7M", score: 96 },
  { rank: 3, alias: "Mezo Treasury", address: "0x2585…DfD", txCount: 3220, volume: "$121.2M", score: 95 },
  { rank: 4, alias: "Sigma Custody", address: "0x71fE…22bC", txCount: 2887, volume: "$98.6M", score: 92 },
  { rank: 5, alias: "Helix Markets", address: "0xa90B…57e1", txCount: 2541, volume: "$84.1M", score: 90 },
  { rank: 6, alias: "BlockBridge OTC", address: "0xc3ee…1f09", txCount: 2103, volume: "$71.8M", score: 88 },
  { rank: 7, alias: "Vault42", address: "0x4f12…d8Aa", txCount: 1876, volume: "$58.4M", score: 86 },
  { rank: 8, alias: "Northwind LP", address: "0x88c1…904f", txCount: 1542, volume: "$47.9M", score: 84 },
  { rank: 9, alias: "RhinoFi Desk", address: "0x1ab9…3c70", txCount: 1311, volume: "$39.2M", score: 82 },
  { rank: 10, alias: "Quanta Trust", address: "0x6e44…b1Ce", txCount: 1108, volume: "$31.6M", score: 80 },
];

const rankAccent = (rank: number) => {
  if (rank === 1) return { Icon: Crown, color: "text-amber-500", bg: "bg-amber-500/15", ring: "ring-amber-500/30" };
  if (rank === 2) return { Icon: Trophy, color: "text-slate-400", bg: "bg-slate-400/15", ring: "ring-slate-400/30" };
  if (rank === 3) return { Icon: Medal, color: "text-orange-500", bg: "bg-orange-500/15", ring: "ring-orange-500/30" };
  return { Icon: Award, color: "text-muted-foreground", bg: "bg-muted", ring: "ring-border" };
};

const Compliance = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Compliance Dashboard</h1>

        {/* Leaderboard */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary mb-1">
                <Trophy className="h-3.5 w-3.5" /> Leaderboard
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground">Top Users by Transaction Volume</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Ranked by total monitored transactions across BTC, MUSD and Mezo networks (last 30 days).
              </p>
            </div>
          </div>

          {/* Podium top 3 */}
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            {leaderboard.slice(0, 3).map((row, i) => {
              const { Icon, color, bg, ring } = rankAccent(row.rank);
              return (
                <motion.div
                  key={row.address}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-xl border border-border/60 bg-secondary/40 p-4 ring-1 ${ring}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-heading font-semibold text-foreground truncate">{row.alias}</div>
                      <div className="text-xs text-muted-foreground font-mono truncate">{row.address}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Txs</div>
                      <div className="font-heading font-bold text-foreground">{row.txCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Volume</div>
                      <div className="font-heading font-bold text-foreground">{row.volume}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</div>
                      <div className="font-heading font-bold text-accent">{row.score}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Rest of leaderboard */}
          <div className="overflow-hidden rounded-lg border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 w-12">#</th>
                  <th className="text-left px-4 py-2">User</th>
                  <th className="text-right px-4 py-2">Transactions</th>
                  <th className="text-right px-4 py-2 hidden sm:table-cell">Volume</th>
                  <th className="text-right px-4 py-2">Compliance</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(3).map((row) => (
                  <tr key={row.address} className="border-t border-border/50 hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-mono">{row.rank}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{row.alias}</div>
                      <div className="text-xs text-muted-foreground font-mono">{row.address}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-heading font-semibold text-foreground">
                      {row.txCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">{row.volume}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center justify-end px-2 py-0.5 rounded-md text-xs font-semibold ${
                          row.score >= 90
                            ? "bg-success/15 text-success"
                            : row.score >= 80
                              ? "bg-primary/15 text-primary"
                              : "bg-warning/15 text-warning"
                        }`}
                      >
                        {row.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Competitive positioning */}
        <div className="glass-card p-6 mb-8">
          <h3 className="font-heading text-xl font-bold text-foreground mb-4">Competitive Positioning</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              Compare your liquidity sources vs. competitors.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              Track relationship changes month-by-month.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              Understand where competitors get growth and where you can differentiate.
            </li>
          </ul>
        </div>

        {/* Compliance Checklist */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">Compliance Checklist</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {complianceItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50"
              >
                {statusIcon[item.status as keyof typeof statusIcon]}
                <div>
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Compliance;
