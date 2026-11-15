/* Hadi, давай: sözlük sayfalarına ses düğmeleri (audio.hadidavay.com/slovar/) */
(function () {
  var m = location.pathname.match(/slovar-(a1|a2|b1|b2|c1|c2)/);
  if (!m) return;
  var lvl = m[1], base = 'https://audio.hadidavay.com/slovar/';
  function start() {
    var items = document.querySelectorAll('.v-it');
    if (!items.length) return;
    fetch(base + lvl + '.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (t) {
      if (!t || !t.w) return;
      var css = document.createElement('style');
      css.textContent = '.hdv-say{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;margin-left:8px;' +
        'border:1px solid var(--ln,#e2dccf);border-radius:50%;background:#fff;cursor:pointer;vertical-align:middle;padding:0;' +
        'color:var(--g,#0E7C66);font-size:14px;line-height:1;flex:none}.hdv-say:hover{border-color:var(--g,#0E7C66)}' +
        '.hdv-say.on{background:var(--g,#0E7C66);color:#fff;border-color:var(--g,#0E7C66)}' +
        '.hdv-say svg{width:14px;height:14px;fill:currentColor}.v-ex .hdv-say{width:26px;height:26px;margin:0 6px 0 0}';
      document.head.appendChild(css);
      var au = new Audio(); au.preload = 'none'; au.src = base + lvl + '.mp3';
      var end = 0, cur = null, raf = 0;
      function stop() { au.pause(); if (cur) cur.classList.remove('on'); cur = null; cancelAnimationFrame(raf); }
      function tick() { if (au.currentTime >= end) { stop(); return; } raf = requestAnimationFrame(tick); }
      function play(seg, btn) {
        if (cur === btn) { stop(); return; }
        stop(); cur = btn; btn.classList.add('on'); end = seg[1] + 0.05;
        var go = function () { au.currentTime = Math.max(0, seg[0] - 0.05); var p = au.play(); if (p && p.catch) p.catch(stop); raf = requestAnimationFrame(tick); };
        if (au.readyState >= 1) go(); else { au.preload = 'auto'; au.addEventListener('loadedmetadata', go, { once: true }); au.load(); }
      }
      au.addEventListener('ended', stop);
      var icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
      function btn(seg, label) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'hdv-say'; b.innerHTML = icon; b.setAttribute('aria-label', label); b.title = label;
        b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); play(seg, b); });
        return b;
      }
      items.forEach(function (it, i) {
        var w = it.querySelector('.v-w'), x = it.querySelector('.v-ex:not(.ru)');
        if (w && t.w[i]) w.insertAdjacentElement('afterend', btn(t.w[i], 'Послушать слово'));
        if (x && t.x && t.x[i]) x.insertBefore(btn(t.x[i], 'Послушать пример'), x.firstChild);
      });
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
