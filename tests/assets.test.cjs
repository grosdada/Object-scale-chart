const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'subject-assets.js'), 'utf8'), sandbox);
const assets = sandbox.window.SUBJECT_ASSETS;
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'subjects', 'manifest.json'), 'utf8'));

test('processed subject bundle contains 127 catalogue masks', () => {
  assert.equal(Object.keys(assets).length, 127);
  for (const [id, source] of Object.entries(assets)) {
    assert.match(id, /^(animal|vehicle|building)-\d+$/);
    assert.match(source, /^data:image\/png;base64,[A-Za-z0-9+/=]+$/);
  }
});

test('only the duplicated first grid is missing', () => {
  const missing = manifest.filter(item => item.status !== 'processed');
  assert.deepEqual(missing.map(item => item.presetId), ['human-1','human-2','human-3','human-4','human-5','human-6','animal-7','animal-8','animal-9']);
  assert.ok(missing.every(item => item.status === 'missing_duplicate_grid'));
});
