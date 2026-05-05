// Boar Blockchain MCP-powered chat agent.
// Connects to https://mcp.boar.network/basic and /advanced via MCP Streamable HTTP,
// exposes tools to the Lovable AI Gateway, and runs a tool-calling loop.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MCP_ENDPOINTS = [
  { name: "basic", url: "https://mcp.boar.network/basic" },
  { name: "advanced", url: "https://mcp.boar.network/advanced" },
];

const SYSTEM_PROMPT = `You are the Boar Blockchain Agent. You answer on-chain questions by calling MCP tools from the Boar blockchain MCP servers (basic + advanced).

Guidelines:
- Always prefer calling a tool over guessing. If unsure which tool, pick the closest match.
- Resolve ENS names with the appropriate tool before calling balance/token tools.
- For Bitcoin addresses, use the Bitcoin tools (UTXO etc.) from the basic server.
- For failed EVM tx analysis, fetch the receipt then decode revert reason via the advanced tools.
- Format final answers in concise markdown with code blocks for hashes/addresses.`;

type JsonRpcResp = { jsonrpc: "2.0"; id: number | string; result?: any; error?: { code: number; message: string } };

class McpClient {
  url: string;
  name: string;
  sessionId: string | null = null;
  nextId = 1;
  tools: any[] = [];

  constructor(name: string, url: string) {
    this.name = name;
    this.url = url;
  }

  private async rpc(method: string, params: any = {}): Promise<any> {
    const id = this.nextId++;
    const body = { jsonrpc: "2.0", id, method, params };
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };
    if (this.sessionId) headers["Mcp-Session-Id"] = this.sessionId;

    const resp = await fetch(this.url, { method: "POST", headers, body: JSON.stringify(body) });
    const sid = resp.headers.get("Mcp-Session-Id");
    if (sid) this.sessionId = sid;

    const ct = resp.headers.get("content-type") || "";
    let parsed: JsonRpcResp | null = null;

    if (ct.includes("text/event-stream")) {
      const text = await resp.text();
      for (const line of text.split("\n")) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const data = t.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const obj = JSON.parse(data);
          if (obj.id === id) { parsed = obj; break; }
        } catch { /* ignore */ }
      }
    } else {
      const text = await resp.text();
      if (text) parsed = JSON.parse(text);
    }

    if (!parsed) throw new Error(`MCP ${this.name}: empty response for ${method}`);
    if (parsed.error) throw new Error(`MCP ${this.name} ${method}: ${parsed.error.message}`);
    return parsed.result;
  }

  async init() {
    await this.rpc("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "lovable-boar-chat", version: "1.0.0" },
    });
    // Send initialized notification (no id, no response expected)
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      };
      if (this.sessionId) headers["Mcp-Session-Id"] = this.sessionId;
      await fetch(this.url, {
        method: "POST",
        headers,
        body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
      });
    } catch { /* ignore */ }

    const result = await this.rpc("tools/list", {});
    this.tools = result?.tools ?? [];
  }

  async callTool(name: string, args: any) {
    return await this.rpc("tools/call", { name, arguments: args });
  }
}

function sanitizeName(s: string) {
  return s.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Init both MCP clients in parallel
    const clients = MCP_ENDPOINTS.map((e) => new McpClient(e.name, e.url));
    await Promise.all(clients.map(async (c) => {
      try { await c.init(); } catch (e) { console.error(`MCP init ${c.name} failed:`, e); }
    }));

    // Build OpenAI-style tool definitions; map tool name -> client
    const toolMap = new Map<string, { client: McpClient; original: string }>();
    const tools: any[] = [];
    for (const c of clients) {
      for (const t of c.tools) {
        const exposed = sanitizeName(`${c.name}__${t.name}`);
        toolMap.set(exposed, { client: c, original: t.name });
        tools.push({
          type: "function",
          function: {
            name: exposed,
            description: (t.description || "").slice(0, 1000),
            parameters: t.inputSchema || { type: "object", properties: {} },
          },
        });
      }
    }

    console.log(`Loaded ${tools.length} MCP tools from Boar`);

    const convo: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    // Agent loop (max 6 iterations)
    for (let i = 0; i < 6; i++) {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: convo,
          tools: tools.length ? tools : undefined,
          tool_choice: tools.length ? "auto" : undefined,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429)
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (resp.status === 402)
          return new Response(JSON.stringify({ error: "AI credits exhausted." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const t = await resp.text();
        console.error("AI gateway error:", resp.status, t);
        return new Response(JSON.stringify({ error: "AI gateway error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await resp.json();
      const msg = data.choices?.[0]?.message;
      if (!msg) throw new Error("No message returned");

      const toolCalls = msg.tool_calls || [];
      if (!toolCalls.length) {
        return new Response(JSON.stringify({ content: msg.content || "" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Append assistant message with tool calls
      convo.push(msg);

      // Execute tool calls
      for (const call of toolCalls) {
        const fname = call.function?.name;
        const fargs = call.function?.arguments;
        let parsedArgs: any = {};
        try { parsedArgs = typeof fargs === "string" ? JSON.parse(fargs || "{}") : (fargs || {}); }
        catch { parsedArgs = {}; }

        let toolResult = "";
        const mapping = toolMap.get(fname);
        if (!mapping) {
          toolResult = JSON.stringify({ error: `Unknown tool: ${fname}` });
        } else {
          try {
            const r = await mapping.client.callTool(mapping.original, parsedArgs);
            // MCP returns { content: [{type:'text', text:'...'}], ... }
            if (r?.content && Array.isArray(r.content)) {
              toolResult = r.content
                .map((c: any) => (typeof c?.text === "string" ? c.text : JSON.stringify(c)))
                .join("\n");
            } else {
              toolResult = JSON.stringify(r);
            }
            if (toolResult.length > 8000) toolResult = toolResult.slice(0, 8000) + "\n…[truncated]";
          } catch (e) {
            toolResult = JSON.stringify({ error: e instanceof Error ? e.message : String(e) });
          }
        }

        convo.push({
          role: "tool",
          tool_call_id: call.id,
          content: toolResult,
        });
      }
    }

    return new Response(JSON.stringify({ content: "I wasn't able to complete the request within the tool-call budget." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("boar-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
