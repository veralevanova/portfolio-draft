// Кейс «Дизайн-система»: полоса прогресса, вход обложки, счётчики, поэтапное появление.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  document.documentElement.classList.add('ds-anim');

  /* обложка: плавное появление, затем цифры */
  var hero = document.querySelector('.dk-hero .hero-img');
  if (hero) requestAnimationFrame(function () { hero.classList.add('is-in'); });

  /* поэтапное появление групп */
  function stagger(sel, step) {
    $(sel).forEach(function (group) {
      $(':scope > *', group).forEach(function (k, i) { k.classList.add('ds-st'); k.style.setProperty('--si', i * (step || 90) + 'ms'); });
    });
  }
  stagger('.ds-stats', 110);
  stagger('.dtiles', 110);
  stagger('.rcards', 110);
  stagger('.role-top', 130);
  stagger('.built .cols', 110);
  $('.process li').forEach(function (k, i) { k.classList.add('ds-st'); k.style.setProperty('--si', i * 90 + 'ms'); });
  $('.btable tbody tr').forEach(function (k, i) { k.classList.add('ds-st', 'ds-row'); k.style.setProperty('--si', i * 70 + 'ms'); });
  $('.dsh h2').forEach(function (h) { h.classList.add('ds-h'); });

  /* появление по положению на экране */
  var pending = $('.ds-st, .ds-h'), chk = false;
  function check() {
    chk = false; var vh = window.innerHeight;
    pending = pending.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return true;
      if (r.top < vh * 0.9 && r.bottom > 0) { el.classList.add('ds-in'); return false; }
      return true;
    });
    if (!pending.length) { window.removeEventListener('scroll', req); window.removeEventListener('resize', req); }
  }
  function req() { if (!chk) { chk = true; requestAnimationFrame(check); } }
  window.addEventListener('scroll', req, { passive: true }); window.addEventListener('resize', req);
  check();

  /* счётчики: числа считаются от 0 при появлении */
  function count(el, dur) {
    var txt = el.textContent; if (!/\d/.test(txt)) return;
    var parts = txt.split(/(\d+)/), nums = parts.map(function (p) { return /^\d+$/.test(p) ? +p : null; });
    var done = false;
    new IntersectionObserver(function (e, ob) {
      if (!e[0].isIntersecting || done) return; done = true; ob.disconnect();
      var t0 = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
        el.textContent = parts.map(function (s, i) { return nums[i] === null ? s : Math.round(nums[i] * ease); }).join('');
        if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
      })(t0);
    }, { threshold: .6 }).observe(el);
  }
  $('.ds-stats b, .stmt .stats b').forEach(function (el) { count(el, 1100); });
  $('.btable .was, .btable .now').forEach(function (el) { count(el, 900); });
})();
