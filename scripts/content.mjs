import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const evidenceKinds = ['source-design', 'introduced-fixture', 'native-observation', 'actual-model', 'authorized-professional'];
export const expectedMappings = {
  C01: ['M01', 'M02', 'M06', 'M10'],
  C02: ['M03', 'M08', 'M09', 'M17', 'M28'],
  C03: ['M11', 'M12', 'M13', 'M14', 'M15', 'M27', 'M34'],
  C04: ['M04', 'M18', 'M19', 'M21', 'M29', 'M35'],
  C05: ['M23', 'M24', 'M25', 'M26', 'M27', 'M30'],
  C06: ['M31', 'M32', 'M33'],
  C07: ['M05', 'M07', 'M16', 'M28', 'M36', 'M39'],
  C08: ['M22', 'M30', 'M35', 'M36', 'M40']
};

export async function loadContent() {
  const names = ['profile', 'projects', 'learning', 'missions', 'source'];
  const files = await Promise.all(names.map(name => readFile(path.join(root, 'content', `${name}.json`), 'utf8')));
  return Object.fromEntries(names.map((name, i) => [name, JSON.parse(files[i])]));
}

export function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label}: non-empty text required`);
}

export function requirePublicUrl(value, label) {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${label}: valid HTTPS URL required`); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error(`${label}: public HTTPS URL required`);
}

