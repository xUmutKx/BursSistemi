'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), os = require('os');
const L = require('./public/logic.js'), SG = require('./public/seedgen.js');
const PORT = +process.env.PORT || 8080;
const ADMIN_PW = process.env.ADMIN_PW || '123', DEMO_TAP = process.env.DEMO_TAP !== '0', AUTO_USER = process.env.AUTO_USER !== '0';
const PUB = path.join(__dirname, 'public'), DATA = path.join(__dirname, 'data'), UP = path.join(DATA, 'uploads');
fs.mkdirSync(UP, { recursive: true });
const DBF = path.join(DATA, 'db.json');
let db = { users: {}, apps: {}, sessions: {}, settings: null };
try { db = Object.assign(db, JSON.parse(fs.readFileSync(DBF, 'utf8'))); } catch (e) {}
let tm = null;
const flush = () => { clearTimeout(tm); try { fs.writeFileSync(DBF + '.tmp', JSON.stringify(db)); fs.renameSync(DBF + '.tmp', DBF); } catch (e) { console.error('Kayıt hatası', e.message); } };
const persist = () => { clearTimeout(tm); tm = setTimeout(flush, 200); };
['SIGINT', 'SIGTERM'].forEach(s => process.on(s, () => { flush(); process.exit(0); }));

