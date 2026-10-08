'use strict';
/* რიტმი — მუსიკის PWA: YouTube + აუდიო ლინკები + ლოკალური ფაილები, ფლეილისტები, ოფლაინ */

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = s => { if (!isFinite(s) || s < 0) s = 0; s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = String(s % 60).padStart(2, '0'); return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`; };
const hue = str => { let h = 0; for (const c of String(str)) h = (h * 31 + c.codePointAt(0)) % 360; return h; };
const plural = (n, w) => `${n} ${w}`;

const I = {
  play: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.6v12.8a1 1 0 0 0 1.52.85l10.2-6.4a1 1 0 0 0 0-1.7L9.52 4.75A1 1 0 0 0 8 5.6z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect fill="currentColor" x="6" y="5" width="4.2" height="14" rx="1.3"/><rect fill="currentColor" x="13.8" y="5" width="4.2" height="14" rx="1.3"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 6.3v11.4a1 1 0 0 0 1.55.83L15 13v4.5a1.2 1.2 0 0 0 2.4 0v-11a1.2 1.2 0 0 0-2.4 0V11L6.55 5.47A1 1 0 0 0 5 6.3z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" style="transform:scaleX(-1)"><path fill="currentColor" d="M5 6.3v11.4a1 1 0 0 0 1.55.83L15 13v4.5a1.2 1.2 0 0 0 2.4 0v-11a1.2 1.2 0 0 0-2.4 0V11L6.55 5.47A1 1 0 0 0 5 6.3z"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h4v4M4 20 20 4M20 16v4h-4M15 15l5 5M4 4l5 5"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
  repeat1: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><path d="M11 10h1v4"/></svg>',
  more: '<svg viewBox="0 0 24 24"><circle fill="currentColor" cx="5" cy="12" r="2"/><circle fill="currentColor" cx="12" cy="12" r="2"/><circle fill="currentColor" cx="19" cy="12" r="2"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  plusCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  library: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4v16M9 4v16M14 4.5l5.5 15"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg>',
  paste: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v9M8 12.5l4 4 4-4"/></svg>',
  saved: '<svg viewBox="0 0 24 24"><circle fill="currentColor" cx="12" cy="12" r="10"/><path d="M12 7v9M8 12.5l4 4 4-4" fill="none" stroke="#0f0b0d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
  expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>',
  vol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  remove: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  wifiOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M19 13a10 10 0 0 0-2-1.6M2 8.8a15 15 0 0 1 4.2-2.7M22 8.8A15 15 0 0 0 11 5"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>',
  note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
};
const ic = n => I[n] || '';
const paintIcons = (root = document) => $$('i[data-i]', root).forEach(el => { if (!el.dataset.done) { el.innerHTML = ic(el.dataset.i); el.dataset.done = 1; } });

/* ---------- state ---------- */
const KEY = 'ritmi:v1';
const S = Object.assign({ tracks: [], playlists: [], volume: 0.9, shuffle: false, repeat: 'off', queue: [], qi: -1 },
  (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })());
const save = () => {
  const { tracks, playlists, volume, shuffle, repeat, queue, qi } = S;
  try { localStorage.setItem(KEY, JSON.stringify({ tracks, playlists, volume, shuffle, repeat, queue, qi })); } catch (e) { toast('მეხსიერება გაივსო'); }
};
const T = id => S.tracks.find(t => t.id === id);
const P = id => S.playlists.find(p => p.id === id);
let view = { name: 'home' }, query = '', current = null, playing = false, engine = null, fullOpen = false;

/* ---------- IndexedDB (ოფლაინ აუდიო) ---------- */
const idb = (() => {
  let p;
  const open = () => p || (p = new Promise((res, rej) => {
    const r = indexedDB.open('ritmi', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('blobs');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const run = (mode, fn) => open().then(db => new Promise((res, rej) => {
    const tx = db.transaction('blobs', mode), req = fn(tx.objectStore('blobs'));
    tx.oncomplete = () => res(req.result); tx.onerror = () => rej(tx.error);
  }));
  return { get: k => run('readonly', s => s.get(k)), put: (k, v) => run('readwrite', s => s.put(v, k)), del: k => run('readwrite', s => s.delete(k)) };
})();
const AUDIO_CACHE = 'ritmi-audio';

/* ---------- toast ---------- */
let toastT;
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); }

/* ---------- link parsing + metadata ---------- */
function parseYt(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i);
  return m ? m[1] : null;
}
function tidy(title, author) {
  let t = String(title || '').replace(/\s*[\(\[]\s*(official|lyric|lyrics|audio|video|music video|hd|hq|4k|visuali[sz]er|clip|mv|m\/v)[^\)\]]*[\)\]]/gi, '').replace(/\s{2,}/g, ' ').trim();
  let a = String(author || '').replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim();
  const m = t.match(/^(.+?)\s+[-–—|]\s+(.+)$/);
  if (m) { a = m[1].trim(); t = m[2].trim(); }
  return { title: t || title, author: a };
}
async function getJSON(u, ms = 7000) {
  const c = new AbortController(); const to = setTimeout(() => c.abort(), ms);
  try { const r = await fetch(u, { signal: c.signal }); if (!r.ok) throw 0; return await r.json(); } finally { clearTimeout(to); }
}
async function ytMeta(id) {
  const watch = `https://www.youtube.com/watch?v=${id}`;
  const tries = [`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`, `https://noembed.com/embed?url=${encodeURIComponent(watch)}`];
  for (const u of tries) { try { const j = await getJSON(u); if (j && j.title) return j; } catch { } }
  return null;
}
function nameFromUrl(u) {
  try { const seg = decodeURIComponent(new URL(u).pathname.split('/').filter(Boolean).pop() || ''); return seg.replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[_+]+/g, ' ').trim(); } catch { return ''; }
}
const extractUrl = s => (String(s || '').match(/https?:\/\/[^\s]+/) || [])[0];

