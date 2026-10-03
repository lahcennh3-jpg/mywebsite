import { mkdir, rm, writeFile, cp } from 'node:fs/promises';
import path from 'node:path';
import { root, loadContent, validateContent, getBasePath, isPublishedStudy } from './content.mjs';

const { profile, projects, learning, missions, source } = validateContent(await loadContent());
const base = getBasePath();
const out = path.join(root, 'dist');
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
const url = route => `${base}${route}`;
const asset = value => value.startsWith('https://') ? value : url(value);
const labels = Object.fromEntries(source.evidenceKinds.map(kind => [kind.id, kind.label]));
const navItems = [['home','Home'], ['about','About'], ['portfolio','Portfolio'], ['focus','Focus Areas'], ['skills','Skills'], ['journey','Learning Journey'], ['contact','Contact']];

const paths = {
  identity: '<circle cx="12" cy="8" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3M3 3h3M18 3h3"/>',
  data: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 4 16 4 16 0V5M4 12v7c0 4 16 4 16 0v-7"/>',
  agent: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M12 5V2M7 12h2M15 12h2M8 16h8"/>',
  boundary: '<path d="M12 2 21 6v7c0 5-9 9-9 9s-9-4-9-9V6zM8 12l3 3 5-6"/>',
  evaluation: '<path d="M3 3v18h18M7 16v-5M12 16V7M17 16v-8"/>',
  model: '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="3"/><path d="M7 6h10M6 8l4 7M18 8l-4 7"/>',
  assurance: '<path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h3"/>',
  capstone: '<path d="M12 2 22 8 12 14 2 8zM2 12l10 6 10-6M2 16l10 6 10-6"/>',
  github: '<path d="M9 20c-4 1-4-2-6-2M15 22v-4c0-1-.3-2-1-2 4 0 7-2 7-6 0-2-.5-3-2-4 .3-1 .3-2 0-4-2 0-3 1-4 2a13 13 0 0 0-6 0C8 3 7 2 5 2c-.3 2-.3 3 0 4-1.5 1-2 2-2 4 0 4 3 6 7 6-.7 0-1 1-1 2v4"/>',
  external: '<path d="M15 3h6v6M21 3l-9 9M10 3H3v18h18v-7"/>'
};
const icon = (name, extra = '') => `<svg class="icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.boundary}</svg>`;
const status = p => `<span class="status status-${p.status.toLowerCase().replaceAll(' ', '-')}">${esc(p.status)}</span>`;
const missionLinks = ids => `<div class="mission-links" aria-label="Mapped missions">${ids.map(id => `<a class="mission-link" href="${url(`missions/#${id}`)}" title="${esc(missions.find(m => m.id === id)?.title || id)}">${esc(id)}</a>`).join('')}</div>`;
const projectUrl = p => url(`projects/${p.slug}/`);
const tags = p => `<ul class="tags" aria-label="Focus tags">${p.tags.map(tag => `<li>${esc(tag)}</li>`).join('')}</ul>`;

function contactLinks() {
  const c = profile.contact;
  return `<div class="contact-links"><a class="button primary" href="${esc(c.github)}">${icon('github')}GitHub profile</a>${c.email ? `<a class="button secondary" href="mailto:${esc(c.email)}">Email Ahmed</a>` : ''}${c.linkedin ? `<a class="button secondary" href="${esc(c.linkedin)}">LinkedIn</a>` : ''}${c.resume ? `<a class="button secondary" href="${esc(asset(c.resume))}">Résumé</a>` : ''}</div>`;
}

