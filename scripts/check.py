#!/usr/bin/env python3
from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


class AuditParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []
        self.ids: set[str] = set()
        self.h1_count = 0
        self.has_description = False
        self.has_title = False
        self.in_title = False
        self.title_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        if data.get("id"):
            self.ids.add(data["id"])
        if tag == "a" and data.get("href"):
            self.links.append(data["href"])
        if tag == "h1":
            self.h1_count += 1
        if tag == "meta" and data.get("name") == "description" and data.get("content"):
            self.has_description = True
        if tag == "title":
            self.in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False
            self.has_title = bool("".join(self.title_text).strip())

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_text.append(data)


def map_local_href(href: str, base_path: str, current_file: Path, dist: Path) -> tuple[Path | None, str | None]:
    if href.startswith(("http://", "https://", "mailto:", "tel:")):
        return None, None
    parsed = urlparse(href)
    fragment = parsed.fragment or None
    path = parsed.path
    if not path:
        return current_file, fragment
    if path.startswith(base_path):
        path = path[len(base_path):]
        candidate = dist / path
    elif path.startswith("/"):
        # Absolute path outside the configured repository site is not expected.
        return Path("/__invalid_absolute__") / path.lstrip("/"), fragment
    else:
        candidate = current_file.parent / path
    if candidate.is_dir() or str(candidate).endswith("/"):
        candidate = candidate / "index.html"
    elif candidate.suffix == "":
        candidate = candidate / "index.html"
    return candidate.resolve(), fragment


def main() -> None:
    parser = argparse.ArgumentParser(description="Check generated portfolio output")
    parser.add_argument("--dist", default="dist")
    parser.add_argument("--base-path", default="/mywebsite/")
    args = parser.parse_args()
    dist = (ROOT / args.dist).resolve()
    base_path = args.base_path if args.base_path.endswith("/") else args.base_path + "/"

    expected_projects = [dist / "projects" / f"c{i:02d}" / "index.html" for i in range(1, 9)]
    html_files = sorted(dist.rglob("*.html"))
    failures: list[str] = []

    if not (dist / "index.html").exists():
        failures.append("Missing dist/index.html")
    for project in expected_projects:
        if not project.exists():
            failures.append(f"Missing project page: {project.relative_to(dist)}")

    parsed_docs: dict[Path, AuditParser] = {}
    for file in html_files:
        text = file.read_text(encoding="utf-8")
        audit = AuditParser()
        audit.feed(text)
        parsed_docs[file.resolve()] = audit
        if audit.h1_count != 1:
            failures.append(f"{file.relative_to(dist)} has {audit.h1_count} h1 elements (expected 1)")
        if not audit.has_title:
            failures.append(f"{file.relative_to(dist)} is missing a non-empty title")
        if not audit.has_description:
            failures.append(f"{file.relative_to(dist)} is missing a meta description")
        lowered = text.lower()
        for forbidden in ("year old", "years old", "birth date", "born on"):
            if forbidden in lowered:
                failures.append(f"{file.relative_to(dist)} contains forbidden personal detail phrase: {forbidden}")

    for file, audit in parsed_docs.items():
        for href in audit.links:
            target, fragment = map_local_href(href, base_path, file, dist)
            if target is None:
                continue
            if not target.exists():
                failures.append(f"Broken internal link in {file.relative_to(dist)}: {href}")
                continue
            if fragment and target.suffix == ".html":
                target_audit = parsed_docs.get(target)
                if target_audit is None:
                    target_audit = AuditParser()
                    target_audit.feed(target.read_text(encoding="utf-8"))
                    parsed_docs[target] = target_audit
                if fragment not in target_audit.ids:
                    failures.append(f"Missing fragment #{fragment} for link in {file.relative_to(dist)}: {href}")

    index_text = (dist / "index.html").read_text(encoding="utf-8") if (dist / "index.html").exists() else ""
    for section_id in ("home", "about", "portfolio", "focus", "skills", "journey", "contact"):
        if f'id="{section_id}"' not in index_text:
            failures.append(f"Missing required main section #{section_id}")
    if "No completed studies are published yet." not in index_text:
        failures.append("Completed-studies empty state is missing")
    if "https://github.com/lahcennh3-jpg" not in index_text:
        failures.append("Configured GitHub profile link is missing")

    if failures:
        print("QA failed:")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)

    print(f"QA passed: {len(html_files)} HTML pages checked, 8 project routes verified, internal links/fragments resolved.")


if __name__ == "__main__":
    main()
