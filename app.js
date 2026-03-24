const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chat = document.getElementById("chat");
const sendBtn = document.getElementById("send-btn");

const WORKER_URL = "https://ddle-gemini-chat.dentrodelasemergencias.workers.dev/";

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderSimpleMarkdown(text) {
  let html = escapeHtml(text);

  // Negritas
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Títulos
  html = html.replace(/^### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^## (.+)$/gm, "<h4>$1</h4>");

  // Listas simples
  const lines = html.split("\n");
  let inList = false;
  const output = [];

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

  // Saltos de línea
  html = html.replace(/\n\n/g, "<br><br>");
  html = html.replace(/\n/g, "<br>");

  // Limpieza visual en listas
  html = html
    .replace(/<br><ul>/g, "<ul>")
    .replace(/<\/ul><br>/g, "</ul>")
    .replace(/<ul><br>/g, "<ul>")
    .replace(/<br><\/ul>/g, "</ul>");

  return html;
}

function createMessageElement(content, role = "assistant") {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const paragraph = document.createElement("p");

  if (role === "assistant") {
    paragraph.innerHTML = renderSimpleMarkdown(content);
  } else {
    paragraph.textContent = content;
  }

  wrapper.appendChild(paragraph);
  return wrapper;
}

function addMessage(content, role = "assistant") {
  const el = createMessageElement(content, role);
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
  return el;
}

async function sendMessage(text) {
  const userText = text.trim();
  if (!userText) return;

  addMessage(userText, "user");
  input.value = "";
  input.style.height = "auto";

  sendBtn.disabled = true;
  sendBtn.textContent = "Pensando...";

  const loadingEl = addMessage("Pensando...", "assistant");

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userText }),
    });

    const data = await response.json();

    loadingEl.remove();

    if (!response.ok) {
      addMessage("Ha ocurrido un problema al generar la respuesta.", "assistant");
      console.error("Worker error:", data);
      return;
    }

    addMessage(
      data.reply || "No he podido generar una respuesta en este momento.",
      "assistant"
    );
  } catch (error) {
    loadingEl.remove();
    addMessage("Ha habido un error al conectar con la IA.", "assistant");
    console.error(error);
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Preguntar";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  await sendMessage(input.value);
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 220)}px`;
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", async () => {
    const prompt = chip.dataset.prompt || chip.textContent || "";
    await sendMessage(prompt);
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
