import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, getBasePath } from './content.mjs';
import { createStaticServer } from './server.mjs';

const args = process.argv.slice(2);
const value = name => args[args.indexOf(name) + 1];
const port = Number(args.includes('--port') ? value('--port') : 4173);
const host = args.includes('--host') ? value('--host') : '127.0.0.1';
const base = getBasePath();
const dist = path.join(root, 'dist');
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
const build = spawnSync(process.execPath, [path.join(root, 'scripts/build.mjs')], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status || 1);
const server = createStaticServer({ dist, base });
server.listen(port, host, () => console.log(`Static preview ready on port ${port}; base path ${base}. Run npm run build and reload after edits.`));
