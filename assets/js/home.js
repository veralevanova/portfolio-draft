// Главная: закреплённая шапка, появление при прокрутке, наклон телефонов, бургер на мобильном.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* шапка: фон с размытием после прокрутки */
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-stuck', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* бургер */
  var burger = document.querySelector('.burger'), nav = document.getElementById('site-nav');
  if (burger && nav) {
    function close() { header.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
    burger.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  if (reduce) return;

  /* появление при прокрутке: translateY 24 → 0, 400 мс, задержка 60 мс по очереди */
  var targets = document.querySelectorAll('.hero-text > *, .hero-visual, .section .eyebrow, .section-title, .case-card, .about-intro, .facts, .portrait, .info-card, .resume, .contact-card');
  if ('IntersectionObserver' in window) {
    root.classList.add('js-reveal');
    var order = new Map();
    targets.forEach(function (el) {
      el.setAttribute('data-reveal', '');
      var group = el.parentElement, n = order.get(group) || 0;
      el.style.setProperty('--d', Math.min(n, 6) * 60 + 'ms'); order.set(group, n + 1);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* наклон телефонов за курсором (4–6°) */
  var vis = document.querySelector('.hero-visual');
  if (vis && window.matchMedia('(hover: hover)').matches) {
    var raf = 0, tx = 0, ty = 0;
    function apply() { raf = 0; vis.style.setProperty('--ry', tx.toFixed(2) + 'deg'); vis.style.setProperty('--rx', ty.toFixed(2) + 'deg'); }
    vis.addEventListener('mousemove', function (e) {
      var r = vis.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 12;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 10;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    vis.addEventListener('mouseleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); });
    vis.classList.add('is-tilt');
  }
})();
