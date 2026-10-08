const tools = document.querySelectorAll(".tool");
const toolName = document.getElementById("toolName");
const messages = document.getElementById("messages");
const form = document.getElementById("form");
const messageInput = document.getElementById("message");
const usage = document.getElementById("usage");
const modal = document.getElementById("modal");

let currentTool = "AI Chat";

tools.forEach(tool => {
  tool.addEventListener("click", () => {
    tools.forEach(t => t.classList.remove("active"));
    tool.classList.add("active");

    currentTool = tool.dataset.tool;
    toolName.textContent = "🤖 " + currentTool;

    messageInput.placeholder =
      currentTool === "Writer"
        ? "What do you want me to write?"
        : currentTool === "Design Assistant"
        ? "Describe your design idea..."
        : currentTool === "Business Assistant"
        ? "Ask about your business..."
        : "Ask Obirempon AI...";
  });
});

form.addEventListener("submit", async e => {
  e.preventDefault();

  const message = messageInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  messageInput.value = "";

  const loading = addMessage("Thinking...", "ai");

  try {
    const sessionId =
      localStorage.getItem("obirempon_session") ||
      crypto.randomUUID();

    localStorage.setItem("obirempon_session", sessionId);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId
      },
      body: JSON.stringify({
        message,
        tool: currentTool
      })
    });

    const data = await response.json();

    loading.remove();

    if (!response.ok) {
      addMessage(data.error || "Something went wrong.", "ai");
      return;
    }

    addMessage(
      data.reply || "I couldn't generate a response.",
      "ai"
    );

    if (data.used !== undefined) {
      usage.textContent =
        `Free: ${Math.max(0, data.limit - data.used)} requests left today`;
    }
  } catch (error) {
    loading.remove();
    addMessage(
      "I couldn't connect to the AI service. Please try again.",
      "ai"
    );
  }
});

function addMessage(text, type) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${type}`;
  bubble.textContent = text;

  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;

  return bubble;
}

function showPremium() {
  modal.classList.remove("hidden");
}

function closePremium() {
  modal.classList.add("hidden");
}
