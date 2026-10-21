# Training & Workshops implementation report

Recorded: October 21, 2026. Repository: [lahcennh3-jpg/mywebsite](https://github.com/lahcennh3-jpg/mywebsite). Inspected `main`: `35e7ab2a74916a7ce2ba120daa58378a0d5bb436`.

The existing dependency-free Node.js generator now produces four training routes alongside the portfolio. No framework or runtime dependency was added. All eight C01–C08 case studies remain Planned, with their original URLs, M01–M40 mappings and publication gates.

## Files created and modified

| File | Change |
| --- | --- |
| `content/training.json` (new) | Four proposed beginner workshops, audience, outcomes, prerequisites, timed agendas, materials to prepare, scope and contact limits. |
| `content/profile.json` | Career objective, teaching interest in Agadir, referenced planned learning scope and supporting metadata. Existing unavailable contact fields remain null. |
| `scripts/content.mjs` | Loads and validates training content; requires referenced learning scope and blocks unsupported completion/delivery claims. |
| `scripts/build.mjs` | Generates four routes, shared training navigation, secondary homepage CTA, print pages and enquiry outline. Includes the routes in sitemap generation when a verified canonical URL is supplied. |
| `scripts/check.mjs` | Checks required training pages and syllabus anchors alongside existing metadata, local links and claim safeguards. |
| `scripts/validate.mjs` | Updates the validation result message. |
| `public/assets/style.css` | Adds training styles, responsive rules and A4 print styling while retaining the existing design tokens and layouts. |
| `public/assets/site.js` | Optional print button and clipboard enhancement with visible error feedback and manual-copy fallback. |
| `tests/content.test.mjs` | Adds workshop status, identity, agenda, completeness and profile-reference guards. |
| `tests/routes.test.mjs` | Exercises existing and new routes, direct refresh, redirects, assets and contact limitations at both `/mywebsite/` and `/`. |
| `tests/site-enhancements.test.mjs` (new) | Checks optional print behavior and clipboard success, absence and denial using a small simulated browser API surface. |
| `qa/browser/` (follow-up addition) | Isolated, lockfile-pinned Chromium/axe test package, loopback HTTP verification script and instructions. It does not add dependencies to the generator or root Node tests. |
| `.github/workflows/pages.yml` (follow-up change) | Adds the browser job, screenshot/PDF/report artifact and browser-success dependency before deployment. Existing publishing conditions and default paths remain. |
| `.gitignore` (follow-up change) | Excludes generated browser-QA results; package-manager dependencies remain ignored. |
| `README.md` | Documents training editing, contact limits, routes and current hosting findings. |
| `docs/content-sources.md` | Records supplied planning inputs and separates legacy C/M identifiers from the v7.1 roadmap. |
| `docs/verification.md` | Links this update and labels the older verification record as historical. |
| `docs/training-implementation.md` (new) | This report. |

`content/projects.json`, `content/missions.json`, `content/learning.json`, `content/source.json` and the root `package.json` are unchanged. A follow-up browser QA job now extends `.github/workflows/pages.yml`, adding a browser-check dependency before deployment while preserving its publishing conditions and build default. The generator still escapes content and uses the existing base-path and URL-validation mechanisms. No source attribution or project route was removed.

## Pages and workshop content

Routes below are relative to the configured build base. They are implemented routes, not claims of a live deployment.

| Route | Content |
| --- | --- |
| `/training/` | Proposed workshop cards, educational audiences, delivery approach, readiness statement and partnership link. |
| `/training/trainer-profile/` | Printable profile: aspiring career positioning, teaching interest, referenced planned portfolio scope, proposed sessions and current contact limits. |
| `/training/syllabus/` | Printable workshop outcomes, prerequisites, complete timed agendas, materials to prepare, learner take-aways and scope limits. W01–W04 have stable anchors. |
| `/training/contact/` | Host discussion checklist, visible and optionally copyable enquiry outline, and the existing authorized GitHub profile link. |

| ID | Proposed beginner workshop | Suggested duration | Agenda calculation |
| --- | --- | --- | --- |
| W01 | AI security foundations: data, identity and boundaries | 90 minutes | 15 + 25 + 30 + 20 = 90 |
| W02 | Safer AI use for students and educators | 90 minutes | 15 + 25 + 30 + 20 = 90 |
| W03 | Prompt injection awareness with a controlled demo | 120 minutes | 20 + 30 + 40 + 30 = 120 |
| W04 | Linux permissions and evidence for AI application labs | 120 minutes | 20 + 30 + 45 + 25 = 120 |

These are editorial proposals, not delivered workshops. Materials are explicitly listed as items to prepare. Demonstrations use synthetic examples, prepared transcripts or a local mock. No paid model API, public-target security test, institutional affiliation or past training engagement is claimed. Language, schedule, fees, class size and facilitator readiness need agreement with a host.

The new navigation item and footer link lead to Training & Workshops. The homepage adds a modest educational-partnership link under the existing hero; the portfolio and learning journey calls to action remain. Existing section navigation and no-JavaScript content access are preserved.

## Portfolio integrity and professional positioning

The repository verifies the existence of planned case-study content, not completion of the security work. The updated profile describes that exact scope and links to the repository records. No unverified experience, qualification, award, employer, training institution or résumé has been introduced.

The attached v7.1 F01–F17 roadmap is not imported into the case-study data or mapped to C01–C08. No evidence of equivalence was supplied. The old C08 description’s local “F01 feature” label remains in the original record; provenance documentation explicitly distinguishes it from the newer flagship F01.

## Contact functionality and verified limits

The only configured contact destination remains [Ahmed’s GitHub profile](https://github.com/lahcennh3-jpg). The training route provides an enquiry outline and preparation checklist. It has no form, storage or submission endpoint. Copying the outline does not send a message or book a workshop. A GitHub profile is not a guaranteed private messaging channel; this is stated on the page.

Missing clipboard support leaves the visible outline available for manual selection. A rejected clipboard request reports that manual copying is needed. The optional print control invokes the browser print dialog only when clicked; the browser’s native Print menu remains available without JavaScript. Unit checks cover these branches; a real-browser interaction check remains outstanding.

No email, LinkedIn, phone number, messaging backend or résumé was inferred from the different public domain content. A reliable direct contact method must be explicitly confirmed before adding private enquiry submission.

## Build and test evidence

Local runtime: Node.js `v24.19.0`, npm `11.9.0`. The project declares Node 22+ and existing CI uses Node 22; the local run does not substitute for the remote CI result on the feature commit.

| Command / check | Observed result |
| --- | --- |
| `npm run validate` | Passed: original mappings, mission IDs, evidence gates and proposed workshop schema. |
| `npm test` | Passed: 25 tests in two route suites plus content and optional-browser-API checks; zero failed or skipped. |
| `npm run build` | Passed: 16 HTML pages at `/mywebsite/`. |
| `npm run check` | Passed: 16 pages and 566 local links, assets and fragments. |
| `BUILD_BASE=/ npm run build` | Passed: 16 HTML pages with root-relative assets and links. |
| `BUILD_BASE=/ npm run check` | Passed: 16 pages and 566 local links, assets and fragments. |
| HTTP route/refresh checks | All eight existing case studies and all four training pages returned 200 on direct and repeated requests at both prefixes. Existing 301 and 404 behavior passed. |
| Data-preservation diff | Original projects, missions, learning and source attribution data unchanged. The follow-up workflow adds isolated browser QA and a deployment check dependency. |
| `git diff --check` | Passed: no whitespace errors. |

The route suites build and run the static checker at each prefix. The static checker verifies headings, language, metadata, image alternatives, unique IDs, local fragments, unavailable-contact suppression and the absence of an unconnected form. No network-dependent package installation is needed for site build or tests. npm emitted an environment-level warning about an unknown `http-proxy` config entry; the commands still exited successfully.

## Print, mobile and accessibility results

The follow-up [GitHub CI run 39584240480](https://github.com/lahcennh3-jpg/mywebsite/actions/runs/39584240480), for PR head `284e525c3cf3f311f42d9497b79ec4e633b23229`, completed successfully. Its Node build/check job and isolated browser job both passed; deployment was skipped. The browser runner used Node `v22.23.3` and Chromium `151.0.7922.34`, with Playwright `1.62.1` and axe `4.13.0` pinned by the isolated QA package and lockfile.

The test served the actual generated site on ephemeral loopback HTTP ports, with external browser requests blocked. It did not publish a preview or use a replacement website. The earlier remote-browser/local-file limitation was not bypassed; the repository's normal CI executed the browser tests in its own runner.

| Browser check | Result |
| --- | --- |
| Overall | **99 checks passed, zero failed**, separate from the 25 Node tests. |
| Routing | Home, all eight original case studies, mission/publication pages and four training pages loaded directly and on refresh at both `/mywebsite/` and `/`. |
| Layout/reflow | Home and all four training routes checked at 320, 390, 768 and 1440 CSS pixels, at both bases. Measured document width matched viewport width in each case; no page-wide horizontal overflow was found. |
| Keyboard and navigation | Menu Enter/Escape behavior, focus return, Training navigation, skip-link focus and workshop disclosure passed. |
| Progressive enhancement | Navigation and syllabus content remained available with JavaScript disabled. |
| Clipboard | A real granted-permission copy matched the visible outline. A separate simulated denial displayed the manual-copy fallback. Neither case sent a message. |
| Automated accessibility | Ten axe scans: home and four training routes at 390px and 1440px, using selected WCAG 2 A/AA and 2.1 A/AA rules. Zero automatic violations. The home scans each retained manual-review results for `aria-prohibited-attr` and `color-contrast`; the four training routes had no incomplete rules. |
| Chromium print output | Tagged A4 PDFs: trainer profile one page; proposed syllabus four pages. Print controls and site navigation were hidden by the actual print CSS. |
| Console/network | No captured browser console errors, page errors or failed requests. |

[Saved CI evidence](https://github.com/lahcennh3-jpg/mywebsite/actions/runs/39584240480/artifacts/12338567575) contains the JSON report, four desktop/narrow-viewport screenshots and two Chromium PDFs. The downloaded artifact's SHA-256 matched the upload digest `692824d2e512f2ac0c0f683c370ad332734decd69e81df0cd2c5bd7eb3fa61d2`. The screenshots and every PDF page were visually inspected. The artifact retention is 14 days; the committed test script allows reproduction after expiry.

The initial WeasyPrint review had already corrected an unnecessary fifth syllabus page and an overly wide status badge. The subsequent Chromium PDFs confirmed the one/four-page layouts with readable text, wrapped tables and no clipped content in the inspected output.

**Remaining verification limits:** browser zoom at 200%, manual resolution of the two homepage axe review rules, screen-reader use, Firefox/Safari, physical phones/tablets and native OS print dialogs were not verified. Narrow Chromium viewports are CSS-layout evidence, not physical-device testing. Passing automated scans is not full accessibility conformance or a security assessment.

## Custom-domain and deployment findings

Read-only observations on October 21, 2026:

| Surface | Observed evidence | What it establishes |
| --- | --- | --- |
| [GitHub repository metadata](https://api.github.com/repos/lahcennh3-jpg/mywebsite) | `has_pages: false`; stored homepage `https://mywebsite-one-kappa.vercel.app`. | GitHub reports Pages disabled. A stored homepage alone does not verify a deployment. |
| [Latest inspected main publishing run](https://github.com/lahcennh3-jpg/mywebsite/actions/runs/37137732141) | Validation, tests, build and link checks succeeded; **Configure Pages** failed; artifact upload and deploy were skipped. | The inspected main workflow did not publish a Pages deployment. |
| [GitHub Pages public URL](https://lahcennh3-jpg.github.io/mywebsite/) | HTTP 404. The public Pages API endpoint also returned 404; the GitHub connector does not expose an authenticated Pages settings endpoint. | No working Pages site was observed at the default project URL. Exact custom-domain Pages settings could not be read. |
| [Intended www domain](https://www.amhdour.cv/) | HTTP 200 via the available network proxy, with an `x-vercel-id` response header. Content lacked this repository’s C01/M01 markers and current hero. | A different public page was observed with Vercel-serving indicators. This does not establish which repository or commit serves it. |
| [Apex domain](https://amhdour.cv/) | The read followed a redirect and ended at the www domain with HTTP 200 and the same response-body SHA-256. | The observed apex route resolves to the same public content. |
| Repository’s stored Vercel homepage | HTTP 404. | The stored URL was not verified as a working site. |
| [Google DNS-over-HTTPS NS query](https://dns.google/resolve?name=amhdour.cv&type=NS) | `ns1.vercel-dns.com.` and `ns2.vercel-dns.com.` | The public resolver returned Vercel nameservers for the zone. |
| [www A query](https://dns.google/resolve?name=www.amhdour.cv&type=A) | `64.29.17.1`, `216.198.79.65`; the CNAME query had no Answer record. | Resolver observations only, not recommendations or proof of a project connection. |
| [Apex A query](https://dns.google/resolve?name=amhdour.cv&type=A) | `64.29.17.65`, `64.29.17.1`. | Resolver observations only; no DNS changes made. |
| Selected Vercel connection, initial inspection | Repository-filtered and project-name searches returned no matching project in the available default scope; team listing returned none. Domain inspection returned `serviceType: external`, `configuredBy: http`, `misconfigured: false`, `ipStatus: required-change`. | No accessible control-plane project/commit mapping was confirmed. Differing provider fields do not justify applying DNS recommendations. |

A subsequent unfiltered project listing returned a project named `myportfolio` under team `team_wjCz17vPO6RUSB6mvpE0vDnr` (`amhdour1s-projects`). Reads of that project's configuration, domains and deployments returned **403: missing team access**. A direct read of `amhdour.cv` also returned 403. The listing does not establish that this project serves the domain or uses this repository. No Vercel CLI with an existing authorized session is available in the workspace. The connection needs consent/app-installation access to the target team before those read-only deployment checks can be completed; ordinary SSO sign-in would not supply the missing team grant. No credentials should be pasted into chat.

The public HTTP responses included an `Age` cache header of about 320,782 seconds and were obtained through the available proxy. They are response observations, not a guarantee of a fresh origin fetch or access to the domain owner’s authoritative hosting settings. Public DNS, response headers and a similar personal name cannot prove a repository-to-domain deployment link.

**Conclusion: I cannot confirm that `www.amhdour.cv` is connected to this repository’s deployment.** The code keeps `/mywebsite/` as its default base and leaves `metadata.canonicalUrl` null. No CNAME, DNS record, Pages setting, Vercel project, production workflow configuration or live website was changed. A separate root build was verified locally; it is ready for a confirmed root deployment but has not been published.

After the deployment owner confirms the actual project, repository, production branch and domain assignment, choose the intended host. If publishing this generator at the custom-domain root is approved, configure `BUILD_BASE=/` in that deployment and set the verified canonical root to `https://www.amhdour.cv/`. Rebuild, check canonical and sitemap URLs, and inspect the served CSS/JS and direct training routes before reporting a release. Enabling Pages or changing hosting remains a separate publication decision.

## GitHub review and remaining decisions

Feature branch: [`feat/training-workshops-portfolio`](https://github.com/lahcennh3-jpg/mywebsite/tree/feat/training-workshops-portfolio). Review changes against [`main`](https://github.com/lahcennh3-jpg/mywebsite/compare/main...feat/training-workshops-portfolio). The pull request supplies its actual commit and CI status; it must not be merged or deployed automatically.

Publication blockers and remaining decisions:

1. Confirm the production hosting project and domain-to-repository/commit mapping. Resolve the disabled-Pages configuration only if Pages is the chosen host and the change is authorized.
2. Review the feature pull request and the passing Node/Chromium CI evidence. Resolve the documented manual homepage accessibility checks and inspect 200% browser zoom before making a full accessibility claim.
3. Confirm a reliable private contact destination before configuring message submission.
4. Agree workshop language, dates, fees, group size, equipment and accessibility needs. Prepare the listed materials and have a host review the syllabus and facilitator readiness before scheduling delivery.
5. Add future learning achievements only with scoped evidence and the existing publication gates. Keep the v7.1 roadmap separate unless an explicit evidence-backed mapping is later supplied.

No production release is part of this implementation.
