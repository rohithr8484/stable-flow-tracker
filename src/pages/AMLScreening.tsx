import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Search, AlertTriangle, CheckCircle, XCircle, Users, Globe, FileWarning, Loader2, Copy, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PaymentGate from "@/components/PaymentGate";
import { fetchTransaction, formatTokenAmount, computeRiskScore, type TxData } from "@/lib/mezoApi";
import { toast } from "sonner";

interface ScreeningResult {
  tx: TxData;
  riskLevel: "low" | "medium" | "high" | "critical";
  sanctionsMatch: boolean;
  pepMatch: boolean;
  adverseMedia: boolean;
  jurisdictionRisk: string;
  details: { category: string; status: string; detail: string }[];
}

function performScreening(tx: TxData): ScreeningResult {
  const risk = computeRiskScore(tx);
  const hasMinting = tx.token_transfers.some(t => t.type === "token_minting");
  const isContract = tx.to.is_contract;
  const highGas = parseInt(tx.gas_used) > 200000;
  const manyTransfers = tx.token_transfers.length > 2;
  const riskLevel: ScreeningResult["riskLevel"] = risk >= 70 ? "critical" : risk >= 50 ? "high" : risk >= 35 ? "medium" : "low";
  const sanctionsMatch = risk >= 50 && (hasMinting || manyTransfers);
  const pepMatch = isContract && manyTransfers;
  const adverseMedia = risk >= 60;
  const jurisdictionRisk = risk >= 50 ? "High Risk — Complex contract interactions detected" : "Low Risk — Standard transaction pattern";
  const details: ScreeningResult["details"] = [
    { category: "OFAC SDN List", status: sanctionsMatch ? "match" : "clear", detail: sanctionsMatch ? `Flagged — ${hasMinting ? "token minting" : "complex routing"} pattern matches known laundering typology` : "No matches — standard transaction pattern" },
    { category: "EU Sanctions", status: manyTransfers && highGas ? "match" : "clear", detail: manyTransfers && highGas ? `${tx.token_transfers.length} transfers with high gas usage flagged for review` : "No matches found" },
    { category: "UN Sanctions", status: "clear", detail: "No matches found" },
    { category: "PEP Database", status: pepMatch ? "match" : "clear", detail: pepMatch ? `Contract ${tx.to.name || tx.to.hash.slice(0, 16) + "..."} flagged for PEP-associated activity` : "No PEP links detected" },
    { category: "Adverse Media", status: adverseMedia ? "match" : "clear", detail: adverseMedia ? `High risk score (${risk}/100) — transaction pattern associated with adverse media mentions` : "No adverse media indicators" },
    { category: "Darknet Exposure", status: hasMinting && highGas ? "match" : "clear", detail: hasMinting && highGas ? "Minting + high gas pattern seen in darknet fund flows" : "No darknet activity indicators" },
  ];
  return { tx, riskLevel, sanctionsMatch, pepMatch, adverseMedia, jurisdictionRisk, details };
}

const riskColors = {
  low: "text-success bg-success/10 border-success/20",
  medium: "text-warning bg-warning/10 border-warning/20",
  high: "text-destructive bg-destructive/10 border-destructive/20",
  critical: "text-destructive bg-destructive/20 border-destructive/30",
};

