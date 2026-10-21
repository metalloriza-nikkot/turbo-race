# TURBO-RACE – granskning och färdplan (uppdaterad 2026-10-21, v16.10)

Mål: rolig bilupplevelse med humor för barn och vuxna, där lärandet (6–8 år) sker utan att barnet tänker på det.

## Underlag (utvecklingssamtal 2026-09-29)
- Förskoleklassen arbetar med **veckans bokstav** (vecka 40: **L, l**). Barnen läser ännu inte mycket individuellt.
- Liams lärare: han ligger **före de flesta** i matematik och läs- och skrivförståelse. Utmaningen är att hitta en nivå som stimulerar honom.
- Liam kan **gemener** hyfsat, men inte på samma nivå som versaler. Ord med gemener ska vara mycket korta.
- **Slutsats för designen:** spelet ska vara berikning som anpassar sig uppåt utan tak.

## Kritik (status)
1. ~~Kartlinjen gör läsningen onödig~~ → åtgärdat i v15 (Skyltjakten).
2. ~~Orden lärs in som bilder~~ → åtgärdat i v15 (läsmotorn, ljudning).
3. ~~Racen innehåller inget lärande~~ → v15 (gyllene bokstäver) och v16 (present med läsning före loppet, bonusfråga i matte efter).
4. **Ingen röd tråd** → v17.
5. ~~Menyer täta~~ → v16: hubben har fyra stora val (RACE, TURNERING, STADEN, SKOLAN) plus GARAGET (figur, butik, motståndare, körkort) och VUXEN. v16.2: alla skärmar går att skrolla.
6. ~~Matematik saknas~~ → v16 (mattemotorn).
7. **Balansen är testad med testbotar, inte med barn** → testa med Liam. (Speltesterna gav v16.1 och v16.2.)
8. **Tekniska risker:** ~~ingen föräldravy~~ (v15). Kvar: säkerhetskopiering, offline-installation, handkontroll. Skrivläget kräver fysiskt tangentbord (inget skärmtangentbord för iPad än).

## Byggt i v15
- Läsmotor i fem nivåer (ljudenliga ord → längre ord → dubbelteckning/ng/sj → sammansatta ord → gåtor) som anpassar sig: tre rätt i rad ger en högre nivå, två fel en lägre. Svåra ord och veckans bokstav kommer oftare. Felalternativ med samma första bokstav.
- Gemener i korta ord från nivå 3. Ljudning med bokstavsremsa. Skyltjakten. Gyllene bokstäver. Egna ord som diktamen.
- Föräldravy med PIN och utskriftsbar sammanfattning.

## Byggt i v16
- **Mattemotorn** i sex nivåer: plus inom 10 → plus/minus inom 20 → tiotalsövergång → tiotal inom 100 → tvåsiffrigt inom 100 → gånger som grupper, dubbelt och hälften. Startar på nivå 2 och anpassar sig som läsmotorn. Svar med knappar eller genom att skriva siffror. HJÄLP visar talen som tiotalsstavar och prickar.
- **Present före varje lopp:** tre paket med ord (TURBO, SKÖLD, BOLL, MYNT). Han läser och väljer vad han vill ha i loppet. Mellanslag ljudar ordet. Från läsnivå 3 står orden ibland med små bokstäver.
- **Bonusfråga efter varje lopp:** VANLIG (+3 mynt) eller JÄTTESVÅR (en nivå över hans, +8 mynt) eller hoppa över.
- **Butiken räknar:** "Du har 45. Rosa kostar 20. Hur många har du kvar?" (när talen passar hans nivå), eller "hur många fler behöver du?". Köpet går igenom även vid fel svar.
- **JÄTTESVÅRT i staden:** efter varje uppdrag kan han välja ett jättesvårt uppdrag (svårare ord, gåtor, skyltjakt, dold radar) med tre gånger så mycket mynt.
- **Föräldravyn** visar även mattenivå, andel rätt, hjälp, hur ofta han väljer JÄTTESVÅR och svåra uppgifter. Mattenivån går att ställa in.

