import { motion } from "framer-motion";
import type { TxData } from "@/lib/mezoApi";
import { formatTokenAmount } from "@/lib/mezoApi";

type EntityType = "cex" | "victim" | "fraudster" | "owner";

interface EntityNode {
  num: number;
  type: EntityType;
  label: string;
  address: string;
  x: number;
  y: number;
}

interface EntityEdge {
  from: number;
  to: number;
  amount: string;
  highlight?: boolean;
}

const COLORS: Record<EntityType, string> = {
  cex: "fill-[hsl(270_80%_60%)]",
  victim: "fill-[hsl(140_70%_45%)]",
  fraudster: "fill-foreground",
  owner: "fill-foreground",
};

const TEXT_ON: Record<EntityType, string> = {
  cex: "fill-white",
  victim: "fill-white",
  fraudster: "fill-background",
  owner: "fill-background",
};

function buildEntities(tx: TxData) {
  const nodes: EntityNode[] = [];
  const edges: EntityEdge[] = [];

  // Layout regions (SVG coordinates)
  // Top: owner -> victim -> CEX deposit
  // Mid-left: source CEX -> primary fraudster
  // Mid: 4 fraudsters -> 2 fraudsters -> aggregator -> 3 CEX deposits
  const xs = { srcCex: 60, fraud1: 220, branch: 410, mid: 600, agg: 780, sinks: 960 };
  const yTop = 60;
  const yMid = 280;
  const branchYs = [180, 250, 320, 390];
  const midYs = [230, 340];
  const sinkYs = [200, 290, 380];

  let n = 1;
  // 1. Source CEX (e.g., from-address treated as CEX origin)
  nodes.push({ num: n++, type: "cex", label: "Bybit (origin)", address: tx.from.hash, x: xs.srcCex, y: yMid });

  // 2. Fake exchanger (synthetic intermediary)
  nodes.push({ num: n++, type: "fraudster", label: "Fake exchanger", address: shortSyn(tx.hash, 1), x: xs.fraud1 - 20, y: yTop + 80 });

  // 3. Primary fraudster (mapped to tx.to if contract, else synthetic)
  const primary: EntityNode = {
    num: n++,
    type: "fraudster",
    label: tx.to.is_contract ? tx.to.name || "Fraudster" : "Fraudster",
    address: tx.to.hash,
    x: xs.fraud1,
    y: yMid,
  };
  nodes.push(primary);

  // 4. Owner of fake tokens (top center)
  nodes.push({ num: n++, type: "owner", label: "Owner of fake tokens", address: shortSyn(tx.hash, 2), x: xs.branch, y: yTop });

  // 5. Victim Metamask (top center-right) — derived from token transfer recipient if any, else synthetic
  const victimAddr = tx.token_transfers[0]?.to.hash || shortSyn(tx.hash, 3);
  nodes.push({ num: n++, type: "victim", label: "Victim MetaMask", address: victimAddr, x: xs.mid, y: yTop });

  // 6-9. Branch fraudsters
  branchYs.forEach((y, i) =>
    nodes.push({ num: n++, type: "fraudster", label: "Fraudster", address: shortSyn(tx.hash, 10 + i), x: xs.branch, y })
  );

  // 10. MEXC deposit (top right CEX sink for the victim path)
  nodes.push({ num: n++, type: "cex", label: "MEXC deposit", address: shortSyn(tx.hash, 4), x: xs.agg, y: yTop });

  // 11-12. Mid fraudsters
  midYs.forEach((y, i) =>
    nodes.push({ num: n++, type: "fraudster", label: "Fraudster", address: shortSyn(tx.hash, 20 + i), x: xs.mid, y })
  );

  // 13. Aggregator fraudster
  nodes.push({ num: n++, type: "fraudster", label: "Fraudster", address: shortSyn(tx.hash, 30), x: xs.agg, y: yMid });

  // 14-16. CEX deposits (sinks)
  ["BingX deposit", "Binance deposit", "Bybit deposit"].forEach((label, i) =>
    nodes.push({ num: n++, type: "cex", label, address: shortSyn(tx.hash, 40 + i), x: xs.sinks, y: sinkYs[i] })
  );

  // Amounts derived from real token transfers (cycled)
  const transfers = tx.token_transfers.length
    ? tx.token_transfers.map((t) => `${formatTokenAmount(t.total.value, t.total.decimals)} ${t.token.symbol}`)
    : ["10K", "10K", "10K"];
  const amt = (i: number) => transfers[i % transfers.length];

  // Top branch (victim path) — dashed-style highlight
  edges.push({ from: 4, to: 5, amount: amt(0) });
  edges.push({ from: 2, to: 5, amount: amt(0) });
  edges.push({ from: 1, to: 2, amount: amt(0) });
  edges.push({ from: 5, to: 10, amount: amt(0) });

  // Source CEX -> primary fraudster (red)
  edges.push({ from: 1, to: 3, amount: amt(1), highlight: true });

  // Primary fraudster -> 4 branch fraudsters (red)
  [6, 7, 8, 9].forEach((to, i) => edges.push({ from: 3, to, amount: amt(i), highlight: true }));

  // Branch fraudsters consolidate into 2 mid fraudsters
  edges.push({ from: 6, to: 11, amount: amt(0), highlight: true });
  edges.push({ from: 7, to: 11, amount: amt(0), highlight: true });
  edges.push({ from: 8, to: 12, amount: amt(0), highlight: true });
  edges.push({ from: 9, to: 12, amount: amt(0), highlight: true });

  // Mid -> aggregator
  edges.push({ from: 11, to: 13, amount: amt(0), highlight: true });
  edges.push({ from: 12, to: 13, amount: amt(0), highlight: true });

  // Aggregator -> 3 CEX deposits
  [14, 15, 16].forEach((to, i) => edges.push({ from: 13, to, amount: amt(i), highlight: true }));

  return { nodes, edges, transfers };
}

