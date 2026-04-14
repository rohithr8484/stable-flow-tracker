import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { ORACLE_FEEDS } from "@/lib/walletConfig";

export default function OracleFeedsBanner() {
  return (
    <section className="py-12 px-4 border-t border-border">
      <div className="container mx-auto max-w-5xl">
        <h2 className="font-heading text-2xl font-bold text-center text-foreground mb-2">
          Data Feeds / Oracles
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Live Pyth price feed IDs powering BTC Treasury pricing infrastructure
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {ORACLE_FEEDS.map((feed, i) => (
            <motion.div
              key={feed.pair}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <span className="font-heading font-semibold text-foreground text-sm">
                  {feed.pair}
                </span>
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-success font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Live
                </span>
              </div>
              <div className="bg-secondary/60 rounded-lg px-3 py-2 overflow-hidden">
                <p className="text-[10px] text-muted-foreground mb-0.5 font-medium">Feed ID</p>
                <p className="text-[11px] text-foreground font-mono break-all leading-relaxed select-all">
                  {feed.id}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
