import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app/analytics.js', import.meta.url), 'utf8');
const config = JSON.parse(fs.readFileSync(new URL('../app/analytics.json', import.meta.url), 'utf8'));

function reader(overrides = {}) {
  const scripts = [], sent = [];
  const context = {
    URL,
    location: { protocol: 'https:', hostname: config.hostname, pathname: config.basePath, ...overrides.location },
    navigator: { doNotTrack: '0', ...overrides.navigator },
    document: {
      referrer: 'https://example.com/post?private=secret#details',
      getElementById: () => ({ textContent: JSON.stringify(config) }),
      createElement: () => ({ dataset: {} }),
      head: { appendChild: script => scripts.push(script) }
    },
    window: {}
  };
  vm.runInNewContext(source, context);
  const load = () => {
    context.window.umami = {
      track: callback => {
        sent.push(callback({ website: config.websiteId, url: '/?private=secret', title: 'Original' }));
        return Promise.resolve();
      }
    };
    scripts[0].onload();
  };
  return { analytics: context.window.readerAnalytics, scripts, sent, load, context };
}

test('offline, local previews, forks and other project paths never load the tracker', () => {
  for (const location of [
    { protocol: 'file:', hostname: '', pathname: '/download/index.html' },
    { protocol: 'http:', hostname: 'localhost' },
    { hostname: 'someone-else.github.io' },
    { pathname: '/another-project/' }
  ]) {
    const result = reader({ location });
    result.analytics.page('home', 'Home');
    result.analytics.event('search-open');
    assert.equal(result.scripts.length, 0);
    assert.equal(result.sent.length, 0);
  }
  assert.equal(reader({ navigator: { doNotTrack: '1' } }).scripts.length, 0);
});

test('each article visit is counted once with its own title, even before the tracker finishes loading', () => {
  const result = reader();
  result.analytics.page('home', 'Home');
  result.analytics.page('home', 'Home');
  result.analytics.page('world-map', 'World map');
  result.analytics.page('home', 'Home');
  assert.equal(result.sent.length, 0);
  result.load();
  assert.deepEqual(result.sent.map(item => item.url), [
    config.basePath + 'home', config.basePath + 'world-map', config.basePath + 'home'
  ]);
  assert.deepEqual(result.sent.map(item => item.title), ['Home', 'World map', 'Home']);
  assert.ok(result.sent.every(item => item.website === config.websiteId));
  assert.ok(result.sent.every(item => item.referrer === 'https://example.com/post'));
  assert.equal(result.scripts[0].dataset.autoTrack, 'false');
  assert.equal(result.scripts[0].dataset.tag, config.project);
});

test('events keep their original article context and do not send the search text', () => {
  const result = reader();
  result.analytics.page('world-map', 'World map');
  result.analytics.event('search', { query_length: 6, result_count: 3 });
  result.analytics.page('glossary', 'Glossary');
  result.load();
  const event = result.sent.find(item => item.name === 'search');
  assert.equal(event.url, config.basePath + 'world-map');
  assert.equal(event.data.project, config.project);
  assert.equal(event.data.query_length, 6);
  assert.equal(event.data.result_count, 3);
  assert.ok(!JSON.stringify(result.sent).includes('secret'));
});

test('a blocked or failed tracker cannot interrupt reading', () => {
  const result = reader();
  result.analytics.page('home', 'Home');
  result.scripts[0].onerror();
  assert.doesNotThrow(() => result.analytics.page('world-map', 'World map'));
  assert.doesNotThrow(() => result.analytics.event('print'));
  const missingTracker = reader();
  assert.doesNotThrow(() => missingTracker.scripts[0].onload());
  const throwingTracker = reader();
  throwingTracker.context.window.umami = { track() { throw new Error('Blocked'); } };
  throwingTracker.scripts[0].onload();
  assert.doesNotThrow(() => throwingTracker.analytics.page('home', 'Home'));
});