function shortSyn(hash: string, salt: number) {
  // Deterministic synthetic-looking address from real hash + salt
  const base = hash.replace(/^0x/, "");
  const rot = base.slice(salt % base.length) + base.slice(0, salt % base.length);
  return "0x" + rot.slice(0, 40);
}

const VB_W = 1060;
const VB_H = 460;
const R = 18;

const EntityGraph = ({ tx }: { tx: TxData }) => {
  const { nodes, edges } = buildEntities(tx);
  const find = (num: number) => nodes.find((n) => n.num === num)!;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-heading font-semibold text-foreground">Entity Investigation Graph</h3>
          <p className="text-xs text-muted-foreground">Synthesized address-clustering view (Bholder-style)</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Legend swatch="bg-[hsl(270_80%_60%)]" label="CEX address" />
          <Legend swatch="bg-[hsl(140_70%_45%)]" label="Victim wallet" />
          <Legend swatch="bg-foreground" label="Fraudster / abuser" />
          <Legend swatch="bg-destructive" label="Traced laundering flow" />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full min-w-[800px] h-auto">
          <defs>
            <marker id="eg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" />
            </marker>
            <marker id="eg-arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--destructive))" />
            </marker>
          </defs>

          {edges.map((e, i) => {
            const a = find(e.from);
            const b = find(e.to);
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const sx = a.x + ux * R;
            const sy = a.y + uy * R;
            const ex = b.x - ux * R;
            const ey = b.y - uy * R;
            const mx = (sx + ex) / 2;
            const my = (sy + ey) / 2;
            const stroke = e.highlight ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground) / 0.6)";
            const marker = e.highlight ? "url(#eg-arrow-red)" : "url(#eg-arrow)";
            return (
              <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                <line
                  x1={sx}
                  y1={sy}
                  x2={ex}
                  y2={ey}
                  stroke={stroke}
                  strokeWidth={e.highlight ? 2 : 1}
                  strokeDasharray={e.highlight ? "0" : "4 3"}
                  markerEnd={marker}
                />
                <g transform={`translate(${mx}, ${my})`}>
                  <rect
                    x={-Math.max(20, e.amount.length * 3.2)}
                    y={-7}
                    width={Math.max(40, e.amount.length * 6.4)}
                    height={14}
                    rx={3}
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--border))"
                  />
                  <text textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="hsl(var(--foreground))">
                    {e.amount}
                  </text>
                </g>
              </motion.g>
            );
          })}

          {nodes.map((n) => (
            <motion.g
              key={n.num}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: n.num * 0.03 }}
            >
              <circle cx={n.x} cy={n.y} r={R} className={COLORS[n.type]} stroke="hsl(var(--background))" strokeWidth={2} />
              <text
                x={n.x}
                y={n.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="13"
                fontWeight="700"
                className={TEXT_ON[n.type]}
              >
                {n.num}
              </text>
              <text
                x={n.x}
                y={n.y + R + 12}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="hsl(var(--foreground))"
              >
                {n.label}
              </text>
              <text
                x={n.x}
                y={n.y + R + 24}
                textAnchor="middle"
                fontSize="8"
                fill="hsl(var(--muted-foreground))"
                fontFamily="monospace"
              >
                {n.address.slice(0, 10)}…{n.address.slice(-4)}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
    </div>
  );
};

const Legend = ({ swatch, label }: { swatch: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${swatch}`} />
    {label}
  </span>
);

export default EntityGraph;
