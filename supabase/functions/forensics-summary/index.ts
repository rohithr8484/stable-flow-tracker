const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { graph, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const system = `You are a senior blockchain forensics analyst. Given a JSON description of a transaction graph (nodes = addresses/contracts, edges = transfers), produce a concise investigative summary in markdown with these sections:
**Executive Summary** (2-3 sentences)
**Flow Pattern** (bullet points: entry points, hops, exits)
**Entities of Interest** (call out contracts, mixers, exchanges if any)
**Risk Indicators** (red flags with severity)
**Recommended Next Steps** (3 numbered actions for the investigator)
Keep it under 250 words, professional tone, no preamble.`;

    const userMsg = `Transaction context:\n${JSON.stringify(context, null, 2)}\n\nGraph:\n${JSON.stringify(graph, null, 2)}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: system }, { role: "user", content: userMsg }],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || "(no summary returned)";
    return new Response(JSON.stringify({ summary: content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("forensics-summary error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
