import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Search, AlertTriangle, CheckCircle, XCircle, Users, Globe, FileWarning, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

interface ScreeningResult {
  address: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  sanctionsMatch: boolean;
  pepMatch: boolean;
  adverseMedia: boolean;
  jurisdictionRisk: string;
  details: { category: string; status: string; detail: string }[];
}

const mockScreening = (address: string): ScreeningResult => {
  const isHigh = address.length % 3 === 0;
  return {
    address,
    riskLevel: isHigh ? "high" : address.length % 2 === 0 ? "medium" : "low",
    sanctionsMatch: isHigh,
    pepMatch: address.length % 5 === 0,
    adverseMedia: isHigh,
    jurisdictionRisk: isHigh ? "High Risk (Iran, DPRK)" : "Low Risk (US, EU)",
    details: [
      { category: "OFAC SDN List", status: isHigh ? "match" : "clear", detail: isHigh ? "Partial match found — review required" : "No matches found" },
      { category: "EU Sanctions", status: "clear", detail: "No matches found" },
      { category: "UN Sanctions", status: "clear", detail: "No matches found" },
      { category: "PEP Database", status: address.length % 5 === 0 ? "match" : "clear", detail: address.length % 5 === 0 ? "Potential PEP association" : "No PEP links" },
      { category: "Adverse Media", status: isHigh ? "match" : "clear", detail: isHigh ? "Negative news mentions detected" : "No adverse media found" },
      { category: "Darknet Exposure", status: isHigh ? "match" : "clear", detail: isHigh ? "Address seen on darknet markets" : "No darknet activity" },
    ],
  };
};

const riskColors = {
  low: "text-success bg-success/10 border-success/20",
  medium: "text-warning bg-warning/10 border-warning/20",
  high: "text-destructive bg-destructive/10 border-destructive/20",
  critical: "text-destructive bg-destructive/20 border-destructive/30",
};

const AMLScreening = () => {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);

  const runScreening = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResult(mockScreening(address));
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-destructive/10">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">AML Screening</h1>
              <p className="text-sm text-muted-foreground">Anti-Money Laundering compliance checks for BTC & MUSD addresses</p>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={runScreening} className="glass-card p-5 mb-8">
            <div className="flex gap-3">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter BTC or MUSD address for AML screening..."
                className="bg-secondary border-border font-mono text-sm flex-1"
              />
              <Button type="submit" className="gap-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Screen Address
              </Button>
            </div>
          </form>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Running AML screening checks...</p>
              <p className="text-xs text-muted-foreground mt-1">Checking sanctions lists, PEP databases, and adverse media</p>
            </motion.div>
          )}

          {!loading && !result && (
            <div className="text-center py-16">
              <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto mb-4">
                <ShieldAlert className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-2">AML Compliance Screening</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Screen BTC and MUSD addresses against global sanctions lists, PEP databases, adverse media, and darknet exposure databases.
              </p>
            </div>
          )}

          {!loading && result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Summary Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`glass-card p-5 border ${riskColors[result.riskLevel]}`}>
                  <span className="text-xs text-muted-foreground">Overall Risk</span>
                  <div className="font-heading text-2xl font-bold capitalize mt-1">{result.riskLevel}</div>
                </div>
                <div className="glass-card p-5 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${result.sanctionsMatch ? "bg-destructive/10" : "bg-success/10"}`}>
                    {result.sanctionsMatch ? <XCircle className="h-5 w-5 text-destructive" /> : <CheckCircle className="h-5 w-5 text-success" />}
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Sanctions</span>
                    <div className="text-sm font-semibold text-foreground">{result.sanctionsMatch ? "Match Found" : "Clear"}</div>
                  </div>
                </div>
                <div className="glass-card p-5 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${result.pepMatch ? "bg-warning/10" : "bg-success/10"}`}>
                    <Users className={`h-5 w-5 ${result.pepMatch ? "text-warning" : "text-success"}`} />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">PEP Check</span>
                    <div className="text-sm font-semibold text-foreground">{result.pepMatch ? "Potential Match" : "Clear"}</div>
                  </div>
                </div>
                <div className="glass-card p-5 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Jurisdiction</span>
                    <div className="text-sm font-semibold text-foreground truncate">{result.jurisdictionRisk.split(" (")[0]}</div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="glass-card p-4">
                <span className="text-xs text-muted-foreground">Screened Address</span>
                <div className="text-primary font-mono text-sm">{result.address}</div>
              </div>

              {/* Detailed Checks */}
              <div className="glass-card p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileWarning className="h-5 w-5 text-primary" />
                  Screening Results
                </h3>
                <div className="space-y-3">
                  {result.details.map((d, i) => (
                    <motion.div
                      key={d.category}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        {d.status === "match" ? (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-foreground">{d.category}</div>
                          <div className="text-xs text-muted-foreground">{d.detail}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        d.status === "match"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-success/10 text-success"
                      }`}>
                        {d.status === "match" ? "FLAGGED" : "CLEAR"}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AMLScreening;
