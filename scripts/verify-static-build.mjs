import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const builds = [
  ['workspace', 'dist'],
  ['portal', 'dist-portal'],
  ['admin', 'dist-admin'],
  ['public', 'dist-public'],
];
const requiredApiOrigin = 'https://api.maalearna.com.et';
const failures = [];

async function readable(file) {
  try {
    await access(file, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

for (const [name, outDir] of builds) {
  const root = path.resolve(outDir);
  const htmlPath = path.join(root, 'index.html');
  if (!(await readable(htmlPath))) {
    failures.push(`${name}: missing root entry point ${path.relative(process.cwd(), htmlPath)}`);
    continue;
  }

  const html = await readFile(htmlPath, 'utf8');
  if (!/<script\b[^>]*\bsrc=["'][^"']+\.js(?:[?#][^"']*)?["'][^>]*>/i.test(html)) {
    failures.push(`${name}: root index.html has no generated JavaScript entry reference`);
  }
  if (!/<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*\bhref=["'][^"']+\.css(?:[?#][^"']*)?["'][^>]*>/i.test(html)) {
    failures.push(`${name}: root index.html has no generated stylesheet reference`);
  }

  const refs = [...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)].map(match => match[1]);
  for (const ref of refs) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|data:|mailto:|tel:)/i.test(ref)) continue;
    const clean = ref.split(/[?#]/, 1)[0];
    if (!/\.(?:js|mjs|css|png|jpe?g|gif|webp|svg|ico|webmanifest|woff2?|ttf|otf)$/i.test(clean)) continue;
    const relative = clean.startsWith('/') ? clean.slice(1) : clean;
    const assetPath = path.resolve(root, relative);
    if (!assetPath.startsWith(root + path.sep) && assetPath !== root) {
      failures.push(`${name}: resource reference escapes output root: ${ref}`);
      continue;
    }
    if (!(await readable(assetPath))) failures.push(`${name}: referenced asset is missing: ${ref}`);
  }

  const htaccessPath = path.join(root, '.htaccess');
  if (!(await readable(htaccessPath))) {
    failures.push(`${name}: missing deployed .htaccess`);
  } else {
    const config = await readFile(htaccessPath, 'utf8');
    const policies = [...config.matchAll(/Header always set Content-Security-Policy "([^"]+)"/g)].map(match => match[1]);
    const policy = policies.find(value => value.includes("default-src"));
    const csp = policy?.match(/(?:^|;\\s*)connect-src\\s+([^;]+)/i)?.[1] ?? '';
    if (!csp.includes(requiredApiOrigin) || /(?:^|\s)https:(?:\s|$)/.test(csp)) {
      failures.push(`${name}: CSP connect-src must allow only the approved API origin; found "${csp.trim()}"`);
    }
    if (!/RewriteRule\s+\^\s+\/index\.html\s+\[L\]/.test(config)) {
      failures.push(`${name}: SPA fallback must target the root /index.html`);
    }
  }

  console.log(`Verified ${name}: root index, generated JS/CSS, referenced local assets, and deployment configuration`);
}

if (failures.length) {
  console.error('\nStatic build verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('\nAll four static build outputs satisfy the deployment preflight contract.');
}
