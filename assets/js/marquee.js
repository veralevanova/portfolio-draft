// Лента экранов: плывёт сама и дополнительно сдвигается при прокрутке страницы.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.marquee').forEach(function (box) {
    var track = box.querySelector('.marquee__track');
    if (!track || reduce.matches) return;
    var auto = 0, last = performance.now(), half = 0, visible = true;
    var SPEED = 28;          // px в секунду
    var SCROLL_FACTOR = 0;   // прокрутка страницы на ленту не влияет
    function measure() { half = track.scrollWidth / 2; }
    measure();
    window.addEventListener('resize', measure);
    track.querySelectorAll('img').forEach(function (img) { img.addEventListener('load', measure); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { rootMargin: '200px' }).observe(box);
    }
    function frame(now) {
      var dt = Math.min(now - last, 100) / 1000; last = now;
      if (visible && half > 0) {
        auto += SPEED * dt;
        var x = (auto + window.scrollY * SCROLL_FACTOR) % half;
        track.style.transform = 'translate3d(' + (-x) + 'px,0,0)';
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
})();
