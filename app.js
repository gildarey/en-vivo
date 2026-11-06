// Nombre de la app (pestaña del navegador). Cambiarlo solo aquí.
const APP_NAME = 'En Vivo';

// ===== CANALES — edita aquí =====
// Lista de canales disponibles; cada pantalla elige uno desde su desplegable.
// channelId: siempre muestra el directo actual del canal (no cambia).
// videoId:   opcional. Si lo completas, se usa ese video en vez del directo del canal.
//            Sirve si el directo por canal no carga. Cópialo del link: youtube.com/watch?v=ESTE_ID
// fallbackId: opcional. Se usa solo si el directo por canal da error (p. ej. el canal tiene dos directos a la vez).
const CHANNELS = [
  { name: 'Monumental 1080', channelId: 'UCApQkTY6oHoGjZr6jfMajwQ', videoId: '' }, // último visto: r7BMMpmwtsg
  { name: 'MEGA TV',         channelId: 'UCfAdi_G2owo819wJsw4OLPQ', videoId: '' }, // último visto: yrqaA-LTbrA
  { name: 'ABC TV',          channelId: 'UCEklbFbPoMaV1ciEb-0mAxg', videoId: '', fallbackId: 'koJbtOzjsbI' },
  { name: 'NPY',             channelId: 'UCXm5UbX1eXIFmFE0lz1etiA', videoId: '' }, // último visto: _ErAcg5qFMo
  { name: 'Senado TV',       channelId: 'UCMXLvWR4z1Z4P4JvubxMQtg', videoId: '' }, // último visto: rmdELJNkqS4
  { name: 'Trece',           channelId: 'UCbgzWL_vNk3K2vcpk2udhLA', videoId: '' }, // último visto: dU7zxIJDhYM
  { name: 'Telefuturo',      channelId: 'UCtM-kY8-zx8zzsrWKVUffyA', videoId: '', fallbackId: 'C_lDY_wsFew' },
  { name: 'GEN',             channelId: 'UC9FQShRxvepLNn6lLfvBhyA', videoId: '', fallbackId: 'GtoT3gNq9O4' },
  { name: 'La Nación',       channelId: 'UC0j83Ogsf44Vdi3Qi5OUrRA', videoId: '', fallbackId: 'g0F123l4UO0' },
  { name: 'SNT',             channelId: 'UC8NNg2qEuMQIXlqPS-eu_ig', videoId: '', fallbackId: 'ktKP8oBv_Wk' },
  { name: 'TV Cámara',       channelId: 'UCRVeQhiqhUAxRRUod7F-K3A', videoId: '', fallbackId: '_-rswAwOSis' },
  { name: 'latele',          channelId: 'UCtM4N3FWZ9DhKxx8D4fCNUA', videoId: '', fallbackId: 'v5CX4yivaGU' },
  { name: 'América TV',      channelId: 'UC_JrKD7FADkMz34BvN33vaA', videoId: '', fallbackId: 'OsxzvEgF1w0' },
  { name: 'Ñanduti',         channelId: 'UC3MzWfxWB6ImezkL5_DSd4A', videoId: '', fallbackId: 'br2qul_ZpdE' }, // @nanduti1020; existe también @RadioNandutiAM
  { name: 'Telefuturo Prensa', channelId: 'UC05nHifnRWxoJkzgAP-sffg', videoId: '' },
  { name: 'Unicanal',        channelId: 'UCT9-9nG-go0cQGn9rVBzaxA', videoId: '' },
  { name: 'C9N',             channelId: 'UC2uoT9_KgHuBzoYX5JepHEA', videoId: '' },
  { name: 'Última Hora',     channelId: 'UCjrwumB0Pzw_PNNYGXD8Vbw', videoId: '' },
  { name: 'Paraguay TV',     channelId: 'UCWa_pUx7F5MWWoHfGtygaqg', videoId: '' },
];
// ================================

// Diseños: cantidad de pantallas → [columnas, filas]
const LAYOUTS = { 1: [1, 1], 2: [2, 1], 4: [2, 2], 6: [3, 2] };
const MAX_SLOTS = 6;
const STORAGE_KEY = 'tv-paraguay';

document.title = APP_NAME;

const grid = document.getElementById('grid');
const layoutsBar = document.getElementById('layouts');
const header = document.getElementById('header');
const players = [];
const layoutBtns = {};
let apiReady = false;
const params = 'autoplay=1&mute=1&controls=0&rel=0&playsinline=1&enablejsapi=1&origin=' + encodeURIComponent(location.origin);

// Lo elegido (diseño + canal de cada pantalla) se recuerda en este navegador
function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ layout, slots, custom })); } catch (e) {}
}

