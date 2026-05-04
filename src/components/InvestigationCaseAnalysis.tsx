import { motion } from "framer-motion";
import { GitBranch, Fingerprint, ScanSearch, Route, ShieldAlert, TimerReset } from "lucide-react";
import { formatTokenAmount, type TxData } from "@/lib/mezoApi";

const short = (value: string) => `${value.slice(0, 10)}...${value.slice(-6)}`;

function analyzeCase(tx: TxData) {
  const uniqueAddresses = new Set<string>([tx.from.hash, tx.to.hash]);
  tx.token_transfers.forEach((t) => {
    uniqueAddresses.add(t.from.hash);
    uniqueAddresses.add(t.to.hash);
  });

  const fanOut = new Set(tx.token_transfers.map((t) => t.to.hash)).size;
  const fanIn = new Set(tx.token_transfers.map((t) => t.from.hash)).size;
  const hasMinting = tx.token_transfers.some((t) => t.type === "token_minting");
  const isContractMediated = tx.to.is_contract;
  const gasUsed = parseInt(tx.gas_used);
  const largestTransfer = tx.token_transfers.reduce(
    (largest, transfer) => {
      const formatted = formatTokenAmount(transfer.total.value, transfer.total.decimals);
      const numeric = parseFloat(formatted.replace(/,/g, ""));
      return numeric > largest.numeric
        ? { numeric, label: `${formatted} ${transfer.token.symbol}`, transfer }
        : largest;
    },
    { numeric: 0, label: tx.value || "0", transfer: null as TxData["token_transfers"][number] | null }
  );

  const routeComplexity = Math.min(100, 18 + tx.token_transfers.length * 14 + uniqueAddresses.size * 5 + (isContractMediated ? 12 : 0));
  const obfuscationScore = Math.min(100, (hasMinting ? 28 : 0) + (isContractMediated ? 24 : 0) + (fanOut > 2 ? 18 : 6) + (gasUsed > 200000 ? 18 : 8));
  const exitRisk = Math.min(100, fanOut * 16 + fanIn * 10 + (tx.status === "ok" ? 10 : 0));

  const pattern = hasMinting
    ? "Asset creation followed by downstream routing"
    : isContractMediated && tx.token_transfers.length > 1
      ? "Contract-mediated multi-hop distribution"
      : tx.token_transfers.length > 2
        ? "Layered distribution across multiple recipients"
        : "Direct transfer with limited layering";

  const hypothesis = hasMinting
    ? "Freshly minted assets were introduced and then dispersed, which can indicate synthetic liquidity bootstrapping or obfuscated origin creation."
    : isContractMediated
      ? "The transaction appears to use an intermediary contract as a control point before value reaches final beneficiaries."
      : "The flow is comparatively direct, but counterparties should still be profiled for downstream exposure.";

  const leads = [
    `Prioritize ${short(tx.to.hash)} as the operational control point${isContractMediated ? " because it mediated execution" : " based on value receipt"}.`,
    fanOut > 1
      ? `Review ${fanOut} recipient branches for consolidation or exchange-exit behavior.`
      : "Monitor the primary recipient for secondary outflows within the next few blocks.",
    largestTransfer.transfer
      ? `Largest observed leg is ${largestTransfer.label} from ${short(largestTransfer.transfer.from.hash)} to ${short(largestTransfer.transfer.to.hash)}.`
      : `Base transaction value should be compared against historical activity for ${short(tx.from.hash)}.`,
  ];

  const evidence = [
    { label: "Entry Point", value: short(tx.from.hash), note: "Initial sending wallet" },
    { label: "Control Node", value: short(tx.to.hash), note: isContractMediated ? "Smart-contract execution point" : "Primary recipient" },
    { label: "Behavior", value: pattern, note: `${uniqueAddresses.size} entities · ${tx.token_transfers.length} transfer legs` },
    { label: "Largest Leg", value: largestTransfer.label, note: largestTransfer.transfer ? `${short(largestTransfer.transfer.from.hash)} → ${short(largestTransfer.transfer.to.hash)}` : "No token transfer legs" },
  ];

  return {
    routeComplexity,
    obfuscationScore,
    exitRisk,
    pattern,
    hypothesis,
    leads,
    evidence,
  };
}

const scoreTone = (score: number) => {
  if (score >= 70) return "text-destructive";
  if (score >= 40) return "text-warning";
  return "text-success";
};

const meterTone = (score: number) => {
  if (score >= 70) return "bg-destructive";
  if (score >= 40) return "bg-warning";
  return "bg-success";
};

const InvestigationCaseAnalysis = ({ tx }: { tx: TxData }) => {
  const analysis = analyzeCase(tx);

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-heading font-semibold text-foreground">Investigation Pattern Analysis</h3>
          <p className="text-sm text-muted-foreground">A case-style interpretation of routing behavior, operational control points, and likely tracing priorities.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Route Complexity", value: analysis.routeComplexity, icon: Route },
          { label: "Obfuscation Signal", value: analysis.obfuscationScore, icon: Fingerprint },
          { label: "Exit Exposure", value: analysis.exitRisk, icon: ShieldAlert },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-lg border border-border/60 bg-secondary/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</span>
                <Icon className={`h-4 w-4 ${scoreTone(item.value)}`} />
              </div>
              <div className={`text-2xl font-heading font-bold ${scoreTone(item.value)}`}>{item.value}/100</div>
              <div className="mt-3 h-1.5 rounded-full bg-border/60 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${meterTone(item.value)}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="rounded-lg border border-border/60 bg-secondary/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Case Hypothesis</h4>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Observed Pattern</div>
              <div className="text-sm text-foreground">{analysis.pattern}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Analyst Interpretation</div>
              <div className="text-sm text-foreground leading-6">{analysis.hypothesis}</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-secondary/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TimerReset className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Priority Leads</h4>
          </div>
          <div className="space-y-3">
            {analysis.leads.map((lead, index) => (
              <div key={lead} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">{index + 1}</span>
                <p className="text-sm text-foreground leading-6">{lead}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-secondary/30 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ScanSearch className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">Evidentiary Anchors</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {analysis.evidence.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-lg border border-border/60 bg-background/40 p-4"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{item.label}</div>
              <div className="text-sm font-medium text-foreground break-all">{item.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.note}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestigationCaseAnalysis;
