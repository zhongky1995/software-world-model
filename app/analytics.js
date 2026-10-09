(() => {
  'use strict';
  let config = {};
  try { config = JSON.parse(document.getElementById('analytics-config').textContent); } catch {}
  const enabled = /^G-[A-Z0-9]+$/.test(config.measurementId || '') &&
    typeof config.basePath === 'string' && config.basePath.startsWith('/') &&
    location.protocol === 'https:' && location.hostname === config.hostname &&
    location.pathname.startsWith(config.basePath) && navigator.doNotTrack !== '1' &&
    navigator.globalPrivacyControl !== true;
  let ready = false, failed = false, view = null, lastUrl = null;
  const queue = [];
  // Strip query strings and fragments before sending traffic sources.
  let referrer = '';
  try {
    const source = new URL(document.referrer);
    if (/^https?:$/.test(source.protocol)) referrer = source.origin + source.pathname;
  } catch {}

  function send(payload) {
    if (!enabled || failed) return;
    if (!ready) {
      if (queue.length < 30) queue.push(payload);
      return;
    }
    try {
      const page = {
        page_location: 'https://' + config.hostname + payload.url,
        page_title: payload.title,
        page_referrer: payload.referrer
      };
      if (!payload.name) {
        // Keep automatic engagement attached to the current virtual article.
        window.gtag('config', config.measurementId, { ...page, send_page_view: false });
      }
      window.gtag('event', payload.name ? payload.name.replace(/-/g, '_') : 'page_view', {
        ...page, project: config.project, ...payload.data, send_to: config.measurementId
      });
    } catch {} // A blocked tracker must never interrupt reading or navigation.
  }

  window.readerAnalytics = {
    page(article, title) {
      const url = config.basePath + article;
      if (url === lastUrl) return;
      view = { url, title, referrer: lastUrl ? 'https://' + config.hostname + lastUrl : referrer };
      lastUrl = url;
      send({ ...view });
    },
    event(name, properties = {}) {
      if (!view) return;
      send({ ...view, name, data: { ...properties } });
    }
  };

  if (!enabled) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', config.measurementId, {
    send_page_view: false,
    page_location: 'https://' + config.hostname + config.basePath,
    page_referrer: referrer,
    page_title: config.project,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_prefix: config.project.replace(/-/g, '_'),
    cookie_path: config.basePath,
    cookie_flags: 'SameSite=Lax;Secure'
  });
  const script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + config.measurementId;
  script.async = true;
  script.onload = () => { ready = true; queue.splice(0).forEach(send); };
  script.onerror = () => { failed = true; queue.length = 0; };
  document.head.appendChild(script);
})();