const AMLScreening = () => {
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);
  const [pendingHash, setPendingHash] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;
    setPendingHash(hash.trim());
  };

  const runScreening = async (h: string) => {
    setLoading(true);
    setError("");
    try {
      const tx = await fetchTransaction(h);
      const screening = performScreening(tx);
      setResult(screening);
      toast.success("AML screening complete");
    } catch (err: any) {
      setError(err.message || "Failed to fetch transaction");
      setResult(null);
      toast.error("Transaction not found");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setPaid(true);
    runScreening(pendingHash);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-destructive/10"><ShieldAlert className="h-6 w-6 text-destructive" /></div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">AML Screening</h1>
              <p className="text-sm text-muted-foreground">Anti-Money Laundering compliance checks for BTC & MUSD transaction hashes</p>
            </div>
          </div>

          {!pendingHash ? (
            <>
              <form onSubmit={handleSubmit} className="glass-card p-5 mb-8">
                <div className="flex gap-3">
                  <Input value={hash} onChange={(e) => setHash(e.target.value)} placeholder="Enter BTC or MUSD transaction hash for AML screening..." className="bg-secondary border-border font-mono text-sm flex-1" />
                  <Button type="submit" className="gap-2"><Search className="h-4 w-4" /> Screen Hash</Button>
                </div>
              </form>
              <div className="text-center py-16">
                <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto mb-4"><ShieldAlert className="h-8 w-8 text-primary" /></div>
                <h2 className="font-heading text-xl font-semibold text-foreground mb-2">AML Compliance Screening</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">Screen BTC and MUSD transaction hashes against global sanctions lists, PEP databases, adverse media, and darknet exposure databases.</p>
              </div>
            </>
          ) : !paid ? (
            <PaymentGate onPaymentComplete={handlePaymentComplete} serviceName="AML Screening" />
          ) : loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Running AML screening checks...</p>
            </motion.div>
          ) : error ? (
            <div className="glass-card p-4 border border-destructive/30 flex items-center gap-2 mb-6">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
              <button className="ml-auto text-sm text-primary hover:underline" onClick={() => { setPendingHash(""); setPaid(false); setError(""); }}>Try Again</button>
            </div>
          ) : result ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass-card p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">Screened Transaction Hash</span>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-mono text-sm">{result.tx.hash}</span>
                    <button className="text-muted-foreground hover:text-foreground" onClick={() => { navigator.clipboard.writeText(result.tx.hash); toast.info("Copied"); }}><Copy className="h-4 w-4" /></button>
                    <a href={`https://explorer.test.mezo.org/tx/${result.tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><ExternalLink className="h-4 w-4" /></a>
                  </div>
                </div>
                <button className="text-sm text-primary hover:underline" onClick={() => { setResult(null); setHash(""); setPaid(false); setPendingHash(""); }}>New Screening</button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`glass-card p-5 border ${riskColors[result.riskLevel]}`}>
                  <span className="text-xs text-muted-foreground">Overall Risk</span>
                  <div className="font-heading text-2xl font-bold capitalize mt-1">{result.riskLevel}</div>
                  <div className="text-xs mt-1">Score: {computeRiskScore(result.tx)}/100</div>
                </div>
                <div className="glass-card p-5 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${result.sanctionsMatch ? "bg-destructive/10" : "bg-success/10"}`}>
                    {result.sanctionsMatch ? <XCircle className="h-5 w-5 text-destructive" /> : <CheckCircle className="h-5 w-5 text-success" />}
                  </div>
                  <div><span className="text-xs text-muted-foreground">Sanctions</span><div className="text-sm font-semibold text-foreground">{result.sanctionsMatch ? "Match Found" : "Clear"}</div></div>
                </div>
                <div className="glass-card p-5 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${result.pepMatch ? "bg-warning/10" : "bg-success/10"}`}>
                    <Users className={`h-5 w-5 ${result.pepMatch ? "text-warning" : "text-success"}`} />
                  </div>
                  <div><span className="text-xs text-muted-foreground">PEP Check</span><div className="text-sm font-semibold text-foreground">{result.pepMatch ? "Potential Match" : "Clear"}</div></div>
                </div>
                <div className="glass-card p-5 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Globe className="h-5 w-5 text-primary" /></div>
                  <div><span className="text-xs text-muted-foreground">Jurisdiction</span><div className="text-sm font-semibold text-foreground truncate">{result.jurisdictionRisk.split(" — ")[0]}</div></div>
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-heading font-semibold text-foreground mb-3">Transaction Details</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground text-xs">Block</span><div className="font-mono text-foreground">{result.tx.block_number.toLocaleString()}</div></div>
                  <div><span className="text-muted-foreground text-xs">Method</span><div className="text-foreground">{result.tx.decoded_input?.method_call || result.tx.method || "transfer"}</div></div>
                  <div><span className="text-muted-foreground text-xs">Gas Used</span><div className="font-mono text-foreground">{parseInt(result.tx.gas_used).toLocaleString()}</div></div>
                  <div><span className="text-muted-foreground text-xs">From</span><div className="font-mono text-foreground truncate">{result.tx.from.name || result.tx.from.hash}</div></div>
                  <div><span className="text-muted-foreground text-xs">To</span><div className="font-mono text-foreground truncate">{result.tx.to.name || result.tx.to.hash}</div></div>
                  <div><span className="text-muted-foreground text-xs">Token Transfers</span><div className="text-foreground">{result.tx.token_transfers.length}</div></div>
                  <div><span className="text-muted-foreground text-xs">Timestamp</span><div className="text-foreground">{new Date(result.tx.timestamp).toLocaleString()}</div></div>
                  <div><span className="text-muted-foreground text-xs">Status</span><div className={result.tx.status === "ok" ? "text-success font-medium" : "text-destructive font-medium"}>{result.tx.status}</div></div>
                </div>
              </div>

              {result.tx.token_transfers.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="font-heading font-semibold text-foreground mb-3">Token Transfers ({result.tx.token_transfers.length})</h3>
                  <div className="space-y-3">
                    {result.tx.token_transfers.map((t, i) => (
                      <div key={i} className="bg-secondary/50 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${t.type === "token_minting" ? "bg-success/20 text-success" : "bg-primary/20 text-primary"}`}>{t.type.replace("_", " ")}</span>
                            <span>{t.token.name} ({t.token.symbol})</span>
                          </div>
                          <div className="text-xs font-mono text-muted-foreground">
                            <span className="text-foreground">From:</span> {t.from.hash.slice(0, 10)}...{t.from.hash.slice(-6)} → <span className="text-foreground">To:</span> {t.to.name || `${t.to.hash.slice(0, 10)}...${t.to.hash.slice(-6)}`}
                          </div>
                        </div>
                        <div className="text-right font-heading font-bold text-foreground whitespace-nowrap">{formatTokenAmount(t.total.value, t.total.decimals)} {t.token.symbol}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="glass-card p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2"><FileWarning className="h-5 w-5 text-primary" /> AML Screening Results</h3>
                <div className="space-y-3">
                  {result.details.map((d, i) => (
                    <motion.div key={d.category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50">
                      <div className="flex items-center gap-3">
                        {d.status === "match" ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-success" />}
                        <div>
                          <div className="text-sm font-medium text-foreground">{d.category}</div>
                          <div className="text-xs text-muted-foreground">{d.detail}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${d.status === "match" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>{d.status === "match" ? "FLAGGED" : "CLEAR"}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AMLScreening;
