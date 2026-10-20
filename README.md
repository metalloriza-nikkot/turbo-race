# TURBO-RACE

Ett bilspel för barn (6–8 år) där läsning och matte är inbyggt i leken: pizzabud som läser beställningar, presenter med ord före loppen, bonusfrågor i matte, körskola, turnering med en TV-show och en stad att köra runt i.

**Spela:** https://metalloriza-nikkot.github.io/turbo-race/

## Installera som app (fungerar offline)
- **Mac (Chrome):** öppna länken → klicka på installera-ikonen i adressfältet (eller ⋮ → *Spara och dela* → *Installera sidan som app*).
- **iPad (Safari):** öppna länken → *Dela* → *Lägg till på hemskärmen*.

Efter första besöket fungerar spelet utan internet. Nya versioner laddas ner i bakgrunden nästa gång enheten är online och syns när spelet startas om.

## Spara framsteg
Framsteg sparas automatiskt i webbläsaren på varje enhet. **💾 SPARA SPEL** (hubben, pausmenyn med Esc, föräldravyn) sparar allt i en fil – en säkerhetskopia som också används för att flytta framsteg mellan enheter. **📂 LADDA SPEL** läser in en sådan fil. En pågående turnering sparas automatiskt och kan fortsättas.

## Kortkommandon
Piltangenter = köra · Mellanslag = använd sak / läs upp · Håll Skift = superturbo · Skift två gånger = hopp · H = tuta · Esc = paus · F = helskärm · Ctrl+Skift+L = felsökningslogg

## För utveckling
- `src/` – källkoden (JavaScript i numrerade filer + `index.html`). Filerna slås ihop i nummerordning.
- `python3 build.py` – bygger `dist/TURBO-RACE.html` (en enda fil som fungerar direkt från skrivbordet).
- `python3 build.py --pages _site` – bygger dessutom webbappen (service worker, manifest, ikoner).
- `python3 tests/run_all.py` – regressionstester med Playwright (kräver `pip install playwright` och Chromium).
- `pwa/` – manifest, service worker, ikoner. `tools/make_icons.py` ritar om ikonerna.
- `notes/granskning.md` – designbeslut, versionshistorik och färdplan.

Varje push till `main` byggs och publiceras automatiskt till GitHub Pages (`.github/workflows/pages.yml`).
