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
    '.mcc-yes{background:linear-gradient(135deg,rgba(52,211,153,.38),rgba(16,185,129,.18));border-color:rgba(110,231,183,.7);',
    'box-shadow:0 10px 30px -12px rgba(16,185,129,.8)}',
    '.mcc-yes:hover{background:linear-gradient(135deg,rgba(52,211,153,.5),rgba(16,185,129,.26))}',
    '.mcc-emo{font-size:34px;line-height:1;flex-shrink:0;display:inline-block;transition:transform .3s}',
    '.mcc-yes .mcc-emo{animation:mcc-bob 1.8s ease-in-out infinite}',
    '.mcc-txt b{display:block;font-size:15.5px;margin-bottom:2px}',
    '.mcc-txt span{display:block;font-size:12.5px;line-height:1.4;opacity:.85}',
    '.mcc-box{margin-left:auto;flex-shrink:0;width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;',
    'border:2px solid rgba(255,255,255,.75);font-size:18px;font-weight:900;color:transparent;transition:all .2s}',
    '.mcc-yes .mcc-box{border-color:#6ee7b7;background:rgba(16,185,129,.25);animation:mcc-buzz 1.6s ease-in-out infinite}',
    '.mcc-no .mcc-box{border-color:rgba(255,255,255,.45)}',
    '.mcc-opt.on .mcc-box{color:#fff;background:#10b981;border-color:#10b981;animation:mcc-pop .4s ease-out}',
    '.mcc-no.on .mcc-box{background:rgba(255,255,255,.35);border-color:rgba(255,255,255,.6)}',
    '.mcc-yes.on .mcc-emo{animation:mcc-jump .6s ease-out}',
    '.mcc-no.on .mcc-emo{transform:rotate(-12deg) translateY(3px)}',
    '.mcc-note{font-size:11.5px;opacity:.7;text-align:center;margin:6px 0 0}',
    '@keyframes mcc-in{from{opacity:0}to{opacity:1}}',
    '@keyframes mcc-out{to{opacity:0;visibility:hidden}}',
    '@keyframes mcc-roll{0%,80%,100%{transform:rotate(0)}88%{transform:rotate(-18deg)}94%{transform:rotate(12deg)}}',
    '@keyframes mcc-bob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-3px) rotate(-6deg)}}',
    '@keyframes mcc-buzz{0%,60%,100%{transform:translate(0) rotate(0) scale(1)}64%{transform:translate(-2px,0) rotate(-8deg) scale(1.08)}',
    '68%{transform:translate(2px,0) rotate(8deg) scale(1.08)}72%{transform:translate(-2px,0) rotate(-6deg)}76%{transform:translate(2px,0) rotate(5deg)}80%{transform:translate(0) rotate(0)}}',
    '@keyframes mcc-pop{0%{transform:scale(.5)}60%{transform:scale(1.3)}100%{transform:scale(1)}}',
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
        '<button type="button" class="mcc-opt mcc-yes" data-v="accepted">' +
          '<span class="mcc-emo" aria-hidden="true">😄</span>' +
          '<span class="mcc-txt"><b>' + t.yes + '</b><span>' + t.yesHint + '</span></span>' +
          '<span class="mcc-box" aria-hidden="true">✓</span></button>' +
        '<button type="button" class="mcc-opt mcc-no" data-v="declined">' +
          '<span class="mcc-emo" aria-hidden="true">🙁</span>' +
          '<span class="mcc-txt"><b>' + t.no + '</b><span>' + t.noHint + '</span></span>' +
          '<span class="mcc-box" aria-hidden="true">✓</span></button>' +
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
