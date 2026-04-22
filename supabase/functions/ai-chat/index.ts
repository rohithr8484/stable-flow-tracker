const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  risk: `You are the Risk & Alert Agent for a BTC Treasury platform. Proactively flag wallet, contract, and market risks. Be concise, use bullet points, cite severity (Low/Med/High/Critical), and suggest next actions. Reference Mezo, MUSD, BTC, cbBTC where relevant.`,
  coaching: `You are a Goal-Based MUSD Coach. Help the user set, plan, and track MUSD savings/borrow/repay goals. Ask clarifying questions about timeframe, amount, and risk tolerance. Provide actionable weekly plans and monitor progress.`,
  yield: `You are an AI DeFi Yield Search Assistant. Recommend yield opportunities for BTC, MUSD, and cbBTC. Always show APY range, risk tier, lockup, and protocol. Compare options in tables. Warn about smart-contract and depeg risk.`,
  portfolio: `You are a Conversational Portfolio Manager. Help analyze allocations, rebalance, estimate PnL, and propose hedges across BTC, MUSD, cbBTC and DeFi positions. Ask for the user's holdings if not provided. Be quantitative.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode = "risk" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const system = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.risk;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: system }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (response.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Lovable workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
