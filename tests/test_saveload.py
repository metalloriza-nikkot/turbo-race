import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS, TMP, HERE
import asyncio
from playwright.async_api import async_playwright
SIM = "() => { const G=window.__TR,f=window.__TRf; if (G.mode==='gift') { G.gift.picked=0; G.gift.pt=2; } f.keys.ArrowUp=true; for(let i=0;i<60*400 && G.mode!=='done';i++) f.update(1/60); f.keys.ArrowUp=false; }"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={"width":1280,"height":760}, accept_downloads=True); pg=await ctx.new_page()
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(700)
        await pg.evaluate("() => { delete window.showSaveFilePicker; const X=window.__TRx; X.SETTINGS && (X.SETTINGS.show=false); }")
        click = lambda txt: pg.evaluate(f"() => {{ const b=[...document.querySelectorAll('.screen.on .nav')].find(b=>b.textContent.includes('{txt}')); if(!b) throw new Error('no btn {txt}'); b.click(); }}")
        await click('NY SPELARE'); await pg.wait_for_timeout(300); await pg.keyboard.type("LIAM"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
        print('skärm', await pg.evaluate("() => document.querySelector('.screen.on').id"), await pg.evaluate("() => window.__TR.playerName"))
        await click('KLAR'); await pg.wait_for_timeout(500)
        await pg.evaluate("() => { const P=window.__TRx.ui.PROF(); P.players.LIAM.coins=77; }")
        await click('TURNERING'); await pg.wait_for_timeout(300); await click('RC-RACERN'); await pg.wait_for_timeout(300); await click('LAGOM'); await pg.wait_for_timeout(1500)
        await pg.evaluate(SIM); await pg.wait_for_timeout(600)
        try: await click('HOPPA')
        except Exception: pass
        await pg.wait_for_timeout(800)
        print('efter lopp 1:', await pg.evaluate("() => { const s=window.__TRx.cupSaved(); return [s.idx, s.pts.me, s.tracks.length]; }"))
        await click('NÄSTA BANA'); await pg.wait_for_timeout(1200)
        await pg.evaluate("() => { const G=window.__TR,f=window.__TRf; if (G.mode==='gift') { G.gift.picked=0; G.gift.pt=2; } f.keys.ArrowUp=true; for(let i=0;i<60*12;i++) f.update(1/60); f.keys.ArrowUp=false; }")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=SHOTS+"/v19_pause.png")
        async with pg.expect_download() as dl:
            await click('SPARA SPEL')
        d = await dl.value; path = await d.path(); fn = d.suggested_filename; await d.save_as(os.path.join(TMP, fn))
        print('sparad fil:', fn, 'cupSave:', await pg.evaluate("() => { const s=window.__TRx.cupSaved(); return [s.idx, s.pts.me]; }"))
        await pg.wait_for_timeout(500); await pg.screenshot(path=SHOTS+"/v19_saved.png")
        # ny dator: töm allt
        await pg.evaluate("() => { localStorage.clear(); }"); await pg.reload(); await pg.wait_for_timeout(800)
        await pg.evaluate("() => { delete window.showSaveFilePicker; }")
        async with pg.expect_file_chooser() as fc:
            await click('LADDA SPEL')
        ch = await fc.value; await ch.set_files(os.path.join(TMP, fn))
        await pg.wait_for_timeout(600); await pg.screenshot(path=SHOTS+"/v19_loadconfirm.png")
        print('skärm', await pg.evaluate("() => document.querySelector('.screen.on').id"))
        await click('JA, LADDA'); await pg.wait_for_timeout(1500)
        print('efter laddning:', await pg.evaluate("() => [document.querySelector('.screen.on').id, window.__TR.playerName, window.__TRx.ui.PROF().players.LIAM.coins]"))
        await pg.screenshot(path=SHOTS+"/v19_resume.png")
        await click('FORTSÄTT'); await pg.wait_for_timeout(1200)
        print('fortsätter:', await pg.evaluate("() => [window.__TR.mode, window.__TR.T.def.id, window.__TRx.cupSaved().idx, window.__TR.player.d.id]"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(600)
        # spela klart lopp 2 och kolla poängen räknas vidare
        await pg.evaluate(SIM); await pg.wait_for_timeout(600)
        try: await click('HOPPA')
        except Exception: pass
        await pg.wait_for_timeout(800)
        print('efter lopp 2:', await pg.evaluate("() => { const s=window.__TRx.cupSaved(); return [s.idx, s.pts.me]; }"))
        # hubben visar PÅGÅR
        await click('MENY'); await pg.wait_for_timeout(500)
        await pg.screenshot(path=SHOTS+"/v19_hub.png")
        print(errs or 'no errors'); await b.close()
asyncio.run(main())
