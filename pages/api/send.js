/**
 * pages/api/send.js  (PROTECTED)
 * POST body: { to: "628xxx", message: "Halo!" }
 */

import { sendWhatsAppMessage, getWAStatus } from "../../lib/botTorik";
import { requireAuth } from "../../lib/auth";

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { status } = getWAStatus();
  if (status !== "ready") {
    return res.status(503).json({ error: "WhatsApp belum terhubung. Scan QR dulu!" });
  }

  const { to, message } = req.body || {};
  if (!to || !message) {
    return res.status(400).json({ error: "Field 'to' dan 'message' wajib diisi" });
  }

  // Validasi format nomor: hanya angka, 10-15 digit
  const cleanTo = to.replace(/\D/g, "");
  if (!/^\d{10,15}$/.test(cleanTo)) {
    return res.status(400).json({ error: "Format nomor tidak valid. Gunakan format 628xxx." });
  }

  // Batasi panjang pesan
  if (message.length > 4096) {
    return res.status(400).json({ error: "Pesan terlalu panjang (maks 4096 karakter)." });
  }

  const ok = await sendWhatsAppMessage(cleanTo, message);
  if (ok) return res.status(200).json({ success: true });
  return res.status(500).json({ error: "Gagal kirim pesan. Cek console log." });
}

export default requireAuth(handler);
