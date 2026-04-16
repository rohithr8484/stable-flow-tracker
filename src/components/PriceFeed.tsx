import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";

const PYTH_HERMES_URL = "https://hermes.pyth.network/v2/updates/price/latest";

const FEEDS = [
  {
    id: "0x0617a9b725011a126a2b9fd53563f4236501f32cf76d877644b943394606c6de",
    label: "MUSD/USD",
    symbol: "MUSD",
  },
  {
    id: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
    label: "BTC/USD",
    symbol: "BTC",
  },
  {
    id: "0x2817d7bfe5c64b8ea956e9a26f573ef64e72e4d7891f2d6af9bcc93f7aff9a97",
    label: "cbBTC/USD",
    symbol: "cbBTC",
  },
];

interface PriceData {
  price: number;
  conf: number;
  expo: number;
  publishTime: number;
}

export default function PriceFeed() {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);

      const ids = FEEDS.map((f) => f.id);
      const params = new URLSearchParams();
      ids.forEach((id) => params.append("ids[]", id));

      const res = await fetch(`${PYTH_HERMES_URL}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch prices");

      const data = await res.json();

      const parsed: Record<string, PriceData> = {};
      if (data.parsed) {
        for (const item of data.parsed) {
          const feedId = "0x" + item.id;
          const p = item.price;
          parsed[feedId] = {
            price: Number(p.price) * Math.pow(10, Number(p.expo)),
            conf: Number(p.conf) * Math.pow(10, Number(p.expo)),
            expo: Number(p.expo),
            publishTime: Number(p.publish_time),
          };
        }
      }

      setPrices(parsed);
    } catch (e: any) {
      setError(e.message || "Failed to load price data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts * 1000);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">Pyth Oracle Price Feeds</h2>
            <p className="text-sm text-muted-foreground mt-1">Live on-chain price data from Pyth Network</p>
          </div>
          <button
            onClick={() => void fetchPrices()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-6">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4">
          {FEEDS.map((feed, i) => {
            const data = prices[feed.id];
            return (
              <motion.div
                key={feed.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {feed.label}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    LIVE
                  </span>
                </div>

                {loading && !data ? (
                  <div className="h-8 w-32 rounded bg-secondary animate-pulse" />
                ) : data ? (
                  <>
                    <div className="text-2xl font-bold text-foreground font-mono">
                      {formatPrice(data.price)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>± {formatPrice(data.conf)}</span>
                      <span>{formatTime(data.publishTime)}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate" title={feed.id}>
                      {feed.id.slice(0, 18)}...{feed.id.slice(-8)}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">No data</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
