(() => {
  'use strict';

  const button = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#site-nav');

  button?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open') ?? false;
    button.setAttribute('aria-expanded', String(open));
  });

  nav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      button?.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) {
      nav.classList.remove('open');
      button?.setAttribute('aria-expanded', 'false');
      button?.focus();
    }
  });

  document.querySelectorAll('[data-year]').forEach(element => {
    element.textContent = String(new Date().getFullYear());
  });
})();
