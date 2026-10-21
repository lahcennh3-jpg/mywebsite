import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { root, loadContent } from '../scripts/content.mjs';
import { createStaticServer } from '../scripts/server.mjs';
const { projects, training, profile } = await loadContent();

// Sequential suites: each serves the same dist/ using a different deployment prefix.
for (const base of ['/mywebsite/', '/']) {
  describe(`static routes at BUILD_BASE=${base}`, { concurrency: false }, () => {
    let server;
    let origin;
    before(async () => {
      const env = { ...process.env, BUILD_BASE: base };
      execFileSync(process.execPath, [path.join(root, 'scripts/build.mjs')], { env });
      execFileSync(process.execPath, [path.join(root, 'scripts/check.mjs')], { env });
      server = createStaticServer({ dist: path.join(root, 'dist'), base });
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      origin = `http://127.0.0.1:${server.address().port}`;
    });
    after(async () => { if (server) await new Promise(resolve => server.close(resolve)); });

    test('all eight existing project pages support direct requests and repeated refreshes', async () => {
      for (const p of projects) {
        for (let pass = 0; pass < 2; pass++) {
          const response = await fetch(`${origin}${base}projects/${p.slug}/`);
          assert.equal(response.status, 200, `${p.id} pass ${pass + 1}`);
          const html = await response.text();
          assert.ok(html.includes(`>${p.status}</span>`));
          assert.ok(html.includes('id="06-limitations"'));
          assert.ok(html.includes(`${base}assets/style.css`));
        }
      }
    });
    test('routes, assets, trailing-slash redirects and 404s work', async () => {
      for (const route of ['', 'missions/', 'publication/', 'assets/style.css', 'assets/site.js', 'assets/favicon.svg']) {
        const response = await fetch(`${origin}${base}${route}`);
        assert.equal(response.status, 200, route);
        assert.ok((await response.text()).length > 0);
      }
      for (const route of [`projects/${projects[0].slug}`, 'training', 'training/syllabus']) {
        const response = await fetch(`${origin}${base}${route}`, { redirect: 'manual' });
        assert.equal(response.status, 301);
        assert.equal(response.headers.get('location'), `${base}${route}/`);
      }
      assert.equal((await fetch(`${origin}${base}no-such-page/`)).status, 404);
      if (base !== '/') assert.equal((await fetch(`${origin}/assets/style.css`)).status, 404);
    });
    test('training pages refresh directly and preserve navigation, scope and contact limits', async () => {
      for (const route of ['training/', 'training/trainer-profile/', 'training/syllabus/', 'training/contact/']) {
        for (let pass = 0; pass < 2; pass++) {
          const response = await fetch(`${origin}${base}${route}`);
          assert.equal(response.status, 200, route);
          const html = await response.text();
          assert.ok(html.includes(`href="${base}training/" aria-current="page"`));
          assert.ok(html.includes(`href="${base}#portfolio"`));
          assert.ok(html.includes(`${base}assets/site.js`));
          assert.doesNotMatch(html, /<form\b|mailto:|formsubmit\.co|linkedin\.com/);
          assert.ok(html.includes('Proposed') || html.includes('proposed'));
        }
      }
      const contact = await (await fetch(`${origin}${base}training/contact/`)).text();
      assert.ok(contact.includes(`href="${profile.contact.github}"`));
      assert.ok(contact.includes('it does not send a message or reserve a workshop'));
      assert.ok(contact.includes('Nothing on this page sends or stores an enquiry.'));
      assert.ok(contact.includes('id="enquiry-outline"'));
    });
    test('each proposal has a linked syllabus, matching timed agenda and fallback print instructions', async () => {
      const html = await (await fetch(`${origin}${base}training/syllabus/`)).text();
      const landing = await (await fetch(`${origin}${base}training/`)).text();
      assert.ok(html.includes('class="printable-page"'));
      assert.ok(html.includes('Use your browser’s Print menu'));
      assert.ok(html.includes('data-print hidden'));
      for (const w of training.workshops) {
        assert.ok(landing.includes(`href="${base}training/syllabus/#${w.id}"`));
        assert.ok(html.includes(`id="${w.id}"`));
        assert.ok(html.includes(`${w.id} proposed agenda — ${w.durationMinutes} minutes total`));
        for (const item of w.agenda) assert.ok(html.includes(`<td>${item.minutes}</td>`));
      }
    });
    test('home retains portfolio navigation and adds an educational partnership CTA', async () => {
      const html = await (await fetch(`${origin}${base}`)).text();
      assert.ok(html.includes('href="#portfolio">Explore My Portfolio'));
      assert.ok(html.includes('href="#journey">View My Learning Journey'));
      assert.ok(html.includes(`href="${base}training/">Educational partnerships in Agadir`));
      assert.ok(html.includes('Completed studies <span>0</span>'));
      assert.ok(html.includes('Aspiring engineer'));
    });
  });
}
