/*
 * Cookies: a glass card over a blurred page, two answers.
 *
 * Nothing of the site is readable until the visitor answers — the page behind
 * is blurred out and scroll is locked. Two choices, said plainly:
 *   😄 allow Google statistics to count the visit  → loads gtag (mcLoadGA in <head>)
 *   😢 visit incognito                              → nothing is loaded, ever
 *
 * Google Analytics is not loaded before a "yes" (see the snippet in <head>),
 * so "incognito" means exactly that, not "cookieless pings".
 */
(function () {
  var KEY = 'mencare_cookie_consent';
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
  if (stored === 'accepted' || stored === 'declined') return;

  var T = {
    ru: {
      title: 'Cookies', q: 'Как вы хотите посетить сайт?',
      yes: 'Разрешаю Google-статистику', yesHint: 'Google Analytics анонимно учтёт посещение — так мы понимаем, что улучшать.',
      no: 'Посетить сайт инкогнито', noHint: 'Только необходимое для работы сайта. Никакой статистики.',
      note: 'Выбор можно изменить, очистив данные сайта в браузере.'
    },
    uk: {
      title: 'Cookies', q: 'Як ви хочете відвідати сайт?',
      yes: 'Дозволяю Google-статистику', yesHint: 'Google Analytics анонімно врахує відвідування — так ми розуміємо, що покращувати.',
      no: 'Відвідати сайт інкогніто', noHint: 'Лише необхідне для роботи сайту. Жодної статистики.',
      note: 'Вибір можна змінити, очистивши дані сайту в браузері.'
    },
    cs: {
      title: 'Cookies', q: 'Jak chcete web navštívit?',
      yes: 'Povoluji statistiku Google', yesHint: 'Google Analytics anonymně započítá návštěvu — díky tomu víme, co zlepšit.',
      no: 'Navštívit web anonymně', noHint: 'Jen to, co web nezbytně potřebuje. Žádná statistika.',
      note: 'Volbu změníte vymazáním dat webu v prohlížeči.'
    },
    pl: {
      title: 'Cookies', q: 'Jak chcesz odwiedzić stronę?',
      yes: 'Zezwalam na statystyki Google', yesHint: 'Google Analytics anonimowo policzy wizytę — dzięki temu wiemy, co ulepszać.',
      no: 'Odwiedź stronę incognito', noHint: 'Tylko to, co niezbędne do działania strony. Żadnych statystyk.',
      note: 'Wybór zmienisz, czyszcząc dane strony w przeglądarce.'
    },
    en: {
      title: 'Cookies', q: 'How would you like to visit the site?',
      yes: 'Allow Google statistics', yesHint: 'Google Analytics counts the visit anonymously — it shows us what to improve.',
      no: 'Visit incognito', noHint: 'Only what the site needs to work. No statistics at all.',
      note: 'You can change this by clearing the site data in your browser.'
    }
  };
  var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  var t = T[lang] || T.en;

  var css = [
    '.mcc{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;',
    'background:rgba(12,14,32,.55);-webkit-backdrop-filter:blur(26px) saturate(140%);backdrop-filter:blur(26px) saturate(140%);',
    'font-family:inherit;animation:mcc-in .35s ease-out}',
    '.mcc.out{animation:mcc-out .35s ease-in forwards}',
    '.mcc-card{width:100%;max-width:420px;border-radius:26px;padding:24px 20px 18px;color:#fff;',
    'background:linear-gradient(145deg,rgba(255,255,255,.22),rgba(255,255,255,.08));border:1px solid rgba(255,255,255,.35);',
    'box-shadow:0 30px 80px -20px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.45);',
    '-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px)}',
    '.mcc-head{display:flex;align-items:center;gap:10px;margin-bottom:4px}',
    '.mcc-cookie{font-size:34px;line-height:1;display:inline-block;animation:mcc-roll 4s ease-in-out infinite}',
    '.mcc-title{font-size:22px;font-weight:800;letter-spacing:.02em}',
    '.mcc-q{font-size:15px;opacity:.9;margin:0 0 16px}',
    '.mcc-opt{display:flex;width:100%;align-items:center;gap:12px;text-align:left;cursor:pointer;color:#fff;font:inherit;',
    'border-radius:18px;padding:14px;margin-bottom:10px;border:1px solid rgba(255,255,255,.28);',
    'background:rgba(255,255,255,.10);transition:transform .15s,background .2s,border-color .2s}',
    '.mcc-opt:hover{transform:translateY(-1px);background:rgba(255,255,255,.17)}',
    '.mcc-opt:focus-visible{outline:2px solid #fff;outline-offset:2px}',
    /* yes: light-blue glass, an empty heart beating until tapped; no: orange glass, grey broken heart */
    '.mcc-yes{background:linear-gradient(135deg,rgba(186,228,255,.42),rgba(125,200,245,.16));border-color:rgba(160,215,255,.85);',
    'box-shadow:0 12px 32px -12px rgba(56,160,240,.8),inset 0 1px 0 rgba(255,255,255,.4)}',
    '.mcc-yes:hover{background:linear-gradient(135deg,rgba(186,228,255,.55),rgba(125,200,245,.24))}',
    '.mcc-no{background:linear-gradient(135deg,rgba(253,186,116,.34),rgba(251,146,60,.14));border-color:rgba(251,160,90,.6);opacity:.86}',
    '.mcc-no:hover{opacity:1;background:linear-gradient(135deg,rgba(253,186,116,.42),rgba(251,146,60,.2))}',
    '.mcc-emo{font-size:34px;line-height:1;flex-shrink:0;display:inline-block;transition:transform .3s}',
    '.mcc-yes .mcc-emo{animation:mcc-bob 1.8s ease-in-out infinite}',
    '.mcc-no .mcc-emo{filter:grayscale(.35)}',
    '.mcc-txt b{display:block;font-size:15.5px;margin-bottom:2px}',
    '.mcc-txt span{display:block;font-size:12.5px;line-height:1.4;opacity:.85}',
    '.mcc-box{margin-left:auto;flex-shrink:0;width:38px;height:38px;display:flex;align-items:center;justify-content:center;transition:transform .25s}',
    '.mcc-box svg{width:32px;height:32px;overflow:visible}',
    '.mcc-box path{fill:transparent;stroke-width:2;stroke-linejoin:round;stroke-linecap:round;transition:fill .25s}',
    '.mcc-yes .mcc-box{animation:mcc-beat 1.3s ease-in-out infinite}',
    '.mcc-yes .mcc-box path{stroke:#fb7185}',
    '.mcc-yes:hover .mcc-box{animation-duration:.6s}',
    '.mcc-no .mcc-box path{stroke:#d1d5db}',
    '.mcc-yes.on .mcc-box{animation:mcc-pop .5s ease-out both}',
    '.mcc-yes.on .mcc-box path{fill:#f43f5e;stroke:#f43f5e}',
    '.mcc-no.on .mcc-box{transform:translateY(2px) rotate(-10deg)}',
    '.mcc-no.on .mcc-box path{fill:#9ca3af}',
    '.mcc-yes.on .mcc-emo{animation:mcc-jump .6s ease-out}',
    '.mcc-no.on .mcc-emo{transform:rotate(-12deg) translateY(3px)}',
    '.mcc-note{font-size:11.5px;opacity:.7;text-align:center;margin:6px 0 0}',
    '@keyframes mcc-in{from{opacity:0}to{opacity:1}}',
    '@keyframes mcc-out{to{opacity:0;visibility:hidden}}',
    '@keyframes mcc-roll{0%,80%,100%{transform:rotate(0)}88%{transform:rotate(-18deg)}94%{transform:rotate(12deg)}}',
    '@keyframes mcc-bob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-3px) rotate(-6deg)}}',
    '@keyframes mcc-pop{0%{transform:scale(.8)}50%{transform:scale(1.45) rotate(-8deg)}100%{transform:scale(1.15)}}',
    '@keyframes mcc-beat{0%,40%,100%{transform:scale(1) rotate(0)}10%{transform:scale(1.2) rotate(-6deg)}20%{transform:scale(.95) rotate(4deg)}30%{transform:scale(1.14) rotate(-3deg)}}',
    '@keyframes mcc-jump{0%{transform:scale(1)}30%{transform:translateY(-10px) scale(1.25) rotate(-10deg)}60%{transform:translateY(0) scale(1.1) rotate(8deg)}100%{transform:scale(1)}}',
    '@media (prefers-reduced-motion:reduce){.mcc *,.mcc{animation:none!important;transition:none!important}}'
  ].join('');

  function build() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var root = document.createElement('div');
    root.className = 'mcc';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'mcc-title');
    root.innerHTML =
      '<div class="mcc-card">' +
        '<div class="mcc-head"><span class="mcc-cookie" aria-hidden="true">🍪</span>' +
        '<span class="mcc-title" id="mcc-title">' + t.title + '</span></div>' +
        '<p class="mcc-q">' + t.q + '</p>' +
        '<button type="button" class="mcc-opt mcc-no" data-v="declined">' +
          '<span class="mcc-emo" aria-hidden="true">🙁</span>' +
          '<span class="mcc-txt"><b>' + t.no + '</b><span>' + t.noHint + '</span></span>' +
          '<span class="mcc-box" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11.2 19.9C8.6 18.2 4 14.8 2.5 11.5 1 7.9 3.3 4.5 6.8 4.5c2 0 3.4 1 4.6 2.5l-1.2 3.2 2.2 2.4-1.6 3.1z"/><path d="M13.6 6.6c1.3-1.2 2.4-2.1 3.6-2.1 3.5 0 5.8 3.4 4.3 7-1.5 3.4-6.2 6.9-8.8 8.6l.6-3.6 1.7-3.2-2.3-2.5z"/></svg></span></button>' +
        '<button type="button" class="mcc-opt mcc-yes" data-v="accepted">' +
          '<span class="mcc-emo" aria-hidden="true">😄</span>' +
          '<span class="mcc-txt"><b>' + t.yes + '</b><span>' + t.yesHint + '</span></span>' +
          '<span class="mcc-box" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.4-9.5-9C1 7.9 3.3 4.5 6.8 4.5c2.2 0 3.7 1.3 5.2 3 1.5-1.7 3-3 5.2-3 3.5 0 5.8 3.4 4.3 7-2 4.6-9.5 9-9.5 9Z"/></svg></span></button>' +
        '<p class="mcc-note">' + t.note + '</p>' +
      '</div>';
    document.body.appendChild(root);

    // Nothing behind the card can be read or scrolled until there is an answer.
    var html = document.documentElement;
    var prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    var done = false;
    root.addEventListener('click', function (e) {
      var opt = e.target.closest ? e.target.closest('.mcc-opt') : null;
      if (!opt || done) return;
      done = true;
      var v = opt.getAttribute('data-v');
      opt.classList.add('on');
      if (v === 'declined') opt.querySelector('.mcc-emo').textContent = '😢';
      try { if (navigator.vibrate) navigator.vibrate(v === 'accepted' ? [20, 40, 20] : 15); } catch (err) { /* no vibration */ }
      try { localStorage.setItem(KEY, v); } catch (err) { /* asked again next visit */ }
      if (v === 'accepted' && typeof window.mcLoadGA === 'function') window.mcLoadGA();
      setTimeout(function () {
        root.classList.add('out');
        setTimeout(function () {
          html.style.overflow = prevOverflow;
          root.remove();
        }, 380);
      }, 650);
    });

    var first = root.querySelector('.mcc-yes');
    if (first) first.focus({ preventScroll: true });
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
