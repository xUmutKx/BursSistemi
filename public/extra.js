'use strict';
/* Yardım (?), dönem, ek belge/soru yönetimi, OCR deneme, logo ×10 mod geçişi.
   app.js'den önce yüklenir; S, E, $, api, toast, L, readFile vb. çağrı anında çözülür. */

// ---------- Logo ×10 : demo <-> gerçek görünüm ----------
let _lt = 0, _ln = 0;
function logoTap(el) {
  if (window.LOCKED) return;
  clearTimeout(_lt); _ln++; _lt = setTimeout(() => { _ln = 0; }, 1800);
  if (el) { el.classList.remove('lpulse'); void el.offsetWidth; el.classList.add('lpulse'); }
  if (_ln >= 10) { _ln = 0; flipMode(); }
}

// ---------- Yardım içerikleri ----------
const li = a => '<ul>' + a.map(x => '<li>' + x + '</li>').join('') + '</ul>';
const HELP_ADMIN = () => [
  ['genel', 'Panele genel bakış', li([
    'Üstteki dört kart: toplam başvuru, incelenecek (Beklemede), kurala göre burs alacak ve elenen sayısı.',
    'Sekmeler: <b>Başvurular</b> (liste), <b>Şartlar ve Puanlama</b> (eleme kuralı, kontenjan, ağırlıklar), <b>Dönem</b> (başvuru tarihleri), <b>Ek Belge ve Sorular</b> (yeni belge/soru ekleme, OCR kuralları).',
    'Sağ üstte: <b>Yenile</b>, <b>Excel / CSV</b> dışa aktarma, <b>Tüm verileri sil</b>. Liste 10 saniyede bir kendini yeniler.',
    'Üst çubuktaki <b>?</b> simgesi her sayfada açıktır ve bulunduğunuz sekmeye ait bölüme götürür.'])],
  ['liste', 'Başvurular sekmesi', li([
    '<b>Filtre ve sıralama</b> paneli: arama (isim, TCKN, fakülte), durum, sınıf, gelir/not/kardeş kaydırıcıları, ev-araç sayısı, “belgesi eksik”, “anne/baba vefat”, “yurt/kira”, “engelli”.',
    'Tablo başlıklarına tıklayarak sıralayabilirsiniz. <b>Sonuç</b> sütunu (Burs / Yedek / Elendi) “Şartlar ve Puanlama” ayarlarına göre otomatik hesaplanır.',
    '<b>İncele</b> düğmesi başvuru ayrıntısını açar.'])],
  ['detay', 'Başvuru ayrıntısı', li([
    'Durum: <i>Taslak, Beklemede, Eksik belge, Onaylandı, Reddedildi</i> düğmelerinden biri seçilir. <b>Not</b> kutusuna yazdığınız metni öğrenci görür.',
    'Belgeler: küçük resme tıklayınca önizleme açılır; kırmızı satırlar sistemin kabul etmediği nedenleri, yeşiller doğrulananları gösterir. Önizlemede okunan metin (OCR) de vardır.',
    '<b>Şifreyi sıfırla</b>: öğrencinin şifresi görüntülenmez; yeni geçici şifre üretilir ve yalnızca bir kez gösterilir, öğrenciye siz iletirsiniz.',
    '<b>Başvuruyu sil</b> kayıt ve yüklenen dosyaları kalıcı siler.'])],
  ['sart', 'Şartlar ve Puanlama', li([
    '<b>Eleme şartları</b>: işaretlediğiniz şartı sağlamayan başvuru “Elendi” olur (ör. toplam gelir üst sınırı, belgeler tam olsun).',
    '<b>Burs kontenjanı</b>: puana göre ilk N kişi “Burs”, kalanlar “Yedek” olur.',
    '<b>Puanlama ölçütleri</b>: her ölçütün açma/kapama kutusu, ağırlığı ve tavan değeri vardır; seçilenler ağırlığa oranlanıp 0–100 puana çevrilir.',
    'Değişiklikler <b>Kaydet</b> ile kalıcı olur. <b>Burs listesini onayla</b> kontenjan içindeki “Burs” sonuçlularını toplu “Onaylandı” yapar.'])],
  ['donem', 'Dönem ve başvuru takvimi', li([
    'Dönem adı, başvuru başlangıç ve bitiş tarihi girilir. Varsayılan: <b>2027 Eylül</b> (tarihleri Tabip Odası duyurusuna göre güncelleyin).',
    '“Tarihlere uyulsun” açıkken öğrenciler tarih dışında <b>Başvuruyu Gönder</b> yapamaz; ama önceden kayıt olup bilgi ve belgelerini hazırlayabilir. Kapalıysa her zaman gönderebilir.',
    '“Tarih dışı mesajı” doluysa öğrenciye o metin gösterilir.',
    '<b>Yeni dönem için</b>: önce Excel’i indirin, sonra “Tüm verileri sil” ile temizleyip yeni tarihleri girin.'])],
  ['belge', 'Ek belge ekleme (yeni başvuru adımı)', li([
    '<b>Ek Belge ve Sorular</b> → <b>Yeni belge</b>: ad, kime ait (öğrenci / anne / baba / aile veya birkaçı — seçilen her kişi için ayrı kutu açılır), kategori, açıklama, e-Devlet bağlantısı, zorunlu/isteğe bağlı, “Yok” düğmesi.',
    'Kaydettiğiniz belge anında tüm öğrencilerin <b>Belgeler</b> adımında çıkar. Zorunluysa gönderim için gerekir (daha önce gönderilmiş başvurular da eksik görünebilir).',
    'Silerseniz o belge öğrencilerden kalkar.'])],
  ['ocr', 'OCR (okuma) kuralları — ne okunacak, ne doğru sayılacak', li([
    'Belge yüklenince metni okunur ve kurallar sırayla denetlenir. Harf büyüklüğü ve Türkçe karakter (İ/I, Ş/S…) fark etmez.',
    '<b>Hiç okuma, sadece yükle</b>: fotoğraf gibi okunamayan belgeler için.',
    '<b>Kişi adı / T.C. no görünmeli</b>: belgedeki ad, kutunun sahibiyle eşleşmezse reddedilir.',
    '<b>Hepsi geçmeli</b> / <b>En az biri geçmeli</b> / <b>Geçmemeli</b>: virgülle ayrılmış anahtar kelimeler. “En az biri” aynı zamanda belgenin otomatik tanınmasını sağlar.',
    '<b>En fazla kaç günlük</b>: PDF’deki tarih bu süreden eskiyse reddedilir (ekran görüntüsünde tarih aranmaz). <b>En az karakter</b>: boş/okunamayan belgeyi eler.',
    '<b>Otomatik doldur</b>: belgede “Etiket: değer” biçiminde yazan değeri seçtiğiniz soruya yazar.',
    '<b>Dene</b> düğmesi: örnek metin yazarak ya da dosya yükleyerek kuralların sonucunu kaydetmeden görürsünüz.',
    'İpucu: kelimeler kısa ve ayırt edici olsun; “belge” gibi genel kelimeler başka belgelerin tanınmasını bozabilir.'])],
  ['soru', 'Ek sorular', li([
    '<b>Yeni soru</b>: metin, tür (kısa/uzun metin, Evet-Hayır, liste), bölüm (I–IV) ve zorunlu mu.',
    'Soru Başvuru Formu’nda seçtiğiniz bölümde çıkar, ayrıntı ekranında ve Excel’de görünür. Silinen sorunun eski cevapları saklanır ama görünmez.'])],
  ['disa', 'Dışa aktarma', li([
    '<b>Excel</b> varsayılandır; yanındaki okla CSV seçilir. Filtre uygulanmışsa yalnızca görünen kayıtlar indirilir.',
    'Dosyada hesap bilgisi, puan, sonuç ve tüm form cevapları vardır.'])]
];
const HELP_ADMIN_SEC = () => window.DEMO ? [['guvenlik', 'Demo bilgileri', li([
  '<b>Örnek veri</b> sahte başvurular ekler, <b>Demo sil</b> bunları siler. Demo kayıtlar “DEMO” etiketiyle görünür.',
  'Giriş ekranındaki logoya <b>10 kez</b> dokunursanız gerçek site görünümüne geçilir (demo etiketleri ve örnek veri yok); tekrar 10 kez dokunursanız demoya dönülür.',
  'Bu sürüm yalnızca denemedir; gerçek kullanımda veriler sunucuda saklanır.'])]] : [['guvenlik', 'Güvenlik ve bakım', li([
  'Yönetici şifresi sunucuda <code>ADMIN_PW</code> ile belirlenir. <code>MOD=canli</code> ile başlatılırsa demo özellikleri tamamen kapanır ve şifre yoksa rastgele üretilir (<code>data/admin-sifre.txt</code>).',
  'Oturum 14 gündür. 7 hatalı girişten sonra o kullanıcı 10 dakika kilitlenir. Yalnızca PDF/JPG/PNG/WEBP yüklenebilir.',
  'Veriler <code>data/</code> klasöründedir; her gün <code>data/yedek/</code> içine yedeklenir (son 14 gün). Güncellemede yeni zip’i aynı klasöre açın, <code>data/</code> silinmez.',
  'İnternete açacaksanız HTTPS veren bir ters vekil (Caddy, Nginx) arkasında çalıştırın.'])]];
