import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS, TMP, HERE
import asyncio, json
from playwright.async_api import async_playwright
DRIVE = r"""(secs) => { const G=window.__TR, f=window.__TRf; const S=G.city, car=S.car; const log=[];
 for (let i=0;i<60*secs;i++){ const S=G.city; if (S && S.phase==='brief') { S.phase='drive'; S.brief=null; } if (!S || S.phase!=='drive') break; const m=S.m;
   let tx=null;
   { const pts = S.path ? S.path.pts : null; if (pts) { for (const p of pts.slice(1)) { if (Math.hypot(p[0]-car.x,p[1]-car.y) > 100) { tx=p; break; } } if (!tx) tx = pts[pts.length-1]; } }
   if (i % 120 === 0) log.push([Math.round(car.x), Math.round(car.y), Math.round(car.fs), tx && tx.map(Math.round)].join(' '));
   if (tx) { let d=Math.atan2(tx[1]-car.y, tx[0]-car.x)-car.a; d=Math.atan2(Math.sin(d),Math.cos(d)); const dist=Math.hypot(tx[0]-car.x,tx[1]-car.y); const last = m && m.type!=='pol' && S.path && tx===S.path.pts[S.path.pts.length-1];
     f.keys.ArrowLeft=d<-0.08; f.keys.ArrowRight=d>0.08; const want = last ? Math.min(300, dist*1.2) : (Math.abs(d)>0.6?150:(m&&m.type==='amb'&&m.stage==='hospital'?260:330)); f.keys.ArrowUp = car.fs < want && Math.abs(d) < 2.2; f.keys.ArrowDown = car.fs > want+60 || (Math.abs(d)>=2.2); }
   if (!m || !m.gps) { if (i===30) window.__TRx.cityKey({code:'Space', key:' '}); }
   f.update(1/60); }
 for (const k in f.keys) f.keys[k]=false;
 const S2=G.city; return {phase: S2 && S2.phase, stage: S2 && S2.m && S2.m.stage, kind: S2 && S2.D && S2.D.kind, t: S2 && Math.round(S2.t), comfort: S2 && S2.m && S2.m.comfort, tl: S2 && S2.tl, veh: S2 && S2.veh.length, log: (S2 && S2.phase==='drive') ? log.slice(-6) : null}; }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1512,"height":945})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(900)
        hide="() => { document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on')); document.getElementById('ui').classList.remove('on'); }"
        async def run(mode, n, tag):
            await pg.evaluate(hide); await pg.evaluate(f"() => window.__TRx.startCity('{mode}')"); await pg.wait_for_timeout(200)
            await pg.evaluate("() => { const f=window.__TRf; for(let i=0;i<60*3;i++) f.update(1/60); }")
            await pg.screenshot(path=f"{SHOTS}/{tag}_start.png")
            for k in range(n):
                for leg in range(3):
                    r = await pg.evaluate(DRIVE, 150); print(mode, k, leg, r)
                    if r['phase']=='deliver' and r['kind']=='pizza':
                        await pg.evaluate("() => { const f=window.__TRf; for(let i=0;i<100;i++) f.update(1/60); const S=window.__TR.city, x=window.__TRx; if (S.m.level<5) { S.D.sel=S.D.right; x.cityKey({code:'Enter',key:'Enter'}); } else { for (const ch of S.m.foods[0]) x.cityKey({code:'Key', key: ch.toLowerCase()}); } for(let i=0;i<60*3.5;i++) f.update(1/60); }")
                    elif r['phase']=='deliver':
                        await pg.evaluate("() => { const f=window.__TRf; for(let i=0;i<60*1.6;i++) f.update(1/60); }")
                        await pg.screenshot(path=f"{SHOTS}/{tag}_scene{k}_{leg}.png")
                        await pg.evaluate("() => { const f=window.__TRf; for(let i=0;i<60*3;i++) f.update(1/60); }")
                    ph = await pg.evaluate("() => window.__TR.city.phase")
                    if ph=='result': break
                print('res', await pg.evaluate("() => { const S=window.__TR.city; return S.phase + ' ' + JSON.stringify(S.res && {s:S.res.stars,c:S.res.coins,h:S.res.hero}); }"))
                await pg.screenshot(path=f"{SHOTS}/{tag}_res{k}.png")
                await pg.evaluate("() => window.__TRx.cityKey({code:'Enter', key:'Enter'})")
            await pg.evaluate("() => window.__TRx.cityKey({code:'Escape', key:'Escape'})"); await pg.wait_for_timeout(200)
        await run('amb', 3, 'amb')
        await run('pol', 2, 'pol')
        # full trafik
        await pg.evaluate("() => { const P=JSON.parse(localStorage.getItem('turbo_prof')); const pl=P.players['_']; pl.city.pizza=[3,3,3,3,3]; localStorage.setItem('turbo_prof', JSON.stringify(P)); }")
        await pg.reload(); await pg.wait_for_timeout(900)
        await run('pizza', 3, 'tp')
        await pg.evaluate(hide); await pg.evaluate("() => window.__TRx.startCity('free')")
        for k,(x,y,a) in enumerate([(1160,1160+300,-1.57),(1160*2,1160*2+300,-1.57),(1160*4,1160*4+300,-1.57)]):
            await pg.evaluate(f"() => {{ const G=window.__TR, c=G.city.car; c.x={x}; c.y={y}; c.a={a}; c.vx=c.vy=0; G.cam.x=c.x; G.cam.y=c.y; G.cam.a=c.a; for(let i=0;i<60*4;i++) window.__TRf.update(1/60); }}")
            await pg.screenshot(path=f"{SHOTS}/traffic{k}.png")
        print(errs or 'no errors'); await b.close()
asyncio.run(main())
