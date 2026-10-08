import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT || 3000);
const freeLimit = Number(process.env.FREE_DAILY_LIMIT || 10);

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const usage = new Map();

app.use(express.json());
app.use(express.static("public"));

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getUsage(sessionId) {
  const key = `${sessionId}:${dayKey()}`;

  if (!usage.has(key)) {
    usage.set(key, 0);
  }

  return usage.get(key);
}

app.get("/api/status", (req, res) => {
  const sessionId = String(
    req.headers["x-session-id"] || "demo"
  );

  const used = getUsage(sessionId);

  res.json({
    plan: "free",
    used,
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
        error: "Message is too long."
      });
    }

    const used = getUsage(sessionId);

    if (used >= freeLimit) {
      return res.status(429).json({
        error:
          "You've reached today's free limit. Premium access can be connected in the next stage."
      });
    }

    if (!client) {
      return res.json({
        demo: true,
        reply:
          "Your website backend is ready. Add OPENAI_API_KEY to the server environment to activate the live AI."
      });
    }

    const instructions = `You are Obirempon AI, a helpful multi-purpose assistant.
The selected tool is: ${tool}.
Be clear, useful and concise.
For writing tasks, produce polished original text.
Do not claim to have performed actions you cannot perform.`;

    const response = await client.responses.create({
      model: "gpt-6-luna",
      instructions,
      input: message
    });

    usage.set(
      `${sessionId}:${dayKey()}`,
      used + 1
    );

    res.json({
      reply: response.output_text,
      used: used + 1,
      limit: freeLimit
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error:
        "The AI service could not respond right now."
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(
    `Obirempon AI running on port ${port}`
  );
});
