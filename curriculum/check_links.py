#!/usr/bin/env python3
"""Validate active HTTP(S) links in a TeX document before compilation."""

from __future__ import annotations

import argparse
import re
import socket
import ssl
import sys
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urlsplit
from urllib.request import Request, urlopen


HREF_PATTERN = re.compile(r"\\href\s*\{([^{}]+)\}")
USER_AGENT = (
    "Mozilla/5.0 (compatible; curriculum-link-checker/1.0; "
    "+https://julianszere.github.io/)"
)


@dataclass(frozen=True)
class CheckResult:
    url: str
    state: str
    detail: str


def strip_tex_comments(text: str) -> str:
    """Remove TeX comments while preserving escaped percent signs."""
    uncommented: list[str] = []
    for line in text.splitlines():
        for index, character in enumerate(line):
            if character != "%":
                continue
            backslashes = 0
            cursor = index - 1
            while cursor >= 0 and line[cursor] == "\\":
                backslashes += 1
                cursor -= 1
            if backslashes % 2 == 0:
                line = line[:index]
                break
        uncommented.append(line)
    return "\n".join(uncommented)


def extract_urls(tex_path: Path) -> list[str]:
    text = tex_path.read_text(encoding="utf-8")
    text = strip_tex_comments(text)
    urls: list[str] = []
    seen: set[str] = set()
    for match in HREF_PATTERN.finditer(text):
        url = re.sub(r"\\([%_#&])", r"\1", match.group(1).strip())
        if url in seen:
            continue
        seen.add(url)
        urls.append(url)
    return urls


def local_target(url: str, site_origin: str, site_root: Path) -> Path | None:
    parsed = urlsplit(url)
    origin = urlsplit(site_origin)
    if (parsed.scheme.lower(), parsed.netloc.lower()) != (
        origin.scheme.lower(),
        origin.netloc.lower(),
    ):
        return None

    relative_path = unquote(parsed.path).lstrip("/")
    target = (site_root / relative_path).resolve()
    if parsed.path.endswith("/"):
        target = target / "index.html"

    try:
        target.relative_to(site_root)
    except ValueError:
        return Path("__outside_site_root__")
    return target


def request_status(url: str, method: str, timeout: float) -> int:
    headers = {
        "Accept": "text/html,application/pdf,*/*;q=0.8",
        "User-Agent": USER_AGENT,
    }
    if method == "GET":
        headers["Range"] = "bytes=0-0"
    request = Request(url, headers=headers, method=method)
    with urlopen(request, timeout=timeout) as response:
        return response.getcode()


def check_http(url: str, timeout: float) -> CheckResult:
    parsed = urlsplit(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return CheckResult(url, "dead", "malformed HTTP(S) URL")

    try:
        status = request_status(url, "HEAD", timeout)
        return CheckResult(url, "ok", f"HTTP {status}")
    except HTTPError:
        # Some healthy sites reject HEAD requests, so retry with a bodyless GET.
        pass
    except (TimeoutError, socket.timeout, ssl.SSLError, URLError) as error:
        return CheckResult(url, "warning", f"network check failed: {error}")

    try:
        status = request_status(url, "GET", timeout)
        return CheckResult(url, "ok", f"HTTP {status}")
    except HTTPError as error:
        if error.code in {404, 410}:
            return CheckResult(url, "dead", f"HTTP {error.code}")
        if error.code in {401, 403, 429, 999}:
            return CheckResult(
                url,
                "warning",
                f"HTTP {error.code}; the site may block automated checks",
            )
        return CheckResult(url, "warning", f"HTTP {error.code}")
    except (TimeoutError, socket.timeout, ssl.SSLError, URLError) as error:
        return CheckResult(url, "warning", f"network check failed: {error}")


def check_url(
    url: str,
    site_origin: str | None,
    site_root: Path | None,
    timeout: float,
) -> CheckResult:
    parsed = urlsplit(url)
    if parsed.scheme not in {"http", "https"}:
        return CheckResult(url, "skipped", f"unsupported scheme: {parsed.scheme or 'none'}")

    if site_origin and site_root:
        target = local_target(url, site_origin, site_root)
        if target is not None:
            if target.name == "__outside_site_root__":
                return CheckResult(url, "dead", "local URL escapes the site root")
            if target.is_file():
                return CheckResult(url, "ok", f"local file: {target}")
            return CheckResult(url, "dead", f"missing local file: {target}")

    return check_http(url, timeout)


def count(results: Iterable[CheckResult], state: str) -> int:
    return sum(result.state == state for result in results)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("tex_file", type=Path)
    parser.add_argument("--site-origin")
    parser.add_argument("--site-root", type=Path)
    parser.add_argument("--timeout", type=float, default=6.0)
    parser.add_argument("--workers", type=int, default=8)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    tex_path = args.tex_file.resolve()
    site_root = args.site_root.resolve() if args.site_root else None

    try:
        urls = extract_urls(tex_path)
    except (OSError, UnicodeError) as error:
        print(f"[link-check] ERROR: could not read {tex_path}: {error}", file=sys.stderr)
        return 1

    if not urls:
        print(f"[link-check] WARNING: no active \\href links found in {tex_path.name}")
        return 0

    print(f"[link-check] Checking {len(urls)} unique links in {tex_path.name}...")
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        results = list(
            executor.map(
                lambda url: check_url(url, args.site_origin, site_root, args.timeout),
                urls,
            )
        )

    for result in results:
        if result.state == "dead":
            print(f"[link-check] DEAD: {result.url} ({result.detail})", file=sys.stderr)
        elif result.state == "warning":
            print(f"[link-check] WARNING: {result.url} ({result.detail})")

    ok_count = count(results, "ok")
    warning_count = count(results, "warning")
    skipped_count = count(results, "skipped")
    dead_count = count(results, "dead")
    print(
        "[link-check] "
        f"{ok_count} reachable, {warning_count} inconclusive, "
        f"{skipped_count} skipped, {dead_count} dead."
    )
    return 1 if dead_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