async function addLink(raw) {
  const url = extractUrl(raw) || String(raw || '').trim();
  if (!url) return toast('ჯერ ლინკი ჩასვი');
  let u; try { u = new URL(url); } catch { return toast('ეს ლინკს არ ჰგავს'); }
  const ytId = parseYt(url);
  const dup = S.tracks.find(t => (ytId && t.ytId === ytId) || (!ytId && t.src === url));
  if (dup) { S.tracks = [dup, ...S.tracks.filter(t => t !== dup)]; save(); render(); return toast('უკვე გქონდა, თავში ავწიე'); }

  let t;
  if (ytId) {
    t = { id: uid(), type: 'yt', ytId, src: `https://www.youtube.com/watch?v=${ytId}`, title: 'სახელს ვიღებ…', author: 'YouTube', thumb: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`, addedAt: Date.now(), loading: true };
  } else {
    const n = nameFromUrl(url);
    const tt = tidy(n || u.hostname, '');
    t = { id: uid(), type: 'audio', src: url, title: tt.title || 'აუდიო', author: tt.author || u.hostname.replace(/^www\./, ''), thumb: null, addedAt: Date.now() };
  }
  S.tracks.unshift(t); save();
  if (view.name !== 'home') go('home'); else render();
  flashRow(t.id);

  if (ytId) {
    const m = await ytMeta(ytId);
    delete t.loading;
    if (m) { const c = tidy(m.title, m.author_name); t.title = c.title; t.author = c.author || m.author_name || 'YouTube'; t.rawTitle = m.title; }
    else t.title = 'YouTube ვიდეო';
    save(); render(); renderPlayer();
    toast(m ? `დაემატა: ${t.title}` : 'დაემატა (სახელი ვერ წამოვიღე, შეგიძლია შეცვალო)');
  } else {
    probeAudio(t);
    toast(`დაემატა: ${t.title}`);
  }
}
function probeAudio(t) {
  const a = new Audio(); a.preload = 'metadata'; a.src = t.src;
  a.onloadedmetadata = () => { if (isFinite(a.duration)) { t.duration = a.duration; save(); render(); } a.src = ''; };
  a.onerror = () => { t.broken = true; save(); render(); };
}
async function addFiles(files) {
  let n = 0;
  for (const f of files) {
    if (!f.type.startsWith('audio') && !/\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|webm)$/i.test(f.name)) continue;
    const c = tidy(f.name.replace(/\.[a-z0-9]{2,5}$/i, '').replace(/_/g, ' '), '');
    const t = { id: uid(), type: 'file', src: null, title: c.title, author: c.author || 'ჩემი ფაილი', thumb: null, addedAt: Date.now(), offline: 'idb' };
    try { await idb.put(t.id, f); } catch { toast('ფაილი ვერ შევინახე'); continue; }
    const a = new Audio(); const url = URL.createObjectURL(f); a.preload = 'metadata'; a.src = url;
    a.onloadedmetadata = () => { t.duration = a.duration; URL.revokeObjectURL(url); save(); render(); };
    S.tracks.unshift(t); n++;
  }
  save(); go('home');
  toast(n ? `${n} ფაილი დაემატა, ოფლაინშიც უკრავს` : 'აუდიო ფაილი ვერ ვიპოვე');
}

/* ---------- offline save for audio links ---------- */
async function makeOffline(t) {
  if (t.type === 'yt') return toast('YouTube ტრეკის ჩამოტვირთვა ბრაუზერიდან შეუძლებელია');
  toast('ვინახავ ოფლაინისთვის…');
  try {
    const r = await fetch(t.src, { mode: 'cors' }); if (!r.ok) throw 0;
    const b = await r.blob(); await idb.put(t.id, b); t.offline = 'idb';
  } catch {
    try { const c = await caches.open(AUDIO_CACHE); await c.add(new Request(t.src, { mode: 'no-cors' })); t.offline = 'cache'; }
    catch { return toast('ამ საიტიდან შენახვა არ გამოვიდა'); }
  }
  save(); render(); toast('შენახულია, ოფლაინშიც უკრავს ✓');
}
async function dropOffline(t) {
  if (t.offline === 'idb') await idb.del(t.id).catch(() => { });
  if (t.offline === 'cache') { const c = await caches.open(AUDIO_CACHE); await c.delete(t.src); }
  delete t.offline; save(); render();
}
const playable = t => t && (t.type === 'yt' ? navigator.onLine : (t.offline || navigator.onLine));

/* ---------- playlists ---------- */
function createPlaylist(name, firstTrack) {
  const p = { id: uid(), name: name.trim() || 'ჩემი ფლეილისტი', tracks: firstTrack ? [firstTrack] : [], createdAt: Date.now() };
  S.playlists.push(p); save(); renderSide(); return p;
}
function toggleInPlaylist(pid, tid) {
  const p = P(pid); if (!p) return;
  if (p.tracks.includes(tid)) { p.tracks = p.tracks.filter(x => x !== tid); toast(`ამოღებულია: ${p.name}`); }
  else { p.tracks.push(tid); toast(`დაემატა: ${p.name}`); }
  save(); render();
}
function addToPlaylist(pid, tid) {
  const p = P(pid); if (!p) return;
  if (p.tracks.includes(tid)) return toast(`უკვე არის „${p.name}“-ში`);
  p.tracks.push(tid); save(); render(); toast(`დაემატა „${p.name}“-ში`);
}
async function deleteTrack(tid) {
  const t = T(tid); if (!t) return;
  if (t.offline) await dropOffline(t);
  S.tracks = S.tracks.filter(x => x.id !== tid);
  S.playlists.forEach(p => p.tracks = p.tracks.filter(x => x !== tid));
  const qi = S.queue.indexOf(tid);
  S.queue = S.queue.filter(x => x !== tid);
  if (current && current.id === tid) { stopAll(); current = null; S.qi = -1; }
  else if (qi > -1 && qi < S.qi) S.qi--;
  save(); render(); renderPlayer();
}

/* ---------- covers / art ---------- */
function art(t) {
  if (!t) return `<div class="gen" style="--h:340">${ic('note')}</div>`;
  if (t.thumb) return `<img src="${esc(t.thumb)}" alt="" loading="lazy" draggable="false">`;
  const ch = [...(t.title || '♪').trim()][0] || '♪';
  return `<div class="gen" style="--h:${hue(t.title)}">${esc(ch.toUpperCase())}</div>`;
}
function cover(p) {
  const ts = p.tracks.map(T).filter(Boolean);
  if (!ts.length) return `<div class="cov empty">${ic('note')}</div>`;
  if (ts.length < 4) return `<div class="cov">${art(ts[0])}</div>`;
  return `<div class="cov mosaic">${ts.slice(0, 4).map(art).join('')}</div>`;
}
const totalDur = ids => ids.map(T).filter(Boolean).reduce((s, t) => s + (t.duration || 0), 0);

/* ---------- rendering ---------- */
function rowHTML(t, ctx) {
  const on = current && current.id === t.id;
  const src = t.type === 'yt' ? '<span class="badge yt">YouTube</span>' : t.type === 'file' ? '<span class="badge">ფაილი</span>' : '<span class="badge">აუდიო</span>';
  return `<div class="row${on ? ' on' : ''}${playable(t) ? '' : ' dim'}" draggable="true" data-id="${t.id}" data-ctx="${ctx}">
    <div class="r-art">${art(t)}<div class="ov">${on ? (playing ? '<div class="eq"><span></span><span></span><span></span></div>' : ic('play')) : ic('play')}</div></div>
    <div class="r-meta"><div class="r-title">${esc(t.title)}</div><div class="r-sub">${src}<span>${esc(t.author || '')}</span></div></div>
    <div class="r-off" title="${t.offline ? 'ოფლაინშიც უკრავს' : ''}">${t.offline ? ic('saved') : ''}</div>
    <div class="r-dur">${t.duration ? fmt(t.duration) : ''}</div>
    <button class="icon-btn r-more" data-act="menu" data-id="${t.id}" title="მეტი">${ic('more')}</button>
  </div>`;
}
function greeting() { const h = new Date().getHours(); return h < 5 ? 'ღამე მშვიდობისა' : h < 12 ? 'დილა მშვიდობისა' : h < 18 ? 'გამარჯობა' : 'საღამო მშვიდობისა'; }
const netPill = () => navigator.onLine ? '' : `<span class="net off">${ic('wifiOff')} ოფლაინ რეჟიმი</span>`;

function renderHome() {
  const q = query.toLowerCase();
  const list = S.tracks.filter(t => !q || (t.title + ' ' + t.author).toLowerCase().includes(q));
  const pls = S.playlists;
  return `
  <section class="hero">
    <div class="greet">${greeting()} ${netPill()}</div>
    <h1>რას <em>მოვუსმინოთ</em> დღეს?</h1>
    <form class="adder" id="addForm" autocomplete="off">
      <i>${ic('link')}</i>
      <input id="addIn" type="url" inputmode="url" placeholder="ჩასვი YouTube ან აუდიოს ლინკი…" aria-label="ლინკი">
      <button type="submit">${ic('plus')}<span>დამატება</span></button>
    </form>
    <div class="adder-sub">
      <button class="chip" data-act="paste">${ic('paste')} ბუფერიდან ჩასმა</button>
      <button class="chip" data-act="pick-file">${ic('upload')} ფაილის ატვირთვა</button>
    </div>
    <p class="srcs">YouTube, YouTube Music, Shorts, ნებისმიერი mp3/m4a/ogg ლინკი ან ფაილი ტელეფონიდან</p>
  </section>
  ${pls.length ? `<section class="sec"><div class="sec-head"><h2>შენი ფლეილისტები</h2></div>
    <div class="shelf">${pls.map(p => `<div class="pl-card" data-act="open-pl" data-pid="${p.id}">${cover(p)}<h3>${esc(p.name)}</h3><p>${plural(p.tracks.length, 'სიმღერა')}</p>
      <button class="play-btn accent" data-act="play-pl" data-pid="${p.id}" title="დაკვრა">${ic('play')}</button></div>`).join('')}
      <div class="pl-card new" data-act="new-pl">${ic('plus')}ახალი ფლეილისტი</div></div></section>` : ''}
  <section class="sec">
    <div class="sec-head"><div><h2>ბოლოს დამატებული</h2><div class="sub">${S.tracks.length ? plural(S.tracks.length, 'სიმღერა') + '<span class="hint"> · ⋯ ღილაკით ან გადათრევით გადაიტანე ფლეილისტში</span>' : ''}</div></div>
      ${S.tracks.length > 4 ? `<label class="search">${ic('search')}<input id="searchIn" placeholder="ძებნა" value="${esc(query)}"></label>` : ''}</div>
    ${S.tracks.length ? `<div class="tlist">${list.map(t => rowHTML(t, 'recent')).join('') || '<p class="sh-note">ვერაფერი ვიპოვე</p>'}</div>` :
      `<div class="empty-state"><div class="disc"></div><h3>აქ ჯერ ჩუმადაა</h3><p>ჩასვი პირველი ლინკი ზემოთ და აქ გამოჩნდება</p></div>`}
  </section>`;
}
function renderPlaylist(p) {
  if (!p) { view = { name: 'home' }; return renderHome(); }
  const ts = p.tracks.map(T).filter(Boolean);
  const first = ts[0];
  return `
  <section class="pl-hero" style="--h:${first ? hue(first.title) : 340}">
    <button class="icon-btn back-btn" data-act="nav" data-view="library">${ic('back')}</button>
    ${cover(p)}
    <div><div class="kicker">ფლეილისტი</div><h1>${esc(p.name)}</h1>
    <div class="stats">${plural(ts.length, 'სიმღერა')}${totalDur(p.tracks) ? ' · ' + fmt(totalDur(p.tracks)) : ''}</div></div>
  </section>
  <div class="pl-actions">
    <button class="play-btn accent xl" data-act="play-pl" data-pid="${p.id}" ${ts.length ? '' : 'disabled'}>${ic('play')}</button>
    <button class="icon-btn" data-act="shuffle-pl" data-pid="${p.id}" title="არეულად დაკვრა">${ic('shuffle')}</button>
    <button class="icon-btn" data-act="rename-pl" data-pid="${p.id}" title="სახელის შეცვლა">${ic('edit')}</button>
    <button class="icon-btn" data-act="del-pl" data-pid="${p.id}" title="წაშლა">${ic('trash')}</button>
  </div>
  <section class="sec">
    ${ts.length ? `<div class="tlist" data-reorder="${p.id}">${ts.map(t => rowHTML(t, 'pl:' + p.id)).join('')}</div>` :
      `<div class="empty-state"><div class="disc"></div><h3>ცარიელი ფლეილისტი</h3><p>„ბოლოს დამატებულიდან“ ⋯ ღილაკით დაამატე სიმღერები</p></div>`}
  </section>`;
}
function renderLibrary() {
  return `<section class="hero" style="padding-bottom:20px"><div class="greet">${netPill()}</div><h1>ბიბლიოთეკა</h1></section>
  <section class="sec"><div class="shelf">
    <div class="pl-card" data-act="nav" data-view="home"><div class="cov"><div class="gen" style="--h:340">${ic('note')}</div></div><h3>ბოლოს დამატებული</h3><p>${plural(S.tracks.length, 'სიმღერა')}</p></div>
    ${S.playlists.map(p => `<div class="pl-card" data-act="open-pl" data-pid="${p.id}">${cover(p)}<h3>${esc(p.name)}</h3><p>${plural(p.tracks.length, 'სიმღერა')}</p></div>`).join('')}
    <div class="pl-card new" data-act="new-pl">${ic('plus')}ახალი ფლეილისტი</div>
  </div></section>`;
}
function renderSide() {
  const ul = $('#sidePl');
  ul.innerHTML = S.playlists.length ? S.playlists.map(p => `<li data-act="open-pl" data-pid="${p.id}" data-drop="${p.id}" class="${view.name === 'pl' && view.id === p.id ? 'on' : ''}">
    ${cover(p)}<div class="meta"><div class="nm">${esc(p.name)}</div><div class="ct">${plural(p.tracks.length, 'სიმღერა')}</div></div></li>`).join('')
    : `<li class="side-empty" data-act="new-pl">${ic('plus')} შექმენი პირველი ფლეილისტი</li>`;
  $$('.nav-btn[data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === view.name));
  $$('.tab[data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === view.name || (view.name === 'pl' && b.dataset.view === 'library')));
}
function render() {
  const main = $('#main');
  const focused = document.activeElement && document.activeElement.id;
  const caret = focused === 'searchIn' ? document.activeElement.selectionStart : null;
  const addVal = $('#addIn')?.value || '';
  main.innerHTML = view.name === 'pl' ? renderPlaylist(P(view.id)) : view.name === 'library' ? renderLibrary() : renderHome();
  if ($('#addIn')) $('#addIn').value = addVal;
  if (focused === 'searchIn' && $('#searchIn')) { const s = $('#searchIn'); s.focus(); s.setSelectionRange(caret, caret); }
  renderSide();
}
function go(name, id) { view = { name, id }; query = ''; render(); $('#main').scrollTop = 0; }
function flashRow(id) { requestAnimationFrame(() => { const r = $(`.row[data-id="${id}"]`); if (r) r.animate([{ background: 'rgba(255,61,110,.28)' }, { background: 'transparent' }], { duration: 1400, easing: 'ease-out' }); }); }
function markRows() {
  $$('.row').forEach(r => {
    const on = current && r.dataset.id === current.id;
    r.classList.toggle('on', on);
    const ov = $('.ov', r); if (ov) ov.innerHTML = on && playing ? '<div class="eq"><span></span><span></span><span></span></div>' : ic('play');
  });
}

/* ---------- sheets / dialogs ---------- */
function openSheet(html) { $('#sheetPanel').innerHTML = html; $('#sheet').classList.add('open'); $('#sheet').setAttribute('aria-hidden', 'false'); }
function closeSheet() { $('#sheet').classList.remove('open'); $('#sheet').setAttribute('aria-hidden', 'true'); }
function promptDlg({ title, value = '', placeholder = '', ok = 'შენახვა' }) {
  return new Promise(res => {
    openSheet(`<form class="dlg" id="dlgF"><h3>${esc(title)}</h3><input id="dlgIn" value="${esc(value)}" placeholder="${esc(placeholder)}" maxlength="120">
      <div class="dlg-btns"><button type="button" class="btn ghost" id="dlgNo">გაუქმება</button><button class="btn pri">${esc(ok)}</button></div></form>`);
    const inp = $('#dlgIn'); setTimeout(() => { inp.focus(); inp.select(); }, 60);
    $('#dlgF').onsubmit = e => { e.preventDefault(); const v = inp.value.trim(); closeSheet(); res(v || null); };
    $('#dlgNo').onclick = () => { closeSheet(); res(null); };
    sheetCancel = () => res(null);
  });
}
function confirmDlg(title, text, ok = 'წაშლა') {
  return new Promise(res => {
    openSheet(`<div class="dlg"><h3>${esc(title)}</h3><p>${esc(text)}</p><div class="dlg-btns"><button class="btn ghost" id="cNo">გაუქმება</button><button class="btn warn" id="cYes">${esc(ok)}</button></div></div>`);
    $('#cNo').onclick = () => { closeSheet(); res(false); };
    $('#cYes').onclick = () => { closeSheet(); res(true); };
    sheetCancel = () => res(false);
  });
}
let sheetCancel = null;

function trackMenu(tid) {
  const t = T(tid); if (!t) return;
  const inPl = view.name === 'pl' ? P(view.id) : null;
  openSheet(`
    <div class="sh-head"><div class="r-art">${art(t)}</div><div><h3>${esc(t.title)}</h3><p>${esc(t.author || '')}</p></div></div>
    <div class="sh-label">ფლეილისტში დამატება</div>
    ${S.playlists.map(p => `<button class="sh-item" data-act="toggle-pl" data-pid="${p.id}" data-id="${t.id}">${cover(p)}<span>${esc(p.name)}</span><span class="chk">${p.tracks.includes(t.id) ? ic('check') : ''}</span></button>`).join('')}
    <button class="sh-item" data-act="new-pl-with" data-id="${t.id}">${ic('plus')}<span>ახალი ფლეილისტი</span></button>
    <div class="sh-label">სიმღერა</div>
    <button class="sh-item" data-act="play-next" data-id="${t.id}">${ic('next')}<span>შემდეგად დაკვრა</span></button>
    <button class="sh-item" data-act="rename" data-id="${t.id}">${ic('edit')}<span>სახელის შეცვლა</span></button>
    ${t.type === 'audio' ? (t.offline ? `<button class="sh-item" data-act="unsave" data-id="${t.id}">${ic('saved')}<span>ოფლაინიდან წაშლა</span></button>`
      : `<button class="sh-item" data-act="save-off" data-id="${t.id}">${ic('download')}<span>ოფლაინისთვის შენახვა</span></button>`) : ''}
    ${t.type === 'yt' ? `<div class="sh-note">YouTube-ის სიმღერები ინტერნეტით უკრავს. ოფლაინისთვის ატვირთე ფაილი ან აუდიო ლინკი.</div>` : ''}
    ${t.src ? `<a class="sh-item" href="${esc(t.src)}" target="_blank" rel="noopener">${ic('ext')}<span>წყაროს გახსნა</span></a>` : ''}
    ${inPl ? `<button class="sh-item" data-act="rm-from-pl" data-pid="${inPl.id}" data-id="${t.id}">${ic('remove')}<span>ამ ფლეილისტიდან ამოღება</span></button>` : ''}
    <button class="sh-item danger" data-act="del-track" data-id="${t.id}">${ic('trash')}<span>სულ წაშლა</span></button>`);
}

/* ---------- playback engines ---------- */
const audio = $('#audio');
let yt = null, ytReady = false, ytPending = null, ytApiLoading = false, blobUrl = null;
function ensureYt() {
  if (yt || ytApiLoading || !navigator.onLine) return;
  ytApiLoading = true;
  const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api';
  s.onerror = () => { ytApiLoading = false; s.remove(); };
  document.head.appendChild(s);
}
window.onYouTubeIframeAPIReady = () => {
  yt = new YT.Player('yt', {
    width: '100%', height: '100%',
    playerVars: { playsinline: 1, controls: 0, disablekb: 1, rel: 0, modestbranding: 1, iv_load_policy: 3, fs: 0, origin: location.origin },
    events: {
      onReady() { ytReady = true; yt.setVolume(Math.round(S.volume * 100)); if (ytPending) { const id = ytPending; ytPending = null; yt.loadVideoById(id); } },
      onStateChange(e) {
        if (engine !== 'yt') return;
        if (e.data === YT.PlayerState.ENDED) return onEnded();
        if (e.data === YT.PlayerState.PLAYING) setPlaying(true);
        else if (e.data === YT.PlayerState.PAUSED) setPlaying(false);
        if (e.data === YT.PlayerState.PLAYING && current && !current.duration) { const d = yt.getDuration(); if (d) { current.duration = d; save(); } }
      },
      onError() { if (engine !== 'yt') return; toast('ამ ვიდეოს ავტორმა ჩაშენება აკრძალა, გადავდივარ შემდეგზე'); setTimeout(() => next(true), 1200); }
    }
  });
};
function stopAll() {
  try { audio.pause(); } catch { }
  if (yt && ytReady) try { yt.stopVideo(); } catch { }
  setPlaying(false);
}
function setPlaying(v) { playing = v; updatePlayUI(); markRows(); if ('mediaSession' in navigator) navigator.mediaSession.playbackState = v ? 'playing' : 'paused'; }
async function playAt(i, tries = 0) {
  const id = S.queue[i]; const t = T(id);
  if (!t) return;
  if (!playable(t)) {
    if (tries >= S.queue.length) { toast('ოფლაინში დასაკრავი სიმღერა ამ სიაში არ არის'); return; }
    if (tries === 0) toast('ოფლაინში ეს ვერ დაუკრავს, გამოვტოვე');
    return playAt((i + 1) % S.queue.length, tries + 1);
  }
  S.qi = i; save();
  const prevEngine = engine;
  current = t;
  if (t.type === 'yt') {
    try { audio.pause(); } catch { }
    engine = 'yt';
    ensureYt();
    if (ytReady) yt.loadVideoById(t.ytId); else ytPending = t.ytId;
    setPlaying(true);
  } else {
    if (prevEngine === 'yt' && yt && ytReady) try { yt.stopVideo(); } catch { }
    engine = 'audio';
    let src = t.src;
    if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
    if (t.offline === 'idb') { const b = await idb.get(t.id).catch(() => null); if (b) src = blobUrl = URL.createObjectURL(b); else delete t.offline; }
    if (!src) { toast('ფაილი აღარ არსებობს'); return; }
    audio.src = src; audio.volume = S.volume;
    try { await audio.play(); } catch (e) { if (e.name !== 'AbortError') toast('ვერ ჩაირთო, სცადე ხელახლა'); }
  }
  renderPlayer(); markRows(); mediaMeta(t);
}
function playFrom(ids, id, shuffle) {
  if (current && current.id === id && S.queue.join() === ids.join()) return togglePlay();
  S.queue = ids.slice();
  if (shuffle) { S.shuffle = true; updatePlayUI(); }
  const i = id ? S.queue.indexOf(id) : (shuffle ? Math.floor(Math.random() * S.queue.length) : 0);
  playAt(Math.max(0, i));
}
function togglePlay() {
  if (!current) { if (S.tracks.length) playFrom(S.tracks.map(t => t.id), S.tracks[0].id); else { focusAdd(); toast('ჯერ დაამატე სიმღერა'); } return; }
  if (engine === 'yt') { if (!ytReady) return; const st = yt.getPlayerState(); if (st === 1 || st === 3) { yt.pauseVideo(); setPlaying(false); } else { yt.playVideo(); setPlaying(true); } }
  else { if (!audio.src) return playAt(S.qi); audio.paused ? audio.play().catch(() => { }) : audio.pause(); }
}
function next(auto = false) {
  if (!S.queue.length) return;
  let i;
  if (S.shuffle && S.queue.length > 1) { do { i = Math.floor(Math.random() * S.queue.length); } while (i === S.qi); }
  else { i = S.qi + 1; if (i >= S.queue.length) { if (S.repeat === 'all' || !auto) i = 0; else { setPlaying(false); seekTo(0); return; } } }
  playAt(i);
}
function prev() { if (curTime() > 3) return seekTo(0); let i = S.qi - 1; if (i < 0) i = S.queue.length - 1; playAt(i); }
function onEnded() { if (S.repeat === 'one') { seekTo(0); engine === 'yt' ? yt.playVideo() : audio.play(); } else next(true); }
const curTime = () => engine === 'yt' && ytReady ? (yt.getCurrentTime?.() || 0) : audio.currentTime || 0;
const curDur = () => engine === 'yt' && ytReady ? (yt.getDuration?.() || current?.duration || 0) : (isFinite(audio.duration) ? audio.duration : current?.duration || 0);
function seekTo(sec) { if (engine === 'yt' && ytReady) yt.seekTo(sec, true); else if (engine === 'audio') audio.currentTime = sec; }
function setVolume(v) { S.volume = v; audio.volume = v; if (yt && ytReady) yt.setVolume(Math.round(v * 100)); save(); paintRange($('#vol'), v); }

audio.addEventListener('play', () => engine === 'audio' && setPlaying(true));
audio.addEventListener('pause', () => engine === 'audio' && setPlaying(false));
audio.addEventListener('ended', () => engine === 'audio' && onEnded());
audio.addEventListener('loadedmetadata', () => { if (current && current.type !== 'yt' && isFinite(audio.duration)) { current.duration = audio.duration; save(); } });
audio.addEventListener('error', () => { if (engine === 'audio' && audio.src) { toast('ეს ლინკი ვერ ითამაშა, შემდეგზე გადავდივარ'); setTimeout(() => next(true), 1200); } });

/* ---------- media session (lock screen) ---------- */
function mediaMeta(t) {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: t.title, artist: t.author || '', album: 'რიტმი',
    artwork: t.thumb ? [{ src: t.thumb, sizes: '480x360', type: 'image/jpeg' }] : [{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }]
  });
}
if ('mediaSession' in navigator) {
  const ms = navigator.mediaSession;
  const h = { play: () => togglePlay(), pause: () => togglePlay(), nexttrack: () => next(), previoustrack: () => prev(), seekto: d => seekTo(d.seekTime) };
  for (const k in h) try { ms.setActionHandler(k, h[k]); } catch { }
}

/* ---------- player UI ---------- */
function paintRange(el, frac) { if (el) { el.style.setProperty('--p', (Math.min(1, Math.max(0, frac)) * 100) + '%'); if (el.id === 'vol') el.value = Math.round(frac * 100); } }
function renderPlayer() {
  const t = current;
  $('#player').classList.toggle('empty', !t);
  $('#pArt').innerHTML = t ? art(t) : art(null);
  $('#pTitle').textContent = t ? t.title : 'არაფერი უკრავს';
  $('#pSub').textContent = t ? (t.author || '') : 'დაამატე ლინკი და დავიწყოთ';
  $('#fullArt').innerHTML = t ? art(t) : art(null);
  $('#fullBg').innerHTML = t ? art(t) : '';
  $('#fTitle').textContent = t ? t.title : 'არაფერი უკრავს';
  $('#fSub').textContent = t ? (t.author || '') : '';
  $('#fNote').textContent = t && t.type === 'yt' ? 'YouTube ტრეკი: ტელეფონზე ეკრანის ჩაქრობისას შეიძლება გაჩერდეს. ფონური მოსმენისთვის აუდიო ფაილი ჯობია.' : t && t.offline ? 'შენახულია მოწყობილობაზე, ინტერნეტის გარეშეც უკრავს.' : '';
  $('#full').classList.toggle('is-yt', !!t && t.type === 'yt');
  document.title = t ? `${t.title} · რიტმი` : 'რიტმი';
  placeYt();
}
function updatePlayUI() {
  const ico = ic(playing ? 'pause' : 'play');
  ['#bPlay', '#bPlayMini', '#fPlay'].forEach(s => { $(s).innerHTML = ico; });
  ['#bShuffle', '#fShuffle'].forEach(s => $(s).classList.toggle('on', S.shuffle));
  ['#bRepeat', '#fRepeat'].forEach(s => { const b = $(s); b.classList.toggle('on', S.repeat !== 'off'); b.innerHTML = ic(S.repeat === 'one' ? 'repeat1' : 'repeat'); b.title = S.repeat === 'one' ? 'ერთის გამეორება' : S.repeat === 'all' ? 'ყველას გამეორება' : 'გამეორება'; });
  $('#full').classList.toggle('paused', !playing);
  document.body.classList.toggle('paused', !playing);
}
let seeking = false;
function tick() {
  if (!current || seeking) return;
  const c = curTime(), d = curDur(), f = d ? c / d : 0;
  $('#tCur').textContent = $('#fCur').textContent = fmt(c);
  $('#tDur').textContent = $('#fDur').textContent = fmt(d);
  $('#seek').value = $('#fseek').value = Math.round(f * 1000);
  paintRange($('#seek'), f); paintRange($('#fseek'), f);
  $('#miniProg').style.width = (f * 100) + '%';
  if ('mediaSession' in navigator && d && navigator.mediaSession.setPositionState) try { navigator.mediaSession.setPositionState({ duration: d, position: Math.min(c, d), playbackRate: 1 }); } catch { }
}
setInterval(tick, 300);
['#seek', '#fseek'].forEach(s => {
  const el = $(s);
  el.addEventListener('input', () => { seeking = true; const f = el.value / 1000; paintRange(el, f); const tx = fmt(f * curDur()); $('#tCur').textContent = $('#fCur').textContent = tx; });
  el.addEventListener('change', () => { seekTo(el.value / 1000 * curDur()); seeking = false; });
});
$('#vol').addEventListener('input', e => setVolume(e.target.value / 100));

function placeYt() {
  const host = $('#ytHost');
  if (fullOpen && engine === 'yt' && current && current.type === 'yt') {
    const r = $('#fullArt').getBoundingClientRect();
    Object.assign(host.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', bottom: 'auto' });
    host.classList.add('show');
  } else { host.classList.remove('show'); host.removeAttribute('style'); }
}
function openFull() { if (!current) return; fullOpen = true; $('#full').classList.add('open'); $('#full').setAttribute('aria-hidden', 'false'); setTimeout(placeYt, 460); }
function closeFull() { fullOpen = false; placeYt(); $('#full').classList.remove('open'); $('#full').setAttribute('aria-hidden', 'true'); }
addEventListener('resize', () => fullOpen && placeYt());
function focusAdd() { if (view.name !== 'home') go('home'); setTimeout(() => { const i = $('#addIn'); if (i) { $('#main').scrollTop = 0; i.focus(); } }, 30); }

/* ---------- events ---------- */
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act]'); if (!el) {
    const row = e.target.closest('.row');
    if (row) { const ctx = row.dataset.ctx; const ids = ctx === 'recent' ? visibleRecent() : P(ctx.slice(3))?.tracks || []; playFrom(ids, row.dataset.id); }
    return;
  }
  const a = el.dataset.act, id = el.dataset.id, pid = el.dataset.pid;
  if (el.tagName === 'A' && a === 'nav') e.preventDefault();
  switch (a) {
    case 'nav': closeFull(); go(el.dataset.view); break;
    case 'focus-add': closeFull(); focusAdd(); break;
    case 'paste':
      try { const txt = await navigator.clipboard.readText(); if (txt) addLink(txt); else toast('ბუფერი ცარიელია'); }
      catch { toast('ბრაუზერმა ბუფერზე წვდომა არ მისცა, ჩასვი ხელით'); focusAdd(); } break;
    case 'pick-file': $('#fileIn').click(); break;
    case 'open-pl': e.stopPropagation(); if (e.target.closest('[data-act="play-pl"]')) break; go('pl', pid); break;
    case 'play-pl': { e.stopPropagation(); const p = P(pid); if (p && p.tracks.length) playFrom(p.tracks, null); break; }
    case 'shuffle-pl': { const p = P(pid); if (p && p.tracks.length) playFrom(p.tracks, null, true); break; }
    case 'new-pl': { const n = await promptDlg({ title: 'ახალი ფლეილისტი', placeholder: 'მაგ: გზაში მოსასმენი', ok: 'შექმნა' }); if (n) { const p = createPlaylist(n); go('pl', p.id); } break; }
    case 'new-pl-with': { const n = await promptDlg({ title: 'ახალი ფლეილისტი', placeholder: 'სახელი', ok: 'შექმნა' }); if (n) { createPlaylist(n, id); render(); toast(`შეიქმნა „${n}“ და სიმღერა ჩაემატა`); } break; }
    case 'rename-pl': { const p = P(pid); const n = await promptDlg({ title: 'სახელის შეცვლა', value: p.name }); if (n) { p.name = n; save(); render(); } break; }
    case 'del-pl': { const p = P(pid); if (await confirmDlg(`წავშალო „${p.name}“?`, 'სიმღერები ბიბლიოთეკაში დარჩება.')) { S.playlists = S.playlists.filter(x => x !== p); save(); go('library'); toast('ფლეილისტი წაიშალა'); } break; }
    case 'menu': e.stopPropagation(); trackMenu(id); break;
    case 'cur-menu': if (current) trackMenu(current.id); break;
    case 'toggle-pl': toggleInPlaylist(pid, id); trackMenu(id); break;
    case 'rm-from-pl': { const p = P(pid); p.tracks = p.tracks.filter(x => x !== id); save(); closeSheet(); render(); toast('ამოღებულია'); break; }
    case 'play-next': { closeSheet(); if (!current) { playFrom([id], id); break; } S.queue = S.queue.filter(x => x !== id); const qi = S.queue.indexOf(current.id); S.queue.splice(qi + 1, 0, id); S.qi = qi; save(); toast('შემდეგი ეს იქნება'); break; }
    case 'rename': { const t = T(id); const n = await promptDlg({ title: 'სიმღერის სახელი', value: t.title }); if (n) { t.title = n; save(); render(); renderPlayer(); } break; }
    case 'save-off': closeSheet(); makeOffline(T(id)); break;
    case 'unsave': closeSheet(); await dropOffline(T(id)); toast('ოფლაინ ასლი წაიშალა'); break;
    case 'del-track': { const t = T(id); if (await confirmDlg('სულ წავშალო?', `„${t.title}“ წაიშლება ყველა ფლეილისტიდანაც.`)) { await deleteTrack(id); toast('წაიშალა'); } break; }
    case 'close-sheet': closeSheet(); if (sheetCancel) { sheetCancel(); sheetCancel = null; } break;
    case 'toggle': e.stopPropagation(); togglePlay(); break;
    case 'next': next(); break;
    case 'prev': prev(); break;
    case 'shuffle': S.shuffle = !S.shuffle; save(); updatePlayUI(); toast(S.shuffle ? 'არეულად' : 'რიგით'); break;
    case 'repeat': S.repeat = { off: 'all', all: 'one', one: 'off' }[S.repeat]; save(); updatePlayUI(); toast({ off: 'გამეორება გამორთულია', all: 'ყველას გამეორება', one: 'ერთის გამეორება' }[S.repeat]); break;
    case 'open-full': if (e.target.closest('.mini-play')) break; openFull(); break;
    case 'close-full': closeFull(); break;
  }
});
const visibleRecent = () => { const q = query.toLowerCase(); return S.tracks.filter(t => !q || (t.title + ' ' + t.author).toLowerCase().includes(q)).map(t => t.id); };
document.addEventListener('submit', e => { if (e.target.id === 'addForm') { e.preventDefault(); const i = $('#addIn'); const v = i.value; i.value = ''; addLink(v); } });
document.addEventListener('input', e => { if (e.target.id === 'searchIn') { query = e.target.value; render(); } });
document.addEventListener('paste', e => { if (e.target.id === 'addIn') { const txt = e.clipboardData.getData('text'); if (extractUrl(txt)) { e.preventDefault(); e.target.value = ''; addLink(txt); } } });
$('#fileIn').addEventListener('change', e => { if (e.target.files.length) addFiles([...e.target.files]); e.target.value = ''; });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($('#sheet').classList.contains('open')) { closeSheet(); sheetCancel && sheetCancel(); sheetCancel = null; } else if (fullOpen) closeFull(); }
  if (e.target.matches('input')) return;
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
  if (e.key === 'ArrowRight' && e.shiftKey) next();
  if (e.key === 'ArrowLeft' && e.shiftKey) prev();
});

/* drag & drop: recent → sidebar playlist, reorder inside playlist */
let dragId = null;
document.addEventListener('dragstart', e => { const r = e.target.closest?.('.row'); if (!r) return; dragId = r.dataset.id; r.classList.add('dragging'); e.dataTransfer.effectAllowed = 'copyMove'; e.dataTransfer.setData('text/plain', dragId); });
document.addEventListener('dragend', () => { $$('.dragging,.drop,.drop-before').forEach(x => x.classList.remove('dragging', 'drop', 'drop-before')); dragId = null; });
document.addEventListener('dragover', e => {
  if (!dragId) return;
  const li = e.target.closest('[data-drop]'); const row = e.target.closest('[data-reorder] .row');
  $$('.drop,.drop-before').forEach(x => x.classList.remove('drop', 'drop-before'));
  if (li) { e.preventDefault(); li.classList.add('drop'); }
  else if (row && row.dataset.id !== dragId) { e.preventDefault(); row.classList.add('drop-before'); }
});
document.addEventListener('drop', e => {
  if (!dragId) return;
  const li = e.target.closest('[data-drop]'); const row = e.target.closest('[data-reorder] .row');
  if (li) { e.preventDefault(); addToPlaylist(li.dataset.drop, dragId); }
  else if (row) {
    e.preventDefault(); const p = P(row.closest('[data-reorder]').dataset.reorder);
    if (p && p.tracks.includes(dragId)) { p.tracks = p.tracks.filter(x => x !== dragId); p.tracks.splice(p.tracks.indexOf(row.dataset.id), 0, dragId); save(); render(); }
  }
});

/* online / offline */
function netChange() { document.body.classList.toggle('is-offline', !navigator.onLine); render(); if (navigator.onLine) ensureYt(); toast(navigator.onLine ? 'ინტერნეტი დაბრუნდა' : 'ოფლაინ ხარ: შენახული სიმღერები ისევ უკრავს'); }
addEventListener('online', netChange); addEventListener('offline', netChange);

/* ---------- boot ---------- */
(function boot() {
  paintIcons();
  // Share Target (ტელეფონზე YouTube-იდან „გაზიარება → რიტმი“)
  const sp = new URLSearchParams(location.search);
  const shared = extractUrl(sp.get('url')) || extractUrl(sp.get('text')) || extractUrl(sp.get('title'));
  if (shared) history.replaceState(null, '', location.pathname);
  render();
  paintRange($('#vol'), S.volume); audio.volume = S.volume;
  if (S.qi > -1 && T(S.queue[S.qi])) { current = T(S.queue[S.qi]); engine = current.type === 'yt' ? 'yt' : 'audio'; if (engine === 'yt') ytPendingRestore(); else restoreAudio(); }
  renderPlayer(); updatePlayUI();
  if (S.tracks.some(t => t.type === 'yt')) ensureYt();
  if (shared) addLink(shared);
  if (navigator.storage?.persist) navigator.storage.persist().catch(() => { });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW', err));
})();
let ytCue = null;
function ytPendingRestore() { engine = 'yt'; ytCue = current.ytId; }
async function restoreAudio() {
  let src = current.src;
  if (current.offline === 'idb') { const b = await idb.get(current.id).catch(() => null); if (b) src = blobUrl = URL.createObjectURL(b); }
  if (src) { audio.src = src; audio.preload = 'metadata'; }
}
// YouTube ბოლოს დაკრულის „მომზადება“ რომ play ღილაკმა პირდაპირ იმუშაოს
const _ytReadyWait = setInterval(() => { if (ytReady) { clearInterval(_ytReadyWait); if (ytCue && engine === 'yt') { try { yt.cueVideoById(ytCue); } catch { } ytCue = null; } } }, 400);
