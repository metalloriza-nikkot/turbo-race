"""Antal varv i enskilda lopp: välj 1 varv, loppet tar slut efter ett varv. Turneringen har ingen varvrad."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1000, "height": 625})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(500)
        click = lambda txt: pg.evaluate(f"() => {{ const b=[...document.querySelectorAll('.screen.on .nav')].find(b=>b.textContent.trim()==='{txt}' || b.textContent.includes('{txt}')); if(!b) throw new Error('ingen {txt}'); b.click(); }}")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        await pg.evaluate("() => { window.__TRx.SETTINGS.show=false; }")
        await click('RACE'); await pg.wait_for_timeout(200); await click('BLIXT'); await pg.wait_for_timeout(200); await click('STADEN'); await pg.wait_for_timeout(400)
        print('varvrad:', await pg.evaluate("() => [...document.querySelectorAll('#lap-row .lapbtn')].map(b => b.textContent + (b.classList.contains('on') ? '*' : '')).join(' ')"))
        await pg.screenshot(path=SHOTS + "/varv_val.png")
        await pg.evaluate("() => [...document.querySelectorAll('#lap-row .lapbtn')].find(b => b.textContent === '1').click()")
        await click('NYBÖRJARE'); await pg.wait_for_timeout(1300); await pg.keyboard.press("Enter")
        r = await pg.evaluate("() => { const G=window.__TR, f=window.__TRf; f.keys.ArrowUp=true; let n=0; for (let i=0;i<60*120 && !G.player.finished;i++){ f.update(1/60); n++; } return { varv: G.laps, klar: !!G.player.finished, tid: +(n/60).toFixed(0) }; }")
        print('lopp:', r); assert r['varv'] == 1 and r['klar']
        await pg.screenshot(path=SHOTS + "/varv_mal.png")
        # kör igen behåller valet
        await pg.evaluate("() => { const G=window.__TR, f=window.__TRf; for (let i=0;i<60*12;i++) f.update(1/60); }"); await pg.wait_for_timeout(300)
        # turneringen: ingen varvrad
        await pg.evaluate("() => { window.__TRx.ui.buildHub(); window.__TRx.ui.showScreen('hub'); }"); await pg.wait_for_timeout(200)
        await click('TURNERING'); await pg.wait_for_timeout(200); await click('BLIXT'); await pg.wait_for_timeout(300)
        vis = await pg.evaluate("() => getComputedStyle(document.querySelector('#lap-row')).display"); print('varvrad i turnering:', vis); assert vis == 'none'
        print(errs or 'no errors'); await b.close()
asyncio.run(main())
