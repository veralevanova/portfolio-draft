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

  if (reduce || !('IntersectionObserver' in window)) { document.documentElement.classList.remove('lg-anim'); return; }

  /* схема флоу: порядковый номер шага для каждого узла (ветки растут одновременно) */
  var flow = document.querySelector('.lg-flow');
  if (flow) {
    var k = 0;
    $('.lg-flow__top > *', flow).forEach(function (el) { el.setAttribute('data-st', ''); el.style.setProperty('--st', k++); });
    var down = flow.querySelector('.lg-flow__top + .lg-arrow');
    if (down) { down.setAttribute('data-st', ''); down.style.setProperty('--st', k++); }
    $('.lg-branch', flow).forEach(function (br) {
      $(':scope > *', br).forEach(function (el, n) { el.setAttribute('data-st', ''); el.style.setProperty('--st', k + n); });
    });
  }

  /* манифест: слова проявляются по мере прокрутки */
  var man = document.querySelector('.lg-manifest p');
  var words = [];
  if (man) {
    (function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span'); w.className = 'w'; w.textContent = part; frag.appendChild(w); words.push(w);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR') wrap(ch);
      });
    })(man);
    man.removeAttribute('data-rv');
  }

  /* появление при прокрутке; после появления атрибут снимаем, чтобы работали hover-эффекты */
  document.documentElement.classList.add('js-reveal');
  var cnt = new Map();
  var els = $('.lg [data-rv]');
  els.forEach(function (el) {
    var g = el.parentElement, n = cnt.get(g) || 0;
    el.style.setProperty('--d', Math.min(n, 6) * 70 + 'ms'); cnt.set(g, n + 1);
  });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; el.classList.add('is-in'); io.unobserve(el);
      setTimeout(function () { el.removeAttribute('data-rv'); }, 1100);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });

  /* прокрутка: параллакс телефонов и слова манифеста */
  var pars = $('[data-par]');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var vh = window.innerHeight;
    pars.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var mid = r.top + r.height / 2 - vh / 2;
      // телефоны поднимаются на место, пока блок доезжает до центра экрана (вверх не уходят — снизу обрез)
      el.style.transform = 'translate3d(0,' + Math.max(0, mid * parseFloat(el.getAttribute('data-par'))).toFixed(1) + 'px,0)';
    });
    if (words.length) {
      var mr = man.getBoundingClientRect();
      var p = (vh * 0.85 - mr.top) / (vh * 0.45);
      var on = Math.round(Math.max(0, Math.min(1, p)) * words.length);
      words.forEach(function (w, i) { w.classList.toggle('on', i < on); });
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll); onScroll();

  /* обложка: лёгкий наклон картинки за курсором */
  var hv = document.querySelector('.lg-hero__visual'), hi = hv && hv.querySelector('img');
  if (hv && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hv.addEventListener('mousemove', function (e) {
      var r = hv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      hi.style.transform = 'rotateY(' + (x * 6).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg) scale(1.01)';
    });
    hv.addEventListener('mouseleave', function () { hi.style.transform = ''; });
  }

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
