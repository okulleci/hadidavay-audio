/* Hadi, давай: okuma.js v3
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
      '.hd-okuma{--hg:#0E7C66;--hgd:#0A5C4C;--ha:#F2A03D;--hal:#FBE3BF;--hink:#1F2A2A;--hcr:#FFF7E8;--hln:#E2DCCF;--hmu:#5F6B66;color:var(--hink);font-family:Manrope,system-ui,Arial,sans-serif}' +
      '.hd-okuma{font-size:19px;line-height:1.8}' +
      '.hd-ok-bar{position:sticky;top:8px;z-index:20;display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px 12px;margin:0 0 14px;background:#fff;border:1px solid var(--hln);border-radius:20px;box-shadow:0 8px 24px rgba(31,42,42,.08)}' +
      '.hd-ok-play{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:14px;min-height:44px;padding:8px 18px;background:var(--hg);color:#fff;font:inherit;font-size:16px;line-height:1.2;font-weight:700;cursor:pointer}' +
      '.hd-ok-play:hover{background:var(--hgd)}' +
      '.hd-ok-hiz{display:inline-flex;border:1px solid var(--hln);border-radius:14px;overflow:hidden}' +
      '.hd-ok-hiz button{border:0;background:transparent;padding:10px 12px;font:inherit;font-weight:700;font-size:14px;line-height:1.2;cursor:pointer;color:var(--hink)}' +
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
      /* Раздел: те же карточки, что на странице подкастов (song-card) */
      '#hd-chtenie .song-wrap{max-width:1120px;margin:auto;padding:0 20px}' +
      '#hd-chtenie .song-wrap.hd-ch-dar{max-width:900px;display:block}' +
      '#hd-chtenie .song-card{background:#fff;border:1px solid #E2DCCF;padding:24px;border-radius:20px;margin:16px 0}' +
      '#hd-chtenie .song-card h3{margin:0 0 10px}' +
      '#hd-chtenie .song-card p{margin:8px 0}' +
      '#hd-chtenie .song-note{color:#5F6B66;font-size:16px}' +
      '@media(max-width:650px){#hd-chtenie .song-card{padding:18px}}' +
      '@media(min-width:980px){#hd-chtenie .hd-sec .song-wrap{display:grid;grid-template-columns:repeat(2,1fr);gap:0 20px;align-items:stretch}' +
      '#hd-chtenie .hd-sec .song-wrap>*{grid-column:1/-1}' +
      '#hd-chtenie .hd-sec .song-wrap>.song-card{grid-column:auto;display:flex;flex-direction:column;align-items:flex-start}' +
      '#hd-chtenie .hd-sec .song-card h3{font-size:28px!important}' +
      '#hd-chtenie .hd-sec .song-wrap.hd-ch-dar{display:block}}' +
      '.hd-ch-kart h3.disp{font-size:clamp(24px,4vw,36px);color:#fff;margin:0 0 6px}' +
      '.hd-ch-kart p{margin:8px 0}' +
      '.hd-ch-kart .hd-ch-tr{font-weight:700;margin-top:-2px}' +
      '.hd-ch-kart .btn{margin-top:auto}' +
      '.hd-ch-geri{display:inline-flex;align-items:center;gap:6px;margin:6px 0 0;font-size:16px;font-weight:700;color:var(--gd,#0A5C4C);text-decoration:none}' +
      '.hd-ch-geri:hover{text-decoration:underline}' +
      '.hd-ch-blok{margin:36px 0 0}' +
      '.hd-ch-blok h2.disp{font-size:clamp(22px,3vw,30px);margin:0 0 16px}' +
      '.hd-ch-tablo{width:100%;border-collapse:separate;border-spacing:0;border:1px solid var(--ln,#E2DCCF);border-radius:20px;overflow:hidden;background:#fff;font-size:17px;line-height:1.45}' +
      '.hd-ch-tablo td{padding:11px 18px;border-top:1px solid var(--ln,#E2DCCF);vertical-align:top}' +
      '.hd-ch-tablo tr:first-child td{border-top:0}' +
      '.hd-ch-tablo tr:nth-child(2n) td{background:var(--cr,#FFF7E8)}' +
      '.hd-ch-tablo td:first-child{font-weight:700;width:44%}' +
      '.hd-ch-sorular{margin:0;padding:0;list-style:none;counter-reset:s}' +
      '.hd-ch-sorular li{counter-increment:s;position:relative;background:#fff;border:1px solid var(--ln,#E2DCCF);border-radius:16px;padding:14px 18px 14px 58px;margin:0 0 10px}' +
      '.hd-ch-sorular li:before{content:counter(s);position:absolute;left:16px;top:13px;width:28px;height:28px;border-radius:9px;background:var(--g,#0E7C66);color:#fff;font-family:Unbounded,sans-serif;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center}' +
      '.hd-ch-cevap{display:none;margin-top:10px;padding:10px 14px;background:var(--cr,#FFF7E8);border-radius:12px;font-size:16px}' +
      '.hd-ch-acik .hd-ch-cevap{display:block}' +
      '.hd-ch-kaynak{font-size:15px;color:var(--mu,#5F6B66);margin:0;padding:0 0 0 1.2em}' +
      '.hd-ch-kaynak li{margin:4px 0}' +
      '.hd-ch-kaynak a{color:var(--gd,#0A5C4C)}' +
      '.hd-ch-nav{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:40px}' +
      '@media(max-width:700px){.hd-ch-sorular li{padding:12px 14px 12px 52px}.hd-ch-tablo td{padding:9px 12px}' +
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
    var ilkBaslik = document.title;

    function bolumler(dar) {
      kok.textContent = '';
      var hh = el('section', 'hd-hh');
      var hw = el('div', 'song-wrap' + (dar ? ' hd-ch-dar' : ''));
      hh.appendChild(hw);
      var sec = el('section', 'hd-sec');
      var sw = el('div', 'song-wrap' + (dar ? ' hd-ch-dar' : ''));
      sec.appendChild(sw);
      kok.appendChild(hh);
      kok.appendChild(sec);
      return { ust: hw, ic: sw };
    }

    metinler().then(function (M) {
      function goster() {
        if (aktifAudio) { aktifAudio.pause(); aktifAudio = null; }
        var id = decodeURIComponent((location.hash || '').replace('#', ''));
        if (M[id]) metinSayfa(id); else liste();
      }

      function liste() {
        document.title = ilkBaslik;
        var b = bolumler();
        b.ust.appendChild(el('div', 'kick', 'Бесплатные материалы · Hadi, давай'));
        b.ust.appendChild(el('h1', 'disp', 'Чтение на турецком'));
        b.ust.appendChild(el('p', 'sub',
          'Тексты об античных городах Турции. Каждый текст озвучен: слушайте целиком или нажимайте на отдельные предложения. ' +
          'После текста 20 слов с переводом и вопросы с ответами.'));
        b.ic.appendChild(el('h2', 'disp', 'Тексты'));
        SIRA.forEach(function (id, i) {
          var m = M[id];
          if (!m) return;
          var c = el('article', 'song-card hd-ch-kart');
          c.style.background = '#0e7c66';
          c.style.color = '#fff';
          c.appendChild(el('p', '', 'Текст № ' + (i + 1) + ' · ' + m.sehir + ' · ' + sure(m.sure) + ' мин'));
          c.appendChild(el('h3', 'disp', m.ad));
          var trAd = m.baslik_goster || m.baslik;
          if (trAd.toLocaleLowerCase('tr') !== m.ad.toLocaleLowerCase('tr')) {
            var tr = el('p', 'hd-ch-tr', trAd);
            tr.setAttribute('lang', 'tr');
            c.appendChild(tr);
          }
          c.appendChild(el('p', '', m.aciklama + ' 20 слов и 6 вопросов.'));
          var a = el('a', 'btn btn-a', 'Читать текст →');
          a.href = '#' + id;
          c.appendChild(a);
          b.ic.appendChild(c);
        });
        b.ic.appendChild(el('p', 'song-note', 'Уровень текстов B1-B2. Если пока сложно, начните с подкастов и словарей по уровням.'));
      }

      function metinSayfa(id) {
        var m = M[id], i = SIRA.indexOf(id);
        document.title = m.ad + ' · Чтение на турецком · Hadi, давай';
        var b = bolumler(true);
        b.ust.appendChild(el('div', 'kick', 'Чтение · текст № ' + (i + 1) + ' из ' + SIRA.length + ' · ' + m.sehir));
        var h1 = el('h1', 'disp', m.baslik_goster || m.baslik);
        h1.setAttribute('lang', 'tr');
        b.ust.appendChild(h1);
        b.ust.appendChild(el('p', 'sub', m.aciklama));
        var geri = el('a', 'hd-ch-geri', '← Все тексты');
        geri.href = '#';
        b.ust.appendChild(geri);

        var okuma = el('div', 'hd-okuma');
        okuma.setAttribute('data-metin', id);
        okuma.setAttribute('data-baslik', 'yok');
        okuma.setAttribute('lang', 'tr');
        b.ic.appendChild(okuma);
        kur(okuma);

        if (m.kelimeler && m.kelimeler.length) {
          var k1 = el('div', 'hd-ch-blok');
          k1.appendChild(el('h2', 'disp', m.kelimeler.length + ' слов из текста'));
          var t = el('table', 'hd-ch-tablo');
          var tb = el('tbody');
          m.kelimeler.forEach(function (k) {
            var tr = el('tr');
            var t1 = el('td', '', k[0]);
            t1.setAttribute('lang', 'tr');
            tr.appendChild(t1);
            tr.appendChild(el('td', '', k[1]));
            tb.appendChild(tr);
          });
          t.appendChild(tb);
          k1.appendChild(t);
          b.ic.appendChild(k1);
        }

        if (m.sorular && m.sorular.length) {
          var k2 = el('div', 'hd-ch-blok');
          k2.appendChild(el('h2', 'disp', 'Вопросы к тексту'));
          var ol = el('ol', 'hd-ch-sorular');
          ol.setAttribute('lang', 'tr');
          m.sorular.forEach(function (s, j) {
            var li = el('li', '', s);
            if (m.cevaplar && m.cevaplar[j]) li.appendChild(el('div', 'hd-ch-cevap', m.cevaplar[j]));
            ol.appendChild(li);
          });
          k2.appendChild(ol);
          var acts = el('div', 'hd-acts');
          var btn = el('button', 'btn btn-o', 'Показать ответы');
          btn.type = 'button';
          btn.addEventListener('click', function () {
            var acik = ol.classList.toggle('hd-ch-acik');
            btn.textContent = acik ? 'Скрыть ответы' : 'Показать ответы';
          });
          acts.appendChild(btn);
          k2.appendChild(acts);
          b.ic.appendChild(k2);
        }

        if (m.kaynaklar && m.kaynaklar.length) {
          var k3 = el('div', 'hd-ch-blok');
          k3.appendChild(el('h2', 'disp', 'Источники'));
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
          k3.appendChild(ul);
          b.ic.appendChild(k3);
        }

        var nav = el('div', 'hd-ch-nav');
        var onceki = SIRA[i - 1], sonraki = SIRA[i + 1];
        var a1 = el('a', 'btn btn-o', onceki ? '← ' + M[onceki].ad : '← Все тексты');
        a1.href = '#' + (onceki || '');
        var a2 = el('a', 'btn btn-g', sonraki ? M[sonraki].ad + ' →' : 'Все тексты →');
        a2.href = '#' + (sonraki || '');
        nav.appendChild(a1);
        nav.appendChild(a2);
        b.ic.appendChild(nav);
      }

      window.addEventListener('hashchange', function () {
        goster();
        var y = kok.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo(0, Math.max(0, y - 10));
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
