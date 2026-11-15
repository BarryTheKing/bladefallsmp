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


const serverCopyButton = document.getElementById('copyServerIp');
const ipToast = document.getElementById('ipToast');
serverCopyButton?.addEventListener('click', async () => {
  const joinAddress = 'BarryHarry1505';
  try { await navigator.clipboard.writeText(joinAddress); }
  catch { const field = document.createElement('textarea'); field.value = joinAddress; field.style.position = 'fixed'; field.style.opacity = '0'; document.body.appendChild(field); field.select(); document.execCommand('copy'); field.remove(); }
  ipToast.textContent = 'Join details copied!'; ipToast.classList.add('show');
  window.setTimeout(() => ipToast.classList.remove('show'), 2500);
});
const guideContent = {
 rules: '<h3>A lawless world. Stay alert.</h3><p>BladefallSMP is described as an anarchy survival experience.</p><ul><li>No safe zones or protected bases.</li><li>Raids and PvP can happen at any time.</li><li>Protect your gear; trust no one.</li><li>Be respectful to the community and follow platform rules.</li></ul>',
 mechanics: '<h3>Danger is everywhere</h3><ul><li>Orbital Strike — a devastating attack from above.</li><li>Raids — find bases and fight for their loot.</li><li>No safe zones — nowhere is off-limits.</li><li>Survival PvP — gear up and fight to survive.</li></ul><p class="guide-callout">Mechanics may vary depending on the current season setup.</p>',
 howto: '<h3>Join the world</h3><p><b>1.</b> Open Minecraft Bedrock / MCPE.</p><p><b>2.</b> Go to Friends → Add Friend and search for <b>BarryHarry1505</b>.</p><p><b>3.</b> Add the gamertag as a friend and join the open world.</p><p class="guide-callout">A direct server IP is not listed on the current site; connect using the gamertag.</p>',
 ranks: `<div class="shop-intro"><div><span class="mcpvp-eyebrow">IN-GAME ECONOMY</span><h3>Ranks &amp; Shop</h3></div><span class="shop-currency">$ SERVER DOLLARS</span></div><h4>Server Ranks</h4><div class="shop-grid"><article class="shop-card"><span class="shop-item-type">RANK</span><h5>VIP</h5><strong>$5,000</strong></article><article class="shop-card"><span class="shop-item-type">RANK</span><h5>PRO</h5><strong>$12,500</strong></article><article class="shop-card"><span class="shop-item-type">RANK</span><h5>ELITE</h5><strong>$25,000</strong></article><article class="shop-card"><span class="shop-item-type">RANK</span><h5>LEGEND</h5><strong>$50,000</strong></article></div><h4 class="shop-subhead">In-Game Items</h4><div class="shop-grid"><article class="shop-card"><span class="shop-item-type">ITEM</span><h5>Diamond Kit</h5><strong>$2,500</strong></article><article class="shop-card"><span class="shop-item-type">ITEM</span><h5>Totem of Undying</h5><strong>$4,000</strong></article><article class="shop-card"><span class="shop-item-type">ITEM</span><h5>Ender Chest</h5><strong>$1,500</strong></article><article class="shop-card"><span class="shop-item-type">ITEM</span><h5>32 Netherite Blocks</h5><strong>$3,500</strong></article></div><p class="shop-note">Example in-game prices only · availability and final prices depend on the live server economy. No real-money purchases.</p>`
};
const guidePanel = document.getElementById('guidePanel');
const guideTabs = [...document.querySelectorAll('.guide-tab')];
function setGuideTab(key) { if (!guidePanel || !guideContent[key]) return; guidePanel.innerHTML = guideContent[key]; guideTabs.forEach(tab => { const active = tab.dataset.tab === key; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); }); }
guideTabs.forEach((tab, index) => { tab.addEventListener('click', () => setGuideTab(tab.dataset.tab)); tab.addEventListener('keydown', event => { if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return; event.preventDefault(); const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + guideTabs.length) % guideTabs.length; guideTabs[next].focus(); setGuideTab(guideTabs[next].dataset.tab); }); });
setGuideTab('rules');
const pvpButtons = [...document.querySelectorAll('.pvp-player')];
const pvpList = document.querySelector('.pvp-player-list');
document.querySelectorAll('.filter-btn').forEach(button => button.addEventListener('click', () => {
 document.querySelectorAll('.filter-btn').forEach(item => item.classList.toggle('active', item === button));
 const key = button.dataset.sort;
 pvpButtons.sort((a,b) => Number(b.dataset[key]) - Number(a.dataset[key])).forEach((player, index) => { player.querySelector('.pvp-rank').textContent = String(index + 1).padStart(2, '0'); pvpList.appendChild(player); });
}));
const playerModal = document.getElementById('playerModal');
const playerModalContent = document.getElementById('playerModalContent');
pvpButtons.forEach(player => player.addEventListener('click', () => {
 const d = player.dataset;
 playerModalContent.innerHTML = '<div class="player-profile-head"><img src="' + d.avatar + '" alt=""><div><h2 id="playerModalName">' + d.player + '</h2><p>' + d.clan + ' • SEASON 1</p></div></div><div class="profile-stats"><div class="profile-stat"><span>K/D ratio</span><b>' + d.kd + '</b></div><div class="profile-stat"><span>Favorite weapon</span><b>' + d.weapon + '</b></div><div class="profile-stat"><span>Kills</span><b>' + d.kills + '</b></div><div class="profile-stat"><span>Best streak</span><b>' + d.streak + '</b></div><div class="profile-stat"><span>Raids</span><b>' + d.raids + '</b></div><div class="profile-stat"><span>Clan</span><b>' + d.clan + '</b></div></div>';
 playerModal.showModal();
}));
document.querySelector('.player-close')?.addEventListener('click', () => playerModal.close());
playerModal?.addEventListener('click', event => { if (event.target === playerModal) playerModal.close(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && playerModal?.open) playerModal.close(); });