function requireAsset(value, label) {
  if (/^https:\/\//.test(value)) return requirePublicUrl(value, label);
  if (!/^assets\/[a-zA-Z0-9_./-]+$/.test(value) || value.includes('..')) throw new Error(`${label}: use HTTPS or an assets/ path without traversal`);
}

export function isPublishedStudy(project) {
  return project.status === 'Completed' && project.publication?.approved === true;
}

export function validateContent(data) {
  const { profile, projects, learning, missions, source } = data;
  for (const key of ['name', 'shortName', 'title', 'description', 'about']) requireText(profile[key], `profile.${key}`);
  requirePublicUrl(profile.contact.github, 'contact.github');
  if (profile.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.contact.email)) throw new Error('contact.email: valid real email required');
  if (profile.contact.linkedin) requirePublicUrl(profile.contact.linkedin, 'contact.linkedin');
  for (const key of ['resume', 'photo']) if (profile.contact[key]) requireAsset(profile.contact[key], `contact.${key}`);
  if (profile.contact.photo) requireText(profile.contact.photoAlt, 'contact.photoAlt');
  if (profile.metadata.canonicalUrl) {
    requirePublicUrl(profile.metadata.canonicalUrl, 'metadata.canonicalUrl');
    if (!profile.metadata.canonicalUrl.endsWith('/')) throw new Error('metadata.canonicalUrl: must end with /');
  }
  if (profile.metadata.socialImage) {
    requireAsset(profile.metadata.socialImage, 'metadata.socialImage');
    if (!profile.metadata.canonicalUrl) throw new Error('metadata.socialImage needs the verified canonicalUrl for absolute social metadata');
  }
  if (missions.length !== 40 || new Set(missions.map(m => m.id)).size !== 40) throw new Error('Exactly 40 unique mission IDs required');
  const knownMissions = new Set(missions.map(m => m.id));
  for (let i = 1; i <= 40; i++) if (!knownMissions.has(`M${String(i).padStart(2, '0')}`)) throw new Error(`Missing mission M${i}`);
  if (projects.length !== 8) throw new Error('Exactly eight catalog slots required');
  const ids = new Set();
  const slugs = new Set();
  for (const p of projects) {
    if (!expectedMappings[p.id] || ids.has(p.id)) throw new Error(`Invalid or duplicate slot: ${p.id}`);
    ids.add(p.id);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || slugs.has(p.slug)) throw new Error(`Invalid or duplicate slug: ${p.slug}`);
    slugs.add(p.slug);
    if (JSON.stringify(p.missions) !== JSON.stringify(expectedMappings[p.id])) throw new Error(`${p.id}: preserve the catalog mission mapping`);
    if (!['Planned', 'In progress', 'Blocked', 'Completed'].includes(p.status)) throw new Error(`${p.id}: unsupported status`);
    for (const key of ['title', 'purpose']) requireText(p[key], `${p.id}.${key}`);
    if (!Array.isArray(p.tags) || !p.tags.length) throw new Error(`${p.id}: focus tags required`);
    requireText(p.details.objective, `${p.id}.objective`);
    for (const key of ['scope', 'dependencies', 'investigation', 'evidence', 'followThrough', 'limitations']) {
      if (!Array.isArray(p.details[key]) || !p.details[key].length) throw new Error(`${p.id}.${key}: planned details required`);
      p.details[key].forEach(v => requireText(v, `${p.id}.${key}`));
    }
    if (p.id === 'C06' && !p.optional) throw new Error('C06 must remain an optional specialty');
    if (p.id === 'C08' && !p.sourceSections.includes('17')) throw new Error('C08 must retain Section 17');
    for (const evidence of p.evidenceLinks) {
      requireText(evidence.label, `${p.id}.evidence.label`);
      requirePublicUrl(evidence.url, `${p.id}.evidence.url`);
      if (!evidenceKinds.includes(evidence.kind)) throw new Error(`${p.id}: evidence must declare its actual kind`);
      requireText(evidence.scope, `${p.id}.evidence.scope`);
    }
    const hasObservedFields = p.evidenceLinks.length || p.results || p.metrics.length || p.screenshots.length || p.review;
    if (hasObservedFields && !p.publication.approved) throw new Error(`${p.id}: observed fields need publication permission before public rendering`);
    if (hasObservedFields) requirePublicUrl(p.publication.permissionReference, `${p.id}.permissionReference`);
    if (p.results) {
      requireText(p.results.summary, `${p.id}.results.summary`);
      requirePublicUrl(p.results.evidenceUrl, `${p.id}.results.evidenceUrl`);
      if (!evidenceKinds.includes(p.results.kind)) throw new Error(`${p.id}: result classification required`);
    }
    for (const metric of p.metrics) {
      requireText(metric.label, `${p.id}.metric.label`);
      requireText(metric.method, `${p.id}.metric.method`);
      requirePublicUrl(metric.evidenceUrl, `${p.id}.metric.evidenceUrl`);
      if (metric.numerator !== undefined || metric.denominator !== undefined) {
        if (!Number.isFinite(metric.numerator) || !Number.isFinite(metric.denominator) || metric.denominator <= 0 || metric.numerator < 0 || metric.numerator > metric.denominator) throw new Error(`${p.id}: valid metric numerator and nonzero denominator required`);
      } else {
        if (metric.unit === '%') throw new Error(`${p.id}: percentage metrics require a numerator and denominator`);
        if (!Number.isFinite(metric.value) || !metric.unit) throw new Error(`${p.id}: measured value and unit required`);
      }
    }
    for (const shot of p.screenshots) { requireAsset(shot.src, `${p.id}.screenshot.src`); requireText(shot.alt, `${p.id}.screenshot.alt`); }
    if (p.review) {
      requireText(p.review.status, `${p.id}.review.status`);
      requireText(p.review.scope, `${p.id}.review.scope`);
      requirePublicUrl(p.review.reference, `${p.id}.review.reference`);
    }
    if (p.status === 'Completed') {
      if (!isPublishedStudy(p) || !p.evidenceLinks.length || !p.results) throw new Error(`${p.id}: Completed requires supplied results, classified evidence and publication permission`);
      if (!p.review || p.review.status !== 'Reviewed pass' || p.review.independent !== true) throw new Error(`${p.id}: Completed requires appropriate independent review`);
      requirePublicUrl(p.publication.reproducibilityReference, `${p.id}.reproducibilityReference`);
      requirePublicUrl(p.publication.independentDemonstrationReference, `${p.id}.independentDemonstrationReference`);
    }
  }
  for (const group of [...learning.skills, ...learning.focusAreas]) for (const id of group.missions) if (!knownMissions.has(id)) throw new Error(`Unknown mission ${id}`);
  for (const f of learning.foundations) if (!knownMissions.has(f.mission)) throw new Error(`Unknown foundation ${f.mission}`);
  if (source.evidenceKinds.map(k => k.id).join('|') !== evidenceKinds.join('|')) throw new Error('Evidence taxonomy mismatch');
  return data;
}

export function getBasePath() {
  const base = process.env.BUILD_BASE || '/mywebsite/';
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error('BUILD_BASE must be / or a leading/trailing-slash path such as /mywebsite/');
  return base;
}
