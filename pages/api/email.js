/**
 * pages/api/email.js  (PROTECTED)
 */
import { sendEmail } from "../../lib/botTorik";
import { requireAuth } from "../../lib/auth";

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { to, subject, body } = req.body || {};
  if (!to || !subject || !body) {
    return res.status(400).json({ error: "Field 'to', 'subject', dan 'body' wajib diisi" });
  }
  // Validasi email sederhana
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: "Format email tidak valid." });
  }
  const ok = await sendEmail({ to, subject, body });
  if (ok) return res.status(200).json({ success: true });
  return res.status(500).json({ error: "Gagal kirim email. Cek ENV SMTP." });
}

export default requireAuth(handler);
