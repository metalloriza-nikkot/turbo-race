"""Liams vattenfarkoster: Hajbilen och Svävaren halkar inte i pölar/saft utan får en plask-turbo,
hajen dyker (bara fenan syns), svävaren fiskar, och båda kan köra i floden i Turbostaden. Vanliga bilar kan inte."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1280, "height": 800})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(600)
        click = lambda txt: pg.evaluate(f"() => {{ const b=[...document.querySelectorAll('.screen.on .nav')].find(b=>b.textContent.includes('{txt}')); if(!b) throw new Error('ingen {txt}'); b.click(); }}")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        await pg.evaluate("() => { window.__TRx.SETTINGS.show=false; }")
        # ---- lopp i STADEN: bilen ställs mitt i en pöl ----
        PUDDLE = """(id) => { const G=window.__TR, f=window.__TRf, X=window.__TRx, P=G.player; P.d = X.DRIVERS.find(d=>d.id===id) || P.d;
          const h = G.T.hazards.find(h => h.kind==='puddle' || h.kind==='saft'); const a = Math.atan2(h.y-P.y, h.x-P.x);
          const cl=G.T.cl; let bi=0, bd=1e18; for (let i=0;i<cl.N;i++){ const d=(cl.px[i]-h.x)**2+(cl.py[i]-h.y)**2; if (d<bd){bd=d;bi=i;} }
          P.idx = bi; P.prog = Math.max(P.prog, bi); P.a = cl.ang[bi]; P.x = h.x; P.y = h.y; P.vx = Math.cos(P.a)*300; P.vy = Math.sin(P.a)*300; P.wet=false; P.splashCool=0; P.fishCool=0; P.boost=0; P.spin=0; P.air=0;
          f.keys.ArrowUp = true; let wet=false, boost=false, slip=false;
          for (let i=0;i<6;i++){ f.update(1/60); wet = wet || P.wet; boost = boost || P.boost>0; }
          f.keys.ArrowUp=false; return { bil: P.d.name, yta: P.surf, blöt: wet, plaskturbo: boost, fisk: +(P.fishT||0).toFixed(1), lina: !!P.rope }; }"""
        for car, track in [('haj', 'STADEN'), ('svavare', 'VARDAGS'), ('blixt', 'STADEN')]:
            await pg.evaluate("() => { window.__TRx.ui.buildHub(); window.__TRx.ui.showScreen('hub'); }"); await pg.wait_for_timeout(150)
            await click('RACE'); await pg.wait_for_timeout(150); await click('BLIXT'); await pg.wait_for_timeout(150); await click(track); await pg.wait_for_timeout(150); await click('MELLAN'); await pg.wait_for_timeout(1200)
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200)
            await pg.evaluate("() => { const f=window.__TRf; for(let i=0;i<60*5;i++) f.update(1/60); }")
            r = await pg.evaluate(PUDDLE, car); print('pöl:', r)
            if car == 'blixt': assert not r['blöt']
            else: assert r['blöt'] and r['plaskturbo']
            if car == 'svavare': assert r['fisk'] > 0 and r['lina']
            await pg.evaluate("() => { const f=window.__TRf; for(let i=0;i<8;i++) f.update(1/60); }"); await pg.wait_for_timeout(120)
            await pg.screenshot(path=f"{SHOTS}/vatten_{car}_pol.png")
        # ---- Turbostaden: kör rakt mot floden ----
        hide = "() => { document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on')); document.getElementById('ui').classList.remove('on'); }"
        RIVER = """(id) => { const G=window.__TR, f=window.__TRf, X=window.__TRx, S=G.city, car=S.car, C=S.C; car.d = X.DRIVERS.find(d=>d.id===id);
          const w = C.water.slice().sort((a,b)=>(b.x1-b.x0)-(a.x1-a.x0))[0]; const x = (w.x0+w.x1)/2; car.x = x; car.y = w.y0 - 140; car.a = Math.PI/2; car.vx=0; car.vy=0; car.fs=0; S.phase='drive'; S.brief=null;
          f.keys.ArrowUp = true; let wet=false, maxv=0; for (let i=0;i<60*1.6;i++){ f.update(1/60); wet = wet || car.wet; if (car.wet) maxv=Math.max(maxv, Math.round(car.fs)); }
          f.keys.ArrowUp=false; return { bil: car.d.name, över: car.y > w.y1, blöt: wet, fart: maxv, fisk: +(car.fishT||0).toFixed(1) }; }"""
        for car in ['haj', 'svavare', 'blixt']:
            await pg.evaluate(hide); await pg.evaluate("() => window.__TRx.startCity('pizza')"); await pg.wait_for_timeout(200)
            await pg.evaluate("() => { const f=window.__TRf; for(let i=0;i<60*2;i++) f.update(1/60); }")
            r = await pg.evaluate(RIVER, car); print('floden:', r)
            if car == 'blixt': assert not r['över'] and not r['blöt']
            else: assert r['över'] and r['blöt']
            await pg.evaluate("""() => { const G=window.__TR, f=window.__TRf, S=G.city, car=S.car, C=S.C; const w = C.water.slice().sort((a,b)=>(b.x1-b.x0)-(a.x1-a.x0))[0]; car.x=(w.x0+w.x1)/2+200; car.y=(w.y0+w.y1)/2; car.a=0; car.vx=150; car.vy=0; car.fs=150; car.wet=false; for(let i=0;i<60*0.5;i++) f.update(1/60); }""")
            await pg.wait_for_timeout(120); await pg.screenshot(path=f"{SHOTS}/vatten_{car}_floden.png")
            await pg.evaluate("() => window.__TRx.cityKey && 0")
        print(errs or 'no errors'); await b.close()
asyncio.run(main())
