import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, ArrowDownCircle, ArrowUpCircle, ExternalLink, AlertTriangle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import AddressInput from "@/components/AddressInput";
import RiskGauge from "@/components/RiskGauge";
import TransferTable from "@/components/TransferTable";
import PaymentGate from "@/components/PaymentGate";
import TransactionGraph from "@/components/TransactionGraph";
import { fetchTransaction, formatTokenAmount, computeRiskScore, computeSubRisks, type TxData } from "@/lib/mezoApi";
import { toast } from "sonner";

const RiskAnalysis = () => {
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hashes, setHashes] = useState({ send: "", receive: "", liquidityPool: "" });
  const [txResults, setTxResults] = useState<{ send?: TxData; receive?: TxData; liquidityPool?: TxData }>({});
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);
  const [pendingInput, setPendingInput] = useState<{ send: string; receive: string; liquidityPool: string } | null>(null);

  const handleAnalyze = (input: { send: string; receive: string; liquidityPool: string }) => {
    setPendingInput(input);
  };

  const executeAnalysis = async () => {
    if (!pendingInput) return;
    setLoading(true);
    setError("");
    setHashes(pendingInput);

    try {
      const results: { send?: TxData; receive?: TxData; liquidityPool?: TxData } = {};
      const fetches: Promise<void>[] = [];

      if (pendingInput.send) fetches.push(fetchTransaction(pendingInput.send).then(d => { results.send = d; }));
      if (pendingInput.receive) fetches.push(fetchTransaction(pendingInput.receive).then(d => { results.receive = d; }));
      if (pendingInput.liquidityPool) fetches.push(fetchTransaction(pendingInput.liquidityPool).then(d => { results.liquidityPool = d; }));

      await Promise.all(fetches);
      setTxResults(results);
      setAnalyzed(true);
      toast.success("Transaction analysis complete");
    } catch (err: any) {
      setError(err.message || "Failed to fetch transaction data");
      toast.error("Failed to analyze transaction");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setPaid(true);
    executeAnalysis();
  };

  const primaryTx = txResults.send || txResults.receive || txResults.liquidityPool;
  const riskScore = primaryTx ? computeRiskScore(primaryTx) : 0;
  const subRisks = primaryTx ? computeSubRisks(primaryTx) : { incoming: 0, outgoing: 0, indirect: 0 };

  const allTransfers = Object.entries(txResults).flatMap(([key, tx]) => {
    if (!tx) return [];
    return tx.token_transfers.map((t, i) => ({
      id: `${key}-${i}`,
      date: new Date(tx.timestamp).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      time: new Date(tx.timestamp).toLocaleTimeString("en-US", { hour12: false }),
      txHash: tx.hash.slice(0, 14) + "...",
      amount: `${formatTokenAmount(t.total.value, t.total.decimals)} ${t.token.symbol}`,
      direction: (t.type === "token_minting" ? "in" : key === "send" ? "out" : "in") as "in" | "out",
    }));
  });

  const totalReceived = Object.values(txResults).reduce((sum, tx) => {
    if (!tx) return sum;
    return sum + tx.token_transfers
      .filter(t => t.type === "token_minting" || t.type === "token_transfer")
      .reduce((s, t) => s + parseFloat(t.total.value) / Math.pow(10, parseInt(t.total.decimals)), 0);
  }, 0);

  const totalSent = txResults.send
    ? txResults.send.token_transfers
        .filter(t => t.type === "token_transfer")
        .reduce((s, t) => s + parseFloat(t.total.value) / Math.pow(10, parseInt(t.total.decimals)), 0)
    : 0;

  const primarySymbol = primaryTx?.token_transfers[0]?.token.symbol || "MUSD";

  const riskLevels = [
    { label: "Incoming Risk", score: subRisks.incoming, level: subRisks.incoming > 60 ? "High" : subRisks.incoming > 35 ? "Medium" : "Low", color: subRisks.incoming > 60 ? "bg-destructive" : subRisks.incoming > 35 ? "bg-warning" : "bg-success" },
    { label: "Outgoing Risk", score: subRisks.outgoing, level: subRisks.outgoing > 60 ? "High" : subRisks.outgoing > 35 ? "Medium" : "Low", color: subRisks.outgoing > 60 ? "bg-destructive" : subRisks.outgoing > 35 ? "bg-warning" : "bg-success" },
    { label: "Indirect Exposure", score: subRisks.indirect, level: subRisks.indirect > 60 ? "High" : subRisks.indirect > 35 ? "Medium" : "Low", color: subRisks.indirect > 60 ? "bg-destructive" : subRisks.indirect > 35 ? "bg-warning" : "bg-success" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Risk Analysis</h1>

          {!pendingInput ? (
            <div className="max-w-xl mx-auto">
              <AddressInput onSubmit={handleAnalyze} loading={loading} />
              {error && (
                <div className="mt-4 glass-card p-4 border border-destructive/30 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              )}
            </div>
          ) : !paid ? (
            <PaymentGate onPaymentComplete={handlePaymentComplete} serviceName="Risk Analysis" />
          ) : !analyzed ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Analyzing transactions...</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass-card p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">Send Transaction Hash</span>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-mono text-sm">{hashes.send || "N/A"}</span>
                    {hashes.send && (
                      <>
                        <button className="text-muted-foreground hover:text-foreground" onClick={() => { navigator.clipboard.writeText(hashes.send); toast.info("Copied"); }}>
                          <Copy className="h-4 w-4" />
                        </button>
                        <a href={`https://explorer.test.mezo.org/tx/${hashes.send}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <button className="text-sm text-primary hover:underline" onClick={() => { setAnalyzed(false); setTxResults({}); setPaid(false); setPendingInput(null); }}>
                  New Analysis
                </button>
              </div>

              {(hashes.receive || hashes.liquidityPool) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {hashes.receive && (
                    <div className="glass-card p-4">
                      <span className="text-xs text-muted-foreground">Receive Transaction Hash</span>
                      <div className="text-primary font-mono text-sm truncate">{hashes.receive}</div>
                      {txResults.receive && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Status: <span className={txResults.receive.status === "ok" ? "text-success" : "text-destructive"}>{txResults.receive.status}</span>
                          {" · "}{txResults.receive.confirmations} confirmations
                        </div>
                      )}
                    </div>
                  )}
                  {hashes.liquidityPool && (
                    <div className="glass-card p-4">
                      <span className="text-xs text-muted-foreground">Liquidity Pool Hash</span>
                      <div className="text-primary font-mono text-sm truncate">{hashes.liquidityPool}</div>
                      {txResults.liquidityPool && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Method: <span className="text-foreground">{txResults.liquidityPool.method || "transfer"}</span>
                          {" · "}{txResults.liquidityPool.token_transfers.length} token transfers
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {primaryTx && (
                <div className="glass-card p-5">
                  <h3 className="font-heading font-semibold text-foreground mb-3">Transaction Details</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-muted-foreground text-xs">Block</span><div className="font-mono text-foreground">{primaryTx.block_number.toLocaleString()}</div></div>
                    <div><span className="text-muted-foreground text-xs">Method</span><div className="text-foreground">{primaryTx.decoded_input?.method_call || primaryTx.method || "transfer"}</div></div>
                    <div><span className="text-muted-foreground text-xs">Gas Used</span><div className="font-mono text-foreground">{parseInt(primaryTx.gas_used).toLocaleString()}</div></div>
                    <div><span className="text-muted-foreground text-xs">Confirmations</span><div className="font-mono text-foreground">{primaryTx.confirmations.toLocaleString()}</div></div>
                    <div><span className="text-muted-foreground text-xs">From</span><div className="font-mono text-foreground truncate">{primaryTx.from.hash}</div></div>
                    <div><span className="text-muted-foreground text-xs">To</span><div className="font-mono text-foreground truncate">{primaryTx.to.name || primaryTx.to.hash}</div></div>
                    <div><span className="text-muted-foreground text-xs">Timestamp</span><div className="text-foreground">{new Date(primaryTx.timestamp).toLocaleString()}</div></div>
                    <div><span className="text-muted-foreground text-xs">Nonce</span><div className="font-mono text-foreground">{primaryTx.nonce}</div></div>
                  </div>
                </div>
              )}

              {primaryTx && primaryTx.token_transfers.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="font-heading font-semibold text-foreground mb-3">Token Transfers ({primaryTx.token_transfers.length})</h3>
                  <div className="space-y-3">
                    {primaryTx.token_transfers.map((t, i) => (
                      <div key={i} className="bg-secondary/50 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${t.type === "token_minting" ? "bg-success/20 text-success" : "bg-primary/20 text-primary"}`}>
                              {t.type.replace("_", " ")}
                            </span>
                            <span>{t.token.name} ({t.token.symbol})</span>
                          </div>
                          <div className="text-xs font-mono text-muted-foreground">
                            <span className="text-foreground">From:</span> {t.from.hash.slice(0, 10)}...{t.from.hash.slice(-6)}
                            {" → "}
                            <span className="text-foreground">To:</span> {t.to.name || `${t.to.hash.slice(0, 10)}...${t.to.hash.slice(-6)}`}
                          </div>
                        </div>
                        <div className="text-right font-heading font-bold text-foreground whitespace-nowrap">
                          {formatTokenAmount(t.total.value, t.total.decimals)} {t.token.symbol}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex flex-col items-center">
                  <RiskGauge score={riskScore} size={220} />
                  <div className="mt-4 text-xs text-muted-foreground">Evaluated from on-chain data</div>
                </div>
                <div className="space-y-4">
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><ArrowDownCircle className="h-3.5 w-3.5" /> Total Token Volume</div>
                    <div className="font-heading text-2xl font-bold text-foreground">{totalReceived.toLocaleString(undefined, { maximumFractionDigits: 4 })} {primarySymbol}</div>
                  </div>
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><ArrowUpCircle className="h-3.5 w-3.5" /> Sent Volume</div>
                    <div className="font-heading text-2xl font-bold text-foreground">{totalSent.toLocaleString(undefined, { maximumFractionDigits: 4 })} {primarySymbol}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {riskLevels.map((r) => (
                    <div key={r.label} className="glass-card p-4">
                      <div className="text-xs text-muted-foreground mb-1">{r.label}</div>
                      <div className="font-heading text-xl font-bold text-foreground">{r.score}<span className="text-sm text-muted-foreground font-normal">/100</span></div>
                      <span className={`text-xs px-2 py-0.5 rounded ${r.color}/20 text-foreground font-medium mt-1 inline-block`}>{r.level}</span>
                      <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {allTransfers.length > 0 && <TransferTable transfers={allTransfers} />}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
