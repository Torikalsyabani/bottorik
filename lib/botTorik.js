/**
 * BotTorik — Core bot logic (QR Version)
 * Login via QR Code WhatsApp Web — tidak perlu Meta Business/Store
 * Fitur: Auto-reply | AI (Claude/OpenAI) | Kirim Email | Keyword custom
 */

import nodemailer from "nodemailer";

// ── Singleton client WhatsApp Web ─────────────────────────────────────────────
let _client = null;
let _clientStatus = "disconnected"; // disconnected | qr | connecting | ready
let _qrCode = null;

export function getWAStatus() {
  return { status: _clientStatus, qr: _qrCode };
}

export async function initWhatsAppClient() {
  // Sudah ada client yang running? Skip
  if (_client && (_clientStatus === "ready" || _clientStatus === "connecting")) {
    return _client;
  }

  const { Client, LocalAuth } = await import("whatsapp-web.js");

  _clientStatus = "connecting";
  _qrCode = null;

  _client = new Client({
    authStrategy: new LocalAuth({ dataPath: "/tmp/bottorik-session" }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    },
  });

  _client.on("qr", async (qr) => {
    const QRCode = (await import("qrcode")).default;
    _qrCode = await QRCode.toDataURL(qr);
    _clientStatus = "qr";
    console.log("[BotTorik] QR Code siap — scan dengan WhatsApp kamu!");
  });

  _client.on("authenticated", () => {
    _clientStatus = "connecting";
    _qrCode = null;
    console.log("[BotTorik] Autentikasi berhasil ✅");
  });

  _client.on("ready", () => {
    _clientStatus = "ready";
    _qrCode = null;
    console.log("[BotTorik] WhatsApp siap digunakan 🟢");
  });

  _client.on("disconnected", (reason) => {
    _clientStatus = "disconnected";
    _qrCode = null;
    _client = null;
    console.log("[BotTorik] WhatsApp terputus:", reason);
  });

  _client.on("message", async (message) => {
    // Abaikan pesan dari grup atau status/broadcast
    if (message.from.includes("@g.us") || message.from === "status@broadcast") return;
    if (message.type !== "chat") return; // hanya text

    const from = message.from;
    const msgText = message.body;
    console.log(`[BotTorik] Pesan dari ${from}: ${msgText}`);

    // Ambil/buat riwayat sesi
    if (!sessions[from]) sessions[from] = [];
    sessions[from].push({ role: "user", content: msgText });
    if (sessions[from].length > 10) sessions[from] = sessions[from].slice(-10);

    const reply = await processMessage(from, msgText, sessions[from]);
    if (reply) {
      await message.reply(reply);
      sessions[from].push({ role: "assistant", content: reply });
    }
  });

  await _client.initialize();
  return _client;
}

export async function sendWhatsAppMessage(to, text) {
  if (!_client || _clientStatus !== "ready") {
    console.error("[BotTorik] Client WA belum siap");
    return false;
  }
  try {
    // Format nomor: 628xxx → 628xxx@c.us
    const chatId = to.includes("@c.us") ? to : `${to.replace(/\D/g, "")}@c.us`;
    await _client.sendMessage(chatId, text);
    return true;
  } catch (err) {
    console.error("[BotTorik] Gagal kirim WA:", err.message);
    return false;
  }
}

export async function logoutWhatsApp() {
  if (_client) {
    await _client.logout().catch(() => {});
    _client = null;
  }
  _clientStatus = "disconnected";
  _qrCode = null;
}

// ── In-memory session store ──────────────────────────────────────────────────
const sessions = {};

// ── Kirim Email via SMTP ─────────────────────────────────────────────────────
export async function sendEmail({ to, subject, body }) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    console.error("[BotTorik] SMTP env vars tidak di-set");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({ from, to, subject, text: body });
    console.log(`[BotTorik] Email terkirim ke ${to}`);
    return true;
  } catch (err) {
    console.error("[BotTorik] Gagal kirim email:", err.message);
    return false;
  }
}

// ── Tanya AI (Claude/OpenAI fallback) ────────────────────────────────────────
export async function askAI(history, userMessage) {
  const bizContext = process.env.BIZ_CONTEXT || "";
  const botName    = process.env.BOT_NAME || "BotTorik";
  const systemMsg  = `Kamu adalah ${botName}, asisten virtual yang ramah dan profesional.${
    bizContext ? " Konteks bisnis: " + bizContext : ""
  } Jawab dalam bahasa yang sama dengan pertanyaan pengguna. Jawab singkat, jelas, dan sopan.`;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const messages = [
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: "user", content: userMessage },
      ];
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          system: systemMsg,
          messages,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.content?.[0]?.text || null;
      }
    } catch (err) {
      console.error("[BotTorik] Claude error:", err.message);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const messages = [
        { role: "system", content: systemMsg },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: "user", content: userMessage },
      ];
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 512 }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (err) {
      console.error("[BotTorik] OpenAI error:", err.message);
    }
  }

  return null;
}

// ── Baca konfigurasi dari ENV ─────────────────────────────────────────────────
function getConfig() {
  const autoReply = process.env.AUTO_REPLY_MESSAGE ||
    "Halo! Maaf lagi tidak bisa balas sekarang, nanti saya hubungi balik ya 😊";
  const mode = process.env.BOT_MODE || "ai";
  let customKeywords = [];
  try {
    if (process.env.CUSTOM_KEYWORDS) {
      customKeywords = JSON.parse(process.env.CUSTOM_KEYWORDS);
    }
  } catch (_) {}
  const cooldownMinutes = parseInt(process.env.REPLY_COOLDOWN_MINUTES || "0");
  return { autoReply, mode, customKeywords, cooldownMinutes };
}

// ── Cooldown tracker (in-memory) ──────────────────────────────────────────────
const lastReplied = {};

function isOnCooldown(from, cooldownMinutes) {
  if (!cooldownMinutes) return false;
  const last = lastReplied[from];
  if (!last) return false;
  return (Date.now() - last) < cooldownMinutes * 60 * 1000;
}

function markReplied(from) {
  lastReplied[from] = Date.now();
}

// ── Main: proses pesan masuk ──────────────────────────────────────────────────
export async function processMessage(from, messageText, history = []) {
  const { autoReply, mode, customKeywords, cooldownMinutes } = getConfig();
  const text  = (messageText || "").trim();
  const lower = text.toLowerCase();

  if (isOnCooldown(from, cooldownMinutes)) {
    console.log(`[BotTorik] ${from} masih dalam cooldown, skip.`);
    return null;
  }

  // Perintah kirim email dari WA
  const emailMatch = lower.match(/^kirim email ke (.+?):\s*(.+)/s);
  if (emailMatch) {
    const toEmail  = emailMatch[1].trim();
    const emailBody = text.split(":").slice(1).join(":").trim();
    const ok = await sendEmail({ to: toEmail, subject: "Pesan dari Bot WhatsApp", body: emailBody });
    markReplied(from);
    return ok ? `✅ Email berhasil dikirim ke ${toEmail}` : "❌ Gagal kirim email. Cek pengaturan SMTP.";
  }

  // Keyword custom (prioritas tertinggi)
  if (customKeywords.length > 0) {
    for (const item of customKeywords) {
      if (lower.includes(item.keyword.toLowerCase())) {
        markReplied(from);
        return item.reply;
      }
    }
  }

  if (mode === "ai") {
    const aiReply = await askAI(history, text);
    markReplied(from);
    return aiReply || autoReply;
  }

  if (mode === "keyword") return null;

  markReplied(from);
  return autoReply;
}
