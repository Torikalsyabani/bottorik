/**
 * pages/api/excel.js  (PROTECTED)
 * GET  → download template CSV
 * POST → upload & parse CSV keyword
 */
import { requireAuth } from "../../lib/auth";

async function handler(req, res) {
  if (req.method === "GET") {
    const template = "keyword,reply\nharga,\"Harga mulai Rp 50.000!\"\nalamat,\"Jl. Merdeka No. 1 Bandung\"";
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=bottorik-keywords.csv");
    return res.status(200).send(template);
  }

  if (req.method === "POST") {
    try {
      const text = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      const lines = text.trim().split("\n").slice(1); // skip header
      const keywords = [];
      for (const line of lines) {
        const parts = line.split(",");
        if (parts.length >= 2) {
          const keyword = parts[0].trim().replace(/^"|"$/g, "");
          const reply   = parts.slice(1).join(",").trim().replace(/^"|"$/g, "");
          if (keyword && reply) keywords.push({ keyword, reply });
        }
      }
      if (keywords.length === 0) {
        return res.status(400).json({ error: "Tidak ada keyword valid ditemukan." });
      }
      return res.status(200).json({ success: true, keywords, message: `${keywords.length} keyword berhasil diimpor.` });
    } catch (err) {
      return res.status(400).json({ error: "Gagal parse file: " + err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}

export default requireAuth(handler);
