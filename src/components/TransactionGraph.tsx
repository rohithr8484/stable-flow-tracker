import { motion } from "framer-motion";
import type { TxData } from "@/lib/mezoApi";
import { formatTokenAmount } from "@/lib/mezoApi";

type NodeType = "transaction" | "output" | "address";
interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  type: NodeType;
  x: number;
  y: number;
}
interface GraphEdge {
  from: string;
  to: string;
  label: "OUT" | "IN" | "LOCKED";
}

interface Props {
  tx?: TxData;
  title?: string;
  /** Optional override: provide your own nodes/edges */
  nodes?: GraphNode[];
  edges?: GraphEdge[];
}

// Build a graph in the style of: Transaction -> Output -> (LOCKED) Address, chained via IN -> Transaction -> OUT -> Output ...
function buildGraphFromTx(tx: TxData): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const transfers = tx.token_transfers.slice(0, 3);
  const fallbackOutputs = transfers.length === 0 ? 2 : transfers.length;

  // Layout coordinates (viewBox 1000x520)
  const TX1 = { x: 90, y: 300 };
  const OUT_TOP = { x: 320, y: 220 };
  const OUT_BOT = { x: 320, y: 420 };
  const ADDR_TOP_1 = { x: 320, y: 60 };
  const TX2 = { x: 580, y: 220 };
  const OUT_RIGHT = { x: 810, y: 220 };
  const ADDR_TOP_2 = { x: 810, y: 60 };

  const t0 = transfers[0];
  const t1 = transfers[1];
  const t2 = transfers[2];

  const fmt = (t?: typeof transfers[number]) =>
    t ? `${formatTokenAmount(t.total.value, t.total.decimals)} ${t.token.symbol}` : undefined;

  // Source Transaction node
  nodes.push({
    id: "tx1",
    label: "Transaction",
    sublabel: tx.hash.slice(0, 10) + "…",
    type: "transaction",
    x: TX1.x,
    y: TX1.y,
  });

  // Top output + locked address
  nodes.push({ id: "out1", label: "Output", sublabel: fmt(t0), type: "output", x: OUT_TOP.x, y: OUT_TOP.y });
  nodes.push({
    id: "addr1",
    label: "Address",
    sublabel: t0?.to.hash.slice(0, 8) + "…" || tx.from.hash.slice(0, 8) + "…",
    type: "address",
    x: ADDR_TOP_1.x,
    y: ADDR_TOP_1.y,
  });

  // Bottom output (no address)
  nodes.push({
    id: "out2",
    label: "Output",
    sublabel: fmt(t1) || fmt(t0),
    type: "output",
    x: OUT_BOT.x,
    y: OUT_BOT.y,
  });

  edges.push({ from: "tx1", to: "out1", label: "OUT" });
  edges.push({ from: "tx1", to: "out2", label: "OUT" });
  edges.push({ from: "out1", to: "addr1", label: "LOCKED" });

  // Chain to a second transaction if there is more activity (multi-transfer or contract interaction)
  if (transfers.length > 1 || tx.to.is_contract || fallbackOutputs > 1) {
    nodes.push({
      id: "tx2",
      label: "Transaction",
      sublabel: tx.to.is_contract ? (tx.to.name || "Contract") : "Next hop",
      type: "transaction",
      x: TX2.x,
      y: TX2.y,
    });
    nodes.push({
      id: "out3",
      label: "Output",
      sublabel: fmt(t2) || fmt(t1) || fmt(t0),
      type: "output",
      x: OUT_RIGHT.x,
      y: OUT_RIGHT.y,
    });
    nodes.push({
      id: "addr2",
      label: "Address",
      sublabel: (t2?.to.hash || t1?.to.hash || tx.to.hash).slice(0, 8) + "…",
      type: "address",
      x: ADDR_TOP_2.x,
      y: ADDR_TOP_2.y,
    });

    edges.push({ from: "out1", to: "tx2", label: "IN" });
    edges.push({ from: "tx2", to: "out3", label: "OUT" });
    edges.push({ from: "out3", to: "addr2", label: "LOCKED" });
  }

  return { nodes, edges };
}

const COLORS: Record<NodeType, { fill: string; stroke: string; text: string }> = {
  transaction: { fill: "hsl(var(--primary) / 0.18)", stroke: "hsl(var(--primary))", text: "hsl(var(--primary))" },
  output: { fill: "hsl(var(--success) / 0.18)", stroke: "hsl(var(--success))", text: "hsl(var(--success))" },
  address: { fill: "hsl(var(--warning) / 0.2)", stroke: "hsl(var(--warning))", text: "hsl(var(--warning))" },
};

const RADIUS = 46;

function edgePath(from: GraphNode, to: GraphNode) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const sx = from.x + ux * RADIUS;
  const sy = from.y + uy * RADIUS;
  const ex = to.x - ux * (RADIUS + 6);
  const ey = to.y - uy * (RADIUS + 6);
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  return { sx, sy, ex, ey, mx, my };
}

const TransactionGraph = ({ tx, title = "Transaction Flow Graph", nodes: nodesProp, edges: edgesProp }: Props) => {
  const built = tx ? buildGraphFromTx(tx) : null;
  const nodes = nodesProp ?? built?.nodes ?? [];
  const edges = edgesProp ?? built?.edges ?? [];

  if (nodes.length === 0) return null;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Legend color="hsl(var(--primary))" label="Transaction" />
          <Legend color="hsl(var(--success))" label="Output" />
          <Legend color="hsl(var(--warning))" label="Address" />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 1000 520" className="w-full h-auto min-w-[640px]" role="img" aria-label={title}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--foreground))" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((e, i) => {
            const from = nodes.find((n) => n.id === e.from);
            const to = nodes.find((n) => n.id === e.to);
            if (!from || !to) return null;
            const { sx, sy, ex, ey, mx, my } = edgePath(from, to);
            const dashed = e.label === "LOCKED";
            return (
              <motion.g
                key={`edge-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <line
                  x1={sx}
                  y1={sy}
                  x2={ex}
                  y2={ey}
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  strokeDasharray={dashed ? "6 5" : undefined}
                  markerEnd="url(#arrow)"
                />
                <g transform={`translate(${mx}, ${my})`}>
                  <rect x={-26} y={-10} width={52} height={18} rx={4} fill="hsl(var(--background))" stroke="hsl(var(--border))" />
                  <text textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="600" fill="hsl(var(--foreground))">
                    {e.label}
                  </text>
                </g>
              </motion.g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n, i) => {
            const c = COLORS[n.type];
            return (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                transform={`translate(${n.x}, ${n.y})`}
              >
                <circle r={RADIUS} fill={c.fill} stroke={c.stroke} strokeWidth={2.5} />
                <text textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="700" fill={c.text}>
                  {n.label}
                </text>
                {n.sublabel && (
                  <text
                    textAnchor="middle"
                    y={RADIUS + 16}
                    fontSize="11"
                    fill="hsl(var(--muted-foreground))"
                    fontFamily="ui-monospace, SFMono-Regular, monospace"
                  >
                    {n.sublabel}
                  </text>
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Graph view inspired by UTXO-style flows: <span className="text-foreground">Transaction</span> nodes spawn{" "}
        <span className="text-foreground">Outputs</span>, which can be <span className="text-foreground">LOCKED</span> to{" "}
        <span className="text-foreground">Addresses</span> or fed <span className="text-foreground">IN</span> to subsequent transactions.
      </p>
    </div>
  );
};

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
    {label}
  </span>
);

export default TransactionGraph;
