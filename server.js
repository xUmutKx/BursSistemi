'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), os = require('os');
const L = require('./public/logic.js'), SG = require('./public/seedgen.js'), mailer = require('./mail.js');
const UNI = 'Tekirdağ Namık Kemal Üniversitesi – Tıp Fakültesi', codes = new Map();
const mkCode = em => { const c = String(crypto.randomInt(0, 1e6)).padStart(6, '0'); codes.set(em, { h: crypto.createHash('sha256').update(c).digest('hex'), exp: Date.now() + 6e5, n: 0, sent: Date.now() }); return c; };
const okCode = (em, c) => { const v = codes.get(em); if (!v || v.exp < Date.now() || ++v.n > 5) { codes.delete(em); return false; } const ok = same(v.h, crypto.createHash('sha256').update(String(c || '').trim()).digest('hex')); if (ok) codes.delete(em); return ok; };
const PORT = +process.env.PORT || 8080;
// MOD: auto (varsayılan; istemci demo/gerçek arasında seçer) | demo (hep demo) | canli (hep gerçek, demo özellikleri kapalı)
const MOD = String(process.env.MOD || 'auto').toLowerCase(), LOCK = MOD === 'canli' ? 'live' : MOD === 'demo' ? 'demo' : '';
const DEMO_TAP = process.env.DEMO_TAP !== '0', AUTO_USER = process.env.AUTO_USER !== '0', TRUST_PROXY = process.env.TRUST_PROXY === '1';
const PUB = path.join(__dirname, 'public'), DATA = path.join(__dirname, 'data'), UP = path.join(DATA, 'uploads'), BAK = path.join(DATA, 'yedek');
fs.mkdirSync(UP, { recursive: true }); fs.mkdirSync(BAK, { recursive: true });
const DBF = path.join(DATA, 'db.json');
let db = { users: {}, apps: {}, sessions: {}, settings: null };
try { db = Object.assign(db, JSON.parse(fs.readFileSync(DBF, 'utf8'))); } catch (e) {}
const curSet = () => L.mergeSet(db.settings);
L.setCustom(curSet().custom);

// ---- kaydetme + günlük yedek (son 14 gün) ----
let tm = null, lastBak = '';
const flush = () => {
  clearTimeout(tm);
  try {
    fs.writeFileSync(DBF + '.tmp', JSON.stringify(db)); fs.renameSync(DBF + '.tmp', DBF);
    const day = new Date().toISOString().slice(0, 10);
    if (day !== lastBak) { lastBak = day; fs.copyFileSync(DBF, path.join(BAK, 'db-' + day + '.json')); fs.readdirSync(BAK).filter(f => /^db-.*\.json$/.test(f)).sort().slice(0, -14).forEach(f => { try { fs.unlinkSync(path.join(BAK, f)); } catch (e) {} }); }
  } catch (e) { console.error('Kayıt hatası', e.message); }
};
const persist = () => { clearTimeout(tm); tm = setTimeout(flush, 200); };
['SIGINT', 'SIGTERM'].forEach(s => process.on(s, () => { flush(); process.exit(0); }));
process.on('uncaughtException', e => console.error('Beklenmeyen hata:', e && e.message));
process.on('unhandledRejection', e => console.error('Beklenmeyen hata:', e && e.message));

