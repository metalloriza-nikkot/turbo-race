import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS, TMP, HERE
import asyncio, sys
from playwright.async_api import async_playwright
exec(open(os.path.join(HERE, 'ux_measure.py')).read().split('async def main')[0])
VP=[tuple(map(int,v.split('x'))) for v in (sys.argv[1] if len(sys.argv)>1 else '1000x625').split(',')]
OUT=sys.argv[2] if len(sys.argv)>2 else os.path.join(SHOTS, 'ux'); os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for (w,h) in VP:
            pg=await b.new_page(viewport={"width":w,"height":h}); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(URL); await pg.wait_for_timeout(600)
            await pg.evaluate("""() => { const P=window.__TRx.ui.PROF(); P.pin=P.pin||'1234'; const f={skin:1,hair:2,hairCol:1,eyes:0,beard:0,mouth:0,suit:2}; P.opps=[]; for (let i=0;i<6;i++) P.opps.push({name:'FARFAR '+i, fig:f, car:'blixt'}); }""")
            click = lambda txt: pg.evaluate(f"() => {{ const b=[...document.querySelectorAll('.screen.on .nav')].find(b=>b.textContent.includes('{txt}')); if(!b) throw new Error('no btn {txt}'); b.click(); }}")
            res=[]
            async def m(name, js=None, wait=450):
                if js: await pg.evaluate("() => { const U=window.__TRx.ui; "+js+" }")
                await pg.wait_for_timeout(wait)
                r=await pg.evaluate(MEASURE); r and r.update({'name':name}); res.append(r)
                await pg.evaluate("() => { const s=document.querySelector('.screen.on'); if(s) s.scrollTop=0; }"); await pg.wait_for_timeout(150)
                await pg.screenshot(path=f"{OUT}/{w}x{h}_{name}.png")
            await m('title', "U.showScreen('title')")
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
            await m('hub', "U.buildHub(); U.showScreen('hub')")
            await m('garage', "U.buildGarage(); U.showScreen('garage')")
            await m('opps', "U.buildOpps(); U.showScreen('opps')")
            await m('fig', "U.openFigEditor('opp', 0)")
            await m('shop', "U.SEL.shopTab='paint'; U.buildShop(); U.showScreen('shop')")
            await m('driver', "U.goDrivers()")
            await m('track', "U.goTracks()")
            await m('diff', "U.showScreen('diff')")
            await m('school', "U.buildSchool(); U.showScreen('school')")
            await m('city', "U.buildCityMenu(); U.showScreen('city')")
            await m('license', "U.showLicense()")
            await m('name', "U.showScreen('name')")
            await pg.evaluate("() => { const L=window.__TRx.builder.myTracks(); if (!L.length) for (let k=0;k<3;k++) L.push({ id:'my_t'+k, name:['SNURRAN','KORV-KURVAN','ZICK-ZACK'][k], theme:['stad','rum','rymd'][k], cells:[[2,2],[3,2],[4,2],[5,2],[5,3],[5,4],[4,4],[3,4],[2,4],[2,3]], stamps:{}, at:1 }); }")
            await m('build', "window.__TRx.builder.openMenu()", 900)
            await m('btheme', "window.__TRx.builder.themes()")
            await m('bt', "window.__TRx.builder.openBt(0)", 700)
            await m('bname', "U.showScreen('bname')")
            await m('quiz', "U.mathQuiz({ title:'RÄKNA', story:'DU HAR 45 🪙. ROSA KOSTAR 20 🪙. HUR MÅNGA HAR DU KVAR?', q:{q:'45 − 20', ans:25, say:'', op:'−', a:45, b:20}, onDone:()=>{} })")
            await m('bonus', "U.raceMathBonus(()=>{})")
            await m('parent', "U.openParent(); document.querySelector('#pin-in').value='1234';")
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
            r=await pg.evaluate(MEASURE); r and r.update({'name':'parent-view'}); res.append(r); await pg.screenshot(path=f"{OUT}/{w}x{h}_parent-view.png")
            # lopp -> resultat
            await pg.evaluate("() => { window.__TRx.ui.hideUI(); }")
            await pg.goto(URL); await pg.wait_for_timeout(600)
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
            await click('RACE'); await pg.wait_for_timeout(200); await click('BLIXT'); await pg.wait_for_timeout(200); await click('STADEN'); await pg.wait_for_timeout(200); await click('MELLAN'); await pg.wait_for_timeout(1200)
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
            await pg.evaluate("() => { const G=window.__TR,f=window.__TRf; for(let i=0;i<300;i++) f.update(1/60); }")
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(500)
            r=await pg.evaluate(MEASURE); r and r.update({'name':'pause'}); res.append(r); await pg.screenshot(path=f"{OUT}/{w}x{h}_pause.png")
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            await pg.evaluate("() => { const G=window.__TR,f=window.__TRf; f.keys.ArrowUp=true; for(let i=0;i<60*400 && G.mode!=='finish';i++) f.update(1/60); for(let i=0;i<60*2.5;i++) f.update(1/60); f.keys.ArrowUp=false; }")
            await pg.wait_for_timeout(1500); await pg.screenshot(path=f"{OUT}/{w}x{h}_victory.png")
            await pg.evaluate("() => { const G=window.__TR,f=window.__TRf; for(let i=0;i<60*30 && G.mode!=='done';i++) f.update(1/60); }"); await pg.wait_for_timeout(700)
            await m('bonus2'); 
            try: await click('HOPPA')
            except Exception: pass
            await pg.wait_for_timeout(900)
            r=await pg.evaluate(MEASURE); r and r.update({'name':'result'}); res.append(r); await pg.screenshot(path=f"{OUT}/{w}x{h}_result.png")
            bad=[f"{r['name']}(skroll {r['scroll']}{' TOPP-'+str(r['cutTop']) if r['cutTop'] else ''}{' tb' if r['topbarHit'] else ''})" for r in res if r and (r['scroll']>0 or r['cutTop'] or r['topbarHit'])]
            print(f"{w}x{h}:", ', '.join(bad) or 'allt får plats', errs[:2] or '')
            await pg.close()
        await b.close()
asyncio.run(main())
