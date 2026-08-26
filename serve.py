"""Servidor estático local para desenvolvimento.

Em produção o site é servido como arquivo, sem build. Este script existe só
para conferir localmente com os mesmos cabeçalhos.
"""
import functools, http.server, socketserver, pathlib

class H(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
    }
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
raiz = pathlib.Path(__file__).parent / "public"
with socketserver.TCPServer(("", 4173), functools.partial(H, directory=str(raiz))) as s:
    s.serve_forever()
