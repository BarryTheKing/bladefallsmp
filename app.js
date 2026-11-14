const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('in');
    else entry.target.classList.remove('in');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.section, .hero, .card, .stat, .server-box').forEach((el) => {
  el.classList.add('reveal');
  observer.observe(el);
});
const copyBtn = document.getElementById('copyLink');
const shareBtn = document.getElementById('shareBtn');
const copiedMsg = document.getElementById('copiedMsg');

copyBtn.addEventListener('click', async () => {
  const url = window.location.href;
  try { await navigator.clipboard.writeText(url); }
  catch (e) {
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  copiedMsg.classList.add('show');
  setTimeout(() => copiedMsg.classList.remove('show'), 2500);
});

shareBtn.addEventListener('click', async () => {
  const url = window.location.href;
  if (navigator.share) {
    try { await navigator.share({ title: 'BladefallSMP', text: 'Join my MCPE world BladefallSMP!', url }); }
    catch (e) {}
  } else copyBtn.click();
});

const legalContent = {
  privacy: {
    title: 'Privacy policy',
    body: '<p>This website does not ask you to create an account or submit personal information. The copy-link and share features only run when you choose to use them.</p><p>Opening YouTube follows its own privacy policy. The website host may process basic technical data, such as request and security logs, to deliver this page.</p><p>For privacy questions, contact the BladefallSMP team through its YouTube channel.</p>'
  },
  terms: {
    title: 'Terms of service',
    body: '<p>Use this website and the BladefallSMP server at your own discretion. Server access, availability, and gameplay may change or end at any time.</p><p>BladefallSMP is an independent community project and is not affiliated with, endorsed by, or sponsored by Mojang or Microsoft. Minecraft is a trademark of Microsoft.</p><p>By using this site, you agree not to misuse it or attempt to disrupt its operation.</p>'
  },
  cookies: {
    title: 'Cookie policy',
    body: '<p>This website does not intentionally set cookies for analytics or advertising. The hosting platform or linked third-party services may use essential technologies under their own policies.</p>'
  }
};

const legalDialog = document.getElementById('legalDialog');
const legalTitle = document.getElementById('legalTitle');
const legalBody = document.getElementById('legalBody');
document.querySelectorAll('[data-legal]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const content = legalContent[link.dataset.legal];
    if (!content) return;
    legalTitle.textContent = content.title;
    legalBody.innerHTML = content.body;
    legalDialog.showModal();
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => legalDialog.close());
legalDialog.addEventListener('click', (event) => {
  if (event.target === legalDialog) legalDialog.close();
});
document.getElementById('year').textContent = new Date().getFullYear();


const leaderboardSearch = document.getElementById('leaderboardSearch');
const leaderboardRows = [...document.querySelectorAll('.mcpvp-row')];
const leaderboardEmpty = document.getElementById('leaderboardEmpty');
const topPlayers = document.querySelector('.top-players');

// Keep the podium as the opening view; searching reveals matching ranks, including the top three.
leaderboardRows.forEach((row) => {
  const rank = Number(row.querySelector('.mcpvp-rank')?.textContent.trim());
  if (rank <= 3) row.classList.add('podium-list-hidden');
});
leaderboardSearch?.addEventListener('input', () => {
  const query = leaderboardSearch.value.trim().toLocaleLowerCase();
  let visible = 0;
  leaderboardRows.forEach((row) => {
    const matches = !query || row.textContent.toLocaleLowerCase().includes(query) || row.getAttribute('aria-label')?.toLocaleLowerCase().includes(query);
    row.classList.toggle('search-hidden', !matches);
    row.classList.toggle('podium-list-hidden', !query && Number(row.querySelector('.mcpvp-rank')?.textContent.trim()) <= 3);
    if (matches) visible++;
  });
  if (topPlayers) topPlayers.hidden = Boolean(query);
  if (leaderboardEmpty) leaderboardEmpty.hidden = visible !== 0;
});

const kingsSearch = document.getElementById('kingsLeaderboardSearch');
const kingsPlayers = [...document.querySelectorAll('.kings-podium-card')];
const kingsEmpty = document.getElementById('kingsLeaderboardEmpty');
kingsSearch?.addEventListener('input', () => {
  const query = kingsSearch.value.trim().toLocaleLowerCase();
  let visible = 0;
  kingsPlayers.forEach((player) => {
    const match = !query || player.textContent.toLocaleLowerCase().includes(query) || player.getAttribute('aria-label')?.toLocaleLowerCase().includes(query);
    player.hidden = !match;
    if (match) visible++;
  });
  if (kingsEmpty) kingsEmpty.hidden = visible !== 0;
});
