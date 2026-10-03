(function (root) {
  const SG = {};
  const FA = ['Ayşe', 'Elif', 'Zeynep', 'Selin', 'Merve', 'Ece', 'Büşra', 'Esra', 'Nur', 'Deniz'], MA = ['Mehmet', 'Can', 'Emre', 'Burak', 'Kerem', 'Ahmet', 'Mustafa', 'Ali', 'Onur', 'Yusuf'];
  const SY = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Aydın', 'Öztürk', 'Arslan', 'Koç', 'Polat'], AN = ['Fatma', 'Hatice', 'Emine', 'Sevim', 'Gülay', 'Zehra'], BA = ['Hüseyin', 'İbrahim', 'Murat', 'Kemal', 'Osman', 'Recep'];
  const IL = ['Süleymanpaşa', 'Çorlu', 'Çerkezköy', 'Malkara', 'Hayrabolu', 'Ergene'], UNI = ['Tekirdağ Namık Kemal Üniversitesi – Tıp Fakültesi'];
  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' TL';
  // geçerli sağlama basamaklı T.C. kimlik no: T.C. vatandaşı 1-7 ile başlar, yabancı kimlik (YKN) 99 ile başlar
  SG.tc = (rnd, foreign) => {
    const d = foreign ? [9, 9] : [rnd(1, 7), rnd(0, 9)]; while (d.length < 9) d.push(rnd(0, 9));
    d.push((((d[0] + d[2] + d[4] + d[6] + d[8]) * 7 - (d[1] + d[3] + d[5] + d[7])) % 10 + 10) % 10); d.push(d.reduce((a, b) => a + b, 0) % 10);
    return d.join('');
  };
  SG.SINIF = ['1. sınıf', '2. sınıf', '3. sınıf', '4. sınıf', '5. sınıf', '6. sınıf'];
  SG.make = (tc, rnd, pick) => {
    const sy = pick(SY), ad = pick([...FA, ...MA]) + ' ' + sy, sinif = pick(SG.SINIF), n = parseInt(sinif) || 1, first = n === 1;
    const tcn = () => SG.tc(rnd, rnd(1, 12) === 1), sokak = () => pick(['Atatürk', 'Cumhuriyet', 'İnönü', 'Gazi', 'Çınar']) + ' Cad. No:' + rnd(1, 90) + ' D:' + rnd(1, 12), mah = () => pick(['Cumhuriyet', 'Yeni', 'Gündüz', 'Hürriyet']) + ' Mah. ';
    const il = pick(IL), adres = mah() + sokak() + ' ' + il + ' / Tekirdağ', tel = () => '05' + pick(['32', '33', '35', '42', '53']) + ' ' + rnd(100, 999) + ' ' + rnd(10, 99) + ' ' + rnd(10, 99);
    const ayri = pick([0, 0, 1]), kiraDa = ayri && pick([0, 1]), kd = rnd(0, 3), tp = pick([0, 0, 1, 1, 2, 3]), ar = pick([0, 0, 1, 2]);
    const am = pick([0, 1, 1, 1]), bm = pick([0, 1, 1, 1]), ge = pick([0, 18000, 26000, 40000, 65000, 90000]), gb = pick([0, 22000, 30000, 45000]);
    const ob = pick(['', '', 'Belediye bursu']), kb = pick(['', 'KYK Bursu']), sibs = Array.from({ length: kd }, (_, j) => pick([...FA, ...MA]) + ' ' + sy + ', ' + rnd(5, 17) + ' yaş, ' + pick(['ilkokul', 'ortaokul', 'lise']));
    const F = {
      ad, tc, dogum: 'Tekirdağ / ' + String(rnd(1, 28)).padStart(2, '0') + '.' + String(rnd(1, 12)).padStart(2, '0') + '.200' + rnd(1, 5), adres, tel: tel(), mail: tc + '@demo.local',
      okul: pick(['Tekirdağ Anadolu Lisesi', 'Çorlu Fen Lisesi', 'Namık Kemal Anadolu Lisesi', 'Çerkezköy Anadolu Lisesi']), gecmisBurs: pick(['Hayır', 'Hayır', 'Evet']), fakulte: pick(UNI), giris: String(2027 - n), sinif, okulno: String(rnd(2e7, 2.6e7)),
      gno: first ? 'Yok (1. sınıf, henüz not ortalaması yok)' : (rnd(220, 395) / 100).toFixed(2).replace('.', ','), dil: pick(['İngilizce (B2)', 'İngilizce (C1)', 'İngilizce, Almanca (A2)']),
      medeni: 'Bekar', cocuk: '0', gelir: pick(['', '', '', '4.000 TL']), malvarlik: 'Tapu: taşınmaz kaydı yok\nAraç: araç kaydı yok', ozelBurs: ob || 'Yok', ozelMik: ob ? fmt(pick([1500, 2000, 3000])) : '', kamuBurs: kb || 'Yok (KYK kredi/burs yok)', kamuMik: kb ? fmt(3000) : '',
      tabipBurs: 'Hayır', ailedeMi: ayri ? 'Hayır' : 'Evet', yurt: ayri && !kiraDa ? 'Demo Yurdu – Tekirdağ Merkez' : '', kira: kiraDa ? fmt(rnd(6, 12) * 1000) : '', evArk: kiraDa ? String(rnd(0, 2)) : '', gider: fmt(rnd(6, 16) * 1000), engel: pick(['Hayır', 'Hayır', 'Hayır', 'Evet']), hobi: pick(['Satranç, yüzme', 'Kitap okumak, futbol', 'Fotoğrafçılık', 'Müzik (gitar)']), dernek: pick(['Yok', 'Tıp Öğrencileri Topluluğu', 'Gönüllüler Derneği']),
      'anne.ad': pick(AN) + ' ' + sy, 'anne.tc': tcn(), 'anne.hayat': am ? 'Evet' : 'Hayır', 'anne.adres': am ? adres : '', 'anne.meslek': am ? pick(['Ev hanımı', 'Öğretmen', 'Hemşire', 'Emekli']) : '', 'anne.isyeri': am && ge ? 'Çorlu Devlet Hastanesi' : '', 'anne.gelir': am && ge ? fmt(ge) : '', 'anne.tel': am ? tel() : '',
      'baba.ad': pick(BA) + ' ' + sy, 'baba.tc': tcn(), 'baba.hayat': bm ? 'Evet' : 'Hayır', 'baba.adres': bm ? adres : '', 'baba.meslek': bm ? pick(['Esnaf', 'İşçi', 'Memur', 'Emekli', 'Şoför']) : '', 'baba.isyeri': bm && gb ? 'Organize Sanayi Bölgesi, ' + il : '', 'baba.gelir': bm && gb ? fmt(gb) : '', 'baba.tel': bm ? tel() : '',
      bakma: sibs.length ? sibs.join('\n') : 'Yok', aileMal: 'Baba tapu: ' + (tp ? tp + ' adet taşınmaz kaydı var (inceleyin)' : 'taşınmaz kaydı yok') + '\nBaba araç: ' + (ar ? 'Otomobil Fiat 2012 kayıtlı' : 'araç kaydı yok'), aileGelir: 'Ücret dışı gelir yok', ayri: ayri ? pick(['Annemle yaşıyorum (anne-baba ayrı)', 'Babamla yaşıyorum (anne-baba ayrı)', kiraDa ? 'Kirada kalıyorum' : 'Yurtta kalıyorum']) : 'Anne ve babamla birlikte yaşıyorum', _a: {}
    };
    return F;
  };
  const e = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  SG.svg = (title, who, tc, extra) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 560" width="420" height="560"><rect width="420" height="560" fill="#fff"/><rect width="420" height="70" fill="#1d4f91"/><text x="20" y="43" font-family="Arial" font-size="19" font-weight="bold" fill="#fff">' + e(title) + '</text>'
    + '<text x="20" y="110" font-family="Arial" font-size="12" fill="#888">DEMO BELGE – gerçek bir belge değildir</text><text x="20" y="160" font-family="Arial" font-size="15" fill="#111">Ad Soyad : ' + e(who) + '</text><text x="20" y="190" font-family="Arial" font-size="15" fill="#111">T.C. Kimlik No : ' + e(tc) + '</text>'
    + '<text x="20" y="220" font-family="Arial" font-size="15" fill="#111">Belge Tarihi : ' + new Date().toLocaleDateString('tr-TR') + '</text>' + (extra || []).map((t, i) => '<text x="20" y="' + (260 + i * 26) + '" font-family="Arial" font-size="14" fill="#333">' + e(t) + '</text>').join('')
    + '<rect x="20" y="470" width="380" height="50" fill="none" stroke="#bbb" stroke-dasharray="4"/><text x="32" y="501" font-family="monospace" font-size="14" fill="#666">Barkod: DEMO-' + e(String(tc).slice(-6)) + '</text></svg>';

  // ---- gerçekçi e-Devlet görünümlü örnek belge (A4, SVG) ----
  const hs = str => { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rg = seed => { let x = seed || 1; return () => (x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296; };
  const AL = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', code = (pre, seed, n) => { const r = rg(hs(seed)); return pre + Array.from({ length: n }, () => AL[Math.floor(r() * AL.length)]).join(''); };
  const today = () => new Date().toLocaleDateString('tr-TR').replace(/\//g, '.');
  const NOTE = ['AA', 'BA', 'BB', 'CB', 'CC', 'AA', 'BA', 'BB'], DERS = [['Anatomi', 9], ['Histoloji ve Embriyoloji', 6], ['Tıbbi Biyoloji', 5], ['Biyokimya', 5], ['Fizyoloji', 8], ['Biyofizik', 3], ['Tıbbi Terminoloji', 2], ['Tıp Tarihi ve Etik', 2], ['Yabancı Dil I', 3]];
  const docDef = (k, who, tc, F, w) => {
    const d = today(), r = rg(hs(k + tc)), up = x => String(x).toLocaleUpperCase('tr-TR'), pr = F['anne.ad'] ? [up(F['anne.ad'].split(' ')[0]), up(F['baba.ad'].split(' ')[0])] : ['', ''];
    const kimlik = [['T.C. Kimlik No', tc], ['Adı Soyadı', up(who)]];
    const D = {
      ikamet: { org: 'T.C. İÇİŞLERİ BAKANLIĞI – Nüfus ve Vatandaşlık İşleri Genel Müdürlüğü', t: 'YERLEŞİM YERİ VE DİĞER ADRES BELGESİ', rows: [...kimlik, ['Adres Tipi', 'Yurtiçi Yerleşim Yeri Adresi'], ['Adres No', String(1000000000 + Math.floor(r() * 8e8))], ['Adres', up(F.adres || '')]], bc: 'NV0' + (1 + Math.floor(r() * 2)) + '-' + code('', k + tc, 12).replace(/(.{4})(.{4})(.{4})/, '$1-$2-$3') },
      ogrenci: { org: 'T.C. YÜKSEKÖĞRETİM KURULU BAŞKANLIĞI', t: 'ÖĞRENCİ BELGESİ', rows: [...kimlik, ['Anne / Baba Adı', pr[0] + ' / ' + pr[1]], ['Öğrencilik Durumu', 'AKTİF ÖĞRENCİ'], ['Sınıf', F.sinif || ''], ['Program', up(F.fakulte || '') + ' / TIP PR.'], ['Öğrenim Türü', 'ÖRGÜN ÖĞRETİM / 6 YIL'], ['Öğrenci No', F.okulno || '']], bc: code('YOK', k + tc, 15) },
      transkript: { org: 'T.C. TEKİRDAĞ NAMIK KEMAL ÜNİVERSİTESİ – TIP FAKÜLTESİ', t: 'TRANSKRİPT (NOT DURUM BELGESİ)', rows: [['Öğrenci No', F.okulno || ''], ['Adı Soyadı', up(who)], ['T.C. Kimlik No', tc], ['Genel Not Ortalaması', F.gno || '']], tbl: { c: ['Ders', 'AKTS', 'Harf', 'Durum'], r: DERS.map(([n, a]) => { const g = NOTE[Math.floor(r() * NOTE.length)]; return [n, String(a), g, 'Başarılı']; }) } },
      kyk: { org: 'T.C. GENÇLİK VE SPOR BAKANLIĞI – Kredi ve Yurtlar Genel Müdürlüğü', t: 'KREDİ/BURS DURUM BELGESİ', rows: [...kimlik, ['Anne / Baba Adı', pr[0] + ' / ' + pr[1]]], para: (F.kamuMik ? 'Kurumumuzdan burs almaktadır.' : d + ' tarihi itibariyle Kredi ve Yurtlar Genel Müdürlüğü’nden herhangi bir kredi/burs almamaktadır.'), bc: code('KYK', k + tc, 14) },
      nufus: { org: 'T.C. İÇİŞLERİ BAKANLIĞI – Nüfus ve Vatandaşlık İşleri Genel Müdürlüğü', t: 'NÜFUS KAYIT ÖRNEĞİ (VUKUATLI)', rows: [['Düzenlenme', 'TEKİRDAĞ TABİP ODASI’NA İBRAZ İÇİN'], ['Geçerlilik', d + ' – 30 gün']], tbl: { c: ['Yakınlık', 'T.C. Kimlik No', 'Adı Soyadı', 'Cinsiyet'], r: [['Kendisi', tc, up(who), '—'], ['Annesi', F['anne.tc'] || '—', up(F['anne.ad'] || ''), 'K'], ['Babası', F['baba.tc'] || '—', up(F['baba.ad'] || ''), 'E']] }, bc: 'NV01-' + code('', k + tc, 12).replace(/(.{4})(.{4})(.{4})/, '$1-$2-$3') },
      tescil: { org: 'T.C. SOSYAL GÜVENLİK KURUMU BAŞKANLIĞI', t: 'SİGORTALILIK TESCİL VE HİZMET DÖKÜMÜ', rows: [...kimlik, ['Cinsiyet', w === 'm' ? 'KADIN' : 'ERKEK'], ['Tescil', (w === 'm' ? F['anne.meslek'] : F['baba.meslek']) || 'Kayıt bulunmaktadır']], bc: 'hd' + code('', k + tc, 18).toLowerCase() },
      adli: { org: 'T.C. ADALET BAKANLIĞI – Adli Sicil ve İstatistik Genel Müdürlüğü', t: 'ADLİ SİCİL KAYDI', rows: [...kimlik, ['Sorgu Türü', 'OKUL KAYDI'], ['Kullanım Amacı', 'TEKİRDAĞ TABİP ODASI BURS BAŞVURUSU']], para: 'YUKARIDA KİMLİK BİLGİLERİ BULUNAN KİŞİNİN ADLİ SİCİL KAYDI YOKTUR.', bc: 'ADB0' + String(Math.floor(r() * 9e9)) },
      sinav: { org: 'ÖLÇME, SEÇME VE YERLEŞTİRME MERKEZİ (ÖSYM)', t: 'YKS SONUÇ BELGESİ', rows: [...kimlik, ['Sınav', '2026 Yükseköğretim Kurumları Sınavı (YKS)'], ['TYT', (440 + Math.floor(r() * 80)) + ',' + String(Math.floor(r() * 99999)).padStart(5, '0')], ['SAY', (440 + Math.floor(r() * 80)) + ',' + String(Math.floor(r() * 99999)).padStart(5, '0')], ['Başarı Sırası', String(1000 + Math.floor(r() * 25000))]], kc: code('', k + tc, 8) },
      yerles: { org: 'ÖLÇME, SEÇME VE YERLEŞTİRME MERKEZİ (ÖSYM)', t: 'YKS YERLEŞTİRME SONUÇ BELGESİ', rows: [...kimlik, ['Program', up(F.fakulte || '') + ' – TIP'], ['Yerleşme Türü', 'OKUL BİRİNCİSİ'], ['Yerleşme Puanı', (480 + Math.floor(r() * 60)) + ',' + String(Math.floor(r() * 99999)).padStart(5, '0')]], kc: code('', k + tc, 8) },
      vergi: { org: 'T.C. HAZİNE VE MALİYE BAKANLIĞI – Gelir İdaresi Başkanlığı', t: 'VERGİ LEVHASI', rows: [...kimlik, ['Mükellefiyet', F.gelir ? 'VAR' : 'KAYIT BULUNAMADI']], bc: code('GIB', k + tc, 12) },
      tapu: { org: 'T.C. TAPU VE KADASTRO GENEL MÜDÜRLÜĞÜ', t: 'TAPU BİLGİLERİ SORGULAMA', rows: [...kimlik], para: 'Adınıza kayıtlı taşınmaz bulunamamıştır.', bc: code('TKG', k + tc, 12) },
      arac: { org: 'T.C. İÇİŞLERİ BAKANLIĞI – Emniyet Genel Müdürlüğü', t: 'ADIMA TESCİLLİ ARAÇ SORGULAMA', rows: [...kimlik], para: 'Adınıza tescilli araç bulunamamıştır.', bc: code('EGM', k + tc, 12) },
      yurt: { org: 'T.C. GENÇLİK VE SPOR BAKANLIĞI', t: 'YURT KAYIT BELGESİ', rows: [...kimlik, ['Yurt Adı', F.yurt || 'KYK Yurdu – Tekirdağ']], bc: code('GSB', k + tc, 12) },
      kira: { org: 'KİRA SÖZLEŞMESİ', t: 'KONUT KİRA SÖZLEŞMESİ', rows: [['Kiracı', up(who)], ['T.C. Kimlik No', tc], ['Aylık Kira', F.kira || '—'], ['Adres', up(F.adres || '')]], para: 'Taraflar arasında imzalanmış kira sözleşmesidir.' },
      bordro: { org: 'ÜCRET BORDROSU', t: 'AYLIK ÜCRET BORDROSU', rows: [...kimlik, ['İşyeri', (w === 'm' ? F['anne.isyeri'] : F['baba.isyeri']) || ''], ['Net Ücret', (w === 'm' ? F['anne.gelir'] : F['baba.gelir']) || '']] }
    };
    if (k.startsWith('a4')) return { org: 'T.C. SOSYAL GÜVENLİK KURUMU BAŞKANLIĞI', t: k.slice(1).toUpperCase() + ' EMEKLİ AYLIK BİLGİLERİ', rows: [...kimlik], para: 'Bu kimlik numarasına ait ' + k.slice(1).toUpperCase() + ' kapsamında emekli aylığı kaydı bulunamamıştır.', bc: code('SGK', k + tc, 16) };
    return D[k] || { org: 'BELGE', t: String(k).toUpperCase(), rows: [...kimlik] };
  };
  SG.ck = (k, who, tc, F, w) => {
    if (SHOT[k]) return { ck: [{ t: 'ok', m: 'e-Devlet ekran görüntüsü – ' + who + ' adına “bulunamamıştır” ekranı doğrulandı' }], info: ['Kayıt bulunamadı: ' + SHOT[k][1] + ' – ' + who + ' adına kayıt yok (geçerli belge)'] };
    const o = docDef(k, who, tc, F || {}, w), c = o.bc || (o.kc ? o.kc : ''), d = today(); return c ? { ck: [{ t: 'ok', m: (o.kc ? 'ÖSYM kontrol kodlu orijinal belge' : 'e-Devlet barkodlu orijinal belge') + ' (kod ' + c + ')', o: 1 }, { t: 'ok', m: 'Güncel tarihli (' + d + ')' }, { t: 'ok', m: 'Belge ' + who + ' adına doğrulandı' }], info: [(o.kc ? 'ÖSYM' : 'e-Devlet') + ' belgesi – ' + who + ' – ' + d] } : { ck: [{ t: 'ok', m: 'Belge ' + who + ' adına doğrulandı' }], info: ['Belge – ' + who] }; };

  // e-Devlet "kayıt bulunamamıştır" ekran görüntüsü (telefon, açık tema, mavi)
  const SHOT = {
    tapu: ['Tapu ve Kadastro Genel Müdürlüğü', 'Tapu Bilgileri Sorgulama', "Bu hizmet yalnızca TAKBİS'te T.C. Kimlik Numarası kayıtlı olan kişiler kapsamında sunulmaktadır.", 'Tapu Kadastro Genel Müdürlüğü Bilgi Sistemine geçmiş Tapu Sicil Müdürlüklerine ait kayıtlarda; T.C. Kimlik numaranız ile eşleşen herhangi bir kayıt bulunamamıştır.'],
    arac: ['Emniyet Genel Müdürlüğü', 'Adıma Tescilli Araç Sorgulama', 'Bu hizmet T.C. Kimlik Numarası ile tescilli araçlarınızı listelemektedir.', 'T.C. Kimlik numaranız adına tescilli herhangi bir araç kaydı bulunamamıştır.'],
    vergi: ['Gelir İdaresi Başkanlığı', 'e-Vergi Levhası Sorgulama', 'Bu hizmet vergi mükellefi olan kişiler kapsamında sunulmaktadır.', 'T.C. Kimlik numaranız ile eşleşen herhangi bir vergi levhası kaydı bulunamamıştır.'],
    a4a: ['Sosyal Güvenlik Kurumu', '4A Emekli Aylık Bilgisi', 'Bu hizmet 4/a kapsamında aylık alan kişiler için sunulmaktadır.', 'T.C. Kimlik numaranız ile eşleşen herhangi bir 4A emekli aylığı kaydı bulunamamıştır.'],
    a4b: ['Sosyal Güvenlik Kurumu', '4B Emekli Aylık Bilgisi', 'Bu hizmet 4/b kapsamında aylık alan kişiler için sunulmaktadır.', 'T.C. Kimlik numaranız ile eşleşen herhangi bir 4B emekli aylığı kaydı bulunamamıştır.'],
    a4c: ['Sosyal Güvenlik Kurumu', '4C Emekli Aylık Bilgisi', 'Bu hizmet 4/c kapsamında aylık alan kişiler için sunulmaktadır.', 'T.C. Kimlik numaranız ile eşleşen herhangi bir 4C emekli aylığı kaydı bulunamamıştır.']
  };
  const wrap = (s, n) => { const o = []; let l = ''; String(s).split(' ').forEach(w => { if ((l + ' ' + w).trim().length > n) { o.push(l); l = w; } else l = (l + ' ' + w).trim(); }); if (l) o.push(l); return o; };
  const shotSvg = (k, who) => {
    const [org, svc, intro, msg] = SHOT[k], nm = String(who).toLocaleUpperCase('tr-TR'), W = 540, H = 1121, B = '#1d5fa8', t = (x, y, s, sz, fill, extra) => '<text x="' + x + '" y="' + y + '" font-family="Arial,Helvetica,sans-serif" font-size="' + sz + '" fill="' + fill + '" ' + (extra || '') + '>' + e(s) + '</text>';
    let o = '<rect width="' + W + '" height="' + H + '" fill="#fff"/><rect width="' + W + '" height="66" fill="#fff"/>' + t(100, 42, 'www.turkiye.gov.tr', 24, '#111') + '<rect x="14" y="24" width="30" height="22" rx="4" fill="none" stroke="#111" stroke-width="3"/><circle cx="500" cy="34" r="3" fill="#111"/><circle cx="500" cy="46" r="3" fill="#111"/><circle cx="500" cy="22" r="3" fill="#111"/>';
    o += '<rect y="66" width="' + W + '" height="200" fill="' + B + '"/>' + t(98, 118, 'türkiye.gov.tr', 30, '#fff', 'font-weight="bold"') + t(98, 134, '“Devletin Kısayolu”', 8, '#fff') + '<ellipse cx="52" cy="112" rx="34" ry="24" fill="none" stroke="#fff" stroke-width="4" transform="rotate(-20 52 112)"/><rect x="494" y="100" width="28" height="4" fill="#fff"/><rect x="494" y="110" width="28" height="4" fill="#fff"/><rect x="494" y="120" width="28" height="4" fill="#fff"/>';
    o += '<rect x="56" y="156" width="40" height="40" rx="8" fill="#1a4f8c"/><rect x="104" y="156" width="40" height="40" rx="8" fill="#1a4f8c"/><rect x="156" y="156" width="330" height="40" rx="8" fill="#e8eef6"/>' + t(172, 182, 'Nasıl yardım edebilirim?', 15, '#8a96a8');
    o += '<rect x="116" y="208" width="308" height="42" rx="8" fill="#fff"/>' + t(200, 236, nm.split(' ').slice(0, 2).join(' '), 18, '#1d5fa8') + '<circle cx="176" cy="229" r="9" fill="#1d5fa8"/>';
    o += t(30, 292, 'Ana Sayfa  ›  ' + org.slice(0, 26) + (org.length > 26 ? '…' : '') + '  ›  ' + svc.slice(0, 18), 12.5, B);
    o += '<rect x="22" y="320" width="78" height="78" fill="#fff" stroke="#d9dee6"/><rect x="34" y="334" width="54" height="50" fill="' + B + '" opacity=".15"/>' + t(116, 345, org, 17, B) + t(116, 380, svc, 23, '#111');
    o += t(150, 450, '★ Favorilere ekle', 14, '#6b7280') + t(300, 450, '● Puanla', 14, '#6b7280') + t(400, 450, '⋖ Paylaş', 14, '#6b7280');
    o += t(18, 506, 'Sayın ' + nm + ',', 17.5, '#111'); wrap(intro, 46).forEach((l, i) => { o += t(18, 532 + i * 24, l, 16, '#111'); });
    const box = (y, h, fill, stroke, icon, lines, sz) => { let b = '<rect x="18" y="' + y + '" width="504" height="' + h + '" rx="10" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/>' + icon; lines.forEach((l, i) => { b += t(96, y + 36 + i * (sz + 8), l, sz, '#111'); }); return b; };
    const tri = y => '<polygon points="44,' + (y + 56) + ' 66,' + (y + 18) + ' 88,' + (y + 56) + '" fill="#1a56db"/><rect x="64" y="' + (y + 30) + '" width="4" height="12" fill="#fff"/><rect x="64" y="' + (y + 46) + '" width="4" height="4" fill="#fff"/>';
    const ml = wrap(msg, 36); o += box(600, 36 + ml.length * 28 + 20, '#eff5ff', '#1a56db', tri(600 + 8), ml, 17);
    const y2 = 600 + 36 + ml.length * 28 + 36; o += box(y2, 96, '#f0f9ff', '#3b6fd4', '<circle cx="56" cy="' + (y2 + 48) + '" r="20" fill="#9aa5b8"/>', wrap('Yukarıdaki bilginin doğru olmadığını düşünüyorsanız, ilgili kuruma başvurarak kimlik bilgilerinizi güncellemeniz gerekmektedir.', 52), 13);
    const y3 = y2 + 96 + 24; o += box(y3, 96, '#eef4ff', '#1d5fa8', '<circle cx="56" cy="' + (y3 + 48) + '" r="20" fill="#1d5fa8"/><rect x="53" y="' + (y3 + 40) + '" width="6" height="18" fill="#fff"/><rect x="53" y="' + (y3 + 32) + '" width="6" height="5" fill="#fff"/>', ['Başka bir T.C. Kimlik Numarası için ya da önceki', 'sonuçlarınızı görmek için tıklayınız.'], 14);
    o += '<rect y="' + (H - 66) + '" width="' + W + '" height="66" fill="#eef1f5"/>' + t(18, H - 22, 'DEMO – örnek ekran görüntüsüdür, gerçek değildir.', 11, '#9aa3b2');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' + o + '</svg>';
  };
  SG.isShot = k => !!SHOT[k];
  SG.doc = (k, who, tc, F, w, title) => {
    if (SHOT[k]) return shotSvg(k, who);
    const o = docDef(k, who, tc, F || {}, w), d = today(), edev = !!(o.bc || o.kc), W = 595, H = 842, r = rg(hs(tc + k)); let y = 150, out = '';
    out += '<rect width="' + W + '" height="' + H + '" fill="#fff"/>' + '<rect width="' + W + '" height="86" fill="' + (edev ? '#1d4f91' : '#334155') + '"/><text x="30" y="34" font-family="Arial" font-size="11" fill="#fff" opacity=".9">' + e(o.org) + '</text><text x="30" y="64" font-family="Arial" font-size="19" font-weight="bold" fill="#fff">' + e(o.t) + '</text>';
    out += '<text x="565" y="112" text-anchor="end" font-family="Arial" font-size="11" fill="#555">' + d + '</text>';
    (o.rows || []).forEach(([l, v], i) => { out += '<rect x="30" y="' + (y - 17) + '" width="535" height="26" fill="' + (i % 2 ? '#fff' : '#f4f5f7') + '"/><text x="38" y="' + y + '" font-family="Arial" font-size="11.5" fill="#666">' + e(l) + '</text><text x="200" y="' + y + '" font-family="Arial" font-size="12" font-weight="bold" fill="#111">' + e(String(v).slice(0, 62)) + '</text>'; y += 26; });
    if (o.tbl) { y += 16; const cw = 535 / o.tbl.c.length; out += '<rect x="30" y="' + (y - 16) + '" width="535" height="24" fill="#e5e7eb"/>' + o.tbl.c.map((c, i) => '<text x="' + (38 + i * cw) + '" y="' + y + '" font-family="Arial" font-size="11" font-weight="bold" fill="#111">' + e(c) + '</text>').join(''); y += 24; o.tbl.r.forEach((row, j) => { out += '<line x1="30" x2="565" y1="' + (y + 7) + '" y2="' + (y + 7) + '" stroke="#e5e7eb"/>' + row.map((c, i) => '<text x="' + (38 + i * cw) + '" y="' + y + '" font-family="Arial" font-size="11" fill="#222">' + e(String(c).slice(0, Math.floor(cw / 6.2))) + '</text>').join(''); y += 24; }); }
    if (o.para) { y += 22; out += '<text x="30" y="' + y + '" font-family="Arial" font-size="12" fill="#111">' + e(o.para) + '</text>'; }
    if (edev) {
      out += '<line x1="30" x2="565" y1="700" y2="700" stroke="#ccc"/>';
      let x = 30; for (let i = 0; i < 70; i++) { const w2 = 1 + Math.floor(r() * 3); out += '<rect x="' + x + '" y="716" width="' + w2 + '" height="44" fill="#111"/>'; x += w2 + 1 + Math.floor(r() * 2); }
      out += '<text x="30" y="778" font-family="monospace" font-size="12" fill="#111">' + e(o.bc || ('Kontrol Kodu: ' + o.kc)) + '</text>';
      const fd = (p, q) => { const m = Math.max(Math.abs(p - 3), Math.abs(q - 3)); return m === 3 || m <= 1; };
      for (let a = 0; a < 21; a++) for (let b = 0; b < 21; b++) { const fin = (a < 7 && b < 7) || (a < 7 && b > 13) || (a > 13 && b < 7), on = fin ? fd(a > 13 ? a - 14 : a, b > 13 ? b - 14 : b) : r() > .5; if (on) out += '<rect x="' + (470 + b * 4) + '" y="' + (712 + a * 4) + '" width="4" height="4" fill="#111"/>'; }
      out += '<text x="30" y="798" font-family="Arial" font-size="9" fill="#555">' + (o.kc ? 'Bu belgenin aslına ilişkin sorgulama https://sonuc.osym.gov.tr/BelgeKontrol.aspx adresinden yapılabilir.' : 'Bu belgenin doğruluğu https://www.turkiye.gov.tr/belge-dogrulama adresinden veya e-Devlet Kapısı’na ait Barkodlu Belge Doğrulama uygulaması ile yandaki karekod okutularak kontrol edilebilir.') + '</text>';
    }
    out += '<text x="297" y="470" text-anchor="middle" font-family="Arial" font-size="64" font-weight="bold" fill="#c8102e" opacity=".07" transform="rotate(-28 297 470)">ÖRNEK BELGE</text><text x="30" y="826" font-family="Arial" font-size="9" fill="#999">DEMO – örnek veridir, gerçek bir belge değildir.</text>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' + out + '</svg>';
  };
  SG.thumb = (title, who) => 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160"><rect width="120" height="160" fill="#fff"/><rect width="120" height="22" fill="#1d4f91"/><text x="6" y="15" font-size="8" font-family="Arial" fill="#fff">' + e(String(title).slice(0, 24)) + '</text><text x="6" y="44" font-size="7" font-family="Arial" fill="#444">' + e(String(who).slice(0, 24)) + '</text><text x="6" y="152" font-size="7" font-family="Arial" fill="#999">DEMO</text></svg>');
  root.SG = SG; if (typeof module !== 'undefined') module.exports = SG;
})(typeof window !== 'undefined' ? window : globalThis);