function layout({ title, description, route = '', body, home = false }) {
  const canonical = profile.metadata.canonicalUrl ? `${profile.metadata.canonicalUrl}${route}` : null;
  const social = profile.metadata.socialImage ? (profile.metadata.socialImage.startsWith('https://') ? profile.metadata.socialImage : `${profile.metadata.canonicalUrl}${profile.metadata.socialImage}`) : null;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#101820">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(profile.name)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta name="twitter:card" content="${social ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  ${canonical ? `<link rel="canonical" href="${esc(canonical)}"><meta property="og:url" content="${esc(canonical)}">` : ''}
  ${social ? `<meta property="og:image" content="${esc(social)}"><meta name="twitter:image" content="${esc(social)}">` : ''}
  <link rel="icon" href="${url('assets/favicon.svg')}" type="image/svg+xml">
  <link rel="stylesheet" href="${url('assets/style.css')}">
  <script src="${url('assets/site.js')}" defer></script>
</head>
<body${home ? ' class="home-page"' : ''}>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="${url('#home')}" aria-label="${esc(profile.name)}, Home"><span class="brand-mark" aria-hidden="true">a<span>.</span></span><span>${esc(profile.name)}</span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation"><span>Menu</span><span class="menu-glyph" aria-hidden="true"></span></button>
      <nav id="primary-navigation" class="primary-navigation" aria-label="Primary navigation">${navItems.map(([id, text]) => `<a href="${home ? `#${id}` : url(`#${id}`)}" data-section="${id}">${text}</a>`).join('')}</nav>
    </div>
  </header>
  <main id="main" tabindex="-1">${body}</main>
  <footer class="site-footer"><div class="container footer-inner"><a class="footer-name" href="${url('#home')}">${esc(profile.name)}<span>${esc(profile.title)}</span></a><p>Practical learning. Reproducible evidence.</p><a href="${esc(profile.contact.github)}">GitHub ${icon('external')}</a></div></footer>
</body>
</html>`;
}

function card(p) {
  return `<article class="project-card" data-status="${isPublishedStudy(p) ? 'completed' : 'planned'}">
    <div class="card-top"><span class="project-code">${esc(p.id)}</span>${status(p)}</div>
    <div class="card-icon">${icon(p.icon)}</div>
    <h4><a href="${projectUrl(p)}">${esc(p.title)}</a></h4>
    <p class="card-purpose">${esc(p.purpose)}</p>
    ${tags(p)}${p.optional ? '<p class="card-note">Optional model-security specialty</p>' : ''}${p.prerequisiteNote ? `<p class="card-note">${esc(p.prerequisiteNote)}</p>` : ''}
    <div class="card-bottom">${missionLinks(p.missions)}<a class="case-link" href="${projectUrl(p)}" aria-label="${isPublishedStudy(p) ? 'View study' : 'View study plan'}: ${esc(p.title)}">${isPublishedStudy(p) ? 'View study' : 'View study plan'}<span class="case-plus" aria-hidden="true">+</span></a></div>
  </article>`;
}

function boundaryDiagram() {
  return `<figure class="boundary-diagram" aria-labelledby="diagram-title" aria-describedby="diagram-description">
    <div class="diagram-top"><span class="mono">AUTHORITY / DATA</span><span class="diagram-index">01—05</span></div>
    <figcaption id="diagram-title">Where the control belongs.</figcaption>
    <ol class="boundary-flow">
      <li><span class="flow-symbol">01</span><div><strong>Authorized retrieval</strong><span>Current document permission</span></div><span class="flow-label">CHECK</span></li>
      <li class="untrusted"><span class="flow-symbol">02</span><div><strong>Retrieved context</strong><span>Untrusted content stays data</span></div><span class="flow-label">DATA</span></li>
      <li class="untrusted"><span class="flow-symbol">03</span><div><strong>Agent proposal</strong><span>A proposal carries no authority</span></div><span class="flow-label">DATA</span></li>
      <li><span class="flow-symbol">04</span><div><strong>Exact action approval</strong><span>Caller · task · arguments · expiry</span></div><span class="flow-label">BIND</span></li>
      <li><span class="flow-symbol">05</span><div><strong>Action service</strong><span>Recheck permission at the effect</span></div><span class="flow-label">CHECK</span></li>
    </ol>
    <p id="diagram-description">Conceptual boundary map for planned study. Source/design illustration; no runtime result.</p>
  </figure>`;
}

function homepage() {
  const completed = projects.filter(isPublishedStudy);
  const planned = projects.filter(p => !isPublishedStudy(p));
  return `<section class="hero container" id="home" aria-labelledby="home-heading">
    <div class="hero-copy"><p class="eyebrow"><span class="eyebrow-line"></span>${esc(profile.eyebrow)}</p><h1 id="home-heading">${esc(profile.shortName)}<span class="hero-dot" aria-hidden="true">.</span></h1><p class="hero-title">${esc(profile.title)}</p><p class="hero-description">${esc(profile.description)}</p><div class="hero-actions"><a class="button primary" href="#portfolio">Explore My Portfolio</a><a class="button secondary" href="#journey">View My Learning Journey</a></div><p class="hero-note">Aspiring engineer · Evidence-led learning</p></div>
    ${profile.contact.photo ? `<figure class="profile-photo"><img src="${esc(asset(profile.contact.photo))}" alt="${esc(profile.contact.photoAlt)}" width="480" height="520"></figure>` : boundaryDiagram()}
    <ul class="specialty-strip" aria-label="Primary interests">${profile.specialties.map((s, i) => `<li><span class="mono">0${i + 1}</span>${esc(s)}</li>`).join('')}</ul>
  </section>
  <section class="section about-section" id="about" aria-labelledby="about-heading"><div class="container about-grid"><div><p class="section-label">01 / About</p><h2 id="about-heading">${esc(profile.aboutHeading)}</h2><p class="about-copy">${esc(profile.about)}</p></div><div class="approach"><p class="eyebrow">My learning approach</p><ol>${profile.approach.map((a, i) => `<li><span class="approach-number">0${i + 1}</span><div><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p></div></li>`).join('')}</ol></div></div></section>
  <section class="section portfolio-section" id="portfolio" aria-labelledby="portfolio-heading"><div class="container"><div class="section-intro"><div><p class="section-label">02 / Portfolio</p><h2 id="portfolio-heading">From questions<br>to case studies.</h2></div><p>Planned studies in authorization, RAG and agent security. Each preview defines the scope, the evidence to produce and the questions still open.</p></div>
    <div class="portfolio-views" role="group" aria-label="Case study views"><a href="#planned-studies" class="view-control selected" data-view="planned">Planned case studies <span>${planned.length}</span></a><a href="#completed-studies" class="view-control" data-view="completed">Completed studies <span>${completed.length}</span></a></div>
    <div id="planned-studies" class="study-view" data-study-view="planned"><h3 class="view-heading" tabindex="-1">Planned case studies</h3><p class="view-description">Design previews from the Onyx mission catalog. These are learning plans; results will be added only with reproducible, reviewed evidence.</p><div class="projects-grid">${planned.map(card).join('')}</div></div>
    <div id="completed-studies" class="study-view" data-study-view="completed"><h3 class="view-heading" tabindex="-1">Completed studies</h3>${completed.length ? `<div class="projects-grid">${completed.map(card).join('')}</div>` : `<div class="empty-studies">${icon('assurance')}<h4>Evidence comes before a completion claim.</h4><p>No completed studies are published yet. This view will show studies when reproducible evidence, appropriate independent review and publication permission are available.</p><a class="text-link" href="${url('publication/')}">How studies become publishable</a></div>`}</div>
    <p class="source-note">Source: ${esc(source.title)}, Sections 3, 7, 13, 15 and 17. <a href="${url('publication/')}">Evidence & publication approach</a></p>
  </div></section>
  <section class="section focus-section" id="focus" aria-labelledby="focus-heading"><div class="container"><div class="section-intro"><div><p class="section-label">03 / Focus Areas</p><h2 id="focus-heading">The boundaries<br>I’m learning to secure.</h2></div><p>Learning-focused areas for AI applications and products, chosen around who may access data, propose work and authorize an effect.</p></div><div class="focus-list">${learning.focusAreas.map((area, i) => `<article class="focus-row"><span class="row-number">0${i + 1}</span><div><h3>${esc(area.title)}</h3><p>${esc(area.description)}</p></div>${missionLinks(area.missions)}</article>`).join('')}</div></div></section>
  <section class="section skills-section" id="skills" aria-labelledby="skills-heading"><div class="container"><div class="section-intro"><div><p class="section-label">04 / Skills</p><h2 id="skills-heading">A practical<br>learning toolkit.</h2></div><p>Learning areas linked to the missions they support. The links describe intended practice; they do not claim proficiency or completed work.</p></div><div class="skills-grid">${learning.skills.map(s => `<article class="skill-card"><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p>${missionLinks(s.missions)}</article>`).join('')}</div></div></section>
  <section class="section journey-section" id="journey" aria-labelledby="journey-heading"><div class="container"><p class="section-label">05 / Learning Journey</p><h2 id="journey-heading">${esc(learning.heading)}</h2><p class="journey-description">${esc(learning.description)}</p><p class="journey-note">${esc(learning.note)}</p><div class="foundations-heading"><h3>Start with the foundations.</h3><span class="status">Planned learning</span></div><ol class="foundation-grid">${learning.foundations.map(f => `<li><a class="foundation-mission mission-link" href="${url(`missions/#${f.mission}`)}">${esc(f.mission)}</a><h4>${esc(f.title)}</h4><p>${esc(f.description)}</p><p class="foundation-gate"><span>Prerequisite</span>${esc(f.gate)}</p></li>`).join('')}</ol><div class="tracks-header"><h3>Then follow the relevant track.</h3><p>Progress follows evidence and prerequisites, with optional specialties selected for the target responsibility.</p></div><div class="tracks">${learning.tracks.map((t, i) => `<details class="track"${i === 0 ? ' open' : ''}><summary><span class="track-number">0${i + 1}</span><span class="track-title">${esc(t.name)}</span><span class="track-label">${esc(t.label)}</span><span class="disclosure-symbol" aria-hidden="true">+</span></summary><div class="track-content"><p class="track-scope mono">${esc(t.scope)}</p><p>${esc(t.description)}</p><p class="gate-copy"><strong>Progression gate.</strong> ${esc(t.gate)}</p></div></details>`).join('')}</div><div class="depth-panel"><div><h3>Study a mechanism.<br>Know when to stop.</h3><p>${esc(learning.queueNote)}</p><a class="text-link" href="${url('missions/')}">Browse all 40 mission IDs</a></div><dl>${learning.depths.map(d => `<div><dt>${esc(d.name)}</dt><dd>${esc(d.description)}</dd></div>`).join('')}</dl></div></div></section>
  <section class="section contact-section" id="contact" aria-labelledby="contact-heading"><div class="container contact-grid"><div><p class="section-label">06 / Contact</p><h2 id="contact-heading">${esc(profile.contact.heading)}</h2></div><div><p>${esc(profile.contact.description)}</p>${contactLinks()}</div></div></section>`;
}

function detailSection(id, title, paragraphs) {
  return `<section class="detail-section" id="${id}" aria-labelledby="${id}-heading"><p class="detail-number mono">${id.slice(0, 2)}</p><div><h2 id="${id}-heading">${title}</h2>${paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}</div></section>`;
}

function observations(p) {
  if (!p.publication.approved) return '';
  let body = '';
  if (p.results) body += `<section class="observed-section"><h2>Recorded results</h2><span class="evidence-kind">${esc(labels[p.results.kind])}</span><p>${esc(p.results.summary)}</p><a href="${esc(p.results.evidenceUrl)}">Result evidence</a></section>`;
  if (p.metrics.length) body += `<section class="observed-section"><h2>Measured outcomes</h2><dl class="metrics">${p.metrics.map(m => `<div><dt>${esc(m.label)}</dt><dd><strong>${m.denominator !== undefined ? `${m.numerator} / ${m.denominator} (${(100 * m.numerator / m.denominator).toFixed(1)}%)` : `${m.value} ${esc(m.unit)}`}</strong><p>${esc(m.method)}</p><a href="${esc(m.evidenceUrl)}">Measurement evidence</a></dd></div>`).join('')}</dl></section>`;
  if (p.evidenceLinks.length) body += `<section class="observed-section"><h2>Evidence artifacts</h2><ul class="evidence-list">${p.evidenceLinks.map(e => `<li><span class="evidence-kind">${esc(labels[e.kind])}</span><a href="${esc(e.url)}">${esc(e.label)}</a><p>${esc(e.scope)}</p></li>`).join('')}</ul></section>`;
  if (p.screenshots.length) body += `<section class="observed-section"><h2>Evidence images</h2>${p.screenshots.map(s => `<figure class="evidence-image"><img src="${esc(asset(s.src))}" alt="${esc(s.alt)}" loading="lazy">${s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ''}</figure>`).join('')}</section>`;
  if (p.review) body += `<section class="observed-section"><h2>Recorded review</h2><p>${esc(p.review.status)} · ${esc(p.review.scope)}</p><a href="${esc(p.review.reference)}">Review record</a></section>`;
  return body;
}

function projectPage(p) {
  const d = p.details;
  const adjacent = projects[(projects.indexOf(p) + 1) % projects.length];
  return `<div class="container project-page"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="${url('#portfolio')}">Portfolio</a><span aria-hidden="true">/</span><span>${esc(p.id)}</span></nav><header class="project-hero"><div class="project-heading-row"><p class="section-label">${esc(p.id)} / ${isPublishedStudy(p) ? 'Published case study' : 'Planned case study'}</p>${status(p)}</div><h1>${esc(p.title)}</h1><p class="project-purpose">${esc(p.purpose)}</p>${tags(p)}${missionLinks(p.missions)}${p.optional ? '<p class="prerequisite-alert">Optional model-security specialty. Select when the target responsibility requires it.</p>' : ''}${p.prerequisiteNote ? `<p class="prerequisite-alert">${esc(p.prerequisiteNote)}. Source/design work remains distinct from native assurance.</p>` : ''}</header><div class="detail-layout"><aside class="detail-aside"><p class="eyebrow">In this ${isPublishedStudy(p) ? 'study' : 'plan'}</p><nav aria-label="Study sections"><a href="#01-objective">Product need & objective</a><a href="#02-scope">Scope & dependencies</a><a href="#03-investigation">Investigation & controls</a><a href="#04-evidence">Evidence & evaluation</a><a href="#05-follow-through">Retest, recovery & transfer</a><a href="#06-limitations">Limitations & questions</a></nav><p class="aside-source">Catalog: ${esc(source.date)}<br>Sections ${p.sourceSections.map(esc).join(', ')}</p></aside><div class="detail-body">${detailSection('01-objective', 'Product need & security objective', [d.objective])}${detailSection('02-scope', isPublishedStudy(p) ? 'Scope, dependencies & boundaries' : 'Planned scope, dependencies & boundaries', [...d.scope, ...d.dependencies])}${detailSection('03-investigation', isPublishedStudy(p) ? 'Investigation & controls' : 'Proposed investigation & controls', d.investigation)}${detailSection('04-evidence', isPublishedStudy(p) ? 'Evidence & evaluation criteria' : 'Evidence to produce & evaluation criteria', d.evidence)}${detailSection('05-follow-through', isPublishedStudy(p) ? 'Remediation, retest, recovery & transfer' : 'Planned remediation, retest, recovery & transfer', d.followThrough)}${detailSection('06-limitations', 'Current limitations & unanswered questions', d.limitations)}${observations(p)}<div class="detail-publication"><h2>Evidence before assurance.</h2><p>${esc(source.note)}</p><a href="${url('publication/')}">Read the evidence & publication approach</a></div></div></div><div class="project-next"><a class="button secondary" href="${url('#portfolio')}">Back to portfolio</a><a class="next-study" href="${projectUrl(adjacent)}"><span>Explore another study</span>${esc(adjacent.title)}</a></div></div>`;
}

function publicationPage() {
  return `<div class="container document-page"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="${url('#portfolio')}">Portfolio</a><span aria-hidden="true">/</span><span>Evidence & publication</span></nav><p class="section-label">Portfolio approach</p><h1>Evidence before<br>assurance.</h1><p class="document-lead">A clear plan is a starting point. A public study needs reproducible claims, appropriate review, independent demonstration and permission to publish.</p><section><h2>Current portfolio state</h2><p>${esc(source.note)}</p><p>Catalog descriptions justify candidate surfaces and planned questions. They do not establish vulnerabilities, client work, completed missions or Ahmed’s independent competence.</p></section><section><h2>Declare what the evidence actually shows.</h2><dl class="evidence-definitions">${source.evidenceKinds.map(k => `<div><dt>${esc(k.label)}</dt><dd>${esc(k.description)}</dd></div>`).join('')}</dl></section><section><h2>Promote a study only within its verified scope.</h2><ol class="publication-steps"><li>Record exact scope, source/configuration pins, product need, requirement/control/case links and both legitimate and denied behavior.</li><li>Produce raw evidence and explain actual outcomes, invalid trials, finding classification, assistance and remaining limitations.</li><li>Document reviewed remediation or a no-change rationale, retest, recovery, transfer and reproducible handover.</li><li>Obtain appropriate independent review and an independently demonstrated explanation or adaptation of the mechanism.</li><li>Check publication permission and sanitize artifacts. A completed source/design study stays labeled source/design; it gains no native assurance from publication.</li></ol></section><section><h2>Keep public material suitable for release.</h2><p>${esc(source.publicationNote)}</p><p>Changing source, configuration, identity, policy, dependencies, model, corpus or scorer may invalidate a claim. Preserve the old evidence, identify affected cases and record the required revalidation.</p></section><section><h2>Content provenance</h2><p>Source document: ${esc(source.title)}. Portfolio allocation follows Section 15.1; learning progression follows Sections 3 and 13; case-study and promotion requirements follow Sections 7 and 15.2; C08 follows the synthetic feature in Section 17.</p><p>The catalog’s Onyx research revision is <a href="${esc(source.researchRepository)}/commit/${source.researchRevision}"><code>${source.researchRevision}</code></a>. This is a source research pin, not a portfolio runtime, installed release or complete audit.</p></section><a class="button secondary" href="${url('#portfolio')}">Back to portfolio</a></div>`;
}

function missionPage() {
  return `<div class="container document-page mission-page"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="${url('#journey')}">Learning Journey</a><span aria-hidden="true">/</span><span>Mission index</span></nav><p class="section-label">Onyx catalog / 2026-09-30</p><h1>Stable IDs.<br>Purposeful learning.</h1><p class="document-lead">${esc(learning.note)}</p><p>This index retains the catalog’s mission titles. The portfolio selects clusters; it does not require completing every specialty or following numerical order.</p><div class="mission-index">${missions.map(m => `<article id="${m.id}" class="mission-row"><a class="mission-self" href="#${m.id}">${m.id}</a><div><h2>${esc(m.title)}</h2>${m.specialty ? '<p class="mission-specialty">Optional or responsibility-dependent specialty</p>' : ''}</div><span class="status">${esc(m.status)}</span></article>`).join('')}</div><a class="button secondary" href="${url('#journey')}">Back to Learning Journey</a></div>`;
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(path.join(root, 'public'), out, { recursive: true });
async function page(route, content) {
  const folder = path.join(out, route);
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(folder, 'index.html'), content);
}
await page('', layout({title: profile.metadata.title, description: profile.metadata.description, body: homepage(), home: true}));
for (const p of projects) {
  const route = `projects/${p.slug}/`;
  await page(route, layout({title: `${p.title} | ${p.status} | ${profile.name}`, description: `${p.status} case study: ${p.purpose}`, route, body: projectPage(p)}));
}
await page('publication/', layout({title: `Evidence & Publication | ${profile.name}`, description: 'How planned AI security studies become reproducible, reviewed and publication-safe portfolio evidence.', route: 'publication/', body: publicationPage()}));
await page('missions/', layout({title: `Mission Index | ${profile.name}`, description: 'Stable M01–M40 mission IDs for Ahmed’s prerequisite-led AI security learning plan. All areas are planned learning.', route:'missions/', body: missionPage()}));
await writeFile(path.join(out, '404.html'), layout({title: `Page not found | ${profile.name}`, description: 'This portfolio page could not be found.', body:'<div class="container document-page"><p class="section-label">404</p><h1>Page not found.</h1><p>The link may have changed. Explore the portfolio or the mission index.</p><a class="button primary" href="'+url('#portfolio')+'">Explore the portfolio</a></div>'}));
await writeFile(path.join(out, '.nojekyll'), '');
if (profile.metadata.canonicalUrl) {
  const routes = ['', ...projects.map(p => `projects/${p.slug}/`), 'publication/', 'missions/'];
  await writeFile(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route=>`<url><loc>${esc(profile.metadata.canonicalUrl + route)}</loc></url>`).join('')}</urlset>`);
}
console.log(`Built ${projects.length + 4} HTML pages with assets rooted at ${base}. No backend or browser-side content fetch is required.`);
