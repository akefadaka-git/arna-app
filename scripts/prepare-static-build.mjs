import { copyFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const builds = {
  workspace: { outDir: 'dist', entry: 'workspace-entry/index.html' },
  portal: { outDir: 'dist-portal', entry: 'portal-entry/index.html' },
  admin: { outDir: 'dist-admin', entry: 'admin-entry/index.html' },
  public: { outDir: 'dist-public', entry: 'public-entry/index.html' },
};

const selected = process.argv[2];
const targets = selected ? [[selected, builds[selected]]] : Object.entries(builds);
if (targets.some(([, descriptor]) => !descriptor)) {
  throw new Error(`Unknown build target "${selected}". Expected workspace, portal, admin, or public.`);
}

for (const [name, descriptor] of targets) {
  const source = path.join(descriptor.outDir, descriptor.entry);
  const destination = path.join(descriptor.outDir, 'index.html');
  await access(source, constants.R_OK);
  await copyFile(source, destination);
  console.log(`Prepared ${name}: ${destination} from ${source}`);
}
