// Кейс «Банковские переводы»: полоса прогресса, параллакс обложки, наклон телефонов, поэтапное появление.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* полоса прогресса чтения */
  var bar = document.createElement('div'); bar.className = 'tr-progress'; bar.innerHTML = '<span></span>';
  document.body.appendChild(bar);
  var fill = bar.firstChild, tick = false;
  function prog() {
    tick = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    fill.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(prog); } }, { passive: true }); prog();

  if (reduce) return;
  document.documentElement.classList.add('tr-anim');

  /* обложка: плавный вход, лёгкий параллакс при прокрутке и сдвиг за курсором */
  var hero = document.querySelector('.dk-hero .hero-img'), wrap = document.querySelector('.dk-hero .hero-wrap');
  if (hero && wrap) {
    requestAnimationFrame(function () { hero.classList.add('is-in'); });
    var py = 0, mx = 0, my = 0, hraf = 0;
    function heroFrame() {
      hraf = 0;
      hero.style.setProperty('--py', py.toFixed(1) + 'px');
      hero.style.setProperty('--mx', mx.toFixed(1) + 'px');
      hero.style.setProperty('--my', my.toFixed(1) + 'px');
    }
    window.addEventListener('scroll', function () {
      if (window.scrollY > 1600) return;
      py = window.scrollY * 0.12; if (!hraf) hraf = requestAnimationFrame(heroFrame);
    }, { passive: true });
    if (finePointer) {
      wrap.addEventListener('mousemove', function (e) {
        var r = wrap.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * -14; my = ((e.clientY - r.top) / r.height - 0.5) * -10;
        if (!hraf) hraf = requestAnimationFrame(heroFrame);
      });
      wrap.addEventListener('mouseleave', function () { mx = 0; my = 0; if (!hraf) hraf = requestAnimationFrame(heroFrame); });
    }
  }

  /* поэтапное появление групп */
  function stagger(sel, step, cls) {
    $(sel).forEach(function (group) {
      var kids = group.matches('ul, .pills, .flow-row') ? $(':scope > *', group) : [group];
      kids.forEach(function (k, i) { k.classList.add('tr-st'); k.style.setProperty('--si', i * (step || 90) + 'ms'); if (cls) k.classList.add(cls); });
    });
  }
  stagger('.team-cards', 110, 'tr-pop');
  stagger('.pills', 80, 'tr-pop');
  stagger('.tr-zone .zitem', 140, 'tr-pop');
  stagger('.flow-row', 90, 'tr-pop');
  $('.tr-flow .flow-scroll img, .tr-about img.a').forEach(function (el) { el.classList.add('tr-wipe'); });
  $('.dsec h2').forEach(function (h) { h.classList.add('tr-h'); });
  /* проверка по положению на экране (IntersectionObserver не видит элементы, скрытые clip-path) */
  var pending = $('.tr-st, .tr-wipe, .tr-h'), chk = false;
  function check() {
    chk = false; var vh = window.innerHeight;
    pending = pending.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return true;
      if (r.top < vh * 0.9 && r.bottom > 0) { el.classList.add('tr-in'); return false; }
      return true;
    });
    if (!pending.length) { window.removeEventListener('scroll', req); window.removeEventListener('resize', req); }
  }
  function req() { if (!chk) { chk = true; requestAnimationFrame(check); } }
  window.addEventListener('scroll', req, { passive: true }); window.addEventListener('resize', req);
  check();

  /* наклон телефонов за курсором (4–6°), подъём и тень */
  if (finePointer) {
    $('.dsec img.a, .dsec .a img, .dsec figure img').forEach(function (img) {
      if (!/\/(main|flow|recip|type|recur|confirm|web|swift|key|result|phone|m-|p-|ph-)/i.test(img.src) && !img.closest('.tr-split, .tr-main, .tr-web, .tr-key, .tr-swift')) return;
      if (img.closest('.flow-scroll, .case-end') || img.classList.contains('ic')) return;
      img.classList.add('tr-tilt');
      var raf = 0, ax = 0, ay = 0, an = 0;
      function go() { raf = 0; img.style.rotate = an ? (ax.toFixed(3) + ' ' + ay.toFixed(3) + ' 0 ' + an.toFixed(2) + 'deg') : 'none'; }
      img.addEventListener('mousemove', function (e) {
        var r = img.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        var rx = -ny * 10, ry = nx * 12, mag = Math.sqrt(rx * rx + ry * ry);
        an = Math.min(6, mag); ax = mag ? rx / mag : 0; ay = mag ? ry / mag : 0;
        if (!raf) raf = requestAnimationFrame(go);
      });
      img.addEventListener('mouseleave', function () { an = 0; if (!raf) raf = requestAnimationFrame(go); });
    });
  }
})();
