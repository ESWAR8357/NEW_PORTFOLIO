# Connect the portfolio to Ollama Cloud

The portfolio's `/api/chat` function sends chat requests directly from Vercel to Ollama Cloud. You do not need to run Ollama or a model on your PC. The API key stays in Vercel and is never sent to the browser.

## Recommended model

Use `gemma4` for this portfolio assistant. It is a good fit for concise, instruction-following answers about the portfolio, has a 256K context window, and supports system messages. The Ollama API example uses the model name `gemma4`.

Ollama currently lists Gemma 4 at **$0.14 per million input tokens** and **$0.40 per million output tokens**. The hosted API is billed by usage; a zero Ollama balance may prevent requests until usage is available again. Check current [Ollama pricing](https://ollama.com/pricing) before enabling it for public visitors.

## Setup on Vercel

1. Sign in to Ollama and create an API key at [ollama.com/settings/keys](https://ollama.com/settings/keys).
2. In Vercel, open the portfolio project and go to **Settings → Environment Variables**.
3. Add these variables. Select **Production** and, if desired, **Preview**:

   ```text
   OLLAMA_BASE_URL=https://ollama.com/api
   OLLAMA_MODEL=gemma4
   OLLAMA_API_KEY=your-ollama-api-key
   ```

4. Save the variables and redeploy the project. Open the deployed portfolio and try “What projects has he built?”

The API function calls `https://ollama.com/api/chat` with the key in an `Authorization: Bearer` header. Never place the key in `index.html`, `script.js`, or `content.json`.

The assistant sends the portfolio facts and up to the last eight conversation turns on each request. It limits message size and applies a small in-memory rate limit per serverless instance. Cloud usage is metered by tokens, so longer chats use more input tokens.

References: [Ollama API introduction](https://docs.ollama.com/api/introduction), [Gemma 4 on Ollama](https://ollama.com/library/gemma4), and [Vercel environment variables](https://vercel.com/docs/environment-variables).
