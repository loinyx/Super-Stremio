"""Servidor estático local para desenvolvimento.

Em produção o site é servido como arquivo, sem build. Este script existe só
para conferir localmente com os mesmos cabeçalhos.
"""
import functools, http.server, json, socketserver, pathlib

CABECALHOS = {
    h["key"]: h["value"]
    for h in json.loads((pathlib.Path(__file__).parent / "vercel.json").read_text())["headers"][0]["headers"]
}

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
        # Mesmos cabeçalhos que a Vercel aplica, para que o teste local valha.
        for chave, valor in CABECALHOS.items():
            self.send_header(chave, valor)
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
raiz = pathlib.Path(__file__).parent / "public"
with socketserver.TCPServer(("", 4173), functools.partial(H, directory=str(raiz))) as s:
    s.serve_forever()
