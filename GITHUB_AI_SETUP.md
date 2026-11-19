# GitHub Pages AI setup

GitHub Pages is static hosting and does not provide the Websim AI runtime or a secure place for an API key. This site now supports a separate Cloudflare Worker proxy. The browser sends chat history to the Worker; the Worker keeps the OpenAI key private and returns the reply.

## 1. Deploy the Worker

1. Sign in to Cloudflare and open **Workers & Pages → Create → Worker**.
2. Create a Worker named (for example) `bladefall-ai`.
3. Replace the starter code with the contents of `github-ai-worker.js` in this repository and deploy it.
4. In the Worker settings, add these variables:
   - **Secret** `OPENAI_API_KEY`: your OpenAI API key. Create it in your OpenAI account and keep it secret.
   - **Variable** `ALLOWED_ORIGIN`: your exact GitHub Pages origin, for example `https://YOUR-USERNAME.github.io`. For a custom domain, use that domain instead. Do not add a repository path or trailing slash.
   - **Variable** (optional) `OPENAI_MODEL`: defaults to `gpt-4o-mini`.
5. Your public Worker URL will look like `https://bladefall-ai.YOUR-ACCOUNT.workers.dev/chat`.

## 2. Connect the GitHub Pages site

Edit `ai-config.js` and set the deployed URL:

```js
window.BLADEFALL_AI_ENDPOINT = 'https://bladefall-ai.YOUR-ACCOUNT.workers.dev/chat';
```

Commit and push `ai-config.js` to the GitHub repository, then wait for GitHub Pages to redeploy. Never put the OpenAI key in this file, HTML, or any other repository file.

## 3. Test

Open the published Pages site, start a new chat, and send a message. The Worker allows only the origin set in `ALLOWED_ORIGIN`. If it fails, check the Worker logs and verify the origin, API key, provider billing, and endpoint URL. Responses use the external OpenAI API and may incur usage charges.

The Worker includes a basic per-IP in-memory rate limit. Because it is isolate-local and not a full abuse-prevention system, also add a Cloudflare rate-limit/WAF rule for `/chat` if available on your plan. The sample ranks and prices remain illustrative, not live server configuration.
