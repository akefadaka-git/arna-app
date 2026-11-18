import { readFile, writeFile, readdir, rename, stat } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';

const ROOT = process.cwd();
const TEXT_EXTENSIONS = new Set(['.vue', '.ts', '.tsx', '.js', '.mjs', '.css', '.html', '.json', '.md', '.yml', '.yaml']);
const ROOT_FILES = new Set(['README.md', 'vite.config.ts', 'package.json', 'package-lock.json', '.env.workspace', '.env.portal', '.env.admin']);

async function walk(directory) {
  const out = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) out.push(...await walk(path));
    else out.push(path);
  }
  return out;
}

function maskComments(source) {
  const comments = [];
  const hold = (value) => {
    const marker = `\u0000ARNA_COMMENT_${comments.length}\u0000`;
    comments.push(value);
    return marker;
  };
  let code = source
    .replace(/\/\*[\s\S]*?\*\//g, hold)
    .replace(/<!--[\s\S]*?-->/g, hold)
    .replace(/^\s*\/\/.*$/gm, hold)
    .replace(/(\s+)\/\/[^\r\n]*$/gm, (_match, prefix) => prefix + hold(_match.slice(prefix.length)));
  code = code.replace(/\u0000ARNA_COMMENT_(\d+)\u0000/g, (_match, index) => comments[Number(index)]);
  return code;
}

function transformExecutable(source) {
  const comments = [];
  const hold = (value) => {
    const marker = `\u0000ARNA_COMMENT_${comments.length}\u0000`;
    comments.push(value);
    return marker;
  };
  let code = source
    .replace(/\/\*[\s\S]*?\*\//g, hold)
    .replace(/<!--[\s\S]*?-->/g, hold)
    .replace(/^\s*\/\/.*$/gm, hold)
    .replace(/(\s+)\/\/[^\r\n]*$/gm, (_match, prefix) => prefix + hold(_match.slice(prefix.length)));

  code = code
    .replace(/MASESBrand/g, 'ArnaBrand')
    .replace(/MASESFooterContent/g, 'ArnaFooterContent')
    .replace(/masesBrandLabels/g, 'arnaBrandLabels')
    .replace(/masesFooterLabels/g, 'arnaFooterLabels')
    .replace(/masesShellLabels/g, 'arnaShellLabels')
    .replace(/masesUserMenuItems/g, 'arnaUserMenuItems')
    .replace(/masesBrand/g, 'arnaBrand')
    .replace(/masesFooter/g, 'arnaFooter')
    .replace(/__mases/g, '__arna')
    .replace(/--mases-/g, '--arna-')
    .replace(/mases-/g, 'arna-')
    .replace(/\bMASES\b/g, 'ARNA');

  return code.replace(/\u0000ARNA_COMMENT_(\d+)\u0000/g, (_match, index) => comments[Number(index)]);
}

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`Expected migration anchor missing: ${label}`);
  return source.replace(from, to);
}

async function update(path, transform) {
  const absolute = join(ROOT, path);
  let source = await readFile(absolute, 'utf8');
  const next = transform(source);
  if (next !== source) await writeFile(absolute, next);
}

