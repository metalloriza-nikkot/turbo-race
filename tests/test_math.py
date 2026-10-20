import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS, TMP, HERE
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1512,"height":945})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(900)
        click = lambda txt: pg.evaluate(f"() => {{ const b=[...document.querySelectorAll('.screen.on .nav')].find(b=>b.textContent.includes('{txt}')); if(!b) throw new Error('no btn {txt}'); b.click(); }}")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=SHOTS+"/v16_hub.png")
        await click('GARAGET'); await pg.wait_for_timeout(300); await pg.screenshot(path=SHOTS+"/v16_garage.png")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await click('RACE'); await pg.wait_for_timeout(300); await click('BLIXT'); await pg.wait_for_timeout(300); await click('STADEN'); await pg.wait_for_timeout(300); await click('MELLAN'); await pg.wait_for_timeout(1500)
        print('mode', await pg.evaluate("() => window.__TR.mode"))
        await pg.screenshot(path=SHOTS+"/v16_gift.png")
        await pg.keyboard.press("ArrowRight"); await pg.wait_for_timeout(200); await pg.keyboard.press("Space"); await pg.wait_for_timeout(800)
        await pg.screenshot(path=SHOTS+"/v16_gift_sound.png")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(600); await pg.screenshot(path=SHOTS+"/v16_gift_open.png"); await pg.wait_for_timeout(800)
        print('after gift', await pg.evaluate("() => [window.__TR.mode, window.__TR.player.item]"))
        await pg.evaluate("() => { const G=window.__TR,f=window.__TRf; f.keys.ArrowUp=true; for(let i=0;i<60*400 && G.mode!=='done';i++) f.update(1/60); f.keys.ArrowUp=false; }")
        await pg.wait_for_timeout(500); print('screen', await pg.evaluate("() => document.querySelector('.screen.on').id")); await pg.screenshot(path=SHOTS+"/v16_bonus.png")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(600); await pg.screenshot(path=SHOTS+"/v16_quiz.png")
        ans = await pg.evaluate("() => { return window.__TRx ? null : null; }")
        q = await pg.evaluate("() => document.querySelector('#quiz-q').textContent")
        print('question', q)
        await click('HJÄLP'); await pg.wait_for_timeout(300); await pg.screenshot(path=SHOTS+"/v16_quiz_help.png")
        # räkna ut svaret och skriv det
        import re
        m = re.match(r'(\d+) (.) (\d+)', q) ; 
        if m:
            a,op,bb = int(m.group(1)), m.group(2), int(m.group(3)); ansv = a+bb if op=='+' else a-bb if op=='−' else a*bb
        else:
            n = int(re.findall(r'\d+', q)[0]); ansv = n*2 if 'DUBBELT' in q else n//2
        for ch in str(ansv): await pg.keyboard.press("Digit"+ch)
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300); await pg.screenshot(path=SHOTS+"/v16_quiz_ok.png"); await pg.wait_for_timeout(1500)
        print('screen', await pg.evaluate("() => document.querySelector('.screen.on').id"), await pg.evaluate("() => JSON.stringify(JSON.parse(localStorage.getItem('turbo_prof')).players['_'].math)").__await__ if False else '')
        print('math', await pg.evaluate("() => { const m=JSON.parse(localStorage.getItem('turbo_prof')).players['_'].math; return [m.lvl,m.tasks,m.firstOk]; }"))
        await click('MENY'); await pg.wait_for_timeout(400)
        # butiken
        await pg.evaluate("() => { const P=JSON.parse(localStorage.getItem('turbo_prof')); P.players['_'].coins=45; localStorage.setItem('turbo_prof', JSON.stringify(P)); }")
        await pg.reload(); await pg.wait_for_timeout(800); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(300)
        await click('GARAGET'); await pg.wait_for_timeout(200); await click('BUTIK'); await pg.wait_for_timeout(300)
        await click('ROSA'); await pg.wait_for_timeout(600); await pg.screenshot(path=SHOTS+"/v16_shopq.png")
        print('shop q', await pg.evaluate("() => document.querySelector('#quiz-story').textContent + ' | ' + document.querySelector('#quiz-q').textContent"))
        await pg.keyboard.press("Digit2"); await pg.keyboard.press("Digit5"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(1800)
        print('after shop', await pg.evaluate("() => [document.querySelector('.screen.on').id, JSON.parse(localStorage.getItem('turbo_prof')).players['_'].coins, JSON.parse(localStorage.getItem('turbo_prof')).players['_'].owned.paint.join()]"))
        # staden jättesvårt
        await pg.evaluate("() => { document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on')); document.getElementById('ui').classList.remove('on'); window.__TRx.startCity('pizza'); const S=window.__TR.city; S.phase='result'; S.res={t:2,stars:3,coins:10}; }")
        await pg.keyboard.press("ArrowRight"); await pg.wait_for_timeout(200); await pg.screenshot(path=SHOTS+"/v16_cityres.png")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(1200); await pg.screenshot(path=SHOTS+"/v16_cityhard.png")
        print('hard', await pg.evaluate("() => { const m=window.__TR.city.m; return [m.hard, m.level, m.foods.join('+'), m.riddle && m.riddle.text]; }"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        await click('VUXEN'); await pg.wait_for_timeout(200); await pg.keyboard.type("1234"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=SHOTS+"/v16_parent.png")
        print(errs or 'no errors'); await b.close()
asyncio.run(main())
