const chat = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chips = document.querySelectorAll(".chip");
const year = document.getElementById("year");

const history = [];

if (year) year.textContent = new Date().getFullYear();

function addMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const p = document.createElement("p");
  p.textContent = text;
  wrapper.appendChild(p);

  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage(message) {
  addMessage("user", message);
  history.push({ role: "user", text: message });

  const thinkingNode = document.createElement("div");
  thinkingNode.className = "message assistant";
  thinkingNode.innerHTML = "<p>Generando respuesta...</p>";
  chat.appendChild(thinkingNode);
  chat.scrollTop = chat.scrollHeight;

  sendBtn.disabled = true;
  sendBtn.textContent = "Enviando...";

  try {
const response = await fetch("https://ddle-gemini-chat.dentrodelasemergencias.workers.dev/", {      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history: history.slice(-6),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "No se pudo generar la respuesta.");
    }

    thinkingNode.remove();
    addMessage("assistant", data.reply);
    history.push({ role: "assistant", text: data.reply });
  } catch (error) {
    thinkingNode.remove();
    addMessage(
      "assistant",
      "Ha ocurrido un problema al generar la respuesta. Revisa la variable GEMINI_API_KEY en Cloudflare y vuelve a intentarlo."
    );
    console.error(error);
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Preguntar";
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  input.value = "";
  await sendMessage(message);
});

chips.forEach((chip) => {
  chip.addEventListener("click", async () => {
    const prompt = chip.getAttribute("data-prompt");
    if (!prompt) return;
    input.value = prompt;
    input.focus();
  });
});
