/**
 * pages/api/webhook.js
 * Tidak lagi digunakan untuk Meta Cloud API.
 * Sekarang bot menerima pesan langsung via whatsapp-web.js (event listener di botTorik.js).
 * File ini dipertahankan sebagai placeholder / untuk kompatibilitas jika ada redirect lama.
 */

export default function handler(req, res) {
  res.status(200).json({
    message: "BotTorik v2 menggunakan WhatsApp Web QR — tidak perlu webhook Meta.",
    docs: "Buka dashboard dan klik 'Mulai & Scan QR' untuk menghubungkan WhatsApp.",
  });
}
