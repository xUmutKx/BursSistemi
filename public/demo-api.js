(function () {
  if (!window.STATIC) return;
  const LIVE = window.MODE === 'live', NS = LIVE ? 'live' : 'demo';
  const K = 'burs_demo_db_v2', rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = a => a[rnd(0, a.length - 1)];
  const emptyDb = () => ({ users: {}, apps: {}, sessions: {}, settings: null });
  let db = emptyDb();
  const save = async () => { try { await fput('__db', JSON.stringify(db)); try { localStorage.removeItem(K); } catch (e) {} return true; } catch (e) { return false; } };
  const fixAdmin = () => { db.users = db.users || {}; db.apps = db.apps || {}; db.users.admin = Object.assign(db.users.admin || mkUser('admin', 'Yönetici', '123', 'admin'), { pw: '123', must: false }); };
  const reload = async () => { let t; try { t = await fget('__db'); } catch (e) {} if (t) { try { db = JSON.parse(t); } catch (e) {} } fixAdmin(); };
  const loadDb = async () => { let t; try { t = await fget('__db'); } catch (e) {} if (!t) { try { t = localStorage[K]; } catch (e) {} } try { db = JSON.parse(t) || emptyDb(); } catch (e) { db = emptyDb(); } fixAdmin(); };
  let chain = Promise.resolve(); const locked = fn => { const r = chain.then(fn); chain = r.catch(() => {}); return r; };
  const mkUser = (tc, name, pw, role, extra) => Object.assign({ tc, name, role, pw, created: Date.now() }, extra || {});
  const newApp = u => ({ F: { ad: u.name && u.name !== u.tc ? u.name : '', tc: u.tc, mail: u.email || '', tel: u.tel || '', _a: {} }, docs: [], status: 'Taslak', note: '', terms: 0, created: Date.now(), updated: Date.now() });
  const jobs = [], CODES = {}, UNI = 'Tekirdağ Namık Kemal Üniversitesi – Tıp Fakültesi';
  function seed(n) {
    for (let i = 0; i < n; i++) {
      let tc; do tc = '9' + String(rnd(1e9, 9e9 - 1)).padStart(10, '0').slice(0, 10); while (db.users[tc]);
      const F = SG.make(tc, rnd, pick), u = db.users[tc] = mkUser(tc, F.ad, '123', 'student', { demo: true, email: F.mail, tel: F.tel });
      const a = newApp(u); a.F = F; a.terms = 1; a.status = pick(['Beklemede', 'Beklemede', 'Beklemede', 'Taslak', 'Onaylandı']); a.sent = Date.now() - rnd(0, 20) * 864e5;
      const miss = Math.random() < .3;
      a.docs = L.SL.filter(x => L.req(F, x)).filter(() => !miss || Math.random() > .25).map(x => {
        const who = x.w === 'm' ? F['anne.ad'] : x.w === 'f' ? F['baba.ad'] : F.ad, wtc = x.w === 'm' ? F['anne.tc'] : x.w === 'f' ? F['baba.tc'] : F.tc, fid = 'demo-' + x.k + '-' + x.w + '.svg';
        jobs.push(fput(tc + '/' + fid, new Blob([SG.svg(x.t, who, wtc, [WN_[x.w] + ' adına', x.d])], { type: 'image/svg+xml' })).catch(() => {}));
        return { id: x.id, k: x.k, w: x.w, name: fid, file: fid, thumb: SG.thumb(x.t, who), ck: [{ t: 'ok', m: 'Demo belge' }], info: ['Demo belge – ' + who], ts: Date.now() };
      });
      db.apps[tc] = a;
    }
  }
  const fclear = async () => { try { const d = await idb(); await new Promise(res => { const t = d.transaction('f', 'readwrite'); t.objectStore('f').clear(); t.oncomplete = res; t.onerror = res; }); } catch (e) {} };
  const idb = () => new Promise((res, rej) => { const r = indexedDB.open(LIVE ? 'burs_live_files' : 'burs_demo_files', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const fput = async (k, v) => { const d = await idb(); return new Promise((res, rej) => { const t = d.transaction('f', 'readwrite'); t.objectStore('f').put(v, k); t.oncomplete = () => res(); t.onerror = () => rej(t.error); }); };
  const fget = async k => { const d = await idb(); return new Promise((res, rej) => { const q = d.transaction('f').objectStore('f').get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); };
  const fdel = async k => { try { const d = await idb(); d.transaction('f', 'readwrite').objectStore('f').delete(k); } catch (e) {} };
  const WN_ = L.WN;
  const ready = (async () => { await loadDb(); if (!LIVE && !db.seeded && !Object.keys(db.apps).length) seed(50); db.seeded = 1; await save(); Promise.all(jobs).then(save).catch(() => {}); })();
  window.demoReady = ready;
  window.demoFileUrl = async (tc, file) => { const b = await fget(tc + '/' + file); return b ? URL.createObjectURL(b) : ''; };
  const R = (code, obj) => new Response(JSON.stringify(obj), { status: code, headers: { 'Content-Type': 'application/json' } });
  const adminView = (a, uid) => { const us = db.users[uid] || {}; return { ...a, uid, demo: !!us.demo, acc: { user: uid, mail: us.email || a.F.mail || '', pw: us.demo ? (us.pw || '') : '' }, docs: (a.docs || []).map(d => { const { text, ...r } = d; return r; }) }; };
  const rf = window.fetch.bind(window);
  const handle = async (input, o = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href), i = url.pathname.indexOf('/api/');
    if (i < 0) return rf(input, o);
    const p = url.pathname.slice(i), m = (o.method || 'GET').toUpperCase(); let b = {}; if (typeof o.body === 'string') { try { b = JSON.parse(o.body); } catch (e) {} }
    await ready; if (!/^\/api\/(file\/|upload$)/.test(p)) await reload();
    const hd = o.headers || {}, tok = (hd.Authorization || '').replace(/^Bearer /, ''), u = tok && db.users[tok.split('.')[0]];
    if (p === '/api/login' && m === 'POST') {
      const id = String(b.tc || '').trim().toLowerCase(); if (!id || !b.pw) return R(400, { error: 'TCKN ve şifre girin' });
      let us = db.users[id];
      if (!us) { if (LIVE || b.pw !== '123' || !/^\d{11}$/.test(id)) return R(401, { error: LIVE ? 'TCKN veya şifre hatalı' : 'Kullanıcı bulunamadı. Demo: 11 haneli TCKN + şifre 123 veya Kayıt Ol' }); us = db.users[id] = mkUser(id, id, '123', 'student', { demo: true }); db.apps[id] = newApp(us); await save(); }
      else if (us.pw !== String(b.pw) && !(!LIVE && us.demo && b.pw === '123')) return R(401, { error: LIVE ? 'TCKN veya şifre hatalı' : 'Şifre hatalı' });
      const t = us.tc + '.' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      return R(200, { token: t, user: { tc: us.tc, name: us.name, role: us.role } });
    }
    if (p === '/api/cfg') return R(200, { lock: '', term: L.mergeSet(db.settings).term, now: Date.now() });
    if (p === '/api/email-code' && m === 'POST') {
      const em = String(b.email || '').trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return R(400, { error: 'Geçerli bir e-posta adresi girin' });
      if (LIVE) return R(503, { error: 'E-posta gönderimi için sunucu gerekir (GitHub Pages sürümünde yalnızca demo kodu vardır)' });
      const c = String(Math.floor(Math.random() * 1e6)).padStart(6, '0'); CODES[em] = c; return R(200, { ok: true, demoCode: c });
    }
    if (p === '/api/register' && m === 'POST') {
      const id = String(b.tc || '').trim().toLowerCase(), foreign = !!b.foreign; if (foreign ? !/^[a-z0-9]{5,20}$/.test(id) : !/^\d{11}$/.test(id)) return R(400, { error: foreign ? 'Yabancı kimlik / pasaport no 5-20 harf-rakam olmalı' : 'TCKN 11 haneli olmalı' });
      if (!b.name || String(b.name).trim().length < 3) return R(400, { error: 'Ad soyad girin' }); if (!b.pw || String(b.pw).length < (LIVE ? 8 : 3)) return R(400, { error: 'Şifre en az ' + (LIVE ? 8 : 3) + ' karakter olmalı' });
      if (String(b.uni || '').trim() !== UNI) return R(400, { error: 'Yalnızca ' + UNI + ' öğrencileri başvurabilir' });
      const em = String(b.email || '').trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return R(400, { error: 'Geçerli bir e-posta adresi girin' });
      if (!CODES[em] || CODES[em] !== String(b.code || '').trim()) return R(400, { error: 'E-posta doğrulama kodu hatalı veya süresi dolmuş' }); delete CODES[em];
      const old = db.users[id]; if (old && !old.demo) return R(409, { error: 'Bu TCKN zaten kayıtlı' });
      const nu = db.users[id] = mkUser(id, String(b.name).trim(), String(b.pw), 'student', { demo: !LIVE, foreign, email: em, tel: b.tel || '', uni: UNI });
      const a = db.apps[id] = db.apps[id] || newApp(nu); a.F.ad = nu.name; a.F.mail = a.F.mail || nu.email; a.F.tel = a.F.tel || nu.tel; if (b.uni && !a.F.fakulte) a.F.fakulte = b.uni; await save(); return R(200, { ok: true });
    }
    if (p.startsWith('/api/file/')) { const q = p.split('/'); const b = await fget(q[3] + '/' + q[4]).catch(() => null); return b ? new Response(b, { status: 200, headers: { 'Content-Type': b.type || 'application/octet-stream' } }) : R(404, { error: 'Dosya bulunamadı' }); }
    if (!u) return R(401, { error: 'Oturum süresi doldu' });
    if (p === '/api/profile' && m === 'POST') {
      if (u.role !== 'student') return R(403, { error: 'Yönetici bilgileri buradan değiştirilemez' });
      const a = db.apps[u.tc] = db.apps[u.tc] || newApp(u), em = String(b.email || '').trim().toLowerCase(), tel = String(b.tel || '').trim();
      if (em && em !== String(u.email || '').toLowerCase()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return R(400, { error: 'Geçerli bir e-posta adresi girin' });
        if (!CODES[em] || CODES[em] !== String(b.code || '').trim()) return R(400, { error: 'Yeni e-posta için doğrulama kodu hatalı veya süresi dolmuş' }); delete CODES[em];
        u.email = em; a.F.mail = em;
      }
      if (tel) { u.tel = tel; a.F.tel = tel; }
      if (b.pw) { if (String(b.cur || '') !== String(u.pw || '')) return R(401, { error: 'Mevcut şifre hatalı' }); if (String(b.pw).length < (LIVE ? 8 : 3)) return R(400, { error: 'Şifre en az ' + (LIVE ? 8 : 3) + ' karakter olmalı' }); u.pw = String(b.pw); }
      await save(); return R(200, { ok: true, email: u.email || '', tel: u.tel || '' });
    }
    if (p === '/api/me') { const cs = L.mergeSet(db.settings), cfg = { term: cs.term, custom: cs.custom }; if (u.role === 'admin') return R(200, { user: { tc: u.tc, name: u.name, role: u.role }, cfg }); const had = !!db.apps[u.tc], a = db.apps[u.tc] = db.apps[u.tc] || newApp(u); if (!had) await save(); return R(200, { user: { tc: u.tc, name: u.name, role: u.role }, app: a, cfg, demo: !!u.demo }); }
    if (p === '/api/logout') return R(200, { ok: true });
    if (u.role === 'student') {
      const a = db.apps[u.tc] = db.apps[u.tc] || newApp(u);
      if (p === '/api/app' && m === 'PUT') { if (b.F && typeof b.F === 'object') { a.F = b.F; a.F.tc = a.F.tc || u.tc; if (a.F.ad && u.demo && u.name === u.tc) u.name = a.F.ad; } if (Array.isArray(b.docs)) a.docs = b.docs; if (b.terms !== undefined) a.terms = b.terms ? 1 : 0; a.updated = Date.now(); if (!(await save())) return R(507, { error: 'Tarayıcı depolaması dolu – bazı belgeleri silin' }); return R(200, { ok: true, name: u.name }); }
      if (p === '/api/upload' && m === 'POST') { const id = 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); try { await fput(u.tc + '/' + id, o.body); } catch (e) { return R(200, { file: '', size: 0 }); } return R(200, { file: id, size: o.body && o.body.size || 0 }); }
      if (p === '/api/submit' && m === 'POST') { const cs = L.mergeSet(db.settings), T = L.termState(cs.term); if (!u.demo && T.s !== 'open') return R(403, { error: cs.term.msg || (T.s === 'before' ? 'Başvurular ' + L.fmtD(cs.term.open) + ' tarihinde açılacak' : 'Başvuru dönemi sona erdi') }); const force = u.demo && url.searchParams.get('force') === '1'; const bad = force ? null : L.steps(a.F, a.docs || [], a.terms).find(x => !x.ok); a.forced = !!force; if (bad) return R(400, { error: 'Başvuru gönderilemez – ' + bad.why }); if (a.status === 'Beklemede' || a.status === 'Onaylandı') return R(400, { error: 'Başvuru zaten gönderildi' }); a.status = 'Beklemede'; a.sent = Date.now(); await save(); return R(200, { ok: true, status: a.status }); }
    }
    if (u.role === 'admin') {
      if (p === '/api/admin/all' && m === 'DELETE') { const n = Object.keys(db.apps).length; db.apps = {}; Object.keys(db.users).forEach(k => { if (k !== 'admin') delete db.users[k]; }); db.settings = null; db.seeded = 1; await fclear(); await save(); return R(200, { ok: true, n }); }
      if (p === '/api/admin/apps') return R(200, { apps: Object.entries(db.apps).filter(([k]) => db.users[k] && db.users[k].role === 'student').map(([k, a]) => adminView(a, k)) });
      if (p === '/api/admin/settings') { if (m === 'PUT') { db.settings = L.mergeSet(b.settings); await save(); return R(200, { ok: true, settings: db.settings }); } return R(200, { settings: db.settings }); }
      if (p === '/api/admin/seed' && m === 'POST') { if (LIVE) return R(403, { error: 'Bu işlem yalnızca demo modunda kullanılabilir' }); seed(+url.searchParams.get('n') || 12); await Promise.all(jobs); await save(); return R(200, { ok: true }); }
      if (p === '/api/admin/demo' && m === 'DELETE') { let n = 0; Object.values(db.users).filter(x => x.demo).forEach(x => { delete db.apps[x.tc]; delete db.users[x.tc]; n++; }); await save(); return R(200, { ok: true, n }); }
      const mm = p.match(/^\/api\/admin\/app\/(\d+)$/);
      if (mm && db.apps[mm[1]]) { const a = db.apps[mm[1]];
        if (m === 'GET') return R(200, { app: { ...a, uid: mm[1], acc: adminView(a, mm[1]).acc } });
        if (m === 'PUT') { const out = { ok: true }; if (b.status && ['Taslak', 'Beklemede', 'Eksik belge', 'Onaylandı', 'Reddedildi'].includes(String(b.status))) a.status = String(b.status); if (b.note !== undefined) a.note = String(b.note).slice(0, 2000); if (b.resetPw && db.users[mm[1]]) { const c = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; out.pw = Array.from(crypto.getRandomValues(new Uint8Array(10)), x => c[x % c.length]).join(''); db.users[mm[1]].pw = out.pw; } a.updated = Date.now(); await save(); return R(200, out); }
        if (m === 'DELETE') { delete db.apps[mm[1]]; delete db.users[mm[1]]; await save(); return R(200, { ok: true }); } }
    }
    return R(404, { error: 'Bulunamadı' });
  };
  window.fetch = (input, o = {}) => (new URL(typeof input === 'string' ? input : input.url, location.href).pathname.indexOf('/api/') < 0) ? rf(input, o) : locked(() => handle(input, o));
})();