const hash = (pw, salt) => crypto.scryptSync(pw, salt, 32).toString('hex');
const mkUser = (tc, name, pw, role, extra) => { const salt = crypto.randomBytes(8).toString('hex'); return Object.assign({ tc, name, role, salt, h: hash(pw, salt), created: Date.now() }, role === 'student' ? { pt: String(pw) } : {}, extra || {}); };
db.users.admin = mkUser('admin', 'Yönetici', ADMIN_PW, 'admin'); flush();
const newApp = u => ({ F: { ad: u.name && u.name !== u.tc ? u.name : '', tc: u.tc, mail: u.email || '', tel: u.tel || '', _a: {} }, docs: [], status: 'Taslak', note: '', terms: 0, created: Date.now(), updated: Date.now() });

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = a => a[rnd(0, a.length - 1)];
function seed(n) {
  for (let i = 0; i < n; i++) {
    let tc; do tc = '9' + String(rnd(1e9, 9e9 - 1)).padStart(10, '0').slice(0, 10); while (db.users[tc]);
    const F = SG.make(tc, rnd, pick), u = db.users[tc] = mkUser(tc, F.ad, '123', 'student', { demo: true, email: F.mail, tel: F.tel });
    const a = newApp(u); a.F = F; a.terms = 1; a.status = pick(['Beklemede', 'Beklemede', 'Beklemede', 'Taslak', 'Onaylandı']); a.sent = Date.now() - rnd(0, 20) * 864e5;
    const miss = Math.random() < .3, dir = path.join(UP, tc); fs.mkdirSync(dir, { recursive: true });
    a.docs = L.SL.filter(x => L.req(F, x)).filter(() => !miss || Math.random() > .25).map(x => {
      const who = x.w === 'm' ? F['anne.ad'] : x.w === 'f' ? F['baba.ad'] : F.ad, wtc = x.w === 'm' ? F['anne.tc'] : x.w === 'f' ? F['baba.tc'] : F.tc, fid = 'demo-' + x.k + '-' + x.w + '.svg';
      try { fs.writeFileSync(path.join(dir, fid), SG.svg(x.t, who, wtc, [L.WN[x.w] + ' adına', x.d])); } catch (e) {}
      return { id: x.id, k: x.k, w: x.w, name: fid, file: fid, thumb: SG.thumb(x.t, who), ck: [{ t: 'ok', m: 'Demo belge' }], info: ['Demo belge – ' + who], ts: Date.now() };
    });
    db.apps[tc] = a;
  }
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.wasm': 'application/wasm', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.pdf': 'application/pdf', '.svg': 'image/svg+xml', '.traineddata': 'application/octet-stream', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const SEC = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
};
const withSec = h => Object.assign({}, SEC, h);
const send = (res, code, obj) => { const b = Buffer.from(JSON.stringify(obj)); res.writeHead(code, withSec({ 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': b.length, 'Cache-Control': 'no-store' })); res.end(b); };
const body = (req, max) => new Promise((ok, no) => { const c = []; let n = 0; req.on('data', d => { n += d.length; if (n > max) { no(new Error('Dosya çok büyük')); req.destroy(); } else c.push(d); }); req.on('end', () => ok(Buffer.concat(c))); req.on('error', no); });
const json = async (req, max = 60e6) => { const b = await body(req, max); try { return JSON.parse(b.toString('utf8') || '{}'); } catch (e) { throw new Error('Geçersiz istek'); } };
const auth = (req, url) => { const t = (req.headers.authorization || '').replace(/^Bearer /, '') || url.searchParams.get('t'); const s = t && db.sessions[t]; if (!s || s.exp < Date.now()) return null; const u = db.users[s.tc]; return u ? { u, t } : null; };
const safe = s => String(s || 'dosya').replace(/[^\w.\-çğıöşüÇĞİÖŞÜ ]/g, '_').slice(-80);
const clean = d => ({ ...d });
const adminView = (a, uid) => { const us = db.users[uid] || {}; return { ...a, uid, demo: !!us.demo, acc: { user: uid, mail: us.email || a.F.mail || '', pw: us.pt || '' }, docs: (a.docs || []).map(d => { const { text, ...r } = d; return r; }) }; };
const RL = new Map();
const rlim = (req, key, lim, winMs) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
  const k = key + '|' + ip, now = Date.now(), x = RL.get(k);
  if (!x || x.reset <= now) { RL.set(k, { n: 1, reset: now + winMs }); return false; }
  if (x.n >= lim) return true;
  x.n++;
  return false;
};

async function api(req, res, url) {
  const p = url.pathname, m = req.method;
  try {
    if (rlim(req, 'api', 500, 60e3)) return send(res, 429, { error: 'Çok fazla istek. Lütfen kısa süre sonra tekrar deneyin.' });
    if (p === '/api/login' && m === 'POST') {
      if (rlim(req, 'login', 20, 60e3)) return send(res, 429, { error: 'Çok fazla giriş denemesi. Lütfen 1 dakika bekleyin.' });
      const { tc, pw } = await json(req); const id = String(tc || '').trim().toLowerCase();
      if (!id || !pw) return send(res, 400, { error: 'TCKN ve şifre girin' });
      let u = db.users[id];
      if (!u) {
        if (!AUTO_USER || pw !== '123' || !/^\d{11}$/.test(id)) return send(res, 401, { error: 'Kullanıcı bulunamadı. Demo: 11 haneli TCKN + şifre 123 veya Kayıt Ol' });
        u = db.users[id] = mkUser(id, id, '123', 'student', { demo: true }); db.apps[id] = newApp(u);
      } else if (u.h !== hash(String(pw), u.salt) && !(u.demo && pw === '123')) return send(res, 401, { error: 'Şifre hatalı' });
      const t = crypto.randomBytes(24).toString('hex'); db.sessions[t] = { tc: u.tc, exp: Date.now() + 90 * 864e5 }; persist();
      return send(res, 200, { token: t, user: { tc: u.tc, name: u.name, role: u.role } });
    }
    if (p === '/api/register' && m === 'POST') {
      if (rlim(req, 'register', 10, 60e3)) return send(res, 429, { error: 'Kayıt denemesi sınırına ulaşıldı. Lütfen sonra tekrar deneyin.' });
      const b = await json(req), id = String(b.tc || '').trim();
      if (!/^\d{11}$/.test(id)) return send(res, 400, { error: 'TCKN 11 haneli olmalı' });
      if (!b.name || String(b.name).trim().length < 3) return send(res, 400, { error: 'Ad soyad girin' });
      if (!b.pw || String(b.pw).length < 3) return send(res, 400, { error: 'Şifre en az 3 karakter' });
      const old = db.users[id]; if (old && !old.demo) return send(res, 409, { error: 'Bu TCKN zaten kayıtlı' });
      const u = db.users[id] = mkUser(id, String(b.name).trim(), String(b.pw), 'student', { email: b.email || '', tel: b.tel || '', uni: b.uni || '' });
      const a = db.apps[id] = db.apps[id] || newApp(u); a.F.ad = u.name; a.F.mail = a.F.mail || u.email; a.F.tel = a.F.tel || u.tel; if (b.uni && !a.F.fakulte) a.F.fakulte = b.uni; persist();
      return send(res, 200, { ok: true });
    }
    const s = auth(req, url);
    if (p.startsWith('/api/file/') && m === 'GET') {
      if (!s) return send(res, 401, { error: 'Oturum yok' });
      const [, , , tc, f] = p.split('/'); if (!s || (s.u.role !== 'admin' && s.u.tc !== tc)) return send(res, 403, { error: 'Yetkisiz' });
      const fp = path.join(UP, path.basename(tc), path.basename(decodeURIComponent(f || '')));
      if (!fp.startsWith(UP) || !fs.existsSync(fp)) return send(res, 404, { error: 'Yok' });
      res.writeHead(200, withSec({ 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'private, max-age=3600' }));
      return fs.createReadStream(fp).pipe(res);
    }
    if (!s) return send(res, 401, { error: 'Oturum süresi doldu' });
    const u = s.u;
    if (p === '/api/me' && m === 'GET') {
      if (u.role === 'admin') return send(res, 200, { user: { tc: u.tc, name: u.name, role: u.role } });
      const a = db.apps[u.tc] = db.apps[u.tc] || newApp(u);
      return send(res, 200, { user: { tc: u.tc, name: u.name, role: u.role }, app: a, tap: DEMO_TAP });
    }
    if (p === '/api/logout' && m === 'POST') { delete db.sessions[s.t]; persist(); return send(res, 200, { ok: true }); }
    if (u.role === 'student') {
      const a = db.apps[u.tc] = db.apps[u.tc] || newApp(u);
      if (p === '/api/app' && m === 'PUT') {
        const b = await json(req);
        if (b.F && typeof b.F === 'object') { a.F = b.F; a.F.tc = a.F.tc || u.tc; if (a.F.ad && u.demo && u.name === u.tc) { u.name = a.F.ad; } }
        if (Array.isArray(b.docs)) { const keep = new Set(b.docs.map(d => d.file).filter(Boolean)); (a.docs || []).forEach(d => { if (d.file && !keep.has(d.file)) { try { fs.unlinkSync(path.join(UP, u.tc, path.basename(d.file))); } catch (e) {} } }); a.docs = b.docs; }
        if (b.terms !== undefined) a.terms = b.terms ? 1 : 0;
        a.updated = Date.now(); persist(); return send(res, 200, { ok: true, name: u.name });
      }
      if (p === '/api/upload' && m === 'POST') {
        if (rlim(req, 'upload', 180, 10 * 60e3)) return send(res, 429, { error: 'Çok fazla dosya yükleme isteği. Lütfen biraz bekleyin.' });
        const buf = await body(req, 30e6), nm = safe(url.searchParams.get('name')), ext = path.extname(nm).toLowerCase().slice(0, 8) || '.bin';
        const dir = path.join(UP, u.tc); fs.mkdirSync(dir, { recursive: true });
        const fn = Date.now().toString(36) + crypto.randomBytes(3).toString('hex') + ext; fs.writeFileSync(path.join(dir, fn), buf);
        return send(res, 200, { file: fn, size: buf.length });
      }
      if (p === '/api/submit' && m === 'POST') { const force = DEMO_TAP && url.searchParams.get('force') === '1'; const bad = force ? null : L.steps(a.F, a.docs || [], a.terms).find(x => !x.ok); a.forced = !!force; if (bad) return send(res, 400, { error: 'Başvuru gönderilemez – ' + bad.why }); if (a.status === 'Beklemede' || a.status === 'Onaylandı') return send(res, 400, { error: 'Başvuru zaten gönderildi' }); if (a.status !== 'Onaylandı') a.status = 'Beklemede'; a.sent = Date.now(); persist(); return send(res, 200, { ok: true, status: a.status }); }
    }
    if (u.role === 'admin') {
      if (p === '/api/admin/all' && m === 'DELETE') { const n = Object.keys(db.apps).length; db.apps = {}; Object.keys(db.users).forEach(k => { if (k !== 'admin') delete db.users[k]; }); Object.keys(db.sessions).forEach(t => { if (db.sessions[t].tc !== 'admin') delete db.sessions[t]; }); db.settings = null; try { fs.rmSync(UP, { recursive: true, force: true }); fs.mkdirSync(UP, { recursive: true }); } catch (e) {} persist(); return send(res, 200, { ok: true, n }); }
      if (p === '/api/admin/apps' && m === 'GET') return send(res, 200, { apps: Object.entries(db.apps).filter(([k]) => db.users[k] && db.users[k].role === 'student').map(([k, a]) => adminView(a, k)) });
      if (p === '/api/admin/settings') { if (m === 'GET') return send(res, 200, { settings: db.settings }); if (m === 'PUT') { const b = await json(req); db.settings = L.mergeSet(b.settings); persist(); return send(res, 200, { ok: true }); } }
      if (p === '/api/admin/seed' && m === 'POST') { seed(+(url.searchParams.get('n')) || 12); persist(); return send(res, 200, { ok: true }); }
      if (p === '/api/admin/demo' && m === 'DELETE') { let n = 0; Object.values(db.users).filter(x => x.demo).forEach(x => { delete db.apps[x.tc]; delete db.users[x.tc]; try { fs.rmSync(path.join(UP, x.tc), { recursive: true, force: true }); } catch (e) {} n++; }); persist(); return send(res, 200, { ok: true, n }); }
      const mm = p.match(/^\/api\/admin\/app\/(\d+)$/);
      if (mm && db.apps[mm[1]]) {
        const a = db.apps[mm[1]];
        if (m === 'GET') return send(res, 200, { app: { ...a, uid: mm[1], acc: adminView(a, mm[1]).acc } });
        if (m === 'PUT') { const b = await json(req); if (b.status) a.status = String(b.status).slice(0, 30); if (b.note !== undefined) a.note = String(b.note).slice(0, 2000); a.updated = Date.now(); persist(); return send(res, 200, { ok: true }); }
        if (m === 'DELETE') { delete db.apps[mm[1]]; delete db.users[mm[1]]; try { fs.rmSync(path.join(UP, mm[1]), { recursive: true, force: true }); } catch (e) {} persist(); return send(res, 200, { ok: true }); }
      }
    }
    return send(res, 404, { error: 'Bulunamadı' });
  } catch (e) {
    const msg = String((e && e.message) || 'Sunucu hatası').replace(/[<>"'`]/g, '').slice(0, 220);
    return send(res, 500, { error: msg || 'Sunucu hatası' });
  }
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/')) return api(req, res, url);
  let f = decodeURIComponent(url.pathname); if (f === '/') f = '/index.html';
  const fp = path.normalize(path.join(PUB, f));
  if (!fp.startsWith(PUB) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, withSec({ 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream', 'Cache-Control': /vendor/.test(f) ? 'public, max-age=86400' : 'no-cache' }));
  fs.createReadStream(fp).pipe(res);
}).listen(PORT, '0.0.0.0', () => {
  console.log('\n  Burs Sistemi çalışıyor\n');
  console.log('  Bu bilgisayar : http://localhost:' + PORT);
  Object.values(os.networkInterfaces()).flat().filter(i => i && i.family === 'IPv4' && !i.internal).forEach(i => console.log('  Telefon (aynı Wi-Fi): http://' + i.address + ':' + PORT));
  console.log('\n  Demo: yönetici  admin / 123   |   öğrenci  herhangi 11 haneli TCKN / 123');
  console.log('  Kapatmak için bu pencereyi kapatın (Ctrl+C).\n');
}).on('error', e => { console.error(e.code === 'EADDRINUSE' ? 'Port ' + PORT + ' dolu. Başka port: PORT=9090 node server.js' : e.message); process.exit(1); });
