import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileCode, ShieldAlert, ShieldCheck, AlertTriangle, Info, Bug, Zap, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Finding {
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  line?: number;
}

interface AnalysisReport {
  contractName: string;
  compiler: string;
  totalLines: number;
  riskScore: number;
  findings: Finding[];
  summary: string;
}

const severityConfig: Record<string, { color: string; icon: React.ReactNode; bg: string }> = {
  critical: { color: "text-red-400", icon: <Bug className="h-4 w-4" />, bg: "bg-red-500/10 border-red-500/30" },
  high: { color: "text-orange-400", icon: <ShieldAlert className="h-4 w-4" />, bg: "bg-orange-500/10 border-orange-500/30" },
  medium: { color: "text-yellow-400", icon: <AlertTriangle className="h-4 w-4" />, bg: "bg-yellow-500/10 border-yellow-500/30" },
  low: { color: "text-blue-400", icon: <Info className="h-4 w-4" />, bg: "bg-blue-500/10 border-blue-500/30" },
  info: { color: "text-muted-foreground", icon: <Info className="h-4 w-4" />, bg: "bg-muted/30 border-muted" },
};

function analyzeSolidity(source: string): AnalysisReport {
  const lines = source.split("\n");
  const findings: Finding[] = [];

  // Extract contract name
  const contractMatch = source.match(/contract\s+(\w+)/);
  const contractName = contractMatch ? contractMatch[1] : "Unknown";

  // Extract compiler version
  const compilerMatch = source.match(/pragma solidity\s+([^;]+)/);
  const compiler = compilerMatch ? compilerMatch[1].trim() : "Unknown";

  // --- Vulnerability checks ---

  // Reentrancy: external calls before state changes
  const externalCallPattern = /\.(transfer|send|call)\s*[({]/g;
  let match;
  while ((match = externalCallPattern.exec(source)) !== null) {
    const lineNum = source.substring(0, match.index).split("\n").length;
    // Check if state change happens after
    const afterCall = source.substring(match.index);
    if (/\w+\s*=\s*/.test(afterCall.split("\n").slice(0, 5).join("\n"))) {
      findings.push({
        severity: "critical",
        title: "Potential Reentrancy Vulnerability",
        description: `External call at line ${lineNum} with state modification after. Consider using checks-effects-interactions pattern or ReentrancyGuard.`,
        line: lineNum,
      });
    }
  }

  // tx.origin usage
  if (/tx\.origin/.test(source)) {
    const idx = source.indexOf("tx.origin");
    const lineNum = source.substring(0, idx).split("\n").length;
    findings.push({
      severity: "high",
      title: "tx.origin Authentication",
      description: "Using tx.origin for authentication is vulnerable to phishing attacks. Use msg.sender instead.",
      line: lineNum,
    });
  }

  // Unchecked return values
  const transferCalls = source.match(/\.transfer\(|\.send\(/g);
  if (transferCalls && !source.includes("require")) {
    findings.push({
      severity: "high",
      title: "Unchecked Return Values",
      description: "Low-level calls without checking return values can silently fail.",
    });
  }

  // Floating pragma
  if (compilerMatch && (compilerMatch[1].includes("^") || compilerMatch[1].includes(">"))) {
    findings.push({
      severity: "medium",
      title: "Floating Pragma",
      description: `Compiler version ${compiler} is not pinned. Consider locking to a specific version for production deployment.`,
    });
  }

  // Missing events on state changes
  const stateChanges = (source.match(/mapping\(/g) || []).length;
  const eventEmits = (source.match(/emit\s+/g) || []).length;
  if (stateChanges > 0 && eventEmits < stateChanges) {
    findings.push({
      severity: "low",
      title: "Missing Events for State Changes",
      description: "Some state-changing functions may not emit events, reducing off-chain observability.",
    });
  }

  // SafeMath usage check (unnecessary in 0.8+)
  if (source.includes("SafeMath") && compilerMatch && compilerMatch[1].includes("0.8")) {
    findings.push({
      severity: "info",
      title: "Unnecessary SafeMath Usage",
      description: "Solidity ^0.8.0 has built-in overflow/underflow checks. SafeMath library is unnecessary and wastes gas.",
    });
  }

  // Missing zero-address checks
  if (source.includes("constructor") && !source.includes("address(0)")) {
    findings.push({
      severity: "medium",
      title: "Missing Zero-Address Validation",
      description: "Constructor parameters are not validated against address(0). Could lead to locked funds or broken functionality.",
    });
  }

  // Centralization risk (onlyOwner)
  if (source.includes("onlyOwner") || source.includes("owner")) {
    findings.push({
      severity: "medium",
      title: "Centralization Risk",
      description: "Contract has owner-only functions creating centralization risk. Consider multi-sig or DAO governance.",
    });
  }

  // ReentrancyGuard check
  if (source.includes("nonReentrant")) {
    findings.push({
      severity: "info",
      title: "ReentrancyGuard Detected",
      description: "Contract uses ReentrancyGuard modifier — good practice for functions with external calls.",
    });
  }

  // Access control patterns
  if (!source.includes("onlyOwner") && !source.includes("require(msg.sender") && source.includes("external")) {
    findings.push({
      severity: "high",
      title: "Missing Access Control",
      description: "External functions without access modifiers could be called by anyone.",
    });
  }

  // Compute risk score
  const criticals = findings.filter(f => f.severity === "critical").length;
  const highs = findings.filter(f => f.severity === "high").length;
  const mediums = findings.filter(f => f.severity === "medium").length;
  const riskScore = Math.min(100, criticals * 30 + highs * 20 + mediums * 10 + 5);

  const summary =
    criticals > 0
      ? "Critical vulnerabilities detected — do NOT deploy without remediation."
      : highs > 0
        ? "High-risk issues found. Requires thorough audit before mainnet deployment."
        : mediums > 0
          ? "Moderate risks identified. Recommended to address before production use."
          : "Contract appears reasonably safe. Standard audit still recommended.";

  return { contractName, compiler, totalLines: lines.length, riskScore, findings, summary };
}

const ContractRiskAnalyser = () => {
  const [source, setSource] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSource(ev.target?.result as string);
      setReport(null);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSource(ev.target?.result as string);
      setReport(null);
    };
    reader.readAsText(file);
  }, []);

  const runAnalysis = () => {
    if (!source) return;
    setAnalyzing(true);
    setTimeout(() => {
      setReport(analyzeSolidity(source));
      setAnalyzing(false);
    }, 1500);
  };

  const riskColor = (score: number) =>
    score >= 70 ? "text-red-400" : score >= 40 ? "text-yellow-400" : "text-green-400";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
            <FileCode className="h-8 w-8 text-primary" />
            Contract Risk Analyser
          </h1>
          <p className="text-muted-foreground mb-8">
            Upload a Solidity (.sol) file to scan for vulnerabilities, anti-patterns, and compliance risks.
          </p>

          {/* Upload Area */}
          <Card className="glass-card mb-8">
            <CardContent className="p-8">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById("sol-upload")?.click()}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium mb-1">
                  {fileName || "Drop your .sol file here or click to browse"}
                </p>
                <p className="text-muted-foreground text-sm">Supports Solidity 0.4.x – 0.8.x</p>
                <input
                  id="sol-upload"
                  type="file"
                  accept=".sol"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>

              {source && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-primary" />
                    <span className="text-foreground font-medium">{fileName}</span>
                    <Badge variant="outline" className="text-xs">{source.split("\n").length} lines</Badge>
                  </div>
                  <Button onClick={runAnalysis} disabled={analyzing}>
                    {analyzing ? (
                      <>
                        <Zap className="h-4 w-4 animate-pulse" />
                        Analyzing…
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Analyze Contract
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report */}
          <AnimatePresence>
            {report && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardDescription>Contract</CardDescription>
                      <CardTitle className="text-lg">{report.contractName}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardDescription>Compiler</CardDescription>
                      <CardTitle className="text-lg">{report.compiler}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardDescription>Lines of Code</CardDescription>
                      <CardTitle className="text-lg">{report.totalLines}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardDescription>Risk Score</CardDescription>
                      <CardTitle className={`text-2xl font-bold ${riskColor(report.riskScore)}`}>
                        {report.riskScore}/100
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Summary */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      Assessment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground">{report.summary}</p>
                    <div className="flex gap-3 mt-4">
                      {["critical", "high", "medium", "low", "info"].map((s) => {
                        const count = report.findings.filter((f) => f.severity === s).length;
                        if (count === 0) return null;
                        return (
                          <Badge key={s} className={severityConfig[s].bg + " border " + severityConfig[s].color}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}: {count}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Findings */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Detailed Findings</CardTitle>
                    <CardDescription>{report.findings.length} issues identified</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {report.findings.map((f, i) => {
                      const cfg = severityConfig[f.severity];
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`p-4 rounded-lg border ${cfg.bg}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cfg.color}>{cfg.icon}</span>
                            <span className={`font-medium ${cfg.color}`}>
                              [{f.severity.toUpperCase()}]
                            </span>
                            <span className="text-foreground font-medium">{f.title}</span>
                            {f.line && (
                              <Badge variant="outline" className="text-xs ml-auto">
                                Line {f.line}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm ml-6">{f.description}</p>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Source Preview */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Source Code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-background/50 rounded-lg p-4 overflow-x-auto text-xs text-muted-foreground max-h-96 overflow-y-auto">
                      {source?.split("\n").map((line, i) => (
                        <div key={i} className="flex">
                          <span className="text-muted-foreground/50 w-10 text-right mr-4 select-none">{i + 1}</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </pre>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default ContractRiskAnalyser;
