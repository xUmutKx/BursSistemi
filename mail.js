// Bağımlılıksız SMTP istemcisi. Ayar (ortam değişkeni): SMTP_HOST, SMTP_PORT (465 veya 587), SMTP_USER, SMTP_PASS, SMTP_FROM
const net = require('net'), tls = require('tls');
const cfg = () => ({ host: process.env.SMTP_HOST, port: +process.env.SMTP_PORT || 465, user: process.env.SMTP_USER, pass: process.env.SMTP_PASS, from: process.env.SMTP_FROM || process.env.SMTP_USER });
const enabled = () => { const c = cfg(); return !!(c.host && c.user && c.pass); };
const MAIL_RE = /^[^\s@<>",;:\\]+@[^\s@<>",;:\\]+\.[^\s@<>",;:\\]{2,}$/;

function send(to, subject, text) {
  const c = cfg();
  return new Promise((resolve, reject) => {
    if (!enabled()) return reject(new Error('E-posta gönderimi ayarlanmamış'));
    if (!MAIL_RE.test(to) || !MAIL_RE.test(c.from)) return reject(new Error('Geçersiz e-posta adresi'));
    let sock, buf = '', done = false; const q = [], w = [];
    const end = (e) => { if (done) return; done = true; clearTimeout(tm); try { sock.destroy(); } catch (x) {} e ? reject(e) : resolve(); };
    const tm = setTimeout(() => end(new Error('E-posta sunucusu yanıt vermedi')), 25000);
    const onData = d => {
      buf += d.toString('utf8'); let m;
      while ((m = buf.match(/^(?:\d{3}-[^\n]*\n)*\d{3} [^\n]*\n/))) { buf = buf.slice(m[0].length); w.length ? w.shift()(m[0]) : q.push(m[0]); }
    };
    const attach = s => { sock = s; buf = ''; s.on('data', onData); s.on('error', end); };
    const read = () => new Promise(r => q.length ? r(q.shift()) : w.push(r));
    const cmd = async (line, ok) => { if (line !== null) sock.write(line + '\r\n'); const r = await read(); if (!r.startsWith(ok)) throw new Error('SMTP hatası: ' + r.trim().slice(0, 100)); return r; };
    const b64 = s => Buffer.from(s, 'utf8').toString('base64');
    (async () => {
      if (c.port === 465) { attach(tls.connect({ host: c.host, port: c.port, servername: c.host })); }
      else attach(net.connect({ host: c.host, port: c.port }));
      await cmd(null, '220');
      let r = await cmd('EHLO burs.local', '250');
      if (c.port !== 465 && /STARTTLS/i.test(r)) {
        await cmd('STARTTLS', '220'); sock.removeAllListeners('data'); q.length = 0;
        attach(tls.connect({ socket: sock, servername: c.host })); await cmd('EHLO burs.local', '250');
      }
      await cmd('AUTH LOGIN', '334'); await cmd(b64(c.user), '334'); await cmd(b64(c.pass), '235');
      await cmd('MAIL FROM:<' + c.from + '>', '250'); await cmd('RCPT TO:<' + to + '>', '250'); await cmd('DATA', '354');
      const body = b64(text).replace(/(.{76})/g, '$1\r\n');
      sock.write(['From: E-Burs Portalı <' + c.from + '>', 'To: <' + to + '>', 'Subject: =?UTF-8?B?' + b64(subject) + '?=', 'Date: ' + new Date().toUTCString(), 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: base64', '', body, '.', ''].join('\r\n'));
      await cmd(null, '250'); sock.write('QUIT\r\n'); end();
    })().catch(end);
  });
}
module.exports = { send, enabled, MAIL_RE };
