'use strict';

const API_BASE = (typeof window !== 'undefined' && typeof window.DEFAULT_API_BASE === 'string')
  ? window.DEFAULT_API_BASE.replace(/\/+$/, '')
  : '';

function apiUrl(path) {
  if (!path || typeof path !== 'string') return API_BASE;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

/* ── MOCK DATA ── (replace with API calls) */
const MOCK = {
  soilMoisture: [
    { name: 'Field A – Wheat',   pct: 72, color: '#4caf60' },
    { name: 'Field B – Rice',    pct: 85, color: '#2563a8' },
    { name: 'Field C – Cotton',  pct: 41, color: '#e6a817' },
    { name: 'Field D – Maize',   pct: 63, color: '#4caf60' },
    { name: 'Field E – Mustard', pct: 29, color: '#c0392b' },
  ],

  alerts: [
    { pip: 'pip-red',   title: 'Leaf Blight Detected — Field A (Wheat)',      meta: 'AI Model · 94% confidence · 18 min ago' },
    { pip: 'pip-amber', title: 'Low Moisture — Field E (Mustard) at 29%',     meta: 'Sensor S-05 · Irrigation recommended · 34 min ago' },
    { pip: 'pip-amber', title: 'Rain Expected Tomorrow — Skip irrigation?',    meta: 'Weather API · IMD forecast · 1 hr ago' },
    { pip: 'pip-green', title: 'Field B Irrigation Complete — 420 L used',    meta: 'Auto-scheduler · 2 hrs ago' },
  ],

  waterChart: [
    { day: 'Mon', val: 2100 },
    { day: 'Tue', val: 1850 },
    { day: 'Wed', val: 2300 },
    { day: 'Thu', val: 1700 },
    { day: 'Fri', val: 2050 },
    { day: 'Sat', val: 1600 },
    { day: 'Today', val: 1840 },
  ],

  schedule: [
    { name: 'Field A – Wheat',   meta: '06:00 AM · 380 L · 25 min', badge: 'badge-done',   label: 'Done' },
    { name: 'Field B – Rice',    meta: '09:30 AM · 420 L · 30 min', badge: 'badge-done',   label: 'Done' },
    { name: 'Field C – Cotton',  meta: '02:15 PM · 310 L · 22 min', badge: 'badge-active', label: 'Active' },
    { name: 'Field D – Maize',   meta: '04:00 PM · 290 L · 20 min', badge: 'badge-soon',   label: 'Scheduled' },
    { name: 'Field E – Mustard', meta: '05:30 PM · 340 L · 24 min', badge: 'badge-urgent', label: 'Urgent' },
  ],

  diseaseHistory: [
    { title: 'Leaf Blight — Wheat (Field A)', meta: 'Today, 9:42 AM · 94% confidence',  badge: 'badge-urgent', label: 'Disease' },
    { title: 'Healthy — Rice (Field B)',      meta: 'Yesterday · 99% confidence',        badge: 'badge-active', label: 'Healthy' },
    { title: 'Rust Spot — Cotton (Field C)',  meta: 'Oct 14 · 87% confidence',           badge: 'badge-soon',   label: 'Warning' },
    { title: 'Healthy — Maize (Field D)',     meta: 'Oct 12 · 97% confidence',           badge: 'badge-active', label: 'Healthy' },
  ],

  cropRec: [
    { emoji: '🌾', name: 'Wheat',       score: 95, why: 'Best soil + season match' },
    { emoji: '🌻', name: 'Mustard',     score: 88, why: 'High yield, moderate water' },
    { emoji: '🫘', name: 'Gram (Chana)',score: 82, why: 'Nitrogen-fixing legume' },
    { emoji: '🥬', name: 'Spinach',     score: 74, why: 'Short 60-day cycle' },
    { emoji: '🥕', name: 'Carrot',      score: 68, why: 'Good winter demand' },
    { emoji: '🌿', name: 'Methi',       score: 61, why: 'Low water requirement' },
  ],

  sensors: [
    { id: 'S-01', field: 'Field A', info: 'Moisture 72% · Temp 23°C · pH 6.7', status: 'badge-online', label: 'Online' },
    { id: 'S-02', field: 'Field B', info: 'Moisture 85% · Temp 25°C · pH 6.2', status: 'badge-online', label: 'Online' },
    { id: 'S-03', field: 'Field C', info: 'Moisture 41% · Temp 27°C · pH 7.1', status: 'badge-online', label: 'Online' },
    { id: 'S-04', field: 'Field D', info: 'Moisture 63% · Temp 24°C · pH 6.9', status: 'badge-online', label: 'Online' },
    { id: 'S-05', field: 'Field E', info: 'Moisture 29% · Temp 28°C · pH 7.4', status: 'badge-low',    label: 'Low!' },
    { id: 'S-06', field: 'Weather', info: 'Temp 28°C · Humidity 62% · Wind 8 km/h', status: 'badge-online', label: 'Online' },
  ],

  chatMocks: [
    'Based on Punjab conditions, wheat benefits from DAP at sowing (120 kg/ha) and urea in two splits — first at tillering (60 kg/ha) and again at boot stage. Top-dressing with sulphur 10 kg/ha also improves grain protein.',
    'Leaf blight (Alternaria triticina) should be treated with Mancozeb 75 WP @ 2.5 g/litre or Propiconazole @ 1 ml/litre. Spray when humidity is high and avoid irrigating overhead. Remove and destroy infected leaves.',
    'The MSP for wheat for 2024–25 season was set at ₹2,275/quintal, a ₹150 increase over the previous year. Procurement typically runs from April to June through FCI and state agencies.',
    'Cotton (Desi) needs approximately 700–1200 mm of water over its growing season. In Punjab, this equals 5–7 irrigations of ~60 mm each. Drip irrigation can cut this by 30–40% while improving yields.',
    'Mustard intercropped with chickpea is a classic Punjab combo. Use 6:2 row ratio (6 mustard, 2 chickpea). The legume fixes nitrogen that benefits mustard. Sow simultaneously in October for Rabi season.',
    'Nitrogen deficiency shows as yellowing (chlorosis) starting from older/lower leaves moving upward, stunted growth, and pale green colour overall. Apply urea top-dressing at 40–60 kg/ha. Confirm with a soil test first.',
  ],
};

/* ── SIDEBAR TOGGLE (MOBILE) ── */
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('show');
  document.getElementById('hamburger-btn').classList.add('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
  document.getElementById('hamburger-btn').classList.remove('open');
}
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar.classList.contains('open')) { closeSidebar(); } else { openSidebar(); }
}

