import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const catalog = JSON.parse(read('app/catalog.json'));
const html = read('site/index.html');
const match = html.match(/<script id="knowledge-data" type="application\/json">([\s\S]*?)<\/script>/);
assert.ok(match, 'The built reading app must contain its content');
assert.ok(!html.includes('__PAYLOAD__'), 'Build placeholder was not replaced');
const data = JSON.parse(match[1]);
const ids = new Set(catalog.pages.map(page => page.id));
assert.equal(ids.size, catalog.pages.length, 'Duplicate route');
assert.equal(new Set(catalog.pages.map(page => page.path)).size, ids.size, 'Duplicate article path');
assert.deepEqual(data.pages.map(page => page.id), catalog.pages.map(page => page.id));
let images = 0;
for (const page of data.pages) {
  assert.ok(page.html.length > 100, `Empty article: ${page.id}`);
  assert.ok(!/<p>\s*<figure>/.test(page.html), `Invalid figure nesting: ${page.id}`);
  const text = page.html.replace(/<[^>]*>/g, '');
  assert.ok(!text.includes('**'), `Unrendered bold: ${page.id}`);
  for (const route of page.html.matchAll(/href="#\/([^"#]+)"/g)) {
    assert.ok(ids.has(route[1]), `Unknown route in ${page.id}: ${route[1]}`);
  }
  for (const related of page.related) assert.ok(ids.has(related), `Unknown related article: ${related}`);
  for (const image of page.html.matchAll(/<img\s[^>]*src="([^"]+)"[^>]*>/g)) {
    assert.match(image[1], /^data:image\/(svg\+xml|png);base64,/, `Nonembedded image: ${page.id}`);
    assert.match(image[0], /alt="[^"]+"/, `Missing image description: ${page.id}`);
    assert.ok(Buffer.from(image[1].split(',')[1], 'base64').length > 100);
    images++;
  }
}
let sourceImages = 0;
for (const page of catalog.pages) {
  marked.walkTokens(marked.lexer(read(page.path)), token => {
    if (token.type === 'image') sourceImages++;
  });
}
assert.equal(images, sourceImages, 'An article image was lost during build');
assert.ok(!/<(?:script|link)[^>]+(?:src|href)="https?:/i.test(html), 'Reading must work offline');
assert.ok(!/\/Users\/|\/private\/var\/folders\/|C:\\Users\\|_kb-control|_task-control/.test(html), 'Private production metadata in built app');
assert.equal(read('site/LICENSE'), read('LICENSE'), 'Published license differs from source');
assert.ok(fs.existsSync(path.join(root, 'site/.nojekyll')));
console.log(JSON.stringify({ status: 'pass', articles: ids.size, embeddedImages: images, offline: true }, null, 2));
