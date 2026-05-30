'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  bindGlobalHandlers();
  initAboutSlider();
  initLanguageDropdown();
  initSectionSpyNavigation();
  initDoctorCvAccordion();
  initFaqAccordion();
});

function initMobileMenu() {
  const toggleButton = document.querySelector('.topbar__menu-btn');
  const menu = document.getElementById('mobile-menu');
  const panel = menu?.querySelector('.mobile-menu__panel');
  const overlay = menu?.querySelector('.mobile-menu__overlay');
  const closeButton = menu?.querySelector('.mobile-menu__close');
  const navLinks = menu?.querySelectorAll('.mobile-menu__nav-link');
  const mobileQuery = window.matchMedia('(max-width: 1199px)');

  if (!toggleButton || !menu || !panel || !overlay || !closeButton) {
    return;
  }

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  let isOpen = false;

  const isMobileOrTablet = () => mobileQuery.matches;

  const getFocusableElements = () => {
    return Array.from(panel.querySelectorAll(focusableSelector)).filter((element) => {
      return !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden');
    });
  };

  const lockBodyScroll = () => {
    document.body.classList.add('menu-open');
  };

  const unlockBodyScroll = () => {
    document.body.classList.remove('menu-open');
  };

  const openMenu = () => {
    if (isOpen || !isMobileOrTablet()) return;

    isOpen = true;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    toggleButton.setAttribute('aria-expanded', 'true');
    lockBodyScroll();

    requestAnimationFrame(() => {
      closeButton.focus();
    });
  };

  const closeMenu = ({ returnFocus = true } = {}) => {
    if (!isOpen) return;
  
    isOpen = false;
  
    // запускаем анимацию закрытия (панель уезжает, overlay тухнет)
    menu.classList.remove('is-open');
    menu.classList.add('is-closing');
  
    menu.setAttribute('aria-hidden', 'true');
    toggleButton.setAttribute('aria-expanded', 'false');
  
    // скролл можно разблокировать сразу или после анимации — на твой вкус
    unlockBodyScroll();
  
    const finishClose = () => {
      menu.classList.remove('is-closing');
  
      if (returnFocus && isMobileOrTablet()) {
        toggleButton.focus();
      }
    };
  
    // дождёмся окончания transition панели
    const onEnd = (e) => {
      if (e.target !== panel || e.propertyName !== 'transform') return;
      panel.removeEventListener('transitionend', onEnd);
      finishClose();
    };
  
    panel.addEventListener('transitionend', onEnd);
  
    // fallback, если transitionend не сработает
    setTimeout(() => {
      panel.removeEventListener('transitionend', onEnd);
      finishClose();
    }, 450); // чуть больше, чем 0.32s в CSS
  };

  const onPanelKeydown = (event) => {
    if (!isOpen || event.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  toggleButton.addEventListener('click', () => {
    if (!isMobileOrTablet()) return;
    if (isOpen) closeMenu();
    else openMenu();
  });

  closeButton.addEventListener('click', () => {
    closeMenu();
  });

  overlay.addEventListener('click', () => {
    closeMenu();
  });

  navLinks?.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu({ returnFocus: false });
    });
  });

  panel.addEventListener('keydown', onPanelKeydown);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      closeMenu();
    }
  });

  mobileQuery.addEventListener('change', (event) => {
    if (!event.matches) {
      closeMenu({ returnFocus: false });
    }
  });
}

function bindGlobalHandlers() {
  // TODO: Close menu by Escape key.
  // TODO: Close menu by click outside navigation area.
  // TODO: Bind future global handlers.
}

// Language dropdown
function initLanguageDropdown() {
  const dropdown = document.querySelector('[data-lang-dropdown]');
  if (!dropdown) return;

  const trigger = dropdown.querySelector('[data-lang-trigger]');
  const menu = dropdown.querySelector('[data-lang-menu]');
  const options = dropdown.querySelectorAll('.topbar__lang-option');

  if (!trigger || !menu) return;

  let isOpen = false;

  const openMenu = () => {
    if (isOpen) return;
    isOpen = true;

    dropdown.classList.add('is-open');
    menu.hidden = false;

    // Небольшой rAF, чтобы transition/animation отрабатывали плавно
    requestAnimationFrame(() => {
      menu.classList.add('is-visible');
    });

    trigger.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    if (!isOpen) return;
    isOpen = false;

    dropdown.classList.remove('is-open');
    menu.classList.remove('is-visible');
    trigger.setAttribute('aria-expanded', 'false');

    // Скрываем после завершения анимации
    const onTransitionEnd = (e) => {
      if (e.target !== menu) return;
      menu.hidden = true;
      menu.removeEventListener('transitionend', onTransitionEnd);
    };

    menu.addEventListener('transitionend', onTransitionEnd);

    // fallback, если transition не сработал
    setTimeout(() => {
      if (!isOpen) menu.hidden = true;
    }, 250);
  };

  const toggleMenu = () => {
    if (isOpen) closeMenu();
    else openMenu();
  };

  // Клик по кнопке
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Клик внутри меню (по ссылке) — закрываем меню, переход выполнит браузер
  menu.addEventListener('click', (e) => {
    const option = e.target.closest('.topbar__lang-option');
    if (!option) return;

    closeMenu();
    // Не делаем preventDefault — ссылка должна сработать
  });

  // Закрытие по клику вне меню
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      closeMenu();
    }
  });

  // Закрытие по Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      trigger.focus();
    }
  });

  // (Опционально) Управление стрелками по меню
  dropdown.addEventListener('keydown', (e) => {
    if (!isOpen) return;

    const items = [...options];
    const currentIndex = items.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
      items[nextIndex]?.focus();
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
      items[prevIndex]?.focus();
    }

    if (e.key === 'Tab') {
      // По желанию можно закрывать при tab-out
      // closeMenu();
    }
  });
}

