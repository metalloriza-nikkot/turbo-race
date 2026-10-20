import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS, TMP, HERE
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1440,"height":860})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(600)
        await pg.evaluate("() => { window.__TRx.ui.hideUI(); window.__TRx.startCity('pizza'); const S=window.__TR.city; S.m.level=1; S.m.foods=['FLAGGA']; S.m.lower=false; S.brief.t=2; }")
        await pg.keyboard.press("ArrowUp"); await pg.wait_for_timeout(200)
        await pg.keyboard.press("Space"); await pg.wait_for_timeout(700)   # läs upp lappen -> ljudning startar
        # något annat pratar mitt i (t.ex. 'Nu är du nära!' eller en skylt)
        await pg.evaluate("() => { const S=window.__TR.city; S.m.hunt=true; S.car.x=S.m.place.bay.x+300; S.car.y=S.m.place.bay.y; for(let i=0;i<20;i++) window.__TRf.update(1/60); }")
        await pg.wait_for_timeout(15000)
        r = await pg.evaluate("() => window.__TRx.SOUNDDBG ? window.__TRx.SOUNDDBG() : null")
        await pg.screenshot(path=SHOTS+"/strip_bug.png")
        print('strip efter 15 s:', r, errs or 'no errors'); await b.close()
asyncio.run(main())
