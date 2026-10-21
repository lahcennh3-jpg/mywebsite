# Browser verification

This isolated QA package tests the existing generated website over loopback HTTP. It does not deploy the site, connect a domain or change the dependency-free generator. The ordinary root build and Node tests still need no third-party packages.

From the repository root:

```sh
npm ci --prefix qa/browser --ignore-scripts
qa/browser/node_modules/.bin/playwright install --with-deps --only-shell chromium
npm run verify --prefix qa/browser
```

`verify.mjs` builds and checks both `/mywebsite/` and `/`, then starts the repository's static server on an ephemeral loopback port. It checks all existing and new routes, 320/390/768/1440px layouts, keyboard/menu/disclosure behavior, navigation to Training, clipboard permission success and simulated denial, no-JavaScript access, selected WCAG A/AA axe rules, and Chromium PDF output. External requests are blocked in the test browser. No credentials, real messages or public-target testing are involved.

Results, screenshots and browser-produced PDFs go to the ignored `results/` directory and the CI artifact. Generated screen widths are browser emulation, not physical-device testing. Automated axe checks and headless PDF rendering do not establish complete accessibility conformance, screen-reader usability, Safari/Firefox compatibility, or operation of a native OS print dialog. Browser zoom is not claimed; the narrow-viewport checks cover reflow at their actual reported CSS widths.

CI browser verification is an additional deployment dependency. Production host settings, branch publishing conditions and the default `/mywebsite/` build path are preserved. Read the implementation report before any merge or release; the domain connection remains a separate access-dependent check.

Primary references: [Playwright CI](https://playwright.dev/docs/ci), [accessibility testing](https://playwright.dev/docs/accessibility-testing), and [PDF output](https://playwright.dev/docs/api/class-page#page-pdf).