## v16.1 – rättningar efter första speltestet (2026-09-30)
- **Fel adress i Turbostaden (två buggar):**
  1. När ett nytt uppdrag startade stod bilen kvar i rutan där förra pizzan lämnades. Den rutans skylt poppade upp och lästes upp ("Blåa huset") och såg ut som den nya adressen. Nu ignoreras rutan man står i tills man kört därifrån.
  2. I Skyltjakten kortades GPS-vägen av en gång till varje gång spelet behöll den gamla vägen. Då kunde vägen sluta flera kvarter från målet (t.ex. vid Parken). Nu räknas hysteresen alltid på hela vägen, och vägen slutar alltid vid sista korsningen före målet (testat: 0 fel, före rättningen 35–83 fel per testvarv).
- **Färgade hus syns uppifrån:** taket har husets egen klara färg med vit kant. Utfyllnadshus har neutrala färger (beige, grått, ljuslila) och bruna eller grå tak. Skolan och Posten har bytt färg (lila respektive turkos) så att de inte liknar Gula huset.
- **Skyltjakten tydligare:** ett förstoringsglas och en streckad ring där kartan slutar ("leta här"). Stannar man i fel ruta visas "INTE HÄR – LETA VIDARE" och rösten säger det.
- **JÄTTESVÅRT förklaras:** knapparna har undertext (VANLIG NIVÅ · 10–20 mynt eller SVÅRARE ORD & GÅTOR · ×3 mynt, i ambulans och polis LÄNGRE MENING · KARTA/RADAR SENARE). Rösten förklarar när man väljer.
- **TV-showen varierar mer:** ungefär tre gånger fler repliker. Banornas taglines och nationalsånger har 3–4 varianter var. Smeknamnen i startfältet lottas per turnering. Minnet av vad som visats sparas mellan turneringar, så en replik kommer inte tillbaka förrän ungefär tre fjärdedelar av poolen har visats. Test: 0 upprepningar i turnering 1–2, 3 i turnering 3, 19 av 68 i turnering 5.

## v16.2 – rättningar efter andra speltestet (2026-10-02)
- **Skrivläget i pizzauppdraget (nivå 5) är tydligt.** Observation: Liam förstod inte bytet från läsa/välja till skriva första gången, men skrev sedan rätt utan problem. Nu:
  - Startkortet säger "NY BESTÄLLNING – DU SKRIVER!" och "NÄR DU KOMMER FRAM SKRIVER DU ORDET", och rösten säger det.
  - Vid dörren visas en stor skylt "✏️ NU SKA DU SKRIVA!" med ett tangentbord där tangenter trycks ned, och rösten säger ordet.
  - Mellanslag = hör ordet igen. Efter 9 sekunder utan tryck ger rösten en knuff ("Vilken bokstav börjar det på?").
- **Esc i helskärm:** Esc öppnar spelets meny direkt och spelet stannar kvar i helskärm (tangentbordslås i Chrome och Edge; håll inne Esc för att lämna helskärm, eller tryck F). I webbläsare utan lås räknas ett Esc som lämnar helskärm samtidigt som ett Esc i spelet, så ett tryck räcker.
- **Menyer som inte fick plats:** alla skärmar går att skrolla, och toppen skärs aldrig av. En gul "▼ MER NEDANFÖR"-knapp syns när det finns mer, och piltangenterna rullar fram kortet man står på. Motståndare har kompakta liggande kort i två grupper (DINA / FÄRDIGA), Körskolan visar 8 kort per rad, och figurbyggaren, resultatlistan och föräldravyn krymper på låga skärmar. Kontrollerat automatiskt i 1024×768, 1280×650, 1440×760, 1512×860 och 1920×1000: inget avskuret någonstans.

