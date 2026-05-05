import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { MessageCircle, X, Send, Loader2, ShieldAlert, Target, Sparkles, Wallet, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "boar" | "risk" | "coaching" | "yield" | "portfolio";
type Msg = { role: "user" | "assistant"; content: string };

const MODES: { id: Mode; label: string; icon: React.ComponentType<{ className?: string }>; greet: string; prompts: string[] }[] = [
  {
    id: "boar",
    label: "Boar Chain",
    icon: Link2,
    greet: "🐗 I'm the Boar Blockchain Agent. I can resolve ENS, fetch balances, decode tx reverts, list ERC-20 holdings, inspect Bitcoin UTXOs, and more — powered by Boar MCP (basic + advanced).",
    prompts: [
      "What is vitalik.eth's ETH balance?",
      "Show UTXOs for 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      "What ERC-20 tokens does vitalik.eth hold?",
      "Decode revert for tx 0x... (paste hash)",
    ],
  },
  {
    id: "risk",
    label: "Risk & Alerts",
    icon: ShieldAlert,
    greet: "👋 I'm your Risk Agent. I monitor wallets, contracts, and market signals. Want me to scan something?",
    prompts: ["Scan my connected wallet", "Latest BTC market risks", "Audit a contract address", "Show critical alerts"],
  },
  {
    id: "coaching",
    label: "MUSD Coach",
    icon: Target,
    greet: "🎯 I'm your MUSD Goal Coach. Tell me your savings, borrow, or repayment goal and I'll build a plan.",
    prompts: ["Save 1,000 MUSD in 90 days", "Plan to repay my MUSD loan", "Build a weekly DCA plan", "Set a yield goal"],
  },
  {
    id: "yield",
    label: "Yield Search",
    icon: Sparkles,
    greet: "✨ I find DeFi yield across BTC, MUSD & cbBTC. What's your risk appetite?",
    prompts: ["Best low-risk MUSD yield", "Top BTC staking APYs", "Compare cbBTC pools", "Stable yields above 8%"],
  },
  {
    id: "portfolio",
    label: "Portfolio Manager",
    icon: Wallet,
    greet: "💼 I'm your Portfolio Manager. Share your holdings or connect a wallet and I'll analyze allocation, PnL, and hedges.",
    prompts: ["Analyze my allocation", "Suggest a rebalance", "Estimate 30d PnL", "Hedge BTC downside"],
  },
];

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("boar");
  const [messages, setMessages] = useState<Record<Mode, Msg[]>>({ boar: [], risk: [], coaching: [], yield: [], portfolio: [] });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = MODES.find((m) => m.id === mode)!;
  const msgs = messages[mode];

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMessages((p) => ({ ...p, [mode]: [{ role: "assistant", content: current.greet }] }));
    }
  }, [open, mode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...msgs, userMsg];
    setMessages((p) => ({ ...p, [mode]: next }));
    setInput("");
    setLoading(true);

    let acc = "";
    const upsert = (chunk: string) => {
      acc += chunk;
      setMessages((p) => {
        const arr = p[mode];
        const last = arr[arr.length - 1];
        if (last?.role === "assistant") {
          return { ...p, [mode]: arr.map((m, i) => (i === arr.length - 1 ? { ...m, content: acc } : m)) };
        }
        return { ...p, [mode]: [...arr, { role: "assistant", content: acc }] };
      });
    };

    try {
      if (mode === "boar") {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/boar-chat`;
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: next }),
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          if (resp.status === 429) upsert("⚠️ Rate limit reached. Please try again in a moment.");
          else if (resp.status === 402) upsert("⚠️ AI credits exhausted. Add funds in workspace settings.");
          else upsert(`⚠️ ${data?.error || "Something went wrong."}`);
          setLoading(false);
          return;
        }
        upsert(data.content || "(no response)");
        setLoading(false);
        return;
      }

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, mode }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) upsert("⚠️ Rate limit reached. Please try again in a moment.");
        else if (resp.status === 402) upsert("⚠️ AI credits exhausted. Add funds in Lovable workspace settings.");
        else upsert("⚠️ Something went wrong. Please retry.");
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform animate-pulse"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-[60] w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-3rem)] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-heading font-semibold text-sm">AI Treasury Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-1 px-2 py-2 border-b border-border overflow-x-auto">
            {MODES.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                    mode === m.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm",
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:my-1.5">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
              </div>
            )}
            {msgs.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {current.prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-background hover:bg-secondary transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="border-t border-border p-2 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask the ${current.label}…`}
              className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
