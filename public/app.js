'use strict';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
const $ = s => document.querySelector(s);
const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const { N, tcase, WN, D, SL } = L;
const S = { user: null, token: localStorage.tto_token || '', app: null, tab: 'terms', f: { q: '', st: 'all', who: 'all', cat: 'all' }, mode: 'in', log: '', adm: { list: [], set: null, view: 'list', rows: [], q: '', st: 'all', cls: 'all', kind: 'all', res: 'all', miss: false, incMin: '', incMax: '', pcMax: '', house: 'all', car: 'all', sibMin: '', gnoMin: '', dead: false, away: false, dis: false, sort: 'rank', dir: 1, sel: null } };
let F, A;

/* ---------- yardımcılar ---------- */
const toast = m => { const t = $('#tt'); t.textContent = m; t.classList.remove('hidden'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add('hidden'), 3200); };
async function api(p, o = {}) {
  const r = await fetch(p, { method: o.method || 'GET', headers: Object.assign(S.token ? { Authorization: 'Bearer ' + S.token } : {}, o.json ? { 'Content-Type': 'application/json' } : {}, o.headers || {}), body: o.json ? JSON.stringify(o.json) : o.body });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && S.user) { S.user = null; S.token = ''; localStorage.removeItem('tto_token'); render(); toast('Oturum süresi doldu'); }
  if (!r.ok) throw new Error(d.error || 'Sunucu hatası (' + r.status + ')');
  return d;
}
let st;
function save() { clearTimeout(st); st = setTimeout(flushSave, 500); }
async function flushSave() { if (!A) return; try { await api('/api/app', { method: 'PUT', json: { F, docs: A.docs, terms: A.terms } }); } catch (e) { toast('Kaydedilemedi: ' + e.message); } }
const stBadge = s => ({ Taslak: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', Beklemede: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', 'Eksik belge': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', Onaylandı: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', Reddedildi: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }[s] || 'bg-gray-100 text-gray-700');
const dcls = { ok: 'text-green-600 dark:text-green-400', warn: 'text-orange-600 dark:text-orange-400', bad: 'text-red-600 dark:text-red-400' };
const dico = { ok: 'check_circle', warn: 'warning', bad: 'cancel' };

/* ---------- tema / oturum ---------- */
function toggleTheme() { const d = document.documentElement.classList.toggle('dark'); localStorage.theme = d ? 'dark' : 'light'; themeIcon(); }
function themeIcon() { $('#themeIcon').textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode'; }
function home() { render(); }
async function logout() { try { await flushSave(); await api('/api/logout', { method: 'POST' }); } catch (e) {} S.user = null; S.token = ''; A = F = null; localStorage.removeItem('tto_token'); S.mode = 'in'; render(); }
async function boot() {
  themeIcon();
  if (S.token) { try { const d = await api('/api/me'); setUser(d); } catch (e) { S.token = ''; localStorage.removeItem('tto_token'); } }
  render();
  setTimeout(() => { const s = $('#splash'); s.classList.add('out'); setTimeout(() => s.remove(), 700); }, 1100);
}
function setUser(d) { S.user = d.user; if (d.app) { A = S.app = d.app; F = A.F; F._a = F._a || {}; A.docs = A.docs || []; S.tab = firstOpen(); } if (d.user.role === 'admin') loadAdmin(); }
async function login() {
  const tc = $('#lt').value.trim(), pw = $('#lp').value, b = $('#lbtn');
  if (b) { b.disabled = true; b.innerHTML = '<span class="ms spin">progress_activity</span><span>Giriş yapılıyor…</span>'; }
  try { const d = await api('/api/login', { method: 'POST', json: { tc, pw } }); S.token = d.token; localStorage.tto_token = d.token; setUser(await api('/api/me')); render(); }
  catch (e) { toast(e.message); const c = $('#lcard'); if (c) { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); } if (b) { b.disabled = false; b.innerHTML = '<span>Giriş Yap</span><span class="ms">arrow_forward</span>'; } }
}
async function register() {
  const v = id => $(id).value.trim(), b = { tc: v('#rt'), name: v('#rn'), email: v('#re'), tel: v('#rtel'), uni: v('#ru'), pw: $('#rp').value };
  if (b.pw !== $('#rp2').value) return toast('Şifreler uyuşmuyor');
  try { await api('/api/register', { method: 'POST', json: b }); toast('Kayıt tamamlandı'); S.mode = 'in'; render(); $('#lt').value = b.tc; $('#lp').value = b.pw; login(); }
  catch (e) { toast(e.message); }
}

/* ---------- Form tanımı ---------- */
const FL = [['ad', 'Adınız – Soyadınız', 't', 1], ['tc', 'T.C. Kimlik Numaranız', 't', 1], ['dogum', 'Doğum Yeri ve Tarihiniz', 't', 1], ['adres', 'İkamet Adresiniz', 'a', 1], ['tel', 'Telefon Numaranız', 't', 1], ['mail', 'Elektronik Posta Adresiniz', 't', 1],
  ['okul', 'En Son Mezun Olduğunuz Okul', 't', 2], ['gecmisBurs', 'Geçmişte Burs Aldınız mı?', 'y', 2], ['fakulte', 'Kayıtlı Olduğunuz Tıp Fakültesi', 't', 2], ['giris', 'Tıp Fakültesi Giriş Tarihiniz', 't', 2], ['sinif', 'Sınıfınız', 't', 2], ['okulno', 'Okul Numaranız', 't', 2], ['gno', 'Önceki Dönem Not Ortalamanız', 't', 2], ['dil', 'Bildiğiniz Yabancı Diller', 't', 2],
  ['medeni', 'Medeni Durumunuz', 's', 3, ['Bekar', 'Evli']], ['cocuk', 'Çocuk Sayısı', 't', 3], ['gelir', 'Çalışıyorsanız Aylık Geliriniz', 't', 3], ['malvarlik', 'Taşınır – Taşınmaz Malvarlığınız', 'a', 3], ['ozelBurs', 'Burs Aldığınız Özel Kurumlar', 't', 3], ['ozelMik', 'Aylık Burs Miktarı (özel)', 't', 3], ['kamuBurs', 'Burs Aldığınız Kamu Kurumları', 't', 3], ['kamuMik', 'Aylık Burs Miktarı (kamu)', 't', 3], ['tabipBurs', 'Tabip Odası’ndan Burs Aldınız mı?', 'y', 3], ['ailedeMi', 'Ailenizle mi ikamet ediyorsunuz?', 'y', 3], ['yurt', 'Yurtta Kalıyorsanız Adı – Adresi', 't', 3], ['kira', 'Evde Kalıyorsanız Kira Miktarı', 't', 3], ['evArk', 'Varsa Ev Arkadaşı Sayısı', 't', 3], ['gider', 'Aylık Giderleriniz (Ücret, Kira, Fatura vb.)', 't', 3], ['engel', 'Bedensel Bir Engeliniz Var mı?', 'y', 3], ['hobi', 'Hobiler ve Özel Uğraşı Alanlarınız', 't', 3], ['dernek', 'Üye Olduğunuz Dernek Vb.', 't', 3]];
const PF = p => [[p + '.ad', 'Adı – Soyadı', 't'], [p + '.tc', 'T.C. Kimlik No', 't'], [p + '.hayat', 'Hayatta mı?', 'y'], [p + '.adres', 'İkamet Adresi', 'a'], [p + '.meslek', 'Meslek ya da Yaptığı İş', 't'], [p + '.isyeri', 'Çalıştığı Yerin Adresi', 'a'], [p + '.gelir', 'Aylık Geliri', 't'], [p + '.tel', 'Telefon Numarası', 't']];
const FL4 = [['bakma', 'Ailenin Bakmakla Yükümlü Olduğu Çocuklar (Ad-Soyad, Yaş, Öğrenim)', 'a'], ['aileMal', 'Ailenin Taşınır – Taşınmaz Malvarlığı', 'a'], ['aileGelir', 'Ailenin Varsa Ücret Dışı Gelirleri', 'a'], ['ayri', 'Anne-Baba Ayrı Yaşıyorsa / Belirtmek İstediğiniz Özel Durum', 'a']];
const ALLF = () => [...FL, ...PF('anne'), ...PF('baba'), ...FL4];
const REQF = L.REQF;

