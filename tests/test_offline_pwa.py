"""Testar webbappen: bygg med 'python3 build.py --pages _site', servera _site under /turbo-race/ på port 8123
(t.ex. kopiera till en mapp turbo-race och kör 'python3 -m http.server 8123' i föräldramappen). Kontrollerar
att service workern registreras och att spelet startar igen helt utan nät."""
import asyncio, sys
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8123/turbo-race/'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1280, 'height': 760}); pg = await ctx.new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(BASE); await pg.wait_for_timeout(1500)
        sw = await pg.evaluate("async () => { const r = await navigator.serviceWorker.ready; return [!!r.active, (await caches.keys()).join(',')]; }")
        print('service worker aktiv:', sw)
        man = await pg.evaluate("async () => { const r = await fetch('manifest.webmanifest'); const j = await r.json(); return [j.name, j.display, j.icons.length]; }")
        print('manifest:', man)
        await ctx.set_offline(True)
        await pg.reload(); await pg.wait_for_timeout(1500)
        ok = await pg.evaluate("() => [document.title, !!window.__TR, document.querySelector('.screen.on') && document.querySelector('.screen.on').id]")
        print('offline omladdning:', ok)
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(500)
        print('meny offline:', await pg.evaluate("() => document.querySelector('.screen.on').id"))
        print(errs or 'no errors'); await b.close()
asyncio.run(main())
