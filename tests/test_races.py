import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS, TMP, HERE
import asyncio
from playwright.async_api import async_playwright
SIM = """() => { const G=window.__TR,f=window.__TRf; for(let i=0;i<30 && G.mode==='show';i++){} if (G.mode==='gift') { G.gift.picked=0; G.gift.pt=2; f.update(1/60); } f.keys.ArrowUp=true; for(let i=0;i<60*400 && G.mode!=='done';i++){ f.update(1/60); if(G.player.item&&G.mode==='race'&&Math.random()<0.02) f.useItem(G.player);} f.keys.ArrowUp=false; return G.T.def.id+' '+Math.round(G.raceT)+'s place '+G.player.place; }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1512,"height":945})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.evaluate("() => localStorage.setItem('turbo_settings', JSON.stringify({show:false}))"); await pg.reload(); await pg.wait_for_timeout(900)
        click = lambda txt: pg.evaluate(f"() => {{ const b=[...document.querySelectorAll('.screen.on .nav')].find(b=>b.textContent.includes('{txt}')); if(!b) throw new Error('no btn {txt}'); b.click(); }}")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        await click('TURNERING'); await pg.wait_for_timeout(300); await click('DINO'); await pg.wait_for_timeout(300); await click('NYBÖRJARE'); await pg.wait_for_timeout(500)
        for r in range(7):
            print(await pg.evaluate(SIM)); await pg.wait_for_timeout(700)
            await click('HOPPA'); await pg.wait_for_timeout(300)
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(600)
        await pg.wait_for_timeout(800); await pg.screenshot(path=SHOTS+"/r_final.png")
        coins = await pg.evaluate("() => JSON.parse(localStorage.getItem('turbo_prof')).players['_'].coins")
        print('coins', coins)
        await click('MENY'); await pg.wait_for_timeout(400)
        await click('RACE'); await pg.wait_for_timeout(300); await click('BLIXT'); await pg.wait_for_timeout(300); await click('STADEN'); await pg.wait_for_timeout(300); await click('MELLAN'); await pg.wait_for_timeout(400)
        print(await pg.evaluate(SIM)); await pg.wait_for_timeout(700); await pg.screenshot(path=SHOTS+"/r_res.png")
        print(errs or 'no errors'); await b.close()
asyncio.run(main())
