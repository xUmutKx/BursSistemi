'use strict';
// Sunucu tarafında PDF'in gerçek üst verisini ve metnini okur (istemciye güvenilmez).
// Yüklü pdf.js (public/vendor) kullanılır; ek paket gerekmez.
const path = require('path');
let lib = null;
function load() {
  if (lib) return lib;
  global.window = global.window || global; global.self = global.self || global;
  lib = require('./public/vendor/pdf.min.js');
  lib.GlobalWorkerOptions.workerSrc = path.join(__dirname, 'public', 'vendor', 'pdf.worker.min.js');
  return lib;
}
const L = require('./public/logic.js');
// -> { meta, text, code, js, att, pages }
async function inspect(buf) {
  const pdfjs = load(), task = pdfjs.getDocument({ data: new Uint8Array(buf), disableWorker: true, verbosity: 0, isEvalSupported: false, useSystemFonts: false });
  const pdf = await Promise.race([task.promise, new Promise((_, no) => setTimeout(() => no(new Error('PDF okunamadı (zaman aşımı)')), 20000))]);
  try {
    const meta = await L.pdfMeta(pdf); let text = '';
    for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) { const pg = await pdf.getPage(i); text += L.lines((await pg.getTextContent()).items) + '\n'; }
    let js = false, att = false;
    try { const j = await pdf.getJSActions(); js = !!(j && Object.keys(j).length); } catch (e) {}
    try { const a = await pdf.getAttachments(); att = !!(a && Object.keys(a).length); } catch (e) {}
    return { meta, text: text.length > 24000 ? text.slice(0, 12000) + '\n' + text.slice(-12000) : text, code: L.pdfCode(text), js, att, pages: pdf.numPages };
  } finally { try { await pdf.destroy(); } catch (e) {} }
}
module.exports = { inspect };
