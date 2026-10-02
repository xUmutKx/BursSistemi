(function (root) {
  const SG = {};
  const FA = ['Ayşe', 'Elif', 'Zeynep', 'Selin', 'Merve', 'Ece', 'Büşra', 'Esra', 'Nur', 'Deniz'], MA = ['Mehmet', 'Can', 'Emre', 'Burak', 'Kerem', 'Ahmet', 'Mustafa', 'Ali', 'Onur', 'Yusuf'];
  const SY = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Aydın', 'Öztürk', 'Arslan', 'Koç', 'Polat'], AN = ['Fatma', 'Hatice', 'Emine', 'Sevim', 'Gülay', 'Zehra'], BA = ['Hüseyin', 'İbrahim', 'Murat', 'Kemal', 'Osman', 'Recep'];
  const IL = ['Süleymanpaşa', 'Çorlu', 'Çerkezköy', 'Malkara', 'Hayrabolu', 'Ergene'], UNI = ['Tekirdağ Namık Kemal Üniversitesi – Tıp Fakültesi', 'İstanbul Üniversitesi – Tıp Fakültesi', 'Trakya Üniversitesi – Tıp Fakültesi', 'Ankara Üniversitesi – Tıp Fakültesi'];
  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' TL';
  SG.SINIF = ['Hazırlık', '1. sınıf', '2. sınıf', '3. sınıf', '4. sınıf', '5. sınıf', '6. sınıf'];
  SG.make = (tc, rnd, pick) => {
    const sy = pick(SY), ad = pick([...FA, ...MA]) + ' ' + sy, sinif = pick(SG.SINIF), n = parseInt(sinif) || 1, first = sinif === 'Hazırlık' || n === 1;
    const tcn = () => String(rnd(10000000000, 99999999999)), sokak = () => pick(['Atatürk', 'Cumhuriyet', 'İnönü', 'Gazi', 'Çınar']) + ' Cad. No:' + rnd(1, 90) + ' D:' + rnd(1, 12), mah = () => pick(['Cumhuriyet', 'Yeni', 'Gündüz', 'Hürriyet']) + ' Mah. ';
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
      bakma: sibs.length ? sibs.join('\n') : 'Yok', aileMal: 'Baba tapu: ' + (tp ? tp + ' adet taşınmaz kaydı var (inceleyin)' : 'taşınmaz kaydı yok') + '\nBaba araç: ' + (ar ? 'Otomobil Fiat 2012 kayıtlı' : 'araç kaydı yok'), aileGelir: 'Ücret dışı gelir yok', ayri: ayri ? 'Anne-baba ayrı yaşıyor' : 'Anne-baba birlikte yaşıyor', _a: {}
    };
    return F;
  };
  const e = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  SG.svg = (title, who, tc, extra) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 560" width="420" height="560"><rect width="420" height="560" fill="#fff"/><rect width="420" height="70" fill="#b4121f"/><text x="20" y="43" font-family="Arial" font-size="19" font-weight="bold" fill="#fff">' + e(title) + '</text>'
    + '<text x="20" y="110" font-family="Arial" font-size="12" fill="#888">DEMO BELGE – gerçek bir belge değildir</text><text x="20" y="160" font-family="Arial" font-size="15" fill="#111">Ad Soyad : ' + e(who) + '</text><text x="20" y="190" font-family="Arial" font-size="15" fill="#111">T.C. Kimlik No : ' + e(tc) + '</text>'
    + '<text x="20" y="220" font-family="Arial" font-size="15" fill="#111">Belge Tarihi : ' + new Date().toLocaleDateString('tr-TR') + '</text>' + (extra || []).map((t, i) => '<text x="20" y="' + (260 + i * 26) + '" font-family="Arial" font-size="14" fill="#333">' + e(t) + '</text>').join('')
    + '<rect x="20" y="470" width="380" height="50" fill="none" stroke="#bbb" stroke-dasharray="4"/><text x="32" y="501" font-family="monospace" font-size="14" fill="#666">Barkod: DEMO-' + e(String(tc).slice(-6)) + '</text></svg>';
  SG.thumb = (title, who) => 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160"><rect width="120" height="160" fill="#fff"/><rect width="120" height="22" fill="#b4121f"/><text x="6" y="15" font-size="8" font-family="Arial" fill="#fff">' + e(String(title).slice(0, 24)) + '</text><text x="6" y="44" font-size="7" font-family="Arial" fill="#444">' + e(String(who).slice(0, 24)) + '</text><text x="6" y="152" font-size="7" font-family="Arial" fill="#999">DEMO</text></svg>');
  root.SG = SG; if (typeof module !== 'undefined') module.exports = SG;
})(typeof window !== 'undefined' ? window : globalThis);
