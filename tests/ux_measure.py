import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS, TMP, HERE
import asyncio, sys, json
from playwright.async_api import async_playwright
VPS=[(1440,760),(1280,650),(1512,860),(1024,768),(1920,1000)]
MEASURE="""() => { const s=document.querySelector('.screen.on'); if(!s) return null; const H=innerHeight, W=innerWidth; s.scrollTop=0;
 const ext = () => { let maxB=0,minT=1e9,maxR=0; for (const e of s.querySelectorAll('*')) { if (!e.offsetParent) continue; let p=e.parentElement, inner=false; while (p && p!==s) { const o=getComputedStyle(p).overflowY; if (o==='auto'||o==='scroll') { inner=true; break; } p=p.parentElement; } if (inner) continue; const r=e.getBoundingClientRect(); if (!r.width||!r.height) continue; maxB=Math.max(maxB,r.bottom); minT=Math.min(minT,r.top); maxR=Math.max(maxR,r.right); } return {maxB,minT,maxR}; };
 const a=ext(); const tb=document.querySelector('#topbar').getBoundingClientRect();
 let hit=0; for (const e of s.querySelectorAll('h2, .nav:not(#topbar .nav)')) { const r=e.getBoundingClientRect(); if (r.width && r.right>tb.left && r.top<tb.bottom && r.bottom>tb.top) hit++; }
 const need = s.scrollHeight - s.clientHeight; s.scrollTop = 1e6; const b=ext(); s.scrollTop=0;
 return {id:s.id, cutTop: Math.round(Math.max(0,-a.minT)), cutBottom: Math.round(Math.max(0, b.maxB-H)), right: Math.round(Math.max(0,a.maxR-W)), scroll: need, topbarHit: hit}; }"""
async def main():
    shotdir = sys.argv[1] if len(sys.argv)>1 else None
    async with async_playwright() as p:
        b=await p.chromium.launch()
        allres={}
        for (w,h) in VPS:
            pg=await b.new_page(viewport={"width":w,"height":h}); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(URL); await pg.wait_for_timeout(600)
            await pg.evaluate("""() => { const P=window.__TRx.ui.PROF(); P.pin=P.pin||'1234'; const f={skin:1,hair:2,hairCol:1,eyes:0,beard:0,mouth:0,suit:2}; P.opps=[]; for (let i=0;i<9;i++) P.opps.push({name:'FARFAR '+i, fig:f, car:'blixt'}); }""")
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
            res=[]
            async def m(name, js=None, wait=350):
                if js: await pg.evaluate("() => { const U=window.__TRx.ui; "+js+" }")
                await pg.wait_for_timeout(wait)
                r=await pg.evaluate(MEASURE); r and r.update({'name':name}); res.append(r)
                if shotdir and r and r['scroll']>0: await pg.screenshot(path=f"{shotdir}/{w}x{h}_{name}.png")
            await m('title', "U.showScreen('title')")
            await m('hub', "U.buildHub(); U.showScreen('hub')")
            await m('garage', "U.buildGarage(); U.showScreen('garage')")
            await m('opps', "U.buildOpps(); U.showScreen('opps')")
            await m('fig-player', "U.openFigEditor('player')")
            await m('fig-opp', "U.openFigEditor('opp', 0)")
            for t in ['paint','sticker','horn']:
                await m('shop-'+t, f"U.SEL.shopTab='{t}'; U.buildShop(); U.showScreen('shop')")
            await m('driver', "U.goDrivers()")
            await m('track', "U.goTracks()")
            await m('diff', "U.showScreen('diff')")
            await m('school', "U.buildSchool(); U.showScreen('school')")
            await m('city', "U.buildCityMenu(); U.showScreen('city')")
            await m('license', "U.showLicense()")
            await m('name', "U.showScreen('name')")
            await m('quiz', "U.mathQuiz({ title:'RÄKNA', story:'DU HAR 45 🪙. ROSA KOSTAR 20 🪙. HUR MÅNGA HAR DU KVAR?', q:{q:'45 − 20', ans:25, say:'', op:'−', a:45, b:20}, onDone:()=>{} })")
            await m('bonus', "U.raceMathBonus(()=>{})")
            await m('parent', "U.openParent(); document.querySelector('#pin-in').value='1234';")
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
            r=await pg.evaluate(MEASURE); r and r.update({'name':'parent-view'}); res.append(r)
            allres[f"{w}x{h}"]=res
            if errs: print('ERR', w,h, errs[:2])
            await pg.close()
        for k,res in allres.items():
            bad=[f"{r['name']}(top-{r['cutTop']} bot-{r['cutBottom']} right-{r['right']} tb{r['topbarHit']})" for r in res if r and (r['cutTop'] or r['cutBottom'] or r['right'] or r['topbarHit'])]
            sc=[f"{r['name']}:{r['scroll']}" for r in res if r and r['scroll']>0]
            print(k, 'FEL:', ', '.join(bad) if bad else 'inga', '| skroll:', ', '.join(sc))
        await b.close()
asyncio.run(main())
