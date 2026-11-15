const launcher = document.getElementById('aiLauncher');
const panel = document.getElementById('aiPanel');
const closeButton = document.getElementById('aiClose');
const form = document.getElementById('aiForm');
const input = document.getElementById('aiInput');
const log = document.getElementById('aiChatLog');
const sendButton = document.getElementById('aiSend');
const STORAGE_KEY = 'bladefall-ai-chat-v1';
const MAX_CONTEXT_MESSAGES = 80;
const MAX_STORED_MESSAGES = 180;
const SYSTEM_PROMPT = 'You are Bladefall AI, a clearly identified AI assistant for the BladefallSMP website. Be friendly, capable, clear, and helpful. You can converse in 30+ languages: detect the visitor’s language automatically, reply in that language, and switch whenever they ask. If they write in a language other than English, do not default to English. You may answer general questions too. For BladefallSMP specifics, use only these known facts: Season 1 is coming soon; the official trailer is coming soon; the server is Bedrock/MCPE; the published join method is adding gamertag BarryHarry1505 as a friend in Minecraft Bedrock; no direct server IP is currently published; the world is described as lawless/anarchy survival with no safe zones, raids and PvP. The website also shows example in-game dollar prices for VIP ($5,000), PRO ($12,500), ELITE ($25,000), LEGEND ($50,000), Diamond Kit ($2,500), Totem of Undying ($4,000), Ender Chest ($1,500), and 32 Netherite Blocks ($3,500); these are illustrative website prices, not verified live server inventory. Never invent server IPs, live server status, player stats, rules, or operational abilities. Be explicit when you are unsure. You can explain and guide, but cannot enter the game, moderate players, change server settings, or perform actions outside this chat. Keep replies useful and not overly long. Do not claim to be human; if asked, say you are an AI assistant.';
let history = [];
let busy = false;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (Array.isArray(saved)) history = saved.filter(item => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string').slice(-MAX_STORED_MESSAGES);
} catch { history = []; }
function addBubble(role, content, className = '') {
  const bubble = document.createElement('div');
  bubble.className = 'ai-message ' + role + (className ? ' ' + className : '');
  bubble.textContent = content;
  log.appendChild(bubble);
  log.scrollTop = log.scrollHeight;
  return bubble;
}
function persist() {
  history = history.slice(-MAX_STORED_MESSAGES);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch { /* Storage may be unavailable; chat still works for this visit. */ }
}
function renderHistory() {
  log.replaceChildren();
  if (!history.length) {
    addBubble('assistant', 'Hi! I’m the BladefallSMP AI assistant. I can chat in 30+ languages. Ask me about joining, the world, PvP, or anything else.');
    return;
  }
  history.slice(-MAX_CONTEXT_MESSAGES).forEach(item => addBubble(item.role, item.content));
}
function openChat() {
  panel.hidden = false;
  launcher.setAttribute('aria-expanded', 'true');
  renderHistory();
  input.focus();
}
function closeChat() {
  panel.hidden = true;
  launcher.setAttribute('aria-expanded', 'false');
  launcher.focus();
}
launcher.addEventListener('click', () => panel.hidden ? openChat() : closeChat());
closeButton.addEventListener('click', closeChat);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) closeChat(); });
input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 125) + 'px'; });
form.addEventListener('submit', async event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text || busy) return;
  busy = true;
  sendButton.disabled = true;
  input.disabled = true;
  history.push({ role: 'user', content: text });
  persist();
  addBubble('user', text);
  input.value = '';
  input.style.height = 'auto';
  const typing = document.createElement('div');
  typing.className = 'ai-typing';
  typing.textContent = 'Thinking…';
  log.appendChild(typing);
  log.scrollTop = log.scrollHeight;
  try {
    if (!window.websim?.chat?.completions?.create) throw new Error('The AI service is not available in this browser session.');
    const context = history.slice(-MAX_CONTEXT_MESSAGES).map(message => ({ role: message.role, content: message.content }));
    const response = await window.websim.chat.completions.create({
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...context]
    });
    typing.remove();
    const answer = typeof response?.content === 'string' && response.content.trim() ? response.content.trim() : 'I couldn’t form a reply just now. Please try again.';
    history.push({ role: 'assistant', content: answer });
    persist();
    addBubble('assistant', answer);
  } catch (error) {
    typing.remove();
    const notice = error?.message?.includes('hourly_limit') ? 'The AI service has reached its current usage limit. Please try again later.' : 'I’m temporarily unable to reach the AI service. Please try again in a moment.';
    addBubble('assistant', notice, 'error');
  } finally {
    busy = false;
    sendButton.disabled = false;
    input.disabled = false;
    input.focus();
  }
});
