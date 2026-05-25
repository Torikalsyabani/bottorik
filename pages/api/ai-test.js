/**
 * pages/api/ai-test.js  (PROTECTED)
 * POST body: { message, anthropicKey?, openaiKey?, bizContext?, botName? }
 * Test AI reply secara real-time dari dashboard
 */
import { requireAuth } from "../../lib/auth";

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, anthropicKey, openaiKey, bizContext, botName } = req.body || {};
  if (!message) return res.status(400).json({ error: "Field 'message' wajib diisi." });

  const aKey = anthropicKey || process.env.ANTHROPIC_API_KEY;
  const oKey = openaiKey || process.env.OPENAI_API_KEY;
  const name  = botName || process.env.BOT_NAME || "BotTorik";
  const ctx   = bizContext || process.env.BIZ_CONTEXT || "";
  const systemMsg = `Kamu adalah ${name}, asisten virtual yang ramah dan profesional.${ctx ? " Konteks bisnis: " + ctx : ""} Jawab singkat, jelas, dan sopan dalam bahasa Indonesia.`;

  if (aKey) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": aKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 256, system: systemMsg, messages: [{ role: "user", content: message }] }),
      });
      if (r.ok) {
        const d = await r.json();
        const reply = d.content?.[0]?.text;
        if (reply) return res.status(200).json({ success: true, reply, engine: "Claude (Anthropic)" });
      } else {
        const e = await r.json();
        return res.status(200).json({ success: false, error: e.error?.message || "Anthropic API error" });
      }
    } catch (e) {
      return res.status(200).json({ success: false, error: e.message });
    }
  }

  if (oKey) {
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${oKey}` },
        body: JSON.stringify({ model: "gpt-4o-mini", max_tokens: 256, messages: [{ role: "system", content: systemMsg }, { role: "user", content: message }] }),
      });
      if (r.ok) {
        const d = await r.json();
        const reply = d.choices?.[0]?.message?.content;
        if (reply) return res.status(200).json({ success: true, reply, engine: "GPT-4o Mini (OpenAI)" });
      } else {
        const e = await r.json();
        return res.status(200).json({ success: false, error: e.error?.message || "OpenAI API error" });
      }
    } catch (e) {
      return res.status(200).json({ success: false, error: e.message });
    }
  }

  return res.status(200).json({ success: false, error: "Tidak ada API key yang tersedia. Isi ANTHROPIC_API_KEY atau OPENAI_API_KEY." });
}

export default requireAuth(handler);
