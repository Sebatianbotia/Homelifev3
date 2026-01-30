function initNavbar() {
  const item = document.getElementById('productsItem');
  if (!item) return;

  const toggle = item.querySelector('.products-toggle');
  const dropdown = item.querySelector('.nav-dropdown');
  if (!toggle || !dropdown) return;

  const isMobile = () => window.matchMedia('(max-width: 1024px)').matches;

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isMobile()) return;

    item.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
  });

  item.querySelectorAll('.dropdown-list a').forEach((link) => {
    link.addEventListener('click', () => {
      item.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', () => {
    if (!isMobile()) {
      item.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

window.initNavbar = initNavbar;