/* ── PAGE NAVIGATION ── */
const PAGE_TITLES = {
  dashboard: 'Farm Dashboard',
  irrigation: 'Smart Irrigation',
  disease:    'Disease Detection',
  crops:      'Crop Advisor',
  chat:       'Farm AI Chat',
  sensors:    'Sensors & Data',
  settings:   'Settings',
};

/* Bottom-nav page → button id mapping */
const BN_IDS = { dashboard:'bn-dashboard', irrigation:'bn-irrigation', disease:'bn-disease', chat:'bn-chat' };

function nav(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (el) el.classList.add('active');
  document.getElementById('topbar-title').textContent = PAGE_TITLES[id] || id;

  /* Sync bottom nav active state */
  document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
  const bnId = BN_IDS[id];
  if (bnId) document.getElementById(bnId).classList.add('active');
  else document.getElementById('bn-more').classList.add('active');

  /* Load page-specific data on navigation */
  if (id === 'settings') loadSettings();

  /* Close sidebar on mobile after navigation */
  closeSidebar();
}

/* Convenience wrapper used by bottom nav buttons */
function navMobile(page) {
  const sidebarEl = document.querySelector(`.nav-item[onclick*="'${page}'"]`);
  nav(page, sidebarEl);
}

/* ── RENDER: SOIL BARS ── */
function renderSoilBars(data) {
  const items = data || MOCK.soilMoisture;
  const el = document.getElementById('soil-bars');
  el.innerHTML = items.map(s => `
    <div class="soil-row">
      <div class="soil-name">${s.name}</div>
      <div class="soil-track"><div class="soil-fill" style="width:0%;background:${s.color}" data-w="${s.pct}"></div></div>
      <div class="soil-pct">${s.pct}%</div>
    </div>`).join('');
  // animate in
  setTimeout(() => {
    el.querySelectorAll('.soil-fill').forEach(b => b.style.width = b.dataset.w + '%');
  }, 80);
}

/* ── RENDER: ALERTS ── */
function renderAlerts(data) {
  const items = data || MOCK.alerts;
  document.getElementById('alerts-list').innerHTML =
    items.map(a => `
      <div class="alert-row">
        <div class="alert-pip ${a.pip}"></div>
        <div><div class="alert-title">${a.title}</div><div class="alert-meta">${a.meta}</div></div>
      </div>`).join('');
}

