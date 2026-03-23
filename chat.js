export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.GEMINI_API_KEY) {
      return json(
        { error: "Falta configurar GEMINI_API_KEY en Cloudflare Pages." },
        500
      );
    }

    const body = await request.json();
    const message = String(body?.message || "").trim();
    const history = Array.isArray(body?.history) ? body.history.slice(-6) : [];

    if (!message) {
      return json({ error: "La pregunta está vacía." }, 400);
    }

    const systemInstruction = `
Eres el asistente web de Dentro de las Emergencias.
Tu función es explicar de forma técnica, clara, profesional y divulgativa temas relacionados con:
- coordinación operativa
- CECOP y PMA
- comunicaciones DMR y TETRA
- centrales de comunicaciones
- dispositivos preventivos
- dimensionamiento de medios
- estructura de respuesta
- organización de servicios de emergencia

Reglas:
- Responde siempre en español.
- Sé preciso, útil y ordenado.
- No inventes experiencias personales ni datos concretos no proporcionados.
- Si la pregunta requiere normativa, actualidad o datos específicos, advierte brevemente que debe verificarse.
- Mantén un tono profesional, accesible y nada sensacionalista.
- Evita frases vacías o grandilocuentes.
`.trim();

    const contents = [
      ...history.map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: String(item.text || "") }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.5,
            topP: 0.9,
            maxOutputTokens: 700,
          },
        }),
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return json(
        {
          error:
            data?.error?.message || "Gemini no pudo procesar la solicitud.",
          details: data,
        },
        geminiResponse.status
      );
    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("\n")
        .trim() || "No se ha podido generar una respuesta útil.";

    return json({ reply });
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error ? error.message : "Error inesperado en la función.",
      },
      500
    );
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
