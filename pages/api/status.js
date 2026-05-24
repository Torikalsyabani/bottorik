/**
 * pages/api/status.js  (PROTECTED)
 */

import { getWAStatus } from "../../lib/botTorik";
import { requireAuth } from "../../lib/auth";

function handler(req, res) {
  const { status } = getWAStatus();
  res.status(200).json({
    bot: "BotTorik",
    status: "online",
    version: "2.0.0",
    wa_status: status,
    wa_connected: status === "ready",
    ai_anthropic: !!process.env.ANTHROPIC_API_KEY,
    ai_openai: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString(),
  });
}

export default requireAuth(handler);
