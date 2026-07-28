#!/usr/bin/env python3
"""Local preview server that never caches, so a rebuild is always what you see."""
import functools, http.server, socketserver, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8899

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()
    def log_message(self, *a):
        pass

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), NoCache) as httpd:
    print(f"http://localhost:{PORT}")
    httpd.serve_forever()
