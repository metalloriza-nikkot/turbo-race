import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS, TMP, HERE
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1512,"height":945})
        await pg.goto(URL); await pg.wait_for_timeout(700)
        r = await pg.evaluate("""() => { const X=window.__TRx, G=window.__TR, f=window.__TRf; X.startCity('pizza'); const S=G.city, C=S.C;
          const out=[];
          for (const dest of ['roda','blaa','gula','posten']) {
            const m=S.m; m.place=C.places[dest]; m.hunt=true; m.gps=true; m.t=0; m.nearT=0; m.allow=999; S.phase='drive'; S.path=null; S.pathT=0;
            // kör längs en slinga av vägar och logga var den jagade vägen slutar
            const pts=[[0,0],[5*1160,0],[5*1160,5*1160],[0,5*1160],[0,2*1160],[4*1160,2*1160],[4*1160,4*1160]];
            const ends=new Set(); let bad=0;
            for (let s=0;s<pts.length-1;s++){ const [x0,y0]=pts[s],[x1,y1]=pts[s+1]; const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/40);
              for(let k=0;k<n;k++){ const car=S.car; car.x=x0+(x1-x0)*k/n; car.y=y0+(y1-y0)*k/n; car.vx=car.vy=0; car.fs=0; S.pathT=0; X.cityUpdateHook ? 0 : 0; f.update(1/60);
                if (!S.path) continue; const full=window.__TRx.cityPath(C,car.x,car.y,m.place.bay); const want = full.pts.length>2? full.pts[full.pts.length-2]: null; const got = S.path.pts.length>1? S.path.pts[S.path.pts.length-1]:null;
                if (got) { const d=Math.hypot(got[0]-m.place.bay.x,got[1]-m.place.bay.y); if (d>1300) bad++; if (want && (want[0]!==got[0]||want[1]!==got[1])) window.__diff=(window.__diff||0)+1; } } }
            out.push(dest+': rutten slutar >1 kvarter från målet '+bad+' gånger');
          } out.push('olika från kortaste: '+(window.__diff||0)); return out; }""")
        print(r); await b.close()
asyncio.run(main())
