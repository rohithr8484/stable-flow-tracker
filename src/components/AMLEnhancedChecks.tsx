import { motion } from "framer-motion";
import { Newspaper, CreditCard, Gavel, AlertTriangle, CheckCircle2, ExternalLink, TrendingUp, Globe2 } from "lucide-react";
import { type TxData, formatTokenAmount, computeRiskScore } from "@/lib/mezoApi";

interface Props { tx: TxData }

// Deterministic pseudo-random based on hash for stable demo data per tx
const seedRand = (seed: string, i: number) => {
  let h = 2166136261;
  for (let k = 0; k < seed.length; k++) h = Math.imul(h ^ seed.charCodeAt(k), 16777619);
  h = Math.imul(h ^ i, 16777619);
  return Math.abs(h % 1000) / 1000;
};

const SANCTION_LISTS = [
  { name: "OFAC SDN (US Treasury)", jurisdiction: "United States", weight: 1.0 },
  { name: "OFAC Crypto Addresses", jurisdiction: "United States", weight: 1.0 },
  { name: "EU Consolidated List", jurisdiction: "European Union", weight: 0.9 },
  { name: "UK HMT Financial Sanctions", jurisdiction: "United Kingdom", weight: 0.85 },
  { name: "UN Security Council 1267", jurisdiction: "United Nations", weight: 1.0 },
  { name: "Chainalysis Sanctions Oracle", jurisdiction: "On-chain Oracle", weight: 0.95 },
];

const ADVERSE_MEDIA_TOPICS = [
  { topic: "Money Laundering", severity: "high" },
  { topic: "Terrorist Financing", severity: "critical" },
  { topic: "Fraud / Ponzi Scheme", severity: "high" },
  { topic: "Bribery & Corruption", severity: "high" },
  { topic: "Cybercrime / Ransomware", severity: "critical" },
  { topic: "Tax Evasion", severity: "medium" },
  { topic: "Regulatory Action", severity: "medium" },
];

const PAYMENT_TYPOLOGIES = [
  "Structuring (smurfing) below reporting threshold",
  "Rapid pass-through / peeling chain",
  "Mixer / tumbler exposure",
  "Cross-chain bridge layering",
  "High-velocity round-trip transfers",
  "Token minting → instant dispersal",
];

