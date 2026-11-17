/* Hadi, давай: okuma.js v2
   Раздел «Чтение»: тексты с озвучкой, подсветкой предложений, словами и вопросами.

   1) Весь раздел на одной странице (список + тексты, адреса вида /chtenie#efes):
        <div id="hd-chtenie"></div>
        <script src="https://audio.hadidavay.com/okuma/okuma.js" defer></script>
   2) Только один текст с озвучкой:
        <div class="hd-okuma" data-metin="efes"></div>
        <script src="https://audio.hadidavay.com/okuma/okuma.js" defer></script>
      data-baslik="yok" скрывает заголовок внутри блока. */
(function () {
  'use strict';
  var BASE = 'https://audio.hadidavay.com/okuma/';
  var SIRA = ['hosgoru', 'efes', 'hierapolis', 'assos', 'troya', 'afrodisias', 'aspendos', 'side', 'zeugma', 'gobeklitepe'];
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
      '.hd-okuma,.hd-ch{--hg:#0E7C66;--hgd:#0A5C4C;--ha:#F2A03D;--hal:#FBE3BF;--hink:#1F2A2A;--hcr:#FFF7E8;--hln:#E2DCCF;--hmu:#5F6B66;color:var(--hink);font-family:Manrope,system-ui,Arial,sans-serif}' +
      '.hd-okuma{font-size:19px;line-height:1.8}' +
      '.hd-ok-bar{position:sticky;top:8px;z-index:20;display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px 12px;margin:0 0 14px;background:#fff;border:1px solid var(--hln);border-radius:18px;box-shadow:0 8px 24px rgba(31,42,42,.08)}' +
      '.hd-ok-play{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:10px 18px;background:var(--hg);color:#fff;font:inherit;font-size:16px;line-height:1.2;font-weight:700;cursor:pointer}' +
      '.hd-ok-play:hover{background:var(--hgd)}' +
      '.hd-ok-hiz{display:inline-flex;border:1px solid var(--hln);border-radius:999px;overflow:hidden}' +
      '.hd-ok-hiz button{border:0;background:transparent;padding:8px 11px;font:inherit;font-size:14px;line-height:1.2;cursor:pointer;color:var(--hink)}' +
      '.hd-ok-hiz button.on{background:var(--hg);color:#fff}' +
      '.hd-ok-ilerleme{flex:1 1 140px;display:flex;align-items:center;gap:8px;min-width:140px}' +
      '.hd-ok-cizgi{flex:1;height:6px;background:var(--hcr);border:1px solid var(--hln);border-radius:4px;cursor:pointer;position:relative}' +
      '.hd-ok-dolu{position:absolute;left:0;top:0;bottom:0;width:0;background:var(--ha);border-radius:4px}' +
      '.hd-ok-zaman{font-size:13px;line-height:1.2;color:var(--hmu);font-variant-numeric:tabular-nums;white-space:nowrap}' +
      '.hd-ok-ipucu{margin:0 0 18px;font-size:14px;line-height:1.4;color:var(--hmu)}' +
      '.hd-ok-baslik{font-family:Unbounded,Manrope,sans-serif;font-size:1.45em;line-height:1.3;margin:0 0 16px;font-weight:700;color:var(--hink)}' +
      '.hd-okuma p{margin:0 0 1em}' +
      '.hd-ok-c{cursor:pointer;border-radius:4px;padding:1px 0;transition:background .15s}' +
      '.hd-ok-c:hover{background:rgba(14,124,102,.08)}' +
      '.hd-ok-c.on{background:var(--hal);box-shadow:0 0 0 3px var(--hal)}' +
      '.hd-ok-hata{color:#b00;font-size:15px}' +
      /* Раздел */
      '.hd-ch{max-width:860px;margin:0 auto;padding:24px 20px 60px;font-size:18px;line-height:1.6}' +
      '.hd-ch a{color:inherit}' +
      '.hd-ch h1{font-family:Unbounded,Manrope,sans-serif;font-size:40px;line-height:1.15;margin:0 0 12px;font-weight:800}' +
      '.hd-ch h2{font-family:Unbounded,Manrope,sans-serif;font-size:24px;line-height:1.25;margin:40px 0 14px;font-weight:700}' +
      '.hd-ch-giris{color:var(--hmu);margin:0 0 28px;max-width:640px}' +
      '.hd-ch-liste{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}' +
      '.hd-ch-kart{display:flex;gap:14px;align-items:flex-start;padding:18px;border:1px solid var(--hln);border-radius:20px;background:#fff;text-decoration:none;transition:transform .15s,box-shadow .15s}' +
      '.hd-ch-kart:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(31,42,42,.10)}' +
      '.hd-ch-no{flex:0 0 auto;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-family:Unbounded,sans-serif;font-weight:800;font-size:16px;background:var(--hcr);color:var(--hgd)}' +
      '.hd-ch-kart:nth-child(2n) .hd-ch-no{background:var(--hal);color:var(--hink)}' +
      '.hd-ch-kart:nth-child(3n) .hd-ch-no{background:var(--hg);color:#fff}' +
      '.hd-ch-kart h3{margin:0 0 4px;font-size:18px;line-height:1.3;font-weight:800}' +
      '.hd-ch-kart p{margin:0 0 8px;font-size:15px;line-height:1.45;color:var(--hmu)}' +
      '.hd-ch-meta{font-size:13px;line-height:1.3;color:var(--hgd);font-weight:600}' +
      '.hd-ch-geri{display:inline-flex;align-items:center;gap:6px;margin:0 0 18px;font-size:15px;font-weight:700;color:var(--hgd)!important;text-decoration:none}' +
      '.hd-ch-ust{font-size:14px;color:var(--hmu);margin:0 0 6px;font-weight:600}' +
      '.hd-ch-tablo{width:100%;border-collapse:separate;border-spacing:0;border:1px solid var(--hln);border-radius:16px;overflow:hidden;font-size:16px;line-height:1.4}' +
      '.hd-ch-tablo td{padding:9px 14px;border-top:1px solid var(--hln);vertical-align:top}' +
      '.hd-ch-tablo tr:first-child td{border-top:0}' +
      '.hd-ch-tablo tr:nth-child(2n) td{background:var(--hcr)}' +
      '.hd-ch-tablo td:first-child{font-weight:700;width:45%}' +
      '.hd-ch-sorular{margin:0;padding:0 0 0 1.4em}' +
      '.hd-ch-sorular li{margin:0 0 12px}' +
      '.hd-ch-cevap{display:none;margin-top:6px;padding:8px 12px;border-left:3px solid var(--ha);background:var(--hcr);border-radius:0 10px 10px 0;font-size:16px}' +
      '.hd-ch-acik .hd-ch-cevap{display:block}' +
      '.hd-ch-btn{display:inline-flex;align-items:center;margin-top:8px;border:2px solid var(--hg);border-radius:999px;padding:9px 18px;background:#fff;color:var(--hgd);font:inherit;font-size:15px;font-weight:700;cursor:pointer}' +
      '.hd-ch-btn:hover{background:var(--hg);color:#fff}' +
      '.hd-ch-kaynak{font-size:14px;color:var(--hmu);margin:0;padding:0 0 0 1.2em}' +
      '.hd-ch-kaynak a{color:var(--hgd)}' +
      '.hd-ch-nav{display:flex;justify-content:space-between;gap:12px;margin-top:40px;padding-top:20px;border-top:1px solid var(--hln)}' +
      '.hd-ch-nav a{text-decoration:none;font-weight:700;color:var(--hgd);font-size:15px}' +
      '@media(max-width:700px){.hd-ch{padding:16px 14px 40px}.hd-ch h1{font-size:30px}.hd-ch h2{font-size:21px}.hd-ch-liste{grid-template-columns:1fr}' +
      '.hd-okuma{font-size:18px}.hd-ok-bar{gap:8px;padding:8px}.hd-ok-play{padding:9px 14px;font-size:15px}}';
    var s = document.createElement('style');
    s.id = 'hd-okuma-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---------- Озвученный текст ---------- */
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
    kutu._hdAudio = audio;

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

    var parcalar = [];
    function cumle(text, t, parent) {
      var sp = el('span', 'hd-ok-c', text);
      var i = parcalar.length;
      parcalar.push({ s: t[0], e: t[1], span: sp });
      sp.addEventListener('click', function () { tekCal(i); });
      parent.appendChild(sp);
    }
    var h = el('h2', 'hd-ok-baslik');
    cumle(metin.baslik_goster || metin.baslik, zaman.baslik, h);
    if (kutu.getAttribute('data-baslik') === 'yok') h.style.display = 'none';
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

    var mod = 'hepsi', tekBitis = 0, aktif = -1, raf = 0;

    function dugme() {
      play.textContent = audio.paused
        ? (audio.currentTime > 0.5 && mod === 'hepsi' ? '▶ Продолжить' : '▶ Слушать текст')
        : '❚❚ Пауза';
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
        if (r.top < 110 || r.bottom > vh - 40) sp.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    function bul(t) {
      var k = -1;
      for (var i = 0; i < parcalar.length; i++) {
        if (parcalar[i].s <= t + 0.05) k = i; else break;
      }
      if (k >= 0 && k === parcalar.length - 1 && t > parcalar[k].e + 0.6) k = -1;
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
        audio.currentTime = t;
        if (sonra) sonra();
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

  /* ---------- Раздел «Чтение» ---------- */
  function bolum(kok) {
    if (kok.getAttribute('data-hazir')) return;
    kok.setAttribute('data-hazir', '1');
    kok.classList.add('hd-ch');
    var ilkBaslik = document.title;

    metinler().then(function (M) {
      function goster() {
        if (aktifAudio) { aktifAudio.pause(); aktifAudio = null; }
        var id = decodeURIComponent((location.hash || '').replace('#', ''));
        kok.textContent = '';
        if (M[id]) metinSayfa(id); else liste();
      }

      function liste() {
        document.title = ilkBaslik;
        kok.appendChild(el('h1', '', 'Чтение'));
        kok.appendChild(el('p', 'hd-ch-giris',
          'Тексты на турецком об античных городах Турции. Каждый текст озвучен: слушайте целиком или нажимайте на отдельные предложения. ' +
          'После текста 20 новых слов с переводом и вопросы с ответами. Уровень B1-B2.'));
        var g = el('div', 'hd-ch-liste');
        SIRA.forEach(function (id, i) {
          var m = M[id];
          if (!m) return;
          var a = el('a', 'hd-ch-kart');
          a.href = '#' + id;
          a.appendChild(el('span', 'hd-ch-no', String(i + 1)));
          var d = el('div');
          d.appendChild(el('h3', '', m.ad));
          d.appendChild(el('p', '', m.aciklama));
          d.appendChild(el('div', 'hd-ch-meta', m.sehir + ' · ' + sure(m.sure) + ' · 20 слов'));
          a.appendChild(d);
          g.appendChild(a);
        });
        kok.appendChild(g);
      }

      function metinSayfa(id) {
        var m = M[id], i = SIRA.indexOf(id);
        document.title = m.ad + ' · Чтение · Hadi, давай';
        var geri = el('a', 'hd-ch-geri', '← Все тексты');
        geri.href = '#';
        kok.appendChild(geri);
        kok.appendChild(el('div', 'hd-ch-ust', 'Текст ' + (i + 1) + ' из ' + SIRA.length + ' · ' + m.sehir));

        var okuma = el('div', 'hd-okuma');
        okuma.setAttribute('data-metin', id);
        kok.appendChild(okuma);
        kur(okuma);

        if (m.kelimeler && m.kelimeler.length) {
          kok.appendChild(el('h2', '', m.kelimeler.length + ' слов из текста'));
          var t = el('table', 'hd-ch-tablo');
          var tb = el('tbody');
          m.kelimeler.forEach(function (k) {
            var tr = el('tr');
            tr.appendChild(el('td', '', k[0]));
            tr.appendChild(el('td', '', k[1]));
            tb.appendChild(tr);
          });
          t.appendChild(tb);
          kok.appendChild(t);
        }

        if (m.sorular && m.sorular.length) {
          kok.appendChild(el('h2', '', 'Вопросы к тексту'));
          var ol = el('ol', 'hd-ch-sorular');
          m.sorular.forEach(function (s, j) {
            var li = el('li', '', s);
            if (m.cevaplar && m.cevaplar[j]) li.appendChild(el('div', 'hd-ch-cevap', m.cevaplar[j]));
            ol.appendChild(li);
          });
          kok.appendChild(ol);
          var b = el('button', 'hd-ch-btn', 'Показать ответы');
          b.type = 'button';
          b.addEventListener('click', function () {
            var acik = ol.classList.toggle('hd-ch-acik');
            b.textContent = acik ? 'Скрыть ответы' : 'Показать ответы';
          });
          kok.appendChild(b);
        }

        if (m.kaynaklar && m.kaynaklar.length) {
          kok.appendChild(el('h2', '', 'Источники'));
          var ul = el('ul', 'hd-ch-kaynak');
          m.kaynaklar.forEach(function (k) {
            var li = el('li');
            var a = el('a', '', k[0]);
            a.href = k[1];
            a.target = '_blank';
            a.rel = 'noopener';
            li.appendChild(a);
            ul.appendChild(li);
          });
          kok.appendChild(ul);
        }

        var nav = el('div', 'hd-ch-nav');
        var onceki = SIRA[i - 1], sonraki = SIRA[i + 1];
        var a1 = el('a', '', onceki ? '← ' + M[onceki].ad : '← Все тексты');
        a1.href = '#' + (onceki || '');
        var a2 = el('a', '', sonraki ? M[sonraki].ad + ' →' : 'Все тексты →');
        a2.href = '#' + (sonraki || '');
        nav.appendChild(a1);
        nav.appendChild(a2);
        kok.appendChild(nav);
      }

      window.addEventListener('hashchange', function () {
        goster();
        var y = kok.getBoundingClientRect().top + window.pageYOffset - 20;
        window.scrollTo(0, Math.max(0, y));
      });
      goster();
    }).catch(function (e) {
      console.error('[okuma]', e);
      kok.textContent = '';
      kok.appendChild(el('p', 'hd-ok-hata', 'Не удалось загрузить раздел. Обновите страницу.'));
    });
  }

  function hepsiniKur() {
    var kok = document.getElementById('hd-chtenie');
    var k = document.querySelectorAll('.hd-okuma[data-metin]');
    if (!kok && !k.length) return;
    stil();
    if (kok) bolum(kok);
    Array.prototype.forEach.call(k, function (x) {
      if (!kok || !kok.contains(x)) kur(x);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hepsiniKur);
  else hepsiniKur();
  window.addEventListener('load', hepsiniKur);
})();
