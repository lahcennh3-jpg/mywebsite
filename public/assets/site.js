// Small progressive enhancements. All copy and routes are generated at build time.
document.documentElement.classList.add('js');

const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-navigation');
function setMenu(open) {
  toggle?.setAttribute('aria-expanded', String(open));
  navigation?.classList.toggle('is-open', open);
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
navigation?.addEventListener('click', event => {
  if (event.target.closest('a') && toggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    // A hash destination receives focus after mobile navigation closes.
    const destination = event.target.closest('a').hash.slice(1);
    const section = document.getElementById(destination);
    const heading = section?.querySelector('h1, h2');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    toggle.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header') && toggle?.getAttribute('aria-expanded') === 'true') setMenu(false);
});
window.matchMedia('(min-width: 901px)').addEventListener('change', () => setMenu(false));

const viewControls = [...document.querySelectorAll('[data-view]')];
const studyViews = [...document.querySelectorAll('[data-study-view]')];
function selectView(view, moveFocus = false) {
  const selected = ['planned', 'completed'].includes(view) ? view : 'planned';
  for (const panel of studyViews) panel.hidden = panel.dataset.studyView !== selected;
  for (const control of viewControls) {
    const active = control.dataset.view === selected;
    control.classList.toggle('selected', active);
    control.setAttribute('aria-pressed', String(active));
  }
  if (moveFocus) document.querySelector(`[data-study-view="${selected}"] .view-heading`)?.focus({ preventScroll: true });
}
for (const control of viewControls) {
  control.setAttribute('role', 'button');
  control.setAttribute('aria-controls', `${control.dataset.view}-studies`);
  control.addEventListener('click', event => {
    event.preventDefault();
    selectView(control.dataset.view, true);
    history.replaceState(null, '', `#${control.dataset.view}-studies`);
  });
  control.addEventListener('keydown', event => {
    if (event.key === ' ') { event.preventDefault(); control.click(); }
  });
}
if (studyViews.length) {
  selectView(location.hash === '#completed-studies' ? 'completed' : 'planned');
  window.addEventListener('hashchange', () => {
    if (location.hash === '#completed-studies') selectView('completed');
    else if (['#planned-studies', '#portfolio'].includes(location.hash)) selectView('planned');
  });
}

if ('IntersectionObserver' in window && document.body.classList.contains('home-page')) {
  const sections = [...document.querySelectorAll('main > section[id]')];
  const links = [...document.querySelectorAll('.primary-navigation [data-section]')];
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    for (const link of links) {
      if (link.dataset.section === visible.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }, { rootMargin: '-10% 0px -55% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}
