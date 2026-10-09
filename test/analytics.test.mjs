import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app/analytics.js', import.meta.url), 'utf8');
const config = JSON.parse(fs.readFileSync(new URL('../app/analytics.json', import.meta.url), 'utf8'));

function reader(overrides = {}) {
  const scripts = [];
  const context = {
    URL,
    location: { protocol: 'https:', hostname: config.hostname, pathname: config.basePath, ...overrides.location },
    navigator: { doNotTrack: '0', ...overrides.navigator },
    document: {
      referrer: 'https://example.com/post?private=secret#details',
      getElementById: () => ({ textContent: JSON.stringify({ ...config, ...overrides.config }) }),
      createElement: () => ({}),
      head: { appendChild: script => scripts.push(script) }
    },
    window: {}
  };
  vm.runInNewContext(source, context);
  const commands = () => Array.from(context.window.dataLayer || [], item => Array.from(item));
  const events = () => commands().filter(item => item[0] === 'event');
  return { analytics: context.window.readerAnalytics, scripts, commands, events, load: () => scripts[0].onload(), context };
}

test('offline, previews, forks, other paths and privacy opt-outs never load Google Analytics', () => {
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
    assert.equal(result.commands().length, 0);
  }
  assert.equal(reader({ navigator: { doNotTrack: '1' } }).scripts.length, 0);
  assert.equal(reader({ navigator: { globalPrivacyControl: true } }).scripts.length, 0);
  assert.equal(reader({ config: { measurementId: '' } }).scripts.length, 0);
});

test('manual article views are deduplicated and keep the original page and referrer while queued', () => {
  const result = reader();
  result.analytics.page('home', 'Home');
  result.analytics.page('home', 'Home');
  result.analytics.page('world-map', 'World map');
  result.analytics.page('home', 'Home');
  assert.equal(result.events().length, 0);
  result.load();
  const views = result.events().map(item => item[2]);
  assert.deepEqual(views.map(item => item.page_location), [
    'https://' + config.hostname + config.basePath + 'home',
    'https://' + config.hostname + config.basePath + 'world-map',
    'https://' + config.hostname + config.basePath + 'home'
  ]);
  assert.deepEqual(views.map(item => item.page_title), ['Home', 'World map', 'Home']);
  assert.equal(views[0].page_referrer, 'https://example.com/post');
  assert.equal(views[1].page_referrer, views[0].page_location);
  assert.ok(views.every(item => item.send_to === config.measurementId));
  assert.ok(result.commands().filter(item => item[0] === 'config').every(item => item[2].send_page_view === false));
});

test('search events use GA4 names, retain article context and only send counts', () => {
  const result = reader();
  result.analytics.page('world-map', 'World map');
  result.analytics.event('search', { query_length: 6, result_count: 3 });
  result.analytics.event('search-result-click', { article: 'glossary' });
  result.analytics.page('glossary', 'Glossary');
  result.load();
  const event = result.events().find(item => item[1] === 'search')[2];
  assert.equal(event.page_location, 'https://' + config.hostname + config.basePath + 'world-map');
  assert.equal(event.project, config.project);
  assert.equal(event.query_length, 6);
  assert.equal(event.result_count, 3);
  assert.ok(result.events().some(item => item[1] === 'search_result_click'));
  assert.ok(!JSON.stringify(result.commands()).includes('secret'));
  assert.ok(!JSON.stringify(result.commands()).includes('search_term'));
});

test('Google Analytics uses a project cookie path and disables advertising signals', () => {
  const result = reader();
  assert.match(config.measurementId, /^G-[A-Z0-9]+$/);
  assert.equal(result.scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=' + config.measurementId);
  assert.equal(result.scripts[0].async, true);
  const settings = result.commands().find(item => item[0] === 'config')[2];
  assert.equal(settings.allow_google_signals, false);
  assert.equal(settings.allow_ad_personalization_signals, false);
  assert.equal(settings.cookie_path, config.basePath);
  assert.equal(settings.cookie_prefix, config.project.replace(/-/g, '_'));
});

test('a blocked or failed tracker cannot interrupt reading', () => {
  const failed = reader();
  failed.analytics.page('home', 'Home');
  failed.scripts[0].onerror();
  assert.doesNotThrow(() => failed.analytics.page('world-map', 'World map'));
  assert.doesNotThrow(() => failed.analytics.event('print'));
  assert.equal(failed.events().length, 0);
  const throwing = reader();
  throwing.context.window.gtag = () => { throw new Error('Blocked'); };
  throwing.analytics.page('home', 'Home');
  assert.doesNotThrow(throwing.load);
  assert.doesNotThrow(() => throwing.analytics.event('print'));
});
