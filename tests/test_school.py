import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _paths import URL, SHOTS, TMP, HERE
import asyncio
from playwright.async_api import async_playwright
BOT = r"""async (ci) => {
 const G=window.__TR, f=window.__TRf, S=window.__TRs; S.startSchool(ci); G.mode='countdown'; G.brief=null;
 for (let i=0;i<260;i++) f.update(1/60);
 const T=G.T, cl=T.cl, N=T.N, c=G.player, sch=G.school; const id=sch.ch.id;
 const steerTo=(lane,ahead=18)=>{ const j=(c.idx+ahead)%N; const tx=cl.px[j]+cl.nx[j]*lane, ty=cl.py[j]+cl.ny[j]*lane; let d=Math.atan2(ty-c.y,tx-c.x)-c.a; d=Math.atan2(Math.sin(d),Math.cos(d)); f.keys.ArrowLeft=d<-0.08; f.keys.ArrowRight=d>0.08; };
 for (let i=0;i<60*90 && G.mode!=='done';i++){
   f.keys.ArrowUp=false; f.keys.ArrowDown=false;
   if(id==='ljus'){ steerTo(0); const L=sch.lights.find(l=>!l.done); if(L && L.state==='red'){ if(c.fs>0) f.keys.ArrowDown=true; } else f.keys.ArrowUp=c.fs<420; }
   else if(id==='plattor'){ const p=sch.pads.find(p=>!p.hit && p.i>c.idx); const lat=p? ((p.x-cl.px[p.i])*cl.nx[p.i]+(p.y-cl.py[p.i])*cl.ny[p.i]) : 0; steerTo(lat,12); f.keys.ArrowUp=c.fs<330; }
   else if(id==='bro'){ steerTo(sch.cen? (c.idx>=sch.i0-10 && c.idx<=sch.i1+5 ? sch.cen(c.idx+10):0):0, 10); f.keys.ArrowUp=c.fs<230; }
   else if(id==='lava'){ const rows=[[70,-110,-10],[115,10,110],[160,-110,110],[205,-60,60],[250,-110,0],[295,0,110]]; const r=rows.find(r=>r[0]>c.idx-5); let lane=0; if(r){ const blocked=[r[1],r[2]]; lane = [[-110,-10],[10,110]].includes(0)?0:0; const cands=[-120,-60,0,60,120].filter(x=>blocked.every(b=>Math.abs(x-b)>95)); lane=cands.sort((a,b)=>Math.abs(a-c.lat)-Math.abs(b-c.lat))[0]||0; } steerTo(lane,12); f.keys.ArrowUp=c.fs<300; }
   else if(id==='is'){ const g=sch.gates.find(g=>!g.state); steerTo(g? g.lat:0, 14); f.keys.ArrowUp = c.fs<220; }
   else if(id==='jakt'){ const r=sch.thief; let d=Math.atan2(r.y-c.y,r.x-c.x)-c.a; d=Math.atan2(Math.sin(d),Math.cos(d)); const dd=Math.hypot(r.x-c.x,r.y-c.y); if(dd<400){ f.keys.ArrowLeft=d<-0.08; f.keys.ArrowRight=d>0.08; } else steerTo(0,20); f.keys.ArrowUp=true; }
   else if(id==='raket'){ steerTo(0); f.keys.ArrowUp = G.mode==='countdown' ? G.countdown < 0.15 : c.fs < 300; }
   else if(id==='bromsdrift'){ const cur=Math.atan2(Math.sin(cl.ang[(c.idx+20)%N]-cl.ang[c.idx]),Math.cos(cl.ang[(c.idx+20)%N]-cl.ang[c.idx])); const j=(c.idx+16)%N; let d=Math.atan2(cl.py[j]-c.y,cl.px[j]-c.x)-c.a; d=Math.atan2(Math.sin(d),Math.cos(d)); f.keys.ArrowUp=true; if(Math.abs(cur)>0.25 && d*cur>-0.25){ f.keys.ArrowLeft=cur<0; f.keys.ArrowRight=cur>0; if(!c.bDrift && c.fs>380 && (i%20)<2){ f.keys.ArrowDown=true; f.keys.ArrowUp=false; } } else { f.keys.ArrowLeft=d<-0.1; f.keys.ArrowRight=d>0.1; } }
   else if(id==='drift'){ const cur=Math.atan2(Math.sin(cl.ang[(c.idx+20)%N]-cl.ang[c.idx]),Math.cos(cl.ang[(c.idx+20)%N]-cl.ang[c.idx])); const j=(c.idx+16)%N; let d=Math.atan2(cl.py[j]-c.y,cl.px[j]-c.x)-c.a; d=Math.atan2(Math.sin(d),Math.cos(d)); f.keys.ArrowUp=true; if(Math.abs(cur)>0.25 && Math.abs(c.lat)<G.T.hw*0.7){ f.keys.ArrowLeft=cur<0; f.keys.ArrowRight=cur>0; } else { f.keys.ArrowLeft=d<-0.1; f.keys.ArrowRight=d>0.1; } }
   f.update(1/60);
 }
 f.keys.ArrowUp=f.keys.ArrowDown=f.keys.ArrowLeft=f.keys.ArrowRight=false;
 await new Promise(r=>setTimeout(r,600));
 return {id, mode:G.mode, time:+sch.time.toFixed(1), stars: document.querySelectorAll('#sres-stars span.on').length, msg: document.querySelector('#sres-msg').textContent};
}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1512,"height":945})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(900)
        ids = await pg.evaluate("() => window.__TRs.CHALLENGES.map(c=>c.id)")
        print(ids)
        for cid in ['raket','ljus','plattor','bro','lava','is','drift','bromsdrift','jakt']:
            r = await pg.evaluate(BOT, ids.index(cid)); print(r)
        print(errs or "no errors"); await b.close()
asyncio.run(main())
