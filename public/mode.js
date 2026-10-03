(function () {
  const h = location.hostname;
  window.STATIC = /github\.io$/.test(h) || location.protocol === 'file:' || /[?&]demo=1/.test(location.search);
  let m = 'demo'; try { m = localStorage.tto_mode === 'live' ? 'live' : 'demo'; } catch (e) {}
  window.MODE = m; window.DEMO = m === 'demo';
  // sunucu modu kilitlediyse (MOD=canli / MOD=demo) istemci seçimi geçersizdir
  window.applyLock = lock => { if (lock === 'live' || lock === 'demo') { window.MODE = lock; window.DEMO = lock === 'demo'; window.LOCKED = lock; } };
  window.flipMode = () => { if (window.LOCKED) return false; try { localStorage.tto_mode = window.MODE === 'demo' ? 'live' : 'demo'; localStorage.removeItem('tto_token'); localStorage.removeItem('tto_token_demo'); } catch (e) { return false; } location.reload(); return true; };
})();
