import { motion } from "framer-motion";
import { ArrowRight, Wallet, FileCode, Coins } from "lucide-react";
import type { TxData } from "@/lib/mezoApi";
import { formatTokenAmount } from "@/lib/mezoApi";

type NodeKind = "address" | "contract" | "tx";

interface FlowNode {
  id: string;
  kind: NodeKind;
  title: string;
  address: string;
  sub?: string;
  column: number; // 0=left, 1=center, 2=right
  row: number;    // vertical slot within column
}

interface FlowEdge {
  from: string;
  to: string;
  label: string;
  highlight?: boolean;
}

interface Props {
  tx?: TxData;
  title?: string;
}

const short = (h: string) => (h && h.length > 14 ? `${h.slice(0, 8)}…${h.slice(-6)}` : h || "—");

function buildFlow(tx: TxData): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

  // Center: the transaction itself
  nodes.push({
    id: "tx",
    kind: "tx",
    title: "Transaction",
    address: tx.hash,
    sub: tx.method || tx.tx_types?.[0] || "transfer",
    column: 1,
    row: 0,
  });

  // Left: sender
  const fromId = `from-${tx.from.hash}`;
  nodes.push({
    id: fromId,
    kind: tx.from.is_contract ? "contract" : "address",
    title: tx.from.name || (tx.from.is_contract ? "Contract" : "Sender"),
    address: tx.from.hash,
    sub: "From",
    column: 0,
    row: 0,
  });
  edges.push({ from: fromId, to: "tx", label: "SENDS", highlight: true });

  // Right: receiver
  const toId = `to-${tx.to.hash}`;
  nodes.push({
    id: toId,
    kind: tx.to.is_contract ? "contract" : "address",
    title: tx.to.name || tx.to.implementations?.[0]?.name || (tx.to.is_contract ? "Contract" : "Receiver"),
    address: tx.to.hash,
    sub: "To",
    column: 2,
    row: 0,
  });
  edges.push({ from: "tx", to: toId, label: "CALLS", highlight: true });

  // Token transfers — each becomes its own sender→receiver flow row.
  const transfers = tx.token_transfers.slice(0, 4);
  transfers.forEach((t, i) => {
    const row = i + 1;
    const sId = `tfrom-${i}-${t.from.hash}`;
    const rId = `tto-${i}-${t.to.hash}`;
    nodes.push({
      id: sId,
      kind: t.from.is_contract ? "contract" : "address",
      title: t.from.name || (t.from.is_contract ? "Contract" : "Address"),
      address: t.from.hash,
      sub: "Token sender",
      column: 0,
      row,
    });
    nodes.push({
      id: rId,
      kind: t.to.is_contract ? "contract" : "address",
      title: t.to.name || (t.to.is_contract ? "Contract" : "Address"),
      address: t.to.hash,
      sub: "Token recipient",
      column: 2,
      row,
    });
    const amt = `${formatTokenAmount(t.total.value, t.total.decimals)} ${t.token.symbol}`;
    // Token transfers route conceptually through the tx, draw via two edges
    edges.push({ from: sId, to: "tx", label: amt });
    edges.push({ from: "tx", to: rId, label: amt });
  });

  return { nodes, edges };
}

const NODE_W = 220;
const NODE_H = 78;
const COL_GAP = 140;
const ROW_GAP = 28;

function nodeStyle(kind: NodeKind) {
  if (kind === "tx") {
    return {
      bg: "bg-primary/10 border-primary/60",
      text: "text-primary",
      icon: <Coins className="h-4 w-4" />,
    };
  }
  if (kind === "contract") {
    return {
      bg: "bg-warning/10 border-warning/60",
      text: "text-warning",
      icon: <FileCode className="h-4 w-4" />,
    };
  }
  return {
    bg: "bg-success/10 border-success/60",
    text: "text-success",
    icon: <Wallet className="h-4 w-4" />,
  };
}

