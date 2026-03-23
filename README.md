# Dentro de las Emergencias · Starter gratuito

Base web gratuita para desplegar en **Cloudflare Pages** con un asistente IA conectado a **Gemini** mediante una **Pages Function**, sin exponer la API key en el navegador.

## Estructura

- `index.html` → home de la web
- `styles.css` → estilos corporativos base
- `app.js` → lógica del chat en frontend
- `functions/api/chat.js` → función segura que llama a Gemini

## Qué hace

- Publica una web estática gratis
- Añade un chat IA simple en `/api/chat`
- Usa `GEMINI_API_KEY` como variable de entorno en Cloudflare
- Sigue una estética base adaptada a la marca

## Cómo desplegar en Cloudflare Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube estos archivos al repositorio.
3. En Cloudflare, entra en **Workers & Pages**.
4. Crea un proyecto **Pages** importando ese repositorio.
5. Configura:
   - Production branch: `main`
   - Build command: déjalo vacío
   - Build output directory: `/`
6. En tu proyecto de Pages, ve a **Settings > Environment variables**.
7. Crea una variable:
   - Nombre: `GEMINI_API_KEY`
   - Valor: tu API key de Google AI Studio
8. Vuelve a desplegar.

## Cómo conseguir la API key

1. Entra en Google AI Studio.
2. Crea una API key.
3. Pégala como `GEMINI_API_KEY` en Cloudflare Pages.

## Siguiente mejora recomendada

- Conectar tus artículos reales
- Añadir formulario de suscripción
- Crear páginas individuales por bloque temático
- Limitar el chat a preguntas de tu proyecto con contenido real
- Añadir analítica básica

## Importante

Esta versión es una base inicial. La IA responde con contexto general del proyecto, pero todavía **no está entrenada con tus artículos** ni usa una base documental propia.
