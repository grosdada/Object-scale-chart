const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'ideogram-prompts.html'), 'utf8');
const jsonStart = html.indexOf('[', html.indexOf('data-prompts'));
const jsonEnd = html.indexOf('</script>', jsonStart);
const prompts = JSON.parse(html.slice(jsonStart, jsonEnd));

test('Ideogram page exposes 16 unique prompts and 16 static fallbacks', () => {
  assert.equal(prompts.length, 16);
  assert.equal(new Set(prompts.map(prompt => prompt.name)).size, 16);
  assert.equal((html.match(/<article class="card"/g) || []).length, 16);
  assert.equal((html.match(/<pre><code>/g) || []).length, 16);
  prompts.forEach(prompt => {
    assert.match(prompt.name, /^\d{2}_[a-z_]+$/);
    assert.match(prompt.positive, /exactly nine/i);
    assert.match(prompt.positive, /3 by 3 grid/i);
    assert.match(prompt.positive, /No [^.]*\b(words|text|lettering|labels)\b/i);
  });
});

test('Ideogram page provides English/French and light/night switches', () => {
  assert.match(html, /data-lang="en"/);
  assert.match(html, /data-lang="fr"/);
  assert.match(html, /data-theme-choice="light"/);
  assert.match(html, /data-theme-choice="night"/);
  assert.match(html, /--paper:#edf0f5/);
});
