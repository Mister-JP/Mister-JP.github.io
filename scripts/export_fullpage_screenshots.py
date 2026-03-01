#!/usr/bin/env python3

"""Export tall screenshots for every built route in dist/."""

from __future__ import annotations

import argparse
import functools
import http.server
import re
import shutil
import subprocess
import sys
import threading
import urllib.parse
from pathlib import Path


DEFAULT_HOST = "127.0.0.1"
DEFAULT_WIDTH = 1440
DEFAULT_HEIGHT = 2400
DEFAULT_BOTTOM_BUFFER = 220
DEFAULT_VIRTUAL_TIME_BUDGET_MS = 2500
MEASURE_HELPER_FILENAME = ".capture-height-helper.html"
MEASURE_RESULT_PATTERN = re.compile(r"<body[^>]*>\s*(\d+)\s*</body>", re.IGNORECASE)


class QuietRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        return


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Serve dist/ locally and export tall PNG screenshots for every route."
    )
    parser.add_argument(
        "--dist",
        type=Path,
        default=Path("dist"),
        help="Built site directory to serve. Defaults to ./dist.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("feedback-screenshots"),
        help="Directory where screenshots will be written. Defaults to ./feedback-screenshots.",
    )
    parser.add_argument(
        "--chrome",
        type=Path,
        default=None,
        help="Optional explicit path to a Chrome/Chromium executable.",
    )
    parser.add_argument(
        "--host",
        default=DEFAULT_HOST,
        help=f"Host used by the temporary HTTP server. Defaults to {DEFAULT_HOST}.",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=0,
        help="Port for the temporary HTTP server. Defaults to 0 (auto-select).",
    )
    parser.add_argument(
        "--width",
        type=int,
        default=DEFAULT_WIDTH,
        help=f"Screenshot viewport width. Defaults to {DEFAULT_WIDTH}.",
    )
    parser.add_argument(
        "--height",
        type=int,
        default=DEFAULT_HEIGHT,
        help=(
            "Fallback screenshot height if page measurement fails. "
            f"Defaults to {DEFAULT_HEIGHT}."
        ),
    )
    parser.add_argument(
        "--bottom-buffer",
        type=int,
        default=DEFAULT_BOTTOM_BUFFER,
        help=(
            "Extra pixels added below the measured document height so footers "
            f"and final wrapping are not clipped. Defaults to {DEFAULT_BOTTOM_BUFFER}."
        ),
    )
    parser.add_argument(
        "--virtual-time-budget",
        type=int,
        default=DEFAULT_VIRTUAL_TIME_BUDGET_MS,
        help=(
            "How long Chrome should wait for layout and assets before capture, in ms. "
            f"Defaults to {DEFAULT_VIRTUAL_TIME_BUDGET_MS}."
        ),
    )
    return parser.parse_args()


def resolve_chrome(explicit_path: Path | None) -> Path:
    candidates: list[Path] = []
    if explicit_path is not None:
        candidates.append(explicit_path)

    known_paths = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ]
    for raw_path in known_paths:
        candidates.append(Path(raw_path))

    for binary_name in ("google-chrome", "chromium", "chromium-browser", "chrome"):
        resolved = shutil.which(binary_name)
        if resolved:
            candidates.append(Path(resolved))

    for candidate in candidates:
        if candidate.is_file():
            return candidate

    raise FileNotFoundError(
        "No Chrome/Chromium executable found. Pass --chrome with a valid browser path."
    )


def discover_routes(dist_dir: Path) -> list[str]:
    routes: list[str] = []
    for html_file in sorted(dist_dir.rglob("index.html")):
        relative_path = html_file.relative_to(dist_dir)
        if relative_path.as_posix() == "index.html":
            route = "/"
        else:
            route = f"/{relative_path.parent.as_posix().strip('/')}/"

        routes.append(route)

    if not routes:
        raise FileNotFoundError(f"No built routes found in {dist_dir}.")

    return routes