const HELP_STUDENT = [
  ['akis', 'Başvuru nasıl ilerler?', li(['Adımlar sırayla ilerler: <b>Şartlar → Kimlik → Belgeler → Başvuru Formu → Özet / Gönder</b>. Önceki adım bitmeden sonrakine geçilemez.', 'Çalışmanız otomatik kaydedilir; çıkıp sonra devam edebilirsiniz.'])],
  ['kimlik', 'Kimlik adımı', li(['Ad-soyad (son kelime soyad), T.C. no, sınıf; anne ve baba için ad, T.C. no ve hayatta olup olmadıkları.', 'Bu bilgiler belgelerin sizin ve ailenize ait olduğunu doğrulamak için kullanılır.'])],
  ['belge', 'Belgeler adımı', li(['Tüm belgeleri birlikte seçebilirsiniz; türü ve kime ait olduğu otomatik tanınır. Her belgede ilgili kişinin adı veya T.C. no görünmelidir.', 'e-Devlet PDF’leri son 30 gün içinde alınmış olmalıdır.', 'Kaydı olmayan belgelerde (tapu, araç, 4A/4B/4C…) “kayıt bulunamadı” ekranını yükleyin ya da varsa <b>Yok</b> düğmesini kullanın.', 'Kırmızı “SORUNLU” belgenin altındaki nedeni okuyup düzeltilmiş dosyayı yükleyin.'])],
  ['form', 'Başvuru formu', li(['Belgelerden okunan bilgiler otomatik dolar (mor etiketli); kontrol edip eksikleri tamamlayın. <b>*</b> zorunludur.', 'Sizin yazdığınız cevapların üzerine otomatik okuma yazmaz.'])],
  ['gonder', 'Özet ve gönderim', li(['Eksik belge veya cevap varsa burada listelenir. Her şey tamamsa <b>Başvuruyu Onaya Gönder</b> açılır.', 'Gönderimden sonra durumunuzu ve yönetici notunu bu sayfadan izlersiniz.', 'Başvurular yalnızca dönem tarihleri içinde gönderilebilir.'])]
];
const HELP_LOGIN = [['giris', 'Giriş', li(['Kullanıcı adınız T.C. kimlik numaranızdır. İlk kez geliyorsanız <b>Kayıt Olun</b>.', 'Şifrenizi unuttuysanız Tabip Odası ile iletişime geçin; yönetici yeni geçici şifre verebilir.'])]];
const CONTACT = '<p class="mt-3 text-xs"><b>Tekirdağ Tabip Odası</b> · Tel: +90 282 261 89 81 · Mobil: +90 530 943 34 97 · tekirdagtabip@gmail.com · Ertuğrul Mah. Rakoczi Cad. Arca Apt. C Blok No:42 D:2 Süleymanpaşa/Tekirdağ · <a href="https://www.tto.org.tr/ogrenci-bursu" target="_blank" rel="noopener" class="underline">tto.org.tr/ogrenci-bursu</a></p>';

