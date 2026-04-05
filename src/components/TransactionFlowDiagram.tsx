import { motion } from "framer-motion";

interface FlowNode {
  id: string;
  label: string;
  amount: string;
  currency: string;
  type: "source" | "destination" | "intermediary";
}

interface FlowEdge {
  from: string;
  to: string;
}

interface Props {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const nodeColors = {
  source: "border-primary bg-primary/10",
  destination: "border-accent bg-accent/10",
  intermediary: "border-warning bg-warning/10",
};

const dotColors = {
  source: "bg-primary",
  destination: "bg-accent",
  intermediary: "bg-warning",
};

const TransactionFlowDiagram = ({ nodes, edges }: Props) => {
  const sources = nodes.filter((n) => n.type === "source");
  const intermediaries = nodes.filter((n) => n.type === "intermediary");
  const destinations = nodes.filter((n) => n.type === "destination");

  const columns = [sources, intermediaries, destinations];

  return (
    <div className="glass-card p-6 overflow-x-auto">
      <h3 className="font-heading font-semibold text-foreground mb-6">Transaction Flow</h3>
      <div className="flex items-center justify-between gap-8 min-w-[600px]">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-4 flex-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider text-center">
              {ci === 0 ? "Sources" : ci === 1 ? "Intermediaries" : "Destinations"}
            </span>
            {col.map((node, ni) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: ci === 0 ? -20 : ci === 2 ? 20 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ni * 0.1 + ci * 0.2 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${nodeColors[node.type]}`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${dotColors[node.type]}`} />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{node.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {node.amount} {node.currency}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {edges.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {edges.length} connection{edges.length > 1 ? "s" : ""} traced
          </span>
        </div>
      )}
    </div>
  );
};

export default TransactionFlowDiagram;
