/* Hadi, давай: menu.js v1
   Добавляет «Чтение» в меню «Материалы» и в список разделов сайта.
   Подключается один раз в настройках сайта Tilda (HTML-код для HEAD):
     <script src="https://audio.hadidavay.com/okuma/menu.js" defer></script> */
(function () {
  'use strict';
  var URL = '/chtenie';
  var IC = 'Ч';

  function ekle() {
    // 1) Выпадающее меню «Материалы»
    Array.prototype.forEach.call(document.querySelectorAll('.ddm'), function (m) {
      if (m.querySelector('a[href="' + URL + '"]')) return;
      var a = document.createElement('a');
      a.href = URL;
      a.innerHTML = '<span class="ic">' + IC + '</span>Чтение · тексты с аудио';
      var ref = m.querySelector('a[href="/razgovornik"]');
      if (ref && ref.nextSibling) m.insertBefore(a, ref.nextSibling);
      else {
        var tum = m.querySelector('a[href="/materials"]');
        m.insertBefore(a, tum || m.firstChild);
      }
    });
    // 2) Карточки разделов (на главной и на странице материалов)
    Array.prototype.forEach.call(document.querySelectorAll('.hd-all'), function (g) {
      if (g.querySelector('a[href="' + URL + '"]')) return;
      var ref = g.querySelector('a.hd-al[href="/razgovornik"]');
      if (!ref) return;
      var a = document.createElement('a');
      a.className = ref.className;
      a.href = URL;
      a.innerHTML = '<span class="ic">' + IC + '</span><h3>Чтение</h3>' +
        '<p>10 текстов об античных городах Турции: с озвучкой, словами и вопросами</p>';
      g.insertBefore(a, ref.nextSibling);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ekle);
  else ekle();
  window.addEventListener('load', ekle);
})();
