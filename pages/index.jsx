import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

// ── Auth helpers ─────────────────────────────────────────────────────────────
const TOKEN_KEY = "bottorik_dash_token";
const getToken  = () => (typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : null);
const setToken  = (t) => sessionStorage.setItem(TOKEN_KEY, t);
const clearToken= () => sessionStorage.removeItem(TOKEN_KEY);
const authHeaders = () => ({ "Content-Type": "application/json", "x-dashboard-token": getToken() || "" });

// ── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw,  setPw]  = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pw) { setErr("Masukkan password dulu."); return; }
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const d = await r.json();
      if (d.ok && d.token) {
        setToken(d.token);
        onLogin();
      } else {
        setErr(d.error || "Login gagal.");
      }
    } catch {
      setErr("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "40px 36px", width: 360,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🤖</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#111" }}>BotTorik</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Dashboard — Masuk untuk melanjutkan</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Password Dashboard
          </label>
          <input
            type="password" value={pw}
            onChange={e => { setPw(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="Masukkan password..."
            autoFocus
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box",
              border: err ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
              fontSize: 14, outline: "none", background: "#fafafa",
              transition: "border-color 0.15s",
            }}
            onFocus={e => !err && (e.target.style.borderColor = "#6366f1")}
            onBlur={e => !err && (e.target.style.borderColor = "#e5e7eb")}
          />
          {err && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>⚠️ {err}</div>}
        </div>

        <button
          onClick={handleSubmit} disabled={loading}
          style={{
            width: "100%", padding: "12px", borderRadius: 10, border: "none",
            background: loading ? "#a5b4fc" : "#6366f1", color: "#fff",
            fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Memeriksa..." : "🔐 Masuk"}
        </button>

        <div style={{ marginTop: 20, background: "#f8fafc", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#6b7280" }}>
          💡 Set password di env: <code style={{ background: "#e5e7eb", borderRadius: 4, padding: "1px 5px" }}>DASHBOARD_PASSWORD</code>
          <br />Default (ubah segera!): <code style={{ background: "#e5e7eb", borderRadius: 4, padding: "1px 5px" }}>bottorik123</code>
        </div>
      </div>
    </div>
  );
}

// ── Simple icon components ──────────────────────────────────────────────────
const Icon = ({ d, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  wa:      "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  ai:      "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z",
  email:   "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  excel:   "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8 M8 9h2",
  alive:   "M22 12h-4l-3 9L9 3l-3 9H2",
  save:    "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8",
  send:    "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  down:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  up:      "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  key:     "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  trash:   "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  plus:    "M12 5v14 M5 12h14",
  check:   "M20 6L9 17l-5-5",
  copy:    "M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z",
};

// ── Reusable UI ─────────────────────────────────────────────────────────────
const Input = ({ label, value, onChange, type = "text", placeholder = "", mono = false }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "9px 12px", borderRadius: 8,
        border: "1px solid #e5e7eb", fontSize: 14, outline: "none",
        fontFamily: mono ? "monospace" : "inherit",
        background: "#fafafa", boxSizing: "border-box",
        transition: "border-color 0.15s",
      }}
      onFocus={e => e.target.style.borderColor = "#6366f1"}
      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
    />
  </div>
);

const Textarea = ({ label, value, onChange, rows = 3, mono = false, placeholder = "" }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
    <textarea
      value={value} onChange={e => onChange(e.target.value)} rows={rows}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "9px 12px", borderRadius: 8,
        border: "1px solid #e5e7eb", fontSize: 13, outline: "none", resize: "vertical",
        fontFamily: mono ? "monospace" : "inherit", background: "#fafafa",
        boxSizing: "border-box",
      }}
      onFocus={e => e.target.style.borderColor = "#6366f1"}
      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
    />
  </div>
);

