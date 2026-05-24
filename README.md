# 🤖 BotTorik v2.0 — WhatsApp Bot (QR Login)

Bot WhatsApp otomatis berbasis **Next.js** dengan login **QR Code** — tidak perlu akun Meta Business atau Facebook Store!

## ✨ Fitur

- 📱 **Login via QR** — Scan seperti WhatsApp Web, langsung jalan
- 🤖 **AI Bot** — Didukung Claude (Anthropic) atau OpenAI
- 🔑 **Keyword Custom** — Balas otomatis berdasarkan kata kunci
- ⚡ **Auto-Reply** — Satu pesan balasan otomatis
- 📧 **Kirim Email** — Bot bisa forward pesan ke email via SMTP
- 📊 **Import CSV/Excel** — Keyword massal dari file
- 🟢 **Keep Alive 24/7** — Tetap online via Vercel + UptimeRobot

---

## 🚀 Cara Pakai

### 1. Install & Jalankan Lokal
```bash
npm install
npm run dev
```

### 2. Hubungkan WhatsApp
1. Buka `http://localhost:3000`
2. Tab **WhatsApp** → klik **"Mulai & Tampilkan QR"**
3. Di HP: WhatsApp → **Perangkat Tertaut** → **Tautkan Perangkat** → Scan QR
4. Selesai! Bot langsung aktif ✅

### 3. Deploy ke Vercel
```bash
# Push ke GitHub lalu import di vercel.com
# Set environment variables di Vercel Dashboard → Settings → Environment Variables
```

---

## ⚙️ Environment Variables

| Variable | Keterangan |
|----------|-----------|
| `ANTHROPIC_API_KEY` | API Key Claude (console.anthropic.com) |
| `OPENAI_API_KEY` | API Key OpenAI (fallback) |
| `BOT_NAME` | Nama bot (default: BotTorik) |
| `BOT_MODE` | `ai` / `auto` / `keyword` |
| `AUTO_REPLY_MESSAGE` | Pesan auto-reply |
| `REPLY_COOLDOWN_MINUTES` | Jeda balas (0 = selalu balas) |
| `BIZ_CONTEXT` | Konteks bisnis untuk AI |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Konfigurasi email |

---

## ⚠️ Catatan Penting

- **whatsapp-web.js** menggunakan WhatsApp Web — butuh Puppeteer/Chromium
- Di **Vercel** (serverless), session QR tidak persisten antar-deploy. Untuk produksi yang stabil, deploy ke **VPS/Railway/Render** (ada persistent filesystem)
- Jangan spam — gunakan sesuai ToS WhatsApp
