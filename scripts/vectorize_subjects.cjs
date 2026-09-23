const fs = require('node:fs');
const path = require('node:path');
const { Potrace } = require('potrace');

const root = path.resolve(__dirname, '..');
const input = path.join(root, 'assets', 'subjects', 'presets');
const output = path.join(root, 'subject-vectors.js');

function trace(file) {
  return new Promise((resolve, reject) => {
    const tracer = new Potrace({
      threshold: 245,
      turdSize: 8,
      alphaMax: 1,
      optCurve: true,
      optTolerance: 0.28,
      color: '#000000',
      background: Potrace.COLOR_TRANSPARENT
    });
    tracer.loadImage(file, error => {
      if (error) return reject(error);
      const svg = tracer.getSVG();
      const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
      const d = svg.match(/<path d="([^"]+)"/)?.[1];
      if (!viewBox || !d) return reject(new Error(`Potrace output is incomplete for ${file}`));
      resolve({ viewBox, d });
    });
  });
}

async function main() {
  const files = fs.readdirSync(input).filter(name => name.endsWith('.png')).sort();
  const vectors = {};
  for (const name of files) {
    vectors[path.basename(name, '.png')] = await trace(path.join(input, name));
  }
  fs.writeFileSync(output, `window.SUBJECT_VECTORS=${JSON.stringify(vectors)};\n`);
  console.log(`Vectorized ${files.length} presets into ${path.relative(root, output)}.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
