import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS, TMP, HERE
import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1500,"height":1000})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(600)
        t = float(sys.argv[1]) if len(sys.argv)>1 else 1.0
        await pg.evaluate("""(t) => { window.__TRx.ui.hideUI(); const X=window.__TRx; const cv=document.createElement('canvas'); cv.width=1500; cv.height=1000; cv.style.cssText='position:fixed;inset:0;z-index:99'; document.body.appendChild(cv); const c=cv.getContext('2d');
          c.fillStyle='#3f4a5a'; c.fillRect(0,0,1500,1000);
          X.DRIVERS.forEach((d,i)=>{ const col=i%5, row=Math.floor(i/5); c.save(); c.translate(150+col*300, 230+row*320); c.scale(2.0,2.0); X.drawCarFront(c,d,t,{boost:i%4===0}); c.restore(); c.fillStyle='#fff'; c.font='bold 18px Arial'; c.textAlign='center'; c.fillText(d.name,150+col*300,290+row*320); });
        }""", t)
        await pg.wait_for_timeout(200); await pg.screenshot(path=SHOTS+"/v18_front.png")
        print(errs or 'no errors'); await b.close()
asyncio.run(main())
