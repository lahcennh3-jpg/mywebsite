(() => {
  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  const syncHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open', !expanded);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        navToggle.focus();
      }
    });
  }

  const filterButtons = [...document.querySelectorAll('[data-project-filter]')];
  const cards = [...document.querySelectorAll('[data-project-status]')];
  const completedEmpty = document.querySelector('[data-completed-empty]');

  if (filterButtons.length && cards.length) {
    const applyFilter = (filter) => {
      let visible = 0;
      cards.forEach((card) => {
        const matches = card.dataset.projectStatus === filter;
        card.hidden = !matches;
        if (matches) visible += 1;
      });

      filterButtons.forEach((button) => {
        const active = button.dataset.projectFilter === filter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });

      if (completedEmpty) {
        completedEmpty.hidden = !(filter === 'completed' && visible === 0);
      }
    };

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => applyFilter(button.dataset.projectFilter));
    });
  }
})();