## v16.3 – bugg: ljudningsremsan fastnade (2026-10-05)
- **Symptom:** ordet (t.ex. FLAGGA) låg kvar som bokstavsremsa över skärmen och gick inte att få bort. Webbläsaren fick stängas. Hände två gånger i pizzabud.
- **Orsak:** remsan stängdes bara när ljudningen pratats klart. Om något annat pratade mitt i (t.ex. "Nu är du nära!", en skylt eller en ny beställning) avbröts ljudningen och remsan stängdes aldrig. Den följde med till nästa uppdrag. Reproducerad i test.
- **Rättning:** remsan stängs när ljudningen avbryts, vid nytt uppdrag, leverans, lopp och när man lämnar staden. Den har dessutom en maxtid. Spel-loopen fångar fel så att ett fel i en bildruta aldrig fryser spelet.
- **Felsökningslogg:** Ctrl+Skift+L var som helst i spelet, eller 📋 Felsökningslogg i föräldravyn. Sparar en textfil i Hämtade filer och kopierar den. Innehåller tillståndet just nu, de senaste ~500 händelserna (lägen, menyer, uppdrag, ljudning, fel med stack), de senaste tangenterna och loggen från förra sessionen (sparas löpande i webbläsaren, så den finns kvar även om webbläsaren fick stängas).

## v16.4 – önskemål från Liam och pappa (2026-10-18)
- **Hopp:** dubbeltryck på Skift (inom ca 0,4 s) får bilen att hoppa i ca 0,6 s. I luften krockar man inte med bilar och missar hinder, men styr sämre. Väntetid 1,4 s mellan hopp. Fungerar i lopp och i Turbostaden, inte i körskolan (där skulle det göra uppdragen för lätta). Ett enkelt Skift ger fortfarande superturbo när mätaren är full; är mätaren full när han dubbeltrycker får han både superturbo och hopp.
- **Ny nivå 🦊 LAGOM** mellan 🐢 LÅNGSAM och 🐇 MELLAN: motståndarna kör 85,5 % av max (🐢 80 %, 🐇 91 %), svagare styrhjälp i kurvor än sköldpaddan, mellanläge för föremål, raketstart och drifthjälp.
- **Två nya bilar:** RC-RACERN (design: Liam) – blå nos, röd kaross, svart motorblock med tre avgasrör, gula fenor, grova däck. Pruttar eld hela tiden och gör en stor eldprutt var 6–12:e sekund. ÅTERVINNAREN (design: pappa) – sopbil med röd hytt, ögon i vindrutan, blinkande orange ljus, grönt flak med snurrande återvinningssymbol. Blåser gröna bio-avgaser med löv. Designern visas på bilkortet.
- **Bilarna snett framifrån:** ny utställningsvy som staplar bilens bild i tunna lager och ger en leksaksbil med höjd. Används i segerscenen (vinnarens bil på ett vridbord och spelarens egen bil bredvid), i resultatlistan och på pallen efter turneringen. Fungerar automatiskt för alla bilar, även framtida.

## v16.5 – UX-genomgång, ny superturbo, bilarna snett framifrån (2026-10-18)
- **Allt får plats:** varje meny krymper sitt innehåll automatiskt (ned till 68 %) när fönstret är litet. Knappraden längst ned (resultat, körskola, pokal, mattefråga) ligger alltid kvar i bild, och TILLBAKA sitter fast uppe till vänster. MER-markeringen sitter vid högerkanten och täcker aldrig knappar. Kontrollerat i 1000×625 (Niklas fönster), 1024×768, 1280×720 och 1440×900: inget avskuret och ingen skrollning (utom i extremt små fönster). Knapparna i övre raden har förklarande text vid hovring.
- **Superturbo v2:** håll in Skift. Turbon startar efter 0,15 s (så att två snabba tryck = hopp utan turbo) och pågår så länge man håller, tills mätaren är tom. Man kan dosera. Mätaren har 10 rutor och en siffra ("5"). Minst 2 rutor krävs för att starta. Full mätare ≈ 2,2 s turbo (förr 1,7 s + en knuff). Ingen knuff vid start, så småtryck lönar sig inte. Mätaren fylls som förut genom drift.
- **Alla 14 bilar ritade snett framifrån** med en egen liten 3D-ritsats (lådor, skrov, hjul, detaljer). Effekter: snurrande hjul, studs, fartlinjer, damm, bilens egna avgaser (eld från RC-racern, bio-rök med löv från Återvinnaren, turbolågor). Återvinnaren har ansiktet på fronten. Används i bilvalet (med en liten bild ovanifrån i hörnet), butiken, segerscenen, resultatlistan och pallen.

