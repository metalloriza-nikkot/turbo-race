import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS, TMP, HERE
import asyncio, json
from playwright.async_api import async_playwright
DRIVE = open(os.path.join(HERE, 'test_city.py')).read().split('DRIVE = r"""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1512,"height":945})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(900)
        hide="() => { document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on')); document.getElementById('ui').classList.remove('on'); }"
        await pg.evaluate(hide); await pg.evaluate("() => window.__TRx.startCity('pizza')"); await pg.wait_for_timeout(300)
        for k in range(8):
            info = await pg.evaluate("() => { const m=window.__TR.city.m; return {lvl:m.level, foods:m.foods, riddle:m.riddle&&m.riddle.text, lower:m.lower, hunt:m.hunt, dictate:m.dictate, place:m.place.id}; }")
            print('mission', k, info)
            await pg.screenshot(path=f"{SHOTS}/v15_brief{k}.png")
            r = await pg.evaluate(DRIVE, 200); print('  drive', {x:r[x] for x in ['phase','kind','t']})
            if r['phase']!='deliver': print('  NOT ARRIVED', r.get('log')); break
            await pg.evaluate("() => { const f=window.__TRf; for(let i=0;i<100;i++) f.update(1/60); }")
            await pg.screenshot(path=f"{SHOTS}/v15_door{k}.png")
            await pg.evaluate("() => { const f=window.__TRf; const S=window.__TR.city, x=window.__TRx; if (S.m.level<5) { S.D.sel=(S.D.right+1)%3; x.cityKey({code:'Enter',key:'Enter'}); S.D.sel=S.D.right; x.cityKey({code:'Enter',key:'Enter'}); } else { x.cityKey({code:'KeyQ',key:'q'}); for (const ch of S.m.foods[0]) x.cityKey({code:'Key', key: ch.toLowerCase()}); } for(let i=0;i<60*3.5;i++) f.update(1/60); }")
            rd = await pg.evaluate("() => { const P=JSON.parse(localStorage.getItem('turbo_prof')); const r=P.players['_'].read; return {lvl:r.lvl, streak:r.streak, miss:r.miss, tasks:r.tasks, firstOk:r.firstOk}; }")
            print('  read', rd)
            await pg.evaluate("() => window.__TRx.cityKey({code:'Enter', key:'Enter'})")
        # nivå 5 -> gåtor
        await pg.evaluate("() => { const P=JSON.parse(localStorage.getItem('turbo_prof')); P.players['_'].read.lvl=5; P.players['_'].read.custom=['LAMPA','SKATE']; localStorage.setItem('turbo_prof', JSON.stringify(P)); }")
        await pg.reload(); await pg.wait_for_timeout(800); await pg.evaluate(hide)
        await pg.evaluate("() => window.__TRx.startCity('pizza')"); await pg.wait_for_timeout(300)
        for k in range(6):
            info = await pg.evaluate("() => { const m=window.__TR.city.m; return {lvl:m.level, foods:m.foods, riddle:m.riddle&&m.riddle.text, lower:m.lower, dictate:m.dictate}; }")
            print('L5 mission', info); await pg.screenshot(path=f"{SHOTS}/v15_L5_{k}.png")
            await pg.evaluate("() => { const S=window.__TR.city; S.m.story=-1; window.__TRx.cityKey({code:'Space',key:' '}); }"); await pg.wait_for_timeout(700)
            await pg.screenshot(path=f"{SHOTS}/v15_sound{k}.png")
            await pg.evaluate("() => { const S=window.__TR.city; S.phase='result'; S.res={t:5,stars:3,coins:0}; window.__TRx.cityKey({code:'Enter',key:'Enter'}); }")
        # föräldravy
        await pg.evaluate("() => { window.__TRx.cityKey({code:'Escape',key:'Escape'}); }"); await pg.wait_for_timeout(400)
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await pg.evaluate("() => [...document.querySelectorAll('.screen.on .nav')].find(b=>b.textContent.includes('VUXEN')).click()"); await pg.wait_for_timeout(300)
        await pg.keyboard.type("1234"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        print('screen', await pg.evaluate("() => document.querySelector('.screen.on').id"))
        await pg.screenshot(path=SHOTS+"/v15_parent.png")
        # race med gyllene bokstäver
        await pg.evaluate(hide); await pg.evaluate("() => { const x=window.__TRx; x.startRace(x.TRACK_DEFS[0], {me:{car:0,name:'T',fig:x.DEFAULT_FIG}, opps:x.pickOpps(0), diff:x.DIFFS[0]}); }")
        print('letters', await pg.evaluate("() => { const G=window.__TR, f=window.__TRf; f.keys.ArrowUp=true; for(let i=0;i<60*120 && G.mode!=='done';i++) f.update(1/60); f.keys.ArrowUp=false; return G.letters.filter(l=>l.got).length + '/' + G.letters.length; }"))
        print(errs or 'no errors'); await b.close()
asyncio.run(main())
