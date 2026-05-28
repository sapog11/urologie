document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const reveal = document.querySelector('#topbar-reveal');
    const revealInner = reveal?.querySelector('.topbar__reveal-inner');
    const triggers = [...document.querySelectorAll('[data-reveal-trigger]')];
    const items = [...document.querySelectorAll('[data-reveal-content]')];
    const mobileMq = window.matchMedia('(max-width: 898px)');
  
    if (!header || !reveal || !revealInner || !triggers.length || !items.length) return;
  
    let activeType = null;
    let cleanupTimer = null;

    const addressMapFrame = document.querySelector('.topbar__reveal-map iframe');

const refreshActiveRevealHeight = () => {
  if (!activeType) return;

  const currentItem = getItemByType(activeType);
  if (!currentItem) return;

  const nextHeight = measureItemHeight(currentItem);
  const targetHeight = nextHeight + getRevealInnerVerticalPadding();

  setRevealHeight(targetHeight);
};

if (addressMapFrame) {
  addressMapFrame.addEventListener('load', () => {
    if (activeType === 'address') {
      refreshActiveRevealHeight();
    }
  });
}

window.addEventListener('resize', () => {
  if (mobileMq.matches) {
    refreshActiveRevealHeight();
  }
});
  
    const getItemByType = (type) => {
      return items.find((item) => item.dataset.revealContent === type);
    };
  
    const getRevealInnerVerticalPadding = () => {
      const styles = window.getComputedStyle(revealInner);
      return parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    };
  
    const measureItemHeight = (item) => {
      item.classList.add('is-measuring');
      const height = item.offsetHeight;
      item.classList.remove('is-measuring');
      return height;
    };
  
    const setRevealHeight = (height) => {
      reveal.style.height = `${height}px`;
      document.documentElement.style.setProperty('--header-reveal-shift', `${height}px`);
    };
  
    const syncTriggers = (type = null) => {
      triggers.forEach((button) => {
        const isCurrent = button.dataset.revealTrigger === type;
        button.classList.toggle('is-active', isCurrent);
        button.setAttribute('aria-expanded', String(isCurrent));
      });
    };
  
    const clearItemStates = () => {
      items.forEach((item) => {
        item.classList.remove('is-active', 'is-visible', 'is-leaving', 'is-measuring');
      });
    };
  
    const openReveal = (type) => {
        const nextItem = getItemByType(type);
        if (!nextItem) return;
      
        clearTimeout(cleanupTimer);
      
        const currentItem = activeType ? getItemByType(activeType) : null;
        const nextHeight = measureItemHeight(nextItem);
        const targetHeight = nextHeight + getRevealInnerVerticalPadding();
      
        header.classList.add('is-reveal-open');
        reveal.setAttribute('aria-hidden', 'false');
      
        if (!currentItem) {
          nextItem.classList.add('is-active', 'is-visible');
      
          requestAnimationFrame(() => {
            setRevealHeight(targetHeight);
          });
        } else if (currentItem !== nextItem) {
          nextItem.classList.add('is-active', 'is-visible');
      
          currentItem.classList.remove('is-visible');
          currentItem.classList.add('is-leaving');
      
          requestAnimationFrame(() => {
            setRevealHeight(targetHeight);
          });
      
          cleanupTimer = setTimeout(() => {
            currentItem.classList.remove('is-active', 'is-leaving');
          }, 260);
        } else {
          nextItem.classList.add('is-active', 'is-visible');
          setRevealHeight(targetHeight);
        }
      
        activeType = type;
        syncTriggers(type);
      };
  
    const closeReveal = () => {
      if (!activeType) return;
  
      clearTimeout(cleanupTimer);
  
      const currentItem = getItemByType(activeType);
  
      if (currentItem) {
        currentItem.classList.remove('is-visible');
        currentItem.classList.add('is-leaving');
      }
  
      setRevealHeight(0);
      header.classList.remove('is-reveal-open');
      reveal.setAttribute('aria-hidden', 'true');
      syncTriggers(null);
  
      cleanupTimer = setTimeout(() => {
        clearItemStates();
      }, 420);
  
      activeType = null;
    };
  
    triggers.forEach((button) => {
      button.addEventListener('click', (event) => {
        if (!mobileMq.matches) return;
  
        event.preventDefault();
        event.stopPropagation();
  
        const type = button.dataset.revealTrigger;
  
        if (activeType === type) {
          closeReveal();
          return;
        }
  
        openReveal(type);
      });
    });
  
    document.addEventListener('click', (event) => {
      if (!mobileMq.matches) return;
  
      if (!header.contains(event.target)) {
        closeReveal();
      }
    });
  
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeReveal();
      }
    });
  
    const handleBreakpointChange = (event) => {
      if (!event.matches) {
        clearTimeout(cleanupTimer);
        clearItemStates();
        header.classList.remove('is-reveal-open');
        reveal.setAttribute('aria-hidden', 'true');
        setRevealHeight(0);
        syncTriggers(null);
        activeType = null;
      }
    };
  
    if (mobileMq.addEventListener) {
      mobileMq.addEventListener('change', handleBreakpointChange);
    } else {
      mobileMq.addListener(handleBreakpointChange);
    }
  
    setRevealHeight(0);
  });