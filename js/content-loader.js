(() => {
  'use strict';

  const endpoint = window.SITE_CONFIG?.contentEndpoint || 'data/articles.json';
  const archiveRoot = document.querySelector('#article-list');
  const latestRoot = document.querySelector('#latest-articles');
  const statusRoot = document.querySelector('#article-status');
  const filterRoot = document.querySelector('#article-filters');

  if (!archiveRoot && !latestRoot) return;

  const text = value => String(value ?? '');
  const decode = value => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text(value);
    return textarea.value;
  };
  const isPublished = article => article?.status == null || article.status === 'published';
  const byNewest = (left, right) => text(right?.date).localeCompare(text(left?.date)) || text(left?.title).localeCompare(text(right?.title));
  const articleUrl = id => `article.html?id=${encodeURIComponent(text(id))}`;

  const make = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value != null) element.textContent = decode(value);
    return element;
  };

  const card = (article, index) => {
    const item = make('article', 'article-card');
    item.dataset.category = text(article.category);
    item.append(make('span', 'article-number', String(index + 1).padStart(2, '0')));
    item.append(make('p', 'eyebrow', [article.category, article.date].filter(Boolean).join(' · ')));

    const heading = make('h3');
    const link = make('a', '', article.title || 'Untitled article');
    link.href = articleUrl(article.id);
    heading.append(link);
    item.append(heading, make('p', '', article.summary));

    const metadata = make('div', 'article-meta');
    if (article.readTime) metadata.append(make('span', '', `${text(article.readTime)} read`));
    (Array.isArray(article.tags) ? article.tags : []).forEach(tag => metadata.append(make('span', '', tag)));
    item.append(metadata, make('span', 'article-arrow', '→'));
    return item;
  };

  const render = (root, articles) => {
    root.replaceChildren(...articles.map(card));
    root.setAttribute('aria-busy', 'false');
  };

  const updateStatus = articles => {
    if (statusRoot) statusRoot.textContent = `${articles.length} article${articles.length === 1 ? '' : 's'}`;
  };

  const renderFilters = articles => {
    if (!filterRoot) return;
    const categories = [...new Set(articles.map(article => text(article.category).trim()).filter(Boolean))];
    const filters = ['all', ...categories];
    filterRoot.replaceChildren(...filters.map((filter, index) => {
      const button = make('button', index === 0 ? 'active' : '', filter === 'all' ? 'All' : filter);
      button.type = 'button';
      button.dataset.filter = filter;
      button.setAttribute('aria-pressed', String(index === 0));
      button.addEventListener('click', () => {
        filterRoot.querySelectorAll('button').forEach(item => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        const matches = filter === 'all' ? articles : articles.filter(article => article.category === filter);
        render(archiveRoot, matches);
        updateStatus(matches);
      });
      return button;
    }));
  };

  const showError = root => {
    if (!root) return;
    const message = make('div', 'content-message');
    message.append(make('h2', '', 'Articles are temporarily unavailable.'), make('p', '', 'Please refresh the page in a moment.'));
    root.replaceChildren(message);
    root.setAttribute('aria-busy', 'false');
  };

  fetch(endpoint, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Article data unavailable');
      return response.json();
    })
    .then(payload => {
      if (!Array.isArray(payload)) throw new Error('Article data must be an array');
      const articles = payload.filter(article => article?.id && article?.title && isPublished(article)).sort(byNewest);
      if (latestRoot) render(latestRoot, articles.slice(0, 3));
      if (archiveRoot) {
        render(archiveRoot, articles);
        renderFilters(articles);
      }
      updateStatus(articles);
    })
    .catch(() => {
      showError(archiveRoot);
      showError(latestRoot);
      if (statusRoot) statusRoot.textContent = '';
    });
})();
