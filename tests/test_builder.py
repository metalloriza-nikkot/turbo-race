"""Banbyggaren: kör fram en slinga, stämpla ut saker, döp banan, kör ett lopp på den, och den finns i banvalet och turneringen."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1280, "height": 800})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(500)
        click = lambda txt: pg.evaluate(f"() => {{ const b=[...document.querySelectorAll('.screen.on .nav')].find(b=>b.textContent.includes('{txt}')); if(!b) throw new Error('ingen knapp {txt}'); b.click(); }}")
        frames = lambda n: pg.evaluate(f"() => {{ for (let i=0;i<{n};i++) window.__TRf.update(1/60); }}")
        st = lambda: pg.evaluate("() => { const B=window.__TRx.builder.state(); return B && { fas: B.phase, rutor: B.cells.length, sluten: B.closed, saker: Object.keys(B.stamps).length, msg: B.msg && B.msg.text }; }")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        await click('BYGG BANA'); await pg.wait_for_timeout(300); await pg.screenshot(path=SHOTS + "/bygg_meny.png")
        await click('NY BANA'); await pg.wait_for_timeout(300); await pg.screenshot(path=SHOTS + "/bygg_miljo.png")
        await click('STADEN'); await pg.wait_for_timeout(400)
        async def keys(seq):
            for k in seq: await pg.keyboard.press(k); await frames(10)
        # för kort att stänga + kant + backa
        await keys(['ArrowRight'] * 3 + ['ArrowLeft']); print('backa ett steg:', await st())
        await keys(['ArrowDown', 'ArrowDown', 'ArrowDown']); print('mot kanten:', await st())
        await keys(['ArrowUp'] * 2); print('backat till 3:', await st())
        await keys(['ArrowRight'] * 3 + ['ArrowUp'] * 3 + ['ArrowLeft'] * 5 + ['ArrowDown'] * 2)
        await keys(['ArrowRight', 'ArrowDown']); print('krock med vägen:', await st()); await keys(['ArrowLeft'])
        await pg.wait_for_timeout(200); await pg.screenshot(path=SHOTS + "/bygg_vag.png"); print('före stängning:', await st())
        await keys(['ArrowDown']); print('stängd:', await st()); await frames(30); await pg.screenshot(path=SHOTS + "/bygg_klar.png")
        await frames(120); print('efter paus:', await st())
        await keys(['ArrowRight', 'Digit2', 'Enter', 'ArrowRight', 'Digit1', 'Enter', 'ArrowRight', 'Digit4', 'Enter']); print('hinder vid start:', await st())
        for seq in [['ArrowRight', 'ArrowRight', 'Digit4', 'Enter'], ['ArrowUp', 'Digit5', 'Enter'], ['ArrowUp', 'Digit6', 'Enter'], ['ArrowUp', 'ArrowLeft', 'ArrowLeft', 'Digit3', 'Enter'], ['ArrowLeft', 'Digit2', 'Enter']]:
            await keys(seq)
        await frames(20); await pg.wait_for_timeout(100); await pg.screenshot(path=SHOTS + "/bygg_saker.png"); print('saker:', await st())
        await keys(['Digit9', 'Enter']); await pg.wait_for_timeout(300)
        await pg.keyboard.type('Snurran'); await pg.wait_for_timeout(100); await pg.screenshot(path=SHOTS + "/bygg_namn.png")
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(500); await pg.screenshot(path=SHOTS + "/bygg_sparad.png")
        info = await pg.evaluate("() => { const L=window.__TRx.builder.myTracks(); const d=window.__TRx.builder.customDef(L[0]); return { antal: L.length, namn: L[0].name, rutor: L[0].cells.length, saker: L[0].stamps, varv: d.laps, ramper: d.ramps.length, hinder: d.obstacles.length, lådor: d.items.length, bus: d.movers.length, halka: d.hazards.length, turbo: d.boosts.length }; }")
        print('sparad:', info)
        assert info['namn'] == 'SNURRAN' and info['rutor'] == 16 and len(info['saker']) == 7
        # banvalet
        sc = await pg.evaluate("() => document.querySelector('#scr-bt').classList.contains('on')"); print('banskärm visas:', sc)
        await click('KÖR'); await pg.wait_for_timeout(300); await click('BLIXT'); await pg.wait_for_timeout(300)
        print('skärm efter bilval:', await pg.evaluate("() => document.querySelector('.screen.on').id"))
        await click('MELLAN'); await pg.wait_for_timeout(1500); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        race = await pg.evaluate("""() => { const G=window.__TR, f=window.__TRf; const hits={}; let n=0;
          f.keys.ArrowUp=true;
          for (let i=0;i<60*150 && G.mode!=='done';i++) { f.update(1/60); n++; if (G.finishCount>=4) break; }
          return { bana: G.T.def.name, varv: G.laps, längd: G.T.N*10, tid: +(n/60).toFixed(1), i_mål: G.finishCount, prog: G.cars.map(c=>+(c.prog/G.T.N).toFixed(2)) }; }""")
        print('lopp:', race)
        await pg.screenshot(path=SHOTS + "/bygg_lopp.png")
        # finns i banvalet och i turneringen
        cnt = await pg.evaluate("() => { window.__TRx.ui.goTracks(); return [...document.querySelectorAll('#track-grid .card')].map(b=>b.textContent.trim()).filter(t=>t.includes('SNURRAN')).length; }")
        print('i banvalet:', cnt)
        await pg.screenshot(path=SHOTS + "/bygg_banval.png")
        # turneringen tar med egna banor (de två senaste) före finalen
        await pg.evaluate("() => { window.__TRx.SETTINGS.show=false; window.__TRx.ui.buildHub(); window.__TRx.ui.showScreen('hub'); }"); await pg.wait_for_timeout(200)
        await click('TURNERING'); await pg.wait_for_timeout(200); await click('BLIXT'); await pg.wait_for_timeout(200); await click('MELLAN'); await pg.wait_for_timeout(600)
        cupt = await pg.evaluate("() => window.__TRx.cup().tracks.map(t => t.id)"); print('turneringens banor:', cupt)
        assert any(t.startswith('my_') for t in cupt) and cupt[-1] == 'final'
        pre = await pg.evaluate("() => { const C=window.__TRx.cup(), d=C.tracks[6]; const sc=window.__TRx.buildPreRace(d, 6, C.tracks.length, C.racers); return sc.filter(x=>x.lines).slice(0,3).map(x=>x.lines.map(l=>typeof l[1]==='string'?l[1]:'').join(' / ')); }"); print('tv-showen:', pre)
        saved = await pg.evaluate("() => JSON.parse(localStorage.getItem('turbo_prof')).cupSave"); print('sparad turnering:', {k: v['tracks'] for k, v in saved.items()})
        ids = await pg.evaluate("() => { window.__TRx.ui.hideUI(); const all=window.__TRx.builder.allTracks(); return all.map(d=>d.id); }")
        print('banor totalt:', len(ids))
        # sparfilen innehåller banan
        sd = await pg.evaluate("() => { const L=window.__TRx.builder.myTracks(); return JSON.parse(localStorage.getItem('turbo_prof')).mytracks; }")
        print('i profilen:', {k: [t['name'] for t in v] for k, v in sd.items() if v})
        # ändra: VÄG -> backa från flaggan öppnar slingan -> kör hem igen
        await pg.evaluate("() => window.__TRx.builder.start({ edit: 0 })"); await frames(10)
        print('ändra:', await st())
        await keys(['Digit8', 'Enter']); print('tillbaka till väg:', await st())
        await keys(['ArrowUp', 'ArrowUp']); print('backat från flaggan:', await st())
        await keys(['Enter']); await frames(120); print('kör hem själv:', await st())
        await pg.screenshot(path=SHOTS + "/bygg_andra.png")
        # pekskärm: dra med fingret på en ny bana
        await pg.evaluate("() => window.__TRx.builder.start({ theme: 'sno' })"); await frames(5)
        L = await pg.evaluate("() => { const B=window.__TRx.builder.state(); return null; }")
        cs = await pg.evaluate("() => { const u=Math.min(innerHeight/1000, innerWidth/1500), top=110*u, bot=100*u, pad=30*u; const cs=Math.min((innerWidth-2*pad)/12,(innerHeight-top-bot-pad)/8); const gw=cs*12, gh=cs*8; return [cs,(innerWidth-gw)/2, top+(innerHeight-top-bot-gh)/2]; }")
        c, ox, oy = cs
        at = lambda gx, gy: (ox + (gx + 0.5) * c, oy + (gy + 0.5) * c)
        x, y = at(3, 5); await pg.mouse.move(x, y); await pg.mouse.down()
        for gx, gy in [(4,5),(5,5),(6,5),(6,4),(6,3),(5,3),(4,3),(3,3),(3,4),(3,5)]:
            x2, y2 = at(gx, gy)
            for k in range(1, 5): await pg.mouse.move(x + (x2 - x) * k / 4, y + (y2 - y) * k / 4); await frames(2)
            x, y = x2, y2
        await pg.mouse.up(); print('dragit med fingret:', await st())
        await frames(40); await pg.screenshot(path=SHOTS + "/bygg_finger.png")
        await keys(['Escape']); await frames(5); print('esc i sakläget:', await st())
        await keys(['Escape']); await frames(5); await keys(['Escape']); await frames(5)
        print('efter esc esc:', await pg.evaluate("() => [window.__TR.mode, document.querySelector('.screen.on') && document.querySelector('.screen.on').id]"))
        print(errs or 'no errors'); await b.close()
asyncio.run(main())
