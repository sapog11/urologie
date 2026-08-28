/**
 * Ближайшее свободное время записи из ZORYX.
 *
 * Блок — кнопка: клик открывает ту же модалку записи, что и остальные кнопки
 * на странице, но виджет открывается с уже выбранным врачом и днём. Пациент
 * может сменить и врача, и дату — предвыбор лишь экономит два шага.
 *
 * Блоков на странице несколько: один общий по клинике (в шапке) и по одному
 * в карточках врачей, которые ведут приём. Карточный блок несёт data-doctor —
 * тогда спрашиваем окно именно этого врача, а не самое раннее по клинике,
 * иначе у обоих врачей стояла бы одна и та же дата.
 *
 * Если сервис недоступен или свободных слотов нет, блок остаётся скрытым:
 * лучше не показать ничего, чем показать устаревшую дату.
 */
(function () {
  var CLINIC_ID = 'AAA_mencare_clinic';
  var API = 'https://zoryx.app/api/schedules?mode=next&clinicId=' + CLINIC_ID;
  // Was referenced below but never declared, so building the preselect URL threw
  // a ReferenceError. The throw landed in the .catch() at the bottom, which
  // treats any failure as "service unavailable" — so the block silently kept
  // the old behaviour instead of opening the widget on the shown slot.
  var EMBED = 'https://zoryx.app/clinic/embed/' + CLINIC_ID;

  var LOCALES = {
    ru: { locale: 'ru-RU', today: 'сегодня', tomorrow: 'завтра', at: 'в' },
    uk: { locale: 'uk-UA', today: 'сьогодні', tomorrow: 'завтра', at: 'о' },
    cs: { locale: 'cs-CZ', today: 'dnes', tomorrow: 'zítra', at: 'v' },
    en: { locale: 'en-GB', today: 'today', tomorrow: 'tomorrow', at: 'at' },
    pl: { locale: 'pl-PL', today: 'dziś', tomorrow: 'jutro', at: 'o' }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var boxes = document.querySelectorAll('[data-next-slot]');
    if (!boxes.length) return;

    var lang = (document.documentElement.lang || 'ru').slice(0, 2);
    var cfg = LOCALES[lang] || LOCALES.ru;
    var widgetLang = lang === 'uk' ? 'uk' : (LOCALES[lang] ? lang : 'en');

    Array.prototype.forEach.call(boxes, function (box) {
      var valueEl = box.querySelector('[data-next-slot-value]');
      if (!valueEl) return;

      var doctorId = box.getAttribute('data-doctor') || '';
      var url = API + (doctorId ? '&doctorId=' + encodeURIComponent(doctorId) : '');

      fetch(url)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (!data || !data.date) return;

          var slot = new Date(data.date + 'T' + (data.time || '09:00') + ':00');
          if (isNaN(slot.getTime())) return;

          var dayDiff = Math.round(
            (new Date(data.date) - new Date(new Date().toISOString().slice(0, 10))) / 86400000
          );

          var dayText;
          if (dayDiff === 0) dayText = cfg.today;
          else if (dayDiff === 1) dayText = cfg.tomorrow;
          else dayText = new Intl.DateTimeFormat(cfg.locale, { day: 'numeric', month: 'long' }).format(slot);

          valueEl.textContent = data.time ? dayText + ' ' + cfg.at + ' ' + data.time : dayText;

          // Открываем виджет на том же слоте, что показан в блоке: тот врач и
          // тот день, у которого время свободно. Пациент может сменить и врача,
          // и дату — предвыбор лишь экономит два шага.
          var embedUrl = EMBED + '?lang=' + widgetLang + '&date=' + encodeURIComponent(data.date);
          if (data.doctorId) embedUrl += '&doctor=' + encodeURIComponent(data.doctorId);
          if (data.time) embedUrl += '&time=' + encodeURIComponent(data.time);

          box.addEventListener('click', function () {
            var frame = document.getElementById('zoryx-booking-widget');
            if (frame) frame.src = embedUrl;

            // Переиспользуем существующую кнопку записи, чтобы не дублировать
            // логику открытия модалки (блокировка скролла, aria, фокус).
            var opener = document.querySelector('[data-appointment-btn]');
            if (opener) opener.click();
          });

          box.hidden = false;
        })
        .catch(function () { /* сервис недоступен — блок не показываем */ });
    });
  });
})();
