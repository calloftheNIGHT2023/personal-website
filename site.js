'use strict';
(() => {
  const dictionaries = JSON.parse(document.getElementById('site-content').textContent);
  const languageButtons = [...document.querySelectorAll('[data-lang-switch]')];
  let language = 'zh';
  try { language = localStorage.getItem('preferredLanguage') || 'zh'; } catch (_) {}

  function updateClock() {
    const clock = document.querySelector('[data-live-clock]');
    clock.textContent = `BOSTON / ${new Intl.DateTimeFormat('en-GB', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())}`;
  }

  function updateDetailLabels() {
    document.querySelectorAll('.work').forEach(work => {
      work.querySelector('[data-expand-label]').textContent = dictionaries[language][work.open ? 'work.less' : 'work.more'];
    });
  }

  function setLanguage(next) {
    language = dictionaries[next] ? next : 'zh';
    const dictionary = dictionaries[language];
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = dictionary.pageTitle;
    document.querySelector('meta[name="description"]').content = dictionary.metaDescription;
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const text = dictionary[element.dataset.i18n];
      if (text) element.innerHTML = text;
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
      element.alt = dictionary[element.dataset.i18nAlt];
    });
    languageButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.langSwitch === language)));
    updateDetailLabels();
    try { localStorage.setItem('preferredLanguage', language); } catch (_) {}
  }

  languageButtons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.langSwitch)));
  document.querySelectorAll('.work').forEach(work => work.addEventListener('toggle', updateDetailLabels));

  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNavigation = document.getElementById('mobile-navigation');
  function closeMenu() {
    mobileNavigation.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  }
  menuButton.addEventListener('click', () => {
    mobileNavigation.hidden = !mobileNavigation.hidden;
    menuButton.setAttribute('aria-expanded', String(!mobileNavigation.hidden));
  });
  mobileNavigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const works = [...document.querySelectorAll('.work')];
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  document.getElementById('work-filters').hidden = false;
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    works.forEach(work => { work.hidden = filter !== 'all' && work.dataset.category !== filter; });
    filterButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    document.querySelector('[data-work-count]').textContent = String(works.filter(work => !work.hidden).length).padStart(2, '0');
  }));

  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('.desktop-nav a')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-5% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('main > section[id], footer[id]').forEach(section => observer.observe(section));
  }

  setLanguage(language);
  updateClock();
  setInterval(updateClock, 30000);
})();
