import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { root, loadContent } from '../scripts/content.mjs';
import { createStaticServer } from '../scripts/server.mjs';
let server;
let origin;
const { projects } = await loadContent();
before(async () => {
  execFileSync(process.execPath, [path.join(root, 'scripts/build.mjs')], { env:{...process.env, BUILD_BASE:'/mywebsite/'} });
  server = createStaticServer({dist:path.join(root, 'dist'), base:'/mywebsite/'});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); });

test('all eight project pages support direct requests and repeated refreshes', async () => {
  for (const p of projects) {
    const target = `${origin}/mywebsite/projects/${p.slug}/`;
    for (let pass = 0; pass < 2; pass++) {
      const response = await fetch(target);
      assert.equal(response.status, 200, `${p.id} direct/refresh pass ${pass + 1}`);
      const html = await response.text();
      assert.ok(html.includes(`>${p.status}</span>`));
      assert.ok(html.includes('id="06-limitations"'));
      assert.ok(html.includes('/mywebsite/assets/style.css'));
    }
  }
});
test('real routes, assets, trailing-slash redirects and 404s work at the Pages prefix', async () => {
  for (const route of ['','missions/','publication/','assets/style.css','assets/site.js','assets/favicon.svg']) {
    const response = await fetch(`${origin}/mywebsite/${route}`);
    assert.equal(response.status, 200, route);
    assert.ok((await response.text()).length > 0);
  }
  const redirect = await fetch(`${origin}/mywebsite/projects/${projects[0].slug}`, {redirect:'manual'});
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get('location'), `/mywebsite/projects/${projects[0].slug}/`);
  assert.equal((await fetch(`${origin}/mywebsite/no-such-page/`)).status, 404);
  assert.equal((await fetch(`${origin}/assets/style.css`)).status, 404);
});
