#!/usr/bin/env python3
"""Local server for the Seed Classifier web app.

Serves the deploy folder over HTTP with the MIME types the browser needs for
WebAssembly and ES modules, and disables caching so you always get the latest
files. Camera access and `fetch()` of the model require an http:// origin, so
opening `index.html` directly (file://) will not work.

Usage:
    python tools/serve_deploy.py                 # http://localhost:8080/
    python tools/serve_deploy.py --port 8000
    python tools/serve_deploy.py --no-browser
"""

from __future__ import annotations

import argparse
import functools
import http.server
import os
import socket
import socketserver
import threading
import webbrowser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEPLOY = os.path.join(ROOT, "deploy")


def lan_ip() -> str:
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.connect(("8.8.8.8", 80))
        ip = sock.getsockname()[0]
        sock.close()
        return ip
    except OSError:
        return "127.0.0.1"


class LocalServerHandler(http.server.SimpleHTTPRequestHandler):
    # Correct MIME types (some systems report .wasm/.mjs as octet-stream,
    # which breaks WebAssembly streaming and ES module imports).
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".wasm": "application/wasm",
        ".mjs": "text/javascript",
        ".js": "text/javascript",
        ".onnx": "application/octet-stream",
        ".json": "application/json",
        ".webmanifest": "application/manifest+json",
        ".svg": "image/svg+xml",
        ".html": "text/html",
        ".css": "text/css",
    }

    def end_headers(self):
        # Never cache during development.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):  # quieter, single-line logs
        print("  " + (fmt % args))


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the seed classifier app.")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--lan", action="store_true",
                        help="Bind to 0.0.0.0 so phones on the same Wi-Fi can connect.")
    parser.add_argument("--directory", default=DEPLOY)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    if args.lan:
        args.host = "0.0.0.0"

    handler = functools.partial(LocalServerHandler, directory=args.directory)
    socketserver.TCPServer.allow_reuse_address = True

    with socketserver.ThreadingTCPServer((args.host, args.port), handler) as httpd:
        print("Maize Seed Classifier")
        print(f"  serving : {args.directory}")
        print(f"  open    : http://localhost:{args.port}/")
        if args.host == "0.0.0.0":
            print(f"  on phone: http://{lan_ip()}:{args.port}/  (same Wi-Fi)")
        print("  stop    : Ctrl+C\n")
        if not args.no_browser:
            threading.Timer(0.8, lambda: webbrowser.open(f"http://localhost:{args.port}/")).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