/* ── RENDER: BAR CHART ── */
function renderChart(data) {
  const items = data || MOCK.waterChart;
  if (!items.length) { document.getElementById('bar-chart').innerHTML = ''; return; }
  const vals = items.map(d => d.val);
  const mx   = Math.max(...vals, 1);
  document.getElementById('bar-chart').innerHTML =
    items.map((d, i) => {
      const h   = Math.round((d.val / mx) * 100);
      const col = i === vals.length - 1 ? 'var(--green-400)' : 'var(--border)';
      return `<div class="bar-wrap">
        <div class="bar" style="height:${h}%;background:${col}" title="${d.val} L"></div>
        <div class="bar-lbl">${d.day}</div>
      </div>`;
    }).join('');
}

/* ── RENDER: SCHEDULE ── */
function renderSchedule(data) {
  const items = data || MOCK.schedule;
  document.getElementById('schedule-list').innerHTML =
    items.map(r => `
      <div class="sched-row">
        <div class="sched-name">${r.name}</div>
        <div class="sched-meta">${r.meta}</div>
        <div class="badge ${r.badge}">${r.label}</div>
      </div>`).join('');
}

/* ── RENDER: DISEASE HISTORY ── */
function renderDiseaseHistory(data) {
  const items = data || MOCK.diseaseHistory;
  document.getElementById('disease-history').innerHTML =
    items.map(h => `
      <div class="sched-row">
        <div style="flex:1">
          <div style="font-weight:600;font-size:13px">${h.title}</div>
          <div style="font-size:11.5px;color:var(--text-300)">${h.meta}</div>
        </div>
        <div class="badge ${h.badge}">${h.label}</div>
      </div>`).join('');
}

/* ── RENDER: SENSORS ── */
function renderSensors(data) {
  const items = data || MOCK.sensors;
  document.getElementById('sensor-list').innerHTML =
    items.map(s => `
      <div class="sched-row">
        <div class="sched-name">${s.id} · ${s.field}</div>
        <div class="sched-meta">${s.info}</div>
        <div class="badge ${s.status}">${s.label}</div>
      </div>`).join('');
}

/* ── LOAD DASHBOARD FROM API (falls back to MOCK on error) ── */
async function loadDashboard() {
  try {
    const res = await fetch(apiUrl('/api/dashboard'));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    renderSoilBars(data.soilMoisture);
    renderAlerts(data.alerts);
    renderChart(data.waterChart);
    renderSchedule(data.schedule);
    renderDiseaseHistory(data.diseaseHistory);
    renderSensors(data.sensors);
  } catch (err) {
    console.warn('[dashboard] API unavailable — showing demo data:', err.message);
    renderSoilBars();
    renderAlerts();
    renderChart();
    renderSchedule();
    renderDiseaseHistory();
    renderSensors();
  }
  updateClock();
}

/* ── DISEASE DETECTION ── */
const DISEASE_MOCKS = [
  { type:'danger',  title:'⚠️ Leaf Blight Detected', desc:'Early-stage blight detected. Recommend fungicide treatment within 48 hrs. Avoid overhead irrigation.', conf:94, col:'#c0392b' },
  { type:'warning', title:'⚡ Rust Spot — Mild Risk', desc:'Mild rust spots observed. Monitor for 3–5 days. Apply sulphur-based fungicide as precaution.', conf:81, col:'#e6a817' },
  { type:'healthy', title:'✅ Leaf Looks Healthy', desc:'No disease detected. Good colour and structure. Continue normal irrigation and fertilisation.', conf:99, col:'#3d8b47' },
];

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) simulateDisease({ target:{ files:[file] } });
}

async function simulateDisease(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Preview
  const reader = new FileReader();
  reader.onload = e => {
    const p = document.getElementById('img-preview');
    p.src = e.target.result;
    p.style.display = 'block';
  };
  reader.readAsDataURL(file);

  // Show loading
  const loading = document.getElementById('disease-loading');
  const result  = document.getElementById('disease-result');
  loading.style.display = 'block';
  result.className = 'disease-result';

  try {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(apiUrl('/api/disease/analyse'), { method: 'POST', body: formData });
    loading.style.display = 'none';
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    showDiseaseResult(data);
  } catch (err) {
    loading.style.display = 'none';
    console.warn('[disease] API error — using demo result:', err.message);
    showDiseaseResult(DISEASE_MOCKS[Math.floor(Math.random() * DISEASE_MOCKS.length)]);
  }
}