function initAboutSlider() {
  const aboutSlider = document.getElementById('aboutSlider');

  if (!aboutSlider || typeof Splide === 'undefined') {
    return;
  }

  new Splide('#aboutSlider', {
    type: 'loop',
    perPage: 1,
    arrows: true,
    pagination: true,
    autoplay: false,
    speed: 400,
    drag: true,
  }).mount();
}

function initSectionSpyNavigation() {
  const nav = document.querySelector('.hero-nav');
  if (!nav) return;

  // Берём только ссылки с hash, у которых реально есть секция в DOM
  const links = Array.from(nav.querySelectorAll('.hero-nav__link[href^="#"]')).filter((link) => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return false;
    return document.querySelector(hash);
  });

  if (!links.length) return;

  const items = links.map((link) => ({
    link,
    section: document.querySelector(link.getAttribute('href')),
  }));

  let activeId = null;
  let ticking = false;

  function setActiveLink(linkToActivate) {
    items.forEach(({ link }) => {
      const isActive = link === linkToActivate;
      link.classList.toggle('hero-nav__link--active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function clearActiveLink() {
    items.forEach(({ link }) => {
      link.classList.remove('hero-nav__link--active');
      link.removeAttribute('aria-current');
    });
  }

  function getTopOffset() {
    // Учитываем фиксированный header (если он sticky/fixed)
    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.offsetHeight : 0;

    // Небольшой запас, чтобы переключение происходило визуально комфортно
    return headerHeight + 16;
  }

  function updateActiveSection() {
    const offset = getTopOffset();
    const scrollMarker = window.scrollY + offset;

    // Если мы ещё выше первой секции — можно снять активный пункт
    const firstSectionTop = items[0].section.offsetTop;
    if (scrollMarker < firstSectionTop) {
      if (activeId !== null) {
        activeId = null;
        clearActiveLink();
      }
      return;
    }

    // Ищем последнюю секцию, верх которой уже прошёл "маркер"
    let currentItem = items[0];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (scrollMarker >= item.section.offsetTop) {
        currentItem = item;
      } else {
        break;
      }
    }

    const newActiveId = currentItem.section.id;

    if (newActiveId !== activeId) {
      activeId = newActiveId;
      setActiveLink(currentItem.link);
    }
  }

  function requestUpdate() {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(() => {
      updateActiveSection();
      ticking = false;
    });
  }

  // Обновляем при скролле/ресайзе
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);

  // Если кликают по ссылке — можно сразу визуально подсветить
  nav.addEventListener('click', (e) => {
    const link = e.target.closest('.hero-nav__link[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    // Мгновенная подсветка (до завершения скролла)
    setActiveLink(link);
  });

  // Начальное состояние
  updateActiveSection();
}

function initFaqAccordion() {
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;

  items.forEach((item) => {
    const btn = item.querySelector('.faq__question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      // Close all
      items.forEach((i) => i.classList.remove('is-open'));
      // Toggle clicked
      if (!isOpen) item.classList.add('is-open');
    });
  });
}