const TransactionGraph = ({ tx, title = "Address Flow" }: Props) => {
  if (!tx) return null;
  const { nodes, edges } = buildFlow(tx);

  // Compute layout: 3 columns; tallest column dictates SVG height
  const rowsPerCol = [0, 0, 0];
  nodes.forEach((n) => {
    rowsPerCol[n.column] = Math.max(rowsPerCol[n.column], n.row + 1);
  });
  const maxRows = Math.max(...rowsPerCol, 1);

  const colX = [0, NODE_W + COL_GAP, (NODE_W + COL_GAP) * 2];
  const totalW = colX[2] + NODE_W;
  const totalH = maxRows * NODE_H + (maxRows - 1) * ROW_GAP;

  const positioned = nodes.map((n) => ({
    ...n,
    x: colX[n.column],
    y: n.row * (NODE_H + ROW_GAP),
  }));
  const findNode = (id: string) => positioned.find((p) => p.id === id);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-heading font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Legend dotClass="bg-success" label="Address (EOA)" />
          <Legend dotClass="bg-warning" label="Contract" />
          <Legend dotClass="bg-primary" label="Transaction" />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div
          className="relative"
          style={{ width: totalW, height: totalH, minWidth: "100%" }}
        >
          {/* SVG layer for edges */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={totalW}
            height={totalH}
            viewBox={`0 0 ${totalW} ${totalH}`}
          >
            <defs>
              <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--foreground))" />
              </marker>
              <marker id="flow-arrow-primary" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))" />
              </marker>
            </defs>

            {edges.map((e, i) => {
              const a = findNode(e.from);
              const b = findNode(e.to);
              if (!a || !b) return null;
              // anchor points: right edge of source, left edge of target
              const sx = a.x + (a.column < b.column ? NODE_W : 0);
              const sy = a.y + NODE_H / 2;
              const ex = b.x + (b.column > a.column ? 0 : NODE_W);
              const ey = b.y + NODE_H / 2;
              const cx = (sx + ex) / 2;
              const path = `M ${sx} ${sy} C ${cx} ${sy}, ${cx} ${ey}, ${ex} ${ey}`;
              const stroke = e.highlight ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.55)";
              const marker = e.highlight ? "url(#flow-arrow-primary)" : "url(#flow-arrow)";
              const labelX = cx;
              const labelY = (sy + ey) / 2 - 6;
              return (
                <motion.g key={`e-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <path d={path} fill="none" stroke={stroke} strokeWidth={e.highlight ? 2.4 : 1.6} markerEnd={marker} />
                  <g transform={`translate(${labelX}, ${labelY})`}>
                    <rect
                      x={-Math.max(28, e.label.length * 3.6)}
                      y={-10}
                      width={Math.max(56, e.label.length * 7.2)}
                      height={20}
                      rx={5}
                      fill="hsl(var(--background))"
                      stroke="hsl(var(--border))"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill="hsl(var(--foreground))"
                    >
                      {e.label}
                    </text>
                  </g>
                </motion.g>
              );
            })}
          </svg>

          {/* HTML node layer (better text rendering + tooltip) */}
          {positioned.map((n, i) => {
            const s = nodeStyle(n.kind);
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`absolute rounded-xl border-2 ${s.bg} backdrop-blur-sm shadow-sm`}
                style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H }}
                title={n.address}
              >
                <div className="p-3 h-full flex flex-col justify-between">
                  <div className={`flex items-center gap-2 text-xs font-semibold ${s.text}`}>
                    {s.icon}
                    <span className="truncate">{n.title}</span>
                    {n.sub && (
                      <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
                        {n.sub}
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-foreground/90 truncate">{short(n.address)}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1">
          Sender <ArrowRight className="h-3 w-3" /> Transaction <ArrowRight className="h-3 w-3" /> Receiver
        </span>
        <span>·</span>
        <span>Each row below the main flow is a token transfer between two addresses.</span>
      </p>
    </div>
  );
};

const Legend = ({ dotClass, label }: { dotClass: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotClass}`} />
    {label}
  </span>
);

export default TransactionGraph;
