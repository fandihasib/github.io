(() => {
  'use strict';

  const root = document.querySelector('#article-detail');
  if (!root) return;

  const endpoint = window.SITE_CONFIG?.contentEndpoint || 'data/articles.json';
  const requestedId = new URLSearchParams(window.location.search).get('id');
  const text = value => String(value ?? '');
  const decode = value => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text(value);
    return textarea.value;
  };
  const allowedTags = new Set(['P', 'STRONG', 'EM', 'A', 'IMG', 'UL', 'OL', 'LI', 'BR']);
  const isPublished = article => article?.status == null || article.status === 'published';

  const make = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value != null) element.textContent = decode(value);
    return element;
  };

  const safeHref = value => {
    const href = text(value).trim();
    return /^(https?:\/\/|mailto:|tel:|#)/i.test(href) ? href : '';
  };

  const sanitizeRichText = (value, wrapInParagraph = false) => {
    const template = document.createElement('template');
    template.innerHTML = wrapInParagraph ? `<p>${text(value)}</p>` : text(value);

    const clean = node => {
      const fragment = document.createDocumentFragment();
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          fragment.append(document.createTextNode(child.textContent || ''));
          return;
        }
        if (child.nodeType !== Node.ELEMENT_NODE || !allowedTags.has(child.tagName)) {
          if (child.childNodes?.length) fragment.append(clean(child));
          return;
        }

        const element = document.createElement(child.tagName.toLowerCase());
        if (child.tagName === 'IMG') {
          const source = child.getAttribute('src') || '';
          if (!/^assets\/[A-Za-z0-9._-]+$/.test(source)) return;
          element.src = source;
          element.alt = child.getAttribute('alt') || '';
          element.loading = 'lazy';
          element.decoding = 'async';
        } else if (child.tagName === 'A') {
          const href = safeHref(child.getAttribute('href'));
          if (!href) {
            fragment.append(clean(child));
            return;
          }
          element.href = href;
          if (/^https?:\/\//i.test(href)) {
            element.target = '_blank';
            element.rel = 'noopener noreferrer';
          }
          element.append(clean(child));
        } else {
          element.append(clean(child));
        }
        fragment.append(element);
      });
      return fragment;
    };

    return clean(template.content);
  };

  const appendRichSection = (container, value) => {
    if (!text(value).trim()) return;
    const section = make('div', 'article-section');
    section.append(sanitizeRichText(value, true));
    if (!section.querySelector('p, img, ul, ol') && section.textContent.trim()) {
      const paragraph = make('p', '', section.textContent);
      section.replaceChildren(paragraph);
    }
    container.append(section);
  };

  const renderArticle = article => {
    const body = article.body && typeof article.body === 'object' ? article.body : {};
    const back = make('a', 'text-link article-back', '← All articles');
    back.href = 'articles.html';

    const header = make('header', 'article-header');
    header.append(make('p', 'eyebrow', [article.category, article.date].filter(Boolean).join(' · ')));
    header.append(make('h1', '', article.title || 'Article'));
    header.append(make('p', 'article-dek', article.summary));
    const metadata = make('div', 'article-meta');
    if (article.readTime) metadata.append(make('span', '', `${text(article.readTime)} read`));
    (Array.isArray(article.tags) ? article.tags : []).forEach(tag => metadata.append(make('span', '', tag)));
    header.append(metadata);

    const articleBody = make('div', 'article-body');
    appendRichSection(articleBody, body.intro);
    if (body.heading1) articleBody.append(make('h2', '', body.heading1));
    appendRichSection(articleBody, body.section1);
    if (body.quote) {
      const quote = make('blockquote');
      quote.append(sanitizeRichText(body.quote));
      articleBody.append(quote);
    }
    if (body.heading2) articleBody.append(make('h2', '', body.heading2));
    appendRichSection(articleBody, body.section2);
    if (body.close) {
      const close = make('div', 'article-close');
      close.append(sanitizeRichText(`<p><strong>Closing note.</strong> ${text(body.close)}</p>`));
      articleBody.append(close);
    }

    root.replaceChildren(back, header, articleBody);
    document.title = `${decode(article.title)} | Fandi Hasib`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', decode(article.summary));
  };

  const showMessage = (title, message) => {
    const back = make('a', 'text-link article-back', '← All articles');
    back.href = 'articles.html';
    root.replaceChildren(back, make('h1', '', title), make('p', 'article-dek', message));
  };

  if (!requestedId) {
    showMessage('Choose an article to read.', 'Browse the article archive for notes on communication, teaching and public speaking.');
    return;
  }

  fetch(endpoint, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Article data unavailable');
      return response.json();
    })
    .then(payload => {
      if (!Array.isArray(payload)) throw new Error('Article data must be an array');
      const article = payload.find(item => item?.id === requestedId && isPublished(item));
      if (!article) {
        showMessage('Article not found.', 'This article may have moved or is no longer available.');
        return;
      }
      renderArticle(article);
    })
    .catch(() => showMessage('Article temporarily unavailable.', 'Please refresh the page in a moment.'));
})();
