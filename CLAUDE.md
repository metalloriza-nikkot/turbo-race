# TURBO-RACE – instruktioner för Claude

Pedagogiskt bilspel för Liam (6 år, förskoleklass, läser versaler bra, korta ord med gemener; ligger före i läsning och matte) – och ibland Lukas (4 år). Mål: roligt spel med humor för barn och vuxna där lärandet sker utan att barnet tänker på det. Inget får hårdkodas till Liam – namnet kommer från spelarprofilen.

## Arbetssätt
- All text i spelet är på svenska. Text som barnet ska läsa: VERSALER, korta ord; rösten (Voice.say) läser upp.
- Ändra i `src/`, bygg med `python3 build.py`, kör `python3 tests/run_all.py`. Ta skärmdumpar med Playwright och titta på dem innan du lämnar över.
- Höj `TR_VERSION` i `src/00_log.js` vid varje leverans och lägg en rad i `notes/granskning.md`.
- Commit-meddelanden på svenska. Varje push till main publiceras automatiskt till GitHub Pages.
- Leverera även `dist/TURBO-RACE.html` som fil till användaren när han vill ha den lokalt.

## Struktur (filerna slås ihop i nummerordning till ett IIFE)
- `00_log.js` felsökningslogg (Ctrl+Skift+L), `01_geom.js`, `02_tracks.js` banor (punkter + saker längs banan),
- `03_cars.js` bilar ovanifrån, `03f_figures.js` figurer/butik, `03s_showroom.js`, `03v_front.js` bilar snett framifrån (liten 3D-ritsats),
- `04_audio.js` ljud/röst, `04m_math.js` mattemotor, `04w_words.js` läsmotor,
- `05_game.js` spelmotor (fysik, superturbo, hopp, HUD), `05b_brief.js` uppdragskort/presenter, `05s_school.js` körskolan, `05t_show.js` TV-showen, `05v_victory.js` segerscen,
- `06_ui.js` menyer/profiler/turnering, `06p_parent.js` föräldravy (PIN), `06s_save.js` spara/ladda/fortsätt turnering,
- `07_city.js`, `07m_citygame.js`, `07t_traffic.js` Turbostaden.
- Testkrokar: `window.__TR` (spelstate G), `window.__TRf` (update, keys), `window.__TRx` (funktioner för tester).

## Viktigt att inte förstöra
- Profilen ligger i localStorage-nyckeln `turbo_prof`. Sparfilens format: `{ app: 'TURBO-RACE', format: 1, prof, player, ... }` – håll bakåtkompatibelt.
- Webbappen ligger på metalloriza-nikkot.github.io – samma ursprung som andra spel på samma konto, så använd unika localStorage-nycklar (prefix `turbo_`).
- Menyer ska rymmas i små fönster (ca 1000×625): `fitScreen()` krymper innehållet, knappraden `.row.actions` ligger kvar i bild. Kontrollera med `tests/ux_audit.py`.

## Färdplan (se notes/granskning.md)
Nästa: motståndarnas superturbo (skalar med nivå), banbyggare där man "kör fram" banan med piltangenterna.
