/*
 * MenCare news strip: the clinic's articles from ZORYX, drawn natively.
 *
 * It replaces the embedded widget, which sat in a fixed-height frame: titles
 * were cut, covers shrank to a stamp in the middle of each card. Here every
 * card has a full-width cover, a two-line title and a three-line description,
 * in the page's language; the strip scrolls sideways. A card opens the
 * article over the page (ZORYX's single-article view), Esc or ✕ closes it.
 *
 * Markup: <div id="mc-news" data-clinic="AAA_mencare_clinic"></div>
 */
(function () {
  'use strict';
  var box = document.getElementById('mc-news');
  if (!box) return;
  var CLINIC = box.getAttribute('data-clinic');
  var page = (document.documentElement.lang || 'cs').slice(0, 2);
  var lang = { cs: 'cs', en: 'en', ru: 'ru', uk: 'uk', pl: 'en' }[page] || 'cs';
  var READ = { cs: 'Číst', en: 'Read', ru: 'Читать', uk: 'Читати', pl: 'Czytaj' }[page] || 'Číst';
  var CLOSE = { cs: 'Zavřít', en: 'Close', ru: 'Закрыть', uk: 'Закрити', pl: 'Zamknij' }[page] || 'Zavřít';

  var css =
    '.mcn{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px 4px 18px;-webkit-overflow-scrolling:touch}' +
    '.mcn::-webkit-scrollbar{height:8px}.mcn::-webkit-scrollbar-thumb{background:#c9e4dd;border-radius:8px}' +
    '.mcn-card{flex:0 0 min(340px,82vw);scroll-snap-align:start;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 14px 30px -18px rgba(17,63,54,.35);display:flex;flex-direction:column;cursor:pointer;text-align:left;border:1px solid #e3efec;padding:0;font:inherit;color:inherit}' +
    '.mcn-card:hover{transform:translateY(-2px);transition:transform .2s}' +
    '.mcn-img{aspect-ratio:16/9;width:100%;object-fit:cover;background:#e3f4f0;display:block}' +
    '.mcn-body{padding:16px 18px 18px;display:flex;flex-direction:column;gap:8px;flex:1}' +
    '.mcn-date{font-size:12px;color:#54988b;font-weight:600}' +
    '.mcn-title{font-size:17px;line-height:1.3;font-weight:700;color:#113f36;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:0}' +
    '.mcn-text{font-size:14px;line-height:1.5;color:#2E3836;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;margin:0;flex:1}' +
    '.mcn-read{font-size:14px;font-weight:700;color:#113f36}' +
    '.mcn-ov{position:fixed;inset:0;z-index:2147483647;background:rgba(15,14,39,.9);display:flex;flex-direction:column}' +
    '.mcn-bar{display:flex;justify-content:flex-end;padding:10px}' +
    '.mcn-x{border:0;border-radius:999px;padding:10px 18px;background:#fff;color:#113f36;font-weight:700;cursor:pointer}' +
    '.mcn-ov iframe{flex:1;border:0;width:100%;max-width:900px;margin:0 auto;border-radius:16px 16px 0 0;background:#0f0e27}';

  function pick(v) {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v[lang] || v.cs || v.en || v.ru || v.uk || '';
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function date(iso) {
    try { return new Date(iso).toLocaleDateString(page === 'uk' ? 'uk-UA' : page, { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return ''; }
  }

  var overlay = null;
  function close() {
    if (!overlay) return;
    overlay.remove(); overlay = null;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  function open(id) {
    close();
    overlay = document.createElement('div');
    overlay.className = 'mcn-ov';
    overlay.innerHTML = '<div class="mcn-bar"><button class="mcn-x" type="button">✕ ' + CLOSE + '</button></div>' +
      '<iframe title="ZORYX" src="https://zoryx.app/clinic/articles/' + encodeURIComponent(CLINIC) + '?lang=' + lang + '&article=' + encodeURIComponent(id) + '"></iframe>';
    overlay.querySelector('.mcn-x').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
  }

  fetch('https://zoryx.app/api/articles?clinicId=' + encodeURIComponent(CLINIC) + '&limit=12')
    .then(function (r) { return r.ok ? r.json() : { articles: [] }; })
    .then(function (data) {
      var list = (data.articles || []).filter(function (a) { return pick(a.title); });
      var section = box.closest('section');
      if (!list.length) { if (section) section.style.display = 'none'; return; }
      var style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
      box.className = 'mcn';
      box.innerHTML = list.map(function (a) {
        return '<button class="mcn-card" type="button" data-id="' + esc(a.articleId) + '">' +
          (a.photoUrl ? '<img class="mcn-img" loading="lazy" alt="" src="' + esc(a.photoUrl) + '">' : '<div class="mcn-img"></div>') +
          '<div class="mcn-body"><span class="mcn-date">' + esc(date(a.createdAt)) + '</span>' +
          '<h3 class="mcn-title">' + esc(pick(a.title)) + '</h3>' +
          '<p class="mcn-text">' + esc(pick(a.description)) + '</p>' +
          '<span class="mcn-read">' + READ + ' →</span></div></button>';
      }).join('');
      box.querySelectorAll('.mcn-card').forEach(function (c) {
        c.addEventListener('click', function () { open(c.getAttribute('data-id')); });
      });
    })
    .catch(function () {
      var section = box.closest('section');
      if (section) section.style.display = 'none';
    });
})();
