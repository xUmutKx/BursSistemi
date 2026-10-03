'use strict';
// Diskteki veriyi (db.json, yedekler, yüklenen belgeler) AES-256-GCM ile şifreler.
// Anahtar: DATA_KEY ortam değişkeni (64 hane hex veya herhangi bir uzun parola) ya da data/.anahtar (otomatik, 0600).
// Gerçek kullanımda DATA_KEY'i sunucu ortamında verin: anahtar verinin yanında durmasın.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const MAGIC = Buffer.from('BV1');
let key = null;
function init(dir) {
  const env = process.env.DATA_KEY;
  if (env) key = /^[0-9a-f]{64}$/i.test(env) ? Buffer.from(env, 'hex') : crypto.scryptSync(env, 'burs-vault-v1', 32);
  else {
    const f = path.join(dir, '.anahtar');
    try { key = Buffer.from(fs.readFileSync(f, 'utf8').trim(), 'hex'); } catch (e) {}
    if (!key || key.length !== 32) { key = crypto.randomBytes(32); fs.writeFileSync(f, key.toString('hex') + '\n', { mode: 0o600 }); }
  }
  return !!env;
}
const enc = buf => { const iv = crypto.randomBytes(12), c = crypto.createCipheriv('aes-256-gcm', key, iv), ct = Buffer.concat([c.update(buf), c.final()]); return Buffer.concat([MAGIC, iv, c.getAuthTag(), ct]); };
const isEnc = b => b.length > 31 && b.slice(0, 3).equals(MAGIC);
const dec = b => { if (!isEnc(b)) return b; const d = crypto.createDecipheriv('aes-256-gcm', key, b.slice(3, 15)); d.setAuthTag(b.slice(15, 31)); return Buffer.concat([d.update(b.slice(31)), d.final()]); };
module.exports = { init, enc, dec, isEnc };
