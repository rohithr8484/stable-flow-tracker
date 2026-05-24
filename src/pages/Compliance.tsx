import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileCheck, AlertTriangle, CheckCircle, Trophy, Crown, Medal, Award, Loader2, Inbox } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { shortenAddress } from "@/lib/walletUtils";
import { useAccount } from "wagmi";

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
  address: string;
  total: number;
  uniqueActions: number;
  lastSeen: string;
};

const rankAccent = (rank: number) => {
  if (rank === 1) return { Icon: Crown, color: "text-amber-500", bg: "bg-amber-500/15", ring: "ring-amber-500/30" };
  if (rank === 2) return { Icon: Trophy, color: "text-slate-400", bg: "bg-slate-400/15", ring: "ring-slate-400/30" };
  if (rank === 3) return { Icon: Medal, color: "text-orange-500", bg: "bg-orange-500/15", ring: "ring-orange-500/30" };
  return { Icon: Award, color: "text-muted-foreground", bg: "bg-muted", ring: "ring-border" };
};

const computeScore = (total: number, unique: number) => {
  // Deterministic compliance score blending engagement breadth + depth, capped at 99.
  const breadth = Math.min(unique * 8, 56);
  const depth = Math.min(Math.log10(total + 1) * 18, 40);
  return Math.min(99, Math.round(40 + breadth + depth));
};

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
};

const Compliance = () => {
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { address: myAddress } = useAccount();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("wallet_activity")
        .select("address, action, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (cancelled) return;
      if (error || !data) {
        setRows([]);
        setLoading(false);
        return;
      }
      const map = new Map<string, { total: number; actions: Set<string>; lastSeen: string }>();
      for (const r of data) {
        const addr = (r.address as string).toLowerCase();
        const entry = map.get(addr) ?? { total: 0, actions: new Set<string>(), lastSeen: r.created_at as string };
        entry.total += 1;
        entry.actions.add(r.action as string);
        if (new Date(r.created_at as string) > new Date(entry.lastSeen)) entry.lastSeen = r.created_at as string;
        map.set(addr, entry);
      }
      const aggregated: LeaderRow[] = Array.from(map.entries())
        .map(([address, v]) => ({
          address,
          total: v.total,
          uniqueActions: v.actions.size,
          lastSeen: v.lastSeen,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 20);
      setRows(aggregated);
      setLoading(false);
    };
    void load();
    const channel = supabase
      .channel("wallet_activity_leaderboard")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "wallet_activity" }, () => void load())
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Compliance Dashboard</h1>

          <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary mb-1">
                  <Trophy className="h-3.5 w-3.5" /> Leaderboard
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground">Top Wallets by App Activity</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Live ranking of wallet addresses that have connected and interacted with this platform.
                </p>
              </div>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            {!loading && rows.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/60 p-10 text-center">
                <Inbox className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <div className="font-heading font-semibold text-foreground">No wallet activity yet</div>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Connect a wallet from the navbar and start using the analysis tools — your address will appear here ranked by activity.
                </p>
              </div>
            )}

            {top3.length > 0 && (
              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {top3.map((row, i) => {
                  const rank = i + 1;
                  const { Icon, color, bg, ring } = rankAccent(rank);
                  const isMe = myAddress?.toLowerCase() === row.address;
                  return (
                    <motion.div
                      key={row.address}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`rounded-xl border ${isMe ? "border-primary/50" : "border-border/60"} bg-secondary/40 p-4 ring-1 ${ring}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center`}>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-heading font-semibold text-foreground truncate flex items-center gap-2">
                            #{rank}
                            {isMe && <span className="text-[10px] uppercase tracking-wider text-primary">you</span>}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono truncate">
                            {shortenAddress(row.address)}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Actions</div>
                          <div className="font-heading font-bold text-foreground">{row.total}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Tools</div>
                          <div className="font-heading font-bold text-foreground">{row.uniqueActions}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</div>
                          <div className="font-heading font-bold text-accent">
                            {computeScore(row.total, row.uniqueActions)}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground text-center mt-2">
                        Last active {relativeTime(row.lastSeen)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {rest.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2 w-12">#</th>
                      <th className="text-left px-4 py-2">Wallet</th>
                      <th className="text-right px-4 py-2">Actions</th>
                      <th className="text-right px-4 py-2 hidden sm:table-cell">Tools used</th>
                      <th className="text-right px-4 py-2 hidden md:table-cell">Last active</th>
                      <th className="text-right px-4 py-2">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((row, i) => {
                      const rank = i + 4;
                      const score = computeScore(row.total, row.uniqueActions);
                      const isMe = myAddress?.toLowerCase() === row.address;
                      return (
                        <tr
                          key={row.address}
                          className={`border-t border-border/50 hover:bg-secondary/40 transition-colors ${isMe ? "bg-primary/5" : ""}`}
                        >
                          <td className="px-4 py-3 text-muted-foreground font-mono">{rank}</td>
                          <td className="px-4 py-3">
                            <div className="font-mono text-foreground text-xs flex items-center gap-2">
                              {shortenAddress(row.address)}
                              {isMe && (
                                <span className="text-[10px] uppercase tracking-wider text-primary">you</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-heading font-semibold text-foreground">
                            {row.total}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                            {row.uniqueActions}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                            {relativeTime(row.lastSeen)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-flex items-center justify-end px-2 py-0.5 rounded-md text-xs font-semibold ${
                                score >= 90
                                  ? "bg-success/15 text-success"
                                  : score >= 80
                                    ? "bg-primary/15 text-primary"
                                    : "bg-warning/15 text-warning"
                              }`}
                            >
                              {score}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
};

export default Compliance;