async function migrateLocaleStorage() {
  await update('src/stores/locale.ts', (source) => {
    source = replaceRequired(source, "const STORAGE_KEY = 'mases.locale';", "const STORAGE_KEY = 'arna.locale';\nconst LEGACY_STORAGE_KEY = 'mases.locale';", 'locale storage key');
    source = replaceRequired(source, 'return localStorage.getItem(STORAGE_KEY);', 'return localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);', 'locale legacy read');
    source = replaceRequired(source, 'localStorage.setItem(STORAGE_KEY, value);', 'localStorage.setItem(STORAGE_KEY, value);\n      localStorage.removeItem(LEGACY_STORAGE_KEY);', 'locale new-key write');
    source = replaceRequired(source, 'localStorage.removeItem(STORAGE_KEY);', 'localStorage.removeItem(STORAGE_KEY);\n      localStorage.removeItem(LEGACY_STORAGE_KEY);', 'locale clear both keys');
    return source;
  });

  await update('src/stores/tenant.ts', (source) => {
    source = replaceRequired(source, "const KEY = 'mases.tenant_id';", "const KEY = 'arna.tenant_id';\n  const LEGACY_KEY = 'mases.tenant_id';", 'tenant storage key');
    source = replaceRequired(source, 'const raw = localStorage.getItem(KEY);', 'const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);', 'tenant legacy read');
    source = replaceRequired(source, 'localStorage.setItem(KEY, String(id));', 'localStorage.setItem(KEY, String(id));\n      localStorage.removeItem(LEGACY_KEY);', 'tenant new-key write');
    source = replaceRequired(source, 'localStorage.removeItem(KEY);', 'localStorage.removeItem(KEY);\n      localStorage.removeItem(LEGACY_KEY);', 'tenant clear both keys');
    return source;
  });

  await update('src/core/bootstrap.ts', (source) => {
    source = replaceRequired(source, "const KEY = 'mases.auth_token';", "const KEY = 'arna.auth_token';\n  const LEGACY_KEY = 'mases.auth_token';", 'auth token storage key');
    source = replaceRequired(source, 'return sessionStorage.getItem(KEY);', 'return sessionStorage.getItem(KEY) ?? sessionStorage.getItem(LEGACY_KEY);', 'auth token legacy read');
    source = replaceRequired(source, 'sessionStorage.setItem(KEY, token);', 'sessionStorage.setItem(KEY, token);\n      sessionStorage.removeItem(LEGACY_KEY);', 'auth token new-key write');
    source = replaceRequired(source, 'sessionStorage.removeItem(KEY);', 'sessionStorage.removeItem(KEY);\n      sessionStorage.removeItem(LEGACY_KEY);', 'auth token clear both keys');
    return source;
  });

  await update('src/features/auth/LoginForm/LoginForm.vue', (source) => {
    source = replaceRequired(source, "const REMEMBERED_IDENTIFIER_KEY = 'mases.auth.remembered_identifier';", "const REMEMBERED_IDENTIFIER_KEY = 'arna.auth.remembered_identifier';\nconst LEGACY_REMEMBERED_IDENTIFIER_KEY = 'mases.auth.remembered_identifier';", 'remembered identifier keys');
    source = replaceRequired(
      source,
      'const value = window.localStorage.getItem(REMEMBERED_IDENTIFIER_KEY);',
      'const value = window.localStorage.getItem(REMEMBERED_IDENTIFIER_KEY) ?? window.localStorage.getItem(LEGACY_REMEMBERED_IDENTIFIER_KEY);',
      'remembered identifier legacy read',
    );
    source = replaceRequired(
      source,
      "if (typeof value === 'string' && value.length > 0) {\n      return value;",
      "if (typeof value === 'string' && value.length > 0) {\n      window.localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, value);\n      window.localStorage.removeItem(LEGACY_REMEMBERED_IDENTIFIER_KEY);\n      return value;",
      'remembered identifier migration on read',
    );
    source = replaceRequired(
      source,
      'window.localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, value);',
      'window.localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, value);\n      window.localStorage.removeItem(LEGACY_REMEMBERED_IDENTIFIER_KEY);',
      'remembered identifier new-key write',
    );
    source = replaceRequired(
      source,
      'window.localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);',
      'window.localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);\n      window.localStorage.removeItem(LEGACY_REMEMBERED_IDENTIFIER_KEY);',
      'remembered identifier clear both keys',
    );
    return source;
  });
}

