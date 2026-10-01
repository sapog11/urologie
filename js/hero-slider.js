/*
 * Hero slider: slide 1 is the clinic (doctor photo, as before), slide 2 is
 * AlphaMale. The doctor photo is the background of the whole .hero-wrap, so
 * slide 2 fades a deep-green layer over it (.hero-wrap.is-alpha::after) and
 * back. Both slides share one grid cell, so the page never jumps.
 * Changes every 7 s, pauses while hovered or focused, dots and swipe switch
 * by hand; with reduced motion it does not move on its own.
 */
(function () {
  'use strict';
  var hero = document.getElementById('hero');
  if (!hero) return;
  var slides = hero.querySelectorAll('.hero-slide');
  var dots = hero.querySelectorAll('.hero-dots [data-go]');
  var wrap = hero.closest('.hero-wrap') || hero;
  if (slides.length < 2) return;
  var i = 0, timer = null, paused = false;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach(function (s, k) {
      s.classList.toggle('is-active', k === i);
      s.setAttribute('aria-hidden', k === i ? 'false' : 'true');
    });
    dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    wrap.classList.toggle('is-alpha', slides[i].classList.contains('hero-slide--alpha'));
  }
  function start() {
    if (still) return;
    clearInterval(timer);
    timer = setInterval(function () { if (!paused && !document.hidden) show(i + 1); }, 7000);
  }

  dots.forEach(function (d) { d.addEventListener('click', function () { show(+d.getAttribute('data-go')); start(); }); });
  hero.addEventListener('mouseenter', function () { paused = true; });
  hero.addEventListener('mouseleave', function () { paused = false; });
  hero.addEventListener('focusin', function () { paused = true; });
  hero.addEventListener('focusout', function () { paused = false; });

  var x0 = null;
  hero.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) { show(i + (dx < 0 ? 1 : -1)); start(); }
    x0 = null;
  });

  show(0);
  start();
})();
