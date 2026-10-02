'use strict';
const UNI = 'Tekirdağ Namık Kemal Üniversitesi – Tıp Fakültesi';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
const $ = s => document.querySelector(s);
const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const { N, tcase, WN, D, SL } = L;
const S = { user: null, token: localStorage.tto_token || '', app: null, tab: 'terms', f: { q: '', st: 'all', who: 'all', cat: 'all' }, mode: 'in', log: '', adm: { list: [], set: null, view: 'list', rows: [], q: '', st: 'all', cls: 'all', kind: 'all', res: 'all', miss: false, incMin: '', incMax: '', pcMax: '', house: 'all', car: 'all', sibMin: '', gnoMin: '', dead: false, away: false, dis: false, sort: 'rank', dir: 1, sel: null } };
let F, A;

const toast = m => { const t = $('#tt'); t.textContent = m; t.classList.remove('hidden'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add('hidden'), 3200); };
async function api(p, o = {}) {
  const r = await fetch(p, { method: o.method || 'GET', headers: Object.assign({ 'X-Mode': window.MODE }, S.token ? { Authorization: 'Bearer ' + S.token } : {}, o.json ? { 'Content-Type': 'application/json' } : {}, o.headers || {}), body: o.json ? JSON.stringify(o.json) : o.body });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && S.user) { S.user = null; S.token = ''; localStorage.removeItem('tto_token'); render(); toast('Oturum süresi doldu'); }
  if (!r.ok) { const e = new Error(d.error || 'Sunucu hatası (' + r.status + ')'); e.status = r.status; throw e; }
  return d;
}
let st, sv = Promise.resolve(), dirty = false;
function save() { dirty = true; clearTimeout(st); st = setTimeout(flushSave, 600); }
const saveNow = () => { dirty = true; return flushSave(); };
function flushSave() {
  clearTimeout(st);
  sv = sv.then(async () => {
    if (!A || !dirty) return;
    dirty = false;
    try { await api('/api/app', { method: 'PUT', json: { F, docs: A.docs, terms: A.terms } }); }
    catch (e) { dirty = true; toast('Kaydedilemedi: ' + e.message); }
  });
  return sv;
}
document.addEventListener('visibilitychange', () => { if (document.hidden && dirty) flushSave(); });
const stBadge = s => ({ Taslak: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', Beklemede: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', 'Eksik belge': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', Onaylandı: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', Reddedildi: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }[s] || 'bg-gray-100 text-gray-700');
const dcls = { ok: 'text-green-600 dark:text-green-400', warn: 'text-orange-600 dark:text-orange-400', bad: 'text-red-600 dark:text-red-400' };
const dico = { ok: 'check_circle', warn: 'warning', bad: 'cancel' };

