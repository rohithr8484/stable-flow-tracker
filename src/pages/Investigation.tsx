import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquare, Lightbulb, AlertTriangle, CheckCircle, Clock, ArrowRight, Loader2, Copy, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import TransactionFlowDiagram from "@/components/TransactionFlowDiagram";
import TransactionGraph from "@/components/TransactionGraph";
import EntityGraph from "@/components/EntityGraph";
import RiskGauge from "@/components/RiskGauge";
import PaymentGate from "@/components/PaymentGate";
import { fetchTransaction, formatTokenAmount, computeRiskScore, computeSubRisks, type TxData } from "@/lib/mezoApi";
import { toast } from "sonner";

const severityStyles = {
  high: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  medium: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10 border-warning/20" },
  low: { icon: CheckCircle, color: "text-success", bg: "bg-success/10 border-success/20" },
  info: { icon: Clock, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
};

function buildFlowFromTx(tx: TxData) {
  const nodes: { id: string; label: string; amount: string; currency: string; type: "source" | "intermediary" | "destination" }[] = [];
  const edges: { from: string; to: string }[] = [];
  const seenAddresses = new Map<string, string>();
  let nodeId = 1;
  const getNodeId = (hash: string, name: string | null, type: "source" | "intermediary" | "destination") => {
    if (seenAddresses.has(hash)) return seenAddresses.get(hash)!;
    const id = String(nodeId++);
    seenAddresses.set(hash, id);
    nodes.push({ id, label: name || `${hash.slice(0, 10)}...${hash.slice(-6)}`, amount: "", currency: "", type });
    return id;
  };
  const fromId = getNodeId(tx.from.hash, tx.from.name, "source");
  const contractId = tx.to.is_contract
    ? getNodeId(tx.to.hash, tx.to.name || tx.to.implementations?.[0]?.name || "Contract", "intermediary")
    : getNodeId(tx.to.hash, tx.to.name, "destination");
  edges.push({ from: fromId, to: contractId });
  tx.token_transfers.forEach((t) => {
    const amt = formatTokenAmount(t.total.value, t.total.decimals);
    const srcId = getNodeId(t.from.hash, t.from.name, "source");
    const dstId = getNodeId(t.to.hash, t.to.name, "destination");
    const srcNode = nodes.find(n => n.id === srcId);
    if (srcNode && !srcNode.amount) { srcNode.amount = amt; srcNode.currency = t.token.symbol; }
    const dstNode = nodes.find(n => n.id === dstId);
    if (dstNode && !dstNode.amount) { dstNode.amount = amt; dstNode.currency = t.token.symbol; }
    if (!edges.some(e => e.from === srcId && e.to === dstId)) edges.push({ from: srcId, to: dstId });
  });
  return { nodes, edges };
}

function buildFindings(tx: TxData) {
  const risk = computeRiskScore(tx);
  const findings: { severity: string; text: string }[] = [];
  if (tx.to.is_contract) findings.push({ severity: risk > 50 ? "high" : "medium", text: `Interaction with smart contract: ${tx.to.name || tx.to.implementations?.[0]?.name || tx.to.hash.slice(0, 16) + "..."}` });
  if (tx.token_transfers.some(t => t.type === "token_minting")) findings.push({ severity: "high", text: "Token minting detected — new tokens created in this transaction" });
  if (tx.token_transfers.length > 2) findings.push({ severity: "medium", text: `Multiple token transfers (${tx.token_transfers.length}) indicate complex routing` });
  if (parseInt(tx.gas_used) > 200000) findings.push({ severity: "medium", text: `High gas consumption (${parseInt(tx.gas_used).toLocaleString()}) suggests complex contract execution` });
  const uniqueAddresses = new Set<string>();
  tx.token_transfers.forEach(t => { uniqueAddresses.add(t.from.hash); uniqueAddresses.add(t.to.hash); });
  findings.push({ severity: "low", text: `${uniqueAddresses.size} unique entities identified in transaction flow` });
  findings.push({ severity: "info", text: `Block #${tx.block_number.toLocaleString()} · ${tx.confirmations.toLocaleString()} confirmations · ${new Date(tx.timestamp).toLocaleString()}` });
  return findings;
}

const Investigation = () => {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txData, setTxData] = useState<TxData | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [paid, setPaid] = useState(false);
  const [pendingQuery, setPendingQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setPendingQuery(query.trim());
  };

  const runSearch = async (q: string) => {
    setLoading(true);
    setSearched(true);
    setQuery(q);
    setError("");
    try {
      const tx = await fetchTransaction(q);
      setTxData(tx);
      setHistory((prev) => [q, ...prev.filter((h) => h !== q)].slice(0, 10));
      toast.success("Transaction investigation complete");
    } catch (err: any) {
      setError(err.message || "Failed to fetch transaction");
      setTxData(null);
      toast.error("Transaction not found");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setPaid(true);
    runSearch(pendingQuery);
  };

  const riskScore = txData ? computeRiskScore(txData) : 0;
  const subRisks = txData ? computeSubRisks(txData) : { incoming: 0, outgoing: 0, indirect: 0 };
  const flow = txData ? buildFlowFromTx(txData) : null;
  const findings = txData ? buildFindings(txData) : [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Investigation</h1>

          {!pendingQuery ? (
            <>
              <div className="glass-card p-4 mb-8">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter BTC or MUSD transaction hash to investigate..." className="bg-secondary border-border font-mono text-sm flex-1" />
                  <Button type="submit" className="gap-2"><Search className="h-4 w-4" /> Investigate</Button>
                </form>
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto text-center py-16">
                <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto mb-4"><MessageSquare className="h-8 w-8 text-primary" /></div>
                <h2 className="font-heading text-xl font-semibold text-foreground mb-2">Investigative Assistant</h2>
                <p className="text-sm text-muted-foreground mb-6">Enter a BTC transaction hash, MUSD hash, or smart contract hash to trace transaction flows, identify connected entities, and assess risk.</p>
              </motion.div>
            </>
          ) : !paid ? (
            <PaymentGate onPaymentComplete={handlePaymentComplete} serviceName="Investigation" />
          ) : loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Fetching on-chain data and tracing transaction flows...</p>
            </motion.div>
          ) : error ? (
            <div className="glass-card p-4 border border-destructive/30 flex items-center gap-2 mb-6">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
              <button className="ml-auto text-sm text-primary hover:underline" onClick={() => { setPendingQuery(""); setPaid(false); setError(""); }}>Try Again</button>
            </div>
          ) : txData ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass-card p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">Transaction Hash</span>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-mono text-sm">{txData.hash}</span>
                    <button className="text-muted-foreground hover:text-foreground" onClick={() => { navigator.clipboard.writeText(txData.hash); toast.info("Copied"); }}><Copy className="h-4 w-4" /></button>
                    <a href={`https://explorer.test.mezo.org/tx/${txData.hash}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><ExternalLink className="h-4 w-4" /></a>
                  </div>
                </div>
                <button className="text-sm text-primary hover:underline" onClick={() => { setSearched(false); setTxData(null); setQuery(""); setPaid(false); setPendingQuery(""); }}>New Investigation</button>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-heading font-semibold text-foreground mb-3">Transaction Details</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground text-xs">Block</span><div className="font-mono text-foreground">{txData.block_number.toLocaleString()}</div></div>
                  <div><span className="text-muted-foreground text-xs">Method</span><div className="text-foreground">{txData.decoded_input?.method_call || txData.method || "transfer"}</div></div>
                  <div><span className="text-muted-foreground text-xs">Gas Used</span><div className="font-mono text-foreground">{parseInt(txData.gas_used).toLocaleString()}</div></div>
                  <div><span className="text-muted-foreground text-xs">Confirmations</span><div className="font-mono text-foreground">{txData.confirmations.toLocaleString()}</div></div>
                  <div><span className="text-muted-foreground text-xs">From</span><div className="font-mono text-foreground truncate">{txData.from.name || txData.from.hash}</div></div>
                  <div><span className="text-muted-foreground text-xs">To</span><div className="font-mono text-foreground truncate">{txData.to.name || txData.to.hash}</div></div>
                  <div><span className="text-muted-foreground text-xs">Timestamp</span><div className="text-foreground">{new Date(txData.timestamp).toLocaleString()}</div></div>
                  <div><span className="text-muted-foreground text-xs">Status</span><div className={txData.status === "ok" ? "text-success font-medium" : "text-destructive font-medium"}>{txData.status}</div></div>
                </div>
              </div>

              <Tabs defaultValue="flow" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="flow">Transaction Flow</TabsTrigger>
                  <TabsTrigger value="findings">Findings & Risk</TabsTrigger>
                  <TabsTrigger value="trace">Connected Entities</TabsTrigger>
                </TabsList>

                <TabsContent value="flow">
                  <div className="mb-6 space-y-6">
                    {txData && <TransactionGraph tx={txData} title="Investigation Transaction Graph" />}
                    {txData && <EntityGraph tx={txData} />}
                  </div>
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">{flow && <TransactionFlowDiagram nodes={flow.nodes} edges={flow.edges} />}</div>
                    <div className="space-y-6">
                      <div className="glass-card p-6 flex flex-col items-center"><RiskGauge score={riskScore} size={180} /></div>
                      {txData.token_transfers.length > 0 && (
                        <div className="glass-card p-5">
                          <h4 className="font-heading font-semibold text-foreground text-sm mb-3">Token Transfers ({txData.token_transfers.length})</h4>
                          <div className="space-y-2">
                            {txData.token_transfers.map((t, i) => (
                              <div key={i} className="bg-secondary/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${t.type === "token_minting" ? "bg-success/20 text-success" : "bg-primary/20 text-primary"}`}>{t.type.replace("_", " ")}</span>
                                  <span>{t.token.symbol}</span>
                                </div>
                                <div className="text-xs font-mono text-muted-foreground">{t.from.hash.slice(0, 8)}... → {t.to.name || `${t.to.hash.slice(0, 8)}...`}</div>
                                <div className="text-sm font-bold text-foreground mt-1">{formatTokenAmount(t.total.value, t.total.decimals)} {t.token.symbol}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="findings">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="font-heading font-semibold text-foreground mb-2">Analysis Findings</h3>
                      {findings.map((f, i) => {
                        const style = severityStyles[f.severity as keyof typeof severityStyles];
                        const Icon = style.icon;
                        return (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`p-4 rounded-lg border ${style.bg}`}>
                            <div className="flex items-start gap-3">
                              <Icon className={`h-4 w-4 mt-0.5 ${style.color}`} />
                              <div>
                                <span className={`text-xs font-medium uppercase ${style.color}`}>{f.severity}</span>
                                <p className="text-sm text-foreground mt-1">{f.text}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    <div className="glass-card p-6">
                      <h3 className="font-heading font-semibold text-foreground mb-4">Risk Summary</h3>
                      <div className="flex justify-center mb-6"><RiskGauge score={riskScore} size={160} /></div>
                      <div className="space-y-3">
                        {[
                          { label: "Incoming Risk", value: subRisks.incoming },
                          { label: "Outgoing Risk", value: subRisks.outgoing },
                          { label: "Indirect Exposure", value: subRisks.indirect },
                        ].map(r => (
                          <div key={r.label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">{r.label}</span>
                              <span className="text-foreground font-medium">{r.value}/100</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${r.value > 60 ? "bg-destructive" : r.value > 35 ? "bg-warning" : "bg-success"}`} style={{ width: `${r.value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="trace">
                  <div className="glass-card p-6">
                    <h3 className="font-heading font-semibold text-foreground mb-4">Connected Entities</h3>
                    <div className="space-y-3">
                      {flow?.nodes.map((node, i) => (
                        <motion.div key={node.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50">
                          <div className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full ${node.type === "source" ? "bg-primary" : node.type === "destination" ? "bg-accent" : "bg-warning"}`} />
                            <div>
                              <div className="text-sm font-medium text-foreground font-mono">{node.label}</div>
                              <div className="text-xs text-muted-foreground capitalize">{node.type}</div>
                            </div>
                          </div>
                          {node.amount && (
                            <div className="text-right">
                              <div className="text-sm font-bold text-foreground">{node.amount} {node.currency}</div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Investigation;