def route_sort_key(route: str) -> tuple[int, str]:
    return (0 if route == "/" else 1, route)


def route_label(route: str) -> str:
    if route == "/":
        return "home"

    parts = [part for part in route.strip("/").split("/") if part]
    return "__".join(parts)


def filename_for_route(route: str, index: int) -> str:
    return f"{index:03d}__{route_label(route)}.png"


def start_server(dist_dir: Path, host: str, port: int) -> http.server.ThreadingHTTPServer:
    handler = functools.partial(QuietRequestHandler, directory=str(dist_dir))
    server = http.server.ThreadingHTTPServer((host, port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def write_measure_helper(dist_dir: Path) -> Path:
    helper_path = dist_dir / MEASURE_HELPER_FILENAME
    helper_html = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Capture Height Helper</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
    }

    body {
      font: 16px/1.4 monospace;
    }

    iframe {
      position: absolute;
      left: -10000px;
      top: 0;
      width: 1440px;
      height: 1200px;
      border: 0;
      opacity: 0;
      pointer-events: none;
    }
  </style>
</head>
<body>pending</body>
<script>
  const params = new URLSearchParams(window.location.search);
  const route = params.get("route") || "/";
  const width = Number(params.get("width") || "1440");
  const frame = document.createElement("iframe");
  let attempts = 0;
  const maxAttempts = 30;

  if (Number.isFinite(width) && width > 0) {
    frame.style.width = `${width}px`;
  }

  const finish = () => {
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.documentElement || doc.readyState !== "complete") {
        attempts += 1;
        if (attempts < maxAttempts) {
          window.setTimeout(finish, 150);
          return;
        }
        document.body.textContent = "ERROR:Frame did not finish loading in time";
        return;
      }
      const html = doc.documentElement;
      const body = doc.body;
      const measuredHeight = Math.max(
        Math.ceil(html.getBoundingClientRect().height),
        html.scrollHeight,
        html.offsetHeight,
        html.clientHeight,
        body ? Math.ceil(body.getBoundingClientRect().height) : 0,
        body ? body.scrollHeight : 0,
        body ? body.offsetHeight : 0,
        body ? body.clientHeight : 0
      );
      document.body.textContent = String(measuredHeight);
    } catch (error) {
      document.body.textContent = `ERROR:${error instanceof Error ? error.message : String(error)}`;
    }
  };

  frame.addEventListener("load", () => {
    attempts = 0;
    window.setTimeout(finish, 250);
  });

  frame.src = route;
  document.body.appendChild(frame);
  window.setTimeout(finish, 250);
