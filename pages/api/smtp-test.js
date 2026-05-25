/**
 * pages/api/smtp-test.js  (PROTECTED)
 * POST body: { host, port, user, pass, from }
 * Benar-benar test koneksi SMTP lewat nodemailer.verify()
 */
import { requireAuth } from "../../lib/auth";
import nodemailer from "nodemailer";

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { host, port, user, pass } = req.body || {};
  if (!host || !user || !pass) {
    return res.status(400).json({ error: "Host, user, dan pass wajib diisi." });
  }
  try {
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port || "587"),
      secure: parseInt(port || "587") === 465,
      auth: { user, pass },
      connectionTimeout: 8000,
      socketTimeout: 8000,
    });
    await transporter.verify();
    return res.status(200).json({ success: true, message: "Koneksi SMTP berhasil! ✅" });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
}

export default requireAuth(handler);
