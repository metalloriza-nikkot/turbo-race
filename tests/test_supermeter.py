import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS, TMP, HERE
import asyncio
from playwright.async_api import async_playwright
JS = r"""(tr) => { const x=window.__TRx,G=window.__TR,f=window.__TRf; x.startRace(x.TRACK_DEFS[tr], {me:{car:0,name:'T',fig:x.DEFAULT_FIG}, opps:x.pickOpps(0), diff:x.DIFFS[3]}); if (G.mode==='gift') { G.gift.picked=0; G.gift.pt=2; } for(let i=0;i<250;i++) f.update(1/60);
 const ready=[]; for(let i=0;i<60*400 && G.mode!=='done' && G.mode!=='finish';i++){ const c=G.player, cl=G.T.cl, N=G.T.N;
   const j=(c.idx+20)%N; let d=Math.atan2(cl.py[j]-c.y, cl.px[j]-c.x)-c.a; d=Math.atan2(Math.sin(d),Math.cos(d));
   const cur=Math.atan2(Math.sin(cl.ang[(c.idx+22)%N]-cl.ang[c.idx]),Math.cos(cl.ang[(c.idx+22)%N]-cl.ang[c.idx]));
   f.keys.ArrowUp=true; if (Math.abs(cur)>0.3 && d*cur>-0.25) { f.keys.ArrowLeft=cur<0; f.keys.ArrowRight=cur>0; } else { f.keys.ArrowLeft = d < -0.15; f.keys.ArrowRight = d > 0.15; }
   f.update(1/60); if (c.meterReady) { ready.push(Math.round(G.raceT)+'s/lap'+(Math.floor(c.prog/N)+1)); f.useSuper(c); } }
 for (const k in f.keys) f.keys[k]=false; return G.T.def.id+' race '+Math.round(G.raceT)+'s supers at '+ready.join(', '); }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        await pg.goto(URL); await pg.wait_for_timeout(800)
        for tr in range(6): print(await pg.evaluate(JS, tr))
        await b.close()
asyncio.run(main())