</script>
</html>
"""
    helper_path.write_text(helper_html, encoding="utf-8")
    return helper_path


def measure_page_height(
    chrome_path: Path,
    measure_url: str,
    virtual_time_budget: int,
) -> int:
    effective_budget = max(virtual_time_budget, 3500)
    command = [
        str(chrome_path),
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        f"--virtual-time-budget={effective_budget}",
        "--dump-dom",
        measure_url,
    ]

    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=25)
    except subprocess.TimeoutExpired as error:
        raise RuntimeError("Chrome timed out while measuring page height.") from error
    dom_output = result.stdout.strip()
    if result.returncode != 0:
        stderr = result.stderr.strip() if result.stderr else "Unknown Chrome error."
        raise RuntimeError(f"Chrome failed to measure page height: {stderr}")

    if "ERROR:" in dom_output:
        raise RuntimeError(f"Page measurement failed: {dom_output}")

    match = MEASURE_RESULT_PATTERN.search(dom_output)
    if not match:
        raise RuntimeError("Could not parse the measured page height from Chrome output.")

    measured_height = int(match.group(1))
    if measured_height <= 0:
        raise RuntimeError("Measured page height must be greater than 0.")

    return measured_height


def run_capture(
    chrome_path: Path,
    url: str,
    output_path: Path,
    width: int,
    height: int,
    virtual_time_budget: int,
) -> None:
    base_command = [
        str(chrome_path),
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        "--force-device-scale-factor=1",
        "--run-all-compositor-stages-before-draw",
        f"--window-size={width},{height}",
        f"--virtual-time-budget={virtual_time_budget}",
        f"--screenshot={output_path}",
        url,
    ]
    last_error = "Chrome capture timed out."

    for headless_flag in ("--headless=new", "--headless"):
        command = [str(chrome_path), headless_flag, *base_command[1:]]
        try:
            result = subprocess.run(command, capture_output=True, text=True, timeout=45)
        except subprocess.TimeoutExpired:
            last_error = "Chrome capture timed out."
            continue
        if result.returncode == 0 and output_path.exists():
            return
        if result.stderr:
            last_error = result.stderr.strip()
        elif result.stdout:
            last_error = result.stdout.strip()
        else:
            last_error = "Unknown Chrome error."

    raise RuntimeError(f"Chrome failed to capture {url}: {last_error}")


def write_manifest(output_dir: Path, captures: list[tuple[str, str]]) -> None:
    lines = ["Full-page screenshot export", ""]
    for filename, route in captures:
        lines.append(f"{filename} -> {route}")

    manifest_path = output_dir / "manifest.txt"
    manifest_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def resolve_output_dir(raw_output: Path) -> Path:
    cwd = Path.cwd().resolve()
    output_dir = (cwd / raw_output).resolve()

    try:
        output_dir.relative_to(cwd)
    except ValueError as error:
        raise ValueError(
            f"Output must stay inside the current working directory: {cwd}"
        ) from error

    return output_dir


def main() -> int:
    args = parse_args()
    dist_dir = args.dist.resolve()
    try:
        output_dir = resolve_output_dir(args.output)
    except ValueError as error:
        print(str(error), file=sys.stderr)
        return 1

    if not dist_dir.is_dir():
        print(
            f"Built site directory not found: {dist_dir}. Run `npm run build` first.",
            file=sys.stderr,
        )
        return 1

    try:
        chrome_path = resolve_chrome(args.chrome.resolve() if args.chrome else None)
        routes = sorted(discover_routes(dist_dir), key=route_sort_key)
    except (FileNotFoundError, RuntimeError) as error:
        print(str(error), file=sys.stderr)
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)

    server = start_server(dist_dir, args.host, args.port)
    actual_port = server.server_port
    captures: list[tuple[str, str]] = []
    helper_path = write_measure_helper(dist_dir)

    try:
        for index, route in enumerate(routes, start=1):
            filename = filename_for_route(route, index)
            output_path = output_dir / filename
            url = f"http://{args.host}:{actual_port}{route}"
            encoded_route = urllib.parse.quote(route, safe="/")
            measure_url = (
                f"http://{args.host}:{actual_port}/{MEASURE_HELPER_FILENAME}"
                f"?route={encoded_route}&width={args.width}"
            )

            measured_height = measure_page_height(
                chrome_path=chrome_path,
                measure_url=measure_url,
                virtual_time_budget=args.virtual_time_budget,
            )
            capture_height = (
                measured_height + max(args.bottom_buffer, 0)
                if measured_height > 0
                else args.height
            )

            print(
                f"Capturing {route} at {capture_height}px -> {output_path.name}"
            )
            run_capture(
                chrome_path=chrome_path,
                url=url,
                output_path=output_path,
                width=args.width,
                height=capture_height,
                virtual_time_budget=args.virtual_time_budget,
            )
            captures.append((output_path.name, route))
    except RuntimeError as error:
        print(str(error), file=sys.stderr)
        return 1
    finally:
        if helper_path.exists():
            helper_path.unlink()
        server.shutdown()
        server.server_close()

    write_manifest(output_dir, captures)
    print(f"Saved {len(captures)} screenshots to {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
