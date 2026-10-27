// Кейс «Банковские переводы»: вкладки шагов, полоса прогресса, поэтапное появление.
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

  /* вкладки: получатель / тип перевода / параметры */
  var tabs = $('.steps-tab'), panels = $('.steps-panel');
  if (tabs.length) {
    var box = document.querySelector('.tr-steps');
    if (box) box.classList.add('steps-nudge');
    function stopNudge() { if (box) box.classList.remove('steps-nudge'); }
    function pick(i, focus) {
      tabs.forEach(function (t, k) { var on = k === i; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
      panels.forEach(function (p, k) { p.classList.toggle('is-active', k === i); });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { stopNudge(); pick(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); pick((i + 1) % tabs.length, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); pick((i + tabs.length - 1) % tabs.length, true); }
      });
    });
    var names = ['Получатель', 'Тип перевода', 'Параметры перевода'];
    panels.forEach(function (pn, i) {
      var txt = pn.querySelector('.txt'); if (!txt) return;
      var nx = (i + 1) % panels.length;
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'steps-next';
      btn.innerHTML = (i === panels.length - 1 ? 'Сначала: ' : 'Дальше: ') + names[nx] + ' <span>→</span>';
      btn.addEventListener('click', function () { stopNudge(); pick(nx); });
      txt.appendChild(btn);
    });
    pick(0);
  }

  if (reduce) return;
  document.documentElement.classList.add('tr-anim');

  /* обложка: плавный вход, только плавное появление, без движения */
  var hero = document.querySelector('.dk-hero .hero-img'), wrap = document.querySelector('.dk-hero .hero-wrap');
  if (hero && wrap) {
    requestAnimationFrame(function () { hero.classList.add('is-in'); });
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


})();
