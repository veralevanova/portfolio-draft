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


  /* вкладки внутри секций */
  $('.dsec--tabs').forEach(function (sec) {
    var tabs = $('.dtab', sec), panels = $('.dpanel', sec);
    function pick(i, focus, init) {
      tabs.forEach(function (t, k) { var on = k === i; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
      panels.forEach(function (p, k) { p.classList.toggle('is-active', k === i); });
      /* то, что было скрыто во вкладке, показываем сразу */
      if (init) return;
      requestAnimationFrame(function () { $('[data-reveal], .ds-st, .ds-h', panels[i]).forEach(function (el) { el.classList.add('is-in', 'ds-in'); }); });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); pick((i + 1) % tabs.length, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); pick((i + tabs.length - 1) % tabs.length, true); }
      });
    });
    pick(0, false, true);
  });


  /* живая палитра */
  (function () {
    var pal = document.getElementById('palLive');
    if (!pal) return;
    var use = {
      'teal/400': 'button/primary/bg/default · основной цвет действий',
      'teal/500': 'button/primary/bg/hover · наведение',
      'teal/600': 'button/primary/bg/pressed · нажатие',
      'teal/300': 'акценты и границы в активных состояниях',
      'teal/200': 'мягкие фоны и выделения',
      'teal/100': 'фон подсказок и бейджей',
      'teal/50': 'самый светлый фон секций',
      'teal/700': 'тёмный текст на светлом teal',
      'teal/800': 'самый тёмный teal · заголовки в акцентных блоках',
      'purple/400': 'вторичный акцент',
      'purple/500': 'вторичный акцент · hover',
      'purple/600': 'вторичный акцент · pressed',
      'purple/300': 'декоративные элементы',
      'purple/200': 'мягкий фон вторичных блоков',
      'purple/100': 'фон вторичных бейджей',
      'purple/50': 'самый светлый фиолетовый фон'
    };
    var sw = pal.querySelectorAll('.pal-sw'), box = pal.querySelector('.pal-info__sw'),
        nm = pal.querySelector('.pal-info__name'), us = pal.querySelector('.pal-info__use'),
        cp = pal.querySelector('.pal-copy'), cur = '#0C81A0', t;
    function sel(b) {
      sw.forEach(function (x) { x.classList.toggle('is-on', x === b); });
      var key = b.dataset.scale + '/' + b.dataset.step;
      cur = b.dataset.hex;
      box.style.background = cur;
      nm.textContent = key;
      us.textContent = use[key] || 'шаг шкалы ' + b.dataset.scale;
      cp.innerHTML = 'Скопировать HEX <em>' + cur + '</em>';
    }
    sw.forEach(function (b) { b.addEventListener('click', function () { sel(b); }); });
    cp.addEventListener('click', function () {
      try { navigator.clipboard.writeText(cur); } catch (e) {}
      cp.innerHTML = 'Скопировано <em>' + cur + '</em>';
      clearTimeout(t);
      t = setTimeout(function () { cp.innerHTML = 'Скопировать HEX <em>' + cur + '</em>'; }, 1400);
    });
    sel(pal.querySelector('[data-scale="teal"][data-step="400"]'));
  })();

  /* было → стало */
  (function () {
    var c = document.getElementById('chaos');
    if (!c) return;
    var f = c.querySelector('.chaos__field'), btns = c.querySelectorAll('.chaos__tg button');
    var teal = ['#F3F9FA','#E0F2F8','#B3DFF0','#80CBE7','#0C81A0','#0B748F','#096078','#064C60','#043B4A'];
    var pur = ['#F7F2F7','#F3E7F6','#E1C3EA','#CF9FDE','#842385','#731E74','#601A62'];
    var seed = 7;
    function r() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var N = 98, cols = 16, per = Math.ceil(N / cols), all = teal.concat(pur);
    for (var i = 0; i < N; i++) {
      var d = document.createElement('i'), col = i % cols, row = Math.floor(i / cols);
      d.className = 'chaos__dot';
      var s1 = 8 + r() * 16;
      d.style.cssText = '--x:' + (r() * 96).toFixed(1) + '%;--y:' + (r() * 88).toFixed(1) + '%;--s:' + s1.toFixed(0) + 'px;' +
        '--c:hsl(' + Math.floor(r() * 360) + ' ' + (35 + Math.floor(r() * 50)) + '% ' + (35 + Math.floor(r() * 40)) + '%);' +
        '--x2:' + (2 + col * 6.1).toFixed(1) + '%;--y2:' + (4 + row * (88 / per)).toFixed(1) + '%;--s2:10px;' +
        '--c2:' + (col < 9 ? teal[col] : pur[col - 9]) + ';--d:' + (i * 6) + 'ms';
      f.appendChild(d);
    }
    var touched = false;
    function mode(m) {
      c.classList.toggle('is-now', m === 'now');
      btns.forEach(function (b) { b.classList.toggle('is-on', b.dataset.mode === m); });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { touched = true; mode(b.dataset.mode); }); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) {
          io.disconnect();
          setTimeout(function () { if (!touched) mode('now'); }, reduce ? 0 : 1500);
        }
      }, { threshold: .6 });
      io.observe(c);
    }
  })();

  /* конфигуратор Button */
  (function () {
    var pg = document.getElementById('pg');
    if (!pg) return;
    var b = pg.querySelector('.dbtn'), code = document.getElementById('pgCode');
    var st = { type: 'primary', state: 'default', size: 'md', icon: 'off' };
    pg.querySelectorAll('.pg-chip').forEach(function (ch) {
      ch.addEventListener('click', function () {
        var g = ch.dataset.g;
        st[g] = ch.dataset.v;
        pg.querySelectorAll('.pg-chip[data-g="' + g + '"]').forEach(function (x) { x.classList.toggle('is-on', x === ch); });
        b.dataset.type = st.type; b.dataset.state = st.state; b.dataset.size = st.size; b.dataset.icon = st.icon;
        code.textContent = 'variant=' + st.type + ' · state=' + st.state + ' · size=' + st.size + ' · iconOnly=' + (st.icon === 'on');
      });
    });
  })();

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