// ---- parola ----
const hash = (pw, salt) => crypto.scryptSync(String(pw), salt, 32).toString('hex');
const same = (a, b) => { try { const x = Buffer.from(a, 'hex'), y = Buffer.from(b, 'hex'); return x.length === y.length && crypto.timingSafeEqual(x, y); } catch (e) { return false; } };
const mkUser = (tc, name, pw, role, extra) => { const salt = crypto.randomBytes(8).toString('hex'); const u = Object.assign({ tc, name, role, salt, h: hash(pw, salt), created: Date.now() }, extra || {}); if (role === 'student' && u.demo) u.pt = String(pw); return u; };
const explicitPw = !!process.env.ADMIN_PW, A0 = db.users.admin;
const weakPw = !!A0 && same(A0.h, hash('123', A0.salt));
let adminPw = process.env.ADMIN_PW || (A0 && !(LOCK === 'live' && weakPw) ? '' : '123');
if (explicitPw || !A0 || (LOCK === 'live' && weakPw)) {
  if (!explicitPw && LOCK === 'live') {
    const f = path.join(DATA, 'admin-sifre.txt'); adminPw = '';
    try { adminPw = fs.readFileSync(f, 'utf8').trim(); } catch (e) {}
    if (!adminPw || adminPw === '123') { adminPw = crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, 'x'); fs.writeFileSync(f, adminPw + '\n', { mode: 0o600 }); console.log('  Yönetici şifresi oluşturuldu ve ' + f + ' dosyasına yazıldı (ilk girişten sonra panelden değiştirip dosyayı silin).'); }
  }
  db.users.admin = mkUser('admin', 'Yönetici', adminPw, 'admin');
} else adminPw = weakPw ? '123' : '';
flush();
const newApp = u => ({ F: { ad: u.name && u.name !== u.tc ? u.name : '', tc: u.tc, mail: u.email || '', tel: u.tel || '', _a: {} }, docs: [], status: 'Taslak', note: '', terms: 0, created: Date.now(), updated: Date.now() });

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = a => a[rnd(0, a.length - 1)];
function seed(n) {
  for (let i = 0; i < n; i++) {
    let tc; do tc = '9' + String(rnd(1e9, 9e9 - 1)).padStart(10, '0').slice(0, 10); while (db.users[tc]);
    const F = SG.make(tc, rnd, pick), u = db.users[tc] = mkUser(tc, F.ad, '123', 'student', { demo: true, email: F.mail, tel: F.tel });
    const a = newApp(u); a.F = F; a.terms = 1; a.status = pick(['Beklemede', 'Beklemede', 'Beklemede', 'Taslak', 'Onaylandı']); a.sent = Date.now() - rnd(0, 20) * 864e5;
    const miss = Math.random() < .3, dir = path.join(UP, tc); fs.mkdirSync(dir, { recursive: true });
    a.docs = L.SL.filter(x => !x.custom && L.req(F, x)).filter(() => !miss || Math.random() > .25).map(x => {
      const who = x.w === 'm' ? F['anne.ad'] : x.w === 'f' ? F['baba.ad'] : F.ad, wtc = x.w === 'm' ? F['anne.tc'] : x.w === 'f' ? F['baba.tc'] : F.tc, fid = 'demo-' + x.k + '-' + x.w + '.svg';
      try { fs.writeFileSync(path.join(dir, fid), SG.svg(x.t, who, wtc, [L.WN[x.w] + ' adına', x.d])); } catch (e) {}
      return { id: x.id, k: x.k, w: x.w, name: fid, file: fid, thumb: SG.thumb(x.t, who), ck: [{ t: 'ok', m: 'Demo belge' }], info: ['Demo belge – ' + who], ts: Date.now() };
    });
    db.apps[tc] = a;
  }
}

