/*
 * Da Vinci-style engravings of the Versius robot behind the page.
 *
 * The plates were cut into single drawings with the parchment removed
 * (assets/img/decor/*.webp, ink on transparent). One drawing per section,
 * alternating sides and half off the edge, faint, under the text — the long
 * page reads as one illustrated sheet instead of a wall of text. Phones get
 * the small files, fainter and only every other section. Drawn large
 * (about 1.6× their own size) so they read as a backdrop, not as icons. Images load lazily;
 * nothing here takes clicks.
 */
(function () {
  'use strict';
  var base = (document.querySelector('script[src*="decor.js"]').getAttribute('src').indexOf('../') === 0) ? '../' : '';
  var DIR = base + 'assets/img/decor/';
  var ART = ['robot', 'konzole', 'rameno', 'ruce', 'nastroje', 'operace', 'manipulator', 'kruh', 'system', 'nastroje2', 'vitruvius'];
  // natural widths of the desktop files, so each drawing is scaled from its own size
  var NAT = { robot: 507, konzole: 352, rameno: 378, ruce: 378, nastroje: 557, operace: 484, manipulator: 560, kruh: 184, system: 560, nastroje2: 350, vitruvius: 151 };

  var style = document.createElement('style');
  style.textContent =
    '.mc-decor{position:absolute;left:0;top:0;width:100%;pointer-events:none;overflow:hidden;z-index:0}' +
    '.mc-decor img{position:absolute;height:auto;opacity:.2;mix-blend-mode:multiply;' +
    '-webkit-mask-image:radial-gradient(ellipse at center,#000 55%,transparent 78%);mask-image:radial-gradient(ellipse at center,#000 55%,transparent 78%)}' +
    '.container{position:relative;z-index:1}' +
    '@media (max-width:767px){.mc-decor img{opacity:.1}}';
  document.head.appendChild(style);

  var layer = document.createElement('div');
  layer.className = 'mc-decor';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  function place() {
    var mobile = window.innerWidth < 768;
    var docH = document.documentElement.scrollHeight;
    layer.style.height = docH + 'px';
    layer.innerHTML = '';
    var sections = Array.prototype.slice.call(document.querySelectorAll('section')).filter(function (s) {
      if (s.offsetHeight < 220 || s.classList.contains('hero') || s.id === 'hero' || s.id === 'alphamale') return false;
      // no ink on dark sections: it would read as dirt, not as an engraving
      var m = getComputedStyle(s).backgroundColor.match(/\d+/g);
      if (m && m.length >= 3 && (m.length < 4 || +m[3] > 0) && (+m[0] * 0.299 + +m[1] * 0.587 + +m[2] * 0.114) < 140) return false;
      return true;
    });
    var n = 0;
    sections.forEach(function (sec, i) {
      if (mobile && i % 2) return;
      var name = ART[n % ART.length];
      var left = n % 2 === 0;
      n++;
      var r = sec.getBoundingClientRect();
      var top = r.top + window.scrollY + Math.min(60, r.height * 0.15);
      var w = mobile ? Math.round(window.innerWidth * 0.8) : Math.round(Math.min(NAT[name] * 1.6, 820, window.innerWidth * 0.45));
      var img = document.createElement('img');
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = DIR + name + (mobile ? '-s' : '') + '.webp';
      img.style.width = w + 'px';
      img.style.top = Math.round(top) + 'px';
      // half off the edge on desktop, a corner peeking in on phones
      img.style[left ? 'left' : 'right'] = Math.round(-w * (mobile ? 0.4 : 0.28)) + 'px';
      layer.appendChild(img);
    });
  }

  var t;
  function later() { clearTimeout(t); t = setTimeout(place, 250); }
  if (document.readyState === 'complete') place(); else window.addEventListener('load', place);
  window.addEventListener('resize', later);
  // the news strip and other late content change the page height
  if ('ResizeObserver' in window) new ResizeObserver(later).observe(document.body);
})();
