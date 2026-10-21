import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { root, loadContent } from '../../scripts/content.mjs';
import { createStaticServer } from '../../scripts/server.mjs';

const resultsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'results');
await mkdir(resultsDir, { recursive: true });
const content = await loadContent();
const routes = ['', 'training/', 'training/trainer-profile/', 'training/syllabus/', 'training/contact/'];
const report = { runtime: process.version, browser: null, checks: [], errors: [], limits: [
  'Chromium emulation only; physical devices, Firefox and Safari were not tested.',
  'Axe covers selected automated WCAG A/AA rules, not full accessibility conformance or screen-reader use.',
  'Headless Chromium PDF output is tested; native OS print dialogs and browser zoom are not tested.',
  'Clipboard rejection is simulated separately from a real granted-permission copy.'
] };
const browser = await chromium.launch({ headless: true });
report.browser = browser.version();
const faults = [];
let server;
let activePage;
let currentLabel = 'startup';
const deadline = setTimeout(() => { console.error('Browser verification exceeded 8 minutes'); process.exit(1); }, 480_000);
deadline.unref();

async function check(label, action) {
  currentLabel = label;
  const detail = await action();
  report.checks.push({ label, passed: true, ...(detail ? { detail } : {}) });
  console.log(`PASS ${label}${detail ? ` ${JSON.stringify(detail)}` : ''}`);
}
async function open(page, target) {
  activePage = page;
  const response = await page.goto(target, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, target);
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow(page) {
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  assert.ok(dimensions.document <= dimensions.viewport + 1, JSON.stringify(dimensions));
  return dimensions;
}
async function monitoredContext(origin, options = {}) {
  const context = await browser.newContext({ reducedMotion: 'reduce', ...options });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  context.on('page', page => {
    page.setDefaultTimeout(12_000);
    page.on('pageerror', error => faults.push(error.message));
    page.on('console', message => { if (message.type() === 'error') faults.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) faults.push(`${response.status()} ${response.url()}`); });
    page.on('requestfailed', request => faults.push(`${request.failure()?.errorText} ${request.url()}`));
  });
  return context;
}

