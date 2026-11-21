"""Närbild på Hajbilen och Svävaren: snett framifrån (stilla och i fart) och ovanifrån."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1400, "height": 760})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(600)
        await pg.evaluate("""() => { window.__TRx.ui.hideUI(); const X=window.__TRx; const cv=document.createElement('canvas'); cv.width=1400; cv.height=760; cv.style.cssText='position:fixed;inset:0;z-index:99'; document.body.appendChild(cv); const c=cv.getContext('2d');
          c.fillStyle='#5b6b80'; c.fillRect(0,0,1400,760);
          const cars = X.DRIVERS.filter(d => d.water);
          cars.forEach((d,i) => {
            c.save(); c.translate(230 + i*700, 250); c.scale(3.6,3.6); X.drawCarFront(c, d, 1.3, { still: true }); c.restore();
            c.save(); c.translate(500 + i*700, 250); c.scale(2.4,2.4); X.drawCarFront(c, d, 2.1, { speed: 1.2, boost: i===1 }); c.restore();
            c.save(); c.translate(330 + i*700, 590); c.scale(3.2,3.2); X.drawCar(c, d, 0.7); c.restore();
            c.fillStyle='#fff'; c.font='bold 28px Arial'; c.textAlign='center'; c.fillText(d.name + '  (design: ' + d.by + ')', 350 + i*700, 720);
          }); }""")
        await pg.wait_for_timeout(200); await pg.screenshot(path=SHOTS + "/vattenbilar.png")
        print(errs or 'no errors'); await b.close()
asyncio.run(main())
