// .bolt-workspace/scripts/local_report.js
const fetch = global.fetch ?? (await import("node-fetch")).default;

async function getText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.text();
}
async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}
async function postJSON(url, body) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}

(async () => {
  try {
    const base = "http://localhost:3000";
    const out = [];

    // Health
    const h = await getText(`${base}/healthz`).catch(e => `ERR ${e.message}`);
    out.push(`HEALTHZ: ${h}`);

    // Chat
    let chat = null;
    try {
      chat = await postJSON(`${base}/api/chat`, { question: "usage check", session_identifier: "report-123" });
      const usage = chat?.usage ? `USAGE: tokens_in=${chat.usage.tokens_in}, tokens_out=${chat.usage.tokens_out}` : "USAGE: n/a";
      const mode = chat?.mode ? `MODE: ${chat.mode}` : "";
      out.push(`CHAT: ${typeof chat?.answer === "string" ? chat.answer.slice(0, 120) : JSON.stringify(chat)}`);
      out.push(usage);
      if (mode) out.push(`MODE: ${mode}`);
    } catch (e) {
      out.push(`CHAT: ERR ${e.message}`);
    }

    // History
    try {
      const hist = await getJSON(`${base}/api/history?session_identifier=report-123`);
      out.push(`HISTORY: count=${hist?.count ?? "n/a"}`);
    } catch (e) {
      out.push(`HISTORY: ERR ${e.message}`);
    }

    // Server-side storage proof
    try {
      const proof = await getJSON(`${base}/proof/messages?limit=5`);
      if (proof?.ok) {
        out.push(`STORAGE: rows ${JSON.stringify(proof.rows)}`);
      } else {
        out.push(`STORAGE: ERROR - ${JSON.stringify(proof)}`);
      }
    } catch (e) {
      out.push(`STORAGE: ERR ${e.message}`);
    }

    // Mode + Version
    try {
      const mode = await getJSON(`${base}/mode`);
      out.push(`MODE: openai=${mode?.openai === true}`);
    } catch {}
    try {
      const v = await getJSON(`${base}/version`);
      out.push(`VERSION: ${JSON.stringify(v)}`);
    } catch (e) {
      out.push(`VERSION: ERR ${e.message}`);
    }

    // Summary
    const pass = (line, ok = v => !!v) => line && !/^ERR|^STORAGE: ERR|^STORAGE: ERROR/.test(line) && ok(line);
    const m = Object.fromEntries(out.map(l => [l.split(":")[0], l]));
    const summary = [
      `health ${pass(m["HEALTHZ"], v => v.includes("ok")) ? "PASS" : "FAIL"}`,
      `chat ${pass(m["CHAT"]) ? "PASS" : "FAIL"}`,
      `history ${pass(m["HISTORY"], v => /\d+/.test(v)) ? "PASS" : "FAIL"}`,
      `storage ${pass(m["STORAGE"], v => v.startsWith("STORAGE: rows")) ? "PASS" : "FAIL"}`,
      `version ${pass(m["VERSION"], v => v.startsWith("VERSION: {")) ? "PASS" : "FAIL"}`
    ].join(", ");

    console.log(out.join("\n"));
    console.log(`\nSUMMARY → ${summary}`);
    process.exit(0);
  } catch (e) {
    console.error("REPORT ERR:", e?.message || e);
    process.exit(1);
  }
})();