const Btn = ({ onClick, children, color = "#6366f1", small = false, outline = false, danger = false }) => {
  const bg = danger ? "#ef4444" : outline ? "#fff" : color;
  const txt = outline ? (danger ? "#ef4444" : color) : "#fff";
  return (
    <button onClick={onClick} style={{
      background: bg, color: txt, border: `1.5px solid ${danger ? "#ef4444" : color}`,
      borderRadius: 8, padding: small ? "6px 14px" : "9px 20px",
      fontSize: small ? 13 : 14, fontWeight: 600, cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 6, transition: "opacity 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >{children}</button>
  );
};

const Badge = ({ text, color = "#6366f1" }) => (
  <span style={{ background: color + "18", color, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{text}</span>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20, ...style }}>{children}</div>
);

// ── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "whatsapp", label: "WhatsApp",  icon: "wa"    },
  { id: "ai",       label: "AI Bot",    icon: "ai"    },
  { id: "email",    label: "Email",     icon: "email" },
  { id: "excel",    label: "Excel",     icon: "excel" },
  { id: "alive",    label: "Keep Alive",icon: "alive" },
];

// ── MAIN APP ────────────────────────────────────────────────────────────────
export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Cek token saat pertama load
  useEffect(() => {
    const token = getToken();
    if (!token) { setAuthChecked(true); return; }
    // Verifikasi token ke server
    fetch("/api/auth", { headers: { "x-dashboard-token": token } })
      .then(r => { if (r.ok) setAuthed(true); else clearToken(); })
      .catch(() => clearToken())
      .finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", fontFamily: "'Inter',sans-serif" }}>
        <div style={{ fontSize: 14, color: "#9ca3af" }}>Memuat...</div>
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  return <Dashboard onLogout={() => { clearToken(); setAuthed(false); }} />;
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE", headers: authHeaders() });
    onLogout();
  };

  const [tab,        setTab]        = useState("whatsapp");
  const [saved,      setSaved]      = useState(false);
  const [botStatus,  setBotStatus]  = useState(null);
  const [chatHistory,setChatHistory]= useState([]);
  const [previewInput,setPreviewInput]=useState("");
  const [keywords,   setKeywords]   = useState([
    { keyword: "harga",  reply: "Harga mulai dari Rp 50.000 ya!" },
    { keyword: "alamat", reply: "Kami di Jl. Merdeka No. 1, Bandung 😊" },
  ]);
  const [cfg, setCfg] = useState({
    botMode:    "ai",
    autoReply:  "Halo! Lagi tidak bisa balas, nanti saya hubungi ya 😊",
    cooldown:   "0",
    adminWa:    "",
    bizContext: "",
    botName:    "BotTorik",
    anthropicKey:"",
    openaiKey:  "",
  });
  const [emailCfg, setEmailCfg] = useState({
    smtpHost: "", smtpPort: "587", smtpUser: "", smtpPass: "", smtpFrom: ""
  });
  const [emailForm, setEmailForm] = useState({ to: "", subject: "", body: "" });
  const [emailStatus, setEmailStatus] = useState(null);
  const [manualForm, setManualForm] = useState({ to: "", message: "" });
  const [manualStatus, setManualStatus] = useState(null);
  const [excelKeywords, setExcelKeywords] = useState([]);
  const [excelStatus, setExcelStatus] = useState(null);
  const [copied, setCopied] = useState("");
  const fileRef = useRef();

  // ── State QR WhatsApp ────────────────────────────────────────────────────
  const [waStatus, setWaStatus] = useState("disconnected"); // disconnected | connecting | qr | ready
  const [qrImage,  setQrImage]  = useState(null);
  const waPollerRef = useRef(null);

  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));
  const setE = (k, v) => setEmailCfg(c => ({ ...c, [k]: v }));

  // Poll status WA setiap 3 detik saat connecting/qr
  const startWAPoller = () => {
    if (waPollerRef.current) return;
    waPollerRef.current = setInterval(async () => {
      try {
        const r = await fetch("/api/wa-init", { headers: authHeaders() });
        const d = await r.json();
        setWaStatus(d.status);
        setQrImage(d.qr || null);
        if (d.status === "ready" || d.status === "disconnected") {
          clearInterval(waPollerRef.current);
          waPollerRef.current = null;
        }
      } catch (_) {}
    }, 3000);
  };

  const handleConnectWA = async () => {
    setWaStatus("connecting");
    setQrImage(null);
    await fetch("/api/wa-init", { method: "POST", headers: authHeaders() });
    startWAPoller();
  };

  const handleLogoutWA = async () => {
    if (!confirm("Yakin mau logout WhatsApp?")) return;
    await fetch("/api/wa-init", { method: "DELETE", headers: authHeaders() });
    setWaStatus("disconnected");
    setQrImage(null);
    if (waPollerRef.current) { clearInterval(waPollerRef.current); waPollerRef.current = null; }
  };

  useEffect(() => {
    fetch("/api/wa-init", { headers: authHeaders() }).then(r => r.json()).then(d => {
      setWaStatus(d.status);
      setQrImage(d.qr || null);
      if (d.status === "connecting" || d.status === "qr") startWAPoller();
    }).catch(() => {});

    fetch("/api/status", { headers: authHeaders() }).then(r => r.json()).then(setBotStatus).catch(() => {});

    return () => { if (waPollerRef.current) clearInterval(waPollerRef.current); };
  }, []);

  // ── Preview chat ──────────────────────────────────────────────────────────
  const sendPreview = () => {
    const msg = previewInput.trim();
    if (!msg) return;
    const updated = [...chatHistory, { role: "user", msg }];
    setChatHistory(updated);
    setPreviewInput("");
    setTimeout(() => {
      const lower = msg.toLowerCase();
      const kwMatch = keywords.find(k => lower.includes(k.keyword.toLowerCase()));
      let botMsg;
      if (kwMatch) {
        botMsg = kwMatch.reply;
      } else if (cfg.botMode === "ai") {
        botMsg = "🤖 [AI akan menjawab di sini setelah kamu set ANTHROPIC_API_KEY atau OPENAI_API_KEY]";
      } else if (cfg.botMode === "auto") {
        botMsg = cfg.autoReply;
      } else {
        botMsg = null;
      }
      if (botMsg) setChatHistory(h => [...h, { role: "bot", msg: botMsg }]);
    }, 500);
  };

  // ── Kirim pesan manual WA ─────────────────────────────────────────────────
  const sendManual = async () => {
    if (!manualForm.to || !manualForm.message) return alert("Isi nomor dan pesan dulu!");
    const r = await fetch("/api/send", {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ to: manualForm.to, message: manualForm.message }),
    });
    const d = await r.json();
    setManualStatus(d.success ? "success" : "error");
    setTimeout(() => setManualStatus(null), 3000);
  };

  // ── Kirim email ───────────────────────────────────────────────────────────
  const sendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) return alert("Isi semua field email!");
    const r = await fetch("/api/email", {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify(emailForm),
    });
    const d = await r.json();
    setEmailStatus(d.success ? "success" : "error: " + (d.error || "unknown"));
    setTimeout(() => setEmailStatus(null), 4000);
  };

  // ── Excel: download template ──────────────────────────────────────────────
  const downloadTemplate = () => {
    window.open("/api/excel", "_blank");
  };

  // ── Excel: upload & parse ─────────────────────────────────────────────────
  const uploadExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const text = await file.text();
    const r = await fetch("/api/excel", {
      method: "POST",
      headers: { "Content-Type": "text/plain", "x-dashboard-token": getToken() || "" },
      body: text,
    });
    const d = await r.json();
    if (d.success) {
      setExcelKeywords(d.keywords);
      setExcelStatus(`✅ ${d.message}`);
    } else {
      setExcelStatus("❌ " + d.error);
    }
    setTimeout(() => setExcelStatus(null), 5000);
  };

  const applyExcelKeywords = () => {
    setKeywords(prev => {
      const merged = [...prev];
      for (const ek of excelKeywords) {
        const idx = merged.findIndex(k => k.keyword === ek.keyword);
        if (idx >= 0) merged[idx] = ek;
        else merged.push(ek);
      }
      return merged;
    });
    setExcelKeywords([]);
    alert("✅ Keyword dari Excel berhasil diterapkan!");
  };

  // ── Generate ENV string ───────────────────────────────────────────────────
  const envStr = [
    "# BotTorik — Environment Variables",
    "# Salin ke Vercel → Settings → Environment Variables",
    "",
    "# ── WhatsApp Web QR (tidak perlu token Meta) ──",
    "# Login cukup dengan scan QR dari dashboard",
    "",
    "# ── AI Keys (minimal 1 untuk mode AI) ──",
    `ANTHROPIC_API_KEY=${cfg.anthropicKey ? "sk-ant-..." : ""}`,
    `OPENAI_API_KEY=${cfg.openaiKey ? "sk-proj-..." : ""}`,
    "",
    "# ── Bot Config ──",
    `BOT_NAME=${cfg.botName}`,
    `BOT_MODE=${cfg.botMode}`,
    `AUTO_REPLY_MESSAGE=${cfg.autoReply}`,
    `REPLY_COOLDOWN_MINUTES=${cfg.cooldown}`,
    `BIZ_CONTEXT=${cfg.bizContext}`,
    `ADMIN_WA=${cfg.adminWa}`,
    "",
    "# ── SMTP Email ──",
    `SMTP_HOST=${emailCfg.smtpHost}`,
    `SMTP_PORT=${emailCfg.smtpPort}`,
    `SMTP_USER=${emailCfg.smtpUser}`,
    `SMTP_PASS=PASTE_PASSWORD_EMAIL_DI_VERCEL`,
    `SMTP_FROM=${emailCfg.smtpFrom || emailCfg.smtpUser}`,
    "",
    "# ── Keyword custom ──",
    `CUSTOM_KEYWORDS=${JSON.stringify(keywords)}`,
  ].join("\n");

  const copyEnv = () => {
    navigator.clipboard.writeText(envStr);
    setCopied("env");
    setTimeout(() => setCopied(""), 2000);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>BotTorik Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26 }}>🤖</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: "#111" }}>BotTorik</span>
              <Badge text="v2.0" color="#6366f1" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
              {botStatus ? (
                <><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /><span style={{ color: "#22c55e", fontWeight: 600 }}>Bot Online</span></>
              ) : (
                <><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} /><span style={{ color: "#f59e0b", fontWeight: 600 }}>Memeriksa...</span></>
              )}
              <button onClick={handleLogout} style={{
                background: "none", border: "1px solid #e5e7eb", borderRadius: 7,
                padding: "5px 12px", cursor: "pointer", fontSize: 12, color: "#6b7280",
                fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
              }}>🚪 Keluar</button>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 0, padding: "0 24px", overflowX: "auto" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "14px 20px", fontWeight: 600, fontSize: 13,
                color: tab === t.id ? "#6366f1" : "#6b7280",
                borderBottom: tab === t.id ? "2px solid #6366f1" : "2px solid transparent",
                background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #6366f1" : "2px solid transparent",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                transition: "color 0.15s",
              }}>
                <Icon d={ICONS[t.icon]} size={16} color={tab === t.id ? "#6366f1" : "#9ca3af"} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 40px" }}>

          {/* ── TAB: WHATSAPP ── */}
          {tab === "whatsapp" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <Card>
                  <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 16 }}>⚙️ Konfigurasi Bot</h3>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase" }}>Mode Bot</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[["ai","🤖 AI (Cerdas)"],["auto","⚡ Auto Reply"],["keyword","🔑 Keyword Saja"]].map(([val,lbl]) => (
                        <button key={val} onClick={() => set("botMode", val)} style={{
                          flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                          background: cfg.botMode === val ? "#6366f1" : "#f3f4f6",
                          color: cfg.botMode === val ? "#fff" : "#6b7280",
                          border: "1.5px solid " + (cfg.botMode === val ? "#6366f1" : "#e5e7eb"),
                        }}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                  <Input label="Nomor Admin WA" value={cfg.adminWa} onChange={v => set("adminWa", v)} placeholder="+6281234567890" />
                  <Textarea label="Pesan Auto-Reply (jika AI tidak ada / mode auto)" value={cfg.autoReply} onChange={v => set("autoReply", v)} />
                  <Input label="Cooldown (menit, 0 = selalu balas)" value={cfg.cooldown} onChange={v => set("cooldown", v)} type="number" />
                </Card>

                <Card style={{ marginTop: 16 }}>
                  <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 16 }}>📤 Kirim Pesan Manual</h3>
                  {waStatus !== "ready" && (
                    <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 13, color: "#92400e" }}>
                      ⚠️ WhatsApp belum terhubung. Scan QR dulu di panel kanan.
                    </div>
                  )}
                  <Input label="Nomor Tujuan (628xxx)" value={manualForm.to} onChange={v => setManualForm(f => ({ ...f, to: v }))} placeholder="6281234567890" />
                  <Textarea label="Pesan" value={manualForm.message} onChange={v => setManualForm(f => ({ ...f, message: v }))} />
                  <Btn onClick={sendManual}>
                    <Icon d={ICONS.send} size={16} /> Kirim WA
                  </Btn>
                  {manualStatus && <span style={{ marginLeft: 12, fontSize: 13, color: manualStatus === "success" ? "#22c55e" : "#ef4444" }}>
                    {manualStatus === "success" ? "✅ Terkirim!" : "❌ Gagal kirim"}
                  </span>}
                </Card>
              </div>

              <div>
                {/* ── Panel QR / Status Koneksi WA ── */}
                <Card style={{ marginBottom: 16, textAlign: "center" }}>
                  <h3 style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 16, textAlign: "left" }}>📱 Koneksi WhatsApp</h3>

                  {/* DISCONNECTED */}
                  {waStatus === "disconnected" && (
                    <div>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📵</div>
                      <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
                        WhatsApp belum terhubung.<br />Klik tombol di bawah untuk mulai login.
                      </div>
                      <Btn onClick={handleConnectWA}>
                        <Icon d={ICONS.wa} size={16} /> Mulai & Tampilkan QR
                      </Btn>
                    </div>
                  )}

                  {/* CONNECTING (menunggu QR muncul) */}
                  {waStatus === "connecting" && (
                    <div>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
                      <div style={{ fontSize: 14, color: "#6b7280" }}>Memulai sesi, tunggu sebentar...</div>
                      <div style={{ marginTop: 8, fontSize: 12, color: "#9ca3af" }}>QR akan muncul otomatis</div>
                    </div>
                  )}

                  {/* QR READY — tampilkan gambar QR */}
                  {waStatus === "qr" && qrImage && (
                    <div>
                      <div style={{ fontSize: 13, color: "#1e40af", background: "#eff6ff", borderRadius: 8, padding: "8px 12px", marginBottom: 12, border: "1px solid #bfdbfe" }}>
                        📲 Buka WhatsApp di HP → <strong>Perangkat Tertaut</strong> → <strong>Tautkan Perangkat</strong> → Scan QR ini
                      </div>
                      <img src={qrImage} alt="QR WhatsApp" style={{ width: 220, height: 220, borderRadius: 12, border: "3px solid #6366f1", boxShadow: "0 4px 20px rgba(99,102,241,0.2)" }} />
                      <div style={{ marginTop: 10, fontSize: 12, color: "#9ca3af" }}>QR kadaluwarsa dalam ~60 detik. Akan auto-refresh.</div>
                    </div>
                  )}

                  {/* READY — terhubung */}
                  {waStatus === "ready" && (
                    <div>
                      <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#15803d", marginBottom: 6 }}>WhatsApp Terhubung!</div>
                      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Bot aktif dan siap membalas pesan masuk.</div>
                      <Btn danger onClick={handleLogoutWA}>
                        Logout WhatsApp
                      </Btn>
                    </div>
                  )}

                  {/* Status badge */}
                  <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
                    <Badge
                      text={waStatus === "ready" ? "🟢 Online" : waStatus === "qr" ? "🟡 Scan QR" : waStatus === "connecting" ? "🔵 Connecting" : "🔴 Offline"}
                      color={waStatus === "ready" ? "#15803d" : waStatus === "qr" ? "#92400e" : waStatus === "connecting" ? "#1d4ed8" : "#ef4444"}
                    />
                  </div>
                </Card>

                {/* Keyword Builder */}
                <Card style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 16 }}>🔑 Keyword Custom</h3>
                  {keywords.map((kw, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <input value={kw.keyword} onChange={e => setKeywords(kws => kws.map((k, j) => j === i ? { ...k, keyword: e.target.value } : k))}
                          placeholder="keyword" style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, boxSizing: "border-box" }} />
                      </div>
                      <div style={{ flex: 2 }}>
                        <input value={kw.reply} onChange={e => setKeywords(kws => kws.map((k, j) => j === i ? { ...k, reply: e.target.value } : k))}
                          placeholder="balasan bot" style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, boxSizing: "border-box" }} />
                      </div>
                      <button onClick={() => setKeywords(kws => kws.filter((_, j) => j !== i))}
                        style={{ background: "#fee2e2", border: "none", borderRadius: 6, padding: "7px 10px", cursor: "pointer", color: "#ef4444", fontWeight: 700 }}>✕</button>
                    </div>
                  ))}
                  <Btn small outline onClick={() => setKeywords(kws => [...kws, { keyword: "", reply: "" }])}>
                    <Icon d={ICONS.plus} size={14} /> Tambah Keyword
                  </Btn>
                </Card>

                {/* Preview Chat */}
                <Card>
                  <h3 style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 16 }}>💬 Preview Chat</h3>
                  <div style={{ background: "#e5ddd5", borderRadius: 10, padding: 12, minHeight: 160, maxHeight: 220, overflowY: "auto", marginBottom: 10 }}>
                    {chatHistory.length === 0 && <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", marginTop: 40 }}>Coba kirim pesan di bawah...</div>}
                    {chatHistory.map((c, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: c.role === "user" ? "flex-end" : "flex-start", marginBottom: 6 }}>
                        <div style={{
                          background: c.role === "user" ? "#dcf8c6" : "#fff",
                          borderRadius: 10, padding: "6px 12px", maxWidth: "80%", fontSize: 13, boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                        }}>{c.msg}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={previewInput} onChange={e => setPreviewInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendPreview()}
                      placeholder="Tulis pesan..." style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }} />
                    <Btn small onClick={sendPreview}><Icon d={ICONS.send} size={14} /></Btn>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ── TAB: AI BOT ── */}
          {tab === "ai" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card>
                <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 16 }}>🤖 Pengaturan AI</h3>
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: "#1e40af" }}>
                  💡 AI akan menjawab <strong>semua pertanyaan</strong> dari pengguna. Minimal set 1 API key. Claude (Anthropic) lebih disarankan.
                </div>
                <Input label="Nama Bot" value={cfg.botName} onChange={v => set("botName", v)} placeholder="BotTorik" />
                <Textarea label="Konteks Bisnis (opsional)" value={cfg.bizContext} onChange={v => set("bizContext", v)}
                  placeholder="Contoh: Toko online yang menjual produk elektronik. Buka Senin-Sabtu 08.00-20.00." rows={3} />
                <Input label="Anthropic API Key (Claude)" value={cfg.anthropicKey} onChange={v => set("anthropicKey", v)} type="password" placeholder="sk-ant-api03-..." mono />
                <Input label="OpenAI API Key (fallback)" value={cfg.openaiKey} onChange={v => set("openaiKey", v)} type="password" placeholder="sk-proj-..." mono />
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12, fontSize: 13, color: "#15803d" }}>
                  <strong>Urutan:</strong> Claude → OpenAI → Auto-reply. Jika keduanya tidak di-set, bot pakai pesan auto-reply biasa.
                </div>
              </Card>
              <Card>
                <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 16 }}>✨ Cara Pakai AI Bot</h3>
                {[
                  ["1. Set Konteks Bisnis", "Isi deskripsi bisnismu agar AI tahu apa yang dijual/ditawarkan."],
                  ["2. Set API Key", "Dapatkan Anthropic key di console.anthropic.com atau OpenAI key di platform.openai.com."],
                  ["3. Set BOT_MODE=ai", "Mode ini membuat bot jawab semua pesan via AI."],
                  ["4. Keyword tetap prioritas", "Keyword custom akan dicocokkan dulu sebelum AI. Cocok untuk harga, alamat, dll."],
                  ["5. AI bisa jawab apa saja", "Pertanyaan produk, jam buka, keluhan, konsultasi — semua dijawab AI."],
                ].map(([t, d]) => (
                  <div key={t} style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{t}</div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{d}</div>
                  </div>
                ))}
                <div style={{ marginTop: 16, background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: 12, fontSize: 12, color: "#7e22ce", fontFamily: "monospace" }}>
                  Pengguna: "Apakah produk A tersedia?"<br />
                  Bot AI: "Hai! Produk A saat ini tersedia. Stok kami selalu update. Mau saya bantu proses pesanan?" 🤖
                </div>
              </Card>
            </div>
          )}

          {/* ── TAB: EMAIL ── */}
          {tab === "email" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card>
                <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 16 }}>📧 Pengaturan SMTP</h3>
                <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: "#c2410c" }}>
                  ⚡ Bot bisa kirim email otomatis! Pengguna WA bisa ketik: <strong>"kirim email ke user@example.com: isi pesan"</strong>
                </div>
                <Input label="SMTP Host" value={emailCfg.smtpHost} onChange={v => setE("smtpHost", v)} placeholder="smtp.gmail.com" mono />
                <Input label="SMTP Port" value={emailCfg.smtpPort} onChange={v => setE("smtpPort", v)} placeholder="587" />
                <Input label="Email (username)" value={emailCfg.smtpUser} onChange={v => setE("smtpUser", v)} placeholder="tokomu@gmail.com" />
                <Input label="Password / App Password" value={emailCfg.smtpPass} onChange={v => setE("smtpPass", v)} type="password" placeholder="••••••••" />
                <Input label="From Name/Email" value={emailCfg.smtpFrom} onChange={v => setE("smtpFrom", v)} placeholder="Toko Saya <tokomu@gmail.com>" />
                <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 12, fontSize: 12, color: "#15803d" }}>
                  <strong>Gmail:</strong> Aktifkan "App Password" di myaccount.google.com → Security → 2FA → App passwords
                </div>
              </Card>

              <Card>
                <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 16 }}>✉️ Kirim Email Manual</h3>
                <Input label="Kirim ke" value={emailForm.to} onChange={v => setEmailForm(f => ({ ...f, to: v }))} placeholder="customer@email.com" />
                <Input label="Subject" value={emailForm.subject} onChange={v => setEmailForm(f => ({ ...f, subject: v }))} placeholder="Konfirmasi Pesanan #1234" />
                <Textarea label="Isi Email" value={emailForm.body} onChange={v => setEmailForm(f => ({ ...f, body: v }))} rows={5} placeholder="Halo, terima kasih sudah memesan..." />
                <Btn onClick={sendEmail}>
                  <Icon d={ICONS.send} size={16} /> Kirim Email
                </Btn>
                {emailStatus && <div style={{ marginTop: 10, fontSize: 13, color: emailStatus === "success" ? "#22c55e" : "#ef4444" }}>
                  {emailStatus === "success" ? "✅ Email berhasil terkirim!" : "❌ " + emailStatus}
                </div>}

                <div style={{ marginTop: 20, borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
                  <h4 style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 14 }}>🤖 Perintah Email dari WhatsApp</h4>
                  <div style={{ background: "#f3f4f6", borderRadius: 8, padding: 10, fontSize: 12, fontFamily: "monospace", color: "#374151" }}>
                    kirim email ke admin@toko.com: Halo, saya mau tanya stok produk
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
                    Bot akan otomatis forward pesan tersebut sebagai email.
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ── TAB: EXCEL ── */}
          {tab === "excel" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card>
                <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 16 }}>📥 Import Keyword dari Excel/CSV</h3>
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: "#1e40af" }}>
                  Upload file Excel/CSV dengan kolom <strong>keyword</strong> dan <strong>reply</strong> untuk menambah keyword secara massal.
                </div>
                <div style={{ border: "2px dashed #c7d2fe", borderRadius: 10, padding: 24, textAlign: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Upload File CSV / Excel</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>Format CSV dengan kolom: keyword, reply</div>
                  <input type="file" accept=".csv,.txt" ref={fileRef} onChange={uploadExcel} style={{ display: "none" }} />
                  <Btn onClick={() => fileRef.current.click()}>
                    <Icon d={ICONS.up} size={16} /> Pilih File
                  </Btn>
                </div>
                {excelStatus && <div style={{ fontSize: 13, color: excelStatus.startsWith("✅") ? "#15803d" : "#ef4444", marginBottom: 10 }}>{excelStatus}</div>}
                {excelKeywords.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Preview ({excelKeywords.length} keyword):</div>
                    <div style={{ maxHeight: 160, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead><tr style={{ background: "#f3f4f6" }}>
                          <th style={{ padding: "6px 10px", textAlign: "left" }}>Keyword</th>
                          <th style={{ padding: "6px 10px", textAlign: "left" }}>Reply</th>
                        </tr></thead>
                        <tbody>{excelKeywords.map((k, i) => (
                          <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "6px 10px", fontWeight: 600, color: "#6366f1" }}>{k.keyword}</td>
                            <td style={{ padding: "6px 10px", color: "#374151" }}>{k.reply}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Btn onClick={applyExcelKeywords}><Icon d={ICONS.check} size={16} /> Terapkan Keyword</Btn>
                    </div>
                  </div>
                )}
              </Card>

              <Card>
                <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 16 }}>📤 Export Template CSV</h3>
                <div style={{ marginBottom: 16, fontSize: 13, color: "#6b7280" }}>
                  Download template CSV, isi dengan keyword kamu di Excel/Google Sheets, lalu upload kembali.
                </div>
                <Btn onClick={downloadTemplate}>
                  <Icon d={ICONS.down} size={16} /> Download Template CSV
                </Btn>

                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📋 Keyword Aktif Saat Ini</h4>
                  <div style={{ maxHeight: 240, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead><tr style={{ background: "#f3f4f6" }}>
                        <th style={{ padding: "6px 10px", textAlign: "left" }}>Keyword</th>
                        <th style={{ padding: "6px 10px", textAlign: "left" }}>Reply</th>
                      </tr></thead>
                      <tbody>{keywords.map((k, i) => (
                        <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "6px 10px", fontWeight: 600, color: "#6366f1" }}>{k.keyword}</td>
                          <td style={{ padding: "6px 10px", color: "#374151" }}>{k.reply}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>

                <div style={{ marginTop: 16, background: "#fafafa", borderRadius: 8, padding: 12, fontSize: 12, color: "#9ca3af" }}>
                  <strong>Format CSV:</strong>
                  <pre style={{ marginTop: 6, marginBottom: 0, fontFamily: "monospace", color: "#374151" }}>{`keyword,reply\nharga,"Harga mulai Rp 50.000!"\nalamat,"Jl. Merdeka No. 1 Bandung"`}</pre>
                </div>
              </Card>
            </div>
          )}

          {/* ── TAB: KEEP ALIVE ── */}
          {tab === "alive" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card>
                <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 16 }}>🟢 Bot Tetap Menyala 24/7</h3>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13, color: "#15803d" }}>
                  <strong>Bot berjalan di cloud (Vercel)</strong> — tidak perlu laptop menyala! Bot tetap online 24 jam sehari, 7 hari seminggu, bahkan saat kamu tidur atau laptop mati.
                </div>
                <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Cara Setup Keep-Alive (gratis):</h4>
                {[
                  { step: "1", title: "Deploy ke Vercel", desc: "Upload kode ini ke GitHub → import di vercel.com → deploy. Bot langsung online di cloud." },
                  { step: "2", title: "Daftar UptimeRobot", desc: "Buka uptimerobot.com → daftar gratis → klik 'Add New Monitor'." },
                  { step: "3", title: "Set Monitor HTTP", desc: "Tipe: HTTP(s), Nama: BotTorik, URL: https://NAMA-APP.vercel.app/api/keep-alive, Interval: 5 menit." },
                  { step: "4", title: "Selesai!", desc: "UptimeRobot akan ping bot kamu setiap 5 menit. Bot tidak pernah tidur dan selalu siap membalas." },
                ].map(s => (
                  <div key={s.step} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.step}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{s.title}</div>
                      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </Card>

              <Card>
                <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 16 }}>🔗 URL Keep-Alive</h3>
                <div style={{ marginBottom: 16, fontSize: 13, color: "#6b7280" }}>
                  Setelah deploy ke Vercel, URL keep-alive bot kamu adalah:
                </div>
                <div style={{ background: "#f3f4f6", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 13, color: "#374151", marginBottom: 12 }}>
                  https://NAMA-APP.vercel.app/api/keep-alive
                </div>
                <div style={{ marginBottom: 20 }}>
                  <a href="https://uptimerobot.com" target="_blank" rel="noreferrer"
                    style={{ color: "#6366f1", fontWeight: 600, fontSize: 14 }}>
                    → Buka UptimeRobot (gratis) ↗
                  </a>
                </div>

                <h4 style={{ fontWeight: 700, fontSize: 14, margin: "0 0 10px" }}>📊 Perbandingan</h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead><tr style={{ background: "#f3f4f6" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>Cara</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>Online saat laptop mati?</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>Biaya</th>
                  </tr></thead>
                  <tbody>
                    {[
                      ["Run lokal", "❌ Tidak", "Gratis"],
                      ["Vercel + UptimeRobot", "✅ Ya!", "Gratis"],
                      ["VPS (DigitalOcean dll)", "✅ Ya!", "~$5/bln"],
                    ].map(([c, o, b]) => (
                      <tr key={c} style={{ borderTop: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "8px" }}>{c}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{o}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ── ENV Generator (sticky bottom) ── */}
          <div style={{ marginTop: 24 }}>
            <Card style={{ borderColor: "#c7d2fe", background: "#fafafe" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>📋 Environment Variables — Salin ke Vercel</h3>
                <Btn small onClick={copyEnv}>
                  <Icon d={ICONS.copy} size={14} /> {copied === "env" ? "✅ Tersalin!" : "Salin Semua"}
                </Btn>
              </div>
              <pre style={{ background: "#1e1e2e", color: "#cdd6f4", borderRadius: 8, padding: 14, fontSize: 11, overflowX: "auto", margin: 0, maxHeight: 200, fontFamily: "monospace" }}>
                {envStr}
              </pre>
            </Card>
          </div>

        </div>
      </div>
    </>
  );
}