function toggleTheme() { const d = document.documentElement.classList.toggle('dark'); localStorage.theme = d ? 'dark' : 'light'; themeIcon(); }
function themeIcon() { $('#themeIcon').textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode'; }
function home() { render(); }
async function logout() { try { await flushSave(); await api('/api/logout', { method: 'POST' }); } catch (e) {} S.user = null; S.unlock = 0; S.token = ''; A = F = null; localStorage.removeItem('tto_token'); S.mode = 'in'; render(); }
function chrome() { const c = $('#demoChip'); if (c) c.classList.toggle('hidden', !window.DEMO); }
async function boot() {
  themeIcon(); chrome();
  try { const c = await api('/api/cfg'); applyLock(c.lock); S.term = c.term; chrome(); } catch (e) {}
  render();
  if (S.token) { try { const d = await api('/api/me'); setUser(d); render(); } catch (e) { if (e.status === 401 || e.status === 403) { S.token = ''; localStorage.removeItem('tto_token'); } } }
}
function setUser(d) { S.user = d.user; S.unlock = window.DEMO && d.user.role === 'student' ? 1 : S.unlock; if (d.cfg) { L.setCustom(d.cfg.custom); S.term = d.cfg.term; } S.demoUser = !!d.demo; if (d.app) { A = S.app = d.app; F = A.F; F._a = F._a || {}; A.docs = (A.docs || []).filter(d => d.k === '?' || L.known(d.k)); S.tab = firstOpen(); } if (d.user.role === 'admin') loadAdmin(); }
let loging = false;
async function login() {
  if (loging) return;
  const lt = $('#lt'), lp = $('#lp'), b = $('#lbtn'), er = $('#lerr'), tc = (lt ? lt.value : '').trim(), pw = lp ? lp.value : '';
  if (er) er.textContent = '';
  if (!tc || !pw) { const m = !tc ? 'TCKN (veya kullanıcı adı) girin' : 'Şifre girin'; if (er) er.textContent = m; toast(m); return; }
  loging = true;
  const btn0 = '<span>Giriş Yap</span><span class="ms">arrow_forward</span>';
  if (b) { b.disabled = true; b.innerHTML = '<span class="ms spin">progress_activity</span><span>Giriş yapılıyor…</span>'; }
  try { const d = await api('/api/login', { method: 'POST', json: { tc, pw } }); S.token = d.token; localStorage.tto_token = d.token; const me = await api('/api/me'); setUser(me); render(); }
  catch (e) {
    S.user = null; const b2 = $('#lbtn'), er2 = $('#lerr'); if (er2) er2.textContent = e.message; toast(e.message);
    const c = $('#lcard'); if (c) { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }
    if (b2) { b2.disabled = false; b2.innerHTML = btn0; }
    if (!$('#lt')) { render(); const l1 = $('#lt'), l2 = $('#lp'); if (l1) l1.value = tc; if (l2) l2.value = pw; const e3 = $('#lerr'); if (e3) e3.textContent = e.message; }
  }
  finally { loging = false; }
}
async function register() {
  const v = id => $(id).value.trim(), b = { tc: v('#rt'), name: v('#rn'), email: v('#re'), tel: v('#rtel'), uni: v('#ru'), code: v('#rk'), pw: $('#rp').value };
  if (b.pw !== $('#rp2').value) return toast('Şifreler uyuşmuyor');
  try { await api('/api/register', { method: 'POST', json: b }); toast('Kayıt tamamlandı'); S.mode = 'in'; render(); $('#lt').value = b.tc; $('#lp').value = b.pw; login(); }
  catch (e) { toast(e.message); }
}

const FL = [['ad', 'Adınız – Soyadınız', 't', 1], ['tc', 'T.C. Kimlik Numaranız', 't', 1], ['dogum', 'Doğum Yeri ve Tarihiniz', 't', 1], ['adres', 'İkamet Adresiniz', 'a', 1], ['tel', 'Telefon Numaranız', 't', 1], ['mail', 'Elektronik Posta Adresiniz', 't', 1],
  ['okul', 'En Son Mezun Olduğunuz Okul', 't', 2], ['gecmisBurs', 'Geçmişte Burs Aldınız mı?', 'y', 2], ['fakulte', 'Kayıtlı Olduğunuz Tıp Fakültesi', 's', 2, [UNI]], ['giris', 'Tıp Fakültesi Giriş Tarihiniz', 't', 2], ['sinif', 'Sınıfınız', 't', 2], ['okulno', 'Okul Numaranız', 't', 2], ['gno', 'Önceki Dönem Not Ortalamanız', 't', 2], ['dil', 'Bildiğiniz Yabancı Diller', 't', 2], ['yksTyt', 'YKS – TYT Başarı Sırası (Puan)', 't', 2], ['yksSay', 'YKS – Sayısal (SAY) Başarı Sırası (Puan)', 't', 2], ['yksEa', 'YKS – Eşit Ağırlık (EA) Başarı Sırası (Puan)', 't', 2], ['yksSoz', 'YKS – Sözel (SÖZ) Başarı Sırası (Puan)', 't', 2], ['yksDil', 'YKS – Dil Başarı Sırası (Puan)', 't', 2], ['yerlesPuan', 'ÖSYM Yerleştirme Puanı', 't', 2], ['yerlesSira', 'ÖSYM Yerleştirme Başarı Sırası', 't', 2],
  ['medeni', 'Medeni Durumunuz', 's', 3, ['Bekar', 'Evli']], ['cocuk', 'Çocuk Sayısı', 't', 3], ['gelir', 'Çalışıyorsanız Aylık Geliriniz', 't', 3], ['malvarlik', 'Taşınır – Taşınmaz Malvarlığınız', 'a', 3], ['ozelBurs', 'Burs Aldığınız Özel Kurumlar', 't', 3], ['ozelMik', 'Aylık Burs Miktarı (özel)', 't', 3], ['kamuBurs', 'Burs Aldığınız Kamu Kurumları', 't', 3], ['kamuMik', 'Aylık Burs Miktarı (kamu)', 't', 3], ['tabipBurs', 'Tabip Odası’ndan Burs Aldınız mı?', 'y', 3], ['ailedeMi', 'Ailenizle mi ikamet ediyorsunuz?', 'y', 3], ['yurt', 'Yurtta Kalıyorsanız Adı – Adresi', 't', 3], ['kira', 'Evde Kalıyorsanız Kira Miktarı', 't', 3], ['evArk', 'Varsa Ev Arkadaşı Sayısı', 't', 3], ['gider', 'Aylık Giderleriniz (Ücret, Kira, Fatura vb.)', 't', 3], ['engel', 'Bedensel Bir Engeliniz Var mı?', 'y', 3], ['hobi', 'Hobiler ve Özel Uğraşı Alanlarınız', 't', 3], ['dernek', 'Üye Olduğunuz Dernek Vb.', 't', 3]];
const PF = p => [[p + '.ad', 'Adı – Soyadı', 't'], [p + '.tc', 'T.C. Kimlik No', 't'], [p + '.hayat', 'Hayatta mı?', 'y'], [p + '.adres', 'İkamet Adresi', 'a'], [p + '.meslek', 'Meslek ya da Yaptığı İş', 't'], [p + '.isyeri', 'Çalıştığı Yerin Adresi', 'a'], [p + '.gelir', 'Aylık Geliri', 't'], [p + '.tel', 'Telefon Numarası', 't']];
const AYRI = ['', 'Anne ve babamla birlikte yaşıyorum', 'Annemle yaşıyorum (anne-baba ayrı)', 'Babamla yaşıyorum (anne-baba ayrı)', 'Yurtta kalıyorum', 'Kirada kalıyorum', 'Akrabamla yaşıyorum', 'Diğer'];
const FL4 = [['bakma', 'Ailenin Bakmakla Yükümlü Olduğu Çocuklar (Ad-Soyad, Yaş, Öğrenim)', 'a'], ['aileMal', 'Ailenin Taşınır – Taşınmaz Malvarlığı', 'a'], ['aileGelir', 'Ailenin Varsa Ücret Dışı Gelirleri', 'a'], ['ayri', 'Aile Durumu (Kiminle Yaşıyorsunuz?)', 's', 4, AYRI]];
const ALLF = () => [...FL, ...PF('anne'), ...PF('baba'), ...FL4, ...L.Q.map(q => [q.key, q.t, q.type, q.sec, q.opts])];
const REQF = L.REQF;

const OCR = (() => {
  const size = Math.max(2, Math.min(3, navigator.hardwareConcurrency || 2)), idle = [], waits = [];
  let made = 0;
  const make = async () => {
    made++;
    try {
      const w = await Tesseract.createWorker('tur', 1, { workerPath: 'vendor/tess/worker.min.js', corePath: 'vendor/tess/core/', langPath: 'vendor/tess/', gzip: false });
      w.jobs = 0; return w;
    } catch (e) { made--; throw e; }
  };
  const take = () => idle.length ? Promise.resolve(idle.pop()) : made < size ? make() : new Promise((res, rej) => waits.push({ res, rej }));
  const give = (w, bad) => {
    if (bad || w.jobs >= 40) { made--; w.terminate().catch(() => {}); const q = waits.shift(); if (q) make().then(q.res, q.rej); return; }
    const q = waits.shift(); q ? q.res(w) : idle.push(w);
  };
  const run = async cv => {
    const w = await take(); let bad = false;
    try { const r = await w.recognize(cv); w.jobs++; return r.data.text; } catch (e) { bad = true; throw e; } finally { give(w, bad); }
  };
  const warm = n => { let k = Math.min(n || 1, size) - made; while (k-- > 0) make().then(w => give(w), () => {}); };
  return { size, run, warm };
})();
setTimeout(() => { try { OCR.warm(1); } catch (e) {} }, 1500);
const SHORTDOC = ['kyk', 'yurt', 'ikamet', 'ogrenci', 'adli', 'vergi', 'a4a', 'a4b', 'a4c', 'yerles', 'sinav'];
async function ocr(c) {
  const H = 2400, O = 50, cut = (y, h) => { const p = document.createElement('canvas'); p.width = c.width; p.height = h; p.getContext('2d').drawImage(c, 0, y, c.width, h, 0, 0, c.width, h); return p; };
  const run = async p => { try { try { return await OCR.run(p); } catch (e) { return await OCR.run(p); } } finally { p.width = 0; } };
  let y0 = 0, head = '';
  if (c.height > 2600) { head = await run(cut(0, 1500)); const k = (L.classify(L.N(head)) || {}).k; if (SHORTDOC.includes(k)) { c.width = 0; return head; } y0 = 1450; }
  const parts = [];
  for (let y = y0; y < c.height && parts.length < 8; y += H - O) { const h = Math.min(H, c.height - y); if (parts.length && h < 30) break; parts.push(cut(y, h)); }
  const out = await Promise.all(parts.map(run)); c.width = 0;
  return [head, ...out].filter(Boolean).join('\n');
}
const thumbOf = (src, w, h, wd) => { const c = document.createElement('canvas'), r = Math.min(1, wd / w); c.width = Math.round(w * r); c.height = Math.round(h * r); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .55); };
async function pageCanvas(pg, wpx) {
  const v = pg.getViewport({ scale: 1 }), vp = pg.getViewport({ scale: wpx / v.width }), cv = document.createElement('canvas');
  cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
  await pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise; return cv;
}
async function thumbOnly(f) {
  if (/pdf/i.test(f.type) || /\.pdf$/i.test(f.name)) return readFile(f);
  try { const bm = await createImageBitmap(f), th = thumbOf(bm, bm.width, bm.height, 360); if (bm.close) bm.close(); return { text: '', thumb: th, src: 'img' }; } catch (e) { return readFile(f); }
}
async function readFile(f) {
  if (/pdf/i.test(f.type) || /\.pdf$/i.test(f.name)) {
    const pdf = await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise, n = Math.min(pdf.numPages, 8), pages = []; let txt = '';
    for (let i = 1; i <= n; i++) { const pg = await pdf.getPage(i); pages.push(pg); txt += L.lines((await pg.getTextContent()).items) + '\n'; }
    if (txt.trim().length >= 30) { const c = await pageCanvas(pages[0], 360); return { text: txt, thumb: c.toDataURL('image/jpeg', .55), src: 'pdf' }; }
    const cs = []; for (const pg of pages.slice(0, 3)) cs.push(await pageCanvas(pg, 1500));
    const th = thumbOf(cs[0], cs[0].width, cs[0].height, 360);
    return { text: (await Promise.all(cs.map(ocr))).join('\n'), thumb: th, src: 'pdf' };
  }
  const bm = await createImageBitmap(f).catch(async () => { const im = new Image(), u = URL.createObjectURL(f); im.src = u; await im.decode(); URL.revokeObjectURL(u); return im; });
  const sc = Math.min(1, 1700 / bm.width), c = document.createElement('canvas'); c.width = Math.round(bm.width * sc); c.height = Math.round(bm.height * sc);
  const x = c.getContext('2d'); x.filter = 'grayscale(1) contrast(1.2)'; x.drawImage(bm, 0, 0, c.width, c.height); x.filter = 'none';
  const th = thumbOf(bm, bm.width, bm.height, 360); if (bm.close) bm.close();
  const d = x.getImageData(0, 0, c.width, Math.min(c.height, 600)).data; let sm = 0, n = 0; for (let i = 0; i < d.length; i += 16) { sm += d[i] + d[i + 1] + d[i + 2]; n += 3; }
  const dark = sm / n < 110; if (dark) { x.globalCompositeOperation = 'difference'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
  return { text: await ocr(c), thumb: th, src: 'img', dark };
}

const UQ = { q: [], run: 0, total: 0, done: 0, ok: 0, fail: [], rej: [] }, CONC = OCR.size + 1;
function handleFiles(files, slot) {
  const arr = [...files]; if (!arr.length) return;
  if (L.idMiss(F).length) return toast('Önce kimlik bilgilerini doldurun');
  OCR.warm(Math.min(arr.length, OCR.size));
  arr.forEach(f => { if (f.size > 25e6) UQ.fail.push(f.name + ' (25 MB üstü)'); else { UQ.q.push({ f, slot }); UQ.total++; } });
  pump();
}
function pump() {
  while (UQ.run < CONC && UQ.q.length) {
    const j = UQ.q.shift(); UQ.run++;
    one(j).then(() => UQ.ok++).catch(e => { console.error(e); UQ.fail.push(j.f.name); }).finally(() => { UQ.run--; UQ.done++; renderSoon(); pump(); });
  }
  if (!UQ.q.length && !UQ.run && UQ.total) finish(); else status();
}
const sig = t => N(t || '').replace(/[^A-Z0-9]/g, '').slice(0, 500);
function mergeInto(ex, d) {
  ex.text = ((ex.text || '') + '\n' + (d.text || '')).slice(0, 16000);
  const m = L.analyze(ex.text, F, ex.src || 'x', Date.now(), { k: ex.k, w: ex.w });
  ex.ck = m.ck; ex.info = m.info; L.apply(F, m.patches);
  ex.extra = (ex.extra || []).concat([{ name: d.name, file: d.file }]);
}
async function one({ f, slot }) {
  const s = slot && SL.find(x => x.id === slot);
  const up0 = api('/api/upload?name=' + encodeURIComponent(f.name), { method: 'POST', body: f, headers: { 'Content-Type': 'application/octet-stream' } }); up0.catch(() => {});
  const r = await (s && (s.k === 'foto' || (s.custom && s.ocr && s.ocr.off)) ? thumbOnly(f) : readFile(f));
  const a = L.analyze(r.text, F, r.src, Date.now(), s ? { k: s.k, w: s.w } : undefined);
  let k = a.k || '?', w = a.w;
  const up = await up0; if (!A) return;
  const nd = { name: f.name, file: up.file, thumb: r.thumb, text: r.text.slice(0, 12000), src: r.src, ts: Date.now(), dark: !!r.dark };
  // 1) aynı belge tekrar yüklendiyse sessizce atla
  const dup = A.docs.find(d => d.k !== 'foto' && d.src !== 'beyan' && d.text && r.text && sig(d.text) === sig(r.text) && sig(r.text).length > 40);
  if (dup) { UQ.dup = (UQ.dup || 0) + 1; return; }
  // 2) adı görünmeyen devam/ek ekran görüntüsü: aynı türde tek belge varsa ona ekle
  const noName = a.ck.some(c => c.t === 'bad' && /adı|ad-soyad|metin okunamadı/.test(c.m)) && !a.ck.some(c => c.t === 'bad' && /gibi görünüyor|uyuşmuyor|adına/.test(c.m));
  if (k !== '?' && k !== 'foto' && L.known(k) && noName && r.src === 'img') {
    let ex = A.docs.find(d => d.id === k + ':' + w && w !== '?' && d.src !== 'beyan' && L.dstat(d) !== 'bad');
    if (!ex && w === '?') { const cs = A.docs.filter(d => d.k === k && d.w !== '?' && L.dstat(d) !== 'bad'); if (cs.length === 1) ex = cs[0]; }
    if (ex) { mergeInto(ex, { ...nd }); saveNow(); return; }
  }
  if (a.ck.some(c => c.t === 'bad')) UQ.rej.push(f.name);
  const id = k + ':' + w;
  // 3) otomatik tanınan, aynı kutuda belge varsa ve içerik farklıysa birleştir (çok ekranlı belge)
  const ex2 = !s && w !== '?' && A.docs.find(d => d.id === id && d.src !== 'beyan' && L.dstat(d) !== 'bad');
  if (ex2 && !a.ck.some(c => c.t === 'bad')) { mergeInto(ex2, { ...nd }); saveNow(); return; }
  if (w !== '?') A.docs = A.docs.filter(d => d.id !== id);
  L.apply(F, a.patches || []);
  A.docs.push({ id, k, w, ...nd, ck: a.ck, info: a.info });
  saveNow();
}
function status() {
  const t = UQ.total, d = UQ.done, bar = $('#lgb');
  setLog(t && d < t ? `Okunuyor: ${d}/${t} tamamlandı · ${UQ.run} belge işleniyor` : '');
  if (bar) bar.style.width = t && d < t ? Math.round(d / t * 100) + '%' : '0';
}
function finish() {
  const { ok, fail, rej, dup } = UQ; Object.assign(UQ, { total: 0, done: 0, ok: 0, fail: [], rej: [], dup: 0 });
  setLog(''); const bar = $('#lgb'); if (bar) bar.style.width = '0';
  if (A) { L.refresh(F, A.docs); dirty = true; flushSave(); renderDocs(); sidebar(); }
  const m = [ok ? ok + ' belge yüklendi ve kaydedildi' : '', dup ? dup + ' aynı belge atlandı' : '', rej.length ? 'Kabul edilmeyen: ' + rej.join(', ') : '', fail.length ? 'Okunamadı: ' + fail.join(', ') : ''].filter(Boolean).join(' · ');
  if (m) toast(m.slice(0, 160));
}
let rs;
const renderSoon = () => { if (rs) return; rs = setTimeout(() => { rs = 0; if (A) { renderDocs(); sidebar(); } }, 300); };
function setLog(t) { S.log = t; const e = $('#lg'); if (e) e.innerHTML = t ? '<span class="ms spin mr-1">progress_activity</span>' + E(t) : ''; }
function assign(i, w) {
  const d = A.docs[i], r = L.analyze(d.text, F, d.src || 'x', Date.now(), { k: d.k, w }); A.docs.splice(i, 1); d.w = w; d.id = d.k + ':' + w; d.info = r.info; d.ck = r.ck;
  const ex = A.docs.find(x => x.id === d.id && L.dstat(x) !== 'bad');
  if (ex && L.dstat({ ck: r.ck }) === 'bad') mergeInto(ex, d);
  else { A.docs = A.docs.filter(x => x.id !== d.id); A.docs.push(d); L.apply(F, r.patches); }
  L.refresh(F, A.docs); save(); renderDocs(); sidebar();
}
const NONE_OK = ['kira', 'kira_aile', 'a4a', 'a4b', 'a4c'];
function markNone(id) {
  const x = SL.find(y => y.id === id); if (!x) return;
  A.docs = A.docs.filter(d => d.id !== id);
  A.docs.push({ id, k: x.k, w: x.w, name: 'Beyan: yok', file: '', thumb: '', text: '', src: 'beyan', ts: Date.now(), ck: [{ t: 'ok', m: 'Bu belge/kayıt yok olarak beyan edildi' }], info: ['Yok olarak beyan edildi'] });
  dirty = true; flushSave(); renderDocs(); sidebar(); toast('“Yok” olarak kaydedildi');
}
function delDoc(i) { if (!confirm('Bu belge silinsin mi?')) return; A.docs.splice(i, 1); save(); renderDocs(); sidebar(); }
function pick(id) { const i = document.createElement('input'); i.type = 'file'; i.accept = 'application/pdf,image/*'; i.onchange = () => handleFiles(i.files, id); i.click(); }
function pickMany() { const i = document.createElement('input'); i.type = 'file'; i.multiple = true; i.accept = 'application/pdf,image/*'; i.onchange = () => handleFiles(i.files); i.click(); }

function ring(p) { const r = 34, c = 2 * Math.PI * r; return `<svg viewBox="0 0 80 80" class="w-20 h-20 -rotate-90"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e11d2e"/><stop offset="1" stop-color="#16a34a"/></linearGradient></defs><circle cx="40" cy="40" r="${r}" fill="none" stroke-width="7" stroke="rgba(148,163,184,.25)"/><circle class="ringc" cx="40" cy="40" r="${r}" fill="none" stroke-width="7" stroke-linecap="round" stroke="url(#rg)" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${c * (1 - p / 100)}"/></svg>`; }
function countUp() { document.querySelectorAll('[data-count]').forEach(e => { const t = +e.dataset.count; if (e.dataset.d === String(t)) return; e.dataset.d = t; const s = performance.now(); const f = n => { const k = Math.min(1, (n - s) / 900); e.textContent = Math.round(t * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }); }
function confetti() { const c = document.createElement('canvas'); c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:400;pointer-events:none'; document.body.appendChild(c); const x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight; const col = ['#e11d2e', '#16a34a', '#ffffff', '#f59e0b']; const p = Array.from({ length: 120 }, () => ({ x: innerWidth / 2, y: innerHeight * .7, vx: (Math.random() - .5) * 14, vy: -Math.random() * 16 - 6, s: 5 + Math.random() * 5, c: col[Math.random() * 4 | 0], r: Math.random() * 6, vr: (Math.random() - .5) * .4 })); let f = 0; (function t() { x.clearRect(0, 0, c.width, c.height); p.forEach(a => { a.vy += .35; a.x += a.vx; a.y += a.vy; a.r += a.vr; x.save(); x.translate(a.x, a.y); x.rotate(a.r); x.fillStyle = a.c; x.fillRect(-a.s / 2, -a.s / 2, a.s, a.s * .6); x.restore(); }); if (++f < 140) requestAnimationFrame(t); else c.remove(); })(); }

function render() {
  const nu = $('#navUser');
  if (S.user) { nu.classList.remove('hidden'); nu.classList.add('flex'); $('#nuName').textContent = S.user.name; $('#nuRole').textContent = S.user.role === 'admin' ? 'Sistem Yetkilisi' : 'Öğrenci'; } else { nu.classList.add('hidden'); nu.classList.remove('flex'); }
  const keep = {}; if (!S.user) document.querySelectorAll('#app input').forEach(e => { if (e.id && e.value) keep[e.id] = e.value; });
  $('#app').innerHTML = !S.user ? (S.mode === 'in' ? vLogin() : vRegister()) : S.user.role === 'admin' ? vAdmin() : vStudent();
  if (!S.user) Object.keys(keep).forEach(id => { const e = document.getElementById(id); if (e && !e.value && e.type !== 'file') e.value = keep[id]; });
  if (S.user && S.user.role === 'student') { renderDocs(); }
  if (S.user && S.user.role === 'admin') admTable();
  const pb = $('#profBtn'); if (pb) pb.classList.toggle('hidden', !(S.user && S.user.role === 'student'));
  const st_ = S.user && S.user.role === 'student'; $('#bnav').classList.toggle('hidden', !st_); document.body.classList.toggle('has-bnav', !!st_);
  scrollTo(0, 0);
}
function vLogin() {
  return `<div class="w-full max-w-md mx-auto my-4 sm:my-10"><div class="stg">
  <div class="text-center mb-6"><img src="logo-light.png" alt="Tekirdağ Tabip Odası" class="hero-logo dark:hidden" draggable="false" onclick="logoTap(this)"><img src="logo-dark.png" alt="Tekirdağ Tabip Odası" class="hero-logo hidden dark:block" draggable="false" onclick="logoTap(this)">
   <h2 class="text-3xl font-bold tracking-tight"><span class="grad-t">E-Burs Portalı</span></h2>
   <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Tekirdağ Tabip Odası Tıp Bursu başvuru sistemi</p>
   </div>${termBanner(0)}
  <div class="card p-5 sm:p-7" id="lcard"><form class="space-y-4" id="lform" autocomplete="on" onsubmit="login();return false" novalidate>
   <div><label class="lbl">Kimlik Numarası (TCKN)</label><div class="ifield"><span class="ms lead">badge</span><input id="lt" name="username" class="inp py-3" placeholder="11 haneli TCKN" inputmode="numeric" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="next" onkeydown="if(event.key==='Enter'){event.preventDefault();$('#lp').focus()}"></div></div>
   <div><label class="lbl">Şifre</label><div class="ifield"><span class="ms lead">key</span><input id="lp" name="password" type="password" class="inp py-3 pr-11" placeholder="••••••••" autocomplete="current-password" enterkeyhint="go"><button type="button" class="eye" onclick="const p=$('#lp'),s=p.type==='password';p.type=s?'text':'password';this.innerHTML='<span class=&quot;ms&quot;>visibility'+(s?'_off':'')+'</span>'"><span class="ms">visibility</span></button></div></div>
   <p id="lerr" class="text-sm text-red-600 min-h-[1.25rem]"></p><button id="lbtn" type="submit" class="btn-p w-full justify-center py-3.5 text-base rounded-xl"><span>Giriş Yap</span><span class="ms">arrow_forward</span></button>
   <p class="text-center text-sm text-gray-500">Hesabınız yok mu? <a href="#" onclick="S.mode='up';render();return false" class="text-primary-600 hover:underline font-semibold">Kayıt Olun</a></p></form></div>
  ${window.DEMO ? `  <div class="mt-4 space-y-2"><p class="text-[11px] uppercase tracking-wider text-gray-400 text-center font-semibold mb-2">Demo hesapları · dokun, otomatik dolsun</p>
   <button type="button" class="demo-btn" onclick="$('#lt').value='admin';$('#lp').value='123'"><span class="w-8 h-8 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center"><span class="ms">admin_panel_settings</span></span><span><b class="block text-sm">Yönetici</b><span class="text-gray-500">admin · 123</span></span></button>
   <button type="button" class="demo-btn" onclick="$('#lt').value='12345678901';$('#lp').value='123'"><span class="w-8 h-8 rounded-lg bg-green-500/15 text-green-600 flex items-center justify-center"><span class="ms">school</span></span><span><b class="block text-sm">Öğrenci</b><span class="text-gray-500">12345678901 · 123 (hesap otomatik açılır)</span></span></button></div>
  </div>` : ''}
  </div></div>`;
}
function vRegister() {
  const i = (id, l, t = 'text', x = '') => `<div><label class="lbl">${l}</label><input id="${id}" type="${t}" class="inp" ${x}></div>`;
  return `<div class="w-full max-w-2xl mx-auto my-6 fade-in"><div class="card shadow-lg p-6 sm:p-8"><div class="mb-6 flex justify-between items-center border-b border-gray-100 dark:border-amoled-border pb-4"><div><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Yeni Kayıt</h2><p class="text-sm text-gray-500 mt-1">Lütfen tüm alanları doldurun.</p></div><button onclick="S.mode='in';render()" class="text-gray-400 hover:text-gray-600"><span class="ms text-xl">close</span></button></div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${i('rt', 'T.C. Kimlik No', 'text', 'maxlength="11" inputmode="numeric"')}${i('rn', 'Ad Soyad')}${i('re', 'E-posta', 'email')}${i('rtel', 'Cep Telefonu', 'tel')}
  <div class="sm:col-span-2"><label class="lbl">Üniversite / Fakülte</label><select id="ru" class="inp"><option>${UNI}</option></select><p class="text-[11px] text-gray-500 mt-1">Yalnızca Tekirdağ Namık Kemal Üniversitesi Tıp Fakültesi öğrencileri başvurabilir.</p></div>
  <div class="sm:col-span-2"><label class="lbl">E-posta doğrulama kodu</label><div class="flex gap-2"><input id="rk" class="inp" inputmode="numeric" maxlength="6" placeholder="6 haneli kod"><button type="button" class="btn whitespace-nowrap" onclick="sendCode('#re','#rk')"><span class="ms">mail</span> Kod gönder</button></div></div>${i('rp', window.DEMO ? 'Şifre' : 'Şifre (en az 8 karakter)', 'password')}${i('rp2', 'Şifre Tekrar', 'password')}</div>
  <div class="mt-6 flex justify-end gap-3"><button onclick="S.mode='in';render()" class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">İptal</button><button onclick="register()" class="btn-p">Kaydı Tamamla</button></div></div></div>`;
}

const ORDER = ['terms', 'id', 'docs', 'form', 'sum'];
const TABS = [['terms', 'Şartlar', 'description', 'Şartlar'], ['id', 'Kimlik', 'badge', 'Kimlik'], ['docs', 'Belgeler', 'folder_open', 'Belge'], ['form', 'Başvuru Formu', 'quiz', 'Form'], ['sum', 'Özet / Gönder', 'send', 'Gönder']];
const IDK = ['ad', 'tc', 'sinif', 'anne.ad', 'anne.hayat', 'baba.ad', 'baba.hayat', 'anne.tc', 'baba.tc'];
const SINIF = ['Hazırlık', '1. sınıf', '2. sınıf', '3. sınıf', '4. sınıf', '5. sınıf', '6. sınıf'];
const IDF_ = { s: [['ad', 'Adınız – Soyadınız (kimlikteki gibi)', 't'], ['tc', 'T.C. Kimlik Numaranız', 't'], ['sinif', 'Sınıfınız', 's', 0, SINIF]], m: [['anne.ad', 'Annenizin Adı', 't'], ['anne.hayat', 'Anne hayatta mı?', 'y'], ['anne.tc', 'Anne T.C. Kimlik No', 't']], f: [['baba.ad', 'Babanızın Adı', 't'], ['baba.hayat', 'Baba hayatta mı?', 'y'], ['baba.tc', 'Baba T.C. Kimlik No', 't']] };
const gateOf = t => { if (S.unlock) return null; const st = L.steps(F, A.docs, A.terms), i = ORDER.indexOf(t); for (let j = 0; j < i; j++) if (!st[j].ok) return { j, why: st[j].why }; return null; };
const firstOpen = () => { const i = L.steps(F, A.docs, A.terms).findIndex(x => !x.ok); return i < 0 ? 'sum' : ORDER[i]; };
function vStudent() {
  return `<div class="grid grid-cols-1 xl:grid-cols-4 gap-6 fade-in"><div class="xl:col-span-1 space-y-4" id="side"></div>
  <div class="xl:col-span-3"><div class="card p-2 mb-4 hidden md:flex gap-1 overflow-x-auto" id="tabs"></div><div id="page"></div></div></div>`;
}
function stepper() {
  if (!$('#tabs') || !A) return; const st = L.steps(F, A.docs, A.terms), sent = A.status === 'Beklemede' || A.status === 'Onaylandı';
  const cls = (k, n) => (S.tab === k ? 'on ' : '') + (gateOf(k) ? 'lock ' : '') + ((n < 4 ? st[n].ok : sent) ? 'done' : '');
  $('#tabs').innerHTML = TABS.map(([k, l], n) => { const c = cls(k, n); return `<button onclick="go('${k}',1)" class="stp ${c}"><span class="n">${c.includes('lock') ? '<span class="ms">lock</span>' : c.includes('done') ? '<span class="ms">check</span>' : n + 1}</span>${l}</button>`; }).join('');
  $('#bnav').innerHTML = TABS.map(([k, l, ic, sh], n) => { const c = cls(k, n); return `<button onclick="go('${k}',1)" class="${c}"><span class="ms">${c.includes('lock') ? 'lock' : c.includes('done') && S.tab !== k ? 'check_circle' : ic}</span><span>${sh}</span></button>`; }).join('');
  document.querySelectorAll('[data-nxt]').forEach(b => { b.disabled = !!gateOf(b.dataset.nxt); });
  const e = $('#gh'); if (e) { const s = st[ORDER.indexOf(S.tab)]; e.className = 'gh ' + (s && !s.ok ? 'warn' : 'ok'); e.innerHTML = s && !s.ok ? '<span class="ms">lock</span> Sonraki adım için: ' + E(s.why) : '<span class="ms">check_circle</span> Bu adım tamam – devam edebilirsiniz'; }
}
function sidebar() {
  if (!$('#side')) return; const p = L.progress(F, A.docs), miss = REQF.filter(k => !String(F[k] || '').trim()), fo = REQF.length - miss.length;
  $('#side').innerHTML = `<div class="card p-4 sm:p-5"><div class="flex items-center gap-4"><div class="relative shrink-0">${ring(p.p)}<div class="absolute inset-0 flex items-center justify-center text-sm font-bold"><span data-count="${p.p}">0</span>%</div></div>
   <div class="min-w-0 flex-1"><h3 class="font-bold text-base text-gray-900 dark:text-white truncate">${E(F.ad || S.user.name)}</h3><p class="text-xs text-gray-500 truncate">${E([F.fakulte, F.sinif].filter(Boolean).join(' · ') || 'Bilgiler belgelerden otomatik dolar')}</p>
   <div class="flex items-center flex-wrap gap-2 mt-2"><span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${stBadge(A.status)}">${E(A.status)}</span><span class="text-[11px] text-gray-500">TC ${E(F.tc || S.user.tc)}</span></div></div></div>
   <div class="grid grid-cols-2 gap-2 mt-4 text-center"><div class="rounded-xl bg-gray-50 dark:bg-amoled-base p-2.5"><div class="font-bold text-sm">${p.ok}/${p.n}</div><div class="text-[11px] text-gray-500">Zorunlu belge</div></div><div class="rounded-xl bg-gray-50 dark:bg-amoled-base p-2.5"><div class="font-bold text-sm">${fo}/${REQF.length}</div><div class="text-[11px] text-gray-500">Cevap</div></div></div>
   <button data-nxt="sum" onclick="go('sum')" class="btn-p w-full justify-center mt-4"><span class="ms">send</span> Özet ve Gönder</button></div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => { const r = document.querySelector('.ringc'); if (r) r.style.strokeDashoffset = r.dataset.off; })); countUp(); stepper();
}
function go(t, tap) {
  if (tap && t === 'docs' && window.DEMO) { clearTimeout(go.tm); go.n = (go.n || 0) + 1; go.tm = setTimeout(() => go.n = 0, 6000); if (go.n >= 10) { go.n = 0; S.unlock = 1; A.terms = 1; save(); t = 'form'; toast('Demo: tüm adımlar açıldı → başvuru formu'); } }
  if (L.steps(F, A.docs, A.terms)[1].ok && t === 'docs') { L.refresh(F, A.docs); save(); }
  const g = gateOf(t); if (g) { toast(g.why); t = ORDER[g.j]; }
  S.tab = t; sidebar(); $('#page').innerHTML = { terms: pTerms, id: pId, docs: pDocs, form: pForm, sum: pSum }[t](); if (t === 'docs') renderDocs(); stepper(); scrollTo(0, 0);
}
const _render = render; render = function () { _render(); if (S.user && S.user.role === 'student') go(S.tab); };

function pTerms() {
  return `<div class="card p-5 sm:p-6 fade-in">${termBanner(1)}<h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Başvuru Şartları ve Bilgilendirme</h2><p class="text-sm text-gray-500 mb-4">Tekirdağ Tabip Odası Tıp Eğitimi Bursu – Tıp Fakültesi Öğrenci Bursu Yönergesi</p>
  <ul class="space-y-2.5 text-sm">${[
    'Başvuru, <b>Tekirdağ’daki devlet üniversitesi tıp fakültesinde</b> okuyan tıp öğrencilerine açıktır.',
    'Burs, tıp fakültesi öğrencilerine <b>10 (on) ay</b> süreyle bağlanır; kaynaklar yetersiz kalırsa süreden önce kesilebilir.',
    'Adımlar sırayla ilerler: <b>Şartlar > Kimlik > Belgeler > Başvuru Formu > Özet</b>. Önceki adım tamamlanmadan sonrakine geçilemez.',
    'Önce yalnızca <b>kimlik bilgileri</b> (ad-soyad, T.C. no, sınıf, anne ve baba) sorulur. Sonra belgeler yüklenir; <b>formdaki diğer bilgiler belgelerden otomatik doldurulur</b> ve son adımda kontrol edilir. Her belgede ilgili kişinin <b>adı (veya T.C. no)</b> görünmelidir; yalnızca <b>ad</b> kontrol edilir, soyadın görünmemesi sorun değildir. Başkasına ait belge <b>kabul edilmez</b>.',
    'Belgeler yüklenince okunan bilgiler formla karşılaştırılır; <b>sizin yazdığınız cevapların üzerine yazılmaz</b>. Cevapların doğruluğundan öğrenci sorumludur.',
    'e-Devlet PDF belgeleri <b>son 30 gün içinde alınmış</b> ve barkodlu olmalıdır. Ekran görüntülerinde tarih aranmaz.',
    'Öğrenci, anne ve babanın her biri için <b>adli sicil kaydı</b> (e-Devlet) istenir.',
    'İstenen kayıt yoksa bile (tapu, araç, vergi levhası, 4A/4B/4C, KYK vb.) <b>“kayıt bulunamadı”</b> yazan, isim görünen e-Devlet ekranı zorunludur.',
    'Hazırlık/1. sınıfa yeni başlayanlar ÖSYM sonuç + yerleştirme belgesi, diğer sınıflar transkript verir.',
    'Anne/baba vefat etmişse onun yerine öğrencinin kendi 4A-4B-4C bilgileri istenir. Çalışan ebeveyn için bordro, emekli için 4A/4B/4C aylık bilgisi gerekir.',
    'Yurtta kalan için yurt belgesi, kirada kalan için kira kontratı; ailenin evi kiraysa ailenin kira kontratı eklenir.',
    'Başvuru formu ayrıca yüklenmez; form bilgileri sistemde soru olarak sorulur. Yanıltıcı bilgi/belge verildiği anlaşılırsa burs kesilir, ödenen tutarlar yasal faiziyle geri alınır.'].map(t => `<li class="flex gap-2.5"><span class="ms text-primary-500 mt-0.5">check_circle</span><span>${t}</span></li>`).join('')}</ul>
  <p class="text-xs text-gray-500 mt-4">Sorularınız için: Tekirdağ Tabip Odası · +90 282 261 89 81 · +90 530 943 34 97 · tekirdagtabip@gmail.com · <a class="underline" href="https://www.tto.org.tr/ogrenci-bursu" target="_blank" rel="noopener">tto.org.tr/ogrenci-bursu</a></p>
  <label class="flex items-center gap-2 mt-5 text-sm cursor-pointer"><input type="checkbox" ${A.terms ? 'checked' : ''} onchange="A.terms=this.checked?1:0;save();stepper()" class="w-4 h-4 rounded"> Şartları okudum, kabul ediyorum</label>
  <div class="mt-4 flex flex-wrap items-center gap-3"><button class="btn-p" data-nxt="id" onclick="go('id')">Kimlik bilgilerine geç <span class="ms">arrow_forward</span></button><span id="gh" class="gh"></span></div></div>`;
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
function sf(k, v) { F[k] = v; if (k === 'ailedeMi' && S.tab === 'form') { const y = scrollY; $('#page').innerHTML = pForm(); scrollTo(0, y); } if (F._a[k]) { delete F._a[k]; const el = document.querySelector('#f_' + k.replace('.', '_') + ' span'); if (el) el.remove(); }
  if (IDK.includes(k)) { clearTimeout(sf.t); sf.t = setTimeout(() => { L.refresh(F, A.docs); save(); stepper(); }, 500); } save(); sidebar(); }
const SEC = { 1: 'I – Kimlik ve İletişim Bilgileri', 2: 'II – Eğitim Bilgileri', 3: 'III – Sosyal ve Ekonomik Duruma İlişkin Bilgiler' };
const PH = { dogum: 'Tekirdağ / 01.01.2003', tel: '05xx xxx xx xx', mail: 'ornek@mail.com', gno: 'Ör: 3,20 (1. sınıfsanız: Yok)', okulno: 'Okul numaranız', giris: 'Ör: 2022', gelir: 'Yoksa boş geçin', cocuk: 'Ör: 0', 'anne.tel': '05xx xxx xx xx', 'baba.tel': '05xx xxx xx xx', 'anne.gelir': 'Ör: 26.000 TL', 'baba.gelir': 'Ör: 30.000 TL', ad: 'Adınız Soyadınız (kimlikteki gibi)', 'anne.ad': 'Ad Soyad (son kelime soyad)', 'baba.ad': 'Ad Soyad (son kelime soyad)' };
const has = k => String(F[k] || '').trim() !== '';
const STUF = FL.filter(f => !['ad', 'tc', 'sinif'].includes(f[0]));
function fq(a) {
  const k = a[0]; let h = fld(a);
  if (PH[k]) h = h.replace(/<(input|textarea) class="inp"/, `<$1 class="inp" placeholder="${E(PH[k])}"`);
  if (REQF.includes(k) || IDK.includes(k)) h = h.replace('</label>', '<span class="req">*</span></label>');
  return h;
}
const DEMOV = { dogum: 'Tekirdağ / 05.03.2003', adres: 'Cumhuriyet Mah. Atatürk Cad. No:12 D:3 Süleymanpaşa / Tekirdağ', tel: '0532 111 22 33', mail: 'demo@ornek.com', okul: 'Tekirdağ Anadolu Lisesi', gecmisBurs: 'Hayır', fakulte: 'Tekirdağ Namık Kemal Üniversitesi – Tıp Fakültesi', giris: '2024', sinif: '3. sınıf', okulno: '20240123', gno: '3,10', dil: 'İngilizce (B2)', medeni: 'Bekar', cocuk: '0', malvarlik: 'Tapu: taşınmaz kaydı yok\nAraç: araç kaydı yok', ozelBurs: 'Yok', kamuBurs: 'Yok (KYK kredi/burs yok)', tabipBurs: 'Hayır', ailedeMi: 'Evet', gider: '8.000 TL', engel: 'Hayır', hobi: 'Satranç, yüzme', dernek: 'Yok',
  'anne.tc': '10000000146', 'anne.hayat': 'Evet', 'anne.adres': 'Cumhuriyet Mah. Atatürk Cad. No:12 Süleymanpaşa / Tekirdağ', 'anne.meslek': 'Ev hanımı', 'anne.tel': '0533 222 33 44', 'baba.tc': '10000000212', 'baba.hayat': 'Evet', 'baba.adres': 'Cumhuriyet Mah. Atatürk Cad. No:12 Süleymanpaşa / Tekirdağ', 'baba.meslek': 'Esnaf', 'baba.isyeri': 'Süleymanpaşa Çarşı', 'baba.gelir': '30.000 TL', 'baba.tel': '0535 333 44 55',
  bakma: 'Yok', aileMal: 'Baba tapu: taşınmaz kaydı yok\nBaba araç: araç kaydı yok', aileGelir: 'Ücret dışı gelir yok', ayri: 'Anne ve babamla birlikte yaşıyorum' };
function demoFill() {
  const sy = ((F.ad || '').trim().split(/\s+/).pop()) || 'Yılmaz', V = Object.assign({ ad: 'Demo Öğrenci ' + sy, tc: S.user.tc, 'anne.ad': 'Ayşe ' + sy, 'baba.ad': 'Mehmet ' + sy }, DEMOV);
  Object.keys(V).forEach(k => { if (!has(k)) F[k] = V[k]; }); L.refresh(F, A.docs); save(); go('form'); toast('Demo verileri dolduruldu');
}
function pId() {
  const g = x => `<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">${x}</div>`, h = t => `<h3 class="text-sm font-bold text-gray-900 dark:text-white mt-6 mb-3 pb-2 border-b border-gray-100 dark:border-amoled-border">${t}</h3>`;
  return `<div class="card p-5 sm:p-6 fade-in"><h2 class="text-lg font-bold text-gray-900 dark:text-white"><span class="ms text-primary-500 mr-2">badge</span>Kimlik Bilgileri</h2>
  <p class="text-xs text-gray-500 mt-1">Önce yalnızca kimlik bilgileri istenir; belgeleri yükledikten sonra form bilgileri belgelerden otomatik dolar. Ad-soyadı yazarken son kelime soyad sayılır. Anne ve baba için yalnızca ad yazmanız yeterlidir. <span class="req">*</span> zorunlu.</p>
  ${h('Öğrenci')}${g(IDF_.s.map(fq).join(''))}${h('Anne')}${g(IDF_.m.map(fq).join(''))}${h('Baba')}${g(IDF_.f.map(fq).join(''))}
  <div class="mt-6 flex flex-wrap gap-2 items-center"><button class="btn-p" data-nxt="docs" onclick="go('docs')">Belgelere geç <span class="ms">arrow_forward</span></button><span id="gh" class="gh"></span></div></div>`;
}

function pForm() {
  const g = x => `<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">${x}</div>`, h = t => `<h3 class="text-sm font-bold text-gray-900 dark:text-white mt-6 mb-3 pb-2 border-b border-gray-100 dark:border-amoled-border">${t}</h3>`;
  const sec = n => g([...STUF, ...L.Q.map(q => [q.key, q.t, q.type, q.sec, q.opts])].filter(f => f[3] === n && !(['yurt', 'kira', 'evArk'].includes(f[0]) && F.ailedeMi !== 'Hayır')).map(fq).join(''));
  const par = (p, t) => { return F[p + '.hayat'] === 'Hayır' ? '' : h('IV – Aileye İlişkin Bilgiler · ' + t) + g(PF(p).slice(3).map(fq).join('')); };
  return `<div class="card p-5 sm:p-6 fade-in"><div class="flex flex-wrap items-start justify-between gap-2"><div><h2 class="text-lg font-bold text-gray-900 dark:text-white"><span class="ms text-primary-500 mr-2">quiz</span>Başvuru Formu</h2>
  <p class="text-xs text-gray-500 mt-1">Belgelerden okunan bilgiler otomatik doldurulur; eksik kalanları tamamlayın. <span class="req">*</span> zorunlu.</p></div>
  ${window.DEMO ? '<button class="btn" onclick="demoFill()"><span class="ms">auto_fix_high</span> Demo verisiyle doldur</button>' : ''}</div>
  ${h(SEC[1])}${sec(1)}${h(SEC[2])}${sec(2)}${h(SEC[3])}${sec(3)}${par('anne', 'Anne')}${par('baba', 'Baba')}${h('IV – Aileye İlişkin Bilgiler · Aile')}${g([...FL4, ...L.Q.filter(q => q.sec === 4).map(q => [q.key, q.t, q.type, 4, q.opts])].map(fq).join(''))}
  <div class="mt-6 flex flex-wrap gap-2 items-center"><button class="btn-p" data-nxt="sum" onclick="go('sum')">Özete geç <span class="ms">arrow_forward</span></button><span id="gh" class="gh"></span></div></div>`;
}

function pDocs() {
  const ch = (g, v, t) => `<span class="chip ${S.f[g] === v ? 'on' : ''}" onclick="S.f['${g}']='${v}';$('#fl').innerHTML=fbar();renderDocs()">${t}</span>`;
  window.fbar = () => `<div class="flex flex-wrap gap-1.5">${[['all', 'Tümü'], ['zorunlu', 'Zorunlu'], ['eksik', 'Eksik'], ['yuklu', 'Yüklü'], ['uyari', 'Uyarılı']].map(a => ch('st', ...a)).join('')}</div>
   <div class="flex flex-wrap gap-1.5">${[['all', 'Herkes'], ['s', 'Öğrenci'], ['m', 'Anne'], ['f', 'Baba'], ['a', 'Aile']].map(a => ch('who', ...a)).join('')}</div>
   <div class="flex flex-wrap gap-1.5">${ch('cat', 'all', 'Tüm kategoriler')}${L.cats.map(c => ch('cat', c, c)).join('')}</div>`;
  return `<div class="space-y-4 fade-in"><div class="card p-5"><div class="flex justify-between items-center mb-3"><h2 class="text-lg font-bold text-gray-900 dark:text-white"><span class="ms text-primary-500 mr-2">folder_open</span>İstenen Evraklar</h2><span class="text-xs text-gray-500">PDF / JPG / PNG</span></div>
  <div id="dz" class="drop rounded-xl p-6 text-center cursor-pointer bg-gray-50 dark:bg-amoled-base" onclick="pickMany()" ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')" ondrop="event.preventDefault();this.classList.remove('dragover');handleFiles(event.dataTransfer.files)">
   <span class="ms text-3xl text-primary-500 mb-2">cloud_upload</span><p class="text-sm font-semibold">Tüm belgeleri birlikte seçin veya bırakın</p><p class="text-xs text-gray-500 mt-1">Tür ve sahip otomatik tanınır. Her belgede kişinin adı görünmeli (e-Devlet ekran görüntülerinde soyad gizli olabilir); e-Devlet PDF belgeleri son 30 gün içinde alınmış olmalı; ekran görüntülerinde tarih aranmaz. Aynı belgenin birden fazla ekran görüntüsü birleştirilir.</p><p id="lg" class="text-xs text-primary-600 mt-2 min-h-[1rem]"></p><div class="pbar mt-2"><i id="lgb"></i></div></div></div>
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
   ${d ? `<p class="text-[11px] text-gray-400 truncate">${E(d.name)}${(d.extra || []).length ? ' (+' + d.extra.length + ' ek)' : ''}</p>${d.info.map(t => `<div class="text-[11px] text-gray-700 dark:text-gray-300"><span class="ms text-primary-500 mr-1">chevron_right</span>${E(t)}</div>`).join('')}${d.ck.filter(c => c.t !== 'ok').map(c => `<div class="text-[11px] ${dcls[c.t]}"><span class="ms mr-1">${dico[c.t]}</span>${E(c.m)}</div>`).join('')}` : ''}
   <div class="mt-2 flex flex-wrap gap-1.5">${x.h ? `<span class="text-[11px] text-gray-500 w-full">${E(x.h)}</span>` : ''}${/^http/.test(x.l) ? `<a class="btn" href="${x.l}" target="_blank" rel="noopener"><span class="ms">open_in_new</span> e-Devlet'ten al</a>` : ''}
   <button class="btn" onclick="pick('${x.id}')"><span class="ms">upload</span>${d ? 'Değiştir / ek ekle' : 'Dosya seç'}</button>${!d && (NONE_OK.includes(x.k) || x.none) ? `<button class="btn" onclick="markNone('${x.id}')"><span class="ms">block</span> Yok</button>` : ''}${d && d.src !== 'beyan' ? `<button class="btn" onclick="pv(${i})"><span class="ms">visibility</span> Önizle</button>` : ''}${d ? `<button class="btn text-red-600" onclick="delDoc(${i})"><span class="ms">delete</span></button>` : ''}</div></div></div>`;
}
async function pdfPages(url, host) {
  const pdf = await pdfjsLib.getDocument({ data: await (await fetch(url)).arrayBuffer() }).promise; host.innerHTML = '';
  for (let i = 1; i <= Math.min(pdf.numPages, 6); i++) { const cv = await pageCanvas(await pdf.getPage(i), Math.min(1100, Math.round(innerWidth * 1.6))); cv.className = 'w-full rounded-lg bg-white mb-2'; host.appendChild(cv); }
  if (pdf.numPages > 6) host.insertAdjacentHTML('beforeend', '<p class="text-white text-xs">İlk 6 sayfa gösteriliyor – tamamı için “Orijinal”.</p>');
}
async function fileUrl(tc, file) {
  if (window.demoFileUrl) return window.demoFileUrl(tc, file);
  const r = await fetch('/api/file/' + encodeURIComponent(tc) + '/' + encodeURIComponent(file), { headers: { Authorization: 'Bearer ' + S.token, 'X-Mode': window.MODE } });
  return r.ok ? URL.createObjectURL(await r.blob()) : '';
}
async function admResetPw(tc) {
  if (!confirm('Bu öğrencinin şifresi sıfırlansın mı? Eski şifre geçersiz olur ve yeni geçici şifre yalnızca bir kez gösterilir.')) return;
  try { const d = await api('/api/admin/app/' + tc, { method: 'PUT', json: { resetPw: true } }); prompt('Yeni geçici şifre (kopyalayıp öğrenciye iletin):', d.pw); admOpen(tc); } catch (e) { toast(e.message); }
}
async function pv(i, d0, owner) {
  const d = d0 || A.docs[i], tc = owner || S.user.tc, isPdf = /\.pdf$/i.test(d.name || '');
  let fu = ''; if (d.file) { try { fu = await fileUrl(tc, d.file); } catch (e) {} }
  const th = d.thumb ? `<img src="${d.thumb}" class="w-full rounded-lg bg-white">` : '<p class="text-white text-sm">Önizleme yok – dosya saklanmamış.</p>';
  const ex = (d.extra || []).length ? `<p class="text-white/80 text-xs mt-2">Ek ekranlar: ${d.extra.map(x => E(x.name)).join(', ')}</p>` : '';
  $('#pv').innerHTML = `<div class="max-w-3xl mx-auto"><div class="flex justify-between items-center text-white mb-3"><b class="text-sm truncate">${E(d.name)}</b><div class="flex gap-2">${fu ? `<a class="btn" href="${fu}" download="${E(d.name)}" target="_blank"><span class="ms">download</span> Orijinal</a>` : ''}<button class="btn" onclick="$('#pv').classList.add('hidden')"><span class="ms">close</span></button></div></div>
  <div id="pvb">${fu && !isPdf ? `<img src="${fu}" class="w-full rounded-lg bg-white" onerror="this.outerHTML=this.dataset.t" data-t='${th.replace(/'/g, '&#39;')}'>` : fu && isPdf ? '<p class="text-white text-sm">Yükleniyor…</p>' : th}</div>${ex}
  ${d.text ? `<details class="mt-3 text-white"><summary class="cursor-pointer text-sm">Okunan metin (OCR)</summary><pre class="mt-2 text-[11px] whitespace-pre-wrap bg-black/60 p-3 rounded-lg max-h-64 overflow-auto">${E(d.text)}</pre></details>` : ''}</div>`;
  $('#pv').classList.remove('hidden');
  if (fu && isPdf) pdfPages(fu, $('#pvb')).catch(() => { $('#pvb').innerHTML = th; });
}

function pSum() {
  const st = L.steps(F, A.docs, A.terms), p = L.progress(F, A.docs), miss = REQF.filter(k => !String(F[k] || '').trim()), bad = A.docs.filter(d => L.dstat(d) === 'bad'), warn = A.docs.filter(d => L.dstat(d) === 'warn');
  const lab = Object.fromEntries(ALLF().map(f => [f[0], f[1]])), ready = st.every(x => x.ok), sent = A.status === 'Beklemede' || A.status === 'Onaylandı', nm = ['Şartlar kabul edildi', 'Kimlik bilgileri tamamlandı', 'Zorunlu belgeler tam ve kabul edildi', 'Başvuru formu tamamlandı'];
  return `<div class="card p-5 sm:p-6 fade-in"><h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Özet ve Gönderim</h2>${termBanner(1)}
  <ul class="space-y-1.5 mb-4 text-sm">${st.map((x, i) => `<li class="${x.ok ? 'text-green-600' : 'text-red-600'}"><span class="ms mr-1.5">${x.ok ? 'check_circle' : 'cancel'}</span>${nm[i]}${x.ok ? '' : ' – ' + E(x.why)}</li>`).join('')}</ul>
  <div class="grid grid-cols-3 gap-3 mb-5 text-center"><div class="rounded-lg bg-gray-50 dark:bg-amoled-base p-3"><div class="text-xl font-bold">${p.ok}/${p.n}</div><div class="text-xs text-gray-500">Zorunlu belge</div></div><div class="rounded-lg bg-gray-50 dark:bg-amoled-base p-3"><div class="text-xl font-bold">${miss.length}</div><div class="text-xs text-gray-500">Eksik cevap</div></div><div class="rounded-lg bg-gray-50 dark:bg-amoled-base p-3"><div class="text-xl font-bold">${bad.length}</div><div class="text-xs text-gray-500">Kabul edilmeyen belge</div></div></div>
  ${p.miss.length ? `<h3 class="text-sm font-bold mb-2">Eksik zorunlu belgeler</h3><ul class="text-sm mb-4 space-y-1">${p.miss.map(x => `<li><span class="ms text-red-500 mr-1.5">cancel</span>${E(x.t)} <span class="text-gray-500">(${WN[x.w]})</span></li>`).join('')}</ul>` : ''}
  ${miss.length ? `<h3 class="text-sm font-bold mb-2">Cevaplanmamış zorunlu sorular</h3><p class="text-sm mb-4 text-gray-600 dark:text-gray-400">${miss.map(k => E(lab[k])).join(' · ')}</p>` : ''}
  ${bad.length ? `<h3 class="text-sm font-bold mb-2 text-red-600">Kabul edilmeyen belgeler</h3><ul class="text-xs mb-4 space-y-1">${bad.map(d => `<li><b>${E(d.name)}</b> – ${E((d.ck.find(c => c.t === 'bad') || {}).m || '')}</li>`).join('')}</ul>` : ''}
  ${warn.length ? `<p class="text-sm text-orange-600 mb-4"><span class="ms mr-1">warning</span>Kontrol edilmesi gereken belgeler: ${warn.map(d => E(d.name)).join(', ')}</p>` : ''}
  ${A.note ? `<div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-sm mb-4"><b>Yönetici notu:</b> ${E(A.note)}</div>` : ''}
  <div class="flex flex-wrap gap-2 items-center"><button class="btn-p" ${(ready || S.unlock) && !sent && !termBlocked() ? '' : 'disabled'} onclick="submitApp()"><span class="ms">send</span> ${sent ? 'Gönderildi' : 'Başvuruyu Onaya Gönder'}</button><span class="text-xs text-gray-500">Durum: ${E(A.status)}${A.sent ? ' · ' + new Date(A.sent).toLocaleString('tr-TR') : ''}</span></div></div>`;
}
async function submitApp() {
  const st = L.steps(F, A.docs, A.terms).find(x => !x.ok); if (st && !S.unlock) return toast(st.why);
  try { dirty = true; await flushSave(); const d = await api('/api/submit' + (st ? '?force=1' : ''), { method: 'POST' }); A.status = d.status; A.sent = Date.now(); toast('Başvuru gönderildi'); confetti(); go('sum'); } catch (e) { toast(e.message); }
}
const AS = { Burs: 'Onaylandı', Yedek: 'Beklemede', Elendi: 'Reddedildi' }, TL = n => Math.round(n || 0).toLocaleString('tr-TR') + ' ₺';
setInterval(async () => { if (S.user && S.user.role === 'admin' && !document.hidden && !($('#adet') || {}).innerHTML) { try { S.adm.list = (await api('/api/admin/apps')).apps.filter(a => window.DEMO || !a.demo); admTable(); } catch (e) {} } }, 10000);
async function loadAdmin() {
  try { S.adm.list = (await api('/api/admin/apps')).apps.filter(a => window.DEMO || !a.demo); S.adm.set = L.mergeSet((await api('/api/admin/settings')).settings); } catch (e) { S.adm.set = S.adm.set || L.defSet(); }
  L.setCustom(S.adm.set.custom);
  if (S.user && S.user.role === 'admin') { $('#app').innerHTML = vAdmin(); if (S.adm.view === 'list') admTable(); helpFirstRun(); }
}
const admRank = () => (S.adm.rows = L.rank(S.adm.list, S.adm.set || (S.adm.set = L.defSet())));
const admSel = (v, arr, fn) => `<select class="inp" onchange="${fn}">${arr.map(([k, t]) => `<option value="${k}" ${String(v) === String(k) ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
function admF(k, v) { S.adm[k] = v; admTable(); }
function admSort(k) { const a = S.adm; if (a.sort === k) a.dir = -a.dir; else { a.sort = k; a.dir = ['name', 'rank', 'total', 'pc', 'houses', 'cars'].includes(k) ? 1 : -1; } admTable(); }
function admReset() { Object.assign(S.adm, { q: '', st: 'all', cls: 'all', kind: 'all', res: 'all', miss: false, incMin: '', incMax: '', pcMax: '', house: 'all', car: 'all', sibMin: '', gnoMin: '', dead: false, away: false, dis: false }); $('#app').innerHTML = vAdmin(); admTable(); }
function vAdmin() {
  const A_ = S.adm, rk = admRank(), demo = A_.list.filter(a => a.demo).length, card = (ic, c, l, v) => `<div class="card p-4 flex items-center gap-4"><div class="w-10 h-10 rounded-full ${c} flex items-center justify-center"><span class="ms">${ic}</span></div><div><p class="text-xs text-gray-500">${l}</p><p class="text-xl font-bold dark:text-white" data-count="${v}">0</p></div></div>`;
  const n = f => rk.filter(f).length;
  return `<div class="fade-in mdf"><div class="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-4"><div><h2 class="text-2xl font-bold text-gray-900 dark:text-white">Yönetim Paneli</h2><p class="text-sm text-gray-500 mt-1">${A_.list.length} başvuru${demo ? ' · ' + demo + ' demo kayıt' : ''} · burs kontenjanı ${A_.set.quota} · ${E(A_.set.term.name)}</p></div>
   <div class="flex flex-wrap gap-2"><button class="btn" onclick="helpOpen()"><span class="ms">help</span> Rehber</button><button class="btn" onclick="loadAdmin()"><span class="ms">refresh</span> Yenile</button><div class="xsp"><button class="btn" onclick="exportX('xlsx')"><span class="ms">table_view</span> Excel</button><button class="btn xarr" onclick="xmenu(event)" aria-label="Dışa aktarma türü"><span class="ms">arrow_drop_down</span></button><div id="xmenu" class="xmenu hidden"><button onclick="exportX('xlsx')"><span class="ms">table_view</span> Excel (.xlsx)</button><button onclick="exportX('csv')"><span class="ms">csv</span> CSV (.csv)</button></div></div><button class="btn text-red-600" onclick="admWipe()"><span class="ms">delete_forever</span> Tüm verileri sil</button>${window.DEMO ? `<button class="btn" onclick="admSeed()"><span class="ms">science</span> Örnek veri</button>${demo ? `<button class="btn text-red-600" onclick="admDemoDel()"><span class="ms">cleaning_services</span> Demo sil</button>` : ''}` : ''}</div></div>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">${card('group', 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', 'Toplam', rk.length)}${card('schedule', 'bg-orange-50 dark:bg-orange-900/20 text-orange-600', 'İncelenecek', n(r => r.a.status === 'Beklemede'))}${card('emoji_events', 'bg-green-50 dark:bg-green-900/20 text-green-600', 'Burs alacak (kural)', n(r => r.res === 'Burs'))}${card('block', 'bg-red-50 dark:bg-red-900/20 text-red-600', 'Elenen (kural)', n(r => r.res === 'Elendi'))}</div>
  <div class="flex flex-wrap gap-2 mb-4">${admChips()}</div>
  ${admView()}</div><div id="adet"></div>`;
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
   ${sel('Sınıf', a.cls, [['all', 'Tümü'], ['Hazırlık', 'Hazırlık'], ...[1, 2, 3, 4, 5, 6].map(x => [String(x), x + '. sınıf'])], "admF('cls',this.value)")}${window.DEMO ? sel('Kayıt türü', a.kind, [['all', 'Tümü'], ['real', 'Gerçek'], ['demo', 'Demo']], "admF('kind',this.value)") : ''}</div>
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
  tb.innerHTML = l.map(r => { const a = r.a, m = r.m, f = a.F; return `<tr class="border-b border-gray-100 dark:border-amoled-border hover:bg-gray-50 dark:hover:bg-amoled-hover"><td class="px-3 py-3 text-xs font-bold">${r.rank || '—'}</td><td class="px-3 py-3"><div class="font-medium text-gray-900 dark:text-white">${E(f.ad || f.tc)}${a.demo && window.DEMO ? ' <span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">DEMO</span>' : ''}</div><div class="text-xs text-gray-500">${E(f.tc)} · <span class="${stBadge(a.status)} px-1.5 rounded text-[10px]">${E(a.status)}</span></div></td><td class="px-3 py-3 text-xs text-gray-600 dark:text-gray-300">${E(f.fakulte || '—')}<br>${E(f.sinif || '')}</td><td class="px-3 py-3 text-xs">${TL(m.total)}<br><span class="text-gray-500">kişi başı ${TL(m.pc)}</span></td><td class="px-3 py-3 text-xs">${m.houses} ev · ${m.cars} araç<br><span class="text-gray-500">${m.sib} kardeş</span></td><td class="px-3 py-3 text-xs">${m.gno === null ? '—' : m.gno}</td><td class="px-3 py-3"><b>${r.sc}</b></td><td class="px-3 py-3 text-xs"><span class="${m.docsOk ? 'text-green-600' : 'text-red-600'} font-semibold">${m.dp}</span></td><td class="px-3 py-3">${resB(r)}${r.f.length ? `<div class="text-[10px] text-red-600 mt-1 max-w-[180px]">${E(r.f[0])}${r.f.length > 1 ? ' +' + (r.f.length - 1) : ''}</div>` : ''}</td><td class="px-3 py-3 text-right"><button class="btn-p !py-1 !text-xs" onclick="admOpen('${a.uid || f.tc}')">İncele</button></td></tr>`; }).join('') || '<tr><td colspan="10" class="px-4 py-8 text-center text-gray-500">Başvuru bulunamadı.</td></tr>';
  const ac = $('#acards'); if (ac) ac.innerHTML = l.map(r => { const a = r.a, m = r.m, f = a.F; return `<div class="acard" onclick="admOpen('${a.uid || f.tc}')"><div class="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-600/15 text-primary-600 flex items-center justify-center font-bold shrink-0">${r.sc}</div><div class="min-w-0 flex-1"><div class="font-semibold text-sm truncate text-gray-900 dark:text-white">${E(f.ad || f.tc)}${a.demo && window.DEMO ? ' <span class="text-[10px] text-purple-600">DEMO</span>' : ''}</div><div class="text-xs text-gray-500 truncate">${E([f.fakulte, f.sinif].filter(Boolean).join(' · ') || f.tc)}</div><div class="mt-1 text-[11px] text-gray-600 dark:text-gray-300">${TL(m.total)} · ${m.houses} ev · ${m.cars} araç · Not ${m.gno === null ? '—' : m.gno}</div><div class="text-[11px] ${m.docsOk ? 'text-green-600' : 'text-red-600'} font-semibold">${m.dp} belge</div></div><div class="text-right">${resB(r)}<div class="text-[10px] text-gray-500 mt-1">${E(a.status)}</div></div></div>`; }).join('') || '<p class="p-8 text-center text-sm text-gray-500">Başvuru bulunamadı.</p>';
  countUp();
}
function vSet() {
  const s = S.adm.set, num = (v, fn, w = 'w-24') => `<input type="number" class="inp rnum ${w} !py-1" value="${v ?? ''}" onchange="${fn}">`, on = L.CRIT.filter(c => s.crit[c.id].on).length;
  return `<div class="grid grid-cols-1 gap-5"><div class="card p-5"><h3 class="font-bold text-gray-900 dark:text-white mb-1"><span class="ms text-red-500 mr-1.5">block</span>Eleme şartları</h3><p class="text-xs text-gray-500 mb-3">İşaretlediğiniz şartı sağlamayan başvuru “Elendi” olur. Kalanlar puana göre sıralanır.</p>
   <div class="space-y-2">${L.RULES.map(r => `<div class="flex items-center gap-3 text-sm"><label class="flex items-center gap-2 flex-1 cursor-pointer"><input type="checkbox" ${s.rules[r.id].on || r.b ? 'checked' : ''} ${r.b ? 'disabled title="Zorunlu kural"' : ''} onchange="admSet('rules','${r.id}','on',this.checked)"> ${r.t}</label>${r.b ? '' : num(s.rules[r.id].v, `admSet('rules','${r.id}','v',+this.value)`)}</div>`).join('')}</div>
   <div class="mt-5 pt-4 border-t border-gray-100 dark:border-amoled-border"><div class="text-sm font-bold mb-2"><span class="ms text-green-600 mr-1.5">emoji_events</span>Burs kontenjanı (kişi)</div><div class="qrow"><md-slider id="sl_quota" min="0" max="100" step="1" value="${s.quota}" oninput="admQuota(this.value,'s')"></md-slider><input id="v_quota" type="number" min="0" class="inp !py-1 qnum" value="${s.quota}" oninput="admQuota(this.value,'n')"></div></div></div>
  <details class="card mdpanel2"><summary class="mdsum"><span class="ms">balance</span><span class="flex-1">Puanlama ölçütleri ve ağırlıkları</span><span class="mdbadge">${on} aktif</span></summary><div class="p-5 pt-2"><p class="text-xs text-gray-500 mb-2">Seçili ölçütler ağırlığa göre oranlanarak 0–100 puana çevrilir (ağırlıkların toplamı 100 olmak zorunda değil). Tavan / üst sınır = tam puan için sınır değer. Kapalı da olsa bu ayarlar sıralamayı etkiler.</p>
   ${L.CRIT.map(c => `<div class="crit"><label class="flex items-center gap-2 cursor-pointer min-w-0"><input type="checkbox" ${s.crit[c.id].on ? 'checked' : ''} onchange="admSet('crit','${c.id}','on',this.checked)"><span class="text-sm">${c.t}</span></label><div class="crit-b"><span class="text-[11px] text-gray-500">Ağırlık</span><md-slider min="0" max="40" step="1" value="${s.crit[c.id].w}" oninput="admW('${c.id}',this.value)"></md-slider><b id="w_${c.id}" class="wv">${s.crit[c.id].w}</b>${c.p ? `<span class="text-[11px] text-gray-500">${c.pl}</span>${num(s.crit[c.id].p, `admSet('crit','${c.id}','p',+this.value)`, 'w-20')}` : ''}</div></div>`).join('')}</div></details></div>
  <div class="mt-4 flex flex-wrap gap-2"><button class="btn-p" onclick="admSave()"><span class="ms">save</span> Kaydet</button><button class="btn" onclick="S.adm.set=L.defSet();admSave()">Varsayılana dön</button><button class="btn" onclick="admApprove()"><span class="ms">done_all</span> Burs listesini onayla</button><button class="btn" onclick="S.adm.view='list';$('#app').innerHTML=vAdmin();admTable()">Listeye dön</button></div>`;
}
function admSet(g, id, k, v) { S.adm.set[g][id][k] = v; }
function admW(id, v) { S.adm.set.crit[id].w = +v; const n = $('#w_' + id); if (n) n.textContent = v; }
function admQuota(v, src) { v = Math.max(0, Math.min(999, Math.round(+v) || 0)); S.adm.set.quota = v; const n = $('#v_quota'), sl = $('#sl_quota'); if (n && src !== 'n') n.value = v; if (sl && src !== 's') sl.value = Math.min(100, v); }
async function admSave() { try { await api('/api/admin/settings', { method: 'PUT', json: { settings: S.adm.set } }); S.adm.set = L.mergeSet(S.adm.set); L.setCustom(S.adm.set.custom); toast('Kaydedildi'); $('#app').innerHTML = vAdmin(); if (S.adm.view === 'list') admTable(); return true; } catch (e) { toast(e.message); return false; } }
async function admApprove() {
  await admSave(); const t = admRank().filter(r => r.res === 'Burs' && r.a.status !== 'Onaylandı'); if (!t.length) return toast('Onaylanacak yeni kayıt yok');
  if (!confirm(t.length + ' öğrenci “Onaylandı” yapılsın mı? (Kontenjan: ' + S.adm.set.quota + ')')) return;
  for (const r of t) await api('/api/admin/app/' + (r.a.uid || r.a.F.tc), { method: 'PUT', json: { status: 'Onaylandı' } }); toast(t.length + ' başvuru onaylandı'); loadAdmin();
}
async function admSeed() { try { await api('/api/admin/seed?n=50', { method: 'POST' }); toast('50 örnek (demo) başvuru eklendi'); loadAdmin(); } catch (e) { toast(e.message); } }
async function admDemoDel() { if (!confirm('Tüm demo kayıtlar silinsin mi?')) return; try { const d = await api('/api/admin/demo', { method: 'DELETE' }); toast(d.n + ' demo kayıt silindi'); loadAdmin(); } catch (e) { toast(e.message); } }
async function admWipe() {
  if (!confirm('Tüm başvurular, öğrenci hesapları ve yüklenen belgeler kalıcı olarak silinsin mi?') || !confirm('Bu işlem geri alınamaz. Emin misiniz?')) return;
  try { await api('/api/admin/all?confirm=1', { method: 'DELETE' }); S.adm.set = null; toast('Tüm veriler silindi'); loadAdmin(); } catch (e) { toast(e.message); }
}
async function admOpen(tc) {
  const a = (await api('/api/admin/app/' + tc)).app, f = a.F, d = $('#adet'); a.uid = tc; S.adm.sel = a; const li = S.adm.list.find(x => x.uid === tc), ac = a.acc || (li && li.acc) || { user: tc, mail: f.mail || '', pw: '' }; const r = admRank().find(x => (x.a.uid || x.a.F.tc) === tc) || { m: L.metrics(a), f: [], sc: 0, res: '—', rank: 0 }, m = r.m;
  const kv = (l, v) => `<div class="rounded-lg bg-gray-50 dark:bg-amoled-base p-2 text-center"><div class="text-[10px] text-gray-500">${l}</div><div class="text-sm font-bold break-words" style="user-select:text">${v}</div></div>`;
  d.innerHTML = `<div class="fixed inset-0 z-[90] bg-black/70 overflow-auto p-3 sm:p-6" onclick="if(event.target===this)admClose()"><div class="card max-w-4xl mx-auto p-5 sm:p-6 fade-in">
  <div class="flex justify-between items-start gap-3 mb-4"><div><h3 class="text-xl font-bold text-gray-900 dark:text-white">${E(f.ad || tc)} ${resB(r)}</h3><p class="text-xs text-gray-500">${E(f.tc || tc)} · ${E(f.fakulte || '')} ${E(f.sinif || '')}${a.demo && window.DEMO ? ' · DEMO kayıt' : ''}${a.forced && window.DEMO ? ' · demo gönderim (eksik olabilir)' : ''}</p></div><button class="btn" onclick="admClose()"><span class="ms">close</span></button></div>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">${kv('Kullanıcı adı', E(ac.user))}${kv('E-posta', E(ac.mail || f.mail || '—'))}${ac.pw ? kv('Şifre', E(ac.pw)) : `<div class="rounded-lg bg-gray-50 dark:bg-amoled-base p-2 text-center"><div class="text-[10px] text-gray-500">Şifre</div><button class="btn mt-1" onclick="admResetPw('${tc}')"><span class="ms">lock_reset</span> Sıfırla</button></div>`}</div>
  <div class="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">${kv('Puan', r.sc)}${kv('Toplam gelir', TL(m.total))}${kv('Kişi başı', TL(m.pc))}${kv('Ev / Araç', m.houses + ' / ' + m.cars)}${kv('Kardeş', m.sib)}${kv('Not ort.', m.gno === null ? '—' : m.gno)}</div>
  ${r.f.length ? `<div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 text-xs text-red-700 dark:text-red-400 mb-3"><b>Eleme nedeni:</b> ${r.f.map(E).join(' · ')}</div>` : ''}
  <div class="flex flex-wrap gap-1.5 mb-3">${['Taslak', 'Beklemede', 'Eksik belge', 'Onaylandı', 'Reddedildi'].map(s => `<span class="chip ${a.status === s ? 'on' : ''}" onclick="admSt('${tc}','${s}')">${s}</span>`).join('')}</div>
  <label class="lbl">Not (öğrenci görür)</label><textarea class="inp" rows="2" onchange="admNote('${tc}',this.value)">${E(a.note || '')}</textarea>
  <h4 class="text-sm font-bold mt-5 mb-2">Belgeler (${a.docs.length})</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-3">${a.docs.map((x, i) => { const dd = D.find(y => y.k === x.k); return `<div class="flex gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-amoled-border">${x.thumb ? `<img src="${x.thumb}" class="w-14 h-[72px] object-cover rounded cursor-zoom-in" onclick="admPv(${i})">` : ''}<div class="min-w-0 text-xs"><b class="text-sm">${E(dd ? dd.t : 'Tanınmayan')}</b> <span class="text-gray-500">· ${WN[x.w] || '?'}</span><div class="text-gray-400 truncate">${E(x.name)}</div>${(x.info || []).map(t => `<div>- ${E(t)}</div>`).join('')}${(x.ck || []).filter(c => c.t !== 'ok' || /doğrulandı|Güncel/.test(c.m)).map(c => `<div class="${dcls[c.t]}"><span class="ms mr-1">${dico[c.t]}</span>${E(c.m)}</div>`).join('')}${x.file ? `<button class="btn mt-1" onclick="admPv(${i})"><span class="ms">visibility</span> Aç</button>` : ''}</div></div>`; }).join('') || '<p class="text-sm text-gray-500">Belge yok.</p>'}</div>
  <h4 class="text-sm font-bold mt-5 mb-2">Form bilgileri</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">${ALLF().map(x => `<div class="flex gap-2 border-b border-gray-100 dark:border-amoled-border py-1"><span class="text-gray-500 w-1/2 shrink-0 text-xs">${x[1]}</span><span class="break-words min-w-0">${E(f[x[0]] || '—').replace(/\n/g, '<br>')}</span></div>`).join('')}</div>
  <div class="mt-5 flex justify-between"><button class="btn text-red-600" onclick="admDel('${tc}')"><span class="ms">delete</span> Başvuruyu sil</button><button class="btn-p" onclick="admClose()">Kapat</button></div></div></div>`;
}
function admClose() { $('#adet').innerHTML = ''; loadAdmin(); }
function admPv(i) { const a = S.adm.sel; pv(i, a.docs[i], a.uid || a.F.tc); $('#pv').style.zIndex = 120; }
async function admSt(tc, s) { await api('/api/admin/app/' + tc, { method: 'PUT', json: { status: s } }); await admOpen(tc); toast('Durum: ' + s); }
async function admNote(tc, n) { await api('/api/admin/app/' + tc, { method: 'PUT', json: { note: n } }); toast('Not kaydedildi'); }
async function admDel(tc) { if (!confirm('Bu başvuru ve belgeleri kalıcı silinsin mi?')) return; await api('/api/admin/app/' + tc, { method: 'DELETE' }); admClose(); }
function xrows() {
  const cols = ALLF(), h = ['Sıra', 'Sonuç', 'Puan', 'Durum', 'Kayıt', 'Kullanıcı adı', 'Hesap e-postası', 'Toplam gelir', 'Kişi başı gelir', 'Ev', 'Araç', 'Kardeş', 'Not ort.', 'Belge', 'Eleme nedeni', ...cols.map(c => c[1])];
  return [h, ...admFiltered().map(r => { const ac = r.a.acc || {}; return [r.rank || '', r.res, r.sc, r.a.status, r.a.demo ? 'Demo' : 'Gerçek', ac.user || r.a.uid || '', ac.mail || '', r.m.total, r.m.pc, r.m.houses, r.m.cars, r.m.sib, r.m.gno ?? '', r.m.dp, r.f.join(' | '), ...cols.map(c => r.a.F[c[0]] ?? '')]; })];
}
function dl(blob, name) { const u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
function csv() {
  const q = x => '"' + String(x ?? '').replace(/"/g, '""').replace(/\n/g, ' | ') + '"';
  dl(new Blob(['\ufeff' + xrows().map(r => r.map(q).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'burs-basvurulari.csv');
}
function zipStore(files) {
  const enc = new TextEncoder(), T = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; T[n] = c >>> 0; }
  const crc = d => { let c = -1; for (let i = 0; i < d.length; i++) c = T[(c ^ d[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const u16 = v => [v & 255, (v >> 8) & 255], u32 = v => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255], out = [], cd = []; let off = 0;
  files.forEach(f => {
    const nm = enc.encode(f.n), d = enc.encode(f.d), c = crc(d), lh = new Uint8Array([0x50, 0x4b, 3, 4, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(d.length), ...u32(d.length), ...u16(nm.length), ...u16(0)]);
    out.push(lh, nm, d);
    cd.push(new Uint8Array([0x50, 0x4b, 1, 2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(d.length), ...u32(d.length), ...u16(nm.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), nm);
    off += lh.length + nm.length + d.length;
  });
  const cs = cd.reduce((a, b) => a + b.length, 0), end = new Uint8Array([0x50, 0x4b, 5, 6, 0, 0, 0, 0, ...u16(files.length), ...u16(files.length), ...u32(cs), ...u32(off), 0, 0]);
  return new Blob([...out, ...cd, end], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
function xlsx(rows) {
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  const col = n => { let t = ''; n++; while (n) { const m = (n - 1) % 26; t = String.fromCharCode(65 + m) + t; n = Math.floor((n - 1) / 26); } return t; }, w = rows[0].length;
  const head = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n', ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const cols = rows[0].map((h, j) => `<col min="${j + 1}" max="${j + 1}" width="${Math.min(42, Math.max(11, String(h).length + 3))}" customWidth="1"/>`).join('');
  const data = rows.map((r, i) => `<row r="${i + 1}">` + r.map((v, j) => { const ref = col(j) + (i + 1), st = i ? '' : ' s="1"'; if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}"${st}><v>${v}</v></c>`; v = String(v ?? ''); return v === '' ? '' : `<c r="${ref}" t="inlineStr"${st}><is><t xml:space="preserve">${esc(v)}</t></is></c>`; }).join('') + '</row>').join('');
  return zipStore([
    { n: '[Content_Types].xml', d: head + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
    { n: '_rels/.rels', d: head + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
    { n: 'xl/workbook.xml', d: head + `<workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Başvurular" sheetId="1" r:id="rId1"/></sheets></workbook>` },
    { n: 'xl/_rels/workbook.xml.rels', d: head + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
    { n: 'xl/styles.xml', d: head + `<styleSheet xmlns="${ns}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFB4121F"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>` },
    { n: 'xl/worksheets/sheet1.xml', d: head + `<worksheet xmlns="${ns}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${data}</sheetData><autoFilter ref="A1:${col(w - 1)}${rows.length}"/></worksheet>` }
  ]);
}
function exportX(kind) { const m = $('#xmenu'); if (m) m.classList.add('hidden'); if (kind === 'csv') return csv(); try { dl(xlsx(xrows()), 'burs-basvurulari.xlsx'); } catch (e) { console.error(e); toast('Excel oluşturulamadı, CSV indiriliyor'); csv(); } }
function xmenu(e) { e.stopPropagation(); $('#xmenu').classList.toggle('hidden'); }
document.addEventListener('click', e => { const m = $('#xmenu'); if (m && !m.classList.contains('hidden') && !e.target.closest('.xsp')) m.classList.add('hidden'); });
boot();