async function renameBrandComponents() {
  const pairs = [
    ['src/layouts/AppShell/MASESBrand', 'src/layouts/AppShell/ArnaBrand'],
    ['src/layouts/AppShell/MASESFooterContent', 'src/layouts/AppShell/ArnaFooterContent'],
  ];
  for (const [oldRelative, newRelative] of pairs) {
    const oldPath = join(ROOT, oldRelative);
    const newPath = join(ROOT, newRelative);
    try {
      await stat(oldPath);
      try { await stat(newPath); throw new Error(`Refusing to overwrite existing component directory: ${newRelative}`); } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
      await rename(oldPath, newPath);
      const oldFile = oldRelative.endsWith('MASESBrand') ? 'MASESBrand.vue' : 'MASESFooterContent.vue';
      const newFile = oldFile.replace('MASES', 'Arna');
      await rename(join(newPath, oldFile), join(newPath, newFile));
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
}

async function main() {
  await migrateLocaleStorage();

  const roots = ['src', 'tests', 'workspace-entry', 'portal-entry', 'admin-entry', 'public-entry'];
  const files = [];
  for (const root of roots) files.push(...await walk(join(ROOT, root)));
  for (const name of ROOT_FILES) files.push(join(ROOT, name));
  for (const name of ['.env.workspace', '.env.portal', '.env.admin']) files.push(join(ROOT, name));

  let changed = 0;
  for (const absolute of [...new Set(files)]) {
    const ext = absolute.slice(absolute.lastIndexOf('.'));
    if (!TEXT_EXTENSIONS.has(ext) && !['.env.workspace', '.env.portal', '.env.admin'].some((suffix) => absolute.endsWith(suffix))) continue;
    let source;
    try { source = await readFile(absolute, 'utf8'); } catch { continue; }
    let next = transformExecutable(source);
    if (absolute.endsWith('vite.config.ts')) next = next.replace('MASES UI — Vite configuration', 'ARNA UI — Vite configuration');
    if (absolute.endsWith('README.md')) {
      next = next.replace(/^\*\*ARNA is the master name for the Maale Arna Smart System\. MASES is the established legacy\/product name used during the transition\.\*\*/m,
        '**ARNA is the canonical product name for the Maale Arna Smart System. Historical MASES references are retained only as provenance or read-only migration compatibility.**');
      if (!next.includes('ARNA is the canonical product name')) next = '**ARNA is the canonical product name for the Maale Arna Smart System.**\n\n' + next;
    }
    if (absolute.endsWith('package.json')) {
      const manifest = JSON.parse(next);
      manifest.name = 'arna-ui';
      manifest.scripts = manifest.scripts || {};
      manifest.scripts['test:brand-identity-contract'] = 'node --test tests/brand-identity-contract.test.mjs';
      next = JSON.stringify(manifest, null, 2) + '\n';
    }
    if (absolute.endsWith('package-lock.json')) {
      const lock = JSON.parse(next);
      lock.name = 'arna-ui';
      lock.packages = lock.packages || {};
      lock.packages[''] = lock.packages[''] || {};
      lock.packages[''].name = 'arna-ui';
      next = JSON.stringify(lock, null, 2) + '\n';
    }
    if (absolute.endsWith('.env.workspace')) next = next.replace(/^VITE_APP_NAME=.*$/m, 'VITE_APP_NAME="ARNA Workspace"');
    if (absolute.endsWith('.env.portal')) next = next.replace(/^VITE_APP_NAME=.*$/m, 'VITE_APP_NAME="ARNA Shareholder Portal"');
    if (absolute.endsWith('.env.admin')) next = next.replace(/^VITE_APP_NAME=.*$/m, 'VITE_APP_NAME=ARNA Administration');
    if (absolute.endsWith('workspace-entry/index.html')) next = next.replace(/<title>[^<]*<\/title>/i, '<title>ARNA Workspace</title>');
    if (absolute.endsWith('portal-entry/index.html')) next = next.replace(/<title>[^<]*<\/title>/i, '<title>ARNA Shareholder Portal</title>');
    if (absolute.endsWith('admin-entry/index.html')) next = next.replace(/<title>[^<]*<\/title>/i, '<title>ARNA Administration</title>');
    if (absolute.endsWith('src/router/shell-labels.ts')) {
      next = next.replace("productName: 'ማሴስ'", "productName: 'ARNA'");
      next = next.replace("fullCorporateIdentity: 'ማሌ ዓርና ስማርት ሲስተም (ማሴስ)'", "fullCorporateIdentity: 'ማሌ ዓርና ስማርት ሲስተም (ARNA)'");
      next = next.replaceAll('ወደ ማሴስ ወርክስፔስ', 'ወደ ARNA ወርክስፔስ');
    }
    if (next !== source) {
      await writeFile(absolute, next);
      changed++;
    }
  }

  await renameBrandComponents();
  console.log(`A3.1 namespace migration changed ${changed} text files; component directory renames applied where present.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