const saved = readState();
let layout = LAYOUTS[saved.layout] ? saved.layout : 4;
let expanded = -1; // índice del cuadro agrandado, -1 = ninguno
// Canal por pantalla (guardado por channelId); si ya no existe en CHANNELS, vuelve al de por defecto
const slots = Array.from({ length: MAX_SLOTS }, (_, i) => {
  const id = saved.slots && saved.slots[i];
  return CHANNELS.some(c => c.channelId === id) ? id : CHANNELS[i % CHANNELS.length].channelId;
});
const channelFor = i => CHANNELS.find(c => c.channelId === slots[i]);
// Video pegado a mano por pantalla; tiene prioridad sobre el canal hasta que se borra o se cambia de canal
const custom = Array.from({ length: MAX_SLOTS }, (_, i) => (saved.custom && saved.custom[i]) || '');

// Solo links de YouTube (youtube.com/watch?v=, /live/, /embed/, /shorts/ o youtu.be/); cualquier otro sitio se rechaza
function parseVideoId(text) {
  let url;
  try { url = new URL(text.trim()); } catch (e) { return ''; }
  const host = url.hostname.replace(/^(www\.|m\.)/, '');
  let id = '';
  if (host === 'youtu.be') id = url.pathname.slice(1);
  else if (host === 'youtube.com') id = url.searchParams.get('v') || (url.pathname.match(/^\/(?:live|embed|shorts)\/([^/]+)/) || [])[1] || '';
  return /^[\w-]{11}$/.test(id) ? id : '';
}

function pasteLink(i) {
  const current = custom[i] ? 'https://www.youtube.com/watch?v=' + custom[i] : '';
  const input = prompt('Pega el link de YouTube (vacío = volver al directo del canal):', current);
  if (input === null) return;
  const id = parseVideoId(input);
  if (input.trim() && !id) { alert('Solo se aceptan links de videos de YouTube (youtube.com o youtu.be).'); return; }
  custom[i] = id;
  saveState();
  load(i);
}

function addSlot(i) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  grid.append(cell);

  // Controles del cuadro, sobre el propio video: canal a la izquierda, botones a la derecha
  const key = document.createElement('span'); key.className = 'key'; key.textContent = i + 1;
  const select = document.createElement('select'); select.title = 'Elegir canal';
  CHANNELS.forEach(c => select.add(new Option(c.name, c.channelId)));
  select.value = slots[i];
  select.onchange = () => { slots[i] = select.value; custom[i] = ''; saveState(); load(i); select.blur(); };
  const muteBtn = document.createElement('button'); muteBtn.onclick = () => toggle(i);
  const reloadBtn = document.createElement('button'); reloadBtn.textContent = '↻'; reloadBtn.title = 'Recargar'; reloadBtn.onclick = () => load(i);
  const linkBtn = document.createElement('button'); linkBtn.textContent = '🔗'; linkBtn.title = 'Pegar link de YouTube'; linkBtn.onclick = () => pasteLink(i);
  const openBtn = document.createElement('button'); openBtn.textContent = '↗'; openBtn.title = 'Abrir en YouTube';
  openBtn.onclick = () => window.open(youtubeUrl(i), '_blank', 'noopener');
  const bigBtn = document.createElement('button'); bigBtn.textContent = '⛶'; bigBtn.title = 'Agrandar / volver (Esc)';
  bigBtn.onclick = () => toggleExpand(i);

  const left = document.createElement('div'); left.className = 'group';
  left.append(key, select);
  const right = document.createElement('div'); right.className = 'group';
  right.append(muteBtn, reloadBtn, linkBtn, openBtn, bigBtn);
  const tools = document.createElement('div'); tools.className = 'tools';
  tools.append(left, right);

  const screen = document.createElement('div'); screen.className = 'screen';
  cell.append(tools, screen);

  players[i] = { cell, screen, muteBtn, linkBtn, bigBtn, tools, muted: true, yt: null };
  load(i);
}

function removeLastSlot() {
  const p = players.pop();
  if (p.yt) { try { p.yt.destroy(); } catch (e) {} }
  p.cell.remove();
}

// Solo agrega o quita las pantallas que cambian; las demás siguen sin recargar
function setLayout(n) {
  layout = n;
  expanded = -1;
  while (players.length < n) addSlot(players.length);
  while (players.length > n) removeLastSlot();
  players.forEach((p, i) => { if (p.unloaded) load(i); });
  applyGrid();
  Object.entries(layoutBtns).forEach(([k, b]) => b.classList.toggle('on', Number(k) === n));
  saveState();
}

