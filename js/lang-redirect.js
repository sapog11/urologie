/**
 * Отправляет посетителя на его язык при заходе на корень сайта.
 *
 * Корень — русский, и он же x-default. Чех, пришедший по чешскому запросу,
 * попадал на русскую страницу и закрывал её, не поняв, что чешская версия
 * вообще есть. Здесь мы смотрим языки браузера и уводим на свою версию.
 *
 * Правила, которые важнее самого перенаправления:
 *
 * 1. Только с корня. Прямая ссылка на /ru/ или /cs/ — это уже выбор, и спорить
 *    с ним нельзя: иначе присланная кому-то ссылка открывалась бы не тем.
 * 2. Один раз. Выбор запоминается, и посетитель, который сам вернулся на
 *    русскую версию, больше не будет улетать с неё при каждом заходе.
 * 3. ?nr=1 отключает. Нужно, чтобы можно было показать кому-то именно корень.
 *
 * Языковые версии перечислены в <link rel="alternate" hreflang> на всех
 * страницах, поэтому поисковики находят и индексируют каждую независимо от
 * того, куда этот скрипт уводит живого посетителя.
 */
(function () {
  'use strict';

  var KEY = 'mencare-lang';

  // Русский — это корень, отдельной страницы для него нет.
  var ROUTES = {
    cs: '/cs/',
    sk: '/cs/',   // словаку чешская версия ближе любой другой
    uk: '/ua/',
    pl: '/pl/',
    ru: null,
    en: '/en/'
  };

  function remember(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) { /* приватный режим */ }
  }

  function remembered() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  var path = location.pathname.replace(/index\.html$/, '');
  var onRoot = path === '/' || path === '';

  // На языковой странице просто запоминаем, где посетитель оказался: если он
  // пришёл сюда сам или переключился в шапке, корень больше не должен спорить.
  if (!onRoot) {
    var here = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
    if (here) remember(here);
    return;
  }

  if (location.search.indexOf('nr=1') > -1) return;

  var choice = remembered();
  if (choice) {
    // Уже выбирал. Уважаем выбор, но только если он не «остаться здесь».
    var saved = ROUTES[choice];
    if (saved) location.replace(saved);
    return;
  }

  var langs = navigator.languages || [navigator.language || ''];
  for (var i = 0; i < langs.length; i++) {
    var code = String(langs[i]).slice(0, 2).toLowerCase();
    if (!(code in ROUTES)) continue;

    remember(code);
    var target = ROUTES[code];
    // Русский уже здесь — запомнили и остаёмся.
    if (target) location.replace(target);
    return;
  }

  // Язык, которого у нас нет: английская версия — самый безопасный запасной
  // вариант, русская для такого посетителя точно не подходит.
  remember('en');
  location.replace(ROUTES.en);
})();
