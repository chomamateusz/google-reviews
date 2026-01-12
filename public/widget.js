(function () {
  'use strict';

  // Find the container element
  const container = document.getElementById('coderoad-reviews');
  if (!container) {
    console.error('CodeRoad Reviews: Container element #coderoad-reviews not found');
    return;
  }

  // Get configuration from data attributes
  const config = {
    theme: container.dataset.theme || 'light',
    maxReviews: parseInt(container.dataset.max || '5', 10),
    apiUrl: container.dataset.api || (function() {
      // Try to get API URL from script src
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src && scripts[i].src.includes('widget.js')) {
          return scripts[i].src.replace('/widget.js', '/api/reviews');
        }
      }
      return '/api/reviews';
    })(),
  };

  // Inject styles
  const styles = `
    .cr-reviews {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 800px;
      margin: 0 auto;
    }
    .cr-reviews.cr-theme-light {
      --cr-bg: #ffffff;
      --cr-text: #1a1a1a;
      --cr-text-secondary: #666666;
      --cr-border: #e5e5e5;
      --cr-star: #fbbf24;
      --cr-star-empty: #d1d5db;
    }
    .cr-reviews.cr-theme-dark {
      --cr-bg: #1a1a1a;
      --cr-text: #ffffff;
      --cr-text-secondary: #a0a0a0;
      --cr-border: #333333;
      --cr-star: #fbbf24;
      --cr-star-empty: #4a4a4a;
    }
    .cr-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--cr-bg);
      border-radius: 12px 12px 0 0;
      border: 1px solid var(--cr-border);
      border-bottom: none;
    }
    .cr-google-logo {
      width: 48px;
      height: 48px;
    }
    .cr-rating-info h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--cr-text);
    }
    .cr-rating-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cr-rating-number {
      font-size: 24px;
      font-weight: 700;
      color: var(--cr-text);
    }
    .cr-stars {
      display: flex;
      gap: 2px;
    }
    .cr-star {
      width: 20px;
      height: 20px;
      color: var(--cr-star);
    }
    .cr-star-empty {
      color: var(--cr-star-empty);
    }
    .cr-review-count {
      font-size: 14px;
      color: var(--cr-text-secondary);
    }
    .cr-review-list {
      background: var(--cr-bg);
      border: 1px solid var(--cr-border);
      border-radius: 0 0 12px 12px;
    }
    .cr-review {
      padding: 16px;
      border-bottom: 1px solid var(--cr-border);
    }
    .cr-review:last-child {
      border-bottom: none;
    }
    .cr-review-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .cr-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--cr-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
      color: var(--cr-text-secondary);
      overflow: hidden;
    }
    .cr-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .cr-reviewer-info {
      flex: 1;
    }
    .cr-reviewer-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--cr-text);
      margin: 0 0 2px 0;
    }
    .cr-review-date {
      font-size: 12px;
      color: var(--cr-text-secondary);
    }
    .cr-review-stars {
      display: flex;
      gap: 1px;
    }
    .cr-review-stars .cr-star {
      width: 14px;
      height: 14px;
    }
    .cr-review-text {
      font-size: 14px;
      line-height: 1.5;
      color: var(--cr-text);
      margin: 0;
    }
    .cr-reply {
      margin-top: 12px;
      padding: 12px;
      background: var(--cr-border);
      border-radius: 8px;
    }
    .cr-reply-header {
      font-size: 12px;
      font-weight: 600;
      color: var(--cr-text-secondary);
      margin-bottom: 4px;
    }
    .cr-reply-text {
      font-size: 13px;
      line-height: 1.4;
      color: var(--cr-text);
      margin: 0;
    }
    .cr-loading {
      padding: 40px;
      text-align: center;
      color: var(--cr-text-secondary);
    }
    .cr-error {
      padding: 20px;
      text-align: center;
      color: #dc2626;
      background: #fef2f2;
      border-radius: 12px;
    }
    .cr-powered-by {
      text-align: center;
      padding: 8px;
      font-size: 11px;
      color: var(--cr-text-secondary);
    }
    .cr-powered-by a {
      color: inherit;
      text-decoration: none;
    }
    .cr-powered-by a:hover {
      text-decoration: underline;
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Star SVG helper
  function starSVG(filled) {
    return `<svg class="cr-star ${filled ? '' : 'cr-star-empty'}" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
    </svg>`;
  }

  // Render stars
  function renderStars(rating, size = 'normal') {
    let html = `<div class="${size === 'small' ? 'cr-review-stars' : 'cr-stars'}">`;
    for (let i = 1; i <= 5; i++) {
      html += starSVG(i <= rating);
    }
    html += '</div>';
    return html;
  }

  // Render avatar
  function renderAvatar(review) {
    if (review.authorPhoto) {
      return `<div class="cr-avatar"><img src="${review.authorPhoto}" alt="${review.author}" loading="lazy"></div>`;
    }
    const initials = review.author.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `<div class="cr-avatar">${initials}</div>`;
  }

  // Render single review
  function renderReview(review) {
    let html = `
      <div class="cr-review">
        <div class="cr-review-header">
          ${renderAvatar(review)}
          <div class="cr-reviewer-info">
            <p class="cr-reviewer-name">${escapeHtml(review.author)}</p>
            <span class="cr-review-date">${escapeHtml(review.relativeTime)}</span>
          </div>
          ${renderStars(review.rating, 'small')}
        </div>
        ${review.text ? `<p class="cr-review-text">${escapeHtml(review.text)}</p>` : ''}
    `;

    if (review.reply) {
      html += `
        <div class="cr-reply">
          <div class="cr-reply-header">Odpowiedz wlasciciela</div>
          <p class="cr-reply-text">${escapeHtml(review.reply.text)}</p>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Google logo SVG
  const googleLogo = `<svg class="cr-google-logo" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>`;

  // Render widget
  function renderWidget(data) {
    const reviews = data.reviews.slice(0, config.maxReviews);

    let html = `<div class="cr-reviews cr-theme-${config.theme}">`;

    // Header
    html += `
      <div class="cr-header">
        ${googleLogo}
        <div class="cr-rating-info">
          <h3>Opinie Google</h3>
          <div class="cr-rating-row">
            <span class="cr-rating-number">${data.business.rating.toFixed(1)}</span>
            ${renderStars(Math.round(data.business.rating))}
            <span class="cr-review-count">(${data.business.totalReviews} opinii)</span>
          </div>
        </div>
      </div>
    `;

    // Reviews list
    html += '<div class="cr-review-list">';
    reviews.forEach(review => {
      html += renderReview(review);
    });
    html += '</div>';

    // Powered by
    html += `
      <div class="cr-powered-by">
        <a href="https://coderoad.pl" target="_blank" rel="noopener">CodeRoad - Kurs JavaScript Online</a>
      </div>
    `;

    html += '</div>';

    container.innerHTML = html;
  }

  // Show loading state
  function showLoading() {
    container.innerHTML = `
      <div class="cr-reviews cr-theme-${config.theme}">
        <div class="cr-loading">Ladowanie opinii...</div>
      </div>
    `;
  }

  // Show error state
  function showError(message) {
    container.innerHTML = `
      <div class="cr-reviews cr-theme-${config.theme}">
        <div class="cr-error">Nie udalo sie zaladowac opinii: ${escapeHtml(message)}</div>
      </div>
    `;
  }

  // Fetch and render reviews
  async function init() {
    showLoading();

    try {
      const response = await fetch(config.apiUrl);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      renderWidget(data);
    } catch (error) {
      console.error('CodeRoad Reviews Error:', error);
      showError(error.message);
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
