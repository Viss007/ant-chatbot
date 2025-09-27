// src/server.js — clean baseline v0.1-local-pass

import 'dotenv/config';
import express from "express";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = process.env.PORT || 3000;

// -------- Middleware
app.use(express.json());

// CORS (so UI and external testers can call us)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  next();
});

// Tiny request log
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on("finish", () => {
    console.log(JSON.stringify({
      t: new Date().toISOString(),
      route: `${req.method} ${req.path}`,
      ms: Date.now() - t0
    }));
  });
  next();
});

// Serve UI at /
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "..", "public")));

// -------- Clients
// Supabase (server-side only)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// OpenAI (optional)
const oi = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// -------- Health / Mode / Version
app.get("/healthz", (_req, res) => res.type("text/plain").send("ok"));
app.get("/mode",    (_req, res) => res.json({ openai: !!process.env.OPENAI_API_KEY }));
app.get("/version", (_req, res) => res.json({ version: "v0.1-local-pass", time: new Date().toISOString() }));

// -------- Storage proof (latest rows)
app.get("/proof/messages", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit ?? "5", 10), 20);
    const { data, error } = await supabase
      .from("messages")
      .select("session_identifier,role,message_text,created_time")
      .order("created_time", { ascending: false })
      .limit(limit);

    if (error) return res.status(500).json({ ok: false, error: "db_error", detail: error.message });
    return res.json({ ok: true, rows: data ?? [] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "internal_error", detail: e?.message || String(e) });
  }
});

// -------- Chat (logs user + assistant messages; OpenAI with fallback)
// Table expected: public.messages(session_identifier, role, message_text, created_time)
// Optional table (soft counters): public.usage_counters(session_identifier, day, tokens_used)
app.post("/api/chat", async (req, res) => {
  try {
    const b = req.body || {};
    const session_identifier = b.session_identifier ?? b.session_Identifier;
    if (!session_identifier) return res.status(400).json({ error: "Missing session_identifier", received: b });
    if (!b.question || typeof b.question !== "string" || !b.question.trim()) {
      return res.status(400).json({ error: "Missing question", received: b });
    }

    // Log user message
    await supabase.from("messages").insert([{ session_identifier, role: "user", message_text: b.question }]);

    // Decide reply: OpenAI if key present, else echo — with a per-request token ceiling
    const MAX_TOKENS = 200;
    let reply = `Hello! You asked: "${b.question}"`;
    let usage;

    if (oi) {
      try {
        const r = await oi.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: "Be concise and helpful." },
            { role: "user",   content: b.question }
          ],
          max_tokens: Math.min(MAX_TOKENS, Number(process.env.MAX_OUTPUT_TOKENS || MAX_TOKENS)),
          temperature: 0.7
        });
        reply = r.choices?.[0]?.message?.content?.trim() || reply;
        usage = r.usage ? {
          tokens_in:  r.usage.prompt_tokens,
          tokens_out: r.usage.completion_tokens
        } : undefined;

        // Soft daily usage counter (upsert) when usage present
        if (usage) {
          const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
          const total = (usage.tokens_in || 0) + (usage.tokens_out || 0);
          const { error: ucErr } = await supabase
            .from("usage_counters")
            .upsert({ session_identifier, day: today, tokens_used: total },
                    { onConflict: "session_identifier,day" })
            .select();
          if (ucErr) console.error("USAGE COUNTER ERROR:", ucErr.message);
        }
      } catch (e) {
        console.error("OPENAI ERROR:", e?.message || e);
        // fallback keeps echo reply
      }
    }

    // Log assistant message
    await supabase.from("messages").insert([{ session_identifier, role: "assistant", message_text: reply }]);

    // Respond
    return res.json({
      ok: true,
      reply,
      session_identifier,
      question: b.question,
      mode: oi ? "openai" : "echo",
      ...(usage ? { usage } : {})
    });
  } catch (e) {
    console.error("CHAT ERROR:", e);
    return res.status(500).json({ error: "internal_error", detail: e?.message || String(e) });
  }
});

// -------- History (latest N)
app.get("/api/history", async (req, res) => {
  try {
    const session_identifier = req.query.session_identifier ?? req.query.session_Identifier;
    if (!session_identifier) return res.status(400).json({ error: "Missing session_identifier" });

    const { data, error } = await supabase
      .from("messages")
      .select("role,message_text,created_time")
      .eq("session_identifier", session_identifier)
      .order("created_time", { ascending: false })
      .limit(20);

    if (error) return res.status(500).json({ error: "db_error", detail: error.message });
    return res.json({ ok: true, session_identifier, count: data?.length || 0, messages: data });
  } catch (e) {
    console.error("HISTORY ERROR:", e);
    return res.status(500).json({ error: "internal_error", detail: e?.message || String(e) });
  }
});

// -------- Start
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