## v16.6 – Spara och ladda spel (2026-10-19)
- **💾 SPARA SPEL** finns i hubben, i pausmenyn (Esc mitt i ett lopp) och i föräldravyn. Allt sparas i en fil: alla spelare, mynt, körkort, läs- och mattenivå, medaljer, egna motståndare och pågående turnering. I Chrome väljer man själv mapp och filnamn, i Safari/iPad hamnar filen i Hämtade filer/Filer. Filnamn: TURBO-RACE-LIAM-2026-10-19-0840.json.
- **📂 LADDA SPEL** finns på startskärmen, i hubben och i föräldravyn. En kontrollruta visar vad filen innehåller (namn, mynt, pokaler, körkort, pågående turnering, när den sparades) innan något ersätts. Det man hade innan sparas som reserv och kan ångras i föräldravyn (↩ Ångra senaste laddning).
- **Turneringen sparas automatiskt** i början av varje lopp och efter varje målgång. Klickar man TURNERING med en ofärdig turnering får man välja ▶ FORTSÄTT (bana X av 7, poäng hittills) eller NY TURNERING. Hubben visar en PÅGÅR-etikett. Avbryts ett lopp mitt i börjar man om just det loppet nästa gång – poängen från tidigare banor finns kvar.
- Testat hela vägen: skapa spelare → turnering → lopp 1 → Esc mitt i lopp 2 → spara → töm webbläsaren → ladda filen → fortsätt → lopp 2 räknas vidare på rätt poäng.
- Detta är förberedelsen för att flytta spelet till GitHub Pages (profilen flyttas med en sparfil).

## v16.10 – Ryckningar: analys av Niklas logg och automatisk upplösning (2026-10-21)
- **Loggen (Windows, Chrome 155, 1920×945):** snitt 26,8 ms per bildruta (ca 37 bilder/s) men bara 3 ms i spelkoden. 56 ryck på 83–833 ms, alla med 2–6 ms spelkod och utan röst. Alltså: tiden går åt till att rita (grafikkort/webbläsare), inte till spelets logik. Finalbanan hade nästan inga ryck.
- **Automatisk upplösning:** spelet mäter bildtiden under loppet. Är snittet över 22 ms ritar det med 80 %, sedan 65 % av upplösningen (skärmen fylls ändå). I testmiljön (ingen grafikacceleration) gick det från 33 ms till 16,7 ms per bildruta. Loggas som `[grafik]`.
- **Mer i loggen:** vilket grafikkort webbläsaren använder (SwiftShader/Basic Render = ingen acceleration), `[lång bildruta]` från Chromes egen mätning (skript/ritning/blockerande tid) och minnesstädning vid varje ryck. Saknas `[lång bildruta]` vid ett ryck var huvudtråden ledig och väntade på grafikkortet eller systemet.

## v16.9 – Välj antal varv, jämnare bildrutor (2026-10-21)
- **Antal varv i enskilda lopp:** på HUR SNABBT?-skärmen finns en rad 🔁 VARV: 1 2 3 4 5 10. Förvalt är banans eget antal (3 på de vanliga, uträknat på egna banor). Valet gäller tills man byter bana, även för KÖR IGEN. Turneringen har fast antal varv (ingen rad där).
- **Ryck under loppet – åtgärder:** filstorleken (ca 640 kB) är inte orsaken, den läses in en gång. Det som kostade mest per bildruta:
  - Banan (kanter, väg, streck) ritades i sin helhet, ~2000 punkter, 8–10 gånger per bildruta. Nu ritas bara den del som syns.
  - Marken fylldes över en roterad kvadrat runt kameran (~2,5 gånger skärmytan). Nu fylls bara skärmen.
  - Minikartan ritades om varje bildruta – nu en gång per lopp.
  - Ansikten och bilar i ställningslistan (en del bilar har glöd-effekt) ritades om varje bildruta – nu en gång per lopp.
  - Talsyntesens röstlista hämtades vid varje replik – nu en gång.
