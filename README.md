# Ahmed Amhdour — AI Security Portfolio

Static, evidence-first portfolio for Ahmed Amhdour, focused on AI Application & Product Security, RAG security and agent security.

The site intentionally distinguishes **planned work** from **demonstrated work**. The initial eight portfolio slots are all `Planned`; no project is presented as a completed engagement, confirmed vulnerability, professional experience or independently verified achievement.

## Stack

- Zero-dependency static site
- Python 3 standard-library build script
- Plain HTML, CSS and JavaScript
- GitHub Pages deployment through GitHub Actions
- No backend and no non-functional contact form

The production base path is `/mywebsite/`, so project routes such as `/mywebsite/projects/c01/` work directly on GitHub Pages and survive refreshes.

## Repository structure

```text
content/
  site.json          # identity, about copy, focus areas, skills, journey, contact configuration
  projects.json      # eight case-study slots, mappings, status and publication-safe detail content
src/
  index.html         # home-page layout template
  project.html       # project-detail layout template
  styles.css         # responsive visual system
  site.js            # mobile navigation and planned/completed portfolio filtering
scripts/
  build.py           # generates dist/ and all static project routes
  check.py           # checks routes, internal links/fragments, headings and required sections
.github/workflows/
  pages.yml          # build, QA and GitHub Pages deployment
```

## Local setup

No package installation is required. Use Python 3.10+.

```bash
python3 scripts/build.py --base-path / --out dist
python3 scripts/check.py --base-path / --dist dist
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173/`.

For a production-equivalent build:

```bash
python3 scripts/build.py --base-path /mywebsite/ --out dist
python3 scripts/check.py --base-path /mywebsite/ --dist dist
```

## Content editing

### Profile and contact details

Edit `content/site.json`.

The following fields are intentionally configurable and hidden while `null`:

- `contact.email`
- `contact.linkedin`
- `contact.resume`
- `contact.profilePhoto`

`contact.github` is currently configured to `https://github.com/lahcennh3-jpg`.

The initial layout does not render a photo. If a real profile photo is later supplied, add a publication-safe asset and update the layout deliberately rather than inserting a placeholder image.

### Planned projects

Edit `content/projects.json`. Each project contains:

- title and purpose
- mission mappings and focus tags
- `status` and `publicationState`
- product need and security objective
- planned scope, dependencies and system boundaries
- investigation, proposed control and permitted/denied cases
- evidence plan and evaluation criteria
- remediation/retest, recovery/transfer and limitations

Keep `status: "Planned"` and `publicationState: "planned"` until there is actual, reproducible evidence that supports a different claim.

### Publishing a completed study

A polished write-up is not enough to promote a project. Before moving a study to the completed view:

1. Record the exact source/runtime/model/configuration identity relevant to the claim.
2. Preserve raw evidence for allowed, denied and failure cases, including invalid or blocked cases.
3. Distinguish the evidence type: source/design, introduced fixture, native observation, actual-model measurement or authorized professional work.
4. Add remediation/no-change rationale, legitimate regression checks, retest and recovery/rollback evidence where relevant.
5. Obtain an appropriately independent review for the scope being claimed.
6. Confirm the material is permitted for public release and does not expose private findings, real secrets or restricted client information.
7. Add only the fields that actually exist, for example:

```json
{
  "status": "Completed",
  "publicationState": "completed",
  "results": ["Scoped result supported by the linked evidence"],
  "metrics": ["Metric with numerator, denominator and validity conditions"],
  "evidenceLinks": [
    {"label": "Sanitized evidence packet", "url": "https://..."}
  ],
  "reviewerStatus": "Reviewed for the stated bounded scope"
}
```

The build hides results, metrics, evidence links and reviewer status when those fields are absent.

Do not promote catalog starter-recipe observations as Ahmed's independent achievements. Do not turn a source/design result into a native-runtime claim through wording or presentation.

## Accessibility and interaction

The site includes:

- semantic section headings and landmarks
- a skip link
- keyboard-operable navigation and project filtering
- visible `:focus-visible` states
- readable contrast on a dark navy/charcoal palette
- responsive layouts from small mobile screens through large desktops
- `prefers-reduced-motion` handling
- static project detail URLs (no SPA routing dependency)

## GitHub Pages deployment

The workflow at `.github/workflows/pages.yml` runs on pushes to `main` and can also be triggered manually.

It:

1. checks out the repository,
2. builds with `--base-path /mywebsite/`,
3. runs `scripts/check.py`,
4. uploads `dist/` as the Pages artifact,
5. deploys through GitHub Pages.

If Pages has not previously been configured for the repository, GitHub may require enabling **GitHub Actions** as the Pages source in repository settings. Do not report a live URL until the workflow has completed successfully and the deployed pages have been opened and verified.

## Source-content policy

Portfolio content was adapted from the supplied Onyx security mission catalog dated 2026-09-30, especially its mission tracks, portfolio packaging rules, competence/evidence model, portfolio allocation board and integrated capstone. The website preserves the catalog's separation between plans, supporting artifact checks, native observations, actual-model measurements and real authorized work.
