"""Ritar appikonerna (180, 192, 512 px) med spelets egen bilritning. Körs vid behov: python3 tools/make_icons.py"""
import asyncio, base64, os
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'TURBO-RACE.html')); await pg.wait_for_timeout(600)
        for size in (180, 192, 512):
            data = await pg.evaluate("""(S) => { const X = window.__TRx, cv = document.createElement('canvas'); cv.width = cv.height = S; const c = cv.getContext('2d'), k = S / 512;
              const g = c.createRadialGradient(S * 0.5, S * 0.42, S * 0.05, S * 0.5, S * 0.5, S * 0.75); g.addColorStop(0, '#4a2bb0'); g.addColorStop(1, '#14082e'); c.fillStyle = g; c.fillRect(0, 0, S, S);
              c.save(); c.translate(S / 2, S / 2); c.rotate(-0.35); for (let i = -3; i <= 3; i++) { c.fillStyle = i % 2 ? 'rgba(255,214,0,0.10)' : 'rgba(255,255,255,0.05)'; c.fillRect(-S, i * 70 * k, S * 2, 34 * k); } c.restore();
              c.save(); c.translate(S * 0.52, S * 0.6); c.scale(3.1 * k, 3.1 * k); X.drawCarFront(c, X.DRIVERS[0], 1.3, { speed: 1, boost: true }); c.restore();
              c.save(); c.translate(S / 2, S * 0.24); c.rotate(-0.06); c.font = `italic 900 ${118 * k}px "Arial Black", Arial, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
              c.lineWidth = 22 * k; c.strokeStyle = '#3e1f00'; c.strokeText('TURBO', 0, 0); c.lineWidth = 10 * k; c.strokeStyle = '#e65100'; c.strokeText('TURBO', 0, 0); c.fillStyle = '#ffd600'; c.fillText('TURBO', 0, 0); c.restore();
              return cv.toDataURL('image/png'); }""", size)
            open(os.path.join(ROOT, 'pwa', 'icons', f'icon-{size}.png'), 'wb').write(base64.b64decode(data.split(',')[1]))
        await b.close()
asyncio.run(main())
print('ikoner klara')