function helpCtx() {
  if (!S.user) return ['login', 'giris'];
  if (S.user.role === 'admin') return ['admin', { list: 'liste', set: 'sart', term: 'donem', cfg: 'belge' }[S.adm.view] || 'genel'];
  return ['student', { terms: 'akis', id: 'kimlik', docs: 'belge', form: 'form', sum: 'gonder' }[S.tab] || 'akis'];
}
function helpOpen(sec) {
  const [kind, auto] = helpCtx(), secs = kind === 'admin' ? [...HELP_ADMIN(), ...HELP_ADMIN_SEC()] : kind === 'student' ? HELP_STUDENT : HELP_LOGIN;
  const title = kind === 'admin' ? 'Yönetici Rehberi' : kind === 'student' ? 'Başvuru Rehberi' : 'Yardım', want = sec || auto;
  let h = $('#hlp'); if (!h) { h = document.createElement('div'); h.id = 'hlp'; h.className = 'fixed inset-0 z-[95] bg-black/70 overflow-auto p-3 sm:p-6'; h.onclick = e => { if (e.target === h) helpClose(); }; document.body.appendChild(h); }
  h.innerHTML = `<div class="card max-w-3xl mx-auto p-5 sm:p-6 fade-in hlp" role="dialog" aria-modal="true" aria-label="${title}"><div class="flex justify-between items-start gap-3 mb-3"><div><h3 class="text-xl font-bold text-gray-900 dark:text-white"><span class="ms text-primary-500 mr-2">help</span>${title}</h3><p class="text-xs text-gray-500 mt-1">Bu pencereye üst çubuktaki <b>?</b> simgesinden her zaman ulaşabilirsiniz.</p></div><button class="btn" onclick="helpClose()" aria-label="Kapat"><span class="ms">close</span></button></div>
  <div class="flex flex-wrap gap-1.5 mb-3">${secs.map(([id, t]) => `<span class="chip ${id === want ? 'on' : ''}" onclick="helpGo('${id}')">${t}</span>`).join('')}</div>
  <div class="space-y-4">${secs.map(([id, t, b]) => `<section id="h_${id}" class="${id === want ? 'hlp-cur' : ''}"><h4 class="font-bold text-sm text-gray-900 dark:text-white mb-1">${t}</h4><div class="hlp-b text-sm text-gray-700 dark:text-gray-300">${b}</div></section>`).join('')}</div>${CONTACT}
  <div class="mt-4 text-right"><button class="btn-p" onclick="helpClose()">Anladım</button></div></div>`;
  h.classList.remove('hidden');
  setTimeout(() => { const e = $('#h_' + want); if (e) e.scrollIntoView({ block: 'start' }); }, 30);
}
function helpGo(id) { document.querySelectorAll('#hlp .chip').forEach(c => c.classList.toggle('on', c.getAttribute('onclick') === `helpGo('${id}')`)); document.querySelectorAll('#hlp section').forEach(s => s.classList.toggle('hlp-cur', s.id === 'h_' + id)); const e = $('#h_' + id); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function helpClose() { const h = $('#hlp'); if (h) h.classList.add('hidden'); try { if (S.user && S.user.role === 'admin') localStorage.tto_help_admin = '2'; } catch (e) {} }
function helpFirstRun() { try { if (S.user && S.user.role === 'admin' && localStorage.tto_help_admin !== '2') setTimeout(() => helpOpen('genel'), 400); } catch (e) {} }

// ---------- Dönem durumu (öğrenci/giriş) ----------
function termInfo() {
  const t = S.term; if (!t) return null; const st = L.termState(t);
  return { t, st, name: t.name, range: [t.open, t.close].some(Boolean) ? (L.fmtD(t.open) || '…') + ' – ' + (L.fmtD(t.close) || '…') : '' };
}
function termBanner(forStudent) {
  const i = termInfo(); if (!i) return '';
  const demoU = window.DEMO && forStudent, s = i.st.s, cls = s === 'open' ? 'ok' : 'warn';
  let msg = s === 'open' ? (i.range ? 'Başvurular açık · ' + i.range : 'Başvurular açık') : s === 'before' ? 'Başvurular ' + L.fmtD(i.t.open) + ' tarihinde açılacak. Şimdiden kayıt olup bilgi ve belgelerinizi hazırlayabilirsiniz; gönderim dönem açılınca yapılır.' : 'Başvuru dönemi sona erdi (' + i.range + ').';
  if (s !== 'open' && i.t.msg) msg = i.t.msg;
  if (demoU && s !== 'open') msg += ' (Demo: dönem kontrolü uygulanmaz.)';
  return `<div class="gh ${cls} !flex mb-4" style="display:flex"><span class="ms">${s === 'open' ? 'event_available' : 'event'}</span><span><b>${E(i.name)}</b> — ${E(msg)}</span></div>`;
}
const termBlocked = () => { const i = termInfo(); return !!(i && i.st.s !== 'open' && !(window.DEMO && S.demoUser)); };

// ---------- Yönetici sekmeleri ----------
function admChips() {
  const v = S.adm.view, c = (k, ic, t) => `<span class="chip ${v === k ? 'on' : ''}" onclick="admView_('${k}')"><span class="ms mr-1">${ic}</span>${t}</span>`;
  return c('list', 'table_rows', 'Başvurular') + c('set', 'tune', 'Şartlar ve Puanlama') + c('term', 'event', 'Dönem') + c('cfg', 'extension', 'Ek Belge ve Sorular');
}
function admView_(k) { S.adm.view = k; $('#app').innerHTML = vAdmin(); if (k === 'list') admTable(); }
function admView() { const v = S.adm.view; return v === 'set' ? vSet() : v === 'term' ? vTerm() : v === 'cfg' ? vCfg() : vList(); }
const hb = (t, k) => `<button class="hq" onclick="helpOpen('${k}')" aria-label="Bu bölüm için yardım" title="${t}"><span class="ms">help</span></button>`;

function vTerm() {
  const s = S.adm.set, t = s.term, i = L.termState(t), lab = { open: 'Şu an başvurular AÇIK', before: 'Şu an başvurular HENÜZ AÇILMADI', closed: 'Şu an başvuru dönemi SONA ERDİ' }[i.s];
  return `<div class="card p-5 max-w-3xl"><h3 class="font-bold text-gray-900 dark:text-white mb-1"><span class="ms text-primary-500 mr-1.5">event</span>Dönem ve başvuru takvimi ${hb('Dönem yardımı', 'donem')}</h3>
  <p class="text-xs text-gray-500 mb-4">${t.enforce ? lab : 'Tarih kontrolü kapalı: öğrenciler her zaman gönderebilir'}.</p>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><div class="sm:col-span-3"><label class="lbl">Dönem adı</label><input class="inp" value="${E(t.name)}" maxlength="80" oninput="S.adm.set.term.name=this.value"></div>
  <div><label class="lbl">Başvuru başlangıcı</label><input type="date" class="inp" value="${E(t.open)}" onchange="S.adm.set.term.open=this.value"></div><div><label class="lbl">Başvuru bitişi (son gün dahil)</label><input type="date" class="inp" value="${E(t.close)}" onchange="S.adm.set.term.close=this.value"></div>
  <label class="flex items-center gap-2 text-sm cursor-pointer self-end pb-2"><input type="checkbox" ${t.enforce ? 'checked' : ''} onchange="S.adm.set.term.enforce=this.checked"> Tarihlere uyulsun</label>
  <div class="sm:col-span-3"><label class="lbl">Tarih dışında öğrenciye gösterilecek mesaj (boşsa otomatik)</label><textarea class="inp" rows="2" maxlength="300" oninput="S.adm.set.term.msg=this.value">${E(t.msg)}</textarea></div></div>
  <div class="mt-4 flex gap-2"><button class="btn-p" onclick="admSave()"><span class="ms">save</span> Kaydet</button></div></div>`;
}

// ---- Ek belge / soru listesi ----
const WLAB = { s: 'Öğrenci', m: 'Anne', f: 'Baba', a: 'Aile', mf: 'Anne ve baba', sm: 'Öğrenci ve anne', sf: 'Öğrenci ve baba', smf: 'Öğrenci, anne ve baba' };
const TLAB = { t: 'Kısa metin', a: 'Uzun metin', y: 'Evet / Hayır', s: 'Liste' }, SLAB = { 1: 'I – Kimlik ve iletişim', 2: 'II – Eğitim', 3: 'III – Sosyal ve ekonomik', 4: 'IV – Aile' };
function ocrSum(o) {
  if (o.off) return 'Okunmaz, yalnızca yüklenir'; const a = [];
  if (o.name) a.push('kişi adı/T.C. görünmeli'); if ((o.all || []).length) a.push('hepsi: ' + o.all.join(', ')); if ((o.any || []).length) a.push('en az biri: ' + o.any.join(', ')); if ((o.deny || []).length) a.push('geçmemeli: ' + o.deny.join(', '));
  if (o.maxAge) a.push('en çok ' + o.maxAge + ' günlük'); if (o.minChars) a.push('en az ' + o.minChars + ' karakter'); if ((o.fields || []).length) a.push(o.fields.length + ' alan otomatik dolar');
  return a.join(' · ') || 'Ek kural yok';
}
function vCfg() {
  const c = S.adm.set.custom, empty = t => `<p class="text-sm text-gray-500 py-3">${t}</p>`;
  return `<div class="grid grid-cols-1 gap-5 mdf2"><div class="card p-5"><div class="flex flex-wrap items-center justify-between gap-2 mb-1"><h3 class="font-bold text-gray-900 dark:text-white"><span class="ms text-primary-500 mr-1.5">note_add</span>Ek belgeler (yeni başvuru adımı) ${hb('Ek belge yardımı', 'belge')}</h3><button class="btn-p" onclick="edDoc()"><span class="ms">add</span> Yeni belge</button></div>
   <p class="text-xs text-gray-500 mb-2">Burada eklediğiniz belgeler öğrencilerin Belgeler adımında hemen görünür; yüklenince okunur ve kurallarınıza göre denetlenir.</p>
   ${c.docs.length ? c.docs.map(d => `<div class="cfgrow"><div class="min-w-0"><b class="text-sm text-gray-900 dark:text-white">${E(d.t)}</b> <span class="text-[11px] text-gray-500">· ${WLAB[d.w]} · ${E(d.cat)} · ${d.req === 'opt' ? 'isteğe bağlı' : 'zorunlu'}${d.none ? ' · “Yok” düğmeli' : ''}</span><div class="text-[11px] text-gray-500 truncate">OCR: ${E(ocrSum(d.ocr))}</div></div><div class="flex gap-1.5 shrink-0"><button class="btn" onclick="cfgTest('${d.k}')"><span class="ms">science</span> Dene</button><button class="btn" onclick="edDoc('${d.k}')"><span class="ms">edit</span></button><button class="btn text-red-600" onclick="edDel('docs','${d.k}')"><span class="ms">delete</span></button></div></div>`).join('') : empty('Henüz ek belge yok.')}</div>
  <div class="card p-5"><div class="flex flex-wrap items-center justify-between gap-2 mb-1"><h3 class="font-bold text-gray-900 dark:text-white"><span class="ms text-primary-500 mr-1.5">quiz</span>Ek sorular ${hb('Ek soru yardımı', 'soru')}</h3><button class="btn-p" onclick="edQ()"><span class="ms">add</span> Yeni soru</button></div>
   ${c.qs.length ? c.qs.map(q => `<div class="cfgrow"><div class="min-w-0"><b class="text-sm text-gray-900 dark:text-white">${E(q.t)}</b> <span class="text-[11px] text-gray-500">· ${TLAB[q.type]} · ${SLAB[q.sec]} · ${q.req ? 'zorunlu' : 'isteğe bağlı'}</span></div><div class="flex gap-1.5 shrink-0"><button class="btn" onclick="edQ('${q.id}')"><span class="ms">edit</span></button><button class="btn text-red-600" onclick="edDel('qs','${q.id}')"><span class="ms">delete</span></button></div></div>`).join('') : empty('Henüz ek soru yok.')}</div></div><div id="cfgm"></div>`;
}
const rid = () => Math.random().toString(36).replace(/[^a-z0-9]/g, '').slice(2, 8).padEnd(6, 'a');
async function edDel(g, id) {
  if (!confirm(g === 'docs' ? 'Bu belge öğrencilerden kaldırılsın mı?' : 'Bu soru formdan kaldırılsın mı?')) return;
  const c = S.adm.set.custom; c[g] = c[g].filter(x => (x.k || x.id) !== id); if (await admSave()) { S.adm.view = 'cfg'; $('#app').innerHTML = vAdmin(); }
}
const fld_ = (l, i, extra) => `<div ${extra || ''}><label class="lbl">${l}</label>${i}</div>`;
const val_ = id => { const e = document.getElementById(id); return e ? e.value : ''; }, chk_ = id => { const e = document.getElementById(id); return !!(e && e.checked); };
function edDoc(k) {
  const d = k ? JSON.parse(JSON.stringify(S.adm.set.custom.docs.find(x => x.k === k))) : { k: 'x_' + rid(), t: '', w: 's', cat: 'Ek Belgeler', d: '', l: '', h: '', req: 'always', none: false, icon: 'description', ocr: { off: false, name: true, any: [], all: [], deny: [], maxAge: 0, minChars: 0, fields: [] } };
  S.adm.ed = { type: 'doc', isNew: !k, d }; edRender();
}
function edCollect() {
  const e = S.adm.ed; if (!e || e.type !== 'doc' || !$('#ed_t')) return; const d = e.d, o = d.ocr, lst = id => val_(id).split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  d.t = val_('ed_t').trim(); d.w = val_('ed_w'); d.cat = val_('ed_cat').trim() || 'Ek Belgeler'; d.d = val_('ed_d').trim(); d.l = val_('ed_l').trim(); d.h = val_('ed_h').trim(); d.req = val_('ed_req'); d.none = chk_('ed_none');
  o.off = chk_('ed_off'); o.name = chk_('ed_name'); o.all = lst('ed_all'); o.any = lst('ed_any'); o.deny = lst('ed_deny'); o.maxAge = +val_('ed_age') || 0; o.minChars = +val_('ed_min') || 0;
  o.fields = o.fields.map((f, i) => ({ q: val_('edf_q' + i), after: val_('edf_a' + i).trim() }));
}
function edRender() {
  const e = S.adm.ed; if (!e) return;
  if (e.type === 'q') return edRenderQ();
  const d = e.d, o = d.ocr, qs = S.adm.set.custom.qs, cats = [...new Set([...L.D.map(x => x.cat), 'Ek Belgeler'])];
  const sel = (id, v, arr) => `<select id="${id}" class="inp">${arr.map(([a, b]) => `<option value="${a}" ${String(v) === String(a) ? 'selected' : ''}>${b}</option>`).join('')}</select>`;
  $('#cfgm').innerHTML = `<div class="fixed inset-0 z-[92] bg-black/70 overflow-auto p-3 sm:p-6" onclick="if(event.target===this)edClose()"><div class="card max-w-3xl mx-auto p-5 sm:p-6 fade-in">
  <div class="flex justify-between items-start mb-3"><h3 class="text-lg font-bold text-gray-900 dark:text-white">${e.isNew ? 'Yeni belge' : 'Belgeyi düzenle'} ${hb('OCR yardımı', 'ocr')}</h3><button class="btn" onclick="edClose()"><span class="ms">close</span></button></div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${fld_('Belge adı <span class="req">*</span>', `<input id="ed_t" class="inp" maxlength="80" value="${E(d.t)}" placeholder="Ör: Burs Taahhütnamesi">`, 'class="sm:col-span-2"')}
   ${fld_('Kime ait?', sel('ed_w', d.w, Object.entries(WLAB)))}${fld_('Kategori', `<input id="ed_cat" class="inp" list="ed_cats" maxlength="40" value="${E(d.cat)}"><datalist id="ed_cats">${cats.map(c => `<option value="${E(c)}">`).join('')}</datalist>`)}
   ${fld_('Açıklama (öğrenci görür)', `<textarea id="ed_d" class="inp" rows="2" maxlength="300">${E(d.d)}</textarea>`, 'class="sm:col-span-2"')}
   ${fld_('e-Devlet / indirme bağlantısı (isteğe bağlı)', `<input id="ed_l" class="inp" maxlength="300" value="${E(d.l)}" placeholder="https://…">`)}${fld_('Nasıl alınır? (kısa not)', `<input id="ed_h" class="inp" maxlength="200" value="${E(d.h)}">`)}
   ${fld_('Zorunluluk', sel('ed_req', d.req, [['always', 'Zorunlu'], ['opt', 'İsteğe bağlı']]))}<label class="flex items-center gap-2 text-sm cursor-pointer self-end pb-2"><input id="ed_none" type="checkbox" ${d.none ? 'checked' : ''}> “Yok” düğmesi olsun (belge yoksa beyan edilebilsin)</label></div>
  <h4 class="text-sm font-bold mt-5 mb-1 pb-1 border-b border-gray-100 dark:border-amoled-border"><span class="ms text-primary-500 mr-1">document_scanner</span>OCR — okuma ve doğrulama kuralları</h4>
  <label class="flex items-center gap-2 text-sm cursor-pointer my-2"><input id="ed_off" type="checkbox" ${o.off ? 'checked' : ''} onchange="edCollect();edRender()"> Okuma yapma, yalnızca yüklensin (fotoğraf vb.)</label>
  ${o.off ? '' : `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><label class="flex items-center gap-2 text-sm cursor-pointer sm:col-span-2"><input id="ed_name" type="checkbox" ${o.name ? 'checked' : ''}> Belgede kişinin adı veya T.C. no görünmeli (sahibi doğrulansın)</label>
   ${fld_('Hepsi geçmeli (virgülle)', `<textarea id="ed_all" class="inp" rows="2" placeholder="Ör: taahhüt, imza">${E(o.all.join(', '))}</textarea>`)}${fld_('En az biri geçmeli (virgülle) — otomatik tanıma da bunlarla', `<textarea id="ed_any" class="inp" rows="2" placeholder="Ör: taahhütname, beyan">${E(o.any.join(', '))}</textarea>`)}
   ${fld_('Geçmemeli (varsa belge reddedilir)', `<textarea id="ed_deny" class="inp" rows="2" placeholder="Ör: örnek, iptal">${E(o.deny.join(', '))}</textarea>`)}
   <div class="grid grid-cols-2 gap-3">${fld_('En fazla kaç günlük (PDF) 0=sınırsız', `<input id="ed_age" type="number" min="0" max="3650" class="inp" value="${o.maxAge || 0}">`)}${fld_('En az karakter 0=kontrol yok', `<input id="ed_min" type="number" min="0" max="5000" class="inp" value="${o.minChars || 0}">`)}</div></div>
   <div class="mt-3"><div class="text-sm font-bold mb-1">Otomatik doldurma <span class="font-normal text-gray-500 text-xs">— belgede “Etiket: değer” yazıyorsa değeri soruya yazar</span></div>
   ${o.fields.map((f, i) => `<div class="flex flex-wrap gap-2 mb-2 items-center"><select id="edf_q${i}" class="inp !w-auto flex-1 min-w-[10rem]">${[...qs.map(q => [q.id, q.t])].map(([a, b]) => `<option value="${a}" ${f.q === a ? 'selected' : ''}>${E(b)}</option>`).join('')}</select><input id="edf_a${i}" class="inp !w-auto flex-1 min-w-[10rem]" maxlength="60" placeholder="Belgedeki etiket (Ör: Telefon)" value="${E(f.after)}"><button class="btn text-red-600" onclick="edCollect();S.adm.ed.d.ocr.fields.splice(${i},1);edRender()"><span class="ms">delete</span></button></div>`).join('')}
   ${qs.length ? `<button class="btn" onclick="edCollect();S.adm.ed.d.ocr.fields.push({q:S.adm.set.custom.qs[0].id,after:''});edRender()"><span class="ms">add</span> Alan ekle</button>` : '<p class="text-xs text-gray-500">Önce “Ek sorular” bölümünden bir soru ekleyin.</p>'}</div>`}
  <div class="mt-5 flex flex-wrap justify-between gap-2"><button class="btn" onclick="edCollect();cfgTest(null)"><span class="ms">science</span> Kaydetmeden dene</button><div class="flex gap-2"><button class="btn" onclick="edClose()">Vazgeç</button><button class="btn-p" onclick="edSaveDoc()"><span class="ms">save</span> Kaydet</button></div></div></div></div>`;
}
function edClose() { S.adm.ed = null; const m = $('#cfgm'); if (m) m.innerHTML = ''; }
async function edSaveDoc() {
  edCollect(); const d = S.adm.ed.d; if (!d.t) return toast('Belge adı girin');
  if (d.l && !/^https?:\/\//.test(d.l)) return toast('Bağlantı http:// veya https:// ile başlamalı');
  const c = S.adm.set.custom, i = c.docs.findIndex(x => x.k === d.k); if (i < 0) c.docs.push(d); else c.docs[i] = d;
  if (!(await admSave())) return; edClose(); S.adm.view = 'cfg'; $('#app').innerHTML = vAdmin();
}
// ---- soru editörü ----
function edQ(id) {
  const q = id ? JSON.parse(JSON.stringify(S.adm.set.custom.qs.find(x => x.id === id))) : { id: rid(), t: '', type: 't', opts: [], req: false, sec: 3 };
  S.adm.ed = { type: 'q', isNew: !id, q }; edRender();
}
function edRenderQ() {
  const q = S.adm.ed.q, sel = (id, v, arr, fn) => `<select id="${id}" class="inp" ${fn ? `onchange="${fn}"` : ''}>${arr.map(([a, b]) => `<option value="${a}" ${String(v) === String(a) ? 'selected' : ''}>${b}</option>`).join('')}</select>`;
  $('#cfgm').innerHTML = `<div class="fixed inset-0 z-[92] bg-black/70 overflow-auto p-3 sm:p-6" onclick="if(event.target===this)edClose()"><div class="card max-w-xl mx-auto p-5 sm:p-6 fade-in"><div class="flex justify-between items-start mb-3"><h3 class="text-lg font-bold text-gray-900 dark:text-white">${S.adm.ed.isNew ? 'Yeni soru' : 'Soruyu düzenle'}</h3><button class="btn" onclick="edClose()"><span class="ms">close</span></button></div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${fld_('Soru metni <span class="req">*</span>', `<input id="eq_t" class="inp" maxlength="80" value="${E(q.t)}">`, 'class="sm:col-span-2"')}${fld_('Tür', sel('eq_type', q.type, Object.entries(TLAB), "edQc();edRenderQ()"))}${fld_('Formdaki bölüm', sel('eq_sec', q.sec, Object.entries(SLAB)))}
  ${q.type === 's' ? fld_('Seçenekler (virgülle)', `<input id="eq_opts" class="inp" value="${E(q.opts.join(', '))}" placeholder="Ör: Var, Yok, Bilmiyorum">`, 'class="sm:col-span-2"') : ''}
  <label class="flex items-center gap-2 text-sm cursor-pointer sm:col-span-2"><input id="eq_req" type="checkbox" ${q.req ? 'checked' : ''}> Zorunlu (boşsa başvuru gönderilemez)</label></div>
  <div class="mt-5 flex justify-end gap-2"><button class="btn" onclick="edClose()">Vazgeç</button><button class="btn-p" onclick="edSaveQ()"><span class="ms">save</span> Kaydet</button></div></div></div>`;
}
function edQc() { const q = S.adm.ed.q; q.t = val_('eq_t'); q.type = val_('eq_type'); q.sec = +val_('eq_sec'); q.req = chk_('eq_req'); if ($('#eq_opts')) q.opts = val_('eq_opts').split(',').map(x => x.trim()).filter(Boolean); }
async function edSaveQ() {
  edQc(); const q = S.adm.ed.q; if (!q.t.trim()) return toast('Soru metni girin'); if (q.type === 's' && q.opts.length < 2) return toast('Liste için en az iki seçenek yazın');
  const c = S.adm.set.custom, i = c.qs.findIndex(x => x.id === q.id); if (i < 0) c.qs.push(q); else c.qs[i] = q;
  if (!(await admSave())) return; edClose(); S.adm.view = 'cfg'; $('#app').innerHTML = vAdmin();
}

// ---- OCR deneme aracı ----
function cfgTest(k) {
  const draft = !k; let d;
  if (draft) { edCollect(); d = S.adm.ed.d; } else d = S.adm.set.custom.docs.find(x => x.k === k);
  if (!d) return;
  S.adm.test = { d, draft }; const w = $('#cfgt') || (() => { const x = document.createElement('div'); x.id = 'cfgt'; document.body.appendChild(x); return x; })();
  w.innerHTML = `<div class="fixed inset-0 z-[96] bg-black/75 overflow-auto p-3 sm:p-6" onclick="if(event.target===this)this.innerHTML=''"><div class="card max-w-2xl mx-auto p-5 sm:p-6 fade-in"><div class="flex justify-between items-start mb-2"><h3 class="text-lg font-bold text-gray-900 dark:text-white"><span class="ms text-primary-500 mr-1.5">science</span>Dene: ${E(d.t || 'Yeni belge')}</h3><button class="btn" onclick="$('#cfgt').innerHTML=''"><span class="ms">close</span></button></div>
  <p class="text-xs text-gray-500 mb-3">${draft ? 'Henüz kaydedilmemiş kurallarla' : 'Kayıtlı kurallarla'} deneme yapılır; hiçbir şey kaydedilmez. Örnek bir belge metni yapıştırın ya da dosya yükleyin.</p>
  <label class="lbl">Belge sahibinin adı (kişi adı kuralı için)</label><input id="ct_n" class="inp mb-2" value="Ayşe Yılmaz">
  <label class="lbl">Örnek belge metni</label><textarea id="ct_t" class="inp" rows="6" placeholder="Belgeden kopyalanmış metni buraya yapıştırın…"></textarea>
  <div class="mt-3 flex flex-wrap gap-2"><button class="btn-p" onclick="cfgRun()"><span class="ms">play_arrow</span> Metni dene</button><button class="btn" onclick="cfgPick()"><span class="ms">upload</span> Dosya ile dene</button></div><div id="ct_r" class="mt-4"></div></div></div>`;
}
function cfgPick() { const i = document.createElement('input'); i.type = 'file'; i.accept = 'application/pdf,image/*'; i.onchange = async () => { const f = i.files[0]; if (!f) return; $('#ct_r').innerHTML = '<p class="text-sm text-gray-500"><span class="ms spin mr-1">progress_activity</span>Okunuyor…</p>'; try { const r = await readFile(f); $('#ct_t').value = r.text; cfgRun(r.src); } catch (e) { $('#ct_r').innerHTML = '<p class="text-sm text-red-600">Dosya okunamadı</p>'; } }; i.click(); }
function cfgRun(src) {
  const { d, draft } = S.adm.test, nm = val_('ct_n').trim() || 'Ayşe Yılmaz', sy = nm.split(/\s+/).pop(), text = val_('ct_t');
  const F = { ad: nm, tc: '10000000146', 'anne.ad': 'Fatma ' + sy, 'anne.tc': '10000000212', 'anne.hayat': 'Evet', 'baba.ad': 'Ali ' + sy, 'baba.tc': '10000000378', 'baba.hayat': 'Evet', sinif: '3. sınıf', _a: {} };
  const cc = S.adm.set.custom, docs = draft ? [...cc.docs.filter(x => x.k !== d.k), d] : cc.docs; L.setCustom({ docs, qs: cc.qs });
  const w = d.w[0], r = L.analyze(text, F, src || 'pdf', Date.now(), { k: d.k, w }); L.setCustom(cc);
  const bad = r.ck.some(c => c.t === 'bad'), rows = r.ck.map(c => `<div class="${dcls[c.t]} text-sm"><span class="ms mr-1">${dico[c.t]}</span>${E(c.m)}</div>`).join('');
  $('#ct_r').innerHTML = `<div class="p-3 rounded-lg ${bad ? 'bg-red-50 dark:bg-red-900/10' : 'bg-green-50 dark:bg-green-900/10'}"><b class="text-sm ${bad ? 'text-red-700' : 'text-green-700'}">${bad ? 'Bu belge KABUL EDİLMEZ' : 'Bu belge kabul edilir'}</b>${rows}${(r.info || []).map(t => `<div class="text-xs text-gray-700 dark:text-gray-300 mt-1"><span class="ms text-primary-500 mr-1">chevron_right</span>${E(t)}</div>`).join('')}</div>`;
}


// ---------- E-posta doğrulama kodu + Profil ----------
async function sendCode(emSel, kSel) {
  const em = ($(emSel).value || '').trim(); if (!em) return toast('Önce e-posta adresini yazın');
  try { const d = await api('/api/email-code', { method: 'POST', json: { email: em } }); if (d.demoCode) { $(kSel).value = d.demoCode; toast('Demo: kod otomatik girildi (' + d.demoCode + ')'); } else toast('Kod e-postanıza gönderildi (10 dk geçerli)'); }
  catch (e) { toast(e.message); }
}
function profileOpen() {
  if (!S.user || S.user.role !== 'student') return toast('Yönetici bilgileri buradan değiştirilemez'); const f = (typeof F !== 'undefined' && F) || {};
  let h = $('#prf'); if (!h) { h = document.createElement('div'); h.id = 'prf'; h.className = 'fixed inset-0 z-[95] bg-black/70 overflow-auto p-3 sm:p-6'; h.onclick = e => { if (e.target === h) h.classList.add('hidden'); }; document.body.appendChild(h); }
  h.innerHTML = `<div class="card max-w-lg mx-auto p-5 sm:p-6 fade-in" role="dialog" aria-modal="true"><div class="flex justify-between items-start mb-4"><div><h3 class="text-xl font-bold text-gray-900 dark:text-white">Profilim</h3><p class="text-xs text-gray-500">${E(S.user.name)} · TC ${E(S.user.tc)}</p></div><button onclick="$('#prf').classList.add('hidden')" class="text-gray-400"><span class="ms text-xl">close</span></button></div>
  <div class="space-y-3"><div><label class="lbl">E-posta</label><input id="pe" type="email" class="inp" value="${E(f.mail || '')}"></div>
  <div id="pcw" class="hidden"><label class="lbl">Yeni e-posta için doğrulama kodu</label><div class="flex gap-2"><input id="pk" class="inp" inputmode="numeric" maxlength="6"><button type="button" class="btn whitespace-nowrap" onclick="sendCode('#pe','#pk')"><span class="ms">mail</span> Kod gönder</button></div></div>
  <div><label class="lbl">Cep telefonu</label><input id="pt" type="tel" class="inp" value="${E(f.tel || '')}"></div>
  <div class="pt-2 border-t border-gray-100 dark:border-amoled-border"><label class="lbl">Şifre değiştir (isteğe bağlı)</label><input id="pc" type="password" class="inp mb-2" placeholder="Mevcut şifre" autocomplete="current-password"><input id="pn" type="password" class="inp mb-2" placeholder="Yeni şifre${window.DEMO ? '' : ' (en az 8 karakter)'}" autocomplete="new-password"><input id="pn2" type="password" class="inp" placeholder="Yeni şifre tekrar" autocomplete="new-password"></div></div>
  <div class="mt-5 flex justify-end gap-2"><button class="btn" onclick="$('#prf').classList.add('hidden')">Vazgeç</button><button class="btn-p" onclick="profileSave()">Kaydet</button></div></div>`;
  h.classList.remove('hidden'); const pe = $('#pe'), orig = (f.mail || '').toLowerCase(); pe.oninput = () => $('#pcw').classList.toggle('hidden', pe.value.trim().toLowerCase() === orig);
}
async function profileSave() {
  const b = { email: $('#pe').value.trim(), tel: $('#pt').value.trim(), code: ($('#pk') || {}).value || '' };
  if ($('#pn').value || $('#pc').value) { if ($('#pn').value !== $('#pn2').value) return toast('Yeni şifreler uyuşmuyor'); b.cur = $('#pc').value; b.pw = $('#pn').value; }
  try { const d = await api('/api/profile', { method: 'POST', json: b }); if (typeof F !== 'undefined' && F) { F.mail = d.email; F.tel = d.tel; } if (typeof A !== 'undefined' && A) { A.F.mail = d.email; A.F.tel = d.tel; } $('#prf').classList.add('hidden'); toast('Profil güncellendi'); }
  catch (e) { toast(e.message); }
}
