import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquare, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import TransactionFlowDiagram from "@/components/TransactionFlowDiagram";
import RiskGauge from "@/components/RiskGauge";

const mockNodes = [
  { id: "1", label: "PulseX", amount: "4.8163411", currency: "BTC", type: "source" as const },
  { id: "2", label: "bc1qxy2kgdy...", amount: "0.0175462", currency: "BTC", type: "source" as const },
  { id: "3", label: "Undefined", amount: "0.98563421", currency: "MUSD", type: "source" as const },
  { id: "4", label: "Mixer Node", amount: "4.81034", currency: "BTC", type: "intermediary" as const },
  { id: "5", label: "1P5ZEDWtKTF...", amount: "4.81034", currency: "BTC", type: "destination" as const },
  { id: "6", label: "0x026c929...", amount: "42", currency: "MUSD", type: "destination" as const },
];

const mockEdges = [
  { from: "1", to: "4" },
  { from: "2", to: "4" },
  { from: "3", to: "4" },
  { from: "4", to: "5" },
  { from: "4", to: "6" },
];

const suggestedActions = ["Find off-ramps", "Investigate address", "Trace MUSD flow", "Check counterparties"];

const Investigation = () => {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Investigation</h1>

          {/* Search */}
          <div className="glass-card p-4 mb-8">
            <form
              onSubmit={(e) => { e.preventDefault(); setSearched(true); }}
              className="flex gap-3"
            >
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for tokens, addresses, entities..."
                className="bg-secondary border-border font-mono text-sm flex-1"
              />
              <Button type="submit" className="gap-2">
                <Search className="h-4 w-4" /> Investigate
              </Button>
            </form>
          </div>

          {!searched ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto text-center py-16">
              <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-2">Investigative Assistant</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Enter a BTC or MUSD address to trace transaction flows and identify connected entities.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedActions.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setQuery(a); setSearched(true); }}
                    className="px-4 py-2 rounded-lg border border-primary/30 text-primary text-sm hover:bg-primary/10 transition-colors"
                  >
                    {a}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TransactionFlowDiagram nodes={mockNodes} edges={mockEdges} />
                </div>
                <div className="space-y-6">
                  <div className="glass-card p-6 flex flex-col items-center">
                    <RiskGauge score={23} size={180} />
                  </div>
                  <div className="glass-card p-5">
                    <h4 className="font-heading font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-warning" /> Recommended Next Steps
                    </h4>
                    <div className="space-y-2">
                      {suggestedActions.map((a) => (
                        <button
                          key={a}
                          className="w-full text-left px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Investigation;
