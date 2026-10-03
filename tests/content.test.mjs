import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../scripts/content.mjs';
const original = await loadContent();
const fresh = () => structuredClone(original);

test('initial content preserves all eight Planned slots and catalog mappings', () => {
  assert.doesNotThrow(() => validateContent(fresh()));
  assert.equal(original.projects.length, 8);
  assert.ok(original.projects.every(p => p.status === 'Planned'));
  assert.ok(original.projects[3].prerequisiteNote.includes('unresolved'));
  assert.equal(original.projects[5].optional, true);
});
test('a status change alone cannot publish an unverified completed study', () => {
  const data = fresh();
  data.projects[0].status = 'Completed';
  assert.throws(() => validateContent(data), /Completed requires/);
});
test('catalog mappings cannot drift during content editing', () => {
  const data = fresh();
  data.projects[2].missions.pop();
  assert.throws(() => validateContent(data), /preserve the catalog mission mapping/);
});
test('observations cannot be published without permission and classification', () => {
  const data = fresh();
  data.projects[0].evidenceLinks = [{label:'Synthetic test record',url:'https://github.com/example/example',kind:'introduced-fixture',scope:'One synthetic boundary'}];
  assert.throws(() => validateContent(data), /publication permission/);
  data.projects[0].publication.approved = true;
  data.projects[0].publication.permissionReference = 'https://github.com/example/example';
  data.projects[0].evidenceLinks[0].kind = 'achievement';
  assert.throws(() => validateContent(data), /actual kind/);
});
test('completed studies require independent review and demonstration', () => {
  const data = fresh();
  const p = data.projects[0];
  p.status = 'Completed';
  p.publication = {approved:true,permissionReference:'https://github.com/example/permission',reproducibilityReference:'https://github.com/example/reproduction',independentDemonstrationReference:'https://github.com/example/demonstration'};
  p.evidenceLinks = [{label:'Source record',url:'https://github.com/example/source',kind:'source-design',scope:'Reviewed source trace only'}];
  p.results = {summary:'Scope-limited source trace',kind:'source-design',evidenceUrl:'https://github.com/example/results'};
  p.review = {status:'Reviewed pass',scope:'Source trace only',reference:'https://github.com/example/review',independent:false};
  assert.throws(() => validateContent(data), /independent review/);
  p.review.independent = true;
  assert.doesNotThrow(() => validateContent(data));
});
test('undefined 0/0 and percentages without trial denominators are rejected', () => {
  const data = fresh();
  const p = data.projects[0];
  p.publication = {approved:true,permissionReference:'https://github.com/example/permission'};
  p.metrics = [{label:'Attack successes',numerator:0,denominator:0,method:'Valid attack trials only',evidenceUrl:'https://github.com/example/ledger'}];
  assert.throws(() => validateContent(data), /nonzero denominator/);
  p.metrics = [{label:'Attack successes',value:0,unit:'%',method:'Valid attack trials only',evidenceUrl:'https://github.com/example/ledger'}];
  assert.throws(() => validateContent(data), /numerator and denominator/);
});
test('unsafe paths and unprovided contact placeholders are rejected', () => {
  const data = fresh();
  data.profile.contact.photo = 'assets/../../private.png';
  assert.throws(() => validateContent(data), /without traversal/);
  data.profile.contact.photo = null;
  data.profile.contact.email = 'add-email-here';
  assert.throws(() => validateContent(data), /real email/);
});
