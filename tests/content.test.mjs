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

test('workshop proposals cannot become delivered claims through a status edit', () => {
  const data = fresh();
  data.training.workshops[0].status = 'Delivered';
  assert.throws(() => validateContent(data), /only Proposed status/);
  data.training.workshops[0].status = 'Proposed';
  data.training.status = 'Completed';
  assert.throws(() => validateContent(data), /only Proposed workshops/);
});
test('workshop agendas need valid minutes that reconcile to the proposed duration', () => {
  for (const minutes of [0, -5, 2.5, '20']) {
    const data = fresh();
    data.training.workshops[0].agenda[0].minutes = minutes;
    assert.throws(() => validateContent(data), /positive integers/);
  }
  const data = fresh();
  data.training.workshops[0].durationMinutes++;
  assert.throws(() => validateContent(data), /must equal proposed duration/);
});
test('workshop URLs and identities cannot collide or escape their routes', () => {
  const data = fresh();
  data.training.workshops[1].slug = data.training.workshops[0].slug;
  assert.throws(() => validateContent(data), /unique safe workshop slug/);
  data.training.workshops[1].slug = '../contact';
  assert.throws(() => validateContent(data), /unique safe workshop slug/);
  data.training.workshops[1].slug = original.training.workshops[1].slug;
  data.training.workshops[1].id = data.training.workshops[0].id;
  assert.throws(() => validateContent(data), /unique Wxx workshop IDs/);
});
test('proposals require outcomes, prerequisites, materials and honest contact limitations', () => {
  for (const field of ['outcomes', 'prerequisites', 'materials']) {
    const data = fresh();
    data.training.workshops[0][field] = [];
    assert.throws(() => validateContent(data), /non-empty text list/);
  }
  const data = fresh();
  data.training.contact.limitation = '';
  assert.throws(() => validateContent(data), /contact.limitation/);
});
test('profile learning records require a reference and cannot bypass case-study completion gates', () => {
  const data = fresh();
  data.profile.learningWork[0].reference = 'javascript:alert(1)';
  assert.throws(() => validateContent(data), /public HTTPS URL/);
  data.profile.learningWork[0].reference = original.profile.learningWork[0].reference;
  data.profile.learningWork[0].status = 'Completed';
  assert.throws(() => validateContent(data), /published case study/);
});
