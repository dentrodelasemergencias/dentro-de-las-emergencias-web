const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const messages = document.getElementById("chat-messages");

const WORKER_URL = "https://ddle-gemini-chat.dentrodelasemergencias.workers.dev/";

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderSimpleMarkdown(text) {
  let html = escapeHtml(text);

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/^### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^## (.+)$/gm, "<h4>$1</h4>");

  const lines = html.split("\n");
  let inList = false;
  let output = [];

  for (const line of lines) {
    if (/^\s*-\s+/.test(line)) {
      if (!inList) {
        output.push("<ul>");
        inList = true;
      }
      output.push(`<li>${line.replace(/^\s*-\s+/, "")}</li>`);
    } else {
      if (inList) {
        output.push("</ul>");
        inList = false;
      }
      output.push(line);
    }
  }

  if (inList) output.push("</ul>");

  html = output.join("\n");
  html = html.replace(/\n\n/g, "<br><br>");
  html = html.replace(/\n/g, "<br>");
  html = html
    .replace(/<br><ul>/g, "<ul>")
    .replace(/<\/ul><br>/g, "</ul>")
    .replace(/<ul><br>/g, "<ul>")
    .replace(/<br><\/ul>/g, "</ul>");

  return html;
}

function addMessage(text, sender = "bot") {
  const message = document.createElement("div");
  message.className = `message ${sender}`;

  if (sender === "bot") {
    message.innerHTML = renderSimpleMarkdown(text);
  } else {
    message.textContent = text;
  }

  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const loadingMessage = addMessage("Pensando...", "bot");

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });

    const data = await response.json();
    loadingMessage.remove();

    if (!response.ok) {
      addMessage("Ha ocurrido un problema al generar la respuesta.", "bot");
      console.error("Worker error:", data);
      return;
    }

    addMessage(
      data.reply || "No he podido generar una respuesta en este momento.",
      "bot"
    );
  } catch (error) {
    loadingMessage.remove();
    addMessage("Ha habido un error al conectar con la IA.", "bot");
    console.error(error);
  }
});
