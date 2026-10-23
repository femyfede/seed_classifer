/*
 * End-to-end helper: convert .rgba fixtures to model-ready .f32 tensors using
 * the SAME module the browser uses (deploy/preprocess.js).
 *
 * Usage: node tools/e2e_preprocess.js <dir> <size>
 */
const fs = require('fs');
const path = require('path');
const { preprocessRGBA } = require(path.join(__dirname, '..', 'deploy', 'preprocess.js'));

const dir = process.argv[2];
const size = parseInt(process.argv[3] || '64', 10);

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.rgba')) continue;
  const rgba = new Uint8Array(fs.readFileSync(path.join(dir, file)));
  const out = preprocessRGBA(rgba, size);
  fs.writeFileSync(path.join(dir, file.replace('.rgba', '.f32')), Buffer.from(out.buffer));
}
console.log('e2e preprocessing complete');
