/**
 * pages/api/wa-init.js  (PROTECTED)
 * GET    → ambil status & QR code
 * POST   → mulai inisialisasi client WA
 * DELETE → logout/disconnect
 */

import { initWhatsAppClient, getWAStatus, logoutWhatsApp } from "../../lib/botTorik";
import { requireAuth } from "../../lib/auth";

async function handler(req, res) {
  if (req.method === "GET") {
    const { status, qr } = getWAStatus();
    return res.status(200).json({ status, qr });
  }

  if (req.method === "POST") {
    const { status } = getWAStatus();
    if (status === "ready") {
      return res.status(200).json({ status: "ready", message: "WhatsApp sudah terhubung!" });
    }
    initWhatsAppClient().catch(err =>
      console.error("[BotTorik] Gagal init client:", err.message)
    );
    return res.status(200).json({ status: "connecting", message: "Inisialisasi dimulai, tunggu QR..." });
  }

  if (req.method === "DELETE") {
    await logoutWhatsApp();
    return res.status(200).json({ status: "disconnected", message: "WhatsApp berhasil logout." });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed" });
}

export default requireAuth(handler);
