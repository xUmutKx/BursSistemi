/* Demo modu: GitHub Pages gibi sunucusuz ortamda /api çağrılarını tarayıcıda (localStorage) yanıtlar. */
(function () {
  if (!(/github\.io$/.test(location.hostname) || /[?&]demo=1/.test(location.search) || location.protocol === 'file:')) return;
  const K = 'burs_demo_db_v1', rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = a => a[rnd(0, a.length - 1)];
  let db; try { db = JSON.parse(localStorage[K]); } catch (e) {}
  db = db || { users: {}, apps: {}, sessions: {}, settings: null };
  const save = () => { try { localStorage[K] = JSON.stringify(db); } catch (e) {} };
  const mkUser = (tc, name, pw, role, extra) => Object.assign({ tc, name, role, pw, created: Date.now() }, extra || {});
  const newApp = u => ({ F: { ad: u.name && u.name !== u.tc ? u.name : '', tc: u.tc, mail: u.email || '', tel: u.tel || '', _a: {} }, docs: [], status: 'Taslak', note: '', terms: 0, created: Date.now(), updated: Date.now() });
  if (!db.users.admin) db.users.admin = mkUser('admin', 'Yönetici', '123', 'admin');
  function seed(n) {
    const AD = ['Ayşe', 'Mehmet', 'Elif', 'Can', 'Zeynep', 'Emre', 'Selin', 'Burak', 'Deniz', 'Merve', 'Kerem', 'Ece'], SY = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Aydın', 'Öztürk', 'Arslan', 'Koç', 'Polat'];
    for (let i = 0; i < n; i++) {
      let tc; do tc = '9' + String(rnd(1e9, 9e9 - 1)).padStart(10, '0').slice(0, 10); while (db.users[tc]);
      const sy = pick(SY), ad = pick(AD) + ' ' + sy, sinif = pick(['Hazırlık', '1. sınıf', '2. sınıf', '3. sınıf', '4. sınıf', '5. sınıf', '6. sınıf']), u = db.users[tc] = mkUser(tc, ad, '123', 'student', { demo: true });
      const ge = pick([0, 0, 18000, 26000, 40000, 65000, 90000]), gb = pick([0, 22000, 30000, 45000]), tp = pick([0, 0, 1, 1, 2, 3]), ar = pick([0, 0, 1, 2]), kd = rnd(0, 4), ayri = pick([0, 1]);
      const F = { ad, tc, dogum: 'Tekirdağ / 01.01.200' + rnd(1, 5), adres: 'Tekirdağ', tel: '05' + rnd(300000000, 599999999), mail: tc + '@demo.local', fakulte: 'Demo Üniversitesi – Tıp Fakültesi', giris: '2022', sinif, okulno: String(rnd(1e5, 9e5)), gno: sinif.startsWith('1') || sinif === 'Hazırlık' ? 'Yok (1. sınıf, henüz not ortalaması yok)' : (rnd(200, 395) / 100).toFixed(2).replace('.', ','),
        medeni: 'Bekar', ailedeMi: ayri ? 'Hayır' : 'Evet', yurt: ayri ? 'Demo Yurdu' : '', engel: pick(['Hayır', 'Hayır', 'Hayır', 'Evet']), 'anne.ad': pick(AD) + ' ' + sy, 'anne.hayat': pick(['Evet', 'Evet', 'Evet', 'Hayır']), 'anne.gelir': ge ? ge + ' TL' : '', 'baba.ad': pick(AD) + ' ' + sy, 'baba.hayat': pick(['Evet', 'Evet', 'Evet', 'Hayır']), 'baba.gelir': gb ? gb + ' TL' : '',
        malvarlik: '', aileMal: 'Baba tapu: ' + (tp ? tp + ' adet taşınmaz kaydı var (inceleyin)' : 'taşınmaz kaydı yok') + '\nBaba araç: ' + (ar ? 'Otomobil Fiat 2012 kayıtlı' : 'araç kaydı yok'), bakma: kd ? Array.from({ length: kd }, (_, j) => 'Kardeş ' + (j + 1) + ', ' + rnd(5, 17) + ' yaş').join('\n') : 'Yok', _a: {} };
      const a = newApp(u); a.F = F; a.terms = 1; a.status = pick(['Beklemede', 'Beklemede', 'Beklemede', 'Taslak', 'Onaylandı']); a.sent = Date.now() - rnd(0, 20) * 864e5;
      const miss = Math.random() < .3;
      a.docs = L.SL.filter(x => L.req(F, x)).filter(() => !miss || Math.random() > .25).map(x => ({ id: x.id, k: x.k, w: x.w, name: 'demo-' + x.k + '.pdf', ck: [{ t: 'ok', m: 'Demo kayıt' }], info: [], ts: Date.now() }));
      db.apps[tc] = a;
    }
  }
  if (!Object.keys(db.apps).length) { seed(24); save(); }
  const R = (code, obj) => new Response(JSON.stringify(obj), { status: code, headers: { 'Content-Type': 'application/json' } });
  const adminView = a => ({ ...a, demo: !!(db.users[a.F.tc] && db.users[a.F.tc].demo), docs: (a.docs || []).map(d => { const { text, ...r } = d; return r; }) });
  const rf = window.fetch.bind(window);
  window.fetch = async (input, o = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href), i = url.pathname.indexOf('/api/');
    if (i < 0) return rf(input, o);
    const p = url.pathname.slice(i), m = (o.method || 'GET').toUpperCase(); let b = {}; if (typeof o.body === 'string') { try { b = JSON.parse(o.body); } catch (e) {} }
    const hd = o.headers || {}, tok = (hd.Authorization || '').replace(/^Bearer /, ''), s = tok && db.sessions[tok], u = s && db.users[s.tc];
    if (p === '/api/login' && m === 'POST') {
      const id = String(b.tc || '').trim().toLowerCase(); if (!id || !b.pw) return R(400, { error: 'TCKN ve şifre girin' });
      let us = db.users[id];
      if (!us) { if (b.pw !== '123' || !/^\d{11}$/.test(id)) return R(401, { error: 'Kullanıcı bulunamadı. Demo: 11 haneli TCKN + şifre 123 veya Kayıt Ol' }); us = db.users[id] = mkUser(id, id, '123', 'student', { demo: true }); db.apps[id] = newApp(us); }
      else if (us.pw !== String(b.pw) && !(us.demo && b.pw === '123')) return R(401, { error: 'Şifre hatalı' });
      const t = Math.random().toString(36).slice(2) + Date.now().toString(36); db.sessions[t] = { tc: us.tc }; save();
      return R(200, { token: t, user: { tc: us.tc, name: us.name, role: us.role } });
    }
    if (p === '/api/register' && m === 'POST') {
      const id = String(b.tc || '').trim(); if (!/^\d{11}$/.test(id)) return R(400, { error: 'TCKN 11 haneli olmalı' });
      if (!b.name || String(b.name).trim().length < 3) return R(400, { error: 'Ad soyad girin' }); if (!b.pw || String(b.pw).length < 3) return R(400, { error: 'Şifre en az 3 karakter' });
      const old = db.users[id]; if (old && !old.demo) return R(409, { error: 'Bu TCKN zaten kayıtlı' });
      const nu = db.users[id] = mkUser(id, String(b.name).trim(), String(b.pw), 'student', { email: b.email || '', tel: b.tel || '', uni: b.uni || '' });
      const a = db.apps[id] = db.apps[id] || newApp(nu); a.F.ad = nu.name; a.F.mail = a.F.mail || nu.email; a.F.tel = a.F.tel || nu.tel; if (b.uni && !a.F.fakulte) a.F.fakulte = b.uni; save(); return R(200, { ok: true });
    }
    if (p.startsWith('/api/file/')) return R(404, { error: 'Demo modunda dosya önizleme yok' });
    if (!u) return R(401, { error: 'Oturum süresi doldu' });
    if (p === '/api/me') { if (u.role === 'admin') return R(200, { user: { tc: u.tc, name: u.name, role: u.role } }); const a = db.apps[u.tc] = db.apps[u.tc] || newApp(u); return R(200, { user: { tc: u.tc, name: u.name, role: u.role }, app: a }); }
    if (p === '/api/logout') { delete db.sessions[tok]; save(); return R(200, { ok: true }); }
    if (u.role === 'student') {
      const a = db.apps[u.tc] = db.apps[u.tc] || newApp(u);
      if (p === '/api/app' && m === 'PUT') { if (b.F && typeof b.F === 'object') { a.F = b.F; a.F.tc = a.F.tc || u.tc; if (a.F.ad && u.demo && u.name === u.tc) u.name = a.F.ad; } if (Array.isArray(b.docs)) a.docs = b.docs; if (b.terms !== undefined) a.terms = b.terms ? 1 : 0; a.updated = Date.now(); save(); return R(200, { ok: true, name: u.name }); }
      if (p === '/api/upload' && m === 'POST') return R(200, { file: '', size: 0 });
      if (p === '/api/submit' && m === 'POST') { const bad = L.steps(a.F, a.docs || [], a.terms).find(x => !x.ok); if (bad) return R(400, { error: 'Başvuru gönderilemez – ' + bad.why }); if (a.status === 'Beklemede' || a.status === 'Onaylandı') return R(400, { error: 'Başvuru zaten gönderildi' }); a.status = 'Beklemede'; a.sent = Date.now(); save(); return R(200, { ok: true, status: a.status }); }
    }
    if (u.role === 'admin') {
      if (p === '/api/admin/apps') return R(200, { apps: Object.values(db.apps).filter(a => db.users[a.F.tc] && db.users[a.F.tc].role === 'student').map(adminView) });
      if (p === '/api/admin/settings') { if (m === 'PUT') { db.settings = L.mergeSet(b.settings); save(); return R(200, { ok: true }); } return R(200, { settings: db.settings }); }
      if (p === '/api/admin/seed' && m === 'POST') { seed(+url.searchParams.get('n') || 12); save(); return R(200, { ok: true }); }
      if (p === '/api/admin/demo' && m === 'DELETE') { let n = 0; Object.values(db.users).filter(x => x.demo).forEach(x => { delete db.apps[x.tc]; delete db.users[x.tc]; n++; }); save(); return R(200, { ok: true, n }); }
      const mm = p.match(/^\/api\/admin\/app\/(\d+)$/);
      if (mm && db.apps[mm[1]]) { const a = db.apps[mm[1]];
        if (m === 'GET') return R(200, { app: a });
        if (m === 'PUT') { if (b.status) a.status = String(b.status).slice(0, 30); if (b.note !== undefined) a.note = String(b.note).slice(0, 2000); a.updated = Date.now(); save(); return R(200, { ok: true }); }
        if (m === 'DELETE') { delete db.apps[mm[1]]; delete db.users[mm[1]]; save(); return R(200, { ok: true }); } }
    }
    return R(404, { error: 'Bulunamadı' });
  };
})();
