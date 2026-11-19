const windows = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 18;

const SYSTEM_PROMPT = 'You are Bladefall AI, a clearly identified AI assistant for the BladefallSMP website. Be friendly, clear, and helpful. You can converse in 30+ languages: detect the visitor’s language automatically, reply in that language, and switch whenever asked. You may answer general questions too. Known BladefallSMP facts: Season 1 is coming soon; its official trailer is coming soon; the server is Bedrock/MCPE; join by adding gamertag BarryHarry1505 as a friend in Minecraft Bedrock; no direct server IP is published; the world is described as lawless/anarchy survival with no safe zones, raids, and PvP. The website shows illustrative in-game dollar prices only: VIP $5,000; PRO $12,500; ELITE $25,000; LEGEND $50,000; Diamond Kit $2,500; Totem of Undying $4,000; Ender Chest $1,500; 32 Netherite Blocks $3,500. These prices and inventory are not verified live server configuration. Never invent server IPs, live status, player stats, rules, or operational abilities. Be explicit when unsure. You can explain and guide but cannot enter the game or change server settings. Do not claim to be human; say you are AI if asked.';

function json(data, status, origin) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function allowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = (env.ALLOWED_ORIGIN || '').trim();
  return origin && allowed && origin === allowed ? origin : null;
}

function withinRateLimit(ip, now) {
  const entry = windows.get(ip);
  if (!entry || now - entry.start >= WINDOW_MS) {
    windows.set(ip, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) return false;
  entry.count += 1;
  if (windows.size > 4000) {
    for (const [key, value] of windows) if (now - value.start >= WINDOW_MS) windows.delete(key);
  }
  return true;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/chat') return new Response('Not found', { status: 404 });
    const origin = allowedOrigin(request, env);
    if (!origin) return json({ error: 'Origin not allowed. Configure ALLOWED_ORIGIN for your GitHub Pages site.' }, 403, null);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400', 'Vary': 'Origin' } });
    if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405, origin);
    if (!env.OPENAI_API_KEY) return json({ error: 'The AI provider key is not configured on this Worker.' }, 503, origin);

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!withinRateLimit(ip, Date.now())) return json({ error: 'Rate limit reached. Please try again in a few minutes.' }, 429, origin);

    try {
      const raw = await request.text();
      if (raw.length > 30000) return json({ error: 'Message history is too large.' }, 413, origin);
      const body = JSON.parse(raw);
      if (!Array.isArray(body.messages)) return json({ error: 'Expected a messages array.' }, 400, origin);
      const messages = body.messages
        .filter(message => message && (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string')
        .slice(-80)
        .map(message => ({ role: message.role, content: message.content.slice(0, 2000) }));
      if (!messages.some(message => message.role === 'user')) return json({ error: 'Send a message to start the chat.' }, 400, origin);

      const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + env.OPENAI_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages], max_tokens: 900, temperature: 0.7 })
      });
      const result = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        console.error('AI provider error', upstream.status, JSON.stringify(result).slice(0, 1200));
        return json({ error: 'The AI provider could not complete this reply. Check Worker logs and provider settings.' }, 502, origin);
      }
      const reply = result.choices?.[0]?.message?.content;
      if (typeof reply !== 'string' || !reply.trim()) return json({ error: 'The AI provider returned an empty reply.' }, 502, origin);
      return json({ reply: reply.trim() }, 200, origin);
    } catch (error) {
      console.error('Worker chat error', error?.message || error);
      return json({ error: 'Unable to process this message. Please try again.' }, 500, origin);
    }
  }
};
