import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { root, loadContent, validateContent, getBasePath } from './content.mjs';

const data = validateContent(await loadContent());
const base = getBasePath();
const dist = path.join(root, 'dist');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const groups = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]));
  return groups.flat();
}
const files = await walk(dist);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const documents = new Map();
for (const file of htmlFiles) documents.set(file, await readFile(file, 'utf8'));
const errors = [];
let localLinkCount = 0;
for (const [file, html] of documents) {
  const name = path.relative(dist, file);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) errors.push(`${name}: exactly one h1 required`);
  if (!/<html lang="en">/.test(html)) errors.push(`${name}: language missing`);
  for (const marker of ['<title>', 'name="description"', 'property="og:title"', 'property="og:description"', 'name="viewport"', 'Skip to content']) if (!html.includes(marker)) errors.push(`${name}: ${marker} missing`);
  if (/<form(?:\s|>)/.test(html)) errors.push(`${name}: no unconnected contact form allowed`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) errors.push(`${name}: duplicate IDs`);
  for (const img of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="[^"]+"/.test(img[0])) errors.push(`${name}: meaningful image alt text required`);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const target = match[1].replaceAll('&amp;', '&');
    if (target.trim() !== target) { errors.push(`${name}: whitespace in URL ${target}`); continue; }
    if (/^https:\/\//.test(target) || /^mailto:/.test(target)) continue;
    localLinkCount++;
    let targetPath, fragment;
    if (target.startsWith('#')) { targetPath = file; fragment = target.slice(1); }
    else {
      if (!target.startsWith(base)) { errors.push(`${name}: URL outside configured base ${target}`); continue; }
      const [route, hash] = target.slice(base.length).split('#');
      targetPath = path.join(dist, route);
      fragment = hash;
      if (!route || route.endsWith('/')) targetPath = path.join(targetPath, 'index.html');
    }
    try { if (!(await stat(targetPath)).isFile()) throw new Error('not a file'); }
    catch { errors.push(`${name}: broken local target ${target}`); continue; }
    if (fragment && documents.has(targetPath) && !documents.get(targetPath).includes(`id="${fragment}"`)) errors.push(`${name}: missing fragment ${target}`);
  }
}
for (const p of data.projects) {
  const page = documents.get(path.join(dist, 'projects', p.slug, 'index.html'));
  if (!page) { errors.push(`${p.id}: static project index missing`); continue; }
  if (!page.includes(`>${p.status}</span>`)) errors.push(`${p.id}: missing actual status label`);
  if (!p.results && page.includes('<h2>Recorded results</h2>')) errors.push(`${p.id}: unavailable result rendered`);
  if (!p.metrics.length && page.includes('<h2>Measured outcomes</h2>')) errors.push(`${p.id}: unavailable metrics rendered`);
  if (!p.review && page.includes('<h2>Recorded review</h2>')) errors.push(`${p.id}: unavailable review rendered`);
}
const serialized = [...documents.values()].join('\n');
if (!data.profile.contact.email && serialized.includes('mailto:')) errors.push('Unprovided email rendered');
if (!data.profile.contact.linkedin && serialized.includes('linkedin.com')) errors.push('Unprovided LinkedIn rendered');
if (!data.profile.contact.resume && serialized.includes('>Résumé</a>')) errors.push('Unprovided résumé rendered');
if (!data.profile.contact.photo && serialized.includes('class="profile-photo"')) errors.push('Unprovided portrait rendered');
if (errors.length) throw new Error(`Static checks failed:\n${errors.join('\n')}`);
console.log(`Static checks passed: ${htmlFiles.length} HTML pages, ${localLinkCount} local links/assets/fragments, metadata, project status and hidden unavailable fields.`);
