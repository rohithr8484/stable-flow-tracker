import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type TxData, formatTokenAmount, computeRiskScore } from "@/lib/mezoApi";
import { toast } from "sonner";

interface Props {
  tx: TxData;
  graph: { nodes: { id: string; label: string; type: string; amount?: string; currency?: string }[]; edges: { from: string; to: string }[] };
  title?: string;
}

export default function ForensicsSummary({ tx, graph, title = "AI Forensics Summary" }: Props) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");

  const generate = async () => {
    setLoading(true);
    try {
      const context = {
        hash: tx.hash,
        from: tx.from.hash,
        to: tx.to.hash,
        toIsContract: tx.to.is_contract,
        toName: tx.to.name || tx.to.implementations?.[0]?.name,
        method: tx.decoded_input?.method_call || tx.method,
        riskScore: computeRiskScore(tx),
        tokenTransfers: tx.token_transfers.map(t => ({
          type: t.type,
          token: t.token.symbol,
          amount: formatTokenAmount(t.total.value, t.total.decimals),
          from: t.from.hash,
          to: t.to.hash,
        })),
        gasUsed: tx.gas_used,
        block: tx.block_number,
      };
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/forensics-summary`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ graph, context }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data?.error || "Failed to generate summary");
        return;
      }
      setSummary(data.summary);
      toast.success("Forensics summary generated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Sparkles className="h-5 w-5 text-primary" /></div>
          <div>
            <h3 className="font-heading font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">Automated LLM analysis of the transaction graph</p>
          </div>
        </div>
        <Button size="sm" variant={summary ? "outline" : "default"} onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : summary ? <RefreshCw className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          {loading ? "Analyzing..." : summary ? "Regenerate" : "Generate Summary"}
        </Button>
      </div>

      {summary ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-headings:my-3 prose-headings:text-foreground prose-strong:text-foreground prose-li:my-0.5">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </motion.div>
      ) : !loading ? (
        <div className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-4 border border-dashed border-border">
          Click <span className="font-medium text-foreground">Generate Summary</span> to produce an AI-written forensics report covering flow patterns, entities of interest, risk indicators, and next-step recommendations.
        </div>
      ) : null}
    </div>
  );
}
