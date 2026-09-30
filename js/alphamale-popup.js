/*
 * AlphaMale pop-up: the men's supplement sold in Marie Hanclová's online shop
 * (hanclova.lifeproducts.cz), which MenCare recommends. Shows once — after
 * 10 seconds or half the page — and stays away for three days after it is
 * closed. Language from <html lang>; the link goes to the same language of
 * the shop (Polish readers get the English one). Claims stay within the EU
 * health claims; for erection problems the text sends people to the urologist.
 */
(function () {
  'use strict';
  var KEY = 'alphamale-popup-closed';
  var DAYS = 3;
  var SHOP = 'https://hanclova.lifeproducts.cz';
  var PRODUCT = '/produkt/maxi-vita-essentials-muzska-vitalita';

  var T = {
    cs: { path: '', badge: 'Novinka pro muže', title: 'AlphaMale — síla, energie a vitalita',
      text: 'Ženšen sibiřský, maca a ashwagandha se zinkem, selenem, hořčíkem, L-karnitinem a vitaminy D3, B6 a B12. Jedna kapsle ráno.',
      points: ['Zinek pro normální hladinu testosteronu', 'Hořčík a L-karnitin pro svaly a energii', 'Vitaminy B6, B12 a D3 proti únavě'],
      price: '119 Kč', buy: 'Koupit v e-shopu Marie Hanclové', close: 'Zavřít',
      note: 'Doplněk stravy. Při potížích s erekcí se objednejte k urologovi MenCare.' },
    en: { path: '/en', badge: 'New for men', title: 'AlphaMale — strength, energy and vitality',
      text: 'Siberian ginseng, maca and ashwagandha with zinc, selenium, magnesium, L-carnitine and vitamins D3, B6 and B12. One capsule in the morning.',
      points: ['Zinc for normal testosterone levels', 'Magnesium and L-carnitine for muscles and energy', 'Vitamins B6, B12 and D3 against tiredness'],
      price: '119 CZK', buy: 'Buy in Marie Hanclová’s shop', close: 'Close',
      note: 'Food supplement. For erection problems, book a MenCare urologist.' },
    ru: { path: '/ru', badge: 'Новинка для мужчин', title: 'AlphaMale — сила, энергия и мужская выносливость',
      text: 'Сибирский женьшень, мака и ашваганда с цинком, селеном, магнием, L-карнитином и витаминами D3, B6 и B12. Одна капсула утром.',
      points: ['Цинк — для нормального уровня тестостерона', 'Магний и L-карнитин — для мышц и энергии', 'Витамины B6, B12 и D3 — против усталости'],
      price: '119 Kč', buy: 'Купить в магазине Марии Ганцловой', close: 'Закрыть',
      note: 'БАД. При проблемах с эрекцией запишитесь к урологу MenCare.' },
    uk: { path: '/uk', badge: 'Новинка для чоловіків', title: 'AlphaMale — сила, енергія та чоловіча витривалість',
      text: 'Сибірський женьшень, мака й ашваганда з цинком, селеном, магнієм, L-карнітином і вітамінами D3, B6 та B12. Одна капсула вранці.',
      points: ['Цинк — для нормального рівня тестостерону', 'Магній і L-карнітин — для м’язів та енергії', 'Вітаміни B6, B12 і D3 — проти втоми'],
      price: '119 Kč', buy: 'Купити в магазині Марії Ганцлової', close: 'Закрити',
      note: 'Харчова добавка. При проблемах з ерекцією запишіться до уролога MenCare.' },
    pl: { path: '/en', badge: 'Nowość dla mężczyzn', title: 'AlphaMale — siła, energia i witalność',
      text: 'Żeń-szeń syberyjski, maca i ashwagandha z cynkiem, selenem, magnezem, L-karnityną oraz witaminami D3, B6 i B12. Jedna kapsułka rano.',
      points: ['Cynk dla prawidłowego poziomu testosteronu', 'Magnez i L-karnityna dla mięśni i energii', 'Witaminy B6, B12 i D3 przeciw zmęczeniu'],
      price: '119 CZK', buy: 'Kup w sklepie Marie Hanclovej', close: 'Zamknij',
      note: 'Suplement diety. Przy problemach z erekcją umów się do urologa MenCare.' }
  };

  var lang = (document.documentElement.lang || 'cs').slice(0, 2);
  var t = T[lang] || T.cs;

  function closedRecently() {
    try {
      var at = Number(localStorage.getItem(KEY) || 0);
      return at && Date.now() - at < DAYS * 864e5;
    } catch (e) { return false; }
  }
  function remember() {
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* private mode */ }
  }
  if (closedRecently()) return;

  var base = document.querySelector('script[src*="alphamale-popup.js"]');
  var img = (base && base.getAttribute('src').indexOf('../') === 0 ? '../' : '') + 'assets/img/alphamale.webp';
  var href = SHOP + t.path + PRODUCT + '?utm_source=mencare&utm_medium=popup';
  // loaded ahead, so the photo is there the moment the pop-up opens
  new Image().src = img;

  var css =
    '.am-back{position:fixed;inset:0;z-index:10000;background:rgba(17,63,54,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .3s}' +
    '.am-back.am-on{opacity:1}' +
    '.am-card{position:relative;max-width:560px;width:100%;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(0,0,0,.45);display:grid;grid-template-columns:1fr 190px;font-family:inherit;color:#2E3836;transform:translateY(12px);transition:transform .3s}' +
    '.am-on .am-card{transform:none}' +
    '.am-body{padding:26px 22px 22px 26px}' +
    '.am-badge{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#113f36;background:#e3f4f0;border-radius:999px;padding:4px 10px}' +
    '.am-title{margin:12px 0 8px;font-size:22px;line-height:1.2;color:#113f36}' +
    '.am-text{margin:0 0 10px;font-size:14px;line-height:1.5}' +
    '.am-points{list-style:none;margin:0 0 14px;padding:0;font-size:13px;line-height:1.45}' +
    '.am-points li{padding-left:20px;position:relative;margin:4px 0}' +
    '.am-points li:before{content:"✓";position:absolute;left:0;color:#54988b;font-weight:700}' +
    '.am-buy{display:inline-block;background:#113f36;color:#fff;text-decoration:none;font-weight:600;font-size:14px;border-radius:999px;padding:11px 18px}' +
    '.am-buy:hover{background:#54988b}' +
    '.am-price{margin-left:10px;font-weight:700;color:#113f36;white-space:nowrap}' +
    '.am-note{margin:12px 0 0;font-size:11px;color:#808085}' +
    '.am-side{background:linear-gradient(160deg,#e3f4f0,#78c9b9);display:flex;align-items:center;justify-content:center;padding:14px}' +
    '.am-side img{width:100%;height:auto;border-radius:16px;background:#fff}' +
    '.am-x{position:absolute;top:10px;right:10px;width:34px;height:34px;border:0;border-radius:50%;background:rgba(255,255,255,.9);font-size:20px;line-height:1;cursor:pointer;color:#113f36}' +
    '@media (max-width:560px){.am-card{grid-template-columns:1fr}.am-side{order:-1;max-height:180px}.am-side img{width:150px}.am-body{padding:20px}}';

  function show() {
    if (document.querySelector('.am-back') || closedRecently()) return;
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var back = document.createElement('div');
    back.className = 'am-back';
    back.setAttribute('role', 'dialog');
    back.setAttribute('aria-modal', 'true');
    back.setAttribute('aria-label', t.title);
    back.innerHTML =
      '<div class="am-card">' +
        '<button class="am-x" type="button" aria-label="' + t.close + '">×</button>' +
        '<div class="am-body">' +
          '<span class="am-badge">' + t.badge + '</span>' +
          '<h2 class="am-title">' + t.title + '</h2>' +
          '<p class="am-text">' + t.text + '</p>' +
          '<ul class="am-points">' + t.points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
          '<a class="am-buy" href="' + href + '" target="_blank" rel="noopener">' + t.buy + '</a><span class="am-price">' + t.price + '</span>' +
          '<p class="am-note">' + t.note + '</p>' +
        '</div>' +
        '<a class="am-side" href="' + href + '" target="_blank" rel="noopener"><img src="' + img + '" alt="AlphaMale" width="720" height="720"></a>' +
      '</div>';
    document.body.appendChild(back);
    requestAnimationFrame(function () { back.classList.add('am-on'); });

    function close() {
      remember();
      back.classList.remove('am-on');
      document.removeEventListener('keydown', onKey);
      setTimeout(function () { back.remove(); }, 300);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    back.querySelector('.am-x').addEventListener('click', close);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    back.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', remember); });
    document.addEventListener('keydown', onKey);
    back.querySelector('.am-x').focus();
  }

  var timer = setTimeout(show, 10000);
  function onScroll() {
    var h = document.documentElement;
    if ((h.scrollTop + window.innerHeight) / h.scrollHeight > 0.5) {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      show();
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();
