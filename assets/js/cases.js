// Страницы кейсов: шапка, появление, панель разделов, лайтбокс, счётчики, подсветки.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* шапка: фон с размытием после прокрутки */
  var header = document.querySelector('.site-header, .dk-head');
  function onScroll() { if (header) header.classList.toggle('is-stuck', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* лайтбокс: картинки открываются в полном размере */
  var zoomSel = '.wide-figure img, .branches img, .phones img, .final-fig img, .ribbon .strip, .legend, .pair .after img, .cimg img, .dsec figure img, .about-case .screen img, img[data-zoom]';
  var box;
  function openBox(src, alt) {
    if (!box) {
      box = document.createElement('div'); box.className = 'lightbox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Просмотр изображения');
      box.innerHTML = '<button class="lightbox__close" type="button" aria-label="Закрыть">×</button><div class="lightbox__scroll"><img alt=""></div>';
      document.body.appendChild(box);
      box.addEventListener('click', function (e) { if (e.target !== box.querySelector('img')) closeBox(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeBox(); });
    }
    var im = box.querySelector('img'); im.src = src; im.alt = alt || '';
    box.classList.add('is-open'); document.body.classList.add('lb-open');
    box.querySelector('.lightbox__close').focus();
  }
  function closeBox() { if (box) { box.classList.remove('is-open'); document.body.classList.remove('lb-open'); } }
  $(zoomSel).forEach(function (el) {
    var img = el.tagName === 'IMG' ? el : el.querySelector('img'); if (!img) return;
    if (img.closest('a, .case-end')) return;
    img.classList.add('is-zoomable'); img.tabIndex = 0; img.setAttribute('role', 'button');
    function go() { openBox(img.currentSrc || img.src, img.alt); }
    img.addEventListener('click', go);
    img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });

  /* панель разделов 01–05 (кейс онбординга) */
  var dividers = $('.divider[aria-labelledby]');
  if (dividers.length > 1) {
    var nav = document.createElement('nav'); nav.className = 'sec-nav'; nav.setAttribute('aria-label', 'Разделы кейса');
    var bar = document.createElement('div'); bar.className = 'sec-nav__bar'; bar.innerHTML = '<span></span>';
    var items = dividers.map(function (d, i) {
      var h = d.querySelector('h2'), a = document.createElement('a');
      var n = (d.querySelector('.big-num') || {}).textContent || ('0' + (i + 1));
      a.href = '#' + d.id; a.innerHTML = '<b>' + n + '</b><span>' + (h ? h.textContent : '') + '</span>';
      if (!d.id) { d.id = 'sec-' + (i + 1); a.href = '#' + d.id; }
      a.addEventListener('click', function (e) { e.preventDefault(); d.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); });
      nav.appendChild(a); return a;
    });
    document.body.appendChild(nav); document.body.appendChild(bar);
    var barFill = bar.firstChild;
    function track() {
      var y = window.scrollY + window.innerHeight * 0.35, cur = -1;
      dividers.forEach(function (d, i) { if (d.getBoundingClientRect().top + window.scrollY <= y) cur = i; });
      items.forEach(function (a, i) { a.classList.toggle('is-current', i === cur); });
      nav.classList.toggle('is-visible', cur >= 0);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      barFill.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
      bar.classList.toggle('is-visible', window.scrollY > 200);
    }
    window.addEventListener('scroll', track, { passive: true }); track();
  }

  /* карточки аннотаций: цифры по очереди пульсируют, при наведении подсвечивается нужная */
  var ann = $('.annotations li');
  if (ann.length && !reduce) {
    var k = 0, timer = null, hovering = false;
    function pulse() { if (hovering) return; ann.forEach(function (li, i) { li.classList.toggle('is-pulse', i === k); }); k = (k + 1) % ann.length; }
    var box2 = document.querySelector('.annotations');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { if (!timer) { pulse(); timer = setInterval(pulse, 1400); } }
        else { clearInterval(timer); timer = null; ann.forEach(function (li) { li.classList.remove('is-pulse'); }); }
      }, { threshold: .3 }).observe(box2);
    }
    ann.forEach(function (li, i) {
      li.addEventListener('mouseenter', function () { hovering = true; ann.forEach(function (x, j) { x.classList.toggle('is-pulse', j === i); }); });
      li.addEventListener('mouseleave', function () { hovering = false; });
    });
  }

  if (reduce || !('IntersectionObserver' in window)) return;

  /* появление при прокрутке: 24 px → 0, 400 мс, задержка 60 мс по очереди */
  var revealSel = '.card, .scope-item, .annotations li, .pair, .insights > *, .learnings > *, .goal > *, .research > *, .branches > *, .split > *, .table-wrap, .case-hero .grid > *, .dsec .a';
  var els = $(revealSel).filter(function (el) { return !el.closest('.case-end'); });
  root.classList.add('js-reveal');
  var cnt = new Map();
  els.forEach(function (el) {
    el.setAttribute('data-reveal', '');
    if (el.matches('.dsec .a')) el.setAttribute('data-reveal', 'fade');
    var g = el.parentElement, n = cnt.get(g) || 0; el.style.setProperty('--d', Math.min(n, 6) * 60 + 'ms'); cnt.set(g, n + 1);
  });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });

  /* счётчики в карточках: числа считаются от 0 при появлении */
  $('.about-case .big, .results .big, .stat .big').forEach(function (el) {
    var txt = el.textContent; if (!/\d/.test(txt)) return;
    var parts = txt.split(/(\d+)/), nums = parts.map(function (p) { return /^\d+$/.test(p) ? +p : null; });
    var done = false;
    new IntersectionObserver(function (e, ob) {
      if (!e[0].isIntersecting || done) return; done = true; ob.disconnect();
      var t0 = performance.now(), dur = 900;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
        el.textContent = parts.map(function (s, i) { return nums[i] === null ? s : Math.round(nums[i] * ease); }).join('');
        if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
      })(t0);
    }, { threshold: .6 }).observe(el);
  });

  /* таблица конкурентов: колонка «после» подсвечивается при появлении */
  $('.cmp').forEach(function (t) {
    new IntersectionObserver(function (e, ob) { if (e[0].isIntersecting) { t.classList.add('is-lit'); ob.disconnect(); } }, { threshold: .35 }).observe(t);
  });

  /* большие номера разделов двигаются медленнее текста (параллакс 0.8) */
  var bigs = $('.divider .big-num');
  if (bigs.length) {
    var ticking = false;
    function par() {
      ticking = false;
      bigs.forEach(function (b) {
        var r = b.parentElement.getBoundingClientRect(), mid = r.top + r.height / 2 - window.innerHeight / 2;
        b.style.transform = 'translate3d(0,' + (mid * 0.2).toFixed(1) + 'px,0)';
      });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(par); } }, { passive: true }); par();
  }
})();
