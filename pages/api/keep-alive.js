/**
 * pages/api/keep-alive.js
 * Endpoint sederhana yang di-ping oleh UptimeRobot setiap 5 menit
 * agar bot tidak tidur & tetap online 24/7
 */
export default function handler(req, res) {
  res.status(200).json({
    status: "alive",
    bot: process.env.BOT_NAME || "BotTorik",
    time: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
