import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquare, Lightbulb, AlertTriangle, CheckCircle, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import TransactionFlowDiagram from "@/components/TransactionFlowDiagram";
import RiskGauge from "@/components/RiskGauge";

// Simulate analysis based on input
const generateAnalysis = (query: string) => {
  const isBTC = query.startsWith("bc1") || query.startsWith("1") || query.startsWith("3") || query.toLowerCase().includes("btc");
  const currency = isBTC ? "BTC" : "MUSD";

  const nodes = [
    { id: "1", label: isBTC ? "Coinbase Hot Wallet" : "MUSD Minter", amount: isBTC ? "4.8163" : "50000", currency, type: "source" as const },
    { id: "2", label: query.slice(0, 14) + "...", amount: isBTC ? "0.0175" : "1200", currency, type: "source" as const },
    { id: "3", label: "Unknown Cluster", amount: isBTC ? "0.9856" : "8400", currency: isBTC ? "BTC" : "MUSD", type: "source" as const },
    { id: "4", label: isBTC ? "Mixer / CoinJoin" : "DEX Router", amount: isBTC ? "5.819" : "59600", currency, type: "intermediary" as const },
    { id: "5", label: isBTC ? "1P5ZEDWtKTF..." : "0x7a250d56...", amount: isBTC ? "4.810" : "42000", currency, type: "destination" as const },
    { id: "6", label: isBTC ? "Binance Deposit" : "Treasury Vault", amount: isBTC ? "1.009" : "17600", currency, type: "destination" as const },
  ];

  const edges = [
    { from: "1", to: "4" },
    { from: "2", to: "4" },
    { from: "3", to: "4" },
    { from: "4", to: "5" },
    { from: "4", to: "6" },
  ];

  const riskScore = Math.floor(Math.random() * 60) + 15;

  const findings = [
    { severity: riskScore > 50 ? "high" : "medium", text: isBTC ? "Address linked to mixer activity (CoinJoin detected)" : "MUSD routed through unverified DEX contracts" },
    { severity: "low", text: `${isBTC ? "3" : "5"} counterparty addresses identified in cluster analysis` },
    { severity: riskScore > 40 ? "medium" : "low", text: `Indirect exposure to ${isBTC ? "sanctioned jurisdiction" : "flagged liquidity pools"}` },
    { severity: "info", text: `First transaction: ${isBTC ? "2021-03-14" : "2023-08-22"} | Last: 2025-04-01` },
  ];

  return { nodes, edges, riskScore, findings, currency };
};

const severityStyles = {
  high: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  medium: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10 border-warning/20" },
  low: { icon: CheckCircle, color: "text-success", bg: "bg-success/10 border-success/20" },
  info: { icon: Clock, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
};

const suggestedActions = ["Find off-ramps", "Investigate address", "Trace MUSD flow", "Check counterparties"];

const Investigation = () => {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ReturnType<typeof generateAnalysis> | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const runSearch = (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setQuery(q);

    // Simulate async analysis
    setTimeout(() => {
      const result = generateAnalysis(q);
      setAnalysis(result);
      setHistory((prev) => [q, ...prev.filter((h) => h !== q)].slice(0, 10));
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Investigation</h1>

          {/* Search */}
          <div className="glass-card p-4 mb-8">
            <form
              onSubmit={(e) => { e.preventDefault(); runSearch(query); }}
              className="flex gap-3"
            >
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter BTC address, MUSD address, or contract address to investigate..."
                className="bg-secondary border-border font-mono text-sm flex-1"
              />
              <Button type="submit" className="gap-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Investigate
              </Button>
            </form>
            {history.length > 0 && searched && (
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="text-xs text-muted-foreground">Recent:</span>
                {history.slice(0, 5).map((h) => (
                  <button
                    key={h}
                    onClick={() => runSearch(h)}
                    className="text-xs font-mono text-primary hover:underline truncate max-w-[200px]"
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!searched ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto text-center py-16">
              <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-2">Investigative Assistant</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Enter a BTC address, MUSD address, or smart contract address to trace transaction flows, identify connected entities, and assess risk.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedActions.map((a) => (
                  <button
                    key={a}
                    onClick={() => runSearch(a)}
                    className="px-4 py-2 rounded-lg border border-primary/30 text-primary text-sm hover:bg-primary/10 transition-colors"
                  >
                    {a}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Analyzing address and tracing transaction flows...</p>
              <p className="text-xs text-muted-foreground mt-1">Scanning blockchain data for {query.slice(0, 20)}...</p>
            </motion.div>
          ) : analysis ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Tabs defaultValue="flow" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="flow">Transaction Flow</TabsTrigger>
                  <TabsTrigger value="findings">Findings & Risk</TabsTrigger>
                  <TabsTrigger value="trace">Trace Details</TabsTrigger>
                </TabsList>

                <TabsContent value="flow">
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <TransactionFlowDiagram nodes={analysis.nodes} edges={analysis.edges} />
                    </div>
                    <div className="space-y-6">
                      <div className="glass-card p-6 flex flex-col items-center">
                        <RiskGauge score={analysis.riskScore} size={180} />
                      </div>
                      <div className="glass-card p-5">
                        <h4 className="font-heading font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-warning" /> Recommended Next Steps
                        </h4>
                        <div className="space-y-2">
                          {suggestedActions.map((a) => (
                            <button
                              key={a}
                              onClick={() => runSearch(a)}
                              className="w-full text-left px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-between"
                            >
                              {a}
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="findings">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="font-heading font-semibold text-foreground mb-2">Analysis Findings</h3>
                      {analysis.findings.map((f, i) => {
                        const style = severityStyles[f.severity as keyof typeof severityStyles];
                        const Icon = style.icon;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-4 rounded-lg border ${style.bg}`}
                          >
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
                      <div className="flex justify-center mb-6">
                        <RiskGauge score={analysis.riskScore} size={160} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Currency</span>
                          <span className="text-foreground font-medium">{analysis.currency}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Nodes Traced</span>
                          <span className="text-foreground font-medium">{analysis.nodes.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Connections</span>
                          <span className="text-foreground font-medium">{analysis.edges.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sources</span>
                          <span className="text-foreground font-medium">{analysis.nodes.filter(n => n.type === "source").length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Destinations</span>
                          <span className="text-foreground font-medium">{analysis.nodes.filter(n => n.type === "destination").length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="trace">
                  <div className="glass-card p-6">
                    <h3 className="font-heading font-semibold text-foreground mb-4">Traced Entities</h3>
                    <div className="space-y-3">
                      {analysis.nodes.map((node, i) => (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              node.type === "source" ? "bg-primary" : node.type === "destination" ? "bg-accent" : "bg-warning"
                            }`} />
                            <div>
                              <div className="text-sm font-medium text-foreground">{node.label}</div>
                              <div className="text-xs text-muted-foreground capitalize">{node.type}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-mono text-foreground">{node.amount} {node.currency}</div>
                            <button
                              onClick={() => runSearch(node.label)}
                              className="text-xs text-primary hover:underline"
                            >
                              Investigate →
                            </button>
                          </div>
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
