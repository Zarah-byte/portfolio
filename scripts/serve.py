#!/usr/bin/env python3
"""Static server that resolves extensionless URLs to .html, mirroring GitHub Pages.

Plain `python3 -m http.server` serves paths literally, so the site's
extensionless internal links (/index, /about, /projects/iris) 404 locally
even though they work in production. This adds the same clean-URL fallback.
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, test


class CleanURLHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        local = super().translate_path(path)
        if not os.path.exists(local) and not os.path.splitext(local)[1]:
            html = local + ".html"
            if os.path.exists(html):
                return html
        return local


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    test(HandlerClass=CleanURLHandler, port=port, bind="127.0.0.1")
