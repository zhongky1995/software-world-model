import test from 'node:test';
import assert from 'node:assert/strict';
import { marked } from 'marked';
import { validateMarkdown } from '../scripts/markdown-validation.mjs';

test('Chinese punctuation next to bold cannot silently appear as Markdown', () => {
  assert.throws(() => validateMarkdown(marked, '**一句话。**紧接中文', 'example'), /Unrendered bold/);
});

test('Chinese bold with punctuation outside the delimiters renders correctly', () => {
  const source = '**一句话**。紧接中文';
  validateMarkdown(marked, source, 'example');
  assert.match(marked.parse(source), /<strong>一句话<\/strong>。紧接中文/);
});

test('Code examples and deliberately escaped stars remain valid', () => {
  for (const source of ['`**一句话。**紧接中文`', '```\n**一句话。**紧接中文\n```', String.raw`\*\*文字\*\*`]) {
    assert.doesNotThrow(() => validateMarkdown(marked, source, 'example'));
  }
});

test('Bold inside links and lists still renders', () => {
  const source = '- [**查看说明**](https://example.com)\n\n> **先观察**，再解释。';
  validateMarkdown(marked, source, 'example');
  const html = marked.parse(source);
  assert.match(html, /<strong>查看说明<\/strong>/);
  assert.match(html, /<blockquote>/);
});
