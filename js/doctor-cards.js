/**
 * Collapse the doctor cards on narrow screens.
 *
 * Each card carries a lead paragraph and then six or seven credential lines. On
 * a desktop that reads as a column of substance; on a phone the five cards
 * together ran past seven screens, and a visitor looking for the prices below
 * them gives up first. A closed card now shows three lines of its lead — enough
 * to tell the doctors apart and pick one — and hides the rest behind a toggle.
 *
 * The clamping itself is done in the stylesheet, by line count. An earlier
 * version measured the lead in pixels and wrote an inline max-height, which had
 * to be re-measured on every rotation and font swap, and still cut text
 * mid-line when a language ran longer. The script only decides *whether* a card
 * is folded; how far is a question for CSS.
 *
 * If JavaScript never arrives the card stays fully expanded, which is the safe
 * direction to fail in for a page whose whole job is to be read.
 */
(function () {
  'use strict';

  var QUERY = '(max-width: 670px)';

  var LABELS = {
    ru: { more: 'Подробнее', less: 'Свернуть' },
    cs: { more: 'Více o lékaři', less: 'Skrýt' },
    en: { more: 'More about the doctor', less: 'Hide' },
    uk: { more: 'Детальніше', less: 'Згорнути' },
    pl: { more: 'Więcej o lekarzu', less: 'Zwiń' }
  };

  function labels() {
    var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    return LABELS[lang] || LABELS.en;
  }

  function init() {
    var cards = Array.prototype.slice.call(
      document.querySelectorAll('.doctor-card .doctor-card__details')
    );
    if (!cards.length) return;

    var mq = window.matchMedia(QUERY);
    var text = labels();

    var items = cards.map(function (details) {
      var bio = details.querySelector('.doctor-card__bio');
      if (!bio) return null;

      // Nothing to fold if the card is only a lead paragraph.
      if (bio.children.length < 2) return null;

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'doctor-card__toggle';
      button.setAttribute('aria-expanded', 'false');
      details.appendChild(button);

      var item = { details: details, button: button, open: false };

      button.addEventListener('click', function () {
        setOpen(item, !item.open);
      });

      return item;
    }).filter(Boolean);

    if (!items.length) return;

    function setOpen(item, open) {
      item.open = open;
      item.details.classList.toggle('is-open', open);
      item.button.textContent = open ? text.less : text.more;
      item.button.setAttribute('aria-expanded', String(open));
    }

    function apply() {
      var narrow = mq.matches;
      items.forEach(function (item) {
        if (narrow) {
          item.details.classList.add('is-collapsible');
          item.button.hidden = false;
          setOpen(item, item.open);
        } else {
          item.details.classList.remove('is-collapsible', 'is-open');
          item.button.hidden = true;
        }
      });
    }

    apply();

    if (mq.addEventListener) mq.addEventListener('change', apply);
    else if (mq.addListener) mq.addListener(apply);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * Fold the long "about the clinic" copy on phones.
 *
 * That block is four headed sections, 240 words, and 1600px of uninterrupted
 * reading on a phone — written for search engines, and sitting between the
 * clinic description and the prices, where it stops anybody heading for either.
 * Closed it shows its first section; the rest opens on request. The text stays
 * in the page either way, so nothing changes for a crawler.
 */
(function () {
  'use strict';

  var LABELS = {
    ru: { more: 'Читать подробнее', less: 'Свернуть' },
    cs: { more: 'Číst více', less: 'Skrýt' },
    en: { more: 'Read more', less: 'Hide' },
    uk: { more: 'Читати докладніше', less: 'Згорнути' },
    pl: { more: 'Czytaj więcej', less: 'Zwiń' }
  };

  function init() {
    var block = document.querySelector('.about__seo-text');
    if (!block || block.children.length < 3) return;

    var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    var text = LABELS[lang] || LABELS.en;
    var mq = window.matchMedia('(max-width: 670px)');

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'doctor-card__toggle about__seo-toggle';
    button.setAttribute('aria-expanded', 'false');
    block.parentNode.insertBefore(button, block.nextSibling);

    var open = false;

    function setOpen(next) {
      open = next;
      block.classList.toggle('is-open', open);
      button.textContent = open ? text.less : text.more;
      button.setAttribute('aria-expanded', String(open));
    }

    function apply() {
      if (mq.matches) {
        block.classList.add('is-collapsible');
        button.hidden = false;
        setOpen(open);
      } else {
        block.classList.remove('is-collapsible', 'is-open');
        button.hidden = true;
      }
    }

    button.addEventListener('click', function () { setOpen(!open); });
    apply();

    if (mq.addEventListener) mq.addEventListener('change', apply);
    else if (mq.addListener) mq.addListener(apply);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
