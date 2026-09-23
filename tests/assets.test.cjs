const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'subject-vectors.js'), 'utf8'), sandbox);
const assets = sandbox.window.SUBJECT_VECTORS;
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'subjects', 'manifest.json'), 'utf8'));

test('vector subject bundle contains all 136 catalogue silhouettes', () => {
  assert.equal(Object.keys(assets).length, 136);
  for (const [id, source] of Object.entries(assets)) {
    assert.match(id, /^(human|animal|vehicle|building)-\d+$/);
    assert.match(source.viewBox, /^0 0 \d+ \d+$/);
    assert.match(source.d, /^M /);
  }
});

test('no supplied grid cell is missing', () => {
  const missing = manifest.filter(item => item.status !== 'processed');
  assert.deepEqual(missing, []);
});
