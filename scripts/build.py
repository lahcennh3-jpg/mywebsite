#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
CONTENT = ROOT / "content"


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def normalize_base_path(value: str) -> str:
    value = value.strip() or "/"
    if not value.startswith("/"):
        value = "/" + value
    if not value.endswith("/"):
        value += "/"
    return value


def render(template: str, values: dict[str, str]) -> str:
    output = template
    for key, value in values.items():
        output = output.replace("{{" + key + "}}", value)
    leftovers = [part.split("}}", 1)[0] for part in output.split("{{")[1:] if "}}" in part]
    if leftovers:
        raise ValueError(f"Unresolved template placeholders: {sorted(set(leftovers))}")
    return output


def list_html(items: list[str]) -> str:
    return "<ul>" + "".join(f"<li>{esc(item)}</li>" for item in items) + "</ul>"


def tags_html(tags: list[str]) -> str:
    return "".join(f'<span class="tag">{esc(tag)}</span>' for tag in tags)


def project_card(project: dict, base_path: str) -> str:
    slot = project["slot"].lower()
    specialty = '<span class="specialty-badge">Optional specialty</span>' if project.get("optionalSpecialty") else ""
    return f"""
<article class="project-card" data-project-status="{esc(project['publicationState'])}">
  <div class="project-card-top">
    <span class="slot-label">{esc(project['slot'])}</span>
    <span class="status-badge status-planned">{esc(project['status'])}</span>
    {specialty}
  </div>
  <h3>{esc(project['title'])}</h3>
  <p>{esc(project['purpose'])}</p>
  <div class="project-card-meta">
    <div class="tag-list">{tags_html(project['tags'])}</div>
    <div class="mission-row"><span>Mission mapping</span><strong>{esc(', '.join(project['missionIds']))}</strong></div>
  </div>
  <a class="project-link" href="{base_path}projects/{slot}/">Open study plan</a>
</article>""".strip()


def focus_card(area: dict, index: int) -> str:
    return f"""
<article class="focus-card">
  <span class="focus-number">0{index}</span>
  <h3>{esc(area['title'])}</h3>
  <p>{esc(area['description'])}</p>
  <div class="mission-row"><span>Mission links</span><strong>{esc(', '.join(area['missions']))}</strong></div>
</article>""".strip()


def skill_row(skill: dict) -> str:
    return f"""
<div class="skill-row">
  <div><strong>{esc(skill['name'])}</strong><small>{esc(skill['note'])}</small></div>
  <span class="skill-missions">{esc(' · '.join(skill['missions']))}</span>
</div>""".strip()


def journey_step(item: dict) -> str:
    return f"""
<article class="journey-step">
  <span class="mission-chip">{esc(item['mission'])}</span>
  <h3>{esc(item['title'])}</h3>
  <p>{esc(item['description'])}</p>
</article>""".strip()


def track_card(track: dict) -> str:
    optional = '<span class="optional-label">Optional specialist track</span>' if track.get("optional") else '<span class="optional-label">Core-aligned track</span>'
    return f"""
<article class="track-card">
  <div class="track-card-top"><h4>{esc(track['title'])}</h4>{optional}</div>
  <p>{esc(track['description'])}</p>
  <div class="track-missions">{esc(track['missions'])}</div>
  <div class="track-prereq"><strong>Prerequisite rule:</strong> {esc(track['prerequisite'])}</div>
</article>""".strip()


def contact_links(contact: dict) -> str:
    configured = []
    labels = {
        "github": "GitHub",
        "email": "Email",
        "linkedin": "LinkedIn",
        "resume": "Résumé",
    }
    for key in ("github", "email", "linkedin", "resume"):
        value = contact.get(key)
        if not value:
            continue
        href = f"mailto:{value}" if key == "email" else value
        external = key != "email"
        attrs = ' target="_blank" rel="noreferrer"' if external else ""
        configured.append(f'<a class="contact-link" href="{esc(href)}"{attrs}>{esc(labels[key])}</a>')
    return "".join(configured)


