/*
 * Python <-> JavaScript preprocessing parity test.
 *
 * Run:
 *   python tools/gen_parity_fixture.py
 *   node tools/parity_test.js
 *
 * It feeds the exact same RGBA pixels to the shared JS preprocessing module
 * (deploy/preprocess.js) and to a tensor produced by Python, then compares.
 * This is the regression guard for the NCHW/NHWC layout bug described in
 * AUDIT.md (CRITICAL-1).
 */
const fs = require('fs');
const path = require('path');

const { preprocessRGBA } = require(path.join(__dirname, '..', 'deploy', 'preprocess.js'));

const SIZE = 64;
const PARITY_DIR = path.join(__dirname, 'parity');
const RGBA_PATH = path.join(PARITY_DIR, 'fixture_rgba.bin');
const EXPECTED_PATH = path.join(PARITY_DIR, 'fixture_expected.bin');
const TOLERANCE = 1e-5;

function main() {
  if (!fs.existsSync(RGBA_PATH) || !fs.existsSync(EXPECTED_PATH)) {
    console.error('Fixture missing. Run:  python tools/gen_parity_fixture.py');
    process.exit(1);
  }

  const rgba = new Uint8Array(fs.readFileSync(RGBA_PATH));
  const expectedBuf = fs.readFileSync(EXPECTED_PATH);
  const expected = new Float32Array(
    expectedBuf.buffer,
    expectedBuf.byteOffset,
    expectedBuf.length / 4
  );

  const actual = preprocessRGBA(rgba, SIZE);

  if (actual.length !== expected.length) {
    console.error(`FAIL: length mismatch ${actual.length} != ${expected.length}`);
    process.exit(1);
  }

  let maxDiff = 0;
  let maxIndex = -1;
  for (let i = 0; i < actual.length; i++) {
    const diff = Math.abs(actual[i] - expected[i]);
    if (diff > maxDiff) {
      maxDiff = diff;
      maxIndex = i;
    }
  }

  if (maxDiff > TOLERANCE) {
    const plane = SIZE * SIZE;
    console.error(
      `FAIL: max diff ${maxDiff.toExponential(3)} at index ${maxIndex} ` +
      `(plane ${Math.floor(maxIndex / plane)}, offset ${maxIndex % plane})`
    );
    process.exit(1);
  }

  console.log(`PASS: JS preprocessing matches Python (max diff ${maxDiff.toExponential(2)})`);
}

main();
