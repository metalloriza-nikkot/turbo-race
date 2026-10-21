"""Motståndarnas superturbo: ingen på 🐢, små doser på 🦊, hela mätaren på 🐇 och 🚀."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS
import asyncio
from playwright.async_api import async_playwright
SIM = """() => { const f=window.__TRf, G=window.__TR; f.keys.ArrowUp=true; const on={}, n={}, used={};
  for (let i=0;i<60*70;i++) { f.update(1/60); for (const c of G.cars) { if (c.isPlayer) continue; const k=c.d.id;
    if (c.superOn && !on[k]) n[k]=(n[k]||0)+1; if (c.superOn) used[k]=(used[k]||0)+1/60; on[k]=!!c.superOn; } }
  const tot=Object.values(n).reduce((a,b)=>a+b,0), sec=Object.values(used).reduce((a,b)=>a+b,0);
  return { gånger: tot, sekunder: +sec.toFixed(1), perBil: n, radio: G.radio && G.radio.lines[0][1] }; }"""
async def race(p, diff):
    b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1440, "height": 860})
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(URL); await pg.wait_for_timeout(500)
    click = lambda txt: pg.evaluate(f"() => {{ const b=[...document.querySelectorAll('.screen.on .nav')].find(b=>b.textContent.includes('{txt}')); b.click(); }}")
    await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
    await click('RACE'); await pg.wait_for_timeout(200); await click('BLIXT'); await pg.wait_for_timeout(200); await click('STADEN'); await pg.wait_for_timeout(200); await click(diff); await pg.wait_for_timeout(1200)
    await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
    r = await pg.evaluate(SIM)
    if diff == 'MELLAN':
        await pg.evaluate("() => { const f=window.__TRf, G=window.__TR; for (const c of G.cars) if (!c.isPlayer) c.meter=100; for (let i=0;i<60*40;i++) { f.update(1/60); if (G.cars.some(c=>!c.isPlayer&&c.superOn&&c.superLeft<70)) break; } }")
        await pg.evaluate("() => { const G=window.__TR, c=G.cars.find(c=>!c.isPlayer&&c.superOn); if (c) { G.cam.x=c.x; G.cam.y=c.y; } }")
        await pg.wait_for_timeout(60); await pg.screenshot(path=SHOTS + "/aisuper_mellan.png")
    await b.close(); return r, errs
async def main():
    async with async_playwright() as p:
        res = {}; allerr = []
        for d in ['LÅNGSAM', 'LAGOM', 'MELLAN', 'SNABB']:
            r, e = await race(p, d); res[d] = r; allerr += e; print(d, r)
        assert res['LÅNGSAM']['gånger'] == 0, 'motståndarna får inte superturbo på 🐢'
        assert res['LAGOM']['gånger'] > 0 and res['MELLAN']['gånger'] > 0 and res['SNABB']['gånger'] > 0, 'motståndarna ska använda superturbo från 🦊'
        assert res['LAGOM']['sekunder'] / res['LAGOM']['gånger'] < res['MELLAN']['sekunder'] / res['MELLAN']['gånger'], '🦊 ska ha kortare doser än 🐇'
        print(allerr or 'no errors')
asyncio.run(main())