try {
  for (const base of ['/mywebsite/', '/']) {
    const prefix = base === '/' ? 'root' : 'pages';
    const env = { ...process.env, BUILD_BASE: base };
    execFileSync(process.execPath, [path.join(root, 'scripts/build.mjs')], { env, stdio: 'inherit' });
    execFileSync(process.execPath, [path.join(root, 'scripts/check.mjs')], { env, stdio: 'inherit' });
    server = createStaticServer({ dist: path.join(root, 'dist'), base });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const context = await monitoredContext(origin, { viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();

    const allRoutes = [...routes, 'publication/', 'missions/', ...content.projects.map(p => `projects/${p.slug}/`)];
    for (const route of allRoutes) {
      await check(`${prefix} direct/refresh ${route || 'home'}`, async () => {
        await open(page, `${origin}${base}${route}`);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal((await page.reload({ waitUntil: 'networkidle' })).status(), 200);
        assert.equal(await page.locator('#primary-navigation a[href="' + base + 'training/"]').count(), 1);
      });
    }

    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of routes) {
        await check(`${prefix} ${width}px layout ${route || 'home'}`, async () => {
          await open(page, `${origin}${base}${route}`);
          assert.ok(await page.locator('h1').isVisible());
          const dimensions = await noOverflow(page);
          if (base === '/' && ((route === 'training/' && [320, 390, 1440].includes(width)) || (route === '' && width === 1440))) {
            await page.screenshot({ path: path.join(resultsDir, `${prefix}-${width}-${route ? 'training' : 'home'}.png`) });
          }
          return dimensions;
        });
      }
      await check(`${prefix} ${width}px training navigation`, async () => {
        await open(page, `${origin}${base}`);
        if (width <= 900) {
          const menu = page.getByRole('button', { name: 'Menu', exact: true });
          await menu.focus();
          await page.keyboard.press('Enter');
          assert.equal(await menu.getAttribute('aria-expanded'), 'true');
          await page.keyboard.press('Escape');
          assert.equal(await menu.getAttribute('aria-expanded'), 'false');
          assert.ok(await menu.evaluate(element => element === document.activeElement));
          await page.keyboard.press('Enter');
        }
        await page.locator('#primary-navigation').getByRole('link', { name: 'Training & Workshops', exact: true }).click();
        await page.waitForURL(`${origin}${base}training/`);
        assert.equal(await page.locator('#primary-navigation [aria-current="page"]').innerText(), 'Training & Workshops');
      });
    }

    await check(`${prefix} keyboard skip link and disclosure`, async () => {
      await open(page, `${origin}${base}training/`);
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute('href')), '#main');
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'main');
      const disclosure = page.locator('.workshop-details summary').first();
      await disclosure.focus();
      await page.keyboard.press('Enter');
      assert.ok(await page.locator('.workshop-details').first().evaluate(element => element.open));
    });

    if (base === '/') {
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const route of routes) {
          await check(`axe ${width}px ${route || 'home'}`, async () => {
            await open(page, `${origin}${base}${route}`);
            const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
            const violations = result.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => n.target) }));
            assert.deepEqual(violations, []);
            return { automatedViolations: violations.length, incompleteRules: result.incomplete.map(rule => rule.id) };
          });
        }
      }
      for (const [name, expectedPages] of [['trainer-profile', 1], ['syllabus', 4]]) {
        await check(`Chromium print ${name}`, async () => {
          await page.setViewportSize({ width: 1440, height: 1000 });
          await open(page, `${origin}${base}training/${name}/`);
          assert.ok(await page.getByRole('button', { name: 'Print / Save as PDF' }).isVisible());
          await page.emulateMedia({ media: 'print' });
          assert.equal(await page.locator('.site-header').isVisible(), false);
          assert.equal(await page.locator('.print-actions').isVisible(), false);
          const pdf = await page.pdf({ path: path.join(resultsDir, `${name}.pdf`), preferCSSPageSize: true, printBackground: false, tagged: true });
          const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
          assert.equal(pages, expectedPages);
          await page.emulateMedia({ media: 'screen' });
          return { pages };
        });
      }
    }

    await check(`${prefix} clipboard granted`, async () => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
      await open(page, `${origin}${base}training/contact/`);
      const expected = await page.locator('#enquiry-outline').textContent();
      await page.getByRole('button', { name: 'Copy enquiry outline' }).click();
      await page.waitForFunction(() => document.querySelector('.copy-status').textContent.includes('No message has been sent.'));
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expected);
    });
    await context.close();

    const denied = await monitoredContext(origin);
    await denied.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Simulated permission denial')) } }); });
    const deniedPage = await denied.newPage();
    await check(`${prefix} clipboard simulated denial`, async () => {
      await open(deniedPage, `${origin}${base}training/contact/`);
      await deniedPage.getByRole('button', { name: 'Copy enquiry outline' }).click();
      await deniedPage.waitForFunction(() => document.querySelector('.copy-status').textContent.includes('Select the outline'));
      assert.ok(await deniedPage.locator('#enquiry-outline').isVisible());
    });
    await denied.close();

    const noJs = await monitoredContext(origin, { javaScriptEnabled: false, viewport: { width: 390, height: 1000 } });
    const noJsPage = await noJs.newPage();
    await check(`${prefix} no-JavaScript navigation and content`, async () => {
      await noJsPage.goto(`${origin}${base}`);
      await noJsPage.locator('#primary-navigation').getByRole('link', { name: 'Training & Workshops', exact: true }).click();
      await noJsPage.waitForURL(`${origin}${base}training/`);
      assert.equal(await noJsPage.locator('.workshop-card').count(), 4);
      await noJsPage.goto(`${origin}${base}training/syllabus/`);
      assert.ok(await noJsPage.getByText('Use your browser’s Print menu', { exact: false }).isVisible());
      assert.equal(await noJsPage.locator('[data-print]').isVisible(), false);
      await noOverflow(noJsPage);
    });
    await noJs.close();
    await new Promise(resolve => server.close(resolve));
    server = null;
  }
  await check('no browser console errors or failed requests', async () => assert.deepEqual(faults, []));
} catch (error) {
  report.errors.push({ check: currentLabel, message: error.stack || String(error) });
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: path.join(resultsDir, 'failure.png') }).catch(() => {});
  console.error(`FAIL ${currentLabel}:`, error);
  process.exitCode = 1;
} finally {
  clearTimeout(deadline);
  report.consoleOrNetworkErrors = faults;
  await writeFile(path.join(resultsDir, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  console.log(`${report.checks.length} browser checks passed; ${report.errors.length} failed.`);
}