// ---- güvenlik: başlıklar, hız sınırı ----
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.wasm': 'application/wasm', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.pdf': 'application/pdf', '.svg': 'image/svg+xml', '.traineddata': 'application/octet-stream', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const SEC = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()', 'Cross-Origin-Opener-Policy': 'same-origin' };
const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: data:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' blob: data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
const hits = new Map();
setInterval(() => { const t = Date.now(); hits.forEach((v, k) => { if (v.until < t && v.t + 36e5 < t) hits.delete(k); }); Object.keys(db.sessions).forEach(k => { if (db.sessions[k].exp < t) delete db.sessions[k]; }); }, 6e5).unref();
const ipOf = req => (TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || '?';
// kova: win ms içinde max istek; aşılırsa bekleme süresi dolana dek reddeder
const bucket = (key, max, win, ban) => { const t = Date.now(); let v = hits.get(key); if (!v || v.t + win < t) v = { n: 0, t, until: 0 }; if (v.until > t) { hits.set(key, v); return false; } v.n++; if (v.n > max) v.until = t + (ban || win); hits.set(key, v); return v.n <= max; };
const modeOf = req => LOCK || (String(req.headers['x-mode'] || '') === 'live' ? 'live' : 'demo');
const send = (res, code, obj) => { const b = Buffer.from(JSON.stringify(obj)); res.writeHead(code, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': b.length, 'Cache-Control': 'no-store' }, SEC)); res.end(b); };
const body = (req, max) => new Promise((ok, no) => { const c = []; let n = 0; req.on('data', d => { n += d.length; if (n > max) { no(new Error('Dosya çok büyük')); req.destroy(); } else c.push(d); }); req.on('end', () => ok(Buffer.concat(c))); req.on('error', no); });
const json = async (req, max = 8e6) => { const b = await body(req, max); try { const o = JSON.parse(b.toString('utf8') || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { throw new Error('Geçersiz istek'); } };
const auth = (req, url) => { const t = (req.headers.authorization || '').replace(/^Bearer /, '') || url.searchParams.get('t'); const s = t && db.sessions[t]; if (!s || s.exp < Date.now()) return null; const u = db.users[s.tc]; return u ? { u, t } : null; };
const safe = s => String(s || 'dosya').replace(/[^\w.\-çğıöşüÇĞİÖŞÜ ]/g, '_').slice(-80);
const SESSION_MS = 14 * 864e5;

// yüklenen dosyanın gerçek türü (uzantıya/başlığa güvenilmez)
const sniff = b => b.length > 12 && (b.slice(0, 4).toString('latin1') === '%PDF' ? '.pdf' : b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF ? '.jpg' : b.slice(1, 4).toString('latin1') === 'PNG' && b[0] === 0x89 ? '.png' : b.slice(0, 4).toString('latin1') === 'RIFF' && b.slice(8, 12).toString('latin1') === 'WEBP' ? '.webp' : null);
const FKEY = /^[\w\-]{1,40}$/;
const cleanF = F => {
  const o = { _a: {} }; let n = 0;
  for (const k of Object.keys(F || {})) { if (k === '_a') { const a = F._a; if (a && typeof a === 'object') for (const x of Object.keys(a).slice(0, 300)) if (/^[\w.]{1,40}$/.test(x)) o._a[x] = String(a[x]).slice(0, 60); continue; } if (++n > 400 || !/^[\w.]{1,40}$/.test(k)) continue; o[k] = String(F[k] == null ? '' : F[k]).slice(0, 5000); }
  return o;
};
const cleanDocs = (docs, tc) => docs.slice(0, 150).filter(d => d && typeof d === 'object').map(d => {
  const o = { id: String(d.id || '').slice(0, 40), k: String(d.k || '?').slice(0, 30), w: String(d.w || '?').slice(0, 3), name: String(d.name || '').slice(0, 120), file: /^[\w.\-]{1,60}$/.test(String(d.file || '')) ? d.file : '', thumb: typeof d.thumb === 'string' && d.thumb.length < 200000 && /^data:image\//.test(d.thumb) ? d.thumb : '', text: String(d.text || '').slice(0, 16000), src: String(d.src || '').slice(0, 10), ts: +d.ts || Date.now(), dark: !!d.dark };
  o.ck = (Array.isArray(d.ck) ? d.ck : []).slice(0, 30).map(c => ({ t: ['ok', 'warn', 'bad'].includes(c && c.t) ? c.t : 'warn', m: String(c && c.m || '').slice(0, 400) }));
  o.info = (Array.isArray(d.info) ? d.info : []).slice(0, 30).map(x => String(x).slice(0, 400));
  o.extra = (Array.isArray(d.extra) ? d.extra : []).slice(0, 30).map(x => ({ name: String(x && x.name || '').slice(0, 120), file: /^[\w.\-]{1,60}$/.test(String(x && x.file || '')) ? x.file : '' }));
  return o;
});
const adminView = (a, uid) => { const us = db.users[uid] || {}; return { ...a, uid, demo: !!us.demo, acc: { user: uid, mail: us.email || a.F.mail || '', pw: us.demo ? (us.pt || '') : '' }, docs: (a.docs || []).map(d => { const { text, ...r } = d; return r; }) }; };
const pubTerm = () => { const t = curSet().term; return { name: t.name, open: t.open, close: t.close, enforce: t.enforce, msg: t.msg }; };
const genPw = () => { const c = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return Array.from(crypto.randomBytes(10), b => c[b % c.length]).join(''); };
const STATUSES = ['Taslak', 'Beklemede', 'Eksik belge', 'Onaylandı', 'Reddedildi'];

async function api(req, res, url) {
  const p = url.pathname, m = req.method, ip = ipOf(req), mode = modeOf(req);
  try {
    if (!bucket('g:' + ip, 600, 6e4, 6e4)) return send(res, 429, { error: 'Çok fazla istek – bir dakika sonra deneyin' });
    if (p === '/api/cfg' && m === 'GET') return send(res, 200, { lock: LOCK, term: pubTerm(), now: Date.now() });
    if (p === '/api/login' && m === 'POST') {
      const { tc, pw } = await json(req, 1e4); const id = String(tc || '').trim().toLowerCase().slice(0, 40), fk = 'l:' + ip + ':' + id;
      if (!id || !pw) return send(res, 400, { error: 'TCKN ve şifre girin' });
      const hit = hits.get(fk); if (hit && hit.until > Date.now()) return send(res, 429, { error: 'Çok fazla hatalı deneme – 10 dakika sonra tekrar deneyin' });
      const fail = msg => { bucket(fk, 7, 6e5, 6e5); return send(res, 401, { error: msg }); };
      const demoOk = mode === 'demo';
      let u = db.users[id];
      if (!u) {
        if (!(demoOk && AUTO_USER && pw === '123' && /^\d{11}$/.test(id))) return fail(demoOk ? 'Kullanıcı bulunamadı. Demo: 11 haneli TCKN + şifre 123 veya Kayıt Ol' : 'TCKN veya şifre hatalı');
        u = db.users[id] = mkUser(id, id, '123', 'student', { demo: true }); db.apps[id] = newApp(u);
      } else if (!same(u.h, hash(pw, u.salt)) && !(demoOk && u.demo && pw === '123')) return fail(demoOk ? 'Şifre hatalı' : 'TCKN veya şifre hatalı');
      if (u.role === 'admin' && !same(u.h, hash(pw, u.salt))) return fail('TCKN veya şifre hatalı');
      hits.delete(fk);
      const t = crypto.randomBytes(24).toString('hex'); db.sessions[t] = { tc: u.tc, exp: Date.now() + SESSION_MS }; persist();
      return send(res, 200, { token: t, user: { tc: u.tc, name: u.name, role: u.role } });
    }
    if (p === '/api/email-code' && m === 'POST') {
      const b = await json(req, 2e3), em = String(b.email || '').trim().toLowerCase().slice(0, 100), demoOk = mode === 'demo';
      if (!mailer.MAIL_RE.test(em)) return send(res, 400, { error: 'Geçerli bir e-posta adresi girin' });
      if (!bucket('c:' + ip, 8, 36e5, 36e5)) return send(res, 429, { error: 'Çok fazla kod isteği – daha sonra tekrar deneyin' });
      const old = codes.get(em); if (old && Date.now() - old.sent < 6e4) return send(res, 429, { error: 'Yeni kod için 1 dakika bekleyin' });
      if (!demoOk && !mailer.enabled()) return send(res, 503, { error: 'E-posta gönderimi bu sunucuda ayarlanmamış (SMTP_HOST, SMTP_USER, SMTP_PASS)' });
      const c = mkCode(em);
      if (demoOk) return send(res, 200, { ok: true, demoCode: c });
      try { await mailer.send(em, 'E-Burs Portalı doğrulama kodu', 'Doğrulama kodunuz: ' + c + '\n\nKod 10 dakika geçerlidir. Bu isteği siz yapmadıysanız bu iletiyi dikkate almayın.'); } catch (e) { codes.delete(em); console.error('mail:', e.message); return send(res, 502, { error: 'E-posta gönderilemedi, adresi kontrol edip tekrar deneyin' }); }
      return send(res, 200, { ok: true });
    }
    if (p === '/api/register' && m === 'POST') {
      if (!bucket('r:' + ip, 12, 36e5, 36e5)) return send(res, 429, { error: 'Çok fazla kayıt denemesi – daha sonra tekrar deneyin' });
      const b = await json(req, 2e4), id = String(b.tc || '').trim().toLowerCase(), demoOk = mode === 'demo';
      const foreign = !!b.foreign; if (foreign ? !/^[A-Za-z0-9]{5,20}$/.test(id) : !/^\d{11}$/.test(id)) return send(res, 400, { error: foreign ? 'Yabancı kimlik / pasaport no 5-20 harf-rakam olmalı' : 'TCKN 11 haneli olmalı' });
      if (!b.name || String(b.name).trim().length < 3) return send(res, 400, { error: 'Ad soyad girin' });
      if (!b.pw || String(b.pw).length < (demoOk ? 3 : 8)) return send(res, 400, { error: 'Şifre en az ' + (demoOk ? 3 : 8) + ' karakter olmalı' });
      if (String(b.uni || '').trim() !== UNI) return send(res, 400, { error: 'Yalnızca ' + UNI + ' öğrencileri başvurabilir' });
      const em = String(b.email || '').trim().toLowerCase(); if (!mailer.MAIL_RE.test(em)) return send(res, 400, { error: 'Geçerli bir e-posta adresi girin' });
      if (!okCode(em, b.code)) return send(res, 400, { error: 'E-posta doğrulama kodu hatalı veya süresi dolmuş' });
      const old = db.users[id]; if (old && !old.demo) return send(res, 409, { error: 'Bu TCKN zaten kayıtlı' });
      const u = db.users[id] = mkUser(id, String(b.name).trim().slice(0, 80), String(b.pw).slice(0, 100), 'student', { demo: demoOk, foreign: !!b.foreign, email: em.slice(0, 100), tel: String(b.tel || '').slice(0, 30), uni: UNI });
      const a = db.apps[id] = db.apps[id] || newApp(u); a.F.ad = u.name; a.F.mail = a.F.mail || u.email; a.F.tel = a.F.tel || u.tel; if (u.uni && !a.F.fakulte) a.F.fakulte = u.uni; persist();
      return send(res, 200, { ok: true });
    }
    const s = auth(req, url);
    if (p.startsWith('/api/file/') && m === 'GET') {
      if (!s) return send(res, 401, { error: 'Oturum yok' });
      const [, , , tc, f] = p.split('/'); if (s.u.role !== 'admin' && s.u.tc !== tc) return send(res, 403, { error: 'Yetkisiz' });
      const fp = path.join(UP, path.basename(String(tc || '')), path.basename(decodeURIComponent(f || '')));
      if (!fp.startsWith(UP + path.sep) || !fs.existsSync(fp)) return send(res, 404, { error: 'Yok' });
      res.writeHead(200, Object.assign({ 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'private, max-age=3600', 'Content-Security-Policy': "sandbox; default-src 'none'; style-src 'unsafe-inline'", 'Content-Disposition': 'inline' }, SEC));
      return fs.createReadStream(fp).pipe(res);
    }
    if (!s) return send(res, 401, { error: 'Oturum süresi doldu' });
    const u = s.u, cfg = curSet();
    if (p === '/api/profile' && m === 'POST') {
      if (u.role !== 'student') return send(res, 403, { error: 'Yönetici bilgileri buradan değiştirilemez' });
      if (!bucket('pf:' + u.tc, 15, 36e5, 36e5)) return send(res, 429, { error: 'Çok fazla deneme – daha sonra tekrar deneyin' });
      const b = await json(req, 4e3), a = db.apps[u.tc] = db.apps[u.tc] || newApp(u), em = String(b.email || '').trim().toLowerCase().slice(0, 100), tel = String(b.tel || '').trim().slice(0, 30);
      const curOk = () => same(u.h, hash(b.cur || '', u.salt)) || (u.demo && mode === 'demo' && String(b.cur || '') === '123');
      if (em && em !== String(u.email || '').toLowerCase()) {
        if (!mailer.MAIL_RE.test(em)) return send(res, 400, { error: 'Geçerli bir e-posta adresi girin' });
        if (!okCode(em, b.code)) return send(res, 400, { error: 'Yeni e-posta için doğrulama kodu hatalı veya süresi dolmuş' });
        u.email = em; a.F.mail = em;
      }
      if (tel) { u.tel = tel; a.F.tel = tel; }
      if (b.pw) {
        if (!curOk()) return send(res, 401, { error: 'Mevcut şifre hatalı' });
        if (String(b.pw).length < (mode === 'demo' ? 3 : 8)) return send(res, 400, { error: 'Şifre en az ' + (mode === 'demo' ? 3 : 8) + ' karakter olmalı' });
        u.salt = crypto.randomBytes(8).toString('hex'); u.h = hash(String(b.pw).slice(0, 100), u.salt); if (u.demo) u.pt = String(b.pw).slice(0, 100);
        Object.keys(db.sessions).forEach(k => { if (db.sessions[k].tc === u.tc && k !== s.t) delete db.sessions[k]; });
      }
      persist(); return send(res, 200, { ok: true, email: u.email || '', tel: u.tel || '' });
    }
    if (p === '/api/me' && m === 'GET') {
      const pub = { term: pubTerm(), custom: cfg.custom };
      if (u.role === 'admin') return send(res, 200, { user: { tc: u.tc, name: u.name, role: u.role }, cfg: pub });
      const a = db.apps[u.tc] = db.apps[u.tc] || newApp(u);
      return send(res, 200, { user: { tc: u.tc, name: u.name, role: u.role }, app: a, cfg: pub, demo: !!u.demo });
    }
    if (p === '/api/logout' && m === 'POST') { delete db.sessions[s.t]; persist(); return send(res, 200, { ok: true }); }
    if (u.role === 'student') {
      const a = db.apps[u.tc] = db.apps[u.tc] || newApp(u);
      if (p === '/api/app' && m === 'PUT') {
        const b = await json(req);
        if (b.F && typeof b.F === 'object') { a.F = cleanF(b.F); a.F.tc = a.F.tc || u.tc; if (a.F.ad && u.demo && u.name === u.tc) { u.name = a.F.ad; } }
        if (Array.isArray(b.docs)) { const nd = cleanDocs(b.docs, u.tc), keep = new Set(nd.flatMap(d => [d.file, ...d.extra.map(x => x.file)]).filter(Boolean)); (a.docs || []).forEach(d => [d.file, ...(d.extra || []).map(x => x.file)].forEach(f => { if (f && !keep.has(f)) { try { fs.unlinkSync(path.join(UP, u.tc, path.basename(f))); } catch (e) {} } })); a.docs = nd; }
        if (b.terms !== undefined) a.terms = b.terms ? 1 : 0;
        a.updated = Date.now(); persist(); return send(res, 200, { ok: true, name: u.name });
      }
      if (p === '/api/upload' && m === 'POST') {
        if (!bucket('u:' + u.tc, 300, 36e5, 6e5)) return send(res, 429, { error: 'Çok fazla yükleme – biraz bekleyin' });
        const dir = path.join(UP, u.tc); fs.mkdirSync(dir, { recursive: true });
        if (fs.readdirSync(dir).length > 150) return send(res, 413, { error: 'Dosya sayısı sınırına ulaşıldı' });
        const buf = await body(req, 26e6), ext = sniff(buf);
        if (!ext) return send(res, 415, { error: 'Yalnızca PDF, JPG, PNG veya WEBP yüklenebilir' });
        const fn = Date.now().toString(36) + crypto.randomBytes(3).toString('hex') + ext; fs.writeFileSync(path.join(dir, fn), buf);
        return send(res, 200, { file: fn, size: buf.length });
      }
      if (p === '/api/submit' && m === 'POST') {
        const force = u.demo && DEMO_TAP && url.searchParams.get('force') === '1', T = L.termState(cfg.term);
        if (!u.demo && T.s !== 'open') return send(res, 403, { error: cfg.term.msg || (T.s === 'before' ? 'Başvurular ' + L.fmtD(cfg.term.open) + ' tarihinde açılacak' : 'Başvuru dönemi sona erdi') });
        const bad = force ? null : L.steps(a.F, a.docs || [], a.terms).find(x => !x.ok); a.forced = !!force;
        if (bad) return send(res, 400, { error: 'Başvuru gönderilemez – ' + bad.why });
        if (a.status === 'Beklemede' || a.status === 'Onaylandı') return send(res, 400, { error: 'Başvuru zaten gönderildi' });
        a.status = 'Beklemede'; a.sent = Date.now(); persist(); return send(res, 200, { ok: true, status: a.status });
      }
    }
    if (u.role === 'admin') {
      if (p === '/api/admin/all' && m === 'DELETE') { if (url.searchParams.get('confirm') !== '1') return send(res, 400, { error: 'Onay gerekli' }); const n = Object.keys(db.apps).length; db.apps = {}; Object.keys(db.users).forEach(k => { if (k !== 'admin') delete db.users[k]; }); Object.keys(db.sessions).forEach(t => { if (db.sessions[t].tc !== 'admin') delete db.sessions[t]; }); try { fs.rmSync(UP, { recursive: true, force: true }); fs.mkdirSync(UP, { recursive: true }); } catch (e) {} persist(); return send(res, 200, { ok: true, n }); }
      if (p === '/api/admin/apps' && m === 'GET') return send(res, 200, { apps: Object.entries(db.apps).filter(([k]) => db.users[k] && db.users[k].role === 'student').map(([k, a]) => adminView(a, k)) });
      if (p === '/api/admin/settings') { if (m === 'GET') return send(res, 200, { settings: db.settings }); if (m === 'PUT') { const b = await json(req, 2e6); db.settings = L.mergeSet(b.settings); L.setCustom(db.settings.custom); persist(); return send(res, 200, { ok: true, settings: db.settings }); } }
      if (p === '/api/admin/seed' && m === 'POST') { if (mode !== 'demo') return send(res, 403, { error: 'Bu işlem yalnızca demo modunda kullanılabilir' }); seed(Math.min(50, +(url.searchParams.get('n')) || 12)); persist(); return send(res, 200, { ok: true }); }
      if (p === '/api/admin/demo' && m === 'DELETE') { let n = 0; Object.values(db.users).filter(x => x.demo).forEach(x => { delete db.apps[x.tc]; delete db.users[x.tc]; try { fs.rmSync(path.join(UP, x.tc), { recursive: true, force: true }); } catch (e) {} n++; }); persist(); return send(res, 200, { ok: true, n }); }
      if (p === '/api/admin/pw' && m === 'POST') { const b = await json(req, 1e4), pw = String(b.pw || ''); if (pw.length < 8) return send(res, 400, { error: 'Şifre en az 8 karakter olmalı' }); if (!same(u.h, hash(String(b.old || ''), u.salt))) return send(res, 403, { error: 'Mevcut şifre hatalı' }); const salt = crypto.randomBytes(8).toString('hex'); u.salt = salt; u.h = hash(pw, salt); persist(); return send(res, 200, { ok: true, note: 'ADMIN_PW ortam değişkeni tanımlıysa sunucu yeniden başlayınca o şifre geçerli olur' }); }
      const mm = p.match(/^\/api\/admin\/app\/(\d+)$/);
      if (mm && db.apps[mm[1]]) {
        const a = db.apps[mm[1]];
        if (m === 'GET') return send(res, 200, { app: { ...a, uid: mm[1], acc: adminView(a, mm[1]).acc } });
        if (m === 'PUT') {
          const b = await json(req, 2e5), out = { ok: true };
          if (b.status && STATUSES.includes(String(b.status))) a.status = String(b.status);
          if (b.note !== undefined) a.note = String(b.note).slice(0, 2000);
          if (b.resetPw && db.users[mm[1]]) { const us = db.users[mm[1]], pw = genPw(); us.salt = crypto.randomBytes(8).toString('hex'); us.h = hash(pw, us.salt); if (us.demo) us.pt = pw; Object.keys(db.sessions).forEach(t => { if (db.sessions[t].tc === mm[1]) delete db.sessions[t]; }); out.pw = pw; }
          a.updated = Date.now(); persist(); return send(res, 200, out);
        }
        if (m === 'DELETE') { delete db.apps[mm[1]]; delete db.users[mm[1]]; try { fs.rmSync(path.join(UP, mm[1]), { recursive: true, force: true }); } catch (e) {} persist(); return send(res, 200, { ok: true }); }
      }
    }
    return send(res, 404, { error: 'Bulunamadı' });
  } catch (e) { return send(res, e.message === 'Dosya çok büyük' ? 413 : 500, { error: e.message || 'Sunucu hatası' }); }
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/')) return api(req, res, url);
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, SEC); return res.end(); }
  let f; try { f = decodeURIComponent(url.pathname); } catch (e) { res.writeHead(400, SEC); return res.end(); }
  if (f === '/') f = '/index.html';
  const fp = path.normalize(path.join(PUB, f));
  if (!fp.startsWith(PUB + path.sep) || /(^|[\\/])\./.test(path.relative(PUB, fp)) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404, SEC); return res.end('404'); }
  const h = Object.assign({ 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream', 'Cache-Control': /vendor/.test(f) ? 'public, max-age=86400' : 'no-cache' }, SEC);
  if (/\.html$/.test(fp) && process.env.NO_CSP !== '1') h['Content-Security-Policy'] = CSP;
  res.writeHead(200, h);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(fp).pipe(res);
}).listen(PORT, '0.0.0.0', () => {
  console.log('\n  Burs Sistemi çalışıyor  [mod: ' + (MOD === 'canli' ? 'CANLI (kilitli)' : MOD === 'demo' ? 'DEMO (kilitli)' : 'otomatik') + ']\n');
  console.log('  Bu bilgisayar : http://localhost:' + PORT);
  Object.values(os.networkInterfaces()).flat().filter(i => i && i.family === 'IPv4' && !i.internal).forEach(i => console.log('  Telefon (aynı Wi-Fi): http://' + i.address + ':' + PORT));
  if (adminPw === '123') console.log('\n  UYARI: yönetici şifresi varsayılan (123). Gerçek kullanımda:  MOD=canli ADMIN_PW=GucluSifre node server.js');
  console.log('  Kapatmak için bu pencereyi kapatın (Ctrl+C).\n');
}).on('error', e => { console.error(e.code === 'EADDRINUSE' ? 'Port ' + PORT + ' dolu. Başka port: PORT=9090 node server.js' : e.message); process.exit(1); });