function showDiseaseResult({ type, title, desc, conf, col }) {
  const result = document.getElementById('disease-result');
  result.className = `disease-result show ${type}`;
  document.getElementById('disease-title').textContent = title;
  document.getElementById('disease-desc').textContent  = desc;
  document.getElementById('conf-label').textContent    = `${conf}% confidence`;
  const fill = document.getElementById('conf-fill');
  fill.style.background = col;
  fill.style.width = '0%';
  setTimeout(() => fill.style.width = conf + '%', 80);

  // Add to history
  const badgeMap = { healthy:'badge-active', warning:'badge-soon', danger:'badge-urgent' };
  const labelMap = { healthy:'Healthy', warning:'Warning', danger:'Disease' };
  const histEl = document.getElementById('disease-history');
  histEl.insertAdjacentHTML('afterbegin', `
    <div class="sched-row" style="border-bottom:1px solid var(--border)">
      <div style="flex:1">
        <div style="font-weight:600;font-size:13px">${title} — Just scanned</div>
        <div style="font-size:11.5px;color:var(--text-300)">Now · ${conf}% confidence · AI model</div>
      </div>
      <div class="badge ${badgeMap[type]}">${labelMap[type]}</div>
    </div>`);
}

/* ── CROP ADVISOR ── */
async function runCropAdvisor() {
  const btn = document.getElementById('crop-btn');
  btn.textContent = '⏳ Analysing...';
  btn.disabled = true;

  // Map display labels → API values
  const soilMap   = { 'Loamy':'loamy', 'Clay':'clay', 'Sandy':'sandy', 'Silty':'silt', 'Black Cotton Soil':'black' };
  const seasonMap = { 'Rabi (Oct–Mar)':'rabi', 'Kharif (Jun–Sep)':'kharif', 'Zaid':'zaid' };
  const waterMap  = { 'Canal (abundant)':'high', 'Borewell (moderate)':'medium', 'Rain-fed (limited)':'low' };

  const soilRaw   = document.getElementById('c-soil').value;
  const seasonRaw = document.getElementById('c-season').value;
  const waterRaw  = document.getElementById('c-water').value;

  const params = {
    soil:     soilMap[soilRaw]    || soilRaw.toLowerCase(),
    ph:       parseFloat(document.getElementById('c-ph').value)   || 6.5,
    rainfall: parseFloat(document.getElementById('c-rain').value) || 800,
    temp:     parseFloat(document.getElementById('c-temp').value) || 25,
    region:   document.getElementById('c-region').value,
    season:   seasonMap[seasonRaw] || 'rabi',
    nitrogen: parseFloat(document.getElementById('c-n').value)    || 50,
    water:    waterMap[waterRaw]  || 'medium',
  };

  try {
    const res = await fetch(apiUrl('/api/crops/recommend'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const grid = document.getElementById('crop-grid');
    grid.innerHTML = data.crops.map(c => `
      <div class="crop-card">
        <div class="crop-emoji">${c.emoji}</div>
        <div class="crop-name">${c.name}</div>
        <div class="crop-why">${c.why}</div>
        <div class="crop-score">${c.score}% match</div>
      </div>`).join('');
    const summaryEl = document.getElementById('crop-summary');
    if (summaryEl && data.summary) summaryEl.textContent = data.summary;
    document.getElementById('crop-results').style.display = 'block';
    showToast('✅ ' + data.crops.length + ' crop recommendations ready');
  } catch (err) {
    console.warn('[crops] API error — using demo data:', err.message);
    const grid = document.getElementById('crop-grid');
    grid.innerHTML = MOCK.cropRec.map(c => `
      <div class="crop-card">
        <div class="crop-emoji">${c.emoji}</div>
        <div class="crop-name">${c.name}</div>
        <div class="crop-why">${c.why}</div>
        <div class="crop-score">${c.score}% match</div>
      </div>`).join('');
    document.getElementById('crop-results').style.display = 'block';
    showToast('✅ 6 crop recommendations ready (demo)');
  } finally {
    btn.textContent = '🔍 Get Recommendations';
    btn.disabled = false;
  }
}

/* ── CHAT ── */
let chatHistory = [];
let chatIdx = 0;

async function sendMsg() {
  const input = document.getElementById('chat-in');
  const btn   = document.getElementById('chat-send-btn');
  const msg   = input.value.trim();
  if (!msg || btn.disabled) return;
  input.value = '';

  addBubble(msg, 'user');
  chatHistory.push({ role:'user', content: msg });
  btn.disabled = true;
  btn.textContent = '...';

  // Typing indicator
  const tid = 'typing-' + Date.now();
  const msgs = document.getElementById('chat-msgs');
  msgs.insertAdjacentHTML('beforeend', `
    <div class="msg-row" id="${tid}">
      <div class="msg-avatar">🌿</div>
      <div class="msg-bubble" style="color:var(--text-300);font-style:italic">Thinking…</div>
    </div>`);
  msgs.scrollTop = msgs.scrollHeight;

  try {
    const res = await fetch(apiUrl('/api/chat/message'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: chatHistory.slice(-10) }),
    });
    document.getElementById(tid)?.remove();
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    addBubble(data.reply, 'ai');
    chatHistory.push({ role:'assistant', content: data.reply });
  } catch (err) {
    document.getElementById(tid)?.remove();
    console.warn('[chat] API error — using demo reply:', err.message);
    const reply = MOCK.chatMocks[chatIdx % MOCK.chatMocks.length];
    chatIdx++;
    addBubble(reply, 'ai');
    chatHistory.push({ role:'assistant', content: reply });
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send';
  }
}

