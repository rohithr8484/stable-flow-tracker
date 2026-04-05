import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import AddressInput from "@/components/AddressInput";
import RiskGauge from "@/components/RiskGauge";
import TransferTable from "@/components/TransferTable";

const mockTransfers = [
  { id: "1", date: "May 02, 2023", time: "08:34:35", txHash: "0x897ecce1c5...", amount: "0.128698 MUSD", direction: "out" as const },
  { id: "2", date: "May 02, 2023", time: "08:34:35", txHash: "0x897ecce1c5...", amount: "1.01 BTC", direction: "in" as const },
  { id: "3", date: "May 02, 2023", time: "08:34:35", txHash: "0x897ecce1c5...", amount: "0.128698 MUSD", direction: "out" as const },
  { id: "4", date: "May 01, 2023", time: "14:21:10", txHash: "0xa32f8bc91e...", amount: "1.01 BTC", direction: "in" as const },
  { id: "5", date: "May 01, 2023", time: "14:21:10", txHash: "0xa32f8bc91e...", amount: "0.128698 MUSD", direction: "out" as const },
  { id: "6", date: "Apr 30, 2023", time: "22:05:44", txHash: "0xd19ae7f334...", amount: "1.01 BTC", direction: "in" as const },
];

const RiskAnalysis = () => {
  const [analyzed, setAnalyzed] = useState(false);
  const [addresses, setAddresses] = useState({ send: "", receive: "", liquidityPool: "" });

  const handleAnalyze = (addrs: { send: string; receive: string; liquidityPool: string }) => {
    setAddresses(addrs);
    setAnalyzed(true);
  };

  const displayAddr = addresses.send || "0x026c92534d268cb778b7f9c199785ec31808aaa";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Risk Analysis</h1>

          {!analyzed ? (
            <div className="max-w-xl mx-auto">
              <AddressInput onSubmit={handleAnalyze} />
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Address bar */}
              <div className="glass-card p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">Send Address</span>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-mono text-sm">{displayAddr}</span>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() => setAnalyzed(false)}
                >
                  New Analysis
                </button>
              </div>

              {/* All addresses summary */}
              {(addresses.receive || addresses.liquidityPool) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {addresses.receive && (
                    <div className="glass-card p-4">
                      <span className="text-xs text-muted-foreground">Receive Address</span>
                      <div className="text-primary font-mono text-sm truncate">{addresses.receive}</div>
                    </div>
                  )}
                  {addresses.liquidityPool && (
                    <div className="glass-card p-4">
                      <span className="text-xs text-muted-foreground">Liquidity Pool</span>
                      <div className="text-primary font-mono text-sm truncate">{addresses.liquidityPool}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Risk Score */}
                <div className="glass-card p-6 flex flex-col items-center">
                  <RiskGauge score={23} size={220} />
                  <div className="mt-4 text-xs text-muted-foreground">Last evaluated 2 mins ago</div>
                </div>

                {/* Summary cards */}
                <div className="space-y-4">
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <ArrowDownCircle className="h-3.5 w-3.5" /> Received
                    </div>
                    <div className="font-heading text-2xl font-bold text-foreground">0.328459 MUSD</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-success/20 text-success font-medium">+32%</span>
                    </div>
                  </div>
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <ArrowUpCircle className="h-3.5 w-3.5" /> Sent
                    </div>
                    <div className="font-heading text-2xl font-bold text-foreground">1.328459 MUSD</div>
                  </div>
                </div>

                {/* Risk breakdown */}
                <div className="space-y-4">
                  {[
                    { label: "Incoming Risk", score: 50, level: "Medium", color: "bg-warning" },
                    { label: "Outgoing Risk", score: 10, level: "High", color: "bg-destructive" },
                    { label: "Indirect Exposure", score: 45, level: "Medium", color: "bg-warning" },
                  ].map((r) => (
                    <div key={r.label} className="glass-card p-4">
                      <div className="text-xs text-muted-foreground mb-1">{r.label}</div>
                      <div className="font-heading text-xl font-bold text-foreground">
                        {r.score}<span className="text-sm text-muted-foreground font-normal">/100</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${r.color}/20 text-foreground font-medium mt-1 inline-block`}>
                        {r.level}
                      </span>
                      <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transfers */}
              <TransferTable transfers={mockTransfers} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
