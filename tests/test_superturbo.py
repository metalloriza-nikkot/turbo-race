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
        click = lambda txt: pg.evaluate(f"() => {{ const b=[...document.querySelectorAll('.screen.on .nav')].find(b=>b.textContent.includes('{txt}')); b.click(); }}")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        await click('RACE'); await pg.wait_for_timeout(200); await click('BLIXT'); await pg.wait_for_timeout(200); await click('STADEN'); await pg.wait_for_timeout(200); await click('MELLAN'); await pg.wait_for_timeout(1200)
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        await pg.evaluate("() => { const f=window.__TRf; f.keys.ArrowUp=true; for(let i=0;i<60*6;i++) f.update(1/60); window.__TR.player.meter=100; }")
        st = lambda: pg.evaluate("() => { const P=window.__TR.player; return [Math.round(P.meter), !!P.superOn, P.air.toFixed(2), Math.round(Math.hypot(P.vx,P.vy))]; }")
        # dubbeltryck = hopp utan turbo
        await pg.keyboard.press("Shift"); await pg.wait_for_timeout(90); await pg.keyboard.press("Shift")
        await pg.evaluate("() => { for(let i=0;i<6;i++) window.__TRf.update(1/60); }")
        print('dubbeltryck [mätare, turbo, luft, fart]:', await st())
        await pg.evaluate("() => { for(let i=0;i<90;i++) window.__TRf.update(1/60); }")
        # håll in 1 s (realtid räknas för hålltiden, simulerar 1 s spel)
        await pg.keyboard.down("Shift"); await pg.wait_for_timeout(200)
        await pg.evaluate("() => { for(let i=0;i<60;i++) window.__TRf.update(1/60); }")
        print('håller 1 s:', await st()); await pg.screenshot(path=SHOTS+"/v18_super.png")
        await pg.keyboard.up("Shift"); await pg.evaluate("() => { for(let i=0;i<30;i++) window.__TRf.update(1/60); }")
        print('släppt:', await st())
        await pg.keyboard.down("Shift"); await pg.wait_for_timeout(200)
        await pg.evaluate("() => { for(let i=0;i<60*3;i++) window.__TRf.update(1/60); }")
        print('håller tills tom:', await st()); await pg.keyboard.up("Shift")
        # kort tryck med lite i tanken under minimum
        await pg.evaluate("() => { window.__TR.player.meter = 12; }"); await pg.keyboard.down("Shift"); await pg.wait_for_timeout(250)
        await pg.evaluate("() => { for(let i=0;i<20;i++) window.__TRf.update(1/60); }"); print('under minimum (12):', await st()); await pg.keyboard.up("Shift")
        print(errs or 'no errors'); await b.close()
asyncio.run(main())
