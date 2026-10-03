(function (root) {
  const L = {};
  const N = s => (s || '').toLocaleUpperCase('tr-TR').replace(/İ/g, 'I').replace(/Ç/g, 'C').replace(/Ğ/g, 'G').replace(/Ö/g, 'O').replace(/Ş/g, 'S').replace(/Ü/g, 'U').replace(/Â/g, 'A').replace(/Î/g, 'I').replace(/Û/g, 'U');
  const tcase = s => (s || '').toLocaleLowerCase('tr-TR').replace(/(^|[\s\-\/])\S/g, c => c.toLocaleUpperCase('tr-TR')).replace(/\s+/g, ' ').trim();
  const g = (raw, re) => { const m = raw.match(re); return m ? m[1].trim() : ''; };
  const EG = 'https://www.turkiye.gov.tr/';
  L.N = N; L.tcase = tcase;
  L.WN = { s: 'Öğrenci', m: 'Anne', f: 'Baba', a: 'Aile' }; const WN_ = L.WN;
  const BASE = [
    { k: 'foto', t: 'Vesikalık Fotoğraf', w: 's', cat: 'Başvuru', icon: 'photo_camera', d: '1 adet vesikalık fotoğraf.', l: '', h: '' },
    { k: 'kimlik_on', t: 'Kimlik / Nüfus Cüzdanı – Ön Yüz', w: 's', cat: 'Kimlik', icon: 'badge', d: 'Kimlik kartının ön yüzü; ad-soyad ve T.C. no okunur olmalı.', l: '', h: '' },
    { k: 'kimlik_ar', t: 'Kimlik / Nüfus Cüzdanı – Arka Yüz', w: 's', cat: 'Kimlik', icon: 'badge', d: 'Kimlik kartının arka yüzü (anne-baba adı görünmeli).', l: '', h: '' },
    { k: 'ikamet', t: 'Yerleşim Yeri (İkametgah) Belgesi', w: 's', cat: 'Kimlik', icon: 'home', d: 'e-Devlet barkodlu Yerleşim Yeri ve Diğer Adres Belgesi.', l: EG + 'nvi-yerlesim-yeri-ve-diger-adres-belgesi-sorgulama', h: 'e-Devlet: Yerleşim Yeri (İkametgâh) ve Diğer Adres Belgesi Sorgulama' },
    { k: 'sinav', t: 'ÖSYM TYT/AYT Sonuç Belgesi', w: 's', cat: 'Eğitim', icon: 'description', d: 'Hazırlık / 1. sınıf başlayanlar için.', l: EG + 'osym-aday-islemleri-sistemi-sso', h: 'ÖSYM Aday İşlemleri > Sınav Sonuç Belgesi' },
    { k: 'yerles', t: 'ÖSYM Yerleştirme Sonucu', w: 's', cat: 'Eğitim', icon: 'workspace_premium', d: 'Yerleştirme puanı görünen belge (hazırlık / 1. sınıf).', l: EG + 'osym-aday-islemleri-sistemi-sso', h: 'ÖSYM Aday İşlemleri > Yerleştirme Sonuç Belgesi' },
    { k: 'ogrenci', t: 'Güncel Öğrenci Belgesi', w: 's', cat: 'Eğitim', icon: 'school', d: 'e-Devlet (YÖK) barkodlu güncel öğrenci belgesi.', l: EG + 'yok-ogrenci-belgesi-sorgulama', h: 'e-Devlet: Öğrenci Belgesi Sorgulama (YÖK)' },
    { k: 'transkript', t: 'Transkript (Not Durum Belgesi)', w: 's', cat: 'Eğitim', icon: 'table_rows', d: 'Son dönem notlarının olduğu transkript (hazırlık / 1. sınıf hariç).', l: EG + 'yuksekogretim-kurulu-transkript-belgesi-sorgulama', h: 'e-Devlet: Transkript Belgesi Sorgulama (YÖK) veya üniversite öğrenci bilgi sistemi' },
    { k: 'kyk', t: 'KYK Burs / Kredi Durumu', w: 's', cat: 'Burs', icon: 'payments', d: 'Kredi/Burs Durum Belgesi; kayıt yoksa “bulunamadı” ekranı.', l: EG + 'genclik-ve-spor-kredi-burs-durum-belgesi-sorgulama', h: 'e-Devlet: Kredi/Burs Durum Belgesi Sorgulama (GSB)' },
    { k: 'yurt', t: 'Yurt Belgesi', w: 's', cat: 'Barınma', icon: 'apartment', d: 'Yurtta kalanlar için kurum imzalı belge veya e-Devlet yurt kaydı.', l: EG + 'gsb-yurt-basvuru-sonucu-sorgulama', h: 'e-Devlet: Gençlik ve Spor Bakanlığı > Yurt işlemleri' },
    { k: 'kira', t: 'Kira Kontratı (öğrenci)', w: 's', cat: 'Barınma', icon: 'key', d: 'Kiracı adı görünen kontrat. Yoksa “Yok” düğmesiyle beyan edin.', l: '', h: '' },
    { k: 'kira_aile', t: 'Kira Kontratı (ailenin evi)', w: 'a', cat: 'Barınma', icon: 'key', d: 'Ailenin oturduğu ev kiraysa kiracı adı görünmeli. Yoksa “Yok” düğmesiyle beyan edin.', l: '', h: '' },
    { k: 'nufus', t: 'Vukuatlı Nüfus Kayıt Örneği', w: 'a', cat: 'Aile', icon: 'family_restroom', d: 'Tüm aile bireylerinin göründüğü e-Devlet nüfus kayıt örneği.', l: EG + 'nvi-nufus-kayit-ornegi-belgesi-sorgulama', h: 'e-Devlet: Nüfus Kayıt Örneği Belgesi Sorgulama (tüm aile / vukuatlı)' },
    { k: 'tescil', t: 'SGK Tescil ve Hizmet Dökümü', w: 'mf', cat: 'SGK', icon: 'work', d: '“Tüm SGK Hizmet Dökümü” seçili, barkodlu belge.', l: EG + 'sgk-tescil-ve-hizmet-dokumu?barkodlu=BelgeOlustur', h: 'e-Devlet: SGK Tescil ve Hizmet Dökümü' },
    { k: 'a4a', t: '4A Emekli Aylık Bilgisi', w: 'smf', cat: 'SGK', icon: 'account_balance_wallet', d: 'Zorunlu. Kayıt yoksa “bulunamadı” ekranını yükleyin ya da “Yok” düğmesiyle beyan edin.', l: EG + '4a-emekli-aylik-bilgisi', h: 'e-Devlet: 4A Emekli Aylık Bilgisi' },
    { k: 'a4b', t: '4B Emekli Aylık Bilgisi', w: 'smf', cat: 'SGK', icon: 'account_balance_wallet', d: 'Zorunlu. Kayıt yoksa “bulunamadı” ekranını yükleyin ya da “Yok” düğmesiyle beyan edin.', l: EG + '4b-emekli-aylik-bilgisi', h: 'e-Devlet: 4B Emekli Aylık Bilgisi' },
    { k: 'a4c', t: '4C Emekli Aylık Bilgisi', w: 'smf', cat: 'SGK', icon: 'account_balance_wallet', d: 'Zorunlu. Kayıt yoksa “bulunamadı” ekranını yükleyin ya da “Yok” düğmesiyle beyan edin.', l: EG + '4c-emekli-aylik-bilgisi', h: 'e-Devlet: 4C Emekli Aylık Bilgisi' },
    { k: 'bordro', t: 'Maaş Bordrosu', w: 'mf', cat: 'Gelir', icon: 'receipt_long', d: 'Çalışan anne/baba için güncel bordro.', l: EG + 'e-bordro-sorgulama', h: 'e-Devlet e-Bordro veya işyeri bordrosu' },
    { k: 'vergi', t: 'e-Vergi Levhası', w: 'mf', cat: 'Gelir', icon: 'request_quote', d: 'Levha yoksa “levha bulunamadı” ekranı zorunlu.', l: '', h: 'e-Devlet arama kutusuna “Vergi Levhası” yazın (Gelir İdaresi Başkanlığı)' },
    { k: 'tapu', t: 'Tapu / Kadastro Taşınmaz Bilgileri', w: 'smf', cat: 'Mal Varlığı', icon: 'location_on', d: 'İsim ve taşınmaz listesi görünen sayfa; kayıt yoksa o ekran.', l: EG + 'tapu-bilgileri-sorgulama', h: 'e-Devlet: Tapu Bilgileri Sorgulama' },
    { k: 'arac', t: 'Tescilli Araç Sorgulama', w: 'smf', cat: 'Mal Varlığı', icon: 'directions_car', d: 'İsim görünen ekran; araç yoksa “bulunamamıştır” ekranı.', l: EG + 'emniyet-adima-tescilli-arac-sorgulama?hizmet=ekrani', h: 'e-Devlet: Adıma Tescilli Araç Sorgulama' },
    { k: 'adli', t: 'Adli Sicil Kaydı', w: 'smf', cat: 'Kimlik', icon: 'balance', d: 'e-Devlet barkodlu adli sicil kaydı; adı-soyadı görünmeli.', l: EG + 'adli-sicil-kaydi', h: 'e-Devlet: Adli Sicil Kaydı Sorgulama' }
  ];
  const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  L.D = []; L.SL = []; L.cats = []; L.Q = []; L.custom = { docs: [], qs: [] };
  let CR = [];
  L.known = k => L.D.some(x => x.k === k);
  const isCustom = k => { const d = L.D.find(x => x.k === k); return !!(d && d.custom); };
  L.isCustom = isCustom;

  L.lines = (items, tolF) => {
    const its = items.filter(i => i.str && i.str.trim()).map(i => ({ i, y: i.transform[5], h: Math.abs(i.transform[3]) || 8 })).sort((a, b) => b.y - a.y);
    const rows = []; let cur = null;
    its.forEach(o => { if (cur && cur.y - o.y <= (tolF || 0.7) * cur.h) cur.a.push(o.i); else { cur = { y: o.y, h: o.h, a: [o.i] }; rows.push(cur); } });
    return rows.map(r => {
      let s = '', lx = null;
      r.a.sort((a, b) => a.transform[4] - b.transform[4]).forEach(i => {
        const x = i.transform[4], h = Math.abs(i.transform[3]) || 8;
        if (lx !== null) s += (x - lx > h * 0.9) ? '  ' : (x - lx > h * 0.12 && !/\s$/.test(s) && !/^\s/.test(i.str) ? ' ' : '');
        s += i.str; lx = x + i.width;
      });
      return s.replace(/\s+$/, '');
    }).join('\n');
  };

  const R = [
    ['ikamet', /YERLESIM YERI VE DIGER ADRES/, 9], ['yerles', /YERLESTIRME SONUCLARI/, 10],
    ['sinav', /YKS\)? SONUCLARI|TYT TESTLERINDEKI|SINAV SONUC BELGESI/, 8], ['ogrenci', /OGRENCI BELGESI/, 9], ['transkript', /TRANSKRIPT|TRANSCRIPT|NOT DURUM BELGESI/, 9],
    ['kyk', /KREDI\/BURS DURUM|KATKI KREDISI VE BURS|KREDI KREDISI|KREDI NUMARASI BULUNAMADI|BURS DURUM BELGESI/, 9], ['yurt', /YURT KAYIT ISLEMLERI|YURT ADI|YURT BELGESI|YURT BASVURU SONUC/, 8],
    ['nufus', /NUFUS KAYIT ORNEGI|VUKUATLI/, 9], ['tescil', /SIGORTALILIK TESCIL|TESCIL VE HIZMET|HIZMET DOKUMU/, 9], ['vergi', /VERGI LEVHASI|VERGI KIMLIK NUMARALI MUKELLEF/, 9],
    ['tapu', /TAPU ?BILGILERI ?SORGULAMA|TASINMAZ LISTESI|TASINMAZ BILGISI|TAKBIS/, 8], ['arac', /TESCILLI ARAC|ARAC BILGILERI|ARACIN PLAKASI|PLAKA/, 8],
    ['bordro', /BORDRO|BRUT UCRET|NET UCRET/, 7], ['kira', /KIRA SOZLESMESI|KIRA KONTRATI|KIRAYA VEREN|KIRACI/, 8], ['adli', /ADLI SICIL/, 8],
    ['kimlik', /KIMLIK KARTI|NUFUS CUZDANI|SURNAME|GIVEN NAME|<<</, 6]
  ];
  L.classify = U => {
    let b = null;
    if (/BURS BASVURU FORMU|BURSU ICIN GEREKLI BILGILER/.test(U)) return null;
    R.concat(CR).forEach(([k, re, w]) => { if (re.test(U) && (!b || w > b.s)) b = { k, s: w }; });
    const m = U.match(/\b4\s?[\/\-]?\s?([ABC8])\s?EMEKLI\s?AYLIK/);
    if (m) b = { k: 'a4' + (m[1] === '8' ? 'b' : m[1].toLowerCase()), s: 10 };
    if (!b || b.s < 10) { const g4 = U.match(/\b4\s*[\/\-]?\s*([ABC])\s*GUVENCESINE SAHIP EMEKLILER/); if (g4) b = { k: 'a4' + g4[1].toLowerCase(), s: 10 }; }
    if (b && b.k === 'kimlik') b.k = /<<|ANNE ADI|MOTHER|BABA ADI|FATHER|SERI NO|DOCUMENT NO/.test(U) && !/SURNAME|SOYADI/.test(U.slice(0, 400)) ? 'kimlik_ar' : 'kimlik_on';
    return b;
  };

  const nn = s => N(s).replace(/[^A-Z ]/g, ' ').replace(/\s+/g, ' ').trim();
  L.people = F => {
    const sy = nn(F.ad).split(' ').filter(x => x.length > 1).pop() || '';
    const full = s => { const t = nn(s).split(' ').filter(Boolean); return t.length === 1 && sy ? t[0] + ' ' + sy : t.join(' '); };
    const f = s => nn(s).split(' ')[0];
    const sh = s => nn(s).split(' ').filter(Boolean).length < 2;
    return { s: { n: nn(F.ad), tc: F.tc, f: f(F.ad), short: false }, m: { n: full(F['anne.ad']), tc: F['anne.tc'], f: f(F['anne.ad']), short: sh(F['anne.ad']) }, f: { n: full(F['baba.ad']), tc: F['baba.tc'], f: f(F['baba.ad']), short: sh(F['baba.ad']) } };
  };
  const lev = (a, b) => { const m = a.length, n = b.length; let p = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; };
  L.nameHit = (U, nm) => {
    const toks = (nm || '').split(' ').filter(t => t.length > 1); if (toks.length < 2) return false;
    const words = [...new Set(U.split(/[^A-Z]+/).filter(w => w.length > 1))];
    const h = toks.map(t => words.includes(t) || (t.length >= 5 && words.some(w => Math.abs(w.length - t.length) <= 1 && lev(w, t) <= 1))), n = h.filter(Boolean).length;
    return n === toks.length || (toks.length >= 3 && n >= toks.length - 1 && h[toks.length - 1]);
  };
  L.givenHit = (zone, nm) => {
    const toks = (nm || '').split(' ').filter(t => t.length > 1); if (!toks.length) return false;
    const words = [...new Set(zone.split(/[^A-Z]+/).filter(w => w.length > 1))];
    const hit = t => words.some(w => w === t || (t.length >= 4 && (w.includes(t) || (Math.abs(w.length - t.length) <= 1 && lev(w, t) <= 1) || (t.length >= 7 && Math.abs(w.length - t.length) <= 2 && lev(w, t) <= 2))));
    const giv = toks.length > 1 ? toks.slice(0, -1) : toks;
    return giv.some(hit) || (toks.length > 1 && hit(toks[toks.length - 1]) && giv.every(t => t.length < 3));
  };
  const hasTc = (U, tc) => !!tc && new RegExp('(^|[^A-Za-z0-9])' + String(tc).replace(/[^A-Za-z0-9]/g, '') + '([^A-Za-z0-9]|$)', 'i').test(U);
  L.ownerOf = (U, F, allowed, src) => {
    const p = L.people(F), head = src === 'img' ? U : U.slice(0, 4000), al = allowed || 'smf';
    for (const t of head.match(/\b\d{11}\b/g) || []) for (const w of 'smf') if (al.includes(w) && p[w].tc && p[w].tc === t) return w;
    const caps = [];
    for (const m of head.matchAll(/&\s*([A-Z][A-Z ]{2,40})/g)) caps.push(m[1]);
    for (const m of head.matchAll(/SAYIN ([A-Z ]{3,40})/g)) caps.push(m[1]);
    for (const m of head.matchAll(/ADI(?: ?\/? ?SOYADI)?\s*:\s*([A-Z ]{3,40})/g)) caps.push(m[1]);
    for (const m of head.matchAll(/AD, SOYAD\s*:\s*([A-Z ,]{3,40})/g)) caps.push(m[1].replace(',', ''));
    for (const s of caps) for (const w of 'smf') if (al.includes(w) && L.nameHit(s, p[w].n)) return w;
    for (const w of 'smf') if (al.includes(w) && L.nameHit(head, p[w].n)) return w;
    const zone = head, cand = [...'smf'].filter(w => al.includes(w) && L.givenHit(zone, p[w].n));
    if (cand.length === 1) return cand[0];
    return null;
  };
  L.verify = (U, F, k, w, src) => {
    const p = L.people(F), head = src === 'img' ? U : U.slice(0, 4000), ck = [];
    if (k === 'foto') return ck;
    const has = x => hasTc(head, p[x].tc) ? 'T.C. no' : L.nameHit(head, p[x].n) ? 'isim' : (L.givenHit(head, p[x].n) ? 'ad' : '');
    const nm = { s: F.ad, m: F['anne.ad'], f: F['baba.ad'] }, lab = x => WN_[x] + (p[x].n ? ' (' + String(nm[x] || '').trim() + ')' : ''), bad = m => ck.push({ t: 'bad', m }), warn = m => ck.push({ t: 'warn', m }), ok = m => ck.push({ t: 'ok', m });
    if (k === 'kimlik_ar') {
      if (has('s')) ok('Öğrenci kimliği doğrulandı (' + has('s') + ')');
      else if (['m', 'f'].some(x => p[x].f && new RegExp('\\b' + p[x].f + '\\b').test(head))) ok('Anne/baba adı kimlikle eşleşti');
      else warn('Kimliğin arka yüzünde anne/baba adı otomatik okunamadı – belge kaydedildi, yönetici ayrıca kontrol eder');
      return ck;
    }
    if (k === 'kira_aile' || (w === 'a' && k !== 'nufus' && isCustom(k))) { const x = 'smf'.split('').find(has); x ? ok(lab(x) + ' adı doğrulandı') : warn((k === 'kira_aile' ? 'Kira kontratında' : 'Belgede') + ' öğrenci/anne/baba adı otomatik doğrulanamadı – belge kaydedildi, yönetici ayrıca kontrol eder'); return ck; }
    const need = k === 'nufus' ? 's' : w;
    if (!'smf'.includes(need)) return ck;
    if (!p[need].n) { bad(WN_[need] + ' adı “Kimlik” adımında girilmemiş'); return ck; }
    const h = has(need);
    if (h) {
      ok(lab(need) + ' doğrulandı (' + h + ')');
      const ids = head.match(/\b\d{11}\b/g) || [];
      if (p[need].tc && ids.length && !ids.includes(p[need].tc) && ids.some(t => 'smf'.split('').some(x => x !== need && p[x].tc === t))) bad('Belgedeki T.C. no ' + WN_[need] + ' ile uyuşmuyor');
    } else {
      const o = 'smf'.split('').find(x => x !== need && has(x));
      if (o) bad('Bu belge ' + lab(o) + ' adına görünüyor; ' + WN_[need] + ' adına olmalı');
      else warn(lab(need) + ' adı belgede otomatik doğrulanamadı (ekran görüntüsünde ad kırpılmış olabilir) – belge kaydedildi, yönetici ayrıca kontrol eder');
    }
    return ck;
  };

  L.apply = (F, patches) => {
    F._a = F._a || {};
    patches.forEach(p => {
      if (p.t === 'set') { const short = /^(anne|baba)\.ad$/.test(p.key) && F[p.key] && F[p.key].trim().split(/\s+/).length < 2; if (p.val && (!F[p.key] || F._a[p.key] || short)) { F[p.key] = p.val; F._a[p.key] = p.src; } }
      else if (p.t === 'line') { const Ls = (F[p.key] || '').split('\n').filter(l => l && !l.startsWith(p.tag + ':')); Ls.push(p.tag + ': ' + p.txt); F[p.key] = Ls.join('\n'); F._a[p.key] = p.src; }
      else if (p.t === 'list') { if (!F[p.key] || F._a[p.key]) { F[p.key] = p.val; F._a[p.key] = p.src; } }
    });
  };

  const NEG = /BULUNAMAD|BULUNMUYOR|BULUNMAMAKTADIR|BULUNAMAZ|KAYDI YOKTUR|ALMAMAKTADIR|BULUNMADIGI ICIN|KAYIT YOKTUR|BULUNAMAMISTIR|BULUNAMAMIS/;
  const firstYear = F => /hazır|^\s*1\s*[.\-]?\s*s/i.test(F.sinif || '') || /^\s*1\b/.test(F.sinif || '');
  L.firstYear = firstYear;

  function parseNufus(raw, F, P, info, ck) {
    const Ls = raw.split('\n'), rows = [];
    Ls.forEach((l, i) => {
      const m = l.match(/\b([EK])\s+(Kendisi|Eşi|Annesi|Babası|Çocuğu|Oğlu|Kızı|Kardeşi)\s+(\d{11})\s+(.+)/i);
      if (!m) return;
      const cols = m[4].split(/\s{2,}/).map(x => x.trim()).filter(x => x && !/^\d{2}\.\d{2}\.\d{4}/.test(x) && !/^Evlenme/i.test(x));
      const pv = (Ls[i - 1] || '').match(/^\s*\d{1,2}\s+\d{1,3}\s+(.+?)\s{2,}(\S.*)$/);
      let ad, soy, baba, ana, place;
      if (pv && cols.length <= 4) { ad = pv[1]; place = pv[2]; [soy, baba, ana] = cols; }
      else { [ad, soy, baba, ana] = cols; place = (Ls[i - 1] || '').trim(); }
      const around = Ls.slice(Math.max(0, i - 2), i + 3).join(' ');
      const dm = Ls.slice(i + 1, i + 4).join(' ').match(/\b(\d{2}\.\d{2}\.\d{4})\b/);
      rows.push({ g: m[1].toUpperCase(), rel: m[2], tc: m[3], ad: ad || '', soy: soy || '', baba: baba || '', ana: ana || '', dt: dm ? dm[1] : '', place: /^[A-ZÇĞİÖŞÜ \-\(\)\d]+$/.test((place || '').trim()) ? place.trim() : '', olu: /Ölüm:\s*\d{2}\./i.test(around), med: (Ls.slice(Math.max(0, i - 2), i + 1).join(' ').match(/Bekâr|Bekar|Evli|Dul|Boşanmış/i) || [''])[0] });
    });
    if (!rows.length) { ck.push({ t: 'warn', m: 'Nüfus satırları okunamadı – formu elle kontrol edin' }); return; }
    info.push(rows.length + ' aile bireyi okundu');
    const yr = r => r.dt ? new Date().getFullYear() - +r.dt.slice(6) : '?';
    const k = rows.find(r => /Kendisi/i.test(r.rel));
    const stu = rows.find(r => r.tc === F.tc);
    if (stu) {
      P.push({ t: 'set', key: 'dogum', val: tcase(stu.place) && stu.dt ? tcase(stu.place) + ' / ' + stu.dt : stu.dt, src: 'Nüfus' });
      if (stu.med) P.push({ t: 'set', key: 'medeni', val: /evli/i.test(stu.med) ? 'Evli' : 'Bekar', src: 'Nüfus' });
    }
    if (k && k.tc !== F.tc) {
      const pre = k.g === 'E' ? 'baba' : 'anne', o = pre === 'baba' ? 'anne' : 'baba', e = rows.find(r => /Eşi/i.test(r.rel));
      P.push({ t: 'set', key: pre + '.ad', val: tcase(k.ad + ' ' + k.soy), src: 'Nüfus' }, { t: 'set', key: pre + '.tc', val: k.tc, src: 'Nüfus' }, { t: 'set', key: pre + '.hayat', val: k.olu ? 'Hayır' : 'Evet', src: 'Nüfus' });
      if (e) P.push({ t: 'set', key: o + '.ad', val: tcase(e.ad + ' ' + e.soy), src: 'Nüfus' }, { t: 'set', key: o + '.tc', val: e.tc, src: 'Nüfus' }, { t: 'set', key: o + '.hayat', val: e.olu ? 'Hayır' : 'Evet', src: 'Nüfus' });
      const ch = rows.filter(r => /Oğlu|Kızı|Çocuğu/i.test(r.rel) && r.tc !== F.tc);
      P.push({ t: 'list', key: 'bakma', val: ch.length ? ch.map(r => tcase(r.ad + ' ' + r.soy) + ', ' + yr(r) + ' yaş').join('\n') : 'Yok (nüfus kaydında başka çocuk görünmüyor)', src: 'Nüfus' });
      info.push('Anne/baba ve ' + ch.length + ' kardeş okundu');
      if (e && k.med && /evli/i.test(k.med)) P.push({ t: 'set', key: 'ayri', val: '', src: 'Nüfus' });
    } else if (!stu) ck.push({ t: 'warn', m: 'Bu nüfus kaydında öğrencinin satırı bulunamadı' });
  }


  L.yks = U => {
    const r = {}, lab = [['tyt', /^TYT\b/], ['say', /^(SAYISAL|SAY)\b/], ['ea', /^(ESIT AGIRLIK|EA)\b/], ['soz', /^(SOZEL|SOZ)\b/], ['dil', /^(YABANCI DIL|DIL)\b/]];
    U.split('\n').forEach(l => {
      const t = l.trim().replace(/^[^A-Z]+/, '');
      lab.forEach(([k, re]) => {
        if (r[k] || !re.test(t)) return;
        const n = t.replace(re, '').match(/\d[\d.,]*/g) || [], pu = n.find(x => /^\d{2,3}[.,]\d+$/.test(x)), si = n.filter(x => x !== pu).find(x => /^\d{1,3}(\.\d{3})+$|^\d{1,7}$/.test(x));
        if (pu && si) r[k] = { p: pu, s: si };
      });
    });
    return r;
  };
  const YKSK = { tyt: 'yksTyt', say: 'yksSay', ea: 'yksEa', soz: 'yksSoz', dil: 'yksDil' };
  function yksPatch(U, P, info, src) {
    const y = L.yks(U), ks = Object.keys(y);
    ks.forEach(k => P.push({ t: 'set', key: YKSK[k], val: y[k].s + '. sıra (' + y[k].p + ' puan)', src }));
    if (ks.length) info.push(ks.map(k => k.toUpperCase() + ': ' + y[k].s + '. sıra').join(' · '));
  }

  function extract(k, w, raw, U, F, P, info, ck) {
    const pre = w === 'm' ? 'anne' : 'baba', neg = NEG.test(U), src = L.D.find(d => d.k === k).t, head = raw.slice(0, 700);
    const tc = g(head, /K[İI]ML[İI]K\s*(?:NO|Numarası)?\s*:?\s*(\d{11})/i) || g(head, /\b(\d{11})\b/);
    if ((w === 'm' || w === 'f') && tc) P.push({ t: 'set', key: pre + '.tc', val: tc, src });
    const nameLine = g(raw, /ADI SOYADI\s*:\s*([^\n]+?)\s*(?:\n|$)/i) || (g(raw, /\n\s*Adı\s*:\s*([^\n]+)/) ? g(raw, /\n\s*Adı\s*:\s*([^\n]+)/) + ' ' + g(raw, /\n\s*Soyadı\s*:\s*([^\n]+)/) : '');
    if ((w === 'm' || w === 'f') && nameLine && ['tescil', 'a4a', 'a4b', 'a4c'].includes(k)) P.push({ t: 'set', key: pre + '.ad', val: tcase(nameLine), src });
    if (neg && ['tapu', 'arac', 'vergi', 'a4a', 'a4b', 'a4c', 'kyk', 'adli'].includes(k)) info.push('“Kayıt yok” belgesi – geçerli');
    if (k === 'ogrenci') {
      const ad = g(raw, /Adı\s*\/\s*Soyadı\s*:\s*([^\n]+)/), sy = tcase(ad.split(' ').pop()), sn = g(raw, /Sınıf\s*:\s*([^\n]+)/);
      P.push({ t: 'set', key: 'ad', val: tcase(ad), src }, { t: 'set', key: 'tc', val: g(raw, /T\.?C\.? Kimlik No\s*:?\s*(\d{11})/), src },
        { t: 'set', key: 'giris', val: g(raw, /Kayıt Tarihi\s*:\s*([\d.]+)/), src }, { t: 'set', key: 'sinif', val: sn, src },
        { t: 'set', key: 'fakulte', val: tcase(g(raw, /Program\s*:\s*([^\n]+)/).split('/').slice(0, 2).join(' – ')), src },
        { t: 'set', key: 'anne.ad', val: tcase(g(raw, /Anne Adı\s*:\s*([^\n]+)/)) + ' ' + sy, src }, { t: 'set', key: 'baba.ad', val: tcase(g(raw, /Baba Adı\s*:\s*([^\n]+)/)) + ' ' + sy, src });
      if (/^\s*1/.test(sn)) P.push({ t: 'set', key: 'gno', val: 'Yok (1. sınıf, henüz not ortalaması yok)', src });
      info.push(tcase(ad) + ' – ' + sn + ' – ' + g(raw, /Öğrencilik Durumu\s*:\s*([^\n]+)/));
    }
    if (k === 'ikamet') { const a = g(raw, /Adres Tipi[\s\S]*?Yurt\s?içi\s+\d+\s+([\s\S]+?)AÇIKLAMALAR/i).replace(/(^|\n)\s*Adresi\s+/g, '$1').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim(); P.push({ t: 'set', key: 'adres', val: a, src }); info.push(a); }
    if (k === 'adli') { const d = g(raw, /DOĞUM YERİ \/ TARİHİ\s*:\s*([^\n]+)/i); if (d) P.push({ t: 'set', key: 'dogum', val: tcase(d.replace(/\s*\/\s*/, ' / ')).replace(/ \/ /, ' / '), src }); info.push(neg || /KAYDI YOKTUR/.test(U) ? 'Adli sicil kaydı yok' : 'Adli sicil kaydı var – inceleyin'); }
    if (k === 'transkript') { const no = g(raw, /Öğrenci No\s*:\s*(\d+)/), n = g(raw, /Genel Not Ortalaması\s*[:\-]?\s*(\d[\d.,]*)/i); P.push({ t: 'set', key: 'okulno', val: no, src }); if (n && parseFloat(n.replace(',', '.')) > 0) P.push({ t: 'set', key: 'gno', val: n, src }); info.push('Öğrenci no ' + no + (n ? ' – GNO ' + n : '')); }
    if (k === 'yerles') { P.push({ t: 'set', key: 'fakulte', val: tcase((g(raw, /([A-ZÇĞİÖŞÜ ]+ÜNİVERSİTESİ)/) + ' – ' + g(raw, /([A-ZÇĞİÖŞÜ ]*FAKÜLTESİ)/)).trim()), src }); { const yp = g(raw, /Yerleşme Puanı\s*[:\-]?\s*([\d.,]+)/), ys = g(raw, /Ba[şs]ar[ıi]\s*S[ıi]ras[ıi]\s*[:\-]?\s*([\d.]+)/i) || g(raw, /S[ıi]ralama(?:s[ıi])?\s*[:\-]?\s*([\d.]{2,})/i);
      if (yp) P.push({ t: 'set', key: 'yerlesPuan', val: yp, src }); if (ys) P.push({ t: 'set', key: 'yerlesSira', val: ys + '. sıra', src });
      yksPatch(U, P, info, src); info.push('Yerleşme puanı ' + yp + (ys ? ' – başarı sırası ' + ys : '') + ' – ' + tcase(g(raw, /Yerleşme Türü\s+([^\n]+)/))); } }
    if (k === 'sinav') { info.push('YKS ' + g(raw, /Sınav Tarihi\s+([^\n]+)/)); yksPatch(U, P, info, src); }
    if (k === 'kyk' && neg) { P.push({ t: 'set', key: 'gecmisBurs', val: 'Hayır', src }, { t: 'set', key: 'kamuBurs', val: 'Yok (KYK kredi/burs yok)', src }); info.push('KYK kredi/burs almıyor'); }
    if (k === 'yurt') { const y = g(raw, /Yurt Adı\s+([^\n]+)/i) || g(raw, /Yurt Adı\s*[:\-]?\s*([A-ZÇĞİÖŞÜa-zçğıöşü\. ]+)/); if (y) { P.push({ t: 'set', key: 'yurt', val: tcase(y), src }, { t: 'set', key: 'ailedeMi', val: 'Hayır', src }); info.push('Yurt: ' + tcase(y)); } }
    if (k === 'tapu') {
      const n = g(U, /ESLESEN TOPLAM (\d+)/) || g(U, /TOPLAM (\d+)\s*ADET/); const t = n ? n + ' adet taşınmaz kaydı var (inceleyin)' : (neg ? 'taşınmaz kaydı yok' : 'kayıt var/okunamadı (inceleyin)');
      info.push('Tapu: ' + t); P.push(w === 's' ? { t: 'line', key: 'malvarlik', tag: 'Tapu', txt: t, src } : { t: 'line', key: 'aileMal', tag: L.WN[w] + ' tapu', txt: t, src });
    }
    if (k === 'arac') {
      let t = 'araç kaydı yok'; if (!neg) { const tip = (U.match(/OTOMOBIL|KAMYONET|KAMYON|MOTOSIKLET|MINIBUS|OTOBUS|CEKICI/) || ['Araç'])[0], yl = (U.match(/\b(19[89]\d|20[0-3]\d)\b/) || [''])[0], mk = (U.match(/CITROEN|RENAULT|FIAT|FORD|OPEL|TOYOTA|HONDA|HYUNDAI|VOLKSWAGEN|BMW|MERCEDES|PEUGEOT|DACIA|SKODA|KIA|NISSAN|SEAT|AUDI/) || [''])[0]; t = tcase([tip, mk, yl].filter(Boolean).join(' ')).replace(/ı/g, 'i') + ' kayıtlı'; }
      info.push('Araç: ' + t); P.push(w === 's' ? { t: 'line', key: 'malvarlik', tag: 'Araç', txt: t, src } : { t: 'line', key: 'aileMal', tag: L.WN[w] + ' araç', txt: t, src });
    }
    if (k === 'vergi' && (w === 'm' || w === 'f')) { P.push({ t: 'line', key: 'aileGelir', tag: L.WN[w] + ' vergi mükellefiyeti', txt: neg ? 'yok' : 'var', src }); info.push(neg ? 'Vergi mükellefiyeti yok' : 'Vergi levhası mevcut'); }
    if (/^a4/.test(k) && !neg && (w === 'm' || w === 'f')) {
      const net = g(raw, /Son Ödenen Net Tutar\s*:\s*([\d.,]+)/) || g(raw, /Net Ödenen Aylık\s*:\s*([\d.,]+)/), un = g(raw, /Ünvan\s*:\s*([^\n]+?)\s{2,}/);
      if (net) { P.push({ t: 'set', key: pre + '.gelir', val: net + ' TL (emekli aylığı)', src }, { t: 'set', key: pre + '.meslek', val: 'Emekli' + (un ? ' ' + tcase(un) : ''), src }); info.push('Net aylık ' + net + ' TL'); }
    }
    if (/^a4/.test(k) && !neg && w === 's') info.push('Öğrencinin emekli aylığı kaydı var');
    if (k === 'tescil' && (w === 'm' || w === 'f')) { const em = raw.match(/(\d{2}\.\d{2}\.\d{4}) tarihinden itibaren [^\n]*?(emekli|yaşlılık)/i); if (em) { P.push({ t: 'set', key: pre + '.meslek', val: 'Emekli', src }); info.push('Emekli (' + em[1] + ' itibarıyla)'); } P.push({ t: 'set', key: pre + '.hayat', val: 'Evet', src }); }
    if (k === 'nufus') parseNufus(raw, F, P, info, ck);
    if (k === 'kimlik_on') { const t = g(raw, /\b(\d{11})\b/); if (t) { P.push({ t: 'set', key: 'tc', val: t, src }); info.push('TC ' + t); } }
  }

  L.forced = (text, F, k, w) => { const raw = text || '', P = [], info = [], ck = []; extract(k, w, raw, N(raw), F, P, info, ck); return { patches: P, info, ck }; };
  const FRESH = ['ikamet', 'ogrenci', 'kyk', 'tescil', 'a4a', 'a4b', 'a4c', 'nufus', 'tapu', 'arac', 'vergi', 'yurt', 'adli'];
  const DT = '(\\d{2}[./]\\d{2}[./]\\d{4})';
  const MO = { OCAK: 1, SUBAT: 2, MART: 3, NISAN: 4, MAYIS: 5, HAZIRAN: 6, TEMMUZ: 7, AGUSTOS: 8, EYLUL: 9, EKIM: 10, KASIM: 11, ARALIK: 12 };
  L.docDate = (raw, U, src) => {
    const tm = U.match(/(\d{1,2})\s+(OCAK|SUBAT|MART|NISAN|MAYIS|HAZIRAN|TEMMUZ|AGUSTOS|EYLUL|EKIM|KASIM|ARALIK)\s+(20\d{2})(?:\s+\d{1,2}:\d{2})?\s+ITIBARIYLA/) || U.match(/(\d{1,2})\s+(OCAK|SUBAT|MART|NISAN|MAYIS|HAZIRAN|TEMMUZ|AGUSTOS|EYLUL|EKIM|KASIM|ARALIK)\s+(20\d{2})\s+\d{1,2}:\d{2}/);
    if (tm) return String(tm[1]).padStart(2, '0') + '.' + String(MO[tm[2]]).padStart(2, '0') + '.' + tm[3];
    const m = U.match(new RegExp(DT + '\\s+TARIHINDE\\s+ALINMI')) || U.match(new RegExp('YER\\s*/\\s*TARIH\\s*:[^\\n]*?' + DT)) || U.match(new RegExp('(?:BELGE|SORGU|OLUSTURMA|URETIM|DUZENLEME|BASKI|YAZDIRMA|ONAY)\\s+TARIHI?\\s*(?:/\\s*SAATI?)?\\s*[:\\-]?\\s*' + DT)) || U.match(new RegExp(DT + '\\s+\\d{2}:\\d{2}')) || (src !== 'img' ? raw.slice(0, 900).match(new RegExp(DT)) : null);
    return m ? m[1] : '';
  };
  function ageCheck(raw, U, src, now, days, ck, warnMissing) {
    const ds = L.docDate(raw, U, src), dm = ds.match(/(\d{2})[./](\d{2})[./](\d{4})/);
    if (dm) { const age = (now - new Date(+dm[3], +dm[2] - 1, +dm[1])) / 864e5; if (age > days) ck.push({ t: 'bad', m: 'Belge tarihi ' + ds + ' – ' + days + ' günden eski; güncel (yeni alınmış) belge gerekli' }); else if (age >= -2) ck.push({ t: 'ok', m: 'Güncel tarihli (' + ds + ')' }); else ck.push({ t: 'warn', m: 'Belge tarihi ileri görünüyor (' + ds + ')' }); }
    else if (warnMissing) ck.push({ t: 'warn', m: 'Belgede tarih okunamadı – son ' + days + ' gün içinde alındığından emin olun' });
    else ck.push({ t: 'warn', m: 'Belgede tarih okunamadı – son ' + days + ' gün içinde alındığından emin olun' });
  }
  function customCheck(D, raw, U, ck, P, info, src, now) {
    const o = D.ocr || {}, has = k => U.includes(N(k)), bad = m => ck.push({ t: 'bad', m }), n0 = ck.length;
    if (o.minChars && U.replace(/[^A-Z0-9]/g, '').length < o.minChars) bad('Belgeden yeterli metin okunamadı (en az ' + o.minChars + ' karakter beklenir) – net ve tam görüntü yükleyin');
    (o.all || []).forEach(k => { if (!has(k)) bad('Belgede “' + k + '” ifadesi bulunamadı'); });
    if ((o.any || []).length && !o.any.some(has)) bad('Belgede beklenen ifadelerden hiçbiri bulunamadı (' + o.any.slice(0, 4).join(', ') + ')');
    (o.deny || []).forEach(k => { if (has(k)) bad('Belgede kabul edilmeyen ifade var: “' + k + '”'); });
    if (o.maxAge && src !== 'img') ageCheck(raw, U, src, now, o.maxAge, ck, false);
    (o.fields || []).forEach(f => {
      const q = L.Q.find(x => x.id === f.q); if (!q) return;
      const m = raw.match(new RegExp(esc(f.after) + '\\s*[:\\-]?\\s*([^\\n]{1,120})', 'i')), v = m ? m[1].trim() : '';
      if (v) { P.push({ t: 'set', key: q.key, val: v, src: D.t }); info.push(q.t + ': ' + v); }
      else ck.push({ t: 'warn', m: '“' + f.after + '” alanı okunamadı – “' + q.t + '” sorusunu elle doldurun' });
    });
    if (!ck.some(c => c.t === 'bad')) ck.push({ t: 'ok', m: 'Belge ölçütleri sağlandı' });
  }
  // ---- PDF kaynak doğrulama: e-Devlet / ÖSYM çıktısı mı, sonradan düzenlenmiş mi? (yalnız PDF; ekran görüntüsü muaf) ----
  const EDEV = ['ikamet', 'ogrenci', 'kyk', 'tescil', 'a4a', 'a4b', 'a4c', 'nufus', 'adli', 'tapu', 'arac', 'vergi', 'yurt'], OSYM = ['sinav', 'yerles'];
  const GEN = /jasper|telerik|itext|openpdf|stimulsoft|sgk|^\s*\d{6,}\s*$/i;
  const EDITOR = /word|excel|powerpoint|libreoffice|openoffice|collabora|\bdraw\b|\bwriter\b|canva|photoshop|illustrator|indesign|acrobat|adobe pdf library|ilovepdf|smallpdf|sejda|pdfescape|pdf-?xchange|foxit|nitro|print to pdf|quartz|\bpages\b|wps|cairo|wkhtml|reportlab|fpdf|pdfkit|mpdf|dompdf|pdf24|sodapdf|ghostscript|imagemagick|gimp|inkscape|scribus|affinity|puppeteer|headless/i;
  const CODES = [/\b(NV0\d-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})\b/, /\b(YOK[A-Z0-9]{12,})\b/, /\b(KYK[A-Z0-9]{10,})\b/, /\b(SGK[A-Z0-9]{12,})\b/, /\b(ADB\d{8,})\b/, /\b(hd[0-9a-f]{16,})\b/, /Kontrol Kodu\s*:\s*([A-Z0-9]{6,})/i];
  const pdate = s => { const m = String(s || '').match(/(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)) : 0; };
  L.pdfMeta = async pdf => { try { const i = (await pdf.getMetadata()).info || {}; return { c: String(i.Creator || '').slice(0, 120), p: String(i.Producer || '').slice(0, 120), cd: String(i.CreationDate || '').slice(0, 30), md: String(i.ModDate || '').slice(0, 30) }; } catch (e) { return {}; } };
  L.pdfCode = raw => { for (const re of CODES) { const m = String(raw || '').match(re); if (m) return m[1]; } return ''; };
  L.origin = (meta, raw, k, now) => {
    const isE = EDEV.includes(k), isO = OSYM.includes(k); if (!isE && !isO) return [];
    meta = meta || {}; now = now || Date.now(); const U = N(raw || ''), tag = (t, m) => [{ t, m, o: 1 }], who = [meta.c, meta.p].filter(Boolean).join(' / ') || 'bilinmiyor', code = L.pdfCode(raw);
    if (U.replace(/[^A-Z0-9]/g, '').length < 40) return tag('bad', 'PDF’de okunabilir metin yok (tarama/fotoğraf PDF’i). Belgeyi e-Devlet’ten doğrudan indirdiğiniz orijinal PDF olarak yükleyin (ekran görüntüsü de kabul edilir).');
    const stmt = isE ? /BELGE-?DOGRULAMA|BARKODLU BELGE/.test(U) : /BELGEKONTROL|KONTROL KODU/.test(U);
    if (!stmt) return tag('bad', isE ? 'Belgede e-Devlet barkod doğrulama ifadesi yok – e-Devlet’ten alınmış orijinal belge değil.' : 'Belgede ÖSYM belge kontrol kodu yok – ÖSYM’den alınmış orijinal belge değil.');
    const ed = EDITOR.test(who) && !GEN.test(who) && !(isO && /skia|chrome/i.test(who));
    if (ed) return code ? tag('warn', 'PDF bir düzenleme programında kaydedilmiş (' + who + ') – değiştirilmiş olabilir; yönetici “' + code + '” koduyla turkiye.gov.tr/belge-dogrulama’dan doğrulamalı.') : tag('bad', 'PDF bir düzenleme programında oluşturulmuş/değiştirilmiş (' + who + ') – e-Devlet’ten indirdiğiniz orijinal PDF’i yükleyin.');
    const cd = pdate(meta.cd), md = pdate(meta.md);
    if (isE && cd && (now - cd) / 864e5 > 30) return tag('bad', 'PDF dosyası ' + new Date(cd).toISOString().slice(0, 10) + ' tarihinde oluşturulmuş – 30 günden eski; güncel belge gerekli.');
    if (md && cd && md - cd > 120000) return tag('warn', 'PDF oluşturulduktan sonra değiştirilmiş görünüyor (' + who + ').');
    if (!code) return tag('warn', 'Barkod/doğrulama kodu okunamadı – yönetici belgeyi ayrıca kontrol eder.');
    return tag('ok', (isE ? 'e-Devlet barkodlu orijinal PDF' : 'ÖSYM kontrol kodlu orijinal PDF') + ' (kod ' + code + ')');
  };
  L.analyze = (text, F, srcType, now, force, meta) => {
    F = F || {}; const raw = text || '', U = N(raw), ck = [], info = [], P = []; now = now || Date.now();
    let c; const fd = force && L.D.find(d => d.k === force.k), fo = fd && fd.custom ? (fd.ocr || {}) : null;
    if (fo && fo.off) return { k: force.k, w: force.w, ck: [{ t: 'ok', m: 'Belge yüklendi' }], info: [], patches: [] };
    if (force && force.k === 'foto') c = { k: 'foto', s: 99 };
    else {
      c = L.classify(U);
      if (force) {
        const same = c && (c.k === force.k || (/^kimlik/.test(c.k) && /^kimlik/.test(force.k)));
        if (c && !same) return { k: force.k, w: force.w, ck: [{ t: 'bad', m: 'Bu belge “' + L.D.find(d => d.k === c.k).t + '” gibi görünüyor, “' + L.D.find(d => d.k === force.k).t + '” değil!' }], info, patches: [] };
        if (!c) {
          if (U.replace(/[^A-Z0-9]/g, '').length < 25) return { k: force.k, w: force.w, ck: [{ t: 'bad', m: 'Belgeden metin okunamadı – net ve tam görüntü yükleyin' }], info, patches: [] };
          if (!(fo && !(fo.any || []).length)) ck.push({ t: 'warn', m: 'Belge türü içerikten doğrulanamadı – doğru belge olduğundan emin olun' });
        }
        c = { k: force.k, s: 99 };
      } else if (!c && srcType === 'img' && U.replace(/[^A-Z0-9]/g, '').length < 25) c = { k: 'foto', s: 1 };
    }
    if (!c) return { k: null, w: '?', ck: [{ t: 'bad', m: 'Belge türü tanınamadı – listeden seçerek yükleyin' }], info, patches: P };
    const D = L.D.find(d => d.k === c.k), al = D.w; let w;
    if (force) w = force.w;
    else if (c.k === 'nufus' || c.k === 'kira_aile') w = 'a';
    else if (al.length === 1) w = al;
    else {
      w = L.ownerOf(U, F, al, srcType);
      if (!w && c.k === 'tescil') { const cs = (U.match(/CINSIYET\s*:\s*(KADIN|ERKEK)/) || [])[1]; if (cs) w = cs === 'KADIN' ? 'm' : 'f'; }
    }
    if (!w) { w = '?'; ck.push({ t: 'bad', m: 'Belgede öğrenci/anne/baba adı bulunamadı (ekran görüntüsü kaydırılmış/kırpılmış olabilir). Adı görünen ekranı yükleyin veya Bilgilerim’deki adı kontrol edin' }); }
    else if (!D.custom || (D.ocr && D.ocr.name)) ck.push(...L.verify(U, F, c.k, w, srcType));
    if (!D.custom) extract(c.k, w, raw, U, F, P, info, ck); else if (w !== '?') customCheck(D, raw, U, ck, P, info, srcType, now);
    if (w === '?' || ck.some(x => x.t === 'bad')) P.length = 0;
    if (FRESH.includes(c.k) && srcType !== 'img') ageCheck(raw, U, srcType, now, 30, ck, true);
    if (srcType === 'pdf') ck.push(...L.origin(meta, raw, c.k, now));
    if (ck.some(x => x.t === 'bad')) P.length = 0;
    return { k: c.k, w, ck, info, patches: P };
  };

  L.dead = (F, w) => w === 'm' ? F['anne.hayat'] === 'Hayır' : w === 'f' ? F['baba.hayat'] === 'Hayır' : false;
  L.req = (F, x) => {
    const k = x.k, w = x.w, d = w => L.dead(F, w);
    if (x.custom) return x.req === 'opt' ? false : (w === 'm' || w === 'f') ? !d(w) : true;
    if (['foto', 'kimlik_on', 'kimlik_ar', 'ikamet', 'ogrenci', 'kyk', 'nufus'].includes(k)) return true;
    if (k === 'tapu' || k === 'arac') return !d(w);
    if (k === 'sinav' || k === 'yerles') return firstYear(F);
    if (k === 'transkript') return !firstYear(F);
    if (k === 'yurt') return !!F.yurt && F.ailedeMi !== 'Evet';
    if (k === 'kira' || k === 'kira_aile') return true;
    if (k === 'adli') return w === 's' ? true : !d(w);
    if (k === 'tescil' || k === 'vergi') return !d(w);
    if (/^a4/.test(k)) return true;
    return false;
  };
  L.dstat = d => d.ck.some(c => c.t === 'bad') ? 'bad' : d.ck.some(c => c.t === 'warn') ? 'warn' : 'ok';
  L.progress = (F, docs) => { const r = L.SL.filter(x => L.req(F, x)); const ok = r.filter(x => docs.some(d => d.id === x.id && L.dstat(d) !== 'bad')).length; return { n: r.length, ok, p: r.length ? Math.round(ok / r.length * 100) : 0, miss: r.filter(x => !docs.some(d => d.id === x.id)) }; };


  L.refresh = (F, docs, now) => {
    docs.forEach(d => {
      if (!d.k || d.k === '?' || d.k === 'foto' || !d.text || !L.D.some(x => x.k === d.k)) return;
      if (d.w === '?') { const a = L.analyze(d.text, F, d.src || 'x', now, undefined, d.meta); if (a.k === d.k && a.w !== '?') { d.w = a.w; d.id = d.k + ':' + a.w; d.ck = a.ck; d.info = a.info; L.apply(F, a.patches); } }
      else d.ck = L.analyze(d.text, F, d.src || 'x', now, { k: d.k, w: d.w }, d.meta).ck;
    });
    const seen = {}; for (let i = docs.length - 1; i >= 0; i--) { const d = docs[i]; if (d.w !== '?' && seen[d.id]) docs.splice(i, 1); else seen[d.id] = 1; }
    return docs;
  };

  const REQ0 = ['ad', 'tc', 'dogum', 'adres', 'tel', 'mail', 'okul', 'gecmisBurs', 'fakulte', 'giris', 'sinif', 'okulno', 'gno', 'medeni', 'tabipBurs', 'ailedeMi', 'engel'];
  L.REQF = REQ0.slice();
  L.idMiss = F => { const nt = s => (s || '').trim().split(/\s+/).filter(x => x.length > 1).length, tcok = s => /^\d{11}$/.test((s || '').trim()) || /^[A-Za-z0-9]{5,20}$/.test((s || '').trim()), m = [];
    if (nt(F.ad) < 2) m.push('öğrenci adı-soyadı'); if (!tcok(F.tc)) m.push('öğrenci T.C. / yabancı kimlik no'); if (!F.sinif) m.push('sınıf');
    if (nt(F['anne.ad']) < 1) m.push('anne adı'); if ((F['anne.tc'] || '').trim() && !tcok(F['anne.tc'])) m.push('anne T.C. / yabancı kimlik no (yoksa boş bırakın)'); if (!F['anne.hayat']) m.push('anne hayatta mı');
    if (nt(F['baba.ad']) < 1) m.push('baba adı'); if ((F['baba.tc'] || '').trim() && !tcok(F['baba.tc'])) m.push('baba T.C. / yabancı kimlik no (yoksa boş bırakın)'); if (!F['baba.hayat']) m.push('baba hayatta mı'); return m; };
  L.steps = (F, docs, terms) => {
    const pr = L.progress(F, docs), im = L.idMiss(F), bad = docs.filter(d => L.dstat(d) === 'bad').length, fm = L.REQF.filter(k => !['ad', 'tc', 'sinif'].includes(k) && !String(F[k] || '').trim());
    return [
      { k: 'terms', ok: !!terms, why: 'Önce şartları kabul edin' },
      { k: 'id', ok: !im.length, why: im.length ? 'Eksik: ' + im.join(', ') : '' },
      { k: 'docs', ok: pr.ok === pr.n && !bad, why: (pr.n - pr.ok ? (pr.n - pr.ok) + ' zorunlu belge eksik/sorunlu' : '') + (bad ? (pr.n - pr.ok ? ', ' : '') + bad + ' belge kabul edilmedi' : '') },
      { k: 'form', ok: !fm.length, why: fm.length + ' zorunlu soru cevaplanmadı' }
    ];
  };
  L.ready = (F, docs, terms) => L.steps(F, docs, terms).every(x => x.ok);

  L.money = s => { const m = String(s || '').match(/\d[\d.,]*/); if (!m) return 0; let t = m[0].replace(/[.,]+$/, ''); t = /,\d{1,2}$/.test(t) ? t.replace(/\./g, '').replace(',', '.') : t.replace(/[.,]/g, ''); return parseFloat(t) || 0; };
  L.metrics = a => {
    const F = a.F || {}, ls = ((F.malvarlik || '') + '\n' + (F.aileMal || '')).split('\n');
    const inc = L.money(F.gelir) + L.money(F['anne.gelir']) + L.money(F['baba.gelir']);
    let houses = 0; ls.forEach(l => { const m = l.match(/(\d+)\s*adet\s*taşınmaz/i); if (m) houses += +m[1]; else if (/tapu:/i.test(l) && /var\/okunamad/i.test(l)) houses += 1; });
    const cars = ls.filter(l => /araç:/i.test(l) && !/kaydı yok/i.test(l)).length;
    const sib = (F.bakma || '').split('\n').map(x => x.trim()).filter(x => x && !/^yok/i.test(x)).length;
    const dead = (F['anne.hayat'] === 'Hayır' ? 1 : 0) + (F['baba.hayat'] === 'Hayır' ? 1 : 0), mem = 1 + sib + (2 - dead);
    const g = parseFloat(String(F.gno || '').replace(',', '.')), pr = L.progress(F, a.docs || []);
    return { total: inc, pc: Math.round(inc / mem), mem, houses, cars, sib, dead, gno: isNaN(g) ? null : g, burs: L.money(F.ozelMik) + L.money(F.kamuMik), rent: L.money(F.kira), away: F.ailedeMi === 'Hayır' || !!F.yurt, dis: F.engel === 'Evet', docsOk: pr.ok >= pr.n && !(a.docs || []).some(d => L.dstat(d) === 'bad'), dp: pr.ok + '/' + pr.n };
  };
  L.CRIT = [
    { id: 'pc', t: 'Kişi başı gelir (düşük ise yüksek puan)', w: 30, p: 15000, pl: 'Tavan TL' }, { id: 'tot', t: 'Toplam hane geliri (düşük ise yüksek puan)', w: 10, p: 60000, pl: 'Tavan TL' },
    { id: 'house', t: 'Ev / taşınmaz sayısı (az ise yüksek)', w: 15, p: 3, pl: 'Tavan adet' }, { id: 'car', t: 'Araç sayısı (az ise yüksek)', w: 5, p: 2, pl: 'Tavan adet' },
    { id: 'sib', t: 'Kardeş sayısı (çok ise yüksek)', w: 10, p: 4, pl: 'Üst sınır kişi' }, { id: 'orph', t: 'Anne/baba vefat', w: 10 }, { id: 'away', t: 'Ailesinden ayrı barınma (yurt/kira)', w: 5 },
    { id: 'dis', t: 'Engel durumu', w: 5 }, { id: 'gno', t: 'Not ortalaması (yüksek ise yüksek)', w: 10, p: 4, pl: 'Üst not' }, { id: 'oth', t: 'Başka burs almıyor (az burs ise yüksek)', w: 5, p: 5000, pl: 'Tavan TL/ay' }];
  L.RULES = [
    { id: 'sent', t: 'Başvuru gönderilmiş olmalı', b: 1 }, { id: 'docs', t: 'Belgeler tam ve sorunsuz olmalı', b: 1 }, { id: 'maxTot', t: 'Toplam gelir en fazla (TL)', v: 80000 }, { id: 'maxPc', t: 'Kişi başı gelir en fazla (TL)', v: 25000 },
    { id: 'maxHouse', t: 'Ev sayısı en fazla', v: 1 }, { id: 'maxCar', t: 'Araç sayısı en fazla', v: 1 }, { id: 'minGno', t: 'Not ortalaması en az', v: 2 }];
  L.defSet = () => ({ quota: 10, crit: Object.fromEntries(L.CRIT.map(c => [c.id, { on: false, w: c.w, p: c.p }])), rules: Object.fromEntries(L.RULES.map(r => [r.id, { on: false, v: r.v }])), term: { name: '2027-2028 Burs Dönemi', open: '2027-09-01', close: '2027-09-30', enforce: true, msg: '' }, custom: { docs: [], qs: [] } });
  const S_ = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
  const list = (v, n, m) => (Array.isArray(v) ? v : String(v || '').split(/[,\n]/)).map(x => S_(x, m || 60)).filter(Boolean).slice(0, n || 30);
  const WS = ['s', 'm', 'f', 'a', 'mf', 'sm', 'sf', 'smf'], dte = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? v : '';
  const cleanDoc = d => {
    if (!d || !/^x_[a-z0-9]{3,12}$/.test(String(d.k || '')) || !S_(d.t, 80)) return null; const o = d.ocr || {};
    return { k: d.k, t: S_(d.t, 80), w: WS.includes(d.w) ? d.w : 's', cat: S_(d.cat, 40) || 'Ek Belgeler', d: S_(d.d, 300), l: /^https?:\/\/[^\s"'<>]{4,300}$/.test(String(d.l || '')) ? d.l : '', h: S_(d.h, 200), req: d.req === 'opt' ? 'opt' : 'always', none: !!d.none, icon: /^[a-z_]{2,30}$/.test(String(d.icon || '')) ? d.icon : 'description',
      ocr: { off: !!o.off, name: !!o.name, any: list(o.any, 15), all: list(o.all, 15), deny: list(o.deny, 15), maxAge: Math.max(0, Math.min(3650, +o.maxAge || 0)), minChars: Math.max(0, Math.min(5000, +o.minChars || 0)), fields: (Array.isArray(o.fields) ? o.fields : []).slice(0, 10).map(f => ({ q: S_(f && f.q, 12), after: S_(f && f.after, 60) })).filter(f => /^[a-z0-9]{3,12}$/.test(f.q) && f.after) } };
  };
  const cleanQ = q => (!q || !/^[a-z0-9]{3,12}$/.test(String(q.id || '')) || !S_(q.t, 80)) ? null : { id: q.id, t: S_(q.t, 80), type: ['t', 'a', 'y', 's'].includes(q.type) ? q.type : 't', opts: list(q.opts, 12), req: !!q.req, sec: [1, 2, 3, 4].includes(+q.sec) ? +q.sec : 3 };
  const uniq = (a, f) => { const seen = {}; return a.map(f).filter(x => x && !seen[x.k || x.id] && (seen[x.k || x.id] = 1)); };
  L.mergeSet = x => {
    const d = L.defSet(); x = x || {}; d.quota = +x.quota >= 0 ? +x.quota : d.quota; for (const k in d.crit) Object.assign(d.crit[k], (x.crit || {})[k] || {}); for (const k in d.rules) Object.assign(d.rules[k], (x.rules || {})[k] || {}); d.rules.sent.on = true; d.rules.docs.on = true;
    if (x.term && typeof x.term === 'object') d.term = { name: S_(x.term.name, 80) || d.term.name, open: dte(x.term.open), close: dte(x.term.close), enforce: x.term.enforce !== false && x.term.enforce !== 0, msg: S_(x.term.msg, 300) };
    const c = x.custom || {}; d.custom = { docs: uniq((Array.isArray(c.docs) ? c.docs : []).slice(0, 30), cleanDoc), qs: uniq((Array.isArray(c.qs) ? c.qs : []).slice(0, 40), cleanQ) };
    return d;
  };
  L.termState = (t, now) => {
    now = now || Date.now(); if (!t || !t.enforce || (!t.open && !t.close)) return { s: 'open' };
    const o = t.open ? new Date(t.open + 'T00:00:00').getTime() : 0, c = t.close ? new Date(t.close + 'T23:59:59').getTime() : Infinity;
    return { s: now < o ? 'before' : now > c ? 'closed' : 'open', o, c };
  };
  L.fmtD = v => { const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? m[3] + '.' + m[2] + '.' + m[1] : ''; };
  L.setCustom = c => {
    c = c || {}; const docs = (c.docs || []).filter(d => d && d.k && d.t), qs = (c.qs || []).filter(q => q && q.id && q.t);
    L.custom = { docs, qs };
    L.D.length = 0; L.D.push(...BASE, ...docs.map(d => Object.assign({ icon: 'description', cat: 'Ek Belgeler', w: 's', l: '', h: '', d: '' }, d, { custom: true })));
    L.SL.length = 0; L.SL.push(...L.D.flatMap(d => [...d.w].map(w => Object.assign({}, d, { w, id: d.k + ':' + w }))));
    L.cats.length = 0; L.cats.push(...new Set(L.D.map(d => d.cat)));
    L.Q.length = 0; L.Q.push(...qs.map(q => Object.assign({}, q, { key: 'x_' + q.id })));
    L.REQF.length = 0; L.REQF.push(...REQ0, ...L.Q.filter(q => q.req).map(q => q.key));
    CR = docs.filter(d => d.ocr && (d.ocr.any || []).length && !d.ocr.off).map(d => [d.k, new RegExp(d.ocr.any.map(x => esc(N(x))).join('|')), 8]);
  };
  L.setCustom(null);
  L.score = (m, S) => {
    const C = S.crit, f = {
      pc: p => 1 - Math.min(1, m.pc / p), tot: p => 1 - Math.min(1, m.total / p), house: p => 1 - Math.min(1, m.houses / p), car: p => 1 - Math.min(1, m.cars / p), sib: p => Math.min(1, m.sib / p),
      orph: () => m.dead / 2, away: () => m.away ? 1 : 0, dis: () => m.dis ? 1 : 0, gno: p => m.gno === null ? null : Math.min(1, m.gno / (m.gno > p ? 100 : p)), oth: p => 1 - Math.min(1, m.burs / p)
    }; let a = 0, b = 0;
    for (const k in f) { const c = C[k]; if (!c || !c.on || !(+c.w > 0)) continue; const v = f[k](+c.p || 1); if (v === null) continue; a += c.w * v; b += +c.w; }
    return b ? Math.round(a / b * 100) : 0;
  };
  L.fails = (a, m, S) => {
    const R = S.rules, r = [], on = k => R[k] && R[k].on, v = k => +R[k].v;
    if (!['Beklemede', 'Onaylandı'].includes(a.status)) r.push('Başvuru gönderilmemiş');
    if (!m.docsOk) r.push('Belgeler eksik/sorunlu (' + m.dp + ')');
    if (on('maxTot') && m.total > v('maxTot')) r.push('Toplam gelir ' + m.total + ' TL > ' + v('maxTot'));
    if (on('maxPc') && m.pc > v('maxPc')) r.push('Kişi başı gelir ' + m.pc + ' TL > ' + v('maxPc'));
    if (on('maxHouse') && m.houses > v('maxHouse')) r.push('Ev sayısı ' + m.houses + ' > ' + v('maxHouse'));
    if (on('maxCar') && m.cars > v('maxCar')) r.push('Araç sayısı ' + m.cars + ' > ' + v('maxCar'));
    if (on('minGno') && m.gno !== null && m.gno < v('minGno')) r.push('Not ort. ' + m.gno + ' < ' + v('minGno'));
    return r;
  };
  L.rank = (apps, S) => {
    const rows = apps.map(a => { const m = L.metrics(a), f = L.fails(a, m, S); return { a, m, f, sc: L.score(m, S) }; });
    const el = rows.filter(r => !r.f.length).sort((x, y) => y.sc - x.sc || x.m.pc - y.m.pc || (y.m.gno || 0) - (x.m.gno || 0));
    el.forEach((r, i) => { r.rank = i + 1; r.res = i < S.quota ? 'Burs' : 'Yedek'; });
    rows.filter(r => r.f.length).forEach(r => { r.rank = 0; r.res = 'Elendi'; });
    return rows;
  };

  root.L = L; if (typeof module !== 'undefined') module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