/* ---------- Dosya okuma (PDF metni / OCR) ---------- */
let W, wBusy = Promise.resolve();
async function ocr(c, cb) {
  W = W || await Tesseract.createWorker('tur', 1, { workerPath: 'vendor/tess/worker.min.js', corePath: 'vendor/tess/core/', langPath: 'vendor/tess/', gzip: false, logger: m => { if (m.status === 'recognizing text' && cb) cb(m.progress); } });
  let t = ''; const H = 2600;
  for (let y = 0; y < c.height && y < H * 2; y += H) { const p = document.createElement('canvas'); p.width = c.width; p.height = Math.min(H, c.height - y); p.getContext('2d').drawImage(c, 0, y, c.width, p.height, 0, 0, c.width, p.height); t += (await W.recognize(p)).data.text + '\n'; }
  return t;
}
const thumbOf = (src, w, h, wd) => { const c = document.createElement('canvas'), r = Math.min(1, wd / w); c.width = Math.round(w * r); c.height = Math.round(h * r); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .6); };
async function readFile(f, cb) {
  if (/pdf/i.test(f.type) || /\.pdf$/i.test(f.name)) {
    const pdf = await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise; let txt = '', th, big;
    for (let i = 1; i <= Math.min(pdf.numPages, 2); i++) {
      const pg = await pdf.getPage(i); txt += L.lines((await pg.getTextContent()).items) + '\n';
      if (i === 1) { const v = pg.getViewport({ scale: 1 }), vp = pg.getViewport({ scale: Math.max(560 / v.width, 0.01) }), cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height; await pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise; th = cv.toDataURL('image/jpeg', .6); }
    }
    if (txt.trim().length < 30) { const pg = await pdf.getPage(1), vp = pg.getViewport({ scale: 2.2 }), cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height; await pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise; txt = await ocr(cv, cb); }
    return { text: txt, thumb: th, src: 'pdf' };
  }
  const u = URL.createObjectURL(f), im = new Image(); im.src = u; await im.decode();
  const sc = Math.min(1, 2200 / im.width), c = document.createElement('canvas'); c.width = im.width * sc; c.height = im.height * sc;
  const x = c.getContext('2d'); x.drawImage(im, 0, 0, c.width, c.height);
  const th = thumbOf(im, im.width, im.height, 560);
  const d = x.getImageData(0, 0, c.width, Math.min(c.height, 600)).data; let s = 0, n = 0; for (let i = 0; i < d.length; i += 16) { s += d[i] + d[i + 1] + d[i + 2]; n += 3; }
  const dark = s / n < 110; if (dark) { x.globalCompositeOperation = 'difference'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
  URL.revokeObjectURL(u);
  return { text: await ocr(c, cb), thumb: th, src: 'img', dark };
}

/* ---------- Yükleme ---------- */
async function handleFiles(files, slot) {
  const arr = [...files]; if (!arr.length) return; const rej = [];
  if (L.idMiss(F).length) return toast('Önce “Bilgilerim” adımını doldurun');
  for (let i = 0; i < arr.length; i++) {
    const f = arr[i], m = `(${i + 1}/${arr.length}) ${f.name}`;
    if (f.size > 25e6) { toast(f.name + ' çok büyük (maks 25 MB)'); continue; }
    setLog(m + ' okunuyor…');
    try {
      const r = await readFile(f, p => setLog(m + ' – OCR %' + Math.round(p * 100))), s = slot && SL.find(x => x.id === slot);
      const a = L.analyze(r.text, F, r.src, Date.now(), s ? { k: s.k, w: s.w } : undefined), k = a.k || '?', w = a.w;
      if (a.ck.some(c => c.t === 'bad')) rej.push(f.name);
      setLog(m + ' sunucuya yükleniyor…');
      const up = await api('/api/upload?name=' + encodeURIComponent(f.name), { method: 'POST', body: f, headers: { 'Content-Type': 'application/octet-stream' } });
      const id = k + ':' + w;
      if (w !== '?') A.docs = A.docs.filter(d => d.id !== id);
      L.apply(F, a.patches || []);
      A.docs.push({ id, k, w, name: f.name, file: up.file, thumb: r.thumb, text: r.text.slice(0, 7000), src: r.src, ck: a.ck, info: a.info, ts: Date.now(), dark: !!r.dark });
      L.refresh(F, A.docs); await flushSave();
    } catch (e) { console.error(e); toast('Okunamadı: ' + f.name + ' (' + e.message + ')'); }
  }
  setLog(''); renderDocs(); sidebar(); if (rej.length) toast('Kabul edilmeyen belge: ' + rej.join(', ').slice(0, 120));
}
function setLog(t) { S.log = t; const e = $('#lg'); if (e) e.innerHTML = t ? '<span class="ms spin mr-1">progress_activity</span>' + E(t) : ''; }
function assign(i, w) {
  const d = A.docs[i], r = L.analyze(d.text, F, d.src || 'x', Date.now(), { k: d.k, w }); A.docs.splice(i, 1); d.w = w; d.id = d.k + ':' + w; d.info = r.info; d.ck = r.ck;
  A.docs = A.docs.filter(x => x.id !== d.id); A.docs.push(d); L.apply(F, r.patches); L.refresh(F, A.docs); save(); renderDocs(); sidebar();
}
function delDoc(i) { if (!confirm('Bu belge silinsin mi?')) return; A.docs.splice(i, 1); save(); renderDocs(); sidebar(); }
function pick(id) { const i = document.createElement('input'); i.type = 'file'; i.accept = 'application/pdf,image/*'; i.onchange = () => handleFiles(i.files, id); i.click(); }
function pickMany() { const i = document.createElement('input'); i.type = 'file'; i.multiple = true; i.accept = 'application/pdf,image/*'; i.onchange = () => handleFiles(i.files); i.click(); }

function ring(p) { const r = 34, c = 2 * Math.PI * r; return `<svg viewBox="0 0 80 80" class="w-20 h-20 -rotate-90"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e11d2e"/><stop offset="1" stop-color="#16a34a"/></linearGradient></defs><circle cx="40" cy="40" r="${r}" fill="none" stroke-width="7" stroke="rgba(148,163,184,.25)"/><circle class="ringc" cx="40" cy="40" r="${r}" fill="none" stroke-width="7" stroke-linecap="round" stroke="url(#rg)" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${c * (1 - p / 100)}"/></svg>`; }
function countUp() { document.querySelectorAll('[data-count]').forEach(e => { const t = +e.dataset.count; if (e.dataset.d === String(t)) return; e.dataset.d = t; const s = performance.now(); const f = n => { const k = Math.min(1, (n - s) / 900); e.textContent = Math.round(t * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }); }
function confetti() { const c = document.createElement('canvas'); c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:400;pointer-events:none'; document.body.appendChild(c); const x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight; const col = ['#e11d2e', '#16a34a', '#ffffff', '#f59e0b']; const p = Array.from({ length: 120 }, () => ({ x: innerWidth / 2, y: innerHeight * .7, vx: (Math.random() - .5) * 14, vy: -Math.random() * 16 - 6, s: 5 + Math.random() * 5, c: col[Math.random() * 4 | 0], r: Math.random() * 6, vr: (Math.random() - .5) * .4 })); let f = 0; (function t() { x.clearRect(0, 0, c.width, c.height); p.forEach(a => { a.vy += .35; a.x += a.vx; a.y += a.vy; a.r += a.vr; x.save(); x.translate(a.x, a.y); x.rotate(a.r); x.fillStyle = a.c; x.fillRect(-a.s / 2, -a.s / 2, a.s, a.s * .6); x.restore(); }); if (++f < 140) requestAnimationFrame(t); else c.remove(); })(); }

/* ---------- Ekranlar ---------- */
function render() {
  const nu = $('#navUser');
  if (S.user) { nu.classList.remove('hidden'); nu.classList.add('flex'); $('#nuName').textContent = S.user.name; $('#nuRole').textContent = S.user.role === 'admin' ? 'Sistem Yetkilisi' : 'Öğrenci'; } else { nu.classList.add('hidden'); nu.classList.remove('flex'); }
  $('#app').innerHTML = !S.user ? (S.mode === 'in' ? vLogin() : vRegister()) : S.user.role === 'admin' ? vAdmin() : vStudent();
  if (S.user && S.user.role === 'student') { renderDocs(); }
  if (S.user && S.user.role === 'admin') admTable();
  const st_ = S.user && S.user.role === 'student'; $('#bnav').classList.toggle('hidden', !st_); document.body.classList.toggle('has-bnav', !!st_);
  scrollTo(0, 0);
}
function vLogin() {
  return `<div class="w-full max-w-md mx-auto my-4 sm:my-10"><div class="stg">
  <div class="text-center mb-6"><img src="logo-light.png" alt="Tekirdağ Tabip Odası" class="hero-logo dark:hidden"><img src="logo-dark.png" alt="Tekirdağ Tabip Odası" class="hero-logo hidden dark:block">
   <h2 class="text-3xl font-bold tracking-tight"><span class="grad-t">E-Burs Portalı</span></h2>
   <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Tekirdağ Tabip Odası Tıp Bursu başvuru sistemi</p>
   <div class="flex flex-wrap justify-center gap-2 mt-4"><span class="pill"><span class="ms">shield</span>Güvenli</span><span class="pill"><span class="ms">auto_fix_high</span>Otomatik OCR</span><span class="pill"><span class="ms">lock</span>Cihazda okunur</span></div></div>
  <div class="card p-5 sm:p-7" id="lcard"><div class="space-y-4">
   <div><label class="lbl">Kimlik Numarası (TCKN)</label><div class="ifield"><span class="ms lead">badge</span><input id="lt" class="inp py-3" placeholder="11 haneli TCKN" inputmode="numeric" autocomplete="username" onkeydown="if(event.key==='Enter')$('#lp').focus()"></div></div>
   <div><label class="lbl">Şifre</label><div class="ifield"><span class="ms lead">key</span><input id="lp" type="password" class="inp py-3 pr-11" placeholder="••••••••" autocomplete="current-password" onkeydown="if(event.key==='Enter')login()"><button type="button" class="eye" onclick="const p=$('#lp'),s=p.type==='password';p.type=s?'text':'password';this.innerHTML='<span class=&quot;ms&quot;>visibility'+(s?'_off':'')+'</span>'"><span class="ms">visibility</span></button></div></div>
   <button id="lbtn" onclick="login()" class="btn-p w-full justify-center py-3.5 text-base rounded-xl"><span>Giriş Yap</span><span class="ms">arrow_forward</span></button>
   <p class="text-center text-sm text-gray-500">Hesabınız yok mu? <a href="#" onclick="S.mode='up';render();return false" class="text-primary-600 hover:underline font-semibold">Kayıt Olun</a></p></div></div>
  <div class="mt-4 space-y-2"><p class="text-[11px] uppercase tracking-wider text-gray-400 text-center font-semibold mb-2">Demo hesapları · dokun, otomatik dolsun</p>
   <button class="demo-btn" onclick="$('#lt').value='admin';$('#lp').value='123'"><span class="w-8 h-8 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center"><span class="ms">admin_panel_settings</span></span><span><b class="block text-sm">Yönetici</b><span class="text-gray-500">admin · 123</span></span></button>
   <button class="demo-btn" onclick="$('#lt').value='12345678901';$('#lp').value='123'"><span class="w-8 h-8 rounded-lg bg-green-500/15 text-green-600 flex items-center justify-center"><span class="ms">school</span></span><span><b class="block text-sm">Öğrenci</b><span class="text-gray-500">12345678901 · 123 (hesap otomatik açılır)</span></span></button></div>
  </div></div>`;
}
function vRegister() {
  const i = (id, l, t = 'text', x = '') => `<div><label class="lbl">${l}</label><input id="${id}" type="${t}" class="inp" ${x}></div>`;
  return `<div class="w-full max-w-2xl mx-auto my-6 fade-in"><div class="card shadow-lg p-6 sm:p-8"><div class="mb-6 flex justify-between items-center border-b border-gray-100 dark:border-amoled-border pb-4"><div><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Yeni Kayıt</h2><p class="text-sm text-gray-500 mt-1">Lütfen tüm alanları doldurun.</p></div><button onclick="S.mode='in';render()" class="text-gray-400 hover:text-gray-600"><span class="ms text-xl">close</span></button></div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${i('rt', 'T.C. Kimlik No', 'text', 'maxlength="11" inputmode="numeric"')}${i('rn', 'Ad Soyad')}${i('re', 'E-posta', 'email')}${i('rtel', 'Cep Telefonu', 'tel')}
  <div class="sm:col-span-2">${i('ru', 'Üniversite / Fakülte', 'text', 'placeholder="Ör: Tekirdağ Namık Kemal Üniversitesi – Tıp Fakültesi"')}</div>${i('rp', 'Şifre', 'password')}${i('rp2', 'Şifre Tekrar', 'password')}</div>
  <div class="mt-6 flex justify-end gap-3"><button onclick="S.mode='in';render()" class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">İptal</button><button onclick="register()" class="btn-p">Kaydı Tamamla</button></div></div></div>`;
}

/* ----- Öğrenci paneli (adım adım / kilitli) ----- */
const ORDER = ['terms', 'kimlik', 'docs', 'form', 'sum'];
const TABS = [['terms', 'Şartlar', 'description', 'Şartlar'], ['kimlik', 'Bilgilerim', 'edit', 'Bilgi'], ['docs', 'Belgeler', 'folder_open', 'Belge'], ['form', 'Başvuru Formu', 'edit_square', 'Form'], ['sum', 'Özet / Gönder', 'send', 'Gönder']];
const IDK = ['ad', 'tc', 'sinif', 'anne.ad', 'anne.hayat', 'baba.ad', 'baba.hayat', 'anne.tc', 'baba.tc'];
const SINIF = ['Hazırlık', '1. sınıf', '2. sınıf', '3. sınıf', '4. sınıf', '5. sınıf', '6. sınıf'];
const IDF = { s: [['ad', 'Adınız – Soyadınız (kimlikteki gibi)', 't'], ['tc', 'T.C. Kimlik Numaranız', 't'], ['sinif', 'Sınıfınız', 's', 0, SINIF]], m: [['anne.ad', 'Annenizin Adı – Soyadı', 't'], ['anne.hayat', 'Anne hayatta mı?', 'y'], ['anne.tc', 'Anne T.C. No (isteğe bağlı, doğrulamayı güçlendirir)', 't']], f: [['baba.ad', 'Babanızın Adı – Soyadı', 't'], ['baba.hayat', 'Baba hayatta mı?', 'y'], ['baba.tc', 'Baba T.C. No (isteğe bağlı, doğrulamayı güçlendirir)', 't']] };
const gateOf = t => { const st = L.steps(F, A.docs, A.terms), i = ORDER.indexOf(t); for (let j = 0; j < i; j++) if (!st[j].ok) return { j, why: st[j].why }; return null; };
const firstOpen = () => { const i = L.steps(F, A.docs, A.terms).findIndex(x => !x.ok); return i < 0 ? 'sum' : ORDER[i]; };
const tcOk = t => { if (!/^[1-9]\d{10}$/.test(t)) return false; const d = [...t].map(Number); return ((d[0] + d[2] + d[4] + d[6] + d[8]) * 7 - (d[1] + d[3] + d[5] + d[7])) % 10 === d[9] && d.slice(0, 10).reduce((a, b) => a + b, 0) % 10 === d[10]; };
function vStudent() {
  return `<div class="grid grid-cols-1 xl:grid-cols-4 gap-6 fade-in"><div class="xl:col-span-1 space-y-4" id="side"></div>
  <div class="xl:col-span-3"><div class="card p-2 mb-4 hidden md:flex gap-1 overflow-x-auto" id="tabs"></div><div id="page"></div></div></div>`;
}
function stepper() {
  if (!$('#tabs') || !A) return; const st = L.steps(F, A.docs, A.terms), sent = A.status === 'Beklemede' || A.status === 'Onaylandı';
  const cls = (k, n) => (S.tab === k ? 'on ' : '') + (gateOf(k) ? 'lock ' : '') + ((n < 4 ? st[n].ok : sent) ? 'done' : '');
  $('#tabs').innerHTML = TABS.map(([k, l], n) => { const c = cls(k, n); return `<button onclick="go('${k}')" class="stp ${c}"><span class="n">${c.includes('lock') ? '<span class="ms">lock</span>' : c.includes('done') ? '<span class="ms">check</span>' : n + 1}</span>${l}</button>`; }).join('');
  $('#bnav').innerHTML = TABS.map(([k, l, ic, sh], n) => { const c = cls(k, n); return `<button onclick="go('${k}')" class="${c}"><span class="ms">${c.includes('lock') ? 'lock' : c.includes('done') && S.tab !== k ? 'check_circle' : ic}</span><span>${sh}</span></button>`; }).join('');
  document.querySelectorAll('[data-nxt]').forEach(b => { b.disabled = !!gateOf(b.dataset.nxt); });
  const e = $('#gh'); if (e) { const s = st[ORDER.indexOf(S.tab)]; e.className = 'gh ' + (s && !s.ok ? 'warn' : 'ok'); e.innerHTML = s && !s.ok ? '<span class="ms">lock</span> Sonraki adım için: ' + E(s.why) : '<span class="ms">check_circle</span> Bu adım tamam – devam edebilirsiniz'; }
}
function sidebar() {
  if (!$('#side')) return; const p = L.progress(F, A.docs), miss = REQF.filter(k => !String(F[k] || '').trim()), fo = REQF.length - miss.length;
  $('#side').innerHTML = `<div class="card p-4 sm:p-5"><div class="flex items-center gap-4"><div class="relative shrink-0">${ring(p.p)}<div class="absolute inset-0 flex items-center justify-center text-sm font-bold"><span data-count="${p.p}">0</span>%</div></div>
   <div class="min-w-0 flex-1"><h3 class="font-bold text-base text-gray-900 dark:text-white truncate">${E(F.ad || S.user.name)}</h3><p class="text-xs text-gray-500 truncate">${E([F.fakulte, F.sinif].filter(Boolean).join(' · ') || 'Bilgiler belgelerden otomatik dolar')}</p>
   <div class="flex items-center flex-wrap gap-2 mt-2"><span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${stBadge(A.status)}">${E(A.status)}</span><span class="text-[11px] text-gray-500">TC ${E(F.tc || S.user.tc)}</span></div></div></div>
   <div class="grid grid-cols-2 gap-2 mt-4 text-center"><div class="rounded-xl bg-gray-50 dark:bg-amoled-base p-2.5"><div class="font-bold text-sm">${p.ok}/${p.n}</div><div class="text-[11px] text-gray-500">Zorunlu belge</div></div><div class="rounded-xl bg-gray-50 dark:bg-amoled-base p-2.5"><div class="font-bold text-sm">${fo}/${REQF.length}</div><div class="text-[11px] text-gray-500">Form alanı</div></div></div>
   <button data-nxt="sum" onclick="go('sum')" class="btn-p w-full justify-center mt-4"><span class="ms">send</span> Özet ve Gönder</button></div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => { const r = document.querySelector('.ringc'); if (r) r.style.strokeDashoffset = r.dataset.off; })); countUp(); stepper();
}
function go(t) {
  if (L.steps(F, A.docs, A.terms)[1].ok && t === 'docs') { L.refresh(F, A.docs); save(); }
  const g = gateOf(t); if (g) { toast(g.why); t = ORDER[g.j]; }
  S.tab = t; sidebar(); $('#page').innerHTML = { terms: pTerms, kimlik: pKimlik, docs: pDocs, form: pForm, sum: pSum }[t](); if (t === 'docs') renderDocs(); stepper(); scrollTo(0, 0);
}
const _render = render; render = function () { _render(); if (S.user && S.user.role === 'student') go(S.tab); };

function pTerms() {
  return `<div class="card p-5 sm:p-6 fade-in"><h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Başvuru Şartları ve Bilgilendirme</h2><p class="text-sm text-gray-500 mb-4">Tekirdağ Tabip Odası Tıp Eğitimi Bursu – Tıp Fakültesi Öğrenci Bursu Yönergesi</p>
  <ul class="space-y-2.5 text-sm">${[
    'Burs, tıp fakültesi öğrencilerine <b>10 (on) ay</b> süreyle bağlanır; kaynaklar yetersiz kalırsa süreden önce kesilebilir.',
    'Adımlar sırayla ilerler: <b>Şartlar > Bilgilerim > Belgeler > Form > Özet</b>. Önceki adım tamamlanmadan sonrakine geçilemez.',
    'Önce öğrenci, anne ve baba <b>ad-soyadı</b> girilir. Belgeler bu isimlere göre doğrulanır; <b>her belgede ilgili kişinin adı-soyadı görünmelidir</b>. İsmi görünmeyen/kırpılmış ekran görüntüsü ve yanlış kişiye ait belge <b>kabul edilmez</b>.',
    'Belgeleri yükleyince öğrenci bilgileri ve form <b>otomatik doldurulur</b>; hepsini kontrol edip düzeltmek öğrencinin sorumluluğundadır.',
    'e-Devlet belgeleri <b>son 30 gün içinde alınmış</b> ve barkodlu olmalıdır; eski tarihli belge kabul edilmez.',
    'Öğrenci, anne ve babanın her biri için <b>adli sicil kaydı</b> (e-Devlet) istenir.',
    'İstenen kayıt yoksa bile (tapu, araç, vergi levhası, 4A/4B/4C, KYK vb.) <b>“kayıt bulunamadı”</b> yazan, isim görünen e-Devlet ekranı zorunludur.',
    'Hazırlık/1. sınıfa yeni başlayanlar ÖSYM sonuç + yerleştirme belgesi, diğer sınıflar transkript verir.',
    'Anne/baba vefat etmişse onun yerine öğrencinin kendi 4A-4B-4C bilgileri istenir. Çalışan ebeveyn için bordro, emekli için 4A/4B/4C aylık bilgisi gerekir.',
    'Yurtta kalan için yurt belgesi, kirada kalan için kira kontratı; ailenin evi kiraysa ailenin kira kontratı eklenir.',
    'Başvuru formu imzalanıp taranmış olarak yüklenir. Yanıltıcı bilgi/belge verildiği anlaşılırsa burs kesilir, ödenen tutarlar yasal faiziyle geri alınır.'].map(t => `<li class="flex gap-2.5"><span class="ms text-primary-500 mt-0.5">check_circle</span><span>${t}</span></li>`).join('')}</ul>
  <label class="flex items-center gap-2 mt-5 text-sm cursor-pointer"><input type="checkbox" ${A.terms ? 'checked' : ''} onchange="A.terms=this.checked?1:0;save();stepper()" class="w-4 h-4 rounded"> Şartları okudum, kabul ediyorum</label>
  <div class="mt-4 flex flex-wrap items-center gap-3"><button class="btn-p" data-nxt="kimlik" onclick="go('kimlik')">Bilgilerime geç <span class="ms">arrow_forward</span></button><span id="gh" class="gh"></span></div></div>`;
}
function pKimlik() {
  const g = x => `<div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">${x.map(fld).join('')}</div>`, h = t => `<h3 class="text-sm font-bold text-gray-900 dark:text-white mt-5 mb-3 pb-2 border-b border-gray-100 dark:border-amoled-border">${t}</h3>`;
  return `<div class="card p-5 sm:p-6 fade-in"><h2 class="text-lg font-bold text-gray-900 dark:text-white"><span class="ms text-primary-500 mr-2">edit</span>Önce kimlik bilgileriniz</h2>
  <p class="text-xs text-gray-500 mt-1">Belgeler bu isimlere göre kontrol edilir: her belgede ilgili kişinin adı-soyadı (veya T.C. no) görünmelidir. İsimleri kimlikteki gibi yazın. Diğer tüm bilgiler (adres, okul, gelir, mal varlığı…) belgeleri yükleyince <b>otomatik</b> dolar.</p>
  ${h('Öğrenci')}${g(IDF.s)}<p id="tch" class="text-[11px] text-orange-600 mt-1"></p>${h('Anne')}${g(IDF.m)}${h('Baba')}${g(IDF.f)}
  <div class="mt-6 flex flex-wrap items-center gap-3"><button class="btn-p" data-nxt="docs" onclick="go('docs')">Belgelere geç <span class="ms">arrow_forward</span></button><span id="gh" class="gh"></span></div></div>`;
}
const val = k => E(F[k] || '');
function fld([k, l, t, , o]) {
  const au = F._a[k] ? `<span class="ml-1.5 text-[10px] bg-primary-50 text-primary-600 dark:bg-primary-600/20 dark:text-primary-400 px-1.5 py-0.5 rounded"><span class="ms mr-0.5">auto_fix_high</span>${E(F._a[k])}</span>` : '';
  let i; const opt = (arr) => `<option value=""></option>` + arr.map(x => `<option ${F[k] === x ? 'selected' : ''}>${x}</option>`).join('');
  if (t === 'y') i = `<select class="inp" onchange="sf('${k}',this.value)">${opt(['Evet', 'Hayır'])}</select>`;
  else if (t === 's') i = `<select class="inp" onchange="sf('${k}',this.value)">${opt(F[k] && !o.includes(F[k]) ? [...o, F[k]] : o)}</select>`;
  else if (t === 'a') i = `<textarea rows="2" class="inp" oninput="sf('${k}',this.value)">${val(k)}</textarea>`;
  else i = `<input class="inp" value="${val(k)}" ${/(^|\.)tc$/.test(k) ? 'inputmode="numeric" maxlength="11"' : ''} oninput="sf('${k}',this.value)">`;
  return `<div id="f_${k.replace('.', '_')}"><label class="lbl">${l}${au}</label>${i}</div>`;
}
function sf(k, v) { F[k] = v; if (F._a[k]) { delete F._a[k]; const el = document.querySelector('#f_' + k.replace('.', '_') + ' span'); if (el) el.remove(); } if (k === 'tc') { const h = $('#tch'); if (h) h.textContent = /^\d{11}$/.test(v) && !tcOk(v) ? 'T.C. kimlik no doğrulama kuralına uymuyor – yazım hatası olabilir (demo hesaplarda sorun değil).' : ''; }
  if (IDK.includes(k)) { clearTimeout(sf.t); sf.t = setTimeout(() => { L.refresh(F, A.docs); save(); stepper(); }, 500); } save(); sidebar(); }
function pForm() {
  const sec = n => FL.filter(f => f[3] === n).map(fld).join(''), g = x => `<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">${x}</div>`, h = t => `<h3 class="text-sm font-bold text-gray-900 dark:text-white mt-6 mb-3 pb-2 border-b border-gray-100 dark:border-amoled-border">${t}</h3>`;
  return `<div class="card p-5 sm:p-6 fade-in"><h2 class="text-lg font-bold text-gray-900 dark:text-white">Burs Başvuru Formu</h2><p class="text-xs text-gray-500 mt-1">Belgelerden alanlar otomatik doldu (<span class="text-primary-600"><span class="ms">auto_fix_high</span> etiketli</span>). Hepsini kontrol edip düzeltin.</p>
  ${h('I – Kimlik ve İletişim')}${g(sec(1))}${h('II – Eğitim')}${g(sec(2))}${h('III – Sosyal ve Ekonomik Durum')}${g(sec(3))}${h('IV – Anne')}${g(PF('anne').map(fld).join(''))}${h('IV – Baba')}${g(PF('baba').map(fld).join(''))}${h('Aile – Diğer')}${g(FL4.map(fld).join(''))}
  <div class="mt-6 flex flex-wrap gap-2"><button class="btn" onclick="printF()"><span class="ms">print</span> Formu yazdır (imza için)</button><button class="btn-p" data-nxt="sum" onclick="go('sum')">Özete geç <span class="ms">arrow_forward</span></button><span id="gh" class="gh self-center"></span></div></div>`;
}
function printF() {
  const rows = ALLF().map(f => `<tr><td style="width:42%">${f[1]}</td><td>${E(F[f[0]] || '').replace(/\n/g, '<br>')}</td></tr>`).join('');
  const w = open('', '_blank'); w.document.write(`<meta charset=utf-8><title>Burs Başvuru Formu</title><body style="font:12px sans-serif;margin:18px"><h2 align=center>TEKİRDAĞ TABİP ODASI<br>TIP FAKÜLTESİ ÖĞRENCİ BURS BAŞVURU FORMU</h2><table border=1 cellspacing=0 cellpadding=4 width=100% style="border-collapse:collapse">${rows}</table><p>Yukarıda verdiğim bilgilerin ve ekte sunduğum belgelerin doğruluğunu beyan eder, 10 (on) ay süreyle burs bağlanmasını talep ederim.</p><p>Tarih: ..../..../........ &nbsp;&nbsp;&nbsp; Ad-Soyad / İmza:</p>`); w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
}

/* ----- Belgeler ----- */
function pDocs() {
  const ch = (g, v, t) => `<span class="chip ${S.f[g] === v ? 'on' : ''}" onclick="S.f['${g}']='${v}';$('#fl').innerHTML=fbar();renderDocs()">${t}</span>`;
  window.fbar = () => `<div class="flex flex-wrap gap-1.5">${[['all', 'Tümü'], ['zorunlu', 'Zorunlu'], ['eksik', 'Eksik'], ['yuklu', 'Yüklü'], ['uyari', 'Uyarılı']].map(a => ch('st', ...a)).join('')}</div>
   <div class="flex flex-wrap gap-1.5">${[['all', 'Herkes'], ['s', 'Öğrenci'], ['m', 'Anne'], ['f', 'Baba'], ['a', 'Aile']].map(a => ch('who', ...a)).join('')}</div>
   <div class="flex flex-wrap gap-1.5">${ch('cat', 'all', 'Tüm kategoriler')}${L.cats.map(c => ch('cat', c, c)).join('')}</div>`;
  return `<div class="space-y-4 fade-in"><div class="card p-5"><div class="flex justify-between items-center mb-3"><h2 class="text-lg font-bold text-gray-900 dark:text-white"><span class="ms text-primary-500 mr-2">folder_open</span>İstenen Evraklar</h2><span class="text-xs text-gray-500">PDF / JPG / PNG</span></div>
  <div id="dz" class="drop rounded-xl p-6 text-center cursor-pointer bg-gray-50 dark:bg-amoled-base" onclick="pickMany()" ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')" ondrop="event.preventDefault();this.classList.remove('dragover');handleFiles(event.dataTransfer.files)">
   <span class="ms text-3xl text-primary-500 mb-2">cloud_upload</span><p class="text-sm font-semibold">Akıllı yükleme – tüm belge ve ekran görüntülerini birlikte seçin / bırakın</p><p class="text-xs text-gray-500 mt-1">Belge türü ve sahibi otomatik tanınır, form doldurulur. <b>Her belgede kişinin adı-soyadı görünmeli</b> (isim kırpılmış ekran görüntüsü kabul edilmez); e-Devlet belgeleri son 30 gün içinde alınmış olmalı.</p><p id="lg" class="text-xs text-primary-600 mt-2 min-h-[1rem]"></p></div></div>
  <div class="card p-4 space-y-2"><input id="sq" class="inp" placeholder="Ara: belge, kişi, dosya adı, içerik…" value="${E(S.f.q)}" oninput="S.f.q=this.value;clearTimeout(window.tq);window.tq=setTimeout(renderDocs,200)"><div id="fl" class="space-y-2">${fbar()}</div></div>
  <div id="unk"></div><div id="dl" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div><div class="flex flex-wrap items-center gap-3"><button class="btn-p" data-nxt="form" onclick="go('form')">Forma geç <span class="ms">arrow_forward</span></button><span id="gh" class="gh"></span></div></div>`;
}
function renderDocs() {
  if (S.tab !== 'docs' || !$('#dl')) return; const q = S.f;
  const unk = A.docs.map((d, i) => ({ d, i })).filter(x => x.d.w === '?');
  $('#unk').innerHTML = unk.length ? `<div class="card p-4 border-orange-300 dark:border-orange-700/60"><h3 class="text-sm font-bold text-orange-600 mb-2"><span class="ms mr-1">warning</span>Sahibi / türü belirlenemeyen belgeler</h3>${unk.map(({ d, i }) => { const D0 = D.find(x => x.k === d.k); return `<div class="flex gap-3 py-2 border-t border-gray-100 dark:border-amoled-border">${d.thumb ? `<img src="${d.thumb}" class="w-14 h-18 h-[72px] object-cover rounded border border-gray-200 dark:border-amoled-border cursor-zoom-in" onclick="pv(${i})">` : ''}<div class="min-w-0 text-xs"><b class="text-sm">${E(d.name)}</b> <span class="text-gray-500">${D0 ? '(' + E(D0.t) + ')' : '(tür tanınamadı)'}</span>${d.ck.map(c => `<div class="text-gray-500">• ${E(c.m)}</div>`).join('')}<div class="mt-1.5 flex flex-wrap gap-1.5 items-center">${D0 ? 'Kime ait? ' + [...D0.w].filter(w => 'smf'.includes(w)).map(w => `<button class="btn" onclick="assign(${i},'${w}')">${WN[w]}</button>`).join('') : '<span class="text-gray-500">Listeden doğru belgeyi seçip yükleyin.</span>'} <button class="btn text-red-600" onclick="delDoc(${i})">Sil</button></div></div></div>`; }).join('')}</div>` : '';
  const list = SL.filter(x => {
    const d = A.docs.find(y => y.id === x.id), s = d ? L.dstat(d) : 'emp', r = L.req(F, x);
    if (q.st === 'eksik' && d) return 0; if (q.st === 'yuklu' && !d) return 0; if (q.st === 'uyari' && !(d && s !== 'ok')) return 0; if (q.st === 'zorunlu' && !r) return 0;
    if (q.who !== 'all' && x.w !== q.who) return 0; if (q.cat !== 'all' && x.cat !== q.cat) return 0;
    if (q.q && !N(x.t + ' ' + WN[x.w] + ' ' + x.cat + ' ' + (d ? d.name + ' ' + d.text : '')).includes(N(q.q))) return 0; return 1;
  });
  $('#dl').innerHTML = list.map(slot).join('') || '<p class="text-sm text-gray-500 col-span-full text-center py-6">Sonuç yok.</p>';
}
function slot(x) {
  const i = A.docs.findIndex(y => y.id === x.id), d = A.docs[i], s = d ? L.dstat(d) : 'emp', r = L.req(F, x);
  const badge = s === 'emp' ? (r ? '<span class="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">EKSİK</span>' : '<span class="text-[10px] font-bold text-gray-500 bg-gray-200 dark:bg-amoled-base px-1.5 py-0.5 rounded">KOŞULLU</span>') : s === 'ok' ? '<span class="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">YÜKLENDİ</span>' : s === 'warn' ? '<span class="text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded">KONTROL</span>' : '<span class="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">SORUNLU</span>';
  const bg = s === 'ok' ? 'bg-green-50/40 dark:bg-green-900/10 border-green-200 dark:border-green-900/50' : s === 'warn' ? 'border-orange-200 dark:border-orange-900/50' : s === 'bad' ? 'border-red-300 dark:border-red-900/60' : 'bg-gray-50/50 dark:bg-amoled-base border-gray-200 dark:border-amoled-border';
  return `<div class="flex items-start gap-3 p-3 rounded-lg border ${bg}">
   ${d && d.thumb ? `<img src="${d.thumb}" onclick="pv(${i})" class="w-14 h-[72px] shrink-0 object-cover rounded border border-gray-200 dark:border-amoled-border cursor-zoom-in">` : `<div class="w-10 h-10 shrink-0 rounded bg-white dark:bg-amoled-surface border border-gray-100 dark:border-amoled-border flex items-center justify-center text-lg text-gray-400"><span class="ms">${x.icon}</span></div>`}
   <div class="min-w-0 flex-grow"><div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-0.5"><h4 class="text-sm font-semibold text-gray-900 dark:text-white">${E(x.t)}</h4>${badge}</div>
   <p class="text-[11px] text-gray-500 leading-tight mb-1">${x.w !== 's' && x.w !== 'a' ? `<b class="text-primary-600">${WN[x.w]}</b> · ` : ''}${E(x.d)}</p>
   ${d ? `<p class="text-[11px] text-gray-400 truncate">${E(d.name)}</p>${d.info.map(t => `<div class="text-[11px] text-gray-700 dark:text-gray-300"><span class="ms text-primary-500 mr-1">chevron_right</span>${E(t)}</div>`).join('')}${d.ck.map(c => `<div class="text-[11px] ${dcls[c.t]}"><span class="ms mr-1">${dico[c.t]}</span>${E(c.m)}</div>`).join('')}` : ''}
   <div class="mt-2 flex flex-wrap gap-1.5">${/^http/.test(x.l) ? `<a class="btn" href="${x.l}" target="_blank" rel="noopener"><span class="ms">open_in_new</span> e-Devlet'ten al</a>` : x.h ? `<span class="text-[11px] text-gray-500 w-full">${E(x.h)}</span>` : ''}
   <button class="btn" onclick="pick('${x.id}')"><span class="ms">upload</span>${d ? 'Değiştir' : 'Dosya seç'}</button>${d ? `<button class="btn" onclick="pv(${i})"><span class="ms">visibility</span> Önizle</button><button class="btn text-red-600" onclick="delDoc(${i})"><span class="ms">delete</span></button>` : ''}</div></div></div>`;
}
function pv(i, d0, owner) {
  const d = d0 || A.docs[i], tc = owner || S.user.tc, fu = d.file ? `/api/file/${tc}/${d.file}?t=${S.token}` : '', isPdf = /\.pdf$/i.test(d.name);
  $('#pv').innerHTML = `<div class="max-w-3xl mx-auto"><div class="flex justify-between items-center text-white mb-3"><b class="text-sm truncate">${E(d.name)}</b><div class="flex gap-2">${fu ? `<a class="btn" href="${fu}" target="_blank"><span class="ms">download</span> Orijinal</a>` : ''}<button class="btn" onclick="$('#pv').classList.add('hidden')"><span class="ms">close</span></button></div></div>
  ${isPdf && fu ? `<iframe src="${fu}" class="w-full h-[75vh] bg-white rounded-lg"></iframe>` : fu && !d.dark ? `<img src="${fu}" class="w-full rounded-lg bg-white" onerror="this.src='${d.thumb || ''}'">` : `<img src="${fu || d.thumb}" class="w-full rounded-lg bg-white" onerror="this.src='${d.thumb || ''}'">`}
  ${d.text ? `<details class="mt-3 text-white"><summary class="cursor-pointer text-sm">Okunan metin (OCR)</summary><pre class="mt-2 text-[11px] whitespace-pre-wrap bg-black/60 p-3 rounded-lg max-h-64 overflow-auto">${E(d.text)}</pre></details>` : ''}</div>`;
  $('#pv').classList.remove('hidden');
}

/* ----- Özet ----- */
function pSum() {
  const st = L.steps(F, A.docs, A.terms), p = L.progress(F, A.docs), miss = REQF.filter(k => !String(F[k] || '').trim()), bad = A.docs.filter(d => L.dstat(d) === 'bad'), warn = A.docs.filter(d => L.dstat(d) === 'warn');
  const lab = Object.fromEntries(ALLF().map(f => [f[0], f[1]])), ready = st.every(x => x.ok), sent = A.status === 'Beklemede' || A.status === 'Onaylandı', nm = ['Şartlar kabul edildi', 'Kimlik bilgileri girildi', 'Zorunlu belgeler tam ve kabul edildi', 'Zorunlu form alanları dolu'];
  return `<div class="card p-5 sm:p-6 fade-in"><h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Özet ve Gönderim</h2>
  <ul class="space-y-1.5 mb-4 text-sm">${st.map((x, i) => `<li class="${x.ok ? 'text-green-600' : 'text-red-600'}"><span class="ms mr-1.5">${x.ok ? 'check_circle' : 'cancel'}</span>${nm[i]}${x.ok ? '' : ' – ' + E(x.why)}</li>`).join('')}</ul>
  <div class="grid grid-cols-3 gap-3 mb-5 text-center"><div class="rounded-lg bg-gray-50 dark:bg-amoled-base p-3"><div class="text-xl font-bold">${p.ok}/${p.n}</div><div class="text-xs text-gray-500">Zorunlu belge</div></div><div class="rounded-lg bg-gray-50 dark:bg-amoled-base p-3"><div class="text-xl font-bold">${miss.length}</div><div class="text-xs text-gray-500">Eksik form alanı</div></div><div class="rounded-lg bg-gray-50 dark:bg-amoled-base p-3"><div class="text-xl font-bold">${bad.length}</div><div class="text-xs text-gray-500">Kabul edilmeyen belge</div></div></div>
  ${p.miss.length ? `<h3 class="text-sm font-bold mb-2">Eksik zorunlu belgeler</h3><ul class="text-sm mb-4 space-y-1">${p.miss.map(x => `<li><span class="ms text-red-500 mr-1.5">cancel</span>${E(x.t)} <span class="text-gray-500">(${WN[x.w]})</span></li>`).join('')}</ul>` : ''}
  ${miss.length ? `<h3 class="text-sm font-bold mb-2">Boş zorunlu form alanları</h3><p class="text-sm mb-4 text-gray-600 dark:text-gray-400">${miss.map(k => E(lab[k])).join(' · ')}</p>` : ''}
  ${bad.length ? `<h3 class="text-sm font-bold mb-2 text-red-600">Kabul edilmeyen belgeler</h3><ul class="text-xs mb-4 space-y-1">${bad.map(d => `<li><b>${E(d.name)}</b> – ${E((d.ck.find(c => c.t === 'bad') || {}).m || '')}</li>`).join('')}</ul>` : ''}
  ${warn.length ? `<p class="text-sm text-orange-600 mb-4"><span class="ms mr-1">warning</span>Kontrol edilmesi gereken belgeler: ${warn.map(d => E(d.name)).join(', ')}</p>` : ''}
  ${A.note ? `<div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-sm mb-4"><b>Yönetici notu:</b> ${E(A.note)}</div>` : ''}
  <div class="flex flex-wrap gap-2 items-center"><button class="btn-p" ${ready && !sent ? '' : 'disabled'} onclick="submitApp()"><span class="ms">send</span> ${sent ? 'Gönderildi' : 'Başvuruyu Onaya Gönder'}</button><button class="btn" onclick="printF()"><span class="ms">print</span> Formu yazdır</button><span class="text-xs text-gray-500">Durum: ${E(A.status)}${A.sent ? ' · ' + new Date(A.sent).toLocaleString('tr-TR') : ''}</span></div></div>`;
}
async function submitApp() {
  const st = L.steps(F, A.docs, A.terms).find(x => !x.ok); if (st) return toast(st.why);
  try { await flushSave(); const d = await api('/api/submit', { method: 'POST' }); A.status = d.status; A.sent = Date.now(); toast('Başvuru gönderildi'); confetti(); go('sum'); } catch (e) { toast(e.message); }
}
/* ----- Yönetici ----- */
const AS = { Burs: 'Onaylandı', Yedek: 'Beklemede', Elendi: 'Reddedildi' }, TL = n => Math.round(n || 0).toLocaleString('tr-TR') + ' ₺';
async function loadAdmin() {
  try { S.adm.list = (await api('/api/admin/apps')).apps; S.adm.set = L.mergeSet((await api('/api/admin/settings')).settings); } catch (e) { S.adm.set = S.adm.set || L.defSet(); }
  if (S.user && S.user.role === 'admin') { $('#app').innerHTML = vAdmin(); admTable(); }
}
const admRank = () => (S.adm.rows = L.rank(S.adm.list, S.adm.set || (S.adm.set = L.defSet())));
const admSel = (v, arr, fn) => `<select class="inp" onchange="${fn}">${arr.map(([k, t]) => `<option value="${k}" ${String(v) === String(k) ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
function admF(k, v) { S.adm[k] = v; admTable(); }
function admSort(k) { const a = S.adm; if (a.sort === k) a.dir = -a.dir; else { a.sort = k; a.dir = ['name', 'rank', 'total', 'pc', 'houses', 'cars'].includes(k) ? 1 : -1; } admTable(); }
function admReset() { Object.assign(S.adm, { q: '', st: 'all', cls: 'all', kind: 'all', res: 'all', miss: false, incMin: '', incMax: '', pcMax: '', house: 'all', car: 'all', sibMin: '', gnoMin: '', dead: false, away: false, dis: false }); $('#app').innerHTML = vAdmin(); admTable(); }
function vAdmin() {
  const A_ = S.adm, rk = admRank(), demo = A_.list.filter(a => a.demo).length, card = (ic, c, l, v) => `<div class="card p-4 flex items-center gap-4"><div class="w-10 h-10 rounded-full ${c} flex items-center justify-center"><span class="ms">${ic}</span></div><div><p class="text-xs text-gray-500">${l}</p><p class="text-xl font-bold dark:text-white" data-count="${v}">0</p></div></div>`;
  const n = f => rk.filter(f).length;
  return `<div class="fade-in mdf"><div class="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-4"><div><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Yönetim Paneli</h2><p class="text-sm text-gray-500 mt-1">${A_.list.length} başvuru${demo ? ' · ' + demo + ' demo kayıt' : ''} · burs kontenjanı ${A_.set.quota}</p></div>
   <div class="flex flex-wrap gap-2"><button class="btn" onclick="loadAdmin()"><span class="ms">refresh</span> Yenile</button><button class="btn" onclick="csv()"><span class="ms">download</span> CSV</button><button class="btn" onclick="admSeed()"><span class="ms">science</span> Örnek veri</button>${demo ? `<button class="btn text-red-600" onclick="admDemoDel()"><span class="ms">cleaning_services</span> Demo sil</button>` : ''}</div></div>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">${card('group', 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', 'Toplam', rk.length)}${card('schedule', 'bg-orange-50 dark:bg-orange-900/20 text-orange-600', 'İncelenecek', n(r => r.a.status === 'Beklemede'))}${card('emoji_events', 'bg-green-50 dark:bg-green-900/20 text-green-600', 'Burs alacak (kural)', n(r => r.res === 'Burs'))}${card('block', 'bg-red-50 dark:bg-red-900/20 text-red-600', 'Elenen (kural)', n(r => r.res === 'Elendi'))}</div>
  <div class="flex gap-2 mb-4"><span class="chip ${A_.view === 'list' ? 'on' : ''}" onclick="S.adm.view='list';$('#app').innerHTML=vAdmin();admTable()"><span class="ms mr-1">table_rows</span>Başvurular</span><span class="chip ${A_.view === 'set' ? 'on' : ''}" onclick="S.adm.view='set';$('#app').innerHTML=vAdmin()"><span class="ms mr-1">tune</span>Şartlar ve Puanlama</span></div>
  ${A_.view === 'set' ? vSet() : vList()}</div><div id="adet"></div>`;
}
const INC_MAX = 200000, PC_MAX = 50000;
function admSl(k, el) {
  const a = S.adm, v = +el.value, set = (id, t) => { const n = $('#' + id); if (n) n.textContent = t; };
  if (k === 'inc') { const s = +el.valueStart, e = +el.valueEnd; a.incMin = s <= 0 ? '' : String(s); a.incMax = e >= INC_MAX ? '' : String(e); set('v_inc', TL(s) + ' - ' + (e >= INC_MAX ? 'sınırsız' : TL(e))); }
  else if (k === 'pcMax') { a.pcMax = v >= PC_MAX ? '' : String(v); set('v_pc', v >= PC_MAX ? 'sınırsız' : TL(v)); }
  else if (k === 'gnoMin') { a.gnoMin = v <= 0 ? '' : String(v); set('v_gno', v <= 0 ? 'hepsi' : v.toFixed(1).replace('.', ',')); }
  else if (k === 'sibMin') { a.sibMin = v <= 0 ? '' : String(v); set('v_sib', v <= 0 ? 'hepsi' : v + ' ve üzeri'); }
  admTable();
}
function admChip(k, v, el) { setTimeout(() => { S.adm[k] = v; [...el.parentElement.children].forEach(c => { c.selected = c === el; }); admTable(); }, 0); }
function admActive() { const a = S.adm; return ['q', 'incMin', 'incMax', 'pcMax', 'sibMin', 'gnoMin'].filter(k => a[k] !== '').length + ['st', 'cls', 'kind', 'res', 'house', 'car'].filter(k => a[k] !== 'all').length + ['miss', 'dead', 'away', 'dis'].filter(k => a[k]).length; }
function vList() {
  const a = S.adm, cnt = [['all', 'Hepsi'], ['0', '0'], ['1', '1'], ['2', '2'], ['3', '3+']];
  const sel = (lbl, cur, arr, fn) => `<md-outlined-select label="${lbl}" class="mdw" onchange="${fn}">${arr.map(([v, t]) => `<md-select-option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}><div slot="headline">${t}</div></md-select-option>`).join('')}</md-outlined-select>`;
  const sw = (k, t) => `<label class="mdrow"><span>${t}</span><md-switch ${a[k] ? 'selected' : ''} onchange="admF('${k}',this.selected)"></md-switch></label>`;
  const chips = (lbl, k) => `<div><div class="mdlbl"><span>${lbl}</span></div><md-chip-set>${cnt.map(([v, t]) => `<md-filter-chip label="${t}" ${String(a[k]) === v ? 'selected' : ''} onclick="admChip('${k}','${v}',this)"></md-filter-chip>`).join('')}</md-chip-set></div>`;
  const sl = (id, title, ro, attrs, fn) => `<div><div class="mdlbl"><span>${title}</span><b id="${id}">${ro}</b></div><md-slider labeled ${attrs} oninput="${fn}"></md-slider></div>`;
  const stOpts = [['all', 'Tümü'], ...['Taslak', 'Beklemede', 'Eksik belge', 'Onaylandı', 'Reddedildi'].map(x => [x, x])];
  return `<div class="card overflow-hidden flex flex-col xl:flex-row mdf"><details class="mdpanel w-full border-b xl:border-b-0 xl:border-r border-gray-200 dark:border-amoled-border bg-gray-50/50 dark:bg-amoled-base/30" ${innerWidth >= 1280 ? 'open' : ''}><summary class="mdsum"><span class="ms">tune</span><span class="flex-1">Filtre ve sıralama</span><span id="afc" class="mdbadge">${admActive()}</span></summary><div class="p-4 pt-1 space-y-4">
   <md-outlined-text-field class="mdw" label="Arama" placeholder="İsim, TCKN, fakülte" value="${E(a.q)}" oninput="admF('q',this.value)"><span slot="leading-icon" class="ms">search</span></md-outlined-text-field>
   <div class="grid grid-cols-2 gap-3">${sel('Sırala', a.sort, [['rank', 'Sıra (kural)'], ['score', 'Puan'], ['total', 'Toplam gelir'], ['pc', 'Kişi başı gelir'], ['houses', 'Ev sayısı'], ['cars', 'Araç sayısı'], ['sib', 'Kardeş'], ['gno', 'Not ort.'], ['docs', 'Belge'], ['sent', 'Başvuru tarihi'], ['name', 'Ad']], 'S.adm.sort=this.value;admTable()')}${sel('Yön', a.dir, [[1, 'Artan'], [-1, 'Azalan']], 'S.adm.dir=+this.value;admTable()')}
   ${sel('Durum', a.st, stOpts, "admF('st',this.value)")}${sel('Sonuç (kural)', a.res, [['all', 'Tümü'], ['Burs', 'Burs'], ['Yedek', 'Yedek'], ['Elendi', 'Elendi']], "admF('res',this.value)")}
   ${sel('Sınıf', a.cls, [['all', 'Tümü'], ['Hazırlık', 'Hazırlık'], ...[1, 2, 3, 4, 5, 6].map(x => [String(x), x + '. sınıf'])], "admF('cls',this.value)")}${sel('Kayıt türü', a.kind, [['all', 'Tümü'], ['real', 'Gerçek'], ['demo', 'Demo']], "admF('kind',this.value)")}</div>
   ${sl('v_inc', 'Toplam gelir', TL(+a.incMin || 0) + ' - ' + (a.incMax ? TL(+a.incMax) : 'sınırsız'), `range min="0" max="${INC_MAX}" step="5000" value-start="${+a.incMin || 0}" value-end="${+a.incMax || INC_MAX}"`, "admSl('inc',this)")}
   ${sl('v_pc', 'Kişi başı gelir en fazla', a.pcMax ? TL(+a.pcMax) : 'sınırsız', `min="0" max="${PC_MAX}" step="500" value="${+a.pcMax || PC_MAX}"`, "admSl('pcMax',this)")}
   ${sl('v_gno', 'Not ortalaması en az', a.gnoMin ? (+a.gnoMin).toFixed(1).replace('.', ',') : 'hepsi', `min="0" max="4" step="0.1" value="${+a.gnoMin || 0}"`, "admSl('gnoMin',this)")}
   ${sl('v_sib', 'Kardeş sayısı en az', a.sibMin ? a.sibMin + ' ve üzeri' : 'hepsi', `min="0" max="6" step="1" value="${+a.sibMin || 0}"`, "admSl('sibMin',this)")}
   ${chips('Ev sayısı', 'house')}${chips('Araç sayısı', 'car')}
   <div class="mdsw">${sw('miss', 'Sadece belgesi eksik veya sorunlu')}${sw('dead', 'Anne veya baba vefat etmiş')}${sw('away', 'Yurt veya kirada kalan')}${sw('dis', 'Engelli')}</div>
   <md-outlined-button class="mdw" onclick="admReset()"><span slot="icon" class="ms">filter_alt_off</span>Filtreleri temizle</md-outlined-button><p id="acnt" class="text-xs text-gray-500 text-center"></p></div></details>
  <div class="flex-grow overflow-x-auto hidden md:block"><table class="w-full text-sm text-left"><thead class="text-xs text-gray-500 uppercase bg-gray-50/80 dark:bg-amoled-base/50 border-b border-gray-200 dark:border-amoled-border"><tr>${[['rank', '#'], ['name', 'Öğrenci'], ['', 'Eğitim'], ['total', 'Gelir'], ['houses', 'Ev/Araç'], ['gno', 'Not'], ['score', 'Puan'], ['docs', 'Evrak'], ['', 'Sonuç'], ['', '']].map(([k, t]) => `<th class="px-3 py-3 ${k ? 'cursor-pointer select-none' : ''}" ${k ? `onclick="admSort('${k}')"` : ''}>${t}${S.adm.sort === k ? '<span class="ms">' + (S.adm.dir > 0 ? 'arrow_upward' : 'arrow_downward') + '</span>' : ''}</th>`).join('')}</tr></thead><tbody id="atb"></tbody></table></div><div id="acards" class="md:hidden flex-grow divide-y divide-gray-100 dark:divide-amoled-border"></div></div>`;
}
function admFiltered() {
  const f = S.adm, rows = admRank(), nq = N(f.q || ''), has = v => v !== '' && !isNaN(+v), cn = (v, x) => v === 'all' || (v === '3' ? x >= 3 : x === +v);
  const l = rows.filter(r => {
    const a = r.a, m = r.m; if (f.st !== 'all' && a.status !== f.st) return 0; if (f.res !== 'all' && r.res !== f.res) return 0; if (f.kind !== 'all' && (f.kind === 'demo') !== !!a.demo) return 0;
    if (f.cls !== 'all') { const sn = N(a.F.sinif || ''); if (f.cls === 'Hazırlık' ? !/HAZIRLIK/.test(sn) : !new RegExp('(^|\\D)' + f.cls + '([. ]|$)').test(sn)) return 0; }
    if (f.miss && m.docsOk) return 0; if (has(f.incMin) && m.total < +f.incMin) return 0; if (has(f.incMax) && m.total > +f.incMax) return 0; if (has(f.pcMax) && m.pc > +f.pcMax) return 0;
    if (has(f.gnoMin) && (m.gno === null || m.gno < +f.gnoMin)) return 0; if (!cn(f.house, m.houses) || !cn(f.car, m.cars)) return 0; if (has(f.sibMin) && m.sib < +f.sibMin) return 0;
    if (f.dead && !m.dead) return 0; if (f.away && !m.away) return 0; if (f.dis && !m.dis) return 0;
    if (nq && !N([a.F.ad, a.F.tc, a.F.fakulte, a.F.mail].join(' ')).includes(nq)) return 0; return 1;
  });
  const key = { rank: r => r.rank || 9999, score: r => r.sc, total: r => r.m.total, pc: r => r.m.pc, houses: r => r.m.houses, cars: r => r.m.cars, sib: r => r.m.sib, gno: r => r.m.gno === null ? -1 : r.m.gno, docs: r => r.m.docsOk ? 1 : 0, sent: r => r.a.sent || 0, name: r => N(r.a.F.ad || r.a.F.tc) }[f.sort] || (r => r.rank);
  return l.sort((x, y) => { const a = key(x), b = key(y); return (a < b ? -1 : a > b ? 1 : 0) * f.dir; });
}
const resB = r => `<span class="text-[10px] font-bold px-2 py-0.5 rounded ${stBadge(AS[r.res])}">${r.res}${r.res === 'Elendi' ? '' : ' #' + r.rank}</span>`;
function admTable() {
  const tb = $('#atb'); if (!tb) return; const l = admFiltered(), c = $('#acnt'); if (c) c.textContent = l.length + ' / ' + S.adm.list.length + ' kayıt gösteriliyor'; const fb = $('#afc'); if (fb) fb.textContent = admActive();
  tb.innerHTML = l.map(r => { const a = r.a, m = r.m, f = a.F; return `<tr class="border-b border-gray-100 dark:border-amoled-border hover:bg-gray-50 dark:hover:bg-amoled-hover"><td class="px-3 py-3 text-xs font-bold">${r.rank || '—'}</td><td class="px-3 py-3"><div class="font-medium text-gray-900 dark:text-white">${E(f.ad || f.tc)}${a.demo ? ' <span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">DEMO</span>' : ''}</div><div class="text-xs text-gray-500">${E(f.tc)} · <span class="${stBadge(a.status)} px-1.5 rounded text-[10px]">${E(a.status)}</span></div></td><td class="px-3 py-3 text-xs text-gray-600 dark:text-gray-300">${E(f.fakulte || '—')}<br>${E(f.sinif || '')}</td><td class="px-3 py-3 text-xs">${TL(m.total)}<br><span class="text-gray-500">kişi başı ${TL(m.pc)}</span></td><td class="px-3 py-3 text-xs">${m.houses} ev · ${m.cars} araç<br><span class="text-gray-500">${m.sib} kardeş</span></td><td class="px-3 py-3 text-xs">${m.gno === null ? '—' : m.gno}</td><td class="px-3 py-3"><b>${r.sc}</b></td><td class="px-3 py-3 text-xs"><span class="${m.docsOk ? 'text-green-600' : 'text-red-600'} font-semibold">${m.dp}</span></td><td class="px-3 py-3">${resB(r)}${r.f.length ? `<div class="text-[10px] text-red-600 mt-1 max-w-[180px]">${E(r.f[0])}${r.f.length > 1 ? ' +' + (r.f.length - 1) : ''}</div>` : ''}</td><td class="px-3 py-3 text-right"><button class="btn-p !py-1 !text-xs" onclick="admOpen('${f.tc}')">İncele</button></td></tr>`; }).join('') || '<tr><td colspan="10" class="px-4 py-8 text-center text-gray-500">Başvuru bulunamadı.</td></tr>';
  const ac = $('#acards'); if (ac) ac.innerHTML = l.map(r => { const a = r.a, m = r.m, f = a.F; return `<div class="acard" onclick="admOpen('${f.tc}')"><div class="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-600/15 text-primary-600 flex items-center justify-center font-bold shrink-0">${r.sc}</div><div class="min-w-0 flex-1"><div class="font-semibold text-sm truncate text-gray-900 dark:text-white">${E(f.ad || f.tc)}${a.demo ? ' <span class="text-[10px] text-purple-600">DEMO</span>' : ''}</div><div class="text-xs text-gray-500 truncate">${E([f.fakulte, f.sinif].filter(Boolean).join(' · ') || f.tc)}</div><div class="mt-1 text-[11px] text-gray-600 dark:text-gray-300">${TL(m.total)} · ${m.houses} ev · ${m.cars} araç · Not ${m.gno === null ? '—' : m.gno}</div><div class="text-[11px] ${m.docsOk ? 'text-green-600' : 'text-red-600'} font-semibold">${m.dp} belge</div></div><div class="text-right">${resB(r)}<div class="text-[10px] text-gray-500 mt-1">${E(a.status)}</div></div></div>`; }).join('') || '<p class="p-8 text-center text-sm text-gray-500">Başvuru bulunamadı.</p>';
  countUp();
}
/* ---- Şartlar ve puanlama ---- */
function vSet() {
  const s = S.adm.set, num = (v, fn, w = 'w-24') => `<input type="number" class="inp ${w} !py-1" value="${v ?? ''}" onchange="${fn}">`;
  return `<div class="grid grid-cols-1 lg:grid-cols-2 gap-5"><div class="card p-5"><h3 class="font-bold text-gray-900 dark:text-white mb-1"><span class="ms text-red-500 mr-1.5">block</span>Eleme şartları</h3><p class="text-xs text-gray-500 mb-3">İşaretlediğiniz şartı sağlamayan başvuru “Elendi” olur. Kalanlar puana göre sıralanır.</p>
   <div class="space-y-2">${L.RULES.map(r => `<div class="flex items-center gap-3 text-sm"><label class="flex items-center gap-2 flex-1 cursor-pointer"><input type="checkbox" ${s.rules[r.id].on ? 'checked' : ''} onchange="admSet('rules','${r.id}','on',this.checked)"> ${r.t}</label>${r.b ? '' : num(s.rules[r.id].v, `admSet('rules','${r.id}','v',+this.value)`)}</div>`).join('')}</div>
   <div class="mt-5 pt-4 border-t border-gray-100 dark:border-amoled-border flex items-center gap-3 text-sm"><b class="flex-1"><span class="ms text-green-600 mr-1.5">emoji_events</span>Burs kontenjanı (kişi)</b><md-slider labeled min="0" max="100" step="1" value="${s.quota}" style="width:170px" oninput="admQuota(this.value)"></md-slider></div></div>
  <div class="card p-5"><h3 class="font-bold text-gray-900 dark:text-white mb-1"><span class="ms text-primary-500 mr-1.5">balance</span>Puanlama ölçütleri</h3><p class="text-xs text-gray-500 mb-3">Seçtiğiniz ölçütler ağırlığa göre 0–100 puana çevrilir. Tavan/üst sınır = tam puan için sınır değer.</p>
   <div class="space-y-2">${L.CRIT.map(c => `<div class="flex items-center gap-2 text-sm"><label class="flex items-center gap-2 flex-1 cursor-pointer min-w-0"><input type="checkbox" ${s.crit[c.id].on ? 'checked' : ''} onchange="admSet('crit','${c.id}','on',this.checked)"><span class="truncate">${c.t}</span></label><span class="text-[10px] text-gray-500">ağırlık</span><md-slider labeled min="0" max="40" step="1" value="${s.crit[c.id].w}" style="width:130px" oninput="admSet('crit','${c.id}','w',+this.value)"></md-slider>${c.p ? num(s.crit[c.id].p, `admSet('crit','${c.id}','p',+this.value)`, 'w-20') : ''}</div>`).join('')}</div></div></div>
  <div class="mt-4 flex flex-wrap gap-2"><button class="btn-p" onclick="admSave()"><span class="ms">save</span> Kaydet</button><button class="btn" onclick="S.adm.set=L.defSet();admSave()">Varsayılana dön</button><button class="btn" onclick="admApprove()"><span class="ms">done_all</span> Burs listesini onayla</button><button class="btn" onclick="S.adm.view='list';$('#app').innerHTML=vAdmin();admTable()">Listeye dön</button></div>`;
}
function admSet(g, id, k, v) { S.adm.set[g][id][k] = v; }
function admQuota(v) { S.adm.set.quota = Math.max(0, +v || 0); }
async function admSave() { try { await api('/api/admin/settings', { method: 'PUT', json: { settings: S.adm.set } }); S.adm.set = L.mergeSet(S.adm.set); toast('Kaydedildi – liste güncellendi'); $('#app').innerHTML = vAdmin(); } catch (e) { toast(e.message); } }
async function admApprove() {
  await admSave(); const t = admRank().filter(r => r.res === 'Burs' && r.a.status !== 'Onaylandı'); if (!t.length) return toast('Onaylanacak yeni kayıt yok');
  if (!confirm(t.length + ' öğrenci “Onaylandı” yapılsın mı? (Kontenjan: ' + S.adm.set.quota + ')')) return;
  for (const r of t) await api('/api/admin/app/' + r.a.F.tc, { method: 'PUT', json: { status: 'Onaylandı' } }); toast(t.length + ' başvuru onaylandı'); loadAdmin();
}
async function admSeed() { try { await api('/api/admin/seed?n=12', { method: 'POST' }); toast('12 örnek (demo) başvuru eklendi'); loadAdmin(); } catch (e) { toast(e.message); } }
async function admDemoDel() { if (!confirm('Tüm demo kayıtlar silinsin mi?')) return; try { const d = await api('/api/admin/demo', { method: 'DELETE' }); toast(d.n + ' demo kayıt silindi'); loadAdmin(); } catch (e) { toast(e.message); } }
async function admOpen(tc) {
  const a = (await api('/api/admin/app/' + tc)).app, f = a.F, d = $('#adet'); S.adm.sel = a; const r = admRank().find(x => x.a.F.tc === tc) || { m: L.metrics(a), f: [], sc: 0, res: '—', rank: 0 }, m = r.m;
  const kv = (l, v) => `<div class="rounded-lg bg-gray-50 dark:bg-amoled-base p-2 text-center"><div class="text-[10px] text-gray-500">${l}</div><div class="text-sm font-bold">${v}</div></div>`;
  d.innerHTML = `<div class="fixed inset-0 z-[90] bg-black/70 overflow-auto p-3 sm:p-6" onclick="if(event.target===this)admClose()"><div class="card max-w-4xl mx-auto p-5 sm:p-6 fade-in">
  <div class="flex justify-between items-start gap-3 mb-4"><div><h3 class="text-xl font-bold text-gray-900 dark:text-white">${E(f.ad || tc)} ${resB(r)}</h3><p class="text-xs text-gray-500">${E(tc)} · ${E(f.fakulte || '')} ${E(f.sinif || '')}${a.demo ? ' · DEMO kayıt' : ''}</p></div><button class="btn" onclick="admClose()"><span class="ms">close</span></button></div>
  <div class="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">${kv('Puan', r.sc)}${kv('Toplam gelir', TL(m.total))}${kv('Kişi başı', TL(m.pc))}${kv('Ev / Araç', m.houses + ' / ' + m.cars)}${kv('Kardeş', m.sib)}${kv('Not ort.', m.gno === null ? '—' : m.gno)}</div>
  ${r.f.length ? `<div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 text-xs text-red-700 dark:text-red-400 mb-3"><b>Eleme nedeni:</b> ${r.f.map(E).join(' · ')}</div>` : ''}
  <div class="flex flex-wrap gap-1.5 mb-3">${['Taslak', 'Beklemede', 'Eksik belge', 'Onaylandı', 'Reddedildi'].map(s => `<span class="chip ${a.status === s ? 'on' : ''}" onclick="admSt('${tc}','${s}')">${s}</span>`).join('')}</div>
  <label class="lbl">Not (öğrenci görür)</label><textarea class="inp" rows="2" onchange="admNote('${tc}',this.value)">${E(a.note || '')}</textarea>
  <h4 class="text-sm font-bold mt-5 mb-2">Belgeler (${a.docs.length})</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-3">${a.docs.map((x, i) => { const dd = D.find(y => y.k === x.k); return `<div class="flex gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-amoled-border">${x.thumb ? `<img src="${x.thumb}" class="w-14 h-[72px] object-cover rounded cursor-zoom-in" onclick="admPv(${i})">` : ''}<div class="min-w-0 text-xs"><b class="text-sm">${E(dd ? dd.t : 'Tanınmayan')}</b> <span class="text-gray-500">· ${WN[x.w] || '?'}</span><div class="text-gray-400 truncate">${E(x.name)}</div>${(x.info || []).map(t => `<div>- ${E(t)}</div>`).join('')}${(x.ck || []).filter(c => c.t !== 'ok' || /doğrulandı|Güncel/.test(c.m)).map(c => `<div class="${dcls[c.t]}"><span class="ms mr-1">${dico[c.t]}</span>${E(c.m)}</div>`).join('')}${x.file ? `<button class="btn mt-1" onclick="admPv(${i})"><span class="ms">visibility</span> Aç</button>` : ''}</div></div>`; }).join('') || '<p class="text-sm text-gray-500">Belge yok.</p>'}</div>
  <h4 class="text-sm font-bold mt-5 mb-2">Form bilgileri</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">${ALLF().map(x => `<div class="flex gap-2 border-b border-gray-100 dark:border-amoled-border py-1"><span class="text-gray-500 w-1/2 shrink-0 text-xs">${x[1]}</span><span class="break-words min-w-0">${E(f[x[0]] || '—').replace(/\n/g, '<br>')}</span></div>`).join('')}</div>
  <div class="mt-5 flex justify-between"><button class="btn text-red-600" onclick="admDel('${tc}')"><span class="ms">delete</span> Başvuruyu sil</button><button class="btn-p" onclick="admClose()">Kapat</button></div></div></div>`;
}
function admClose() { $('#adet').innerHTML = ''; loadAdmin(); }
function admPv(i) { const a = S.adm.sel; pv(i, a.docs[i], a.F.tc); $('#pv').style.zIndex = 120; }
async function admSt(tc, s) { await api('/api/admin/app/' + tc, { method: 'PUT', json: { status: s } }); await admOpen(tc); toast('Durum: ' + s); }
async function admNote(tc, n) { await api('/api/admin/app/' + tc, { method: 'PUT', json: { note: n } }); toast('Not kaydedildi'); }
async function admDel(tc) { if (!confirm('Bu başvuru ve belgeleri kalıcı silinsin mi?')) return; await api('/api/admin/app/' + tc, { method: 'DELETE' }); admClose(); }
function csv() {
  const cols = ALLF(), q = x => '"' + String(x ?? '').replace(/"/g, '""').replace(/\n/g, ' | ') + '"';
  const rows = [['Sıra', 'Sonuç', 'Puan', 'Durum', 'Kayıt', 'Toplam gelir', 'Kişi başı gelir', 'Ev', 'Araç', 'Kardeş', 'Not ort.', 'Belge', 'Eleme nedeni', ...cols.map(c => c[1])].map(q).join(';')].concat(admFiltered().map(r => [r.rank || '', r.res, r.sc, r.a.status, r.a.demo ? 'Demo' : 'Gerçek', r.m.total, r.m.pc, r.m.houses, r.m.cars, r.m.sib, r.m.gno ?? '', r.m.dp, r.f.join(' | '), ...cols.map(c => r.a.F[c[0]])].map(q).join(';')));
  const b = new Blob(['\ufeff' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }), u = URL.createObjectURL(b), l = document.createElement('a'); l.href = u; l.download = 'burs-basvurulari.csv'; l.click();
}
boot();
