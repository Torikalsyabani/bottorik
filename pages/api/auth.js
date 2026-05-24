/**
 * pages/api/auth.js
 * POST { password } → login, dapat token
 * DELETE           → logout, token dihapus
 * GET              → cek apakah token masih valid
 */

import { attemptLogin, revokeToken, requireAuth, rateLimit } from "../../lib/auth";

export default async function handler(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown";

  // ── GET: cek validitas token ───────────────────────────────────────────────
  if (req.method === "GET") {
    return requireAuth(() =>
      res.status(200).json({ ok: true, message: "Token valid." })
    )(req, res);
  }

  // ── POST: login ────────────────────────────────────────────────────────────
  if (req.method === "POST") {
    // Rate limit: max 5 request/menit per IP untuk endpoint login
    if (!rateLimit(ip, 5)) {
      return res.status(429).json({ error: "Terlalu banyak request. Tunggu sebentar." });
    }

    const { password } = req.body || {};
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password wajib diisi." });
    }

    const result = attemptLogin(ip, password);
    if (!result.ok) {
      return res.status(401).json({ error: result.error });
    }

    // Set cookie HttpOnly (untuk fallback browser), plus kirim token di body
    res.setHeader("Set-Cookie", [
      `dashboard_token=${result.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${8 * 3600}`,
    ]);
    return res.status(200).json({ ok: true, token: result.token });
  }

  // ── DELETE: logout ─────────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    const token = req.headers["x-dashboard-token"] || req.cookies?.["dashboard_token"];
    if (token) revokeToken(token);
    res.setHeader("Set-Cookie", "dashboard_token=; HttpOnly; Path=/; Max-Age=0");
    return res.status(200).json({ ok: true, message: "Logout berhasil." });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed" });
}