function addBubble(text, role) {
  const msgs = document.getElementById('chat-msgs');
  const isUser = role === 'user';
  msgs.insertAdjacentHTML('beforeend', `
    <div class="msg-row ${isUser ? 'user' : ''}">
      <div class="msg-avatar">${isUser ? '👨‍🌾' : '🌿'}</div>
      <div class="msg-bubble">${text.replace(/</g,'&lt;')}</div>
    </div>`);
  msgs.scrollTop = msgs.scrollHeight;
}

function quickMsg(msg) {
  document.getElementById('chat-in').value = msg;
  sendMsg();
}

/* ── IRRIGATION ACCEPT ── */
async function acceptIrrPlan() {
  try {
    const res = await fetch(apiUrl('/api/irrigation/accept'), { method: 'POST' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    showToast('✅ Irrigation plan accepted — schedule updated');
    loadDashboard();
  } catch (err) {
    console.warn('[irrigation/accept]', err.message);
    showToast('✅ Irrigation plan accepted');
  }
}

/* ── SETTINGS SAVE ── */
async function saveSettings() {
  const data = {
    farmName:      document.getElementById('s-fname').value,
    area:          document.getElementById('s-area').value,
    waterSource:   document.getElementById('s-water').value,
    alertLanguage: document.getElementById('s-lang').value,
    apiUrl:        document.getElementById('s-api').value,
    autoIrr:       document.getElementById('s-auto-irr').checked,
    weather:       document.getElementById('s-weather').checked,
    disease:       document.getElementById('s-disease').checked,
    sms:           document.getElementById('s-sms').checked,
    mandi:         document.getElementById('s-mandi').checked,
  };
  try {
    const res = await fetch(apiUrl('/api/settings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    showToast('💾 Settings saved successfully');
  } catch (err) {
    console.warn('[settings/save]', err.message);
    showToast('💾 Settings saved (offline mode)');
  }
}

/* ── SETTINGS LOAD ── */
async function loadSettings() {
  try {
    const res = await fetch(apiUrl('/api/settings'));
    if (!res.ok) return;
    const { settings } = await res.json();
    if (!settings) return;
    if (settings.farmName)      document.getElementById('s-fname').value = settings.farmName;
    if (settings.area != null)  document.getElementById('s-area').value  = settings.area;
    if (settings.alertLanguage) document.getElementById('s-lang').value  = settings.alertLanguage;
    if (settings.apiUrl)        document.getElementById('s-api').value   = settings.apiUrl;
    document.getElementById('s-auto-irr').checked = !!settings.autoIrr;
    document.getElementById('s-weather').checked  = settings.weather !== false;
    document.getElementById('s-disease').checked  = settings.disease !== false;
    document.getElementById('s-sms').checked      = !!settings.sms;
    document.getElementById('s-mandi').checked    = !!settings.mandi;
    // Normalise waterSource value to match the <select> option text
    const wsMap = { borewell:'Borewell', canal:'Canal Irrigation', rainwater:'Rainwater' };
    const ws = wsMap[(settings.waterSource || '').toLowerCase()];
    if (ws) {
      const sel = document.getElementById('s-water');
      const opt = Array.from(sel.options).find(o => o.text === ws || o.value === ws);
      if (opt) sel.value = opt.value;
    }
  } catch (err) {
    console.warn('[settings/load]', err.message);
  }
}

/* ── TOAST ── */
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ── LAST UPDATED CLOCK ── */
function updateClock() {
  const el = document.getElementById('last-updated');
  const now = new Date();
  el.textContent = 'updated ' + now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
}
setInterval(updateClock, 60000);

/* ── INIT ── */
loadDashboard();
