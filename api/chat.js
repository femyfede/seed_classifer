const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const SYSTEM_PROMPT = [
  "You are the Seed AI Assistant of the Seed Classifier app.",
  "Help farmers and growers in Tanzania understand maize seed categories: Asili (traditional farmer-saved), Chotara (hybrid), and Huria (open-pollinated improved).",
  "Answer questions about growing conditions, regions, and scan results.",
  "Keep answers practical, friendly, and concise. Never invent facts about a specific seed variety or certification.",
].join(" ");
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 12;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const rateLimits = new Map();

function sendJson(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

function isRateLimited(ip, now = Date.now()) {
  for (const [key, record] of rateLimits) {
    if (now - record.startedAt >= RATE_LIMIT_WINDOW_MS) rateLimits.delete(key);
  }

  let record = rateLimits.get(ip);
  if (!record || now - record.startedAt >= RATE_LIMIT_WINDOW_MS) {
    if (rateLimits.size >= 1000) return true;
    record = { startedAt: now, count: 0 };
    rateLimits.set(ip, record);
  }

  record.count += 1;
  return record.count > RATE_LIMIT_MAX_REQUESTS;
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function validateMessages(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  if (typeof body.message !== "string") return null;

  const message = body.message.trim();
  if (!message || message.length > MAX_MESSAGE_LENGTH) return null;

  const history = body.history === undefined ? [] : body.history;
  if (!Array.isArray(history)) return null;
  if (history.length > MAX_HISTORY_MESSAGES) return null;

  const messages = history.map((entry) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      !["user", "assistant"].includes(entry.sender) ||
      typeof entry.text !== "string" ||
      !entry.text.trim() ||
      entry.text.length > MAX_MESSAGE_LENGTH
    ) {
      return null;
    }
    return { role: entry.sender, content: entry.text.trim() };
  });

  if (messages.includes(null)) return null;
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
    { role: "user", content: message },
  ];
}

module.exports = async function chat(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  if (!String(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
    return sendJson(res, 415, { error: "Content-Type must be application/json" });
  }

  const messages = validateMessages(req.body);
  if (!messages) return sendJson(res, 400, { error: "Invalid chat request" });

  if (isRateLimited(getClientIp(req))) {
    return sendJson(res, 429, { error: "Too many requests. Please wait a moment and try again." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("Chat API is unavailable: GROQ_API_KEY is not configured.");
    return sendJson(res, 503, { error: "Chat is temporarily unavailable." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.6,
        max_tokens: 700,
        messages,
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      console.error(`Groq chat request failed with status ${upstream.status}.`);
      return sendJson(res, 502, { error: "Chat is temporarily unavailable." });
    }

    const data = await upstream.json();
    const response = data?.choices?.[0]?.message?.content;
    if (typeof response !== "string" || !response.trim()) {
      console.error("Groq chat returned an empty response.");
      return sendJson(res, 502, { error: "Chat is temporarily unavailable." });
    }

    return sendJson(res, 200, { response: response.trim() });
  } catch (error) {
    console.error("Groq chat request failed:", error.name || "UnknownError");
    return sendJson(res, 502, { error: "Chat is temporarily unavailable." });
  } finally {
    clearTimeout(timeout);
  }
};
