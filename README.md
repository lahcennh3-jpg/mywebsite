# Ahmed Amhdour — AI Security Portfolio

A responsive, static personal portfolio for Ahmed’s goal of becoming an AI Security Engineer in 2026 and beyond. The content emphasizes AI Application & Product Security, RAG and agent security. All eight initial case studies are **Planned**. No employment, education, location, age, qualifications, completed missions or client experience is asserted.

## Setup and build

Use Node.js 22 or newer and npm. There are **no third-party runtime or build dependencies** and no installation step.

```bash
git clone https://github.com/lahcennh3-jpg/mywebsite.git
cd mywebsite
npm run validate
npm test
npm run build
npm run check
npm run preview
```

Open `http://localhost:4173/mywebsite/` for the local preview. The server builds once at startup. After editing content or styles, run `npm run build` and refresh. `npm run dev` binds the same preview to all interfaces for a controlled development environment; `npm run preview` uses loopback by default. Neither is a production server.

The build writes only `dist/`. Deploy that directory, never the source, tests or attached catalog. It contains pre-rendered HTML, CSS and a small progressive-enhancement script. Content is visible without JavaScript. There is no backend, analytics, external font request, contact form or browser-side content fetch.

## Content editing

Content is separate from layout code:

| File | Edit here |
| --- | --- |
| `content/profile.json` | Name, hero, About, learning approach, metadata and contact details |
| `content/projects.json` | C01–C08 descriptions, stable mission mappings, tags, statuses, planned details and future evidence |
| `content/learning.json` | Focus areas, skill-learning links, first-five foundations, track prerequisites and study depths |
| `content/missions.json` | Stable M01–M40 titles and explicitly recorded learning status |
| `content/source.json` | Catalog date, source provenance and evidence taxonomy |

Layout/rendering is in `scripts/build.mjs`. Styling and browser behavior are in `public/assets/`. Keep project slugs stable so published links remain valid. The validator preserves the requested C01–C08 mission mappings.

### Real personal details

`email`, `linkedin`, `resume`, `photo`, `photoAlt`, `canonicalUrl` and `socialImage` start as `null`. Unavailable contact/photo fields do not render. GitHub is the only provided contact link. Supply real values only:

- Email: a real email address; LinkedIn: the actual HTTPS profile URL.
- Résumé/photo: an HTTPS URL or an `assets/` path. Put local files in `public/assets/` and supply meaningful `photoAlt` for a photo.
- Canonical URL: the **verified** deployed root ending in `/`. Leave it null until deployment is verified. Project canonicals are derived from this root.
- Social image: optional supplied asset plus a verified canonical root; no image is invented. Titles, descriptions, Open Graph and Twitter summary metadata already render without it.

### Updating projects and publishing completed studies

See [docs/publishing-studies.md](docs/publishing-studies.md). A study’s title, status and strongest evidence must describe the same exact scope. Status values are `Planned`, `In progress`, `Blocked` and `Completed`. Changing status alone cannot publish a completed study.

The site supports separate **Planned case studies** and **Completed studies** views. The initial completed view is empty. With JavaScript off both views remain accessible. Each study has a real static detail page with product need, scope, dependencies, controls, evidence criteria, retesting, recovery, transfer and limitations.

Catalog starter-recipe checks support preparation; they are not Ahmed’s independent achievements. Keep C04 native prerequisites unresolved until actual evidence settles them. C06 remains an optional model-security specialty. C08 is the planned Section 17 synthetic support-summary action, not an implemented native Onyx feature.

## Deployment

### GitHub Pages

The workflow `.github/workflows/pages.yml` checks pull requests and deploys successful `main` builds. Pull requests **do not deploy**. This implementation is prepared on a review branch; review/merge and Pages configuration are separate from local validation.

1. In repository **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
2. Merge the reviewed implementation branch into `main`.
3. Watch **Actions → Check and publish portfolio**. The build validates content, runs guard tests, creates `dist/`, checks routes and uploads the static artifact; the deployment job publishes it.
4. Open the URL emitted by the deployment job. Verify Home, all eight project links, direct project navigation and refresh, mobile navigation and status labels before reporting that URL as live.
5. Set `metadata.canonicalUrl` to the verified root and rebuild to enable canonical and sitemap metadata. A configured URL is not itself evidence of successful deployment.

The default asset and navigation prefix is **`/mywebsite/`**. Project pages are actual `projects/<slug>/index.html` files, so direct navigation and refresh do not need an SPA fallback or a custom `404` rewrite. A real `404.html` is included for missing pages.

The repository was empty and reported `has_pages: false` at initial inspection. No live URL is claimed by this README; confirm the workflow and public response after an actual deployment.

Official deployment references: [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [publishing-source configuration](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

### Other static hosts

Set the deployment prefix at build time:

```bash
BUILD_BASE=/ npm run build
BUILD_BASE=/ npm run check
BUILD_BASE=/ npm run preview
```

Serve `dist/` from the chosen prefix with directory `index.html` support. Use HTTPS for production. No server routes or rewrite rules are needed. The preview server and checker use the same `BUILD_BASE` value; keep it consistent with the build.

## Verification

- `npm run validate`: content completeness, eight mission mappings, 40 stable IDs, safe URLs and required publication/evidence metadata.
- `npm test`: meaningful claim guards (unverified completion, classification, independent review, permission, mapping drift and undefined denominators).
- `npm run build`: deterministic dependency-free static rendering.
- `npm run check`: every local link, fragment and asset; real project files; headings, metadata and hidden unavailable personal/result fields.
- Desktop/mobile visual and interaction QA is recorded in [docs/verification.md](docs/verification.md). Local checks do not prove a remote deployment exists.

Accessibility includes semantic landmarks/headings, keyboard-operable navigation and native disclosures, focus indicators, skip navigation, reduced motion and a no-JavaScript fallback. A cyan functional boundary diagram replaces an unprovided profile photo and is explicitly conceptual.

## Content provenance

[docs/content-sources.md](docs/content-sources.md) records how the attached September 30, 2026 Onyx catalog was adapted. The complete attachment is not republished. Raif Kaya’s current site was inspected for navigation, layout hierarchy and section sequence only; no biography, experience, credentials, contact details, assets or project claims were reused.
