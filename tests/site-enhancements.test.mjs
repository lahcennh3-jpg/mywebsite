import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
const script = await readFile(new URL('../public/assets/site.js', import.meta.url), 'utf8');

// Exercise optional browser APIs without adding a DOM/runtime dependency to the site.
// These checks do not replace real-browser keyboard, layout or print verification.
function setup(clipboard) {
  const status = { textContent: '' };
  const content = { textContent: 'Educational partnership enquiry\nHost or group:' };
  const makeButton = () => ({ hidden: true, handlers: {}, addEventListener(name, fn) { this.handlers[name] = fn; } });
  const printButton = makeButton();
  const copyButton = Object.assign(makeButton(), {
    dataset: { copyTarget: 'enquiry-outline' },
    parentElement: { querySelector: () => status }
  });
  let printCalls = 0;
  const document = {
    documentElement: { classList: { add() {} } },
    body: { classList: { contains: () => false } },
    querySelector: () => null,
    querySelectorAll: selector => selector === '[data-print]' ? [printButton] : selector === '[data-copy-target]' ? [copyButton] : [],
    getElementById: id => id === 'enquiry-outline' ? content : null,
    addEventListener() {}
  };
  const window = { matchMedia: () => ({ addEventListener() {} }), print: () => { printCalls++; } };
  runInNewContext(script, { document, window, navigator: { clipboard } });
  return { printButton, copyButton, status, content, printCalls: () => printCalls };
}

test('printing is optional and invokes the browser print dialog only on request', () => {
  const ui = setup();
  assert.equal(ui.printButton.hidden, false);
  assert.equal(ui.printCalls(), 0);
  ui.printButton.handlers.click();
  assert.equal(ui.printCalls(), 1);
});
test('missing or denied clipboard permission leaves a manual-copy path', async () => {
  const missing = setup();
  assert.equal(missing.copyButton.hidden, true);
  assert.ok(missing.content.textContent.includes('Host or group:'));
  const denied = setup({ writeText: async () => { throw new Error('Permission denied'); } });
  await denied.copyButton.handlers.click();
  assert.match(denied.status.textContent, /Select the outline and copy it/);
  assert.doesNotMatch(denied.status.textContent, /copied|sent/);
});
test('copying transfers the visible outline and reports that no message was sent', async () => {
  let copied;
  const ui = setup({ writeText: async text => { copied = text; } });
  assert.equal(ui.copyButton.hidden, false);
  await ui.copyButton.handlers.click();
  assert.equal(copied, ui.content.textContent);
  assert.match(ui.status.textContent, /No message has been sent/);
});
