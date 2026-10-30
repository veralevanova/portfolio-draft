// Кейс «Вход и регистрация»: переключатель статусов, появление блоков, счётчики.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* переключатель статусов под ноутбуком: вкладка меняет экран (crossfade 250 мс) */
  var tabs = $('.lg-seg [role="tab"]');
  var shots = $('.lg-switch__screen img');
  var cap = document.getElementById('sw-cap');
  var caps = [
    '<b>Нет аккаунта:</b> выбор услуги → Blocked Account и онбординг',
    '<b>Не активирован:</b> код из письма, таймер 60 с, повторная отправка',
    '<b>Активирован:</b> пароль, счётчик попыток, восстановление'
  ];
  var cur = 0;
  function select(i, focus) {
    i = (i + tabs.length) % tabs.length; cur = i;
    tabs.forEach(function (t, j) {
      var on = j === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    // старый экран остаётся под новым, пока новый проявляется, — фон не просвечивает
    var prev = shots.filter(function (im) { return im.classList.contains('is-on'); })[0];
    shots.forEach(function (im, j) { im.classList.remove('is-prev'); if (j !== i) im.classList.remove('is-on'); });
    if (prev && prev !== shots[i]) {
      prev.classList.add('is-prev');
      clearTimeout(select.t); select.t = setTimeout(function () { prev.classList.remove('is-prev'); }, 300);
    }
    shots[i].classList.add('is-on');
    if (cap) cap.innerHTML = caps[i];
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(i); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); select(i + 1, true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); select(i - 1, true); }
      else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
      else if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
    });
  });
  // заранее подгружаем остальные экраны, чтобы смена была без задержки
  shots.forEach(function (im) { im.loading = 'eager'; });
  // свайп по экрану на мобильном
  var sw = document.querySelector('.lg-switch'), x0 = null;
  if (sw) {
    sw.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    sw.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) select(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  if (reduce || !('IntersectionObserver' in window)) return;

  /* появление при прокрутке */
  document.documentElement.classList.add('js-reveal');
  var cnt = new Map();
  var els = $('.lg [data-rv]');
  els.forEach(function (el) {
    var g = el.parentElement, n = cnt.get(g) || 0;
    el.style.setProperty('--d', Math.min(n, 6) * 70 + 'ms'); cnt.set(g, n + 1);
  });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });

  /* счётчики результата */
  $('.lg [data-count]').forEach(function (el) {
    var n = parseInt(el.textContent, 10); if (isNaN(n)) return;
    new IntersectionObserver(function (e, ob) {
      if (!e[0].isIntersecting) return; ob.disconnect();
      var t0 = performance.now(), dur = 900;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: .6 }).observe(el);
  });
})();
