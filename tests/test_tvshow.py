import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS, TMP, HERE
import asyncio
from playwright.async_api import async_playwright
SIM = """() => { const G=window.__TR,f=window.__TRf; if (G.mode==='gift') { G.gift.picked=0; G.gift.pt=2; f.update(1/60); } f.keys.ArrowUp=true; for(let i=0;i<60*400 && G.mode!=='done';i++){ f.update(1/60); if(G.player.item&&G.mode==='race'&&Math.random()<0.02) f.useItem(G.player); if(G.mode==='race' && G.player.meterReady) f.useSuper(G.player);} f.keys.ArrowUp=false; return G.T.def.id+' '+Math.round(G.raceT)+'s place '+G.player.place; }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1512,"height":945})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type=='error' and errs.append(m.text))
        await pg.goto(URL); await pg.wait_for_timeout(900)
        click = lambda txt: pg.evaluate(f"() => {{ const b=[...document.querySelectorAll('.screen.on .nav')].find(b=>b.textContent.includes('{txt}')); if(!b) throw new Error('no btn {txt}'); b.click(); }}")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=SHOTS+"/s_hub.png")
        await click('TURNERING'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=SHOTS+"/s_drivers.png")
        await click('DINO'); await pg.wait_for_timeout(300); await click('NYBÖRJARE'); await pg.wait_for_timeout(500)
        for r in range(7):
            mode = await pg.evaluate("() => window.__TR.mode")
            n=0
            while mode=='show' and n<12:
                await pg.wait_for_timeout(1300 if r in (0,6) else 300)
                if r in (0,1,6): await pg.screenshot(path=f"{SHOTS}/s_r{r}_{n}.png")
                kind = await pg.evaluate("() => { try { return SHOW.scenes[SHOW.i].kind } catch(e) { return '?' } }") if False else ''
                await pg.keyboard.press("Enter" if r!=2 else "Escape"); n+=1
                mode = await pg.evaluate("() => window.__TR.mode")
            print('race',r,'show scenes skipped',n,'mode',mode)
            if r==6: 
                await pg.evaluate("() => { const f=window.__TRf; f.keys.ArrowUp=true; for(let i=0;i<60*8;i++) f.update(1/60); }"); await pg.wait_for_timeout(200)
                await pg.screenshot(path=SHOTS+"/s_final_track.png")
            if r==1:
                await pg.evaluate("() => { const f=window.__TRf; f.keys.ArrowUp=true; for(let i=0;i<60*20;i++) f.update(1/60); window.__TR.radioT=0; for(let i=0;i<10;i++) f.update(1/60); }"); await pg.wait_for_timeout(200)
                await pg.screenshot(path=SHOTS+"/s_radio.png")
            print(await pg.evaluate(SIM)); await pg.wait_for_timeout(900)
            await click('HOPPA'); await pg.wait_for_timeout(400)
            await pg.screenshot(path=f"{SHOTS}/s_res{r}.png")
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(600)
        # press conference
        mode = await pg.evaluate("() => window.__TR.mode"); print('after final mode', mode)
        await pg.wait_for_timeout(1500); await pg.screenshot(path=SHOTS+"/s_press.png")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=SHOTS+"/s_podium.png")
        print(await pg.evaluate("() => JSON.stringify(CUP.pts)") if False else '')
        print(errs or 'no errors'); await b.close()
asyncio.run(main())
