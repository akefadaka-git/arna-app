import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const UPSTREAM_COMMIT = '06bfe0d62a98375cb09c942fa18e68bd32cff057';
const FONT_PATH = 'ofl/notosansethiopic/NotoSansEthiopic[wdth,wght].ttf';
const OUTPUT_FONT = 'public/fonts/NotoSansEthiopic-variable.ttf';
const ASSETS = [
  {
    sourcePath: FONT_PATH,
    outputPath: OUTPUT_FONT,
    expectedGitBlobSha: '0910ed80aac7398582c515225304623a60d6f35a',
  },
  {
    sourcePath: 'ofl/notosansethiopic/OFL.txt',
    outputPath: 'public/fonts/OFL.txt',
    expectedGitBlobSha: '23e1a135d51a4bfba0ef048fba7f3bce61465475',
  },
];

function gitBlobSha(buffer) {
  return createHash('sha1')
    .update(Buffer.concat([Buffer.from(`blob ${buffer.length}\0`), buffer]))
    .digest('hex');
}

async function obtain(asset) {
  const output = resolve(asset.outputPath);
  try {
    const existing = await readFile(output);
    const actual = gitBlobSha(existing);
    if (actual === asset.expectedGitBlobSha) {
      console.log(`Verified existing asset: ${asset.outputPath}`);
      return;
    }
    throw new Error(`Existing asset hash mismatch for ${asset.outputPath}: ${actual}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const encodedPath = asset.sourcePath.split('/').map(encodeURIComponent).join('/');
  const url = `https://raw.githubusercontent.com/google/fonts/${UPSTREAM_COMMIT}/${encodedPath}`;
  const response = await fetch(url, { redirect: 'error' });
  if (!response.ok) throw new Error(`Font source request failed (${response.status}): ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const actual = gitBlobSha(buffer);
  if (actual !== asset.expectedGitBlobSha) {
    throw new Error(`Upstream integrity check failed for ${asset.sourcePath}: ${actual}`);
  }
  if (asset.sourcePath === FONT_PATH &&
      (buffer.length < 500_000 || buffer.readUInt32BE(0) !== 0x00010000)) {
    throw new Error('Downloaded Ethiopic font is not a valid TrueType variable-font payload');
  }
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, buffer, { flag: 'wx' });
  console.log(`Vendored and verified: ${asset.outputPath} (${buffer.length} bytes)`);
}

for (const asset of ASSETS) await obtain(asset);