function initDoctorCvAccordion() {
  const cv = document.querySelector('.doctor-page .cv');
  if (!cv) return;

  const mobileQuery = window.matchMedia('(max-width: 500px)');
  const PREVIEW_ITEMS_COUNT = 2;

  const sections = Array.from(
    cv.querySelectorAll('.cv__section--collapsible')
  )
    .map((section) => {
      const button = section.querySelector('.cv__toggle');
      const content = section.querySelector('.cv__content');

      if (!button || !content) return null;

      return {
        section,
        button,
        content,
        isExpanded: false,
        isAnimating: false,
        collapsedHeight: 0,
        fullHeight: 0,
      };
    })
    .filter(Boolean);

  if (!sections.length) return;

  const setButtonState = (item, expanded) => {
    item.button.textContent = expanded ? 'Свернуть' : 'Читать далее';
    item.button.setAttribute('aria-expanded', String(expanded));
  };

  const getCollapsedHeight = (content) => {
    const items = Array.from(content.querySelectorAll('.cv__item'));

    if (!items.length) return 0;
    if (items.length <= PREVIEW_ITEMS_COUNT) return content.scrollHeight;

    const visibleLastItem = items[PREVIEW_ITEMS_COUNT - 1];
    const contentRect = content.getBoundingClientRect();
    const lastItemRect = visibleLastItem.getBoundingClientRect();
    const lastItemStyles = window.getComputedStyle(visibleLastItem);
    const marginBottom = parseFloat(lastItemStyles.marginBottom) || 0;

    return Math.ceil(lastItemRect.bottom - contentRect.top + marginBottom);
  };

  const measureItem = (item) => {
    const prevHeight = item.content.style.height;
    const prevOverflow = item.content.style.overflow;

    item.content.style.height = 'auto';
    item.content.style.overflow = 'visible';

    item.fullHeight = item.content.scrollHeight;
    item.collapsedHeight = getCollapsedHeight(item.content);

    item.content.style.height = prevHeight;
    item.content.style.overflow = prevOverflow;
  };

  const setDesktopState = (item) => {
    item.section.classList.remove(
      'is-collapsible',
      'is-collapsed',
      'is-expanded'
    );

    item.button.hidden = true;
    item.button.disabled = true;

    item.content.style.height = '';
    item.content.style.overflow = '';
    item.content.style.transition = '';

    item.isExpanded = false;
    item.isAnimating = false;

    setButtonState(item, false);
  };

  const setMobileState = (item, preserveExpandedState = true) => {
    measureItem(item);

    const needsCollapse = item.fullHeight > item.collapsedHeight + 2;

    item.section.classList.toggle('is-collapsible', needsCollapse);
    item.button.hidden = !needsCollapse;
    item.button.disabled = !needsCollapse;

    if (!needsCollapse) {
      item.section.classList.remove('is-collapsed', 'is-expanded');
      item.content.style.height = 'auto';
      item.content.style.overflow = 'visible';
      item.isExpanded = false;
      item.isAnimating = false;
      setButtonState(item, false);
      return;
    }

    if (!preserveExpandedState) {
      item.isExpanded = false;
    }

    item.content.style.overflow = 'hidden';

    if (item.isExpanded) {
      item.section.classList.add('is-expanded');
      item.section.classList.remove('is-collapsed');
      item.content.style.height = 'auto';
      setButtonState(item, true);
    } else {
      item.section.classList.add('is-collapsed');
      item.section.classList.remove('is-expanded');
      item.content.style.height = `${item.collapsedHeight}px`;
      setButtonState(item, false);
    }
  };

  const openSection = (item) => {
    if (item.isAnimating) return;

    item.isAnimating = true;
    item.isExpanded = true;

    measureItem(item);

    item.section.classList.add('is-expanded');
    item.section.classList.remove('is-collapsed');

    item.content.style.overflow = 'hidden';
    item.content.style.height = `${item.collapsedHeight}px`;

    setButtonState(item, true);

    requestAnimationFrame(() => {
      item.content.style.height = `${item.fullHeight}px`;
    });

    const onTransitionEnd = (event) => {
      if (event.propertyName !== 'height') return;

      item.content.style.height = 'auto';
      item.content.style.overflow = 'visible';
      item.isAnimating = false;

      item.content.removeEventListener('transitionend', onTransitionEnd);
    };

    item.content.addEventListener('transitionend', onTransitionEnd);
  };

  const closeSection = (item) => {
    if (item.isAnimating) return;

    item.isAnimating = true;
    item.isExpanded = false;

    measureItem(item);

    item.section.classList.remove('is-expanded');
    item.section.classList.add('is-collapsed');

    item.content.style.overflow = 'hidden';
    item.content.style.height = `${item.fullHeight}px`;

    setButtonState(item, false);

    requestAnimationFrame(() => {
      item.content.style.height = `${item.collapsedHeight}px`;
    });

    const onTransitionEnd = (event) => {
      if (event.propertyName !== 'height') return;

      item.isAnimating = false;

      item.content.removeEventListener('transitionend', onTransitionEnd);
    };

    item.content.addEventListener('transitionend', onTransitionEnd);
  };

  const syncState = (preserveExpandedState = true) => {
    sections.forEach((item) => {
      if (mobileQuery.matches) {
        setMobileState(item, preserveExpandedState);
      } else {
        setDesktopState(item);
      }
    });
  };

  sections.forEach((item) => {
    setButtonState(item, false);

    item.button.addEventListener('click', () => {
      if (!mobileQuery.matches || item.button.disabled || item.isAnimating) {
        return;
      }

      if (item.isExpanded) {
        closeSection(item);
      } else {
        openSection(item);
      }
    });
  });

  let resizeRaf = null;

  const handleResize = () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);

    resizeRaf = requestAnimationFrame(() => {
      syncState(true);
      resizeRaf = null;
    });
  };

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', handleResize);
  } else {
    mobileQuery.addListener(handleResize);
  }

  window.addEventListener('resize', handleResize);
  window.addEventListener('load', handleResize);

  syncState(false);
}
