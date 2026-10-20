"""Bygger TURBO-RACE.

  python3 build.py                 -> dist/TURBO-RACE.html (en fil, fungerar direkt från skrivbordet)
  python3 build.py --pages _site   -> dessutom webbappen för GitHub Pages i _site/ (index.html, sw.js, manifest, ikoner)
"""
import glob, hashlib, os, re, shutil, sys

root = os.path.dirname(os.path.abspath(__file__))
js = "\n".join(open(f, encoding="utf-8").read() for f in sorted(glob.glob(os.path.join(root, "src", "0*.js"))))
html = open(os.path.join(root, "src", "index.html"), encoding="utf-8").read().replace("/*__JS__*/", "(function(){\n'use strict';\n" + js + "\n})();")
version = (re.search(r"TR_VERSION = '([^']+)'", js) or [None, "dev"])[1]
os.makedirs(os.path.join(root, "dist"), exist_ok=True)
open(os.path.join(root, "dist", "TURBO-RACE.html"), "w", encoding="utf-8").write(html)
print("ok", version, len(html), "-> dist/TURBO-RACE.html")

if "--pages" in sys.argv:
    i = sys.argv.index("--pages"); out = sys.argv[i + 1] if len(sys.argv) > i + 1 else "_site"
    out = os.path.join(root, out); pwa = os.path.join(root, "pwa")
    shutil.rmtree(out, ignore_errors=True); os.makedirs(os.path.join(out, "icons"))
    rd = lambda n: open(os.path.join(pwa, n), encoding="utf-8").read()
    page = html.replace("</head>", rd("head.html") + "</head>", 1).replace("</body>", rd("register.html") + "</body>", 1)
    open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(page)
    h = hashlib.sha1(page.encode("utf-8")).hexdigest()[:10]
    open(os.path.join(out, "sw.js"), "w", encoding="utf-8").write(rd("sw.js").replace("__CACHE__", f"turbo-{version}-{h}"))
    shutil.copy(os.path.join(pwa, "manifest.webmanifest"), out)
    for f in glob.glob(os.path.join(pwa, "icons", "*.png")): shutil.copy(f, os.path.join(out, "icons"))
    shutil.copy(os.path.join(root, "dist", "TURBO-RACE.html"), out)  # enfilsversionen kan laddas ner från sidan
    open(os.path.join(out, ".nojekyll"), "w").write("")
    print("ok pages", f"turbo-{version}-{h}", "->", os.path.relpath(out, root))
