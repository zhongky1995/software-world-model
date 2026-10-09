(() => {
  'use strict';
  const config = JSON.parse(document.getElementById('analytics-config').textContent);
  const enabled = location.protocol === 'https:' && location.hostname === config.hostname &&
    location.pathname.startsWith(config.basePath) && navigator.doNotTrack !== '1';
  let ready = false, failed = false, view = null, lastUrl = null;
  const queue = [];
  // Referrer paths explain traffic sources; query strings may contain private input.
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
      const request = window.umami.track(props => ({ ...props, ...payload, referrer }));
      request?.catch?.(() => {});
    } catch {} // Analytics must never interrupt reading or navigation.
  }

  window.readerAnalytics = {
    page(article, title) {
      view = { url: config.basePath + article, title };
      if (view.url === lastUrl) return;
      lastUrl = view.url;
      send({ ...view });
    },
    event(name, properties = {}) {
      if (!view) return;
      send({ ...view, name, data: { project: config.project, ...properties } });
    }
  };

  if (!enabled) return;
  const script = document.createElement('script');
  script.src = config.scriptUrl;
  script.async = true;
  script.dataset.websiteId = config.websiteId;
  // The reader sends one explicit pageview per article, including hash navigation.
  script.dataset.autoTrack = 'false';
  script.dataset.domains = config.hostname;
  script.dataset.tag = config.project;
  script.dataset.excludeSearch = 'true';
  script.dataset.doNotTrack = 'true';
  script.onload = () => {
    if (typeof window.umami?.track !== 'function') {
      failed = true;
      queue.length = 0;
      return;
    }
    ready = true;
    queue.splice(0).forEach(send);
  };
  script.onerror = () => { failed = true; queue.length = 0; };
  document.head.appendChild(script);
})();
