/* Hadi, давай: okuma.js v1
   Чтение: текст с озвучкой, подсветкой предложений и выбором скорости.
   Использование на странице:
     <div class="hd-okuma" data-metin="efes"></div>
     <script src="https://audio.hadidavay.com/okuma/okuma.js" defer></script>
   data-baslik="yok" скрывает заголовок внутри блока. */
(function () {
  'use strict';
  var BASE = 'https://audio.hadidavay.com/okuma/';
  var metinlerPromise = null;
  var aktifAudio = null;

  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }
  function metinler() {
    if (!metinlerPromise) metinlerPromise = getJSON(BASE + 'metinler.json');
    return metinlerPromise;
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function sure(s) {
    s = Math.max(0, Math.floor(s || 0));
    var m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function stil() {
    if (document.getElementById('hd-okuma-css')) return;
    var css =
      '.hd-okuma{--hd-yesil:#1f7a5a;--hd-turuncu:#f08a24;font-size:18px;line-height:1.75;color:inherit}' +
      '.hd-ok-bar{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px 12px;margin:0 0 18px;background:#fff;border:1px solid #e3e3e3;border-radius:14px;box-shadow:0 2px 10px rgba(0,0,0,.06)}' +
      '.hd-ok-play{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:10px 18px;background:var(--hd-yesil);color:#fff;font:inherit;font-size:16px;font-weight:600;cursor:pointer}' +
      '.hd-ok-play:hover{filter:brightness(1.08)}' +
      '.hd-ok-hiz{display:inline-flex;border:1px solid #d6d6d6;border-radius:999px;overflow:hidden}' +
      '.hd-ok-hiz button{border:0;background:transparent;padding:8px 11px;font:inherit;font-size:14px;cursor:pointer;color:#333}' +
      '.hd-ok-hiz button.on{background:var(--hd-yesil);color:#fff}' +
      '.hd-ok-ilerleme{flex:1 1 140px;display:flex;align-items:center;gap:8px;min-width:140px}' +
      '.hd-ok-cizgi{flex:1;height:6px;background:#eee;border-radius:3px;cursor:pointer;position:relative}' +
      '.hd-ok-dolu{position:absolute;left:0;top:0;bottom:0;width:0;background:var(--hd-turuncu);border-radius:3px}' +
      '.hd-ok-zaman{font-size:13px;color:#777;font-variant-numeric:tabular-nums;white-space:nowrap}' +
      '.hd-ok-ipucu{margin:-8px 0 16px;font-size:14px;color:#888}' +
      '.hd-ok-baslik{font-size:1.5em;line-height:1.3;margin:0 0 14px;font-weight:700}' +
      '.hd-okuma p{margin:0 0 1em}' +
      '.hd-ok-c{cursor:pointer;border-radius:4px;padding:1px 0;transition:background .15s}' +
      '.hd-ok-c:hover{background:rgba(31,122,90,.08)}' +
      '.hd-ok-c.on{background:rgba(240,138,36,.22);box-shadow:0 0 0 2px rgba(240,138,36,.22)}' +
      '.hd-ok-hata{color:#b00;font-size:15px}' +
      '@media(max-width:600px){.hd-okuma{font-size:17px}.hd-ok-bar{gap:8px;padding:8px}.hd-ok-play{padding:9px 14px;font-size:15px}}';
    var s = document.createElement('style');
    s.id = 'hd-okuma-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function kur(kutu) {
    var id = (kutu.getAttribute('data-metin') || '').trim();
    if (!id || kutu.getAttribute('data-hazir')) return;
    kutu.setAttribute('data-hazir', '1');
    kutu.classList.add('hd-okuma');

    Promise.all([metinler(), getJSON(BASE + id + '.json')]).then(function (r) {
      var metin = r[0][id], zaman = r[1];
      if (!metin) throw new Error('metin yok: ' + id);
      ciz(kutu, id, metin, zaman);
    }).catch(function (e) {
      console.error('[okuma]', e);
      kutu.textContent = '';
      kutu.appendChild(el('p', 'hd-ok-hata', 'Не удалось загрузить текст. Обновите страницу.'));
    });
  }

  function ciz(kutu, id, metin, zaman) {
    kutu.textContent = '';
    var audio = new Audio();
    audio.preload = 'metadata';
    audio.src = BASE + id + '.mp3';

    /* Панель */
    var bar = el('div', 'hd-ok-bar');
    var play = el('button', 'hd-ok-play');
    play.type = 'button';
    var hiz = el('div', 'hd-ok-hiz');
    [0.75, 1, 1.25].forEach(function (v) {
      var b = el('button', v === 1 ? 'on' : '', v + '×');
      b.type = 'button';
      b.addEventListener('click', function () {
        audio.playbackRate = v;
        Array.prototype.forEach.call(hiz.children, function (x) { x.classList.remove('on'); });
        b.classList.add('on');
      });
      hiz.appendChild(b);
    });
    var ilerleme = el('div', 'hd-ok-ilerleme');
    var cizgi = el('div', 'hd-ok-cizgi');
    var dolu = el('div', 'hd-ok-dolu');
    cizgi.appendChild(dolu);
    var zmn = el('span', 'hd-ok-zaman', '0:00');
    ilerleme.appendChild(cizgi);
    ilerleme.appendChild(zmn);
    bar.appendChild(play);
    bar.appendChild(hiz);
    bar.appendChild(ilerleme);
    kutu.appendChild(bar);
    kutu.appendChild(el('div', 'hd-ok-ipucu', 'Нажмите на предложение, чтобы прослушать только его.'));

    /* Текст */
    var parcalar = []; // {s,e,span}
    function cumle(text, t, parent) {
      var sp = el('span', 'hd-ok-c', text);
      var i = parcalar.length;
      parcalar.push({ s: t[0], e: t[1], span: sp });
      sp.addEventListener('click', function () { tekCal(i); });
      parent.appendChild(sp);
      return sp;
    }
    var gizliBaslik = kutu.getAttribute('data-baslik') === 'yok';
    var h = el('h2', 'hd-ok-baslik');
    cumle(metin.baslik, zaman.baslik, h);
    if (gizliBaslik) h.style.display = 'none';
    kutu.appendChild(h);
    metin.paragraflar.forEach(function (p, pi) {
      var pe = el('p');
      var tp = (zaman.paragraflar || [])[pi] || [];
      p.forEach(function (c, ci) {
        if (ci > 0) pe.appendChild(document.createTextNode(' '));
        if (tp[ci]) cumle(c, tp[ci], pe);
        else pe.appendChild(document.createTextNode(c));
      });
      kutu.appendChild(pe);
    });

    /* Состояние */
    var mod = 'hepsi';   // 'hepsi' = весь текст, 'tek' = одно предложение
    var tekBitis = 0;
    var aktif = -1;
    var raf = 0;

    function dugme() {
      play.textContent = audio.paused
        ? (audio.currentTime > 0.5 && mod === 'hepsi' ? '▶ Продолжить' : '▶ Слушать текст')
        : '⏸ Пауза';
    }
    function vurgula(i, kaydir) {
      if (i === aktif) return;
      if (aktif >= 0) parcalar[aktif].span.classList.remove('on');
      aktif = i;
      if (i < 0) return;
      var sp = parcalar[i].span;
      sp.classList.add('on');
      if (kaydir && mod === 'hepsi') {
        var r = sp.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (r.top < 90 || r.bottom > vh - 40) {
          sp.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
    function bul(t) {
      var k = -1;
      for (var i = 0; i < parcalar.length; i++) {
        if (parcalar[i].s <= t + 0.05) k = i; else break;
      }
      if (k >= 0 && t > parcalar[k].e + 0.6 && k === parcalar.length - 1) k = -1;
      return k;
    }
    function guncelle() {
      var t = audio.currentTime, d = audio.duration || 0;
      if (mod === 'tek' && !audio.paused && t >= tekBitis) {
        audio.pause();
        audio.currentTime = tekBitis;
      }
      vurgula(audio.paused && mod === 'tek' && t >= tekBitis - 0.01 ? aktif : bul(t), !audio.paused);
      dolu.style.width = d ? (100 * t / d) + '%' : '0';
      zmn.textContent = sure(t) + (d ? ' / ' + sure(d) : '');
    }
    function dongu() {
      guncelle();
      if (!audio.paused) raf = requestAnimationFrame(dongu);
    }
    function baslat() {
      if (aktifAudio && aktifAudio !== audio) aktifAudio.pause();
      aktifAudio = audio;
      var p = audio.play();
      if (p && p.catch) p.catch(function (e) { console.warn('[okuma]', e); });
    }
    function git(t, sonra) {
      if (audio.readyState >= 1) { audio.currentTime = t; if (sonra) sonra(); return; }
      audio.addEventListener('loadedmetadata', function f() {
        audio.removeEventListener('loadedmetadata', f);
        audio.currentTime = t; if (sonra) sonra();
      });
      audio.load();
    }
    function tekCal(i) {
      var c = parcalar[i];
      if (mod === 'tek' && aktif === i && !audio.paused) { audio.pause(); return; }
      mod = 'tek';
      tekBitis = c.e + 0.15;
      vurgula(i, false);
      git(Math.max(0, c.s - 0.05), baslat);
    }

    play.addEventListener('click', function () {
      if (!audio.paused) { audio.pause(); return; }
      if (mod === 'tek') {
        // После отдельного предложения продолжаем с него же
        mod = 'hepsi';
        if (aktif >= 0) { git(parcalar[aktif].s, baslat); return; }
      }
      if (audio.ended || (audio.duration && audio.currentTime >= audio.duration - 0.2)) audio.currentTime = 0;
      baslat();
    });
    cizgi.addEventListener('click', function (ev) {
      if (!audio.duration) return;
      var r = cizgi.getBoundingClientRect();
      mod = 'hepsi';
      audio.currentTime = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)) * audio.duration;
      guncelle();
    });
    audio.addEventListener('play', function () { dugme(); cancelAnimationFrame(raf); dongu(); });
    audio.addEventListener('pause', function () { dugme(); guncelle(); });
    audio.addEventListener('ended', function () { mod = 'hepsi'; vurgula(-1); dugme(); });
    audio.addEventListener('loadedmetadata', guncelle);
    audio.addEventListener('seeked', guncelle);
    dugme();
  }

  function hepsiniKur() {
    var k = document.querySelectorAll('.hd-okuma[data-metin], [data-hd-okuma]');
    if (!k.length) return;
    stil();
    Array.prototype.forEach.call(k, function (x) {
      if (!x.getAttribute('data-metin') && x.getAttribute('data-hd-okuma')) {
        x.setAttribute('data-metin', x.getAttribute('data-hd-okuma'));
      }
      kur(x);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hepsiniKur);
  else hepsiniKur();
  // Tilda иногда дорисовывает блоки позже
  window.addEventListener('load', hepsiniKur);
})();