def optional_results(project: dict) -> str:
    blocks = []
    if project.get("results"):
        blocks.append("<h3>Published results</h3>" + list_html(project["results"]))
    if project.get("metrics"):
        blocks.append("<h3>Metrics</h3>" + list_html(project["metrics"]))
    if project.get("evidenceLinks"):
        links = []
        for item in project["evidenceLinks"]:
            links.append(f'<li><a href="{esc(item["url"])}" target="_blank" rel="noreferrer">{esc(item["label"])}</a></li>')
        blocks.append("<h3>Evidence links</h3><ul>" + "".join(links) + "</ul>")
    if project.get("reviewerStatus"):
        blocks.append(f"<h3>Reviewer status</h3><p>{esc(project['reviewerStatus'])}</p>")
    if not blocks:
        return ""
    return '<div class="optional-results">' + "".join(blocks) + "</div>"


def write_assets(out: Path) -> None:
    assets = out / "assets"
    assets.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SRC / "styles.css", assets / "styles.css")
    shutil.copyfile(SRC / "site.js", assets / "site.js")
    (assets / "favicon.svg").write_text(
        """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#08131f"/><rect x="4" y="4" width="56" height="56" rx="13" fill="none" stroke="#62e6ee" stroke-width="2"/><text x="32" y="40" text-anchor="middle" font-family="system-ui,sans-serif" font-size="24" font-weight="800" fill="#9af5f3">AA</text></svg>""",
        encoding="utf-8",
    )
    (assets / "social-card.svg").write_text(
        """<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#07111b"/><stop offset="1" stop-color="#0e2939"/></linearGradient><pattern id="p" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0V44" fill="none" stroke="#62e6ee" stroke-opacity=".08"/></pattern></defs><rect width="1200" height="630" fill="url(#g)"/><rect width="1200" height="630" fill="url(#p)"/><circle cx="990" cy="105" r="240" fill="#62e6ee" opacity=".05"/><text x="86" y="168" font-family="system-ui,sans-serif" font-size="26" font-weight="800" letter-spacing="4" fill="#62e6ee">AI APPLICATION &amp; PRODUCT SECURITY</text><text x="86" y="316" font-family="system-ui,sans-serif" font-size="108" font-weight="850" letter-spacing="-7" fill="#edf7fb">Ahmed Amhdour</text><text x="90" y="398" font-family="system-ui,sans-serif" font-size="46" font-weight="700" fill="#9af5f3">AI Security Engineer</text><text x="90" y="486" font-family="system-ui,sans-serif" font-size="25" fill="#9fb2c2">RAG security · Agent security · Evidence-based engineering</text><rect x="90" y="536" width="170" height="4" rx="2" fill="#62e6ee"/></svg>""",
        encoding="utf-8",
    )


def validate_content(site: dict, projects: list[dict]) -> None:
    required_slots = [f"C{i:02d}" for i in range(1, 9)]
    actual_slots = [p.get("slot") for p in projects]
    if actual_slots != required_slots:
        raise ValueError(f"Projects must be ordered {required_slots}; got {actual_slots}")
    if any(p.get("status") != "Planned" for p in projects):
        raise ValueError("Initial portfolio projects must remain Planned")
    if any(p.get("publicationState") != "planned" for p in projects):
        raise ValueError("Initial publicationState must remain planned")
    if site["contact"].get("profilePhoto"):
        # Supported by the content model but intentionally not rendered by this initial template.
        pass