- **Ryckmätare i felsökningsloggen:** varje bildruta över 70 ms loggas som `[ryck]` med hur lång tid spelkoden tog, om rösten pratade och antal partiklar. Tillståndet visar snitt-bildtid och antal ryck. Kvarstår ryck: Ctrl+Skift+L efter loppet och skicka loggen.
- Test: `tests/test_laps.py`.

## v16.8 – Banbyggaren (2026-10-21)
- Ny knapp i menyn: 🛠️ BYGG BANA → MINA BANOR (upp till 8 per spelare) → välj miljö → kör fram vägen.
- Vägen körs fram ruta för ruta på ett rutnät (12×8) med piltangenterna, eller genom att dra med fingret. Backa = sudda. Tillbaka till flaggan = slingan är klar. ENTER innan dess = bilen hittar själv hem (kortaste vägen genom tomma rutor). Minst 8 rutor.
- Sedan stämplar man ut saker: HOPP, TURBO, LÅDA, hinder, halka och bus (heter olika i varje miljö, t.ex. KON/PÖL/ANKA i staden). MELLANSLAG byter, ENTER sätter ut, siffrorna 1–9 väljer direkt. Hinder får inte stå vid starten.
- Namnet skrivs med tangentbordet (rösten säger varje bokstav), eller 🎲 TIPS.
- Banan sparas i profilen (`PROF.mytracks`) och följer därför med i sparfilen. Den finns i banvalet (märkt MIN BANA) och de två senaste egna banorna körs i turneringen före finalen. TV-showen kallar den GRAND PRIX: NAMN.
- Startlinjen läggs mitt på den längsta raksträckan. Antal varv räknas fram så att loppet blir ungefär lika långt som på de vanliga banorna (2–5 varv).
- Kod: `src/02b_custom.js` (data → bandefinition), `src/07b_builder.js` (byggläget). Test: `tests/test_builder.py`.
- Liten rättning: ljudet `fanfar` fanns inte som effekt (bara som tuta) – nu spelas fanfaren.

## v16.7 – Motståndarnas superturbo (2026-10-21)
- Motståndarnas mätare fylls med tiden. 🐣🐢: ingen superturbo. 🦊: små doser (40 %). 🐇🚀: hela mätaren, 🚀 laddar snabbast.
- De tänder den bara på raksträckor, och oftare när de ligger efter spelaren.
- Syns och hörs: blå lågor + "SUPERTURBO!" över bilen, ljud om bilen är nära, blå glöd och lågor på raden i ställningslistan. I turneringen säger kommentatorn något (högst var 14:e sekund).
- Test: `tests/test_aisuper.py` (0 gånger på 🐢; 🦊 kortare doser än 🐇).

## Repo och webbapp (2026-10-20)
- Koden ligger i GitHub: https://github.com/metalloriza-nikkot/turbo-race (src/, tests/, pwa/, build.py, CLAUDE.md).
- Webbappen publiceras automatiskt till https://metalloriza-nikkot.github.io/turbo-race/ vid varje push till main (Actions-flödet `Bygg och publicera spelet`). Kräver att Pages-källan är satt till *GitHub Actions* i repots inställningar.
- Offline: service worker med versionerad cache (`turbo-<version>-<hash>`); testat att spelet startar utan nät (`tests/test_offline_pwa.py`). Ny version laddas i bakgrunden och visas efter omstart.
- Flytta Liams framsteg: SPARA SPEL i filversionen → LADDA SPEL i webbappen (en gång per enhet).

## Förslag framåt
### C. En röd tråd (v17)
- Karta över Turbo-världen, Kapten Krut som rival, brev i brevlådan och ett samlingsalbum.

### Körskolan (kvar från B)
- Sifferportar i ordning, räkna mynt, bokstavsportar.

### E. Barnhumor i själva körningen (löpande)
- En ko som korsar vägen, Prutto-turbo, motståndare som nyser och snurrar, tuthorn som låter som djur.

### G. Teknik (löpande)
- Säkerhetskopiering till fil, offline-installation, handkontroll, skärmtangentbord för skrivläget på iPad.
