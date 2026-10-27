// Кнопка «Наверх»: появляется после прокрутки, плавно возвращает к началу страницы.
(function () {
  var btn = document.querySelector('.to-top');
  if (!btn) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function update() { btn.classList.toggle('is-visible', window.scrollY > 600); }
  window.addEventListener('scroll', update, { passive: true });
  update();
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
    var target = document.querySelector('.skip-link') || document.body;
    setTimeout(function () { target.focus({ preventScroll: true }); }, reduce.matches ? 0 : 600);
  });
})();