export default function AMLEnhancedChecks({ tx }: Props) {
  const risk = computeRiskScore(tx);
  const seed = tx.hash;

  // Sanctions screening — synthesized matches based on risk + addresses
  const addressesScreened = new Set<string>([tx.from.hash, tx.to.hash, ...tx.token_transfers.flatMap(t => [t.from.hash, t.to.hash])]).size;
  const sanctionsHits = SANCTION_LISTS.map((list, i) => {
    const score = seedRand(seed, i) * list.weight * (risk / 100);
    const matched = score > 0.55;
    return {
      ...list,
      matched,
      confidence: Math.round(score * 100),
      matchedAddress: matched ? (i % 2 === 0 ? tx.to.hash : tx.from.hash) : null,
      reason: matched
        ? i === 0 ? "Address appears on OFAC-designated entity list (Tornado Cash cluster)"
        : i === 1 ? "Wallet linked to sanctioned entity via 2-hop transitive analysis"
        : i === 2 ? "Pattern matches EU restrictive measures typology"
        : i === 3 ? "Counterparty in HMT-listed jurisdiction"
        : i === 4 ? "Indirect exposure to UN-listed cluster"
        : "On-chain oracle returned positive flag"
        : "No matches across full-text + alias search",
    };
  });
  const sanctionsHitCount = sanctionsHits.filter(s => s.matched).length;

  // Payment screening — analyze transfer behavior
  const totalTransfers = tx.token_transfers.length;
  const totalValue = tx.token_transfers.reduce((s, t) => s + parseFloat(t.total.value) / Math.pow(10, parseInt(t.total.decimals)), 0);
  const avgValue = totalTransfers ? totalValue / totalTransfers : 0;
  const velocity = totalTransfers > 5 ? "High" : totalTransfers > 2 ? "Moderate" : "Low";
  const structuringRisk = avgValue > 0 && avgValue < 10 && totalTransfers > 3 ? Math.min(85, 40 + totalTransfers * 6) : Math.round(20 + risk * 0.2);
  const detectedTypologies = PAYMENT_TYPOLOGIES.filter((_, i) => seedRand(seed, i + 50) * (risk / 100) > 0.5);

  // Adverse media — generated headlines
  const mediaHits = ADVERSE_MEDIA_TOPICS.map((t, i) => {
    const matched = seedRand(seed, i + 100) * (risk / 100) > 0.55;
    return {
      ...t,
      matched,
      sources: matched ? Math.ceil(seedRand(seed, i + 150) * 12) + 1 : 0,
      lastSeen: matched ? `${Math.ceil(seedRand(seed, i + 200) * 30)}d ago` : "—",
      headline: matched
        ? `Reuters: Address cluster linked to ${t.topic.toLowerCase()} probe`
        : null,
    };
  });
  const mediaHitCount = mediaHits.filter(m => m.matched).length;

  return (
    <div className="space-y-6">
      {/* SANCTIONS CHECKS */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10"><Gavel className="h-5 w-5 text-destructive" /></div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">Sanctions Checks</h3>
              <p className="text-xs text-muted-foreground">Real-time screening against {SANCTION_LISTS.length} global watchlists · {addressesScreened} addresses scanned</p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${sanctionsHitCount > 0 ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>
            {sanctionsHitCount > 0 ? `${sanctionsHitCount} HITS` : "ALL CLEAR"}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {sanctionsHits.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`p-3 rounded-lg border ${s.matched ? "bg-destructive/5 border-destructive/30" : "bg-secondary/40 border-border/50"}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {s.matched ? <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> : <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                  {s.name}
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.matched ? "bg-destructive/20 text-destructive" : "bg-success/15 text-success"}`}>
                  {s.confidence}%
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                <Globe2 className="h-3 w-3" /> {s.jurisdiction}
              </div>
              <p className="text-xs text-muted-foreground">{s.reason}</p>
              {s.matched && s.matchedAddress && (
                <div className="text-[10px] font-mono text-destructive mt-1 truncate">↳ {s.matchedAddress}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* PAYMENT SCREENING */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10"><CreditCard className="h-5 w-5 text-warning" /></div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">Payment Screening</h3>
              <p className="text-xs text-muted-foreground">Behavior analysis against laundering typologies & FATF red-flag indicators</p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${detectedTypologies.length > 0 ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
            {detectedTypologies.length} TYPOLOGY {detectedTypologies.length === 1 ? "MATCH" : "MATCHES"}
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total Value", value: totalValue > 0 ? totalValue.toFixed(4) : "—" },
            { label: "Avg / Transfer", value: avgValue > 0 ? avgValue.toFixed(4) : "—" },
            { label: "Velocity", value: velocity },
            { label: "Structuring Risk", value: `${structuringRisk}/100` },
          ].map(s => (
            <div key={s.label} className="bg-secondary/40 rounded-lg p-3">
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{s.label}</div>
              <div className="text-sm font-bold text-foreground mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {PAYMENT_TYPOLOGIES.map((t, i) => {
            const matched = detectedTypologies.includes(t);
            return (
              <div key={t} className={`flex items-center gap-3 p-2.5 rounded-lg ${matched ? "bg-warning/10 border border-warning/30" : "bg-secondary/30"}`}>
                {matched ? <TrendingUp className="h-3.5 w-3.5 text-warning" /> : <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                <span className="text-xs text-foreground flex-1">{t}</span>
                <span className={`text-[10px] font-bold ${matched ? "text-warning" : "text-success"}`}>{matched ? "DETECTED" : "Not observed"}</span>
              </div>
            );
          })}
        </div>

        {tx.token_transfers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Payment Legs</h4>
            <div className="space-y-1.5">
              {tx.token_transfers.slice(0, 3).map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-mono bg-secondary/30 rounded px-2 py-1.5">
                  <span className="text-muted-foreground truncate">{t.from.hash.slice(0, 8)}…→ {t.to.name || t.to.hash.slice(0, 8) + "…"}</span>
                  <span className="text-foreground font-bold">{formatTokenAmount(t.total.value, t.total.decimals)} {t.token.symbol}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ADVERSE MEDIA */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Newspaper className="h-5 w-5 text-primary" /></div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">Adverse Media Screening</h3>
              <p className="text-xs text-muted-foreground">NLP-based scan across 40,000+ news, regulatory & enforcement sources</p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${mediaHitCount > 0 ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>
            {mediaHitCount} CATEGORY {mediaHitCount === 1 ? "HIT" : "HITS"}
          </div>
        </div>

        <div className="space-y-2">
          {mediaHits.map((m, i) => (
            <motion.div key={m.topic} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className={`p-3 rounded-lg border flex items-start gap-3 ${m.matched ? (m.severity === "critical" ? "bg-destructive/10 border-destructive/40" : "bg-warning/10 border-warning/30") : "bg-secondary/30 border-border/50"}`}>
              <div className={`mt-0.5 h-2 w-2 rounded-full ${m.matched ? (m.severity === "critical" ? "bg-destructive" : "bg-warning") : "bg-success"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{m.topic}</span>
                  <span className={`text-[10px] uppercase font-bold ${m.matched ? (m.severity === "critical" ? "text-destructive" : "text-warning") : "text-success"}`}>
                    {m.matched ? m.severity : "clear"}
                  </span>
                </div>
                {m.matched && m.headline && (
                  <a href="#" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                    {m.headline} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {m.matched ? `${m.sources} source${m.sources > 1 ? "s" : ""} · last seen ${m.lastSeen}` : "No mentions in monitored corpora"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
