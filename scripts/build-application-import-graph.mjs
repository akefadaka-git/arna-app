#!/usr/bin/env node
/**
 * Build a source-level import graph for all four ARNA application entry points.
 *
 * Coverage: TS/JS import declarations, re-exports, dynamic import() calls,
 * Vue SFC script blocks, CSS @import and url() references to local assets.
 * Vue template/global-component registrations and runtime-computed module
 * names are intentionally reported as outside static import analysis.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { parse as parseVue } from '@vue/compiler-sfc';

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'artifacts');
const ENTRY_POINTS = {
  workspace: 'workspace-entry/main.ts',
  portal: 'portal-entry/main.ts',
  admin: 'admin-entry/main.ts',
  public: 'public-entry/main.ts',
};
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.json'];
const ASSET_EXTENSIONS = ['.css', '.scss', '.sass', '.less', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.woff', '.woff2', '.ttf'];
const exists = (file) => fs.existsSync(file) && fs.statSync(file).isFile();
const relative = (file) => path.relative(ROOT, file).split(path.sep).join('/');

function resolveLocal(specifier, importer) {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return { external: true };
  const base = specifier.startsWith('@/') ? path.join(ROOT, 'src', specifier.slice(2)) : path.resolve(path.dirname(importer), specifier);
  const candidates = path.extname(base) ? [base] : [
    ...CODE_EXTENSIONS.map((ext) => base + ext),
    ...ASSET_EXTENSIONS.map((ext) => base + ext),
    ...['index.ts', 'index.js', 'index.vue', 'index.css'].map((name) => path.join(base, name)),
  ];
  const found = candidates.find(exists);
  return found ? { file: found } : { missing: relative(base) };
}

function codeSpecifiers(file, source) {
  const blocks = [];
  if (file.endsWith('.vue')) {
    const parsed = parseVue(source, { filename: file });
    for (const block of [parsed.descriptor.script, parsed.descriptor.scriptSetup]) {
      if (block) blocks.push(block.content);
    }
  } else if (/\.[cm]?[jt]sx?$/.test(file)) {
    blocks.push(source);
  } else if (file.endsWith('.css')) {
    const found = new Set();
    for (const match of source.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]\)?/g)) found.add(match[1]);
    for (const match of source.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) found.add(match[1]);
    return [...found];
  } else {
    return [];
  }

  const specifiers = new Set();
  for (const block of blocks) {
    const ast = ts.createSourceFile(file, block, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node) => {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        specifiers.add(node.moduleSpecifier.text);
      } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0])) {
        specifiers.add(node.arguments[0].text);
      }
      ts.forEachChild(node, visit);
    };
    visit(ast);
  }
  return [...specifiers];
}

const nodes = new Map();
const processed = new Set();
const edges = [];
const unresolved = [];
function visitFile(file, entry, stack = new Set()) {
  const key = relative(file);
  if (!nodes.has(key)) nodes.set(key, { path: key, entries: new Set(), imports: [] });
  const node = nodes.get(key);
  node.entries.add(entry);
  if (stack.has(key) || processed.has(key)) return;
  processed.add(key);
  if (!exists(file)) return;
  const nextStack = new Set(stack).add(key);
  let source;
  try { source = fs.readFileSync(file, 'utf8'); } catch { return; }
  for (const specifier of codeSpecifiers(file, source)) {
    if (/^(https?:|data:|#)/.test(specifier)) continue;
    const resolution = resolveLocal(specifier, file);
    if (resolution.external) continue;
    if (resolution.missing) {
      unresolved.push({ entry, importer: key, specifier, expected: resolution.missing });
      edges.push({ entry, from: key, specifier, to: null, kind: 'unresolved' });
      continue;
    }
    const target = relative(resolution.file);
    const kind = specifier.startsWith('.') || specifier.startsWith('@/') ? 'local' : 'asset';
    node.imports.push({ specifier, target });
    edges.push({ entry, from: key, specifier, to: target, kind });
    if (CODE_EXTENSIONS.includes(path.extname(resolution.file)) || resolution.file.endsWith('.css')) {
      visitFile(resolution.file, entry, nextStack);
    }
  }
}

for (const [name, entryPath] of Object.entries(ENTRY_POINTS)) {
  const absolute = path.join(ROOT, entryPath);
  if (!exists(absolute)) {
    unresolved.push({ entry: name, importer: null, specifier: entryPath, expected: entryPath });
    continue;
  }
  visitFile(absolute, name);
}

const nodeRows = [...nodes.values()].map((node) => ({
  path: node.path,
  entries: [...node.entries].sort(),
  importCount: node.imports.length,
})).sort((a, b) => a.path.localeCompare(b.path));

const adjacency = new Map(nodeRows.map((node) => [node.path, []]));
for (const edge of edges) if (edge.to && adjacency.has(edge.from)) adjacency.get(edge.from).push(edge.to);
const cycles = [];
const visiting = new Set();
const visited = new Set();
const reportedCycles = new Set();
function detectCycles(file, chain = []) {
  if (visiting.has(file)) {
    const cycle = [...chain.slice(chain.indexOf(file)), file];
    const canonical = [...cycle.slice(0, -1)].sort().join('|');
    if (!reportedCycles.has(canonical)) { reportedCycles.add(canonical); cycles.push(cycle); }
    return;
  }
  if (visited.has(file)) return;
  visiting.add(file);
  for (const target of adjacency.get(file) ?? []) detectCycles(target, [...chain, file]);
  visiting.delete(file);
  visited.add(file);
}
for (const file of adjacency.keys()) detectCycles(file);

const entrySummary = Object.fromEntries(Object.keys(ENTRY_POINTS).map((entry) => {
  const entryNodes = nodeRows.filter((node) => node.entries.includes(entry));
  return [entry, { entryPoint: ENTRY_POINTS[entry], reachableFiles: entryNodes.length }];
}));
const report = {
  generatedAt: new Date().toISOString(),
  commit: process.env.GITHUB_SHA ?? null,
  method: 'TypeScript AST + Vue SFC script extraction + CSS local asset reference scan',
  coverageLimitations: [
    'Vue template component tags and app-global component registrations are not represented as module imports.',
    'Runtime-computed import paths and package-internal dependency graphs are not expanded.',
    'This is a static source graph, not a runtime chunk graph or proof that every route is exercised.',
  ],
  entryPoints: entrySummary,
  totals: { reachableFiles: nodeRows.length, localImportEdges: edges.filter((edge) => edge.to).length, unresolvedLocalImports: unresolved.length, cycles: cycles.length },
  nodes: nodeRows,
  edges,
  unresolved,
  cycles,
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUTPUT_DIR, 'arna-application-import-graph.json'), JSON.stringify(report, null, 2) + '\n');
const markdown = [
  '# ARNA four-application import graph',
  '',
  `Generated: ${report.generatedAt}`,
  `Commit: ${report.commit ?? 'local / not supplied'}`,
  '',
  '## Entry-point reachability',
  '',
  '| Application | Entry point | Reachable source/assets |',
  '|---|---|---:|',
  ...Object.entries(entrySummary).map(([name, value]) => `| ${name} | \`${value.entryPoint}\` | ${value.reachableFiles} |`),
  '',
  '## Graph totals',
  '',
  `- Reachable files: ${report.totals.reachableFiles}`,
  `- Local import edges: ${report.totals.localImportEdges}`,
  `- Unresolved local imports: ${report.totals.unresolvedLocalImports}`,
  `- Detected import cycles: ${report.totals.cycles}`,
  '',
  '## Unresolved imports',
  '',
  ...(unresolved.length ? unresolved.map((item) => `- ${item.entry}: ${item.importer ?? '(entry)'} → \`${item.specifier}\` (expected \`${item.expected}\`)`) : ['None detected.']),
  '',
  '## Detected cycles',
  '',
  ...(cycles.length ? cycles.map((cycle) => `- ${cycle.join(' → ')}`) : ['None detected.']),
  '',
  '## Coverage limitations',
  '',
  ...report.coverageLimitations.map((item) => `- ${item}`),
  '',
  'Full nodes and edges are in `artifacts/arna-application-import-graph.json`.',
  '',
].join('\n');
fs.writeFileSync(path.join(OUTPUT_DIR, 'ARNA_APPLICATION_IMPORT_GRAPH.md'), markdown);
console.log(markdown);
if (unresolved.length > 0) process.exitCode = 1;
