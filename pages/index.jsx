import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

// ── Auth helpers ─────────────────────────────────────────────────────────────
const TOKEN_KEY  = "bottorik_dash_token";
const getToken   = () => (typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : null);
const setToken   = (t) => sessionStorage.setItem(TOKEN_KEY, t);
const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);
const authHeaders = () => ({ "Content-Type": "application/json", "x-dashboard-token": getToken() || "" });

// ── Toast System ─────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);
  const remove = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);
  return { toasts, toast: add, removeToast: remove };
}

function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null;
  const colorMap = {
    success: { bg: "#052e16", border: "#16a34a", text: "#4ade80" },
    error:   { bg: "#450a0a", border: "#dc2626", text: "#f87171" },
    warning: { bg: "#431407", border: "#ea580c", text: "#fb923c" },
    info:    { bg: "#0c1a2e", border: "#3b82f6", text: "#60a5fa" },
  };
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, maxWidth: 360 }}>
      {toasts.map(t => {
        const c = colorMap[t.type] || colorMap.info;
        return (
          <div key={t.id} onClick={() => removeToast(t.id)} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            background: c.bg, border: `1px solid ${c.border}`, color: c.text,
            borderRadius: 10, padding: "12px 14px", fontSize: 13, fontWeight: 500,
            cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            animation: "slideIn 0.25s ease",
          }}>
            <span style={{ fontSize: 16, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>
              {t.type === "success" ? "✓" : t.type === "error" ? "✕" : t.type === "warning" ? "⚠" : "ℹ"}
            </span>
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw]   = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake]     = useState(false);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const handleSubmit = async () => {
    if (!pw) { setErr("Masukkan password dulu."); triggerShake(); return; }
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      const d = await r.json();
      if (d.ok && d.token) { setToken(d.token); onLogin(); }
      else { setErr(d.error || "Password salah."); triggerShake(); }
    } catch { setErr("Tidak bisa terhubung ke server."); triggerShake(); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
      <div style={{ animation: "fadeUp 0.4s ease", width: 380, padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: "#18181b", border: "1px solid #27272a", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>🤖</div>
          <div style={{ fontWeight: 700, fontSize: 22, color: "#fafafa", letterSpacing: "-0.5px" }}>BotTorik</div>
          <div style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>Dashboard Admin</div>
        </div>
        <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 16, padding: "24px 24px 20px", animation: shake ? "shake 0.4s ease" : "none" }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#71717a", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Password</label>
          <input type="password" value={pw} autoFocus
            onChange={e => { setPw(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="Masukkan password..."
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, boxSizing: "border-box", background: "#09090b", border: `1px solid ${err ? "#dc2626" : "#27272a"}`, color: "#fafafa", fontSize: 14, outline: "none", transition: "border-color 0.15s" }}
            onFocus={e => !err && (e.target.style.borderColor = "#6366f1")}
            onBlur={e => !err && (e.target.style.borderColor = "#27272a")}
          />
          {err && <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#f87171", fontSize: 12, marginTop: 6 }}><span>✕</span>{err}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", marginTop: 14, padding: "10px", borderRadius: 8, border: "none",
            background: loading ? "#4f46e5" : "#6366f1", color: "#fff", fontWeight: 600, fontSize: 14,
            cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {loading ? <><span style={{ width: 14, height: 14, border: "2px solid #ffffff40", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />Memeriksa...</> : "🔐 Masuk"}
          </button>
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", background: "#18181b", borderRadius: 10, border: "1px solid #27272a", fontSize: 12, color: "#71717a" }}>
          Default password: <code style={{ background: "#27272a", color: "#a1a1aa", borderRadius: 4, padding: "1px 5px" }}>bottorik123</code>
          {" "}— ubah via env <code style={{ background: "#27272a", color: "#a1a1aa", borderRadius: 4, padding: "1px 5px" }}>DASHBOARD_PASSWORD</code>
        </div>
      </div>
    </div>
  );
}

// ── Global CSS ─────────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes slideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes ping { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(1.8);opacity:0} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #18181b; }
  ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
  input, textarea, select { font-family: inherit; }
  button { font-family: inherit; }
`;

// ── Shared Components ─────────────────────────────────────────────────────────
function Input({ label, value, onChange, type = "text", placeholder = "", mono = false, hint, disabled = false }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#71717a", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid #27272a", background: disabled ? "#111" : "#09090b", color: disabled ? "#52525b" : "#fafafa", fontSize: 13, outline: "none", fontFamily: mono ? "'JetBrains Mono','Fira Code',monospace" : "inherit", transition: "border-color 0.15s" }}
        onFocus={e => !disabled && (e.target.style.borderColor = "#6366f1")}
        onBlur={e => (e.target.style.borderColor = "#27272a")}
      />
      {hint && <div style={{ fontSize: 11, color: "#52525b", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 3, placeholder = "", mono = false, disabled = false }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#71717a", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder} disabled={disabled}
        style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid #27272a", background: disabled ? "#111" : "#09090b", color: disabled ? "#52525b" : "#fafafa", fontSize: 13, outline: "none", resize: "vertical", fontFamily: mono ? "'JetBrains Mono','Fira Code',monospace" : "inherit", transition: "border-color 0.15s" }}
        onFocus={e => !disabled && (e.target.style.borderColor = "#6366f1")}
        onBlur={e => (e.target.style.borderColor = "#27272a")}
      />
    </div>
  );
}

function Btn({ onClick, children, variant = "primary", size = "md", loading = false, disabled = false, fullWidth = false }) {
  const sizes = { sm: { padding: "5px 12px", fontSize: 12 }, md: { padding: "8px 16px", fontSize: 13 }, lg: { padding: "11px 22px", fontSize: 14 } };
  const variants = {
    primary: { background: disabled || loading ? "#4338ca" : "#6366f1", color: "#fff", border: "1px solid transparent" },
    danger:  { background: disabled || loading ? "#991b1b" : "#dc2626", color: "#fff", border: "1px solid transparent" },
    ghost:   { background: "transparent", color: "#a1a1aa", border: "1px solid #27272a" },
    success: { background: disabled || loading ? "#14532d" : "#16a34a", color: "#fff", border: "1px solid transparent" },
    warning: { background: disabled || loading ? "#7c2d12" : "#ea580c", color: "#fff", border: "1px solid transparent" },
  };
  return (
    <button onClick={!disabled && !loading ? onClick : undefined} style={{ ...sizes[size], ...variants[variant], borderRadius: 8, fontWeight: 600, cursor: disabled || loading ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "opacity 0.15s, transform 0.1s", opacity: disabled ? 0.5 : 1, width: fullWidth ? "100%" : "auto" }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => e.currentTarget.style.opacity = disabled ? "0.5" : "1"}
      onMouseDown={e => { if (!disabled && !loading) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    >
      {loading && <span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />}
      {children}
    </button>
  );
}

function Card({ children, style = {}, accent }) {
  return (
    <div style={{ background: "#18181b", borderRadius: 12, border: `1px solid ${accent ? "#6366f1" : "#27272a"}`, padding: "18px 20px", ...(accent ? { boxShadow: "0 0 0 1px #6366f130, inset 0 0 20px #6366f108" } : {}), ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, badge }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <h3 style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#fafafa" }}>{children}</h3>
      {badge && <span style={{ background: "#27272a", color: "#a1a1aa", borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 600 }}>{badge}</span>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ready:        { dot: "#4ade80", text: "Online",     bg: "#14532d", fg: "#4ade80" },
    connecting:   { dot: "#60a5fa", text: "Connecting", bg: "#1e3a5f", fg: "#60a5fa" },
    qr:           { dot: "#fbbf24", text: "Scan QR",    bg: "#451a03", fg: "#fbbf24" },
    disconnected: { dot: "#f87171", text: "Offline",    bg: "#450a0a", fg: "#f87171" },
  };
  const s = map[status] || map.disconnected;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.fg, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block", flexShrink: 0, animation: status === "ready" ? "ping 1.5s ease-in-out infinite" : "none" }} />
      {s.text}
    </span>
  );
}

function InfoBox({ type = "info", children }) {
  const colors = {
    info:    { bg: "#0c1a2e", border: "#1d4ed8", text: "#93c5fd" },
    warning: { bg: "#451a03", border: "#9a3412", text: "#fb923c" },
    success: { bg: "#0a2818", border: "#14532d", text: "#4ade80" },
    danger:  { bg: "#450a0a", border: "#7f1d1d", text: "#f87171" },
  };
  const c = colors[type];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: "9px 12px", marginBottom: 14, fontSize: 12, color: c.text, lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

// ── TABS ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "whatsapp", label: "WhatsApp",   emoji: "💬" },
  { id: "ai",       label: "AI Bot",     emoji: "🤖" },
  { id: "email",    label: "Email",      emoji: "📧" },
  { id: "excel",    label: "Excel/CSV",  emoji: "📊" },
  { id: "alive",    label: "Keep Alive", emoji: "🟢" },
  { id: "logs",     label: "Log Aktifitas", emoji: "🗒️" },
  { id: "settings", label: "Pengaturan", emoji: "⚙️" },
];

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [authed, setAuthed]           = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { setAuthChecked(true); return; }
    fetch("/api/auth", { headers: { "x-dashboard-token": token } })
      .then(r => { if (r.ok) setAuthed(true); else clearToken(); })
      .catch(() => clearToken())
      .finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#09090b" }}>
      <span style={{ width: 20, height: 20, border: "2px solid #3f3f46", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => { clearToken(); setAuthed(false); }} />;
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const { toasts, toast, removeToast } = useToast();
  const [tab, setTab] = useState("whatsapp");

  // Status
  const [botStatus, setBotStatus] = useState(null);
  const [waStatus, setWaStatus]   = useState("disconnected");
  const [qrImage, setQrImage]     = useState(null);
  const waPollerRef = useRef(null);

  // Bot config
  const [cfg, setCfg] = useState({
    botMode: "ai", autoReply: "Halo! Lagi tidak bisa balas, nanti saya hubungi ya 😊",
    cooldown: "0", adminWa: "", bizContext: "", botName: "BotTorik",
    anthropicKey: "", openaiKey: "",
  });

  // Email config
  const [emailCfg, setEmailCfg] = useState({ smtpHost: "", smtpPort: "587", smtpUser: "", smtpPass: "", smtpFrom: "" });
  const [smtpTestResult, setSmtpTestResult] = useState(null);

  // Forms
  const [emailForm, setEmailForm]   = useState({ to: "", subject: "", body: "" });
  const [manualForm, setManualForm] = useState({ to: "", message: "" });

  // Loading states
  const [loadingStates, setLoadingStates] = useState({});
  const setLoading = (key, val) => setLoadingStates(s => ({ ...s, [key]: val }));

  // Keywords
  const [keywords, setKeywords] = useState([
    { keyword: "harga",  reply: "Harga mulai dari Rp 50.000 ya!" },
    { keyword: "alamat", reply: "Kami di Jl. Merdeka No. 1, Bandung 😊" },
  ]);

  // Excel
  const [excelKeywords, setExcelKeywords] = useState([]);
  const fileRef = useRef();

  // Chat preview
  const [chatHistory, setChatHistory]   = useState([]);
  const [previewInput, setPreviewInput] = useState("");
  const chatEndRef = useRef(null);

  // AI Test chat
  const [aiTestHistory, setAiTestHistory]   = useState([]);
  const [aiTestInput, setAiTestInput]       = useState("");
  const [aiTestLoading, setAiTestLoading]   = useState(false);
  const aiChatEndRef = useRef(null);

  // Log
  const [activityLog, setActivityLog]   = useState([]);
  const [logFilter, setLogFilter]       = useState("all");

  // Keep alive
  const [kaUrl, setKaUrl]               = useState("");
  const [kaPingResult, setKaPingResult] = useState(null);

  // Copied
  const [copied, setCopied] = useState("");

  const addLog = useCallback((msg, type = "info") => {
    const time = new Date().toLocaleTimeString("id-ID");
    setActivityLog(l => [{ id: Date.now() + Math.random(), msg, type, time }, ...l].slice(0, 100));
  }, []);

  const set  = (k, v) => setCfg(c => ({ ...c, [k]: v }));
  const setE = (k, v) => setEmailCfg(c => ({ ...c, [k]: v }));

  // ── WA Polling ────────────────────────────────────────────────────────────
  const startWAPoller = useCallback(() => {
    if (waPollerRef.current) return;
    waPollerRef.current = setInterval(async () => {
      try {
        const r = await fetch("/api/wa-init", { headers: authHeaders() });
        const d = await r.json();
        setWaStatus(d.status);
        setQrImage(d.qr || null);
        if (d.status === "ready") {
          addLog("✅ WhatsApp berhasil terhubung!", "success");
          toast("✅ WhatsApp terhubung!", "success");
          clearInterval(waPollerRef.current); waPollerRef.current = null;
        }
        if (d.status === "disconnected") {
          clearInterval(waPollerRef.current); waPollerRef.current = null;
        }
      } catch (_) {}
    }, 3000);
  }, [addLog, toast]);

  const handleConnectWA = async () => {
    setWaStatus("connecting"); setQrImage(null);
    addLog("Memulai koneksi WhatsApp...", "info");
    await fetch("/api/wa-init", { method: "POST", headers: authHeaders() });
    startWAPoller();
  };

  const handleLogoutWA = async () => {
    if (!confirm("Yakin mau logout WhatsApp?")) return;
    setLoading("logoutWA", true);
    await fetch("/api/wa-init", { method: "DELETE", headers: authHeaders() });
    setWaStatus("disconnected"); setQrImage(null);
    if (waPollerRef.current) { clearInterval(waPollerRef.current); waPollerRef.current = null; }
    addLog("WhatsApp dilogout.", "warning");
    toast("WhatsApp berhasil dilogout.", "warning");
    setLoading("logoutWA", false);
  };

  useEffect(() => {
    fetch("/api/wa-init", { headers: authHeaders() }).then(r => r.json()).then(d => {
      setWaStatus(d.status); setQrImage(d.qr || null);
      if (d.status === "connecting" || d.status === "qr") startWAPoller();
    }).catch(() => {});
    fetch("/api/status", { headers: authHeaders() }).then(r => r.json()).then(d => {
      setBotStatus(d);
      addLog("Dashboard dimuat. Status WA: " + (d.wa_connected ? "terhubung" : "terputus"), d.wa_connected ? "success" : "warning");
    }).catch(() => {});
    return () => { if (waPollerRef.current) clearInterval(waPollerRef.current); };
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);
  useEffect(() => { aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiTestHistory]);

  // ── Kirim WA Manual ───────────────────────────────────────────────────────
  const sendManual = async () => {
    if (!manualForm.to || !manualForm.message) { toast("Isi nomor dan pesan dulu!", "warning"); return; }
    setLoading("sendWA", true);
    addLog(`Mengirim pesan ke ${manualForm.to}...`, "info");
    try {
      const r = await fetch("/api/send", { method: "POST", headers: authHeaders(), body: JSON.stringify({ to: manualForm.to, message: manualForm.message }) });
      const d = await r.json();
      if (d.success) {
        toast(`✅ Pesan terkirim ke ${manualForm.to}`, "success");
        addLog(`Pesan terkirim ke ${manualForm.to}`, "success");
        setManualForm(f => ({ ...f, message: "" }));
      } else {
        toast("❌ Gagal kirim: " + (d.error || "Unknown error"), "error");
        addLog(`Gagal kirim ke ${manualForm.to}: ${d.error}`, "error");
      }
    } catch { toast("❌ Error koneksi server", "error"); }
    setLoading("sendWA", false);
  };

  // ── Broadcast WA ──────────────────────────────────────────────────────────
  const [broadcastForm, setBroadcastForm] = useState({ numbers: "", message: "" });
  const [broadcastResult, setBroadcastResult] = useState(null);

  const sendBroadcast = async () => {
    const nums = broadcastForm.numbers.split("\n").map(n => n.trim()).filter(Boolean);
    if (!nums.length || !broadcastForm.message) { toast("Isi nomor dan pesan broadcast!", "warning"); return; }
    if (!confirm(`Kirim ke ${nums.length} nomor?`)) return;
    setLoading("broadcast", true);
    setBroadcastResult(null);
    addLog(`Broadcast ke ${nums.length} nomor...`, "info");
    let ok = 0, fail = 0;
    for (const num of nums) {
      try {
        const r = await fetch("/api/send", { method: "POST", headers: authHeaders(), body: JSON.stringify({ to: num, message: broadcastForm.message }) });
        const d = await r.json();
        if (d.success) ok++; else fail++;
      } catch { fail++; }
      await new Promise(res => setTimeout(res, 1200)); // delay 1.2s antar kirim
    }
    setBroadcastResult({ ok, fail, total: nums.length });
    toast(`Broadcast selesai: ${ok} berhasil, ${fail} gagal`, ok > 0 ? "success" : "error");
    addLog(`Broadcast selesai: ${ok}/${nums.length} berhasil`, ok === nums.length ? "success" : "warning");
    setLoading("broadcast", false);
  };

  // ── Kirim Email ───────────────────────────────────────────────────────────
  const sendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) { toast("Isi semua field email!", "warning"); return; }
    setLoading("sendEmail", true);
    addLog(`Mengirim email ke ${emailForm.to}...`, "info");
    try {
      const r = await fetch("/api/email", { method: "POST", headers: authHeaders(), body: JSON.stringify(emailForm) });
      const d = await r.json();
      if (d.success) {
        toast("✅ Email berhasil dikirim!", "success");
        addLog(`Email terkirim ke ${emailForm.to}`, "success");
        setEmailForm({ to: "", subject: "", body: "" });
      } else {
        toast("❌ Gagal: " + (d.error || "Unknown"), "error");
        addLog(`Gagal kirim email: ${d.error}`, "error");
      }
    } catch { toast("❌ Error koneksi server", "error"); }
    setLoading("sendEmail", false);
  };

  // ── Test SMTP (Real) ──────────────────────────────────────────────────────
  const testSMTP = async () => {
    if (!emailCfg.smtpHost || !emailCfg.smtpUser || !emailCfg.smtpPass) {
      toast("Isi Host, Email, dan Password dulu!", "warning"); return;
    }
    setLoading("testSMTP", true);
    setSmtpTestResult(null);
    addLog("Menguji koneksi SMTP...", "info");
    try {
      const r = await fetch("/api/smtp-test", {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ host: emailCfg.smtpHost, port: emailCfg.smtpPort, user: emailCfg.smtpUser, pass: emailCfg.smtpPass }),
      });
      const d = await r.json();
      setSmtpTestResult(d);
      if (d.success) {
        toast("✅ Koneksi SMTP berhasil!", "success");
        addLog("Test SMTP berhasil ✅", "success");
      } else {
        toast("❌ SMTP gagal: " + d.error, "error");
        addLog("Test SMTP gagal: " + d.error, "error");
      }
    } catch (e) {
      setSmtpTestResult({ success: false, error: e.message });
      toast("❌ Error: " + e.message, "error");
    }
    setLoading("testSMTP", false);
  };

  // ── AI Test Chat (Real) ───────────────────────────────────────────────────
  const sendAITest = async () => {
    const msg = aiTestInput.trim();
    if (!msg) return;
    if (!cfg.anthropicKey && !cfg.openaiKey) { toast("Isi API Key dulu di bagian 'API Keys'!", "warning"); return; }
    const newHistory = [...aiTestHistory, { role: "user", msg, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) }];
    setAiTestHistory(newHistory);
    setAiTestInput("");
    setAiTestLoading(true);
    try {
      const r = await fetch("/api/ai-test", {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ message: msg, anthropicKey: cfg.anthropicKey, openaiKey: cfg.openaiKey, bizContext: cfg.bizContext, botName: cfg.botName }),
      });
      const d = await r.json();
      const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      if (d.success) {
        setAiTestHistory(h => [...h, { role: "bot", msg: d.reply, time, engine: d.engine }]);
        addLog(`AI Test: menjawab via ${d.engine}`, "success");
      } else {
        setAiTestHistory(h => [...h, { role: "error", msg: "❌ " + d.error, time }]);
        addLog("AI Test gagal: " + d.error, "error");
      }
    } catch (e) {
      setAiTestHistory(h => [...h, { role: "error", msg: "❌ Koneksi error: " + e.message, time: "—" }]);
    }
    setAiTestLoading(false);
  };

  // ── Chat Preview (Simulasi) ───────────────────────────────────────────────
  const sendPreview = () => {
    const msg = previewInput.trim();
    if (!msg) return;
    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    setChatHistory(h => [...h, { role: "user", msg, time }]);
    setPreviewInput("");
    setTimeout(() => {
      const lower = msg.toLowerCase();
      const kwMatch = keywords.find(k => lower.includes(k.keyword.toLowerCase()));
      let botMsg;
      if (kwMatch) botMsg = kwMatch.reply;
      else if (cfg.botMode === "ai") botMsg = "🤖 [AI akan menjawab ini — konfigurasikan API Key di tab AI Bot]";
      else if (cfg.botMode === "auto") botMsg = cfg.autoReply;
      else botMsg = "(Mode keyword — tidak ada keyword yang cocok)";
      setChatHistory(h => [...h, { role: "bot", msg: botMsg, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 600);
  };

  // ── Save Keywords ─────────────────────────────────────────────────────────
  const saveKeywords = async () => {
    setLoading("saveKw", true);
    await new Promise(r => setTimeout(r, 700));
    toast("✅ Keyword disimpan! Salin ENV di bawah untuk permanen.", "success");
    addLog(`Keyword disimpan (${keywords.length} entri)`, "success");
    setLoading("saveKw", false);
  };

  // ── Export Keyword CSV ────────────────────────────────────────────────────
  const exportKeywords = () => {
    const rows = ["keyword,reply", ...keywords.map(k => `"${k.keyword}","${k.reply.replace(/"/g, '""')}"`)].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "bottorik-keywords.csv"; a.click();
    URL.revokeObjectURL(url);
    toast("✅ Keyword diekspor!", "success");
    addLog(`Export ${keywords.length} keyword ke CSV`, "success");
  };

  // ── Excel Upload ──────────────────────────────────────────────────────────
  const downloadTemplate = () => { window.open("/api/excel", "_blank"); };
  const uploadExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading("uploadExcel", true);
    addLog(`Upload file: ${file.name}`, "info");
    const text = await file.text();
    const r = await fetch("/api/excel", { method: "POST", headers: { "Content-Type": "text/plain", "x-dashboard-token": getToken() || "" }, body: text });
    const d = await r.json();
    if (d.success) {
      setExcelKeywords(d.keywords);
      toast(`✅ ${d.message}`, "success");
      addLog(`Import ${d.keywords?.length || 0} keyword dari ${file.name}`, "success");
    } else {
      toast("❌ " + d.error, "error");
      addLog("Gagal import: " + d.error, "error");
    }
    setLoading("uploadExcel", false);
    e.target.value = "";
  };
  const applyExcelKeywords = () => {
    setKeywords(prev => {
      const merged = [...prev];
      for (const ek of excelKeywords) {
        const idx = merged.findIndex(k => k.keyword === ek.keyword);
        if (idx >= 0) merged[idx] = ek; else merged.push(ek);
      }
      return merged;
    });
    setExcelKeywords([]);
    toast("✅ Keyword dari Excel diterapkan!", "success");
    addLog("Keyword Excel diterapkan", "success");
  };

  // ── Keep Alive Ping Test ──────────────────────────────────────────────────
  const pingKeepAlive = async () => {
    const url = kaUrl.trim() || "/api/keep-alive";
    setLoading("ping", true);
    setKaPingResult(null);
    addLog(`Ping keep-alive: ${url}`, "info");
    const start = Date.now();
    try {
      const r = await fetch(url);
      const d = await r.json();
      const ms = Date.now() - start;
      setKaPingResult({ ok: true, ms, data: d });
      toast(`✅ Ping berhasil! ${ms}ms`, "success");
      addLog(`Ping OK (${ms}ms)`, "success");
    } catch (e) {
      setKaPingResult({ ok: false, error: e.message });
      toast("❌ Ping gagal: " + e.message, "error");
      addLog("Ping gagal: " + e.message, "error");
    }
    setLoading("ping", false);
  };

  // ── Copy helpers ──────────────────────────────────────────────────────────
  const copyText = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2500);
    });
  };

  // ── ENV string ────────────────────────────────────────────────────────────
  const envStr = [
    "# BotTorik — Environment Variables",
    `ANTHROPIC_API_KEY=${cfg.anthropicKey || ""}`,
    `OPENAI_API_KEY=${cfg.openaiKey || ""}`,
    `BOT_NAME=${cfg.botName}`,
    `BOT_MODE=${cfg.botMode}`,
    `AUTO_REPLY_MESSAGE=${cfg.autoReply}`,
    `REPLY_COOLDOWN_MINUTES=${cfg.cooldown}`,
    `BIZ_CONTEXT=${cfg.bizContext}`,
    `ADMIN_WA=${cfg.adminWa}`,
    `SMTP_HOST=${emailCfg.smtpHost}`,
    `SMTP_PORT=${emailCfg.smtpPort}`,
    `SMTP_USER=${emailCfg.smtpUser}`,
    `SMTP_PASS=PASTE_PASSWORD_EMAIL_DI_VERCEL`,
    `SMTP_FROM=${emailCfg.smtpFrom || emailCfg.smtpUser}`,
    `CUSTOM_KEYWORDS=${JSON.stringify(keywords)}`,
  ].join("\n");

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE", headers: authHeaders() });
    onLogout();
  };

  // ── Log filter ────────────────────────────────────────────────────────────
  const filteredLogs = logFilter === "all" ? activityLog : activityLog.filter(l => l.type === logFilter);

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>BotTorik Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{GLOBAL_STYLES}</style>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div style={{ minHeight: "100vh", background: "#09090b", fontFamily: "'Inter','Segoe UI',sans-serif", color: "#fafafa" }}>

        {/* ── Header ── */}
        <div style={{ background: "#18181b", borderBottom: "1px solid #27272a", padding: "0 24px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🤖</span>
              <span style={{ fontWeight: 700, fontSize: 17, color: "#fafafa", letterSpacing: "-0.3px" }}>BotTorik</span>
              <span style={{ background: "#27272a", color: "#71717a", borderRadius: 5, padding: "1px 7px", fontSize: 11, fontWeight: 600 }}>v2.1</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <StatusBadge status={waStatus} />
                {botStatus && (
                  <span style={{ color: "#52525b", fontSize: 11 }}>
                    AI: {botStatus.ai_anthropic ? "🟢 Claude" : botStatus.ai_openai ? "🟡 OpenAI" : "🔴 off"}
                  </span>
                )}
              </div>
              <button onClick={handleLogout} style={{ background: "none", border: "1px solid #27272a", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12, color: "#71717a", fontWeight: 500, display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#52525b"; e.currentTarget.style.color = "#a1a1aa"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#27272a"; e.currentTarget.style.color = "#71717a"; }}>
                🚪 Keluar
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div style={{ background: "#18181b", borderBottom: "1px solid #27272a" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", padding: "0 20px", overflowX: "auto" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "14px 16px", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? "#a5b4fc" : "#71717a",
                borderBottom: tab === t.id ? "2px solid #6366f1" : "2px solid transparent",
                background: "none", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap", transition: "color 0.15s",
              }}>
                <span style={{ fontSize: 15 }}>{t.emoji}</span>
                {t.label}
                {t.id === "logs" && activityLog.filter(l => l.type === "error").length > 0 && (
                  <span style={{ background: "#dc2626", color: "#fff", borderRadius: 10, padding: "0px 6px", fontSize: 10, fontWeight: 700 }}>
                    {activityLog.filter(l => l.type === "error").length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 20px 48px", animation: "fadeIn 0.2s ease" }}>

          {/* ──────────── TAB: WHATSAPP ──────────── */}
          {tab === "whatsapp" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

              {/* Left */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card>
                  <SectionTitle>⚙️ Konfigurasi Bot</SectionTitle>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#71717a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Mode Bot</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[["ai","🤖 AI Cerdas"],["auto","⚡ Auto Reply"],["keyword","🔑 Keyword"]].map(([val, lbl]) => (
                        <button key={val} onClick={() => set("botMode", val)} style={{
                          flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                          background: cfg.botMode === val ? "#6366f1" : "#27272a",
                          color: cfg.botMode === val ? "#fff" : "#71717a",
                          border: `1px solid ${cfg.botMode === val ? "#6366f1" : "#3f3f46"}`,
                          transition: "all 0.15s",
                        }}>{lbl}</button>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: "#52525b", marginTop: 6 }}>
                      {cfg.botMode === "ai" && "Bot menjawab semua pesan via AI (Claude/OpenAI)"}
                      {cfg.botMode === "auto" && "Bot selalu balas dengan pesan tetap di bawah"}
                      {cfg.botMode === "keyword" && "Bot hanya balas jika ada keyword yang cocok"}
                    </div>
                  </div>
                  <Input label="Nomor Admin WA" value={cfg.adminWa} onChange={v => set("adminWa", v)} placeholder="+6281234567890" hint="Notifikasi error dikirim ke nomor ini" />
                  <Textarea label="Pesan Auto-Reply" value={cfg.autoReply} onChange={v => set("autoReply", v)} placeholder="Pesan otomatis saat AI tidak tersedia..." />
                  <Input label="Cooldown (menit, 0 = selalu balas)" value={cfg.cooldown} onChange={v => set("cooldown", v)} type="number" />
                </Card>

                {/* Kirim Manual */}
                <Card>
                  <SectionTitle>📤 Kirim Pesan Manual</SectionTitle>
                  {waStatus !== "ready" && (
                    <InfoBox type="warning">⚠️ WhatsApp belum terhubung — scan QR dulu di panel kanan</InfoBox>
                  )}
                  <Input label="Nomor Tujuan (628xxx)" value={manualForm.to} onChange={v => setManualForm(f => ({ ...f, to: v }))} placeholder="6281234567890" />
                  <Textarea label="Pesan" value={manualForm.message} onChange={v => setManualForm(f => ({ ...f, message: v }))} placeholder="Tulis pesan..." />
                  <Btn onClick={sendManual} loading={loadingStates.sendWA} disabled={waStatus !== "ready"}>
                    {!loadingStates.sendWA && "📨"} {loadingStates.sendWA ? "Mengirim..." : "Kirim WA"}
                  </Btn>
                </Card>

                {/* Broadcast */}
                <Card>
                  <SectionTitle>📢 Broadcast ke Banyak Nomor</SectionTitle>
                  {waStatus !== "ready" && (
                    <InfoBox type="warning">⚠️ WhatsApp harus terhubung untuk broadcast</InfoBox>
                  )}
                  <Textarea label="Daftar Nomor (satu per baris)" value={broadcastForm.numbers} onChange={v => setBroadcastForm(f => ({ ...f, numbers: v }))}
                    placeholder={"628111111111\n628222222222\n628333333333"} rows={4} />
                  <Textarea label="Pesan Broadcast" value={broadcastForm.message} onChange={v => setBroadcastForm(f => ({ ...f, message: v }))} rows={3} placeholder="Pesan yang sama untuk semua nomor..." />
                  {broadcastResult && (
                    <div style={{ marginBottom: 10, display: "flex", gap: 8 }}>
                      <span style={{ background: "#0a2818", color: "#4ade80", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>✓ {broadcastResult.ok} berhasil</span>
                      {broadcastResult.fail > 0 && <span style={{ background: "#450a0a", color: "#f87171", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>✕ {broadcastResult.fail} gagal</span>}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Btn onClick={sendBroadcast} loading={loadingStates.broadcast} disabled={waStatus !== "ready"} variant="warning">
                      {!loadingStates.broadcast && "📢"} {loadingStates.broadcast ? `Mengirim... ${broadcastResult ? broadcastResult.ok + "/" + broadcastResult.total : ""}` : "Mulai Broadcast"}
                    </Btn>
                    <span style={{ fontSize: 11, color: "#52525b" }}>Delay 1.2s antar pesan</span>
                  </div>
                </Card>
              </div>

              {/* Right */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card accent={waStatus === "ready"}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <SectionTitle>📱 Koneksi WhatsApp</SectionTitle>
                    <StatusBadge status={waStatus} />
                  </div>
                  {waStatus === "disconnected" && (
                    <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                      <div style={{ fontSize: 44, marginBottom: 10 }}>📵</div>
                      <div style={{ fontSize: 13, color: "#71717a", marginBottom: 16, lineHeight: 1.5 }}>WhatsApp belum terhubung.<br />Klik tombol berikut untuk mulai.</div>
                      <Btn onClick={handleConnectWA}>📲 Mulai & Tampilkan QR</Btn>
                    </div>
                  )}
                  {waStatus === "connecting" && (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <div style={{ width: 40, height: 40, border: "3px solid #27272a", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                      <div style={{ fontSize: 13, color: "#a1a1aa", fontWeight: 500 }}>Memulai sesi...</div>
                      <div style={{ fontSize: 11, color: "#52525b", marginTop: 4 }}>QR akan muncul otomatis</div>
                    </div>
                  )}
                  {waStatus === "qr" && qrImage && (
                    <div style={{ textAlign: "center" }}>
                      <InfoBox type="info">📲 Buka WhatsApp → <strong>Perangkat Tertaut</strong> → <strong>Tautkan Perangkat</strong> → Scan QR</InfoBox>
                      <div style={{ display: "inline-block", background: "#fff", borderRadius: 12, padding: 8 }}>
                        <img src={qrImage} alt="QR WhatsApp" style={{ width: 200, height: 200, display: "block", borderRadius: 8 }} />
                      </div>
                      <div style={{ marginTop: 8, fontSize: 11, color: "#52525b" }}>⏱ QR kadaluwarsa ~60 detik · Auto-refresh</div>
                    </div>
                  )}
                  {waStatus === "ready" && (
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                      <div style={{ fontSize: 42, marginBottom: 8 }}>✅</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#4ade80", marginBottom: 4 }}>WhatsApp Terhubung!</div>
                      <div style={{ fontSize: 12, color: "#71717a", marginBottom: 14 }}>Bot aktif dan siap membalas pesan masuk</div>
                      <Btn variant="danger" loading={loadingStates.logoutWA} onClick={handleLogoutWA}>
                        {!loadingStates.logoutWA && "🚪"} {loadingStates.logoutWA ? "Logout..." : "Logout WhatsApp"}
                      </Btn>
                    </div>
                  )}
                </Card>

                {/* Keyword Builder */}
                <Card>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <SectionTitle badge={`${keywords.length} keyword`}>🔑 Keyword Custom</SectionTitle>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn size="sm" variant="ghost" onClick={exportKeywords}>⬇️ Export</Btn>
                      <Btn size="sm" variant="ghost" loading={loadingStates.saveKw} onClick={saveKeywords}>{loadingStates.saveKw ? "Menyimpan..." : "💾 Simpan"}</Btn>
                    </div>
                  </div>
                  <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                    {keywords.map((kw, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                        <input value={kw.keyword} onChange={e => setKeywords(kws => kws.map((k, j) => j === i ? { ...k, keyword: e.target.value } : k))}
                          placeholder="keyword"
                          style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #27272a", background: "#09090b", color: "#fafafa", fontSize: 12, outline: "none" }}
                          onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#27272a"} />
                        <input value={kw.reply} onChange={e => setKeywords(kws => kws.map((k, j) => j === i ? { ...k, reply: e.target.value } : k))}
                          placeholder="balasan bot"
                          style={{ flex: 2, padding: "7px 10px", borderRadius: 7, border: "1px solid #27272a", background: "#09090b", color: "#fafafa", fontSize: 12, outline: "none" }}
                          onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#27272a"} />
                        <button onClick={() => setKeywords(kws => kws.filter((_, j) => j !== i))}
                          style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 7, padding: "0 10px", cursor: "pointer", color: "#f87171", fontSize: 14, fontWeight: 700 }}>✕</button>
                      </div>
                    ))}
                  </div>
                  <Btn size="sm" variant="ghost" onClick={() => setKeywords(kws => [...kws, { keyword: "", reply: "" }])}>+ Tambah Keyword</Btn>
                </Card>

                {/* Chat Preview */}
                <Card>
                  <SectionTitle>💬 Preview Chat Bot (Simulasi)</SectionTitle>
                  <div style={{ background: "#0f172a", borderRadius: 10, padding: 10, minHeight: 140, maxHeight: 180, overflowY: "auto", marginBottom: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {chatHistory.length === 0 && (
                      <div style={{ color: "#475569", fontSize: 12, textAlign: "center", marginTop: 44 }}>Coba kirim pesan di bawah untuk simulasi...</div>
                    )}
                    {chatHistory.map((c, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: c.role === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{ background: c.role === "user" ? "#4f46e5" : "#1e293b", borderRadius: c.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px", padding: "7px 11px", maxWidth: "82%", fontSize: 12, lineHeight: 1.5, color: c.role === "user" ? "#e0e7ff" : "#cbd5e1" }}>
                          {c.msg}
                          <div style={{ fontSize: 10, color: c.role === "user" ? "#818cf8" : "#475569", marginTop: 3, textAlign: "right" }}>{c.time}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={previewInput} onChange={e => setPreviewInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendPreview()}
                      placeholder="Tulis pesan simulasi..."
                      style={{ flex: 1, padding: "8px 11px", borderRadius: 8, border: "1px solid #27272a", background: "#09090b", color: "#fafafa", fontSize: 13, outline: "none" }}
                      onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#27272a"} />
                    <Btn size="sm" onClick={sendPreview}>Kirim</Btn>
                    {chatHistory.length > 0 && <Btn size="sm" variant="ghost" onClick={() => setChatHistory([])}>Clear</Btn>}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ──────────── TAB: AI BOT ──────────── */}
          {tab === "ai" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card>
                  <SectionTitle>🤖 Pengaturan AI</SectionTitle>
                  <InfoBox type="info">💡 AI akan jawab semua pertanyaan otomatis. Minimal 1 API key harus diisi. Claude lebih direkomendasikan.</InfoBox>
                  <Input label="Nama Bot" value={cfg.botName} onChange={v => set("botName", v)} placeholder="BotTorik" />
                  <Textarea label="Konteks Bisnis" value={cfg.bizContext} onChange={v => set("bizContext", v)}
                    placeholder="Contoh: Toko online elektronik. Buka Senin–Sabtu 08.00–20.00. Produk: HP, laptop, aksesoris." rows={4} />
                  <div style={{ padding: "10px 12px", background: "#0a0a0a", border: "1px solid #1e1b4b", borderRadius: 8, fontSize: 12, color: "#6366f1", marginTop: -4 }}>
                    💡 Semakin detail konteks bisnis, semakin relevan jawaban AI untuk pelangganmu.
                  </div>
                </Card>

                <Card>
                  <SectionTitle>🔑 API Keys</SectionTitle>
                  <InfoBox type="warning">⚠️ Jangan share key ini. Sebaiknya simpan langsung di Vercel ENV, bukan di sini.</InfoBox>
                  <Input label="Anthropic API Key (Claude) — direkomendasikan" value={cfg.anthropicKey} onChange={v => set("anthropicKey", v)} type="password" placeholder="sk-ant-api03-..." mono />
                  <Input label="OpenAI API Key (fallback)" value={cfg.openaiKey} onChange={v => set("openaiKey", v)} type="password" placeholder="sk-proj-..." mono />
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                    {cfg.anthropicKey && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#14532d", color: "#4ade80", borderRadius: 6, padding: "3px 8px", fontSize: 11 }}>✓ Claude key terisi</span>}
                    {cfg.openaiKey && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#14532d", color: "#4ade80", borderRadius: 6, padding: "3px 8px", fontSize: 11 }}>✓ OpenAI key terisi</span>}
                    {!cfg.anthropicKey && !cfg.openaiKey && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#450a0a", color: "#f87171", borderRadius: 6, padding: "3px 8px", fontSize: 11 }}>✕ Belum ada key — bot tidak akan jawab via AI</span>}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 11, color: "#52525b" }}>Urutan: Claude → OpenAI → Auto-reply</div>
                </Card>

                <Card>
                  <SectionTitle>📋 Panduan Mendapatkan API Key</SectionTitle>
                  {[
                    ["🟣 Anthropic (Claude)", "console.anthropic.com → API Keys → Create Key", "#4f46e5"],
                    ["🟢 OpenAI (GPT)", "platform.openai.com → API Keys → Create new", "#059669"],
                  ].map(([name, desc, color]) => (
                    <div key={name} style={{ background: "#09090b", border: `1px solid ${color}30`, borderLeft: `3px solid ${color}`, borderRadius: "0 8px 8px 0", padding: "10px 12px", marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#fafafa", marginBottom: 3 }}>{name}</div>
                      <div style={{ fontSize: 11, color: "#71717a", fontFamily: "monospace" }}>{desc}</div>
                    </div>
                  ))}
                </Card>
              </div>

              {/* Right — AI Test Chat LIVE */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card accent>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <SectionTitle>🧪 Test AI Live</SectionTitle>
                    {aiTestHistory.length > 0 && (
                      <Btn size="sm" variant="ghost" onClick={() => setAiTestHistory([])}>🗑 Clear</Btn>
                    )}
                  </div>
                  {!cfg.anthropicKey && !cfg.openaiKey && (
                    <InfoBox type="danger">❌ Isi API Key dulu di kiri untuk mulai test.</InfoBox>
                  )}
                  <div style={{ background: "#0f172a", borderRadius: 10, padding: 10, height: 280, overflowY: "auto", marginBottom: 10, display: "flex", flexDirection: "column", gap: 7 }}>
                    {aiTestHistory.length === 0 && (
                      <div style={{ color: "#475569", fontSize: 12, textAlign: "center", marginTop: 90 }}>
                        Isi API Key lalu ketik pesan untuk test AI secara langsung...
                      </div>
                    )}
                    {aiTestHistory.map((c, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: c.role === "user" ? "flex-end" : "flex-start" }}>
                        <div>
                          <div style={{
                            background: c.role === "user" ? "#4f46e5" : c.role === "error" ? "#450a0a" : "#1e293b",
                            border: c.role === "error" ? "1px solid #7f1d1d" : "none",
                            borderRadius: c.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                            padding: "8px 12px", maxWidth: 260, fontSize: 12, lineHeight: 1.55,
                            color: c.role === "user" ? "#e0e7ff" : c.role === "error" ? "#f87171" : "#cbd5e1",
                          }}>
                            {c.msg}
                          </div>
                          {c.engine && <div style={{ fontSize: 10, color: "#4ade80", marginTop: 2, paddingLeft: 4 }}>via {c.engine}</div>}
                          <div style={{ fontSize: 10, color: "#475569", marginTop: 1, textAlign: c.role === "user" ? "right" : "left", paddingLeft: 4 }}>{c.time}</div>
                        </div>
                      </div>
                    ))}
                    {aiTestLoading && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 4 }}>
                        <span style={{ width: 12, height: 12, border: "2px solid #27272a", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
                        <span style={{ fontSize: 11, color: "#52525b" }}>AI sedang menjawab...</span>
                      </div>
                    )}
                    <div ref={aiChatEndRef} />
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={aiTestInput} onChange={e => setAiTestInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !aiTestLoading && sendAITest()}
                      placeholder={cfg.anthropicKey || cfg.openaiKey ? "Ketik pesan test..." : "Isi API Key dulu..."}
                      disabled={!cfg.anthropicKey && !cfg.openaiKey}
                      style={{ flex: 1, padding: "8px 11px", borderRadius: 8, border: "1px solid #27272a", background: "#09090b", color: "#fafafa", fontSize: 13, outline: "none" }}
                      onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#27272a"} />
                    <Btn size="sm" onClick={sendAITest} loading={aiTestLoading} disabled={!cfg.anthropicKey && !cfg.openaiKey}>
                      {!aiTestLoading && "🚀"}
                    </Btn>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: "#52525b" }}>Test ini memanggil AI secara langsung (menggunakan kuota API key)</div>
                </Card>

                <Card>
                  <SectionTitle>✨ Cara Pakai AI Bot</SectionTitle>
                  {[
                    ["1. Set Konteks Bisnis", "Isi deskripsi bisnismu agar AI tahu apa yang dijual."],
                    ["2. Dapatkan API Key", "Anthropic: console.anthropic.com · OpenAI: platform.openai.com"],
                    ["3. Test di sini", "Gunakan panel Test AI Live di atas untuk coba sebelum deploy."],
                    ["4. Keyword = prioritas", "Keyword custom dicocokkan dulu sebelum AI."],
                    ["5. Deploy & Scan QR", "Push ke Vercel, scan QR di tab WhatsApp. Selesai!"],
                  ].map(([t, d]) => (
                    <div key={t} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: "#27272a", color: "#a1a1aa", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{t[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#fafafa" }}>{t}</div>
                        <div style={{ fontSize: 12, color: "#71717a", marginTop: 2 }}>{d}</div>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          )}

          {/* ──────────── TAB: EMAIL ──────────── */}
          {tab === "email" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card>
                  <SectionTitle>📧 Pengaturan SMTP</SectionTitle>
                  <InfoBox type="warning">⚡ Bot bisa kirim email otomatis! WA command: <strong>kirim email ke user@example.com: isi pesan</strong></InfoBox>
                  <Input label="SMTP Host" value={emailCfg.smtpHost} onChange={v => setE("smtpHost", v)} placeholder="smtp.gmail.com" mono />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Input label="SMTP Port" value={emailCfg.smtpPort} onChange={v => setE("smtpPort", v)} placeholder="587" />
                    <Input label="Email (username)" value={emailCfg.smtpUser} onChange={v => setE("smtpUser", v)} placeholder="kamu@gmail.com" />
                  </div>
                  <Input label="Password / App Password" value={emailCfg.smtpPass} onChange={v => setE("smtpPass", v)} type="password" placeholder="••••••••" />
                  <Input label="From (opsional)" value={emailCfg.smtpFrom} onChange={v => setE("smtpFrom", v)} placeholder="Toko Saya <kamu@gmail.com>" />

                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <Btn size="sm" variant="ghost" loading={loadingStates.testSMTP} onClick={testSMTP}>
                      {loadingStates.testSMTP ? "Menguji..." : "🧪 Test Koneksi SMTP"}
                    </Btn>
                  </div>

                  {smtpTestResult && (
                    <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: smtpTestResult.success ? "#0a2818" : "#450a0a", border: `1px solid ${smtpTestResult.success ? "#14532d" : "#7f1d1d"}`, fontSize: 12, color: smtpTestResult.success ? "#4ade80" : "#f87171" }}>
                      {smtpTestResult.success ? "✅ Koneksi SMTP berhasil! Siap kirim email." : "❌ " + smtpTestResult.error}
                    </div>
                  )}

                  <InfoBox type="success" style={{ marginTop: 12 }}>
                    Gmail: Aktifkan App Password di myaccount.google.com → Security → 2FA → App passwords
                  </InfoBox>
                </Card>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card>
                  <SectionTitle>✉️ Kirim Email Manual</SectionTitle>
                  <Input label="Kirim ke" value={emailForm.to} onChange={v => setEmailForm(f => ({ ...f, to: v }))} placeholder="customer@email.com" />
                  <Input label="Subject" value={emailForm.subject} onChange={v => setEmailForm(f => ({ ...f, subject: v }))} placeholder="Konfirmasi Pesanan #1234" />
                  <Textarea label="Isi Email" value={emailForm.body} onChange={v => setEmailForm(f => ({ ...f, body: v }))} rows={5} placeholder="Halo, terima kasih sudah memesan..." />
                  <Btn onClick={sendEmail} loading={loadingStates.sendEmail} fullWidth>
                    {!loadingStates.sendEmail && "📨"} {loadingStates.sendEmail ? "Mengirim Email..." : "Kirim Email"}
                  </Btn>
                </Card>

                <Card>
                  <SectionTitle>🤖 WA → Email Command</SectionTitle>
                  <div style={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, padding: "10px 12px", fontFamily: "monospace", fontSize: 12, color: "#a1a1aa", marginBottom: 10 }}>
                    kirim email ke admin@toko.com: Halo, saya mau tanya stok produk
                  </div>
                  <div style={{ fontSize: 12, color: "#52525b", lineHeight: 1.6 }}>
                    Pengguna WhatsApp bisa ketik perintah itu dan bot akan otomatis forward sebagai email ke tujuan tersebut.
                  </div>
                </Card>

                <Card>
                  <SectionTitle>📊 Status SMTP</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["Host", emailCfg.smtpHost || "—"],
                      ["Port", emailCfg.smtpPort || "587"],
                      ["User", emailCfg.smtpUser || "—"],
                      ["Status", smtpTestResult ? (smtpTestResult.success ? "✅ Terkoneksi" : "❌ Gagal") : "Belum ditest"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1c1c1c", fontSize: 12 }}>
                        <span style={{ color: "#71717a" }}>{k}</span>
                        <span style={{ color: "#a1a1aa", fontFamily: k === "Host" || k === "User" ? "monospace" : "inherit" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ──────────── TAB: EXCEL ──────────── */}
          {tab === "excel" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <Card>
                <SectionTitle>📥 Import Keyword dari CSV</SectionTitle>
                <InfoBox type="info">Upload file CSV dengan kolom <strong>keyword</strong> dan <strong>reply</strong> untuk tambah keyword massal.</InfoBox>

                <input type="file" accept=".csv,.txt" ref={fileRef} onChange={uploadExcel} style={{ display: "none" }} />
                <div onClick={() => fileRef.current.click()}
                  style={{ border: "2px dashed #27272a", borderRadius: 10, padding: "24px", textAlign: "center", marginBottom: 14, cursor: "pointer", transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#6366f1"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#27272a"}>
                  {loadingStates.uploadExcel ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, border: "3px solid #27272a", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      <div style={{ fontSize: 13, color: "#71717a" }}>Memproses file...</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>📊</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#a1a1aa", marginBottom: 3 }}>Klik untuk upload CSV</div>
                      <div style={{ fontSize: 11, color: "#52525b" }}>Format: kolom keyword, reply</div>
                    </>
                  )}
                </div>

                {excelKeywords.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8, color: "#4ade80" }}>✅ Preview — {excelKeywords.length} keyword ditemukan:</div>
                    <div style={{ maxHeight: 160, overflowY: "auto", border: "1px solid #27272a", borderRadius: 8, marginBottom: 10 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead><tr style={{ background: "#27272a" }}>
                          <th style={{ padding: "6px 10px", textAlign: "left", color: "#a1a1aa" }}>Keyword</th>
                          <th style={{ padding: "6px 10px", textAlign: "left", color: "#a1a1aa" }}>Reply</th>
                        </tr></thead>
                        <tbody>{excelKeywords.map((k, i) => (
                          <tr key={i} style={{ borderTop: "1px solid #27272a" }}>
                            <td style={{ padding: "6px 10px", fontWeight: 600, color: "#818cf8" }}>{k.keyword}</td>
                            <td style={{ padding: "6px 10px", color: "#a1a1aa" }}>{k.reply}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn onClick={applyExcelKeywords} variant="success">✓ Terapkan Keyword</Btn>
                      <Btn onClick={() => setExcelKeywords([])} variant="ghost">Batalkan</Btn>
                    </div>
                  </div>
                )}
              </Card>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card>
                  <SectionTitle>📤 Template & Export CSV</SectionTitle>
                  <div style={{ fontSize: 12, color: "#71717a", marginBottom: 12, lineHeight: 1.6 }}>Download template, isi dengan keyword di Excel/Google Sheets, lalu upload kembali.</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    <Btn onClick={downloadTemplate} variant="ghost">⬇️ Download Template CSV</Btn>
                    <Btn onClick={exportKeywords} variant="ghost">📤 Export Keyword Aktif</Btn>
                  </div>
                  <div style={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, color: "#52525b", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Format CSV</div>
                    <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 12, color: "#a1a1aa" }}>{`keyword,reply\nharga,"Mulai Rp 50.000!"\nalamat,"Jl. Merdeka No.1 Bandung"`}</pre>
                  </div>
                </Card>

                <Card>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <SectionTitle badge={`${keywords.length} aktif`}>📋 Keyword Aktif</SectionTitle>
                    <Btn size="sm" variant="ghost" onClick={exportKeywords}>⬇️ Export</Btn>
                  </div>
                  <div style={{ maxHeight: 280, overflowY: "auto", border: "1px solid #27272a", borderRadius: 8 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead><tr style={{ background: "#27272a" }}>
                        <th style={{ padding: "6px 10px", textAlign: "left", color: "#71717a" }}>#</th>
                        <th style={{ padding: "6px 10px", textAlign: "left", color: "#71717a" }}>Keyword</th>
                        <th style={{ padding: "6px 10px", textAlign: "left", color: "#71717a" }}>Reply</th>
                      </tr></thead>
                      <tbody>{keywords.map((k, i) => (
                        <tr key={i} style={{ borderTop: "1px solid #1c1c1c" }}>
                          <td style={{ padding: "6px 10px", color: "#3f3f46", fontSize: 11 }}>{i + 1}</td>
                          <td style={{ padding: "6px 10px", fontWeight: 600, color: "#818cf8" }}>{k.keyword}</td>
                          <td style={{ padding: "6px 10px", color: "#71717a" }}>{k.reply}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ──────────── TAB: KEEP ALIVE ──────────── */}
          {tab === "alive" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <Card>
                <SectionTitle>🟢 Bot Tetap Menyala 24/7</SectionTitle>
                <InfoBox type="success"><strong>Bot berjalan di cloud (Vercel)</strong> — tidak perlu laptop menyala! 24 jam, 7 hari seminggu.</InfoBox>
                {[
                  { n: "1", title: "Deploy ke Vercel", desc: "Push ke GitHub → import di vercel.com → deploy. Bot langsung online." },
                  { n: "2", title: "Daftar UptimeRobot", desc: "Buka uptimerobot.com → daftar gratis → klik 'Add New Monitor'." },
                  { n: "3", title: "Set Monitor HTTP", desc: "Tipe: HTTP(s) · URL: https://NAMA.vercel.app/api/keep-alive · Interval: 5 menit." },
                  { n: "4", title: "Selesai!", desc: "Bot di-ping setiap 5 menit, tidak pernah sleep. Siap balas 24/7." },
                ].map(s => (
                  <div key={s.n} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: "#312e81", color: "#a5b4fc", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.n}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#fafafa" }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: "#71717a", marginTop: 2, lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </Card>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card>
                  <SectionTitle>🔗 URL Keep-Alive & Ping Test</SectionTitle>
                  <div style={{ fontSize: 12, color: "#71717a", marginBottom: 10 }}>URL keep-alive setelah deploy:</div>
                  <div style={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, padding: "10px 12px", fontFamily: "monospace", fontSize: 12, color: "#818cf8", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>https://NAMA-APP.vercel.app/api/keep-alive</span>
                    <button onClick={() => copyText("https://NAMA-APP.vercel.app/api/keep-alive", "kaurl")}
                      style={{ background: "none", border: "none", cursor: "pointer", color: copied === "kaurl" ? "#4ade80" : "#52525b", fontSize: 12 }}>
                      {copied === "kaurl" ? "✓" : "⎘"}
                    </button>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#71717a", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Test URL (kosongkan untuk test lokal)</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={kaUrl} onChange={e => setKaUrl(e.target.value)} placeholder="/api/keep-alive (lokal)"
                        style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid #27272a", background: "#09090b", color: "#fafafa", fontSize: 12, outline: "none" }}
                        onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#27272a"} />
                      <Btn size="sm" loading={loadingStates.ping} onClick={pingKeepAlive}>
                        {!loadingStates.ping && "📡"} Ping
                      </Btn>
                    </div>
                  </div>

                  {kaPingResult && (
                    <div style={{ padding: "10px 12px", borderRadius: 8, background: kaPingResult.ok ? "#0a2818" : "#450a0a", border: `1px solid ${kaPingResult.ok ? "#14532d" : "#7f1d1d"}`, fontSize: 12 }}>
                      {kaPingResult.ok ? (
                        <>
                          <div style={{ color: "#4ade80", fontWeight: 600, marginBottom: 6 }}>✅ Ping berhasil! Latensi: {kaPingResult.ms}ms</div>
                          <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 11, color: "#52525b", whiteSpace: "pre-wrap" }}>{JSON.stringify(kaPingResult.data, null, 2)}</pre>
                        </>
                      ) : (
                        <div style={{ color: "#f87171" }}>❌ Ping gagal: {kaPingResult.error}</div>
                      )}
                    </div>
                  )}

                  <a href="https://uptimerobot.com" target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 12, color: "#818cf8", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                    → Buka UptimeRobot (gratis) ↗
                  </a>
                </Card>

                <Card>
                  <SectionTitle>📊 Perbandingan Hosting</SectionTitle>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr style={{ background: "#27272a" }}>
                      <th style={{ padding: "7px 10px", textAlign: "left", color: "#71717a" }}>Cara</th>
                      <th style={{ padding: "7px 10px", textAlign: "center", color: "#71717a" }}>24/7?</th>
                      <th style={{ padding: "7px 10px", textAlign: "center", color: "#71717a" }}>Biaya</th>
                    </tr></thead>
                    <tbody>
                      {[
                        ["Run lokal", "❌", "Gratis", false],
                        ["Vercel + UptimeRobot", "✅", "Gratis", true],
                        ["Railway", "✅", "~$5/bln", false],
                        ["VPS (DO, etc.)", "✅", "~$6/bln", false],
                      ].map(([c, o, b, rec]) => (
                        <tr key={c} style={{ borderTop: "1px solid #1c1c1c", background: rec ? "#0c0c1a" : "transparent" }}>
                          <td style={{ padding: "7px 10px", color: rec ? "#a5b4fc" : "#a1a1aa", fontWeight: rec ? 600 : 400 }}>
                            {c} {rec && <span style={{ background: "#312e81", color: "#818cf8", borderRadius: 4, padding: "0px 5px", fontSize: 10, fontWeight: 600, marginLeft: 4 }}>Rekomendasi</span>}
                          </td>
                          <td style={{ padding: "7px 10px", textAlign: "center" }}>{o}</td>
                          <td style={{ padding: "7px 10px", textAlign: "center", color: "#52525b" }}>{b}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            </div>
          )}

          {/* ──────────── TAB: LOG AKTIFITAS ──────────── */}
          {tab === "logs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  ["Total Log", activityLog.length, "#6366f1", "📋"],
                  ["Sukses", activityLog.filter(l => l.type === "success").length, "#16a34a", "✅"],
                  ["Error", activityLog.filter(l => l.type === "error").length, "#dc2626", "❌"],
                  ["Info", activityLog.filter(l => l.type === "info").length, "#3b82f6", "ℹ️"],
                ].map(([label, count, color, icon]) => (
                  <div key={label} style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color }}>{count}</div>
                      <div style={{ fontSize: 11, color: "#52525b" }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Card>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <SectionTitle badge={`${filteredLogs.length} entri`}>🗒️ Log Aktifitas</SectionTitle>
                  <div style={{ display: "flex", gap: 8 }}>
                    {/* Filter buttons */}
                    <div style={{ display: "flex", gap: 4 }}>
                      {[["all", "Semua"], ["success", "✅"], ["error", "❌"], ["warning", "⚠️"], ["info", "ℹ️"]].map(([f, label]) => (
                        <button key={f} onClick={() => setLogFilter(f)} style={{
                          padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: logFilter === f ? 600 : 400,
                          background: logFilter === f ? "#27272a" : "transparent",
                          color: logFilter === f ? "#fafafa" : "#71717a",
                          border: `1px solid ${logFilter === f ? "#3f3f46" : "transparent"}`,
                          cursor: "pointer",
                        }}>{label}</button>
                      ))}
                    </div>
                    <Btn size="sm" variant="ghost" onClick={() => {
                      const lines = activityLog.map(l => `[${l.time}] [${l.type.toUpperCase()}] ${l.msg}`).join("\n");
                      const blob = new Blob([lines], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a"); a.href = url; a.download = "bottorik-log.txt"; a.click();
                      URL.revokeObjectURL(url);
                      toast("Log diekspor!", "success");
                    }}>⬇️ Export</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => { setActivityLog([]); toast("Log dihapus.", "info"); }}>🗑 Clear</Btn>
                  </div>
                </div>

                {filteredLogs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#52525b", fontSize: 13 }}>
                    {logFilter === "all" ? "Belum ada aktivitas." : `Tidak ada log dengan filter "${logFilter}".`}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 520, overflowY: "auto" }}>
                    {filteredLogs.map(l => {
                      const colors = { success: "#4ade80", error: "#f87171", warning: "#fb923c", info: "#60a5fa" };
                      const bgs    = { success: "#0a2818", error: "#450a0a", warning: "#451a03", info: "#0c1a2e" };
                      return (
                        <div key={l.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: bgs[l.type] || "#18181b", border: `1px solid ${colors[l.type] || "#27272a"}20`, borderLeft: `3px solid ${colors[l.type] || "#27272a"}`, borderRadius: "0 7px 7px 0", padding: "7px 12px" }}>
                          <span style={{ fontSize: 11, color: "#52525b", whiteSpace: "nowrap", marginTop: 1, fontFamily: "monospace" }}>{l.time}</span>
                          <span style={{ fontSize: 11, color: "#3f3f46", textTransform: "uppercase", fontWeight: 700, minWidth: 50, marginTop: 1 }}>{l.type}</span>
                          <span style={{ fontSize: 12, color: colors[l.type] || "#a1a1aa", flex: 1 }}>{l.msg}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ──────────── TAB: PENGATURAN ──────────── */}
          {tab === "settings" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card>
                  <SectionTitle>🔐 Keamanan Dashboard</SectionTitle>
                  <InfoBox type="info">Password dashboard diatur melalui environment variable <code style={{ background: "#1e3a5f", padding: "1px 5px", borderRadius: 4 }}>DASHBOARD_PASSWORD</code></InfoBox>
                  <div style={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "#52525b", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tips Keamanan</div>
                    {[
                      "Ganti password default sebelum deploy",
                      "Atur DASHBOARD_SECRET yang unik dan panjang",
                      "Jangan bagikan URL dashboard ke sembarang orang",
                      "Gunakan HTTPS (Vercel sudah otomatis)",
                    ].map((tip, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: "#71717a" }}>
                        <span style={{ color: "#4ade80" }}>✓</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: "#52525b", padding: "10px 12px", background: "#09090b", borderRadius: 8, border: "1px solid #27272a" }}>
                    <strong style={{ color: "#a1a1aa" }}>Session TTL:</strong> 8 jam &nbsp;·&nbsp;
                    <strong style={{ color: "#a1a1aa" }}>Max login gagal:</strong> 5x &nbsp;·&nbsp;
                    <strong style={{ color: "#a1a1aa" }}>Lockout:</strong> 15 menit
                  </div>
                </Card>

                <Card>
                  <SectionTitle>📱 Informasi Bot</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["Versi", "2.1.0"],
                      ["Framework", "Next.js"],
                      ["WA Library", "whatsapp-web.js"],
                      ["Status WA", waStatus],
                      ["Mode Bot", cfg.botMode],
                      ["AI Provider", cfg.anthropicKey ? "Claude (Anthropic)" : cfg.openaiKey ? "OpenAI" : "Tidak aktif"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1c1c1c", fontSize: 12 }}>
                        <span style={{ color: "#71717a" }}>{k}</span>
                        <span style={{ color: "#a1a1aa" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card style={{ borderColor: "#312e81" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#a5b4fc" }}>📋 ENV Variables → Salin ke Vercel</h3>
                    <Btn size="sm" variant="ghost" onClick={() => { copyText(envStr, "env"); toast("ENV disalin ke clipboard!", "success"); }}>
                      {copied === "env" ? "✅ Tersalin!" : "📋 Salin Semua"}
                    </Btn>
                  </div>
                  <pre style={{ background: "#09090b", color: "#818cf8", borderRadius: 8, padding: "12px 14px", fontSize: 11, overflowX: "auto", margin: 0, maxHeight: 260, fontFamily: "monospace", lineHeight: 1.7 }}>
                    {envStr}
                  </pre>
                  <div style={{ marginTop: 10, fontSize: 11, color: "#52525b", lineHeight: 1.6 }}>
                    Di Vercel: Dashboard → Project → Settings → Environment Variables → Paste satu per satu atau gunakan import.
                  </div>
                </Card>

                <Card>
                  <SectionTitle>🗑️ Reset & Danger Zone</SectionTitle>
                  <InfoBox type="danger">Aksi berikut tidak dapat dibatalkan. Pastikan kamu yakin.</InfoBox>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button onClick={() => {
                      if (confirm("Reset semua keyword ke default?")) {
                        setKeywords([{ keyword: "harga", reply: "Harga mulai dari Rp 50.000 ya!" }, { keyword: "alamat", reply: "Kami di Jl. Merdeka No. 1, Bandung 😊" }]);
                        toast("Keyword direset ke default.", "warning");
                        addLog("Keyword direset ke default", "warning");
                      }
                    }} style={{ background: "#1c0e0e", border: "1px solid #7f1d1d", borderRadius: 8, padding: "9px 14px", cursor: "pointer", color: "#f87171", fontSize: 13, fontWeight: 500, textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                      🔄 Reset Keyword ke Default
                    </button>
                    <button onClick={() => {
                      if (confirm("Hapus semua log aktifitas?")) {
                        setActivityLog([]);
                        toast("Log dihapus.", "info");
                      }
                    }} style={{ background: "#1c0e0e", border: "1px solid #7f1d1d", borderRadius: 8, padding: "9px 14px", cursor: "pointer", color: "#f87171", fontSize: 13, fontWeight: 500, textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                      🗑️ Hapus Semua Log
                    </button>
                    <button onClick={() => {
                      if (confirm("Logout dari dashboard? Kamu perlu login ulang.")) handleLogout();
                    }} style={{ background: "#1c0e0e", border: "1px solid #7f1d1d", borderRadius: 8, padding: "9px 14px", cursor: "pointer", color: "#f87171", fontSize: 13, fontWeight: 500, textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                      🚪 Logout Dashboard
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
