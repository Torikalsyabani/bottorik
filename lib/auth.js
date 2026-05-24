/**
 * lib/auth.js
 * Middleware autentikasi untuk semua API endpoint dashboard.
 *
 * Cara kerja:
 *  - Setiap request ke API harus menyertakan header  X-Dashboard-Token: <token>
 *  - Token dihasilkan saat login (/api/auth POST) dan disimpan di server (in-memory)
 *  - Token kadaluwarsa setelah SESSION_TTL_MS (default 8 jam)
 *  - Password di-hash dengan SHA-256 sebelum dibandingkan — tidak pernah plain-text
 */

import { createHash, randomBytes } from "crypto";

// ── Config ────────────────────────────────────────────────────────────────────
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 jam
const MAX_ATTEMPTS   = 5;                   // max gagal login sebelum lockout
const LOCKOUT_MS     = 15 * 60 * 1000;     // 15 menit lockout

// ── In-memory stores ──────────────────────────────────────────────────────────
const activeSessions = new Map(); // token → { createdAt }
const loginAttempts  = new Map(); // ip → { count, lockedUntil }

// ── Helpers ───────────────────────────────────────────────────────────────────
export function hashPassword(plain) {
  const salt = process.env.DASHBOARD_SECRET || "bottorik-salt-2025";
  return createHash("sha256").update(plain + salt).digest("hex");
}

export function generateToken() {
  return randomBytes(32).toString("hex");
}

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, data] of activeSessions) {
    if (now - data.createdAt > SESSION_TTL_MS) activeSessions.delete(token);
  }
}

// ── Login: verifikasi password & buat token ────────────────────────────────────
export function attemptLogin(ip, password) {
  const now = Date.now();

  // Cek lockout
  const attempt = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  if (attempt.lockedUntil > now) {
    const remaining = Math.ceil((attempt.lockedUntil - now) / 60000);
    return { ok: false, error: `Terlalu banyak percobaan. Coba lagi dalam ${remaining} menit.` };
  }

  const storedHash = process.env.DASHBOARD_PASSWORD_HASH;
  if (!storedHash) {
    // Fallback: cek DASHBOARD_PASSWORD plaintext (untuk kemudahan setup awal)
    const fallbackPass = process.env.DASHBOARD_PASSWORD || "bottorik123";
    if (password !== fallbackPass) {
      return registerFailedAttempt(ip, attempt, now);
    }
  } else {
    if (hashPassword(password) !== storedHash) {
      return registerFailedAttempt(ip, attempt, now);
    }
  }

  // Sukses: reset counter & buat token
  loginAttempts.delete(ip);
  cleanExpiredSessions();
  const token = generateToken();
  activeSessions.set(token, { createdAt: now });
  return { ok: true, token };
}

function registerFailedAttempt(ip, attempt, now) {
  const newCount = (attempt.count || 0) + 1;
  const lockedUntil = newCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0;
  loginAttempts.set(ip, { count: newCount, lockedUntil });
  const remaining = MAX_ATTEMPTS - newCount;
  if (lockedUntil) {
    return { ok: false, error: `Password salah. Akun terkunci 15 menit.` };
  }
  return { ok: false, error: `Password salah. ${remaining} percobaan tersisa.` };
}

// ── Logout: hapus token ───────────────────────────────────────────────────────
export function revokeToken(token) {
  activeSessions.delete(token);
}

// ── Middleware: validasi token di setiap request API ──────────────────────────
export function requireAuth(handler) {
  return async function (req, res) {
    const token =
      req.headers["x-dashboard-token"] ||
      req.cookies?.["dashboard_token"];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: token tidak ditemukan." });
    }

    cleanExpiredSessions();
    const session = activeSessions.get(token);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized: token tidak valid atau kadaluwarsa." });
    }

    // Refresh TTL saat aktif digunakan
    session.createdAt = Date.now();
    return handler(req, res);
  };
}

// ── Rate limiter sederhana untuk endpoint publik ──────────────────────────────
const rateLimitMap = new Map(); // ip → { count, windowStart }
export function rateLimit(ip, maxPerMinute = 10) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, windowStart: now };
  if (now - entry.windowStart > 60000) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count <= maxPerMinute;
}