// Columnas/filas según el diseño, o un solo cuadro si hay uno agrandado
function applyGrid() {
  const [cols, rows] = expanded >= 0 ? [1, 1] : LAYOUTS[layout];
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  players.forEach((p, i) => {
    p.cell.classList.toggle('hide', expanded >= 0 && i !== expanded);
    p.bigBtn.classList.toggle('on', i === expanded);
  });
}

// Al agrandar se descargan los demás; al volver se recargan (en vivo, pero puede salir un anuncio)
function toggleExpand(i) {
  expanded = expanded === i ? -1 : i;
  players.forEach((p, j) => {
    if (j !== i && (expanded >= 0 || p.unloaded)) load(j);
  });
  applyGrid();
}

// Link de YouTube de lo que muestra el cuadro; si es el directo por canal, la página /live del canal
function youtubeUrl(i) {
  const ch = channelFor(i);
  const id = custom[i] || ch.videoId || (players[i].fallback ? ch.fallbackId : '');
  return id ? `https://www.youtube.com/watch?v=${id}` : `https://www.youtube.com/channel/${ch.channelId}/live`;
}

// Crea (o recrea) el iframe del cuadro; al recargar vuelve a empezar en mute
function load(i, useFallback = false) {
  const ch = channelFor(i);
  const p = players[i];
  if (p.yt) { try { p.yt.destroy(); } catch (e) {} p.yt = null; }
  p.screen.innerHTML = '';
  p.fallback = useFallback;
  p.muted = true;
  // Con un cuadro agrandado, los demás quedan vacíos (sin video ni consumo) hasta volver a la grilla
  p.unloaded = expanded >= 0 && i !== expanded;
  if (p.unloaded) { render(i); return; }

  const iframe = document.createElement('iframe');
  iframe.id = 'player' + i;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  const videoId = custom[i] || ch.videoId || (useFallback ? ch.fallbackId : '');
  iframe.src = videoId
    ? `https://www.youtube.com/embed/${videoId}?${params}`
    : `https://www.youtube.com/embed/live_stream?channel=${ch.channelId}&${params}`;

  const tag = document.createElement('div');
  tag.className = 'tag';
  tag.innerHTML = '<span class="dot"></span>';
  tag.append(ch.name);

  p.screen.append(iframe, tag);
  if (apiReady) attach(i);
  render(i);
}

// Engancha la API al iframe; si el directo por canal da error, reintenta una vez con el fallbackId
function attach(i) {
  players[i].yt = new YT.Player('player' + i, { events: { onError: () => {
    const p = players[i];
    const ch = channelFor(i);
    if (!p) return;
    if (!p.fallback && !custom[i] && !ch.videoId && ch.fallbackId) load(i, true);
    else showOffline(i);
  } } });
}

function showOffline(i) {
  const p = players[i];
  if (p.screen.querySelector('.offline')) return;
  const box = document.createElement('div');
  box.className = 'offline';
  box.innerHTML = '<div>No está transmitiendo</div><small>Prueba ↻ o pega un link con 🔗</small>';
  p.screen.append(box);
}

function render(i) {
  const p = players[i];
  p.muteBtn.textContent = p.muted ? '🔇' : '🔊';
  p.muteBtn.classList.toggle('on', !p.muted);
  p.cell.classList.toggle('audio', !p.muted);
  p.linkBtn.classList.toggle('on', !!custom[i]);
}

function toggle(i) {
  const p = players[i];
  if (!p.yt) return;
  p.muted ? p.yt.unMute() : p.yt.mute();
  p.muted = !p.muted;
  render(i);
}

Object.keys(LAYOUTS).forEach(k => {
  const b = document.createElement('button');
  b.textContent = k; b.title = `${k} pantalla${k === '1' ? '' : 's'}`;
  b.onclick = () => setLayout(Number(k));
  layoutBtns[k] = b;
  layoutsBar.append(b);
});
setLayout(layout);

document.getElementById('reloadAll').onclick = () => players.forEach((_, i) => load(i));

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'SELECT') return;
  if (e.key === 'h' || e.key === 'H') { header.classList.toggle('hidden'); return; }
  if (e.key === 'Escape' && expanded >= 0) { toggleExpand(expanded); return; }
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= players.length) toggle(n - 1);
});

// Reloj en hora de Paraguay, 24 h
const clock = document.getElementById('clock');
const fmt = new Intl.DateTimeFormat('es-PY', {
  timeZone: 'America/Asuncion', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
const tick = () => { clock.innerHTML = fmt.format(new Date()) + '<small>PY</small>'; };
tick();
setInterval(tick, 1000);

// La API de YouTube se engancha a los iframes para poder controlar el mute
window.onYouTubeIframeAPIReady = () => {
  apiReady = true;
  players.forEach((_, i) => attach(i));
};
const s = document.createElement('script');
s.src = 'https://www.youtube.com/iframe_api';
document.head.append(s);
