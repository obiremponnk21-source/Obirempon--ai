# Obirempon AI — V2 starter

## What is included
- Mobile-friendly Obirempon AI interface
- AI Chat, Writer, Design Assistant and Business Assistant modes
- Server-side OpenAI Responses API integration
- 10-request daily free limit (demo in-memory storage)
- GH₵30/month Premium UI placeholder
- Environment variable setup so the API key is not exposed in browser code

## Run locally
1. Install Node.js.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Put your server-side API key in `.env`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

## Important before public launch
The demo usage counter is in memory and is not suitable for a real production service. Replace it with a database and real authentication.
Do not commit `.env` or expose the API key in frontend JavaScript.

The app uses OpenAI's current Responses API approach rather than the retired Assistants API.
