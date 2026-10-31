// Кейс «Вход и регистрация»: переключатель статусов, появление блоков, счётчики.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* переключатель статусов под ноутбуком: вкладка меняет экран (crossfade 250 мс) */
  var tabs = $('.lg-seg [role="tab"]');
  var shots = $('.lg-switch__screen img');
  var cap = document.getElementById('sw-cap');
  var caps = [
    '<b>Нет аккаунта:</b> окно «Email не найден» → Blocked Account и онбординг',
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
    if (cap) cap.innerHTML = caps[i] + ' <a class="lg-switch__link" href="#flow">Смотреть на схеме ↓</a>';
    if (window.lgFlowSelect) window.lgFlowSelect(i);
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

  /* мини-прототип: ввод кода → ошибка → новая попытка; таймер идёт по-настоящему */
  (function () {
    var ph = document.querySelector('.lg-ph'); if (!ph) return;
    var boxes = $('.lg-ph__code span', ph), code = ph.querySelector('.lg-ph__code');
    var err = ph.querySelector('.lg-ph__err'), btn = ph.querySelector('.lg-ph__btn'), exp = ph.querySelector('.lg-ph__exp b');
    var bad = ['9', '2', '5', '1'], good = ['7', '3', '8', '4'], digits = bad;
    var okScr = ph.querySelector('.lg-ph__ok');
    function setErr(on) { err.classList.toggle('is-on', on); boxes.forEach(function (b) { b.classList.toggle('is-err', on); }); }
    function fill(n) { boxes.forEach(function (b, i) { b.firstChild && b.removeChild(b.firstChild); if (i < n) b.appendChild(document.createTextNode(digits[i])); b.classList.toggle('is-focus', i === n && n < 4); }); btn.classList.toggle('is-on', n === 4); }
    // статичное состояние (без анимации): введённый код и ошибка, как в макете
    if (reduce || !('IntersectionObserver' in window)) { fill(4); setErr(true); return; }
    fill(0);
    var sec = 60, timers = [], running = false, tick = null;
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function type(t0) { digits.forEach(function (d, i) { at(t0 + i * 420, function () { fill(i + 1); }); }); return t0 + 4 * 420 + 500; }
    // попытка 1: неверный код → ошибка; попытка 2: верный код → «Welcome To Fintiba»; затем сначала
    function cycle() {
      timers.forEach(clearTimeout); timers = [];
      okScr.classList.remove('is-on'); boxes.forEach(function (b) { b.classList.remove('is-ok'); });
      digits = bad; setErr(false); fill(0);
      var t = type(700);
      at(t, function () { btn.classList.add('is-press'); });
      at(t + 180, function () { btn.classList.remove('is-press'); setErr(true); code.classList.remove('is-shake'); void code.offsetWidth; code.classList.add('is-shake'); });
      t += 2600;
      at(t, function () { digits = good; setErr(false); fill(0); });
      t = type(t + 400);
      at(t, function () { btn.classList.add('is-press'); });
      at(t + 180, function () { btn.classList.remove('is-press'); boxes.forEach(function (b) { b.classList.add('is-ok'); }); });
      at(t + 650, function () { okScr.classList.add('is-on'); });
      at(t + 4200, function () { cycle(); });
    }
    function start() {
      if (running) return; running = true; cycle();
      tick = setInterval(function () { sec = sec > 1 ? sec - 1 : 60; exp.textContent = sec + 's'; }, 1000);
    }
    function stop() { running = false; timers.forEach(clearTimeout); timers = []; clearInterval(tick); }
    var inView = false;
    new IntersectionObserver(function (e) { inView = e[0].isIntersecting; inView ? start() : stop(); }, { threshold: .3 }).observe(ph.closest('.lg-proto'));
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (inView) start(); });
  })();

  /* схема флоу: «пользователь» (светящаяся точка) идёт от входа по одной из трёх веток.
     Вкладка переключателя под ноутбуком выбирает ветку. */
  (function () {
    var fl = document.querySelector('.lg-flow'); if (!fl) return;
    var branches = $('.lg-branch', fl);
    var top = $('.lg-flow__top .lg-node', fl);
    var sel = 0;
    function mark(i) { branches.forEach(function (b, j) { b.classList.toggle('is-sel', j === i); }); }
    mark(sel);
    var dot = null, runId = 0, inView = false, ready = false;
    window.lgFlowSelect = function (i) { sel = i; mark(i); if (dot && inView && ready) run(i); };
    if (reduce || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
    dot = document.createElement('span'); dot.className = 'lg-dot'; dot.setAttribute('aria-hidden', 'true'); fl.appendChild(dot);
    function pt(el) { var r = el.getBoundingClientRect(), f = fl.getBoundingClientRect(); return [r.left - f.left + r.width / 2, r.top - f.top + r.height / 2]; }
    function hit(el) { el.classList.remove('is-hit'); void el.offsetWidth; el.classList.add('is-hit'); }
    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function move(a, b, ms) {
      return dot.animate([{ transform: 'translate(' + a[0] + 'px,' + a[1] + 'px)' }, { transform: 'translate(' + b[0] + 'px,' + b[1] + 'px)' }],
        { duration: ms, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'forwards' }).finished;
    }
    function run(i) {
      var id = ++runId;
      var alive = function () { return id === runId && inView; };
      fl.classList.add('is-run');
      branches.forEach(function (b, j) { b.classList.toggle('is-path', j === i); });
      var br = branches[i];
      var stops = top.concat([br.querySelector('.btag')], $('.lg-node', br));
      var pts = stops.map(pt);
      dot.classList.add('is-on');
      var chain = move(pts[0], pts[0], 1).then(function () { hit(stops[0]); return wait(350); });
      for (var k = 1; k < stops.length; k++) {
        (function (k) {
          chain = chain.then(function () {
            if (!alive()) throw 0;
            // на телефоне ветки стоят друг под другом: чтобы точка не шла поверх чужой ветки, она «перепрыгивает»
            var stacked = branches[1] && branches[1].offsetTop > branches[0].offsetTop + 10;
            if (k === top.length && stacked && i > 0) {
              dot.classList.remove('is-on');
              return wait(350).then(function () { return move(pts[k], pts[k], 1); }).then(function () { dot.classList.add('is-on'); return wait(300); });
            }
            return move(pts[k - 1], pts[k], k === top.length ? 700 : 520);
          })
                       .then(function () { if (!alive()) throw 0; hit(stops[k]); return wait(stops[k].classList.contains('lg-node--q') ? 650 : 280); });
        })(k);
      }
      chain.then(function () { return wait(1400); })
           .then(function () { if (!alive()) throw 0; dot.classList.remove('is-on'); return wait(500); })
           .then(function () { if (!alive()) throw 0; run((i + 1) % branches.length); })
           .catch(function () {});
    }
    function stop() { runId++; dot.classList.remove('is-on'); fl.classList.remove('is-run'); branches.forEach(function (b) { b.classList.remove('is-path'); }); }
    new IntersectionObserver(function (e) {
      inView = e[0].isIntersecting;
      if (!inView) { stop(); return; }
      // ждём, пока узлы схемы проявятся, потом запускаем «пользователя» с выбранной ветки
      setTimeout(function () { ready = true; if (inView) run(sel); }, ready ? 300 : 2300);
    }, { threshold: .35 }).observe(fl);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (inView && ready) run(sel); });
  })();

  /* прогресс чтения по разделам (как в кейсе онбординга): номера слева и полоса сверху */
  (function () {
    var secs = [['task', 'Задача и решение'], ['process', 'Процесс'], ['flow', 'Сценарий флоу'], ['decisions', 'Ключевые решения'], ['result', 'Результат']]
      .map(function (x) { return [document.getElementById(x[0]), x[1]]; }).filter(function (x) { return x[0]; });
    if (!secs.length) return;
    var nav = document.createElement('nav'); nav.className = 'sec-nav'; nav.setAttribute('aria-label', 'Разделы кейса');
    var bar = document.createElement('div'); bar.className = 'sec-nav__bar'; bar.innerHTML = '<span></span>';
    var items = secs.map(function (x, i) {
      var a = document.createElement('a'); a.href = '#' + x[0].id;
      a.innerHTML = '<b>0' + (i + 1) + '</b><span>' + x[1] + '</span>';
      a.addEventListener('click', function (e) { e.preventDefault(); x[0].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); });
      nav.appendChild(a); return a;
    });
    document.body.appendChild(nav); document.body.appendChild(bar);
    var fill = bar.firstChild, tk = false;
    function track() {
      tk = false;
      var y = window.innerHeight * 0.35, cur = -1;
      // номер подсвечен, только пока читаешь сам раздел (между разделами — ничего)
      secs.forEach(function (x, i) { var r = x[0].getBoundingClientRect(); if (r.top <= y && r.bottom > y) cur = i; });
      var any = secs[0][0].getBoundingClientRect().top <= y;
      items.forEach(function (a, i) { a.classList.toggle('is-current', i === cur); if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      nav.classList.toggle('is-visible', any && secs[secs.length - 1][0].getBoundingClientRect().bottom > 0);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
      bar.classList.toggle('is-visible', window.scrollY > 200);
    }
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(track); } }, { passive: true });
    window.addEventListener('resize', track); track();
  })();

  /* мобильное приложение: телефоны сложены; при наведении курсора правый выезжает из-за левого и появляются выноски.
     На сенсорных экранах (наведения нет) телефоны сразу раскрыты. */
  (function () {
    var duo = document.querySelector('.lg-duo-ph'); if (!duo || reduce) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var card = duo.closest('.lg-mcard') || duo;
    duo.classList.add('is-fold');
    card.addEventListener('mouseenter', function () { duo.classList.remove('is-fold'); });
    card.addEventListener('mouseleave', function () { duo.classList.add('is-fold'); });
  })();

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
  // на телефоне параллакс выключен: меньше движения и плавнее прокрутка
  var pars = window.matchMedia('(min-width: 861px)').matches ? $('[data-par]') : [];
  var ticking = false;
  function onScroll() {
    ticking = false;
    var vh = window.innerHeight;
    // страховка: при быстрой прокрутке наблюдатель может пропустить блок — всё, что уже выше низа экрана, показываем сразу
    els.forEach(function (el) { if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < vh) { el.classList.add('is-in'); io.unobserve(el); setTimeout(function () { el.removeAttribute('data-rv'); }, 1100); } });
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
