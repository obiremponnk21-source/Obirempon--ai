import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 3000);
const freeLimit = Number(process.env.FREE_DAILY_LIMIT || 10);

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const publicDirectory = path.join(currentDirectory, "public");

const client = process.env.OPENAI_API_KEY
? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
: null;

const usage = new Map();

app.use(express.json());
app.use(express.static(publicDirectory));

app.get("/", (req, res) => {
res.sendFile(path.join(publicDirectory, "index.html"));
});

function getDayKey() {
return new Date().toISOString().slice(0, 10);
}

function getUsage(sessionId) {
const key = "${sessionId}:${getDayKey()}";

if (!usage.has(key)) {
usage.set(key, 0);
}

return usage.get(key);
}

app.get("/api/status", (req, res) => {
const sessionId = String(
req.headers["x-session-id"] || "demo"
);

res.json({
name: "Obirempon AI",
status: "online",
plan: "free",
used: getUsage(sessionId),
limit: freeLimit
});
});

app.post("/api/chat", async (req, res) => {
try {
const sessionId = String(
req.headers["x-session-id"] || "demo"
);

const message =
  typeof req.body?.message === "string"
    ? req.body.message.trim()
    : "";

const tool =
  typeof req.body?.tool === "string"
    ? req.body.tool
    : "AI Chat";

if (!message) {
  return res.status(400).json({
    error: "Please enter a message."
  });
}

if (message.length > 6000) {
  return res.status(400).json({
    error: "Your message is too long."
  });
}

const used = getUsage(sessionId);

if (used >= freeLimit) {
  return res.status(429).json({
    error: "You have reached today's free request limit."
  });
}

if (!client) {
  return res.status(503).json({
    error: "AI is not activated. Configure the API key in Render."
  });
}

const response = await client.responses.create({
  model: "gpt-6-luna",
  instructions: `You are Obirempon AI, a helpful multi-purpose assistant.

The selected tool is ${tool}.
Help with questions, original writing, design ideas, and business planning.
Be clear, friendly, and concise.`,
input: message
});

usage.set(`${sessionId}:${getDayKey()}`, used + 1);

res.json({
  reply: response.output_text,
  used: used + 1,
  limit: freeLimit
});

} catch (error) {
console.error("AI request failed:", error.message);

res.status(500).json({
  error: "Obirempon AI could not respond. Please try again."
});

}
});

app.listen(port, "0.0.0.0", () => {
console.log("Obirempon AI running on port ${port}");
});