def build(base_path: str, out: Path) -> None:
    site = json.loads((CONTENT / "site.json").read_text(encoding="utf-8"))
    projects = json.loads((CONTENT / "projects.json").read_text(encoding="utf-8"))
    validate_content(site, projects)

    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    write_assets(out)
    (out / ".nojekyll").write_text("", encoding="utf-8")

    index_template = (SRC / "index.html").read_text(encoding="utf-8")
    identity = site["identity"]
    metadata = site["metadata"]
    index_html = render(index_template, {
        "BASE_PATH": esc(base_path),
        "META_TITLE": esc(metadata["title"]),
        "META_DESCRIPTION": esc(metadata["description"]),
        "SOCIAL_TITLE": esc(metadata["socialTitle"]),
        "SOCIAL_DESCRIPTION": esc(metadata["socialDescription"]),
        "FULL_NAME": esc(identity["name"]),
        "FIRST_NAME": esc(identity["firstName"]),
        "TITLE": esc(identity["title"]),
        "HERO_DESCRIPTION": esc(identity["heroDescription"]),
        "ABOUT": esc(identity["about"]),
        "PROJECT_COUNT": str(len(projects)),
        "PROJECT_CARDS": "\n".join(project_card(p, base_path) for p in projects),
        "FOCUS_AREAS": "\n".join(focus_card(area, i) for i, area in enumerate(site["focusAreas"], start=1)),
        "SKILLS": "\n".join(skill_row(skill) for skill in site["skills"]),
        "JOURNEY_INTRO": esc(site["learningJourney"]["intro"]),
        "FOUNDATION_JOURNEY": "\n".join(journey_step(item) for item in site["learningJourney"]["foundation"]),
        "TRACKS": "\n".join(track_card(track) for track in site["learningJourney"]["tracks"]),
        "CONTACT_LINKS": contact_links(site["contact"]),
        "YEAR": "2026",
    })
    (out / "index.html").write_text(index_html, encoding="utf-8")

    project_template = (SRC / "project.html").read_text(encoding="utf-8")
    for project in projects:
        slot_dir = out / "projects" / project["slot"].lower()
        slot_dir.mkdir(parents=True, exist_ok=True)
        page_title = f"{project['title']} — Ahmed Amhdour"
        page_description = project["purpose"]
        page = render(project_template, {
            "BASE_PATH": esc(base_path),
            "PAGE_TITLE": esc(page_title),
            "PAGE_DESCRIPTION": esc(page_description),
            "SLOT": esc(project["slot"]),
            "STATUS": esc(project["status"]),
            "OPTIONAL_BADGE": '<span class="specialty-badge">Optional specialty</span>' if project.get("optionalSpecialty") else "",
            "TITLE": esc(project["title"]),
            "PURPOSE": esc(project["purpose"]),
            "MISSIONS": esc(", ".join(project["missionIds"]) + (f" · {project['catalogSection']}" if project.get("catalogSection") else "")),
            "TAGS": tags_html(project["tags"]),
            "PRODUCT_NEED": esc(project["productNeed"]),
            "SECURITY_OBJECTIVE": esc(project["securityObjective"]),
            "SCOPE": esc(project["scope"]),
            "DEPENDENCIES": list_html(project["dependencies"]),
            "BOUNDARIES": list_html(project["boundaries"]),
            "INVESTIGATION": esc(project["investigation"]),
            "CONTROL": esc(project["control"]),
            "PERMITTED_CASES": list_html(project["permittedCases"]),
            "DENIED_CASES": list_html(project["deniedCases"]),
            "EVIDENCE_PLAN": list_html(project["evidencePlan"]),
            "EVALUATION_CRITERIA": list_html(project["evaluationCriteria"]),
            "OPTIONAL_RESULTS": optional_results(project),
            "REMEDIATION_RETEST": esc(project["remediationRetest"]),
            "RECOVERY_TRANSFER": esc(project["recoveryTransfer"]),
            "LIMITATIONS": list_html(project["limitations"]),
        })
        (slot_dir / "index.html").write_text(page, encoding="utf-8")

    # A static fallback keeps accidental route misses inside the repository site instead of presenting a blank Pages 404.
    fallback = index_html.replace("<title>", "<title>Portfolio — ", 1)
    (out / "404.html").write_text(fallback, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build Ahmed's static AI security portfolio")
    parser.add_argument("--base-path", default="/mywebsite/", help="URL base path, e.g. /mywebsite/ for GitHub Pages")
    parser.add_argument("--out", default="dist", help="Output directory relative to repository root")
    args = parser.parse_args()
    base_path = normalize_base_path(args.base_path)
    out = (ROOT / args.out).resolve()
    build(base_path, out)
    print(f"Built portfolio at {out} with base path {base_path}")


if __name__ == "__main__":
    main()
