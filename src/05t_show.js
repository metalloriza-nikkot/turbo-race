// ===================== TV-SHOWEN: TURBO-RACE WORLD TOUR =====================
// Arrangör: IFSB – Internationella Förbundet för Små Bilar. Grundat 1823. Ingen vet varför.
const CAST = {
  goran: { name: 'GÖRAN GASFOT', role: 'goran', col: '#ffd600', fig: { skin: 1, hair: 0, hairCol: 0, eyes: 0, beard: 1, mouth: 1, suit: 1 } },
  britt: { name: 'BRITT-MARIE BROMSLJUS', role: 'britt', col: '#ff80ab', fig: { skin: 0, hair: 2, hairCol: 5, eyes: 2, beard: 0, mouth: 0, suit: 4 } },
  ronny: { name: 'RONNY RÄNNA', role: 'ronny', col: '#76ff03', fig: { skin: 0, hair: 6, hairCol: 2, eyes: 1, beard: 0, mouth: 1, suit: 5 } },
  prof: { name: 'PROFESSOR LENNART LÅNGSAM', role: 'prof', col: '#40c4ff', fig: { skin: 0, hair: 5, hairCol: 5, eyes: 2, beard: 3, mouth: 3, suit: 6 } },
  stall: { name: 'STALLET', role: 'stall', col: '#b0bec5' },
};
const GP = {
  rum: { title: 'LE GRAND PRIX DE VARDAGSRUMMET', tag: 'Presenterat av Soffans Hemlighet™ – där fjärrkontrollen bor', tags: ['Varvtid: ungefär en reklampaus.', 'Se upp för legobitar. De gör ont i däcken.', 'Banan går under soffan. Ingen vet vad som finns där.'], anthem: 'diskmaskinens färdigsignal', anthems: ['en dammsugare som nynnar', 'tre tickande klockor och en gäspande hund', 'en kyl som surrar i stämmor'], flag: '🧦', flagName: 'en strumpa' },
  strand: { title: 'STRAND-500', tag: '500 meter. 500 krabbor. 5 lager solkräm.', tags: ['Sanden är varm. Glassen är varmare.', 'Varning för sandslott. De är starkare än de ser ut.', 'Här kör man med flip-flops på gaspedalen.'], anthem: 'en mås som skriker på en pommes', anthems: ['vågor som klappar i takt', 'en krabba som spelar kastanjetter', 'en glassbil som har fastnat på samma låt'], flag: '🩳', flagName: 'ett par badbyxor' },
  sno: { title: 'SNÖ-CLASSIC', tag: 'Kallare än en måndag i februari.', tags: ['Kallt, halt och helt underbart.', 'Här fryser till och med motorerna.', 'Kom ihåg vantarna. Och bilen.'], anthem: 'tre pingviner som hummar i stämmor', anthems: ['en snögubbe som visslar', 'isbitar som klirrar i ett glas', 'en älg som nyser i dur'], flag: '🧤', flagName: 'en borttappad vante' },
  vulkan: { title: 'VULKAN-GP', tag: 'Det enda loppet där publiken är lava.', tags: ['Varmt före. Mycket varmt före.', 'Ta med solkräm faktor tusen.', 'Här grillar man korv på däcken.'], anthem: 'ett mycket högtidligt bubbel', anthems: ['en gejser som tjuter', 'lava som gurglar i dur', 'en dinosaurie som gäspar'], flag: '🌭', flagName: 'en lätt bränd korv' },
  rymd: { title: 'RYMD-GP', tag: 'Tyngdlösheten är tillfälligt ur funktion.', tags: ['Där ingen bil har kört förut. Förutom förra året.', 'Luft finns i burk vid kiosken.', 'Varvtid: ett ljusår, ungefär.'], anthem: 'ett UFO som piper i moll', anthems: ['en satellit som piper', 'en astronaut som nynnar i hjälmen', 'två kometer som krockar i takt'], flag: '🛸', flagName: 'en foliehatt' },
  stad: { title: 'STADS-GP', tag: 'Varning för ankor, lapplisor och vuxna som pratar mitt i vägen.', tags: ['Rusningstrafik, rondeller och en förvirrad duva.', 'Kör försiktigt – här bor Britt-Maries moster.', 'Grönt betyder kör. Rött betyder korv. Nej förlåt, stopp.'], anthem: 'en bilalarm-kvartett', anthems: ['en sopbil som backar: pip, pip, pip', 'tutande taxibilar i kanon', 'en duva som kuttrar allvarligt'], flag: '🅿️', flagName: 'en parkeringsbot' },
  final: { title: 'DEN STORA FINALEN', tag: 'IFSB:s Heliga Arena. Dubbla poäng. Ingen vet varför.', tags: ['Allt eller inget. Mest allt.', 'Här avgörs allt. Och lite till.', 'Den största finalen sedan förra finalen.'], anthem: 'hela orkestern (en man med kazoo)', anthems: ['fyrverkerier och en ensam triangel', 'hela publiken som säger BRUM samtidigt', 'en kör av ankor och en mycket stolt tuba'], flag: '🏆', flagName: 'en guldstrumpa' },
};
function gpVariant(id) { const b = GP[id] || GP.final; return Object.assign({}, b, { tag: pickFrom('tag_' + id, [b.tag, ...(b.tags || [])]), anthem: pickFrom('anth_' + id, [b.anthem, ...(b.anthems || [])]) }); }
const STUDIO = [
  [['goran', 'God kväll och välkomna till ett historiskt lopp.'], ['britt', 'Du säger det varje gång.'], ['goran', 'Och varje gång är det sant.']],
  [['goran', 'Förhållandena är perfekta.'], ['britt', 'Det är inomhus, Göran.'], ['goran', 'Perfekta inomhusförhållanden!']],
  [['goran', 'Spänningen är olidlig, Britt-Marie.'], ['britt', 'Jag åt en macka. Det hjälpte.']],
  [['goran', 'Miljontals tittare över hela världen!'], ['britt', 'Fyra. Och en katt.'], ['goran', 'Hej katten!']],
  [['goran', 'Jag har inte sovit på tre dagar inför det här loppet.'], ['britt', 'Det syns, Göran.']],
  [['goran', 'Känner du doften av historia, Britt-Marie?'], ['britt', 'Nej, det är Kapten Krut. Han åt bönor till lunch.']],
  [['goran', 'Vi sänder live!'], ['britt', 'Det här är inspelat.'], ['goran', 'Vi sänder ... nästan live!']],
  [['goran', 'Det här loppet kommer att avgöras på banan.'], ['britt', 'Var annars, Göran?'], ['goran', '... I hjärtat.']],
  [['britt', 'Statistiskt sett vinner den som kör snabbast.'], ['goran', 'Chockerande siffror. Chockerande!']],
  [['goran', 'Vi har fått ett mejl från en tittare.'], ['britt', 'Det är från din mamma.'], ['goran', 'Hej mamma!']],
  [['goran', 'Jag har tagit på mig min allvarligaste slips.'], ['britt', 'Den har en anka på sig.'], ['goran', 'En MYCKET allvarlig anka.']],
  [['goran', 'Det luktar bränt gummi!'], ['britt', 'Eller Kapten Krut. Svårt att säga.']],
  [['goran', 'Förbundsordföranden har bett mig läsa upp ett meddelande.'], ['britt', 'Hur långt är det?'], ['goran', 'Fyrtio sidor.'], ['britt', 'Nästa inslag!']],
  [['goran', 'Britt-Marie, vad förväntar du dig av dagens lopp?'], ['britt', 'Att det börjar.'], ['goran', 'Djärvt!']],
  [['goran', 'Jag har med mig min lyckostrumpa idag.'], ['britt', 'Du har den på handen, Göran.'], ['goran', 'Då har jag dubbel tur!']],
  [['britt', 'Göran, du har ketchup på slipsen.'], ['goran', 'Det är inte ketchup. Det är lagfärgen.']],
  [['goran', 'Idag kan allt hända!'], ['britt', 'Mest kommer bilar att köra runt.'], ['goran', 'ALLT kan hända!']],
  [['goran', 'Vi har en expert i studion idag!'], ['britt', 'Det är en kaktus.'], ['goran', 'Den har inte sagt något dumt än.']],
  [['goran', 'Min spådom: någon kommer att vinna.'], ['britt', 'Modigt, Göran.'], ['goran', 'Jag står för det!']],
  [['goran', 'Hur många varv är det idag?'], ['britt', 'Det står på skylten bakom dig.'], ['goran', '... Jag vågar inte vända mig om.']],
  [['britt', 'Göran har tränat inför kvällen.'], ['goran', 'Jag har övat på att säga WOW.'], ['britt', 'Visa.'], ['goran', 'WOOOOOW!'], ['britt', 'Imponerande.']],
  [['goran', 'Publiken är på plats!'], ['britt', 'En pingvin och tre duvor.'], ['goran', 'Utsålt!']],
  [['goran', 'Vem är din favorit idag, Britt-Marie?'], ['britt', 'Kaffeautomaten.'], ['goran', 'Den kör ju inte ens!'], ['britt', 'Just därför.']],
  [['goran', 'Jag har räknat ut vem som vinner.'], ['britt', 'Hur då?'], ['goran', 'Jag räknade till tre och blundade.']],
  c => [['goran', `Alla pratar om ${c.h} idag!`], ['britt', 'Jag pratar om lunch.'], ['goran', `${c.h} äter säkert lunch också! Allt hänger ihop!`]],
  c => [['goran', `Välkomna tillbaka till ${c.gp.title}!`], ['britt', 'Vi har aldrig varit här förut.'], ['goran', 'Välkomna tillbaka ändå!']],
  [['goran', 'Säkerheten är viktigast. Därför har alla bilar hjälm.'], ['britt', 'Hur får man en hjälm på en bil?'], ['goran', 'Med väldigt mycket tejp.']],
  [['goran', 'Vad är hemligheten bakom ett bra lopp?'], ['britt', 'Att köra åt rätt håll.'], ['goran', 'Det har ingen sagt förut!'], ['britt', 'Alla har sagt det.']],
  [['goran', 'Jag har fått en ny mikrofon!'], ['britt', 'Det är en banan.'], ['goran', 'Hallå? Hallå? ... Den luktar gott i alla fall.']],
  [['goran', 'Kapten Krut säger att han ska vinna idag.'], ['britt', 'Det säger han varje dag.'], ['goran', 'Även på julafton?'], ['britt', 'Särskilt på julafton.']],
  [['britt', 'Visste du att en snigel kan sova i tre år?'], ['goran', 'Vad har det med racing att göra?'], ['britt', 'Ingenting. Jag ville bara säga det.']],
  [['goran', 'En tittare undrar: varför är däcken runda?'], ['britt', 'För att fyrkantiga skakar.'], ['goran', 'Vetenskap!']],
  [['goran', 'Jag har ätit en hel påse turbogodis.'], ['britt', 'Det förklarar varför du vibrerar.']],
  [['goran', 'Känner du spänningen, Britt-Marie?'], ['britt', 'Jag känner att min stol är blöt.'], ['goran', 'Det var ankan!']],
  [['goran', 'Mitt hjärta slår som en motor!'], ['britt', 'Brum brum?'], ['goran', 'Brum brum, Britt-Marie. Brum brum.']],
  c => [['goran', `Jag har hört att ${c.h} har tränat på att svänga.`], ['britt', 'Åt vilket håll?'], ['goran', 'Båda! Det är det som är det fina.']],
  [['goran', 'Nu gäller det att spänna fast sig!'], ['britt', 'Vi sitter i en studio.'], ['goran', 'Man vet aldrig, Britt-Marie. Man vet aldrig.']],
  [['goran', 'Idag har vi supersnabba kameror!'], ['britt', 'Vi har en kamera. Den är bara väldigt pigg.']],
  [['goran', 'Hör ni motorerna?'], ['britt', 'Det är min mage.'], ['goran', 'Den låter snabb!']],
  c => [['britt', `Göran, vad tror du om ${c.opp}?`], ['goran', 'Farlig förare. Mycket farlig.'], ['britt', 'Varför?'], ['goran', 'Hen har snygga handskar.']],
  [['goran', 'Jag har skrivit en dikt om loppet.'], ['britt', 'Nej.'], ['goran', 'Brum brum, sväng sväng, vinna –'], ['britt', 'Nästa inslag!']],
  [['goran', 'Britt-Marie, har du någonsin kört racerbil?'], ['britt', 'En gång. Jag vann.'], ['goran', 'Vad hände sen?'], ['britt', 'Jag blev kommentator. Det är lugnare.']],
  [['goran', 'Vi har fått en teckning från en tittare!'], ['britt', 'Det är en bil. Eller en potatis.'], ['goran', 'En snabb potatis!']],
];
const STUDIO_OPEN = [
  [['goran', 'God kväll, världen! Välkomna till TURBO-RACE WORLD TOUR!'], ['britt', 'Arrangerat av IFSB. Internationella Förbundet för Små Bilar.'], ['goran', 'Grundat 1823!'], ['britt', 'Ingen vet varför.']],
  [['goran', 'God kväll! Det är dags för TURBO-RACE WORLD TOUR!'], ['britt', 'Sex lopp. Fem förare. En pokal.'], ['goran', 'Och en korv i pausen!'], ['britt', 'Det står inte i manuset.']],
  [['goran', 'Välkomna, bilälskare och alla andra!'], ['britt', 'Ikväll avgörs vem som är snabbast i hela världen.'], ['goran', 'Eller åtminstone i det här vardagsrummet!']],
  [['britt', 'God kväll. Jag heter Britt-Marie och jag har redan ångrat mig.'], ['goran', 'Och jag heter Göran och jag ångrar ingenting! Utom den där gången med såpbubblorna.']],
  [['goran', 'TURBO-RACE WORLD TOUR är tillbaka!'], ['britt', 'Den var borta i tre minuter.'], ['goran', 'Och vi har saknat den SÅ MYCKET!']],
  c => [['goran', 'God kväll och välkomna till världsturnén!'], ['goran', `Ikväll kör ${c.h} mot världens bästa förare!`], ['britt', 'Och Kapten Krut.'], ['goran', '... Och Kapten Krut.']],
  [['goran', 'Välkomna! Jag är så taggad att jag har tagit på mig två slipsar!'], ['britt', 'Och inga strumpor.'], ['goran', 'Man måste prioritera.']],
];
const STUDIO_FINAL = [
  [['goran', 'Välkomna till FINALEN! Här ger varje placering dubbla poäng!'], ['britt', 'Varför dubbla?'], ['goran', 'Tradition.'], ['britt', 'Sedan när?'], ['goran', 'Sedan nyss.']],
  [['goran', 'Det här är det! Den stora finalen! Dubbla poäng!'], ['britt', 'Dubbel spänning.'], ['goran', 'Och dubbla korvar i pausen!'], ['britt', 'Det finns fortfarande inga korvar, Göran.']],
  [['britt', 'Finalen. Dubbla poäng. Allt har lett fram till det här.'], ['goran', 'Jag har inte sovit sedan förra loppet!'], ['britt', 'Det var fyra minuter sedan.']],
  [['goran', 'Välkomna till finalen! Jag har tagit på mig min finalslips!'], ['britt', 'Den blinkar.'], ['goran', 'Den blinkar av glädje! Och dubbla poäng!']],
  c => [['goran', `Finalen! Dubbla poäng! Kan ${c.h} ta hem pokalen?`], ['britt', 'Allt kan hända.'], ['goran', 'Jag klarar inte spänningen! Jag behöver en macka!']],
  [['goran', 'Den stora finalen! Varje poäng räknas dubbelt!'], ['britt', 'Så två plus två blir ...'], ['goran', 'Mycket! Det blir mycket!']],
];
const GRID_OPEN = ['Startfältet!', 'Här kommer förarna!', 'Låt oss presentera startfältet!', 'Dags att möta förarna!', 'Förarna rullar in!'];
const GRID_FINAL = ['Finalens startfält! Fem förare. En pokal. Noll ursäkter.', 'Här är de. Finalisterna!', 'Fem förare. En final. Och en pokal som är tyngre än jag.', 'Finalisterna rullar in. Jag har gåshud på gåshuden!'];
const GRID_HERO = [h => `Och från hemmaplan – ${h}!`, h => `Och publikens favorit – ${h}!`, h => `Och sist men snabbast – ${h}!`, h => `Och så – trumvirvel – ${h}!`, h => `Och den ni alla har väntat på – ${h}!`, h => `Och här kommer ${h}! Publiken tappar popcornen!`];
const ANTHEM_REACT = [['goran', 'Rörande. Jag har gåshud.'], ['britt', 'Du har alltid gåshud, Göran.'], ['goran', 'Jag gråter inte. Det är avgaser.'], ['britt', 'Vackert. Helt obegripligt, men vackert.'], ['goran', 'Hela publiken står upp. Även de som satt ner.'],
  ['goran', 'Den där tonen i slutet! Oj oj oj.'], ['britt', 'Vissa sjunger med. De kan inte texten. Det finns ingen text.'], ['goran', 'Jag känner mig stolt. Jag vet inte över vad, men stolt.'], ['britt', 'Kort och bra. Som en korvpaus.'], ['goran', 'Den var så vacker att min slips började gråta.'], ['britt', 'Någon sjöng falskt. Jag säger inte vem. Det var Göran.'], ['goran', 'Pampigt! Jag fick gåshud på mustaschen.'], ['britt', 'Jag har hört den förut. Den blir inte bättre. Men inte sämre heller.'], ['goran', 'Den ska jag ha som ringsignal!']];
const PROFS = [
  { chart: 'pie', title: 'VEM VINNER?', lines: [['prof', 'Enligt mina beräkningar vinner den som kommer först i mål.'], ['prof', 'Det här är min fyrtionde säsong.']] },
  { chart: 'brum', title: 'DATORNS ANALYS', lines: [['prof', 'Jag har matat in all data i datorn.'], ['prof', 'Datorn säger: brum brum.']] },
  { chart: 'half', title: 'RISK FÖR REGN', lines: [['prof', 'Mina modeller visar femtio procents risk för regn.'], ['britt', 'Vi är inomhus, professorn.'], ['prof', 'Då är det min andra modell.']] },
  { chart: 'up', title: 'FART ÖVER TID', lines: [['prof', 'Som ni ser går kurvan uppåt.'], ['prof', 'Jag vet inte vad den mäter. Men den går uppåt.']] },
  { chart: 'pie2', title: 'VAD ÄR ETT VARV?', lines: [['prof', 'Ett varv är exakt ett varv.'], ['prof', 'Det kan jag garantera. Jag har mätt det med en korv.']] },
  { chart: 'bars', bars: [['IGÅR', 0.4], ['IDAG', 0.7], ['IMORGON', 1]], title: 'HUR SPÄNNANDE?', lines: [['prof', 'Spänningen ökar varje dag.'], ['prof', 'Imorgon blir det så spännande att diagrammet tar slut.']] },
  { chart: 'pieP', parts: [[0.9, '#ffd600', 'SNURRAR IBLAND'], [0.1, '#76ff03', 'KÖR RAKT']], title: 'VAD GÖR BILARNA?', lines: [['prof', 'Nittio procent av alla bilar snurrar ibland.'], ['prof', 'Resten har inte provat än.']] },
  { chart: 'bars', bars: [['KORV', 0.9], ['BANAN', 0.6], ['GRUS', 0.1]], title: 'BÄSTA BRÄNSLET', lines: [['prof', 'Jag har testat olika bränslen.'], ['prof', 'Grus rekommenderas inte.'], ['britt', 'Har du ätit grus, professorn?'], ['prof', 'Bara lite.']] },
  { chart: 'up', title: 'MIN FRISYR', lines: [['prof', 'Kurvan visar hur mycket håret står upp när man kör fort.'], ['prof', 'Som ni ser är jag en mycket snabb man.']] },
  { chart: 'pieP', parts: [[0.5, '#ff7043', 'VÄNSTER'], [0.5, '#40c4ff', 'HÖGER']], title: 'SVÄNGAR', lines: [['prof', 'Hälften av alla svängar går åt vänster.'], ['prof', 'Den andra hälften vägrar.']] },
  { chart: 'brum', title: 'LJUDANALYS', lines: [['prof', 'Jag har spelat in alla motorer.'], ['prof', 'Slutsats: brum.'], ['britt', 'Tre års forskning.'], ['prof', 'Fyra.']] },
  { chart: 'bars', bars: [['VINNAREN', 1], ['TVÅAN', 0.8], ['JAG', 0.05]], title: 'HUR SNABBA?', lines: [['prof', 'Här ser ni hur snabba förarna är.'], ['prof', 'Och här är jag. På cykel. I uppförsbacke.']] },
  { chart: 'pieP', parts: [[0.75, '#ffd600', 'TUTAR'], [0.25, '#b0bec5', 'HITTAR INTE TUTAN']], title: 'TUTANDE', lines: [['prof', 'Sjuttiofem procent av förarna tutar.'], ['prof', 'Resten har inte hittat knappen.']] },
  { chart: 'down', title: 'KEX I STUDION', lines: [['prof', 'Antal kex i studion, över tid.'], ['britt', 'Kurvan går nedåt, professorn.'], ['prof', 'Jag vet inte vad ni pratar om.']] },
  { chart: 'bars', bars: [['1 VARV', 0.33], ['2 VARV', 0.66], ['3 VARV', 1]], title: 'VARV-MATTE', lines: [['prof', 'Ett varv plus ett varv plus ett varv.'], ['prof', 'Blir tre varv. Jag har kontrollräknat fyra gånger.']] },
];
const ADS = [
  { name: 'KLADDO SAFT', slogan: 'Nu med 12 % mindre kladd än mest kladd.', ico: '🧃', col: '#ff4081' },
  { name: 'DÄCKFABRIKEN RUND & SVART', slogan: 'Vi har gjort cirklar sedan 1823.', ico: '🛞', col: '#37474f' },
  { name: 'GRUS™', slogan: 'Det är nästan som sten.', ico: '🪨', col: '#8d6e63' },
  { name: 'PRUTTO BÖNOR', slogan: 'Ger extra turbo. Öppna fönstret.', ico: '🫘', col: '#6d4c41' },
  { name: 'LUFT – NU I BURK', slogan: 'Samma luft som förut. Men i burk.', ico: '🥫', col: '#29b6f6' },
  { name: 'IFSB:S OFFICIELLA SLIPS', slogan: 'Obligatorisk för alla kommentatorer. Även pingviner.', ico: '👔', col: '#8e24aa' },
  { name: 'SOFFANS HEMLIGHET™', slogan: 'Vi vet var fjärrkontrollen är. Vi säger ingenting.', ico: '🛋️', col: '#5c6bc0' },
  { name: 'SNABBKAFFE FÖR BILAR', slogan: 'Varning: bilen kan börja prata fort.', ico: '☕', col: '#795548' },
  { name: 'TURBO-TANDKRÄM', slogan: 'För ett leende i 300 km/h.', ico: '🪥', col: '#00acc1' },
  { name: 'KORVKIOSKEN KURVAN', slogan: 'Vi svänger inte. Vi steker.', ico: '🌭', col: '#e65100' },
  { name: 'MUSTASCHVAX FÖR MOTORER', slogan: 'För motorer som vill se seriösa ut.', ico: '🥸', col: '#4e342e' },
  { name: 'IFSB:S RACINGKALSONGER', slogan: 'Med extra fart där bak.', ico: '🩲', col: '#d81b60' },
  { name: 'PINGVIN-EXPRESS', slogan: 'Vi levererar fisk. Oftast till rätt adress.', ico: '🐧', col: '#1565c0' },
  { name: 'BRUMMO BILSCHAMPO', slogan: 'För blanka bilar och förvirrade ankor.', ico: '🧴', col: '#26a69a' },
  { name: 'TYST-TUTAN', slogan: 'Tutar helt ljudlöst. Perfekt på biblioteket.', ico: '📯', col: '#7cb342' },
  { name: 'MORMORS MÅLFLAGGA', slogan: 'Stickad för hand. Tar sju år att vifta med.', ico: '🏁', col: '#546e7a' },
  { name: 'SOLGLASÖGON FÖR STRÅLKASTARE', slogan: 'Så att bilen ser cool ut i mörkret.', ico: '🕶️', col: '#212121' },
  { name: 'TURBOGRÖT', slogan: 'Från hungrig till mätt på tre sekunder.', ico: '🥣', col: '#f9a825' },
  { name: 'BANANSKAL AB', slogan: 'Vi halkar aldrig efter. Eller jo. Hela tiden.', ico: '🍌', col: '#fbc02d' },
  { name: 'PARKERINGSHUSET SNURREN', slogan: 'Hitta din bil på bara fyra timmar.', ico: '🅿️', col: '#3949ab' },
];
const CUTS = [{ ico: '🦌', name: 'EN HJORT' }, { ico: '🐄', name: 'EN KO MED ÅSIKTER' }, { ico: '🍞', name: 'EN BRÖDROST I VILA' }, { ico: '🦆', name: 'EN ANKA SOM TÄNKER' }, { ico: '🎺', name: 'EN TUBA. BARA EN TUBA.' }, { ico: '🥔', name: 'EN POTATIS MED DRÖMMAR' },
  { ico: '🐌', name: 'EN SNIGEL PÅ SEMESTER' }, { ico: '🧦', name: 'EN ENSAM STRUMPA' }, { ico: '🦒', name: 'EN GIRAFF SOM INTE FÅR PLATS' }, { ico: '🐙', name: 'EN BLÄCKFISK SOM APPLÅDERAR' }, { ico: '🌵', name: 'EN KAKTUS SOM VILL KRAMAS' }, { ico: '🐸', name: 'EN GRODA MED STORA PLANER' },
  { ico: '🧀', name: 'EN OST SOM TÄNKER PÅ LIVET' }, { ico: '🦔', name: 'EN IGELKOTT SOM ÄR HELT OKEJ' }, { ico: '🐑', name: 'ETT FÅR SOM RÄKNAR MÄNNISKOR' }, { ico: '🥒', name: 'EN GURKA. TROR VI.' }, { ico: '🐓', name: 'EN TUPP SOM HAR FÖRSOVIT SIG' }, { ico: '🪑', name: 'EN STOL. DEN VÄNTAR.' }];
const CUT_BACK = [[['britt', 'Vad var det där?'], ['goran', 'Ingen aning. Tillbaka till loppet!']], [['goran', 'Vackert.'], ['britt', 'Varför visade vi det?'], ['goran', 'Det var en bra dag.']], [['britt', 'Göran, vem valde det klippet?'], ['goran', 'Min mamma.']], [['goran', 'Djupt.'], ['britt', 'Mycket djupt.'], ['goran', 'Tillbaka till bilarna!']], [['britt', 'Det där stod inte ens på schemat.'], ['goran', 'Det är det som är tv, Britt-Marie!']], [['goran', 'Jag behövde det där.'], ['britt', 'Vi alla behövde det där.']]];
const STEWARDS = [
  'Pingvinen från förra loppet har tilldelats en varning och en fisk.',
  'Efter granskning i VAR – Vardagsrums-Assisterad Replay – står resultatet fast. Det gör det alltid. Ingen vet varför vi har VAR.',
  'Det är förbjudet att tuta i tunnlar, på stranden och på tisdagar.',
  'Säkerhetsbilen är en dammsugare. Följ den inte in under soffan.',
  'Det är inte tillåtet att köra baklänges för att det är roligare. Det är dock inte förbjudet heller.',
  'En tittare har anmält att en bil var för röd. Anmälan avslås. Bilen var exakt så röd som tillåtet.',
  'Paragraf 7b: den som pruttar i startfältet måste säga förlåt. Paragraf 7c: alla vet vem det var.',
  'Det är förbjudet att ha fler än fyra hjul. Undantag görs för bilar som egentligen är två bilar.',
  'En förare har anmälts för att ha vinkat för mycket. Anmälan avslås. Man kan inte vinka för mycket.',
  'Banan är till för bilar. Ankor har en egen fil. Den heter dammen.',
  'Förarna ombeds att inte äta upp målflaggan. Igen.',
  'Det är tillåtet att sjunga i bilen. Det är inte tillåtet att sjunga dåligt. Det kontrolleras inte.',
  'Ett klagomål har kommit in om att Göran pratar för högt. KLAGOMÅLET ÄR MOTTAGET, säger Göran.',
  'Bilar får inte parkera på mållinjen. Inte ens om de är väldigt trötta.',
  'Glass får ätas under loppet, men bara med båda händerna på ratten. Lycka till.',
  'Den som tappar en strumpa i depån får behålla den andra. Det är tradition.',
  'Den som kör i mål baklänges får poäng baklänges. Ingen vet hur det fungerar.',
  'Paragraf 12: det är förbjudet att knuffa. Paragraf 12b: utom när det är roligt. Paragraf 12b är struken.',
  'Regelboken är borttappad. Tills vidare gäller: var snäll och kör fort.',
  'Alla förare ska säga hej till pingvinen innan start. Pingvinen säger inte hej tillbaka. Det är okej.',
];
const NICKS = ['Kurvornas skräck', 'Ostoppbar sedan frukost', 'Har aldrig läst regelboken', 'Farligt snabb på raksträckor', 'Känd för att tuta i onödan', 'Äter däck till frukost', 'Kör bäst med vinden i ryggen', 'Har en lyckostrumpa', 'Tränar genom att sitta still', 'Vann en gång. Pratar fortfarande om det',
  'Snabbare än sin egen skugga', 'Svänger helst åt höger', 'Tutar på duvor', 'Har vunnit ett lopp i drömmen', 'Kör på pannkaksbensin', 'Bor egentligen i bilen', 'Har aldrig sett en broms', 'Kan inte vissla, men kan köra', 'Världens artigaste omkörare', 'Lite rädd för ankor',
  'Tränade på trehjuling', 'Fortfarande förvånad över allt', 'Samlar på parkeringsböter', 'Äter frukost baklänges', 'Har en hemlig turboknapp (det är tutan)', 'Snurrar hellre än svänger', 'Vet alltid var godiset finns', 'Kör bäst på tisdagar', 'Har en egen fanklubb (mamma)', 'Luktar lite korv. Kör väldigt fort'];
const NICKS_FIG = {
  me: ['Förarnas förare – hemmahjälten', 'Hemmapublikens favorit', 'Läser skyltar i 200 km/h', 'Snabbare än en nysning', 'Stadens snabbaste pizzabud'],
  glasses: ['Ser allt. Hittar inte glasögonen', 'Läser banan som en bok', 'Har extraglasögon i handskfacket'],
  crown: ['Kunglig och otålig', 'Hans majestät Gasfoten', 'Kör med krona – tappar den aldrig'],
  robot: ['Laddad till 100 %', 'Beep boop – snabb', 'Behöver uppdateras varje varv'],
  alien: ['Inte härifrån. Inte härifrån alls', 'Kommer från en planet utan rödljus', 'Har tre hjärtan och en ratt'],
  mustache: ['Mustaschens härskare', 'Mustaschen har eget körkort', 'Mustaschen styr, han gasar'],
  beard: ['Skägget är aerodynamiskt', 'Har en fågel som bor i skägget', 'Skägget kommer i mål först'],
};
const RADIO = [
  n => [[n, 'BOX BOX BOX!'], ['stall', 'Vi har ingen box. Vi har en skokartong.']],
  n => [[n, 'Mina däck är borta!'], ['stall', 'De sitter på bilen.'], [n, '... Åh.']],
  n => [[n, 'Jag är hungrig.'], ['stall', 'Kör fortare, så blir det mat fortare.']],
  n => [[n, 'Är vi framme snart?'], ['stall', 'Det är ett varvlopp. Vi kommer tillbaka hit hela tiden.']],
  n => [[n, 'Vart ska jag köra?'], ['stall', 'Framåt. Alltid framåt.']],
  n => [[n, '*prrrrt*'], ['stall', 'Vi hörde det. Alla hörde det.']],
  n => [[n, 'Jag ser en fågel!'], ['stall', 'Titta på vägen.'], [n, 'Nu ser jag vägen. Den är tråkigare.']],
  n => [[n, 'Kan ni skruva upp musiken?'], ['stall', 'Det finns ingen musik i bilen.'], [n, 'Då sjunger jag själv. BRUM BRUM.']],
  n => [[n, 'Vad är strategin?'], ['stall', 'Plan A: vinn. Plan B: se plan A.']],
  n => [[n, 'Stallet, jag har en fråga.'], ['stall', 'Ja?'], [n, 'Varför heter det ratt?'], ['stall', 'Kör bara.']],
  n => [[n, 'Jag tappade min macka!'], ['stall', 'Var?'], [n, 'I munnen. Det gick bra.']],
  n => [[n, 'Kan jag få en paus?'], ['stall', 'Det är ett lopp.'], [n, 'En liten paus?'], ['stall', 'Nej.']],
  n => [[n, 'Någon är precis bakom mig!'], ['stall', 'Det är din egen skugga.'], [n, 'Den är snabb!']],
  n => [[n, 'Vilket varv är det?'], ['stall', 'Titta på skärmen.'], [n, 'Vilken skärm?']],
  n => [[n, 'Mina händer är klibbiga.'], ['stall', 'Släpp inte ratten.'], [n, 'Den sitter fast. Bästa greppet någonsin!']],
  n => [[n, 'Jag tror att jag vinner.'], ['stall', 'Du ligger sist.'], [n, 'Jag vinner på att ligga sist!']],
  n => [[n, 'Det är en anka på banan!'], ['stall', 'Kör runt den.'], [n, 'Den kör runt MIG!']],
  n => [[n, 'Radiokoll. Ett, två, tre.'], ['stall', 'Vi hör dig.'], [n, 'Fyra, fem, sex!'], ['stall', 'Det räcker nu.']],
  n => [[n, 'Varför luktar det popcorn?'], ['stall', 'Motorn är lite för varm.'], [n, 'Mums.']],
  n => [[n, 'Är det här den snabba vägen?'], ['stall', 'Det finns bara en väg.'], [n, 'Då tar jag den!']],
  n => [[n, 'Hur går det för mig?'], ['stall', 'Bra!'], [n, 'Hur bra?'], ['stall', 'Mellan bra och jättebra.']],
  n => [[n, 'Kan vi ta en selfie?'], ['stall', 'Titta på vägen!'], [n, 'Vägen är med på bilden.']],
  n => [[n, 'Jag känner fartvinden i håret!'], ['stall', 'Du har hjälm.'], [n, 'Jag känner den i fantasin!']],
  n => [[n, 'Stallet? Hallå?'], ['stall', 'Vi är här.'], [n, 'Jag ville bara säga hej.']],
  n => [[n, 'Hur många varv är det kvar?'], ['stall', 'Två.'], [n, 'Och om jag kör dubbelt så fort?'], ['stall', 'Fortfarande två.']],
];

// ---------- Motor ----------
const SHOW = { active: false, scenes: [], i: 0, t: 0, li: -1, cur: null, token: 0, used: {} };
function showRole(who) { return typeof who === 'string' ? (CAST[who] ? CAST[who].role : 'driver') : 'driver'; }
function showWho(who) { if (typeof who === 'string') return CAST[who] || { name: who, col: '#fff' }; return { name: who.name, col: '#ffd600', fig: who.fig }; }
function showStart(scenes, onEnd) { SHOW.tk = null; SHOW.scenes = scenes; SHOW.i = -1; SHOW.onEnd = onEnd; SHOW.active = true; G.mode = 'show'; Snd.engine(false, 0); nextScene(); }
function nextScene() {
  SHOW.token++; SHOW.i++;
  if (SHOW.i >= SHOW.scenes.length) { endShow(); return; }
  const sc = SHOW.scenes[SHOW.i]; SHOW.t = 0; SHOW.li = -1; SHOW.cur = null; SHOW.linesDone = false; SHOW.doneAt = 0;
  SHOW.pos = {}; SHOW.revealT = {}; SHOW.cam = { x: W / 2, y: H / 2, z: 1 };
  if (SHOW.i > 0) { SHOW.wipe = 0.55; Snd.play('swoosh'); }
  if (sc.fx === undefined) sc.fx = pickSceneFx(sc);
  if (sc.onStart) sc.onStart(); nextLine();
}
function pickSceneFx(sc) {
  if (sc.kind === 'studio') { const k = pickFrom('sfx', ['janitor', 'cameraman', 'duck', 'none']); return k === 'none' ? null : { type: k, t0: 1.2 + Math.random() * 1.8 }; }
  if (sc.kind === 'interview') return { type: pickFrom('ifx', ['tires', 'sofa']), t0: 0.8 };
  if (sc.kind === 'anthem') { const idx = (sc.racers || []).map((r, i) => r.key !== 'me' ? i : -1).filter(i => i >= 0); return { type: 'offbeat', who: idx[Math.floor(Math.random() * idx.length)] }; }
  return null;
}
function keyOf(who) { return typeof who === 'string' ? who : 'o:' + (who && who.name); }
function nextLine() {
  const sc = SHOW.scenes[SHOW.i]; if (!sc) return; SHOW.li++;
  if (SHOW.li >= sc.lines.length) { SHOW.linesDone = true; SHOW.doneAt = SHOW.t; return; }
  const [who, text] = sc.lines[SHOW.li]; const cur = SHOW.cur = { who, text, t: 0, spoken: false, wordAt: -1 };
  const tok = ++SHOW.token;
  if (/prrr/.test(text)) Snd.horn('prutt');
  Voice.sayAs(showRole(who), text, () => { if (SHOW.token === tok) { cur.spoken = true; cur.spokenAt = cur.t; } }, () => { cur.wordAt = cur.t; });
}
// Repliken ligger kvar tills rösten är klar + lästid (så vuxna hinner läsa texten)
function lineHold(cur) { return Math.max((cur.spokenAt || 0) + 0.8, 1.4 + cur.text.length * 0.05); }
function showUpdate(dt) {
  if (!SHOW.active) return; SHOW.t += dt; const cur = SHOW.cur; if (cur) cur.t += dt;
  const sc = SHOW.scenes[SHOW.i];
  if (sc && !SHOW.linesDone && cur && cur.spoken && cur.t >= lineHold(cur)) nextLine();
  if (sc && SHOW.linesDone && SHOW.t >= (sc.dur || 2) && SHOW.t - SHOW.doneAt >= (sc.tail || 0)) nextScene();
  // kamera: långsam inzoomning, glider mot den som pratar
  const cam = SHOW.cam || (SHOW.cam = { x: W / 2, y: H / 2, z: 1 });
  let tx = W / 2, ty = H / 2, tz = 1 + Math.min(SHOW.t, 10) * 0.006;
  if (cur && !cur.spoken && !SHOW.linesDone && SHOW.pos) { const p = SHOW.pos[keyOf(cur.who)]; if (p) { tz = 1.13; tx = lerp(W / 2, p[0], 0.6); ty = lerp(H / 2, p[1], 0.4); } }
  const k = Math.min(1, dt * 2.5); cam.z += (tz - cam.z) * k; cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
  const mx = W / 2 * (1 - 1 / cam.z), my = H / 2 * (1 - 1 / cam.z); cam.x = clamp(cam.x, W / 2 - mx, W / 2 + mx); cam.y = clamp(cam.y, H / 2 - my, H / 2 + my);
  SHOW.wipe = Math.max(0, (SHOW.wipe || 0) - dt); SHOW.tick = (SHOW.tick || 0) + dt;
}
// Hur mycket munnen/huvudet ska vara öppet för den som pratar just nu
function talkOpen(who) {
  const cur = SHOW.cur; if (!cur || cur.spoken || SHOW.linesDone) return 0;
  const same = typeof who === 'string' ? cur.who === who : (cur.who === who || (cur.who && who && typeof cur.who === 'object' && cur.who.name === who.name));
  if (!same) return 0;
  const pulse = cur.wordAt >= 0 ? Math.max(0, 1 - (cur.t - cur.wordAt) / 0.3) : 0.6;
  return Math.abs(Math.sin(cur.t * 15)) * (0.45 + 0.55 * pulse);
}
function showSkip() { Voice.stop(); nextScene(); }
function showSkipAll() { Voice.stop(); SHOW.i = SHOW.scenes.length; SHOW.token++; endShow(); }
function endShow() { if (!SHOW.active) return; SHOW.active = false; Voice.stop(); const cb = SHOW.onEnd; SHOW.onEnd = null; if (cb) cb(); }
// Minnet sparas mellan turneringar (localStorage), så att samma replik inte kommer tillbaka förrän de flesta andra har visats.
function showMem() { if (!SHOW.mem) { try { SHOW.mem = JSON.parse(localStorage.getItem('turbo_show_mem') || '{}') || {}; } catch (e) { SHOW.mem = {}; } } return SHOW.mem; }
function pickFrom(key, arr) {
  const mem = showMem(), n = arr.length, keep = Math.min(n - 1, Math.ceil(n * 0.75));
  let rec = (mem[key] || []).filter(i => i < n); rec = keep > 0 ? rec.slice(-keep) : [];
  const free = arr.map((_, i) => i).filter(i => !rec.includes(i)), i = free[Math.floor(Math.random() * free.length)];
  rec.push(i); mem[key] = keep > 0 ? rec.slice(-keep) : [];
  try { localStorage.setItem('turbo_show_mem', JSON.stringify(mem)); } catch (e) { }
  return arr[i];
}
// Replik-poster kan vara färdiga listor eller funktioner som får { h: hjältens namn, gp, opp }
function showLines(entry, c) { return typeof entry === 'function' ? entry(c) : entry; }

// ---------- Manus ----------
function heroName() { return G.playerName || 'vår hjälte'; }
function nickFor(r) {
  SHOW.nick = SHOW.nick || {}; const key = r.key === 'me' ? 'me' : r.name; if (SHOW.nick[key]) return SHOW.nick[key];
  const f = r.fig || {};
  const set = r.key === 'me' ? 'me' : f.eyes === 2 ? 'glasses' : f.hair === 7 ? 'crown' : f.skin === 6 ? 'robot' : (f.skin === 4 || f.skin === 5) ? 'alien' : f.beard === 1 ? 'mustache' : f.beard >= 2 ? 'beard' : null;
  const pool = set ? NICKS_FIG[set] : NICKS; let nick = pickFrom('nick_' + (set || 'any'), pool);
  if (!set) { let g = 0; while (Object.values(SHOW.nick).includes(nick) && g++ < 10) nick = pool[Math.floor(Math.random() * pool.length)]; }
  return (SHOW.nick[key] = nick);
}
function buildPreRace(def, k, total, racers) {
  const gp = gpVariant(def.id), isFinal = def.id === 'final';
  const opps = racers.filter(r => r.key !== 'me'), H = heroName().toUpperCase(), opp = opps.length ? opps[Math.floor(Math.random() * opps.length)].name : 'Kapten Krut';
  const c = { h: heroName(), H, gp, opp };
  const sc = [];
  sc.push({ kind: 'title', gp, def, k, total, dur: 3.2, lines: [['goran', `${gp.title}! ${gp.tag}`]], onStart: () => Snd.jingle('final') });
  if (k === 0) sc.push({ kind: 'studio', dur: 1, lines: showLines(pickFrom('open', STUDIO_OPEN), c) });
  else if (isFinal) sc.push({ kind: 'studio', dur: 1, lines: showLines(pickFrom('finalstudio', STUDIO_FINAL), c) });
  else sc.push({ kind: 'studio', dur: 1, lines: showLines(pickFrom('studio', STUDIO), c) });
  const heroLine = pickFrom('gridhero', GRID_HERO)(H);
  if (k === 0) sc.push({ kind: 'grid', racers, dur: 1, lines: [['goran', pickFrom('gridopen', GRID_OPEN)], ...opps.map(o => [o, `${o.name}. ${nickFor(o).replace(/[.!]$/, '')}.`]), ['goran', heroLine]] });
  if (isFinal) sc.push({ kind: 'grid', racers, timed: true, dur: 2.5, lines: [['goran', pickFrom('gridfinal', GRID_FINAL)], ['goran', heroLine]] });
  if (k === 0) return sc; // första loppet: startfältet räcker som inslag
  const seg = isFinal ? 'anthem' : pickFrom('seg', ['anthem', 'interview', 'prof', 'ad', 'cut', 'stewards', 'interview', 'ad']);
  if (seg === 'anthem') sc.push({ kind: 'anthem', gp, def, racers, dur: 3, lines: [['goran', `Vi reser oss för nationalsången: ${gp.anthem}. Flaggan är ${gp.flagName}.`], pickFrom('anthr', ANTHEM_REACT)], onStart: () => setTimeout(() => Snd.jingle(def.id), 1800) });
  if (seg === 'interview') { const o = opps[Math.floor(Math.random() * opps.length)]; sc.push({ kind: 'interview', who: o, dur: 1, lines: interviewLines(o) }); }
  if (seg === 'prof') { const p = pickFrom('prof', PROFS); sc.push({ kind: 'prof', p, dur: 1, tail: 1.4, lines: p.lines }); }
  if (seg === 'ad') { const a = pickFrom('ad', ADS), b = pickFrom('ad', ADS); sc.push({ kind: 'ad', ad: a, dur: 2.5, lines: [['ronny', `${a.name}! ${a.slogan}`]] }); sc.push({ kind: 'ad', ad: b, dur: 2.5, lines: [['ronny', `${b.name}! ${b.slogan}`]] }); }
  if (seg === 'cut') { const cu = pickFrom('cut', CUTS); sc.push({ kind: 'cut', c: cu, dur: 2.5, lines: [['goran', 'Och nu till något helt annat.']] }); sc.push({ kind: 'studio', dur: 1, lines: pickFrom('cutback', CUT_BACK) }); }
  if (seg === 'stewards') { const st = pickFrom('stew', STEWARDS); sc.push({ kind: 'stewards', text: st, dur: 2.2, tail: 0.6, lines: [['britt', 'Tävlingsledningen meddelar: ' + st]] }); }
  return sc;
}
function interviewLines(o) {
  const n = o.name, f = o.fig || {}, car = o.d ? o.d.id : '';
  if (car === 'dino' || f.skin === 4) return pickFrom('int_dino', [
    [['ronny', `${n}, hur känns däcken idag?`], [o, 'RAAAWR!'], ['ronny', 'Tack. Det var ovanligt insiktsfullt.']],
    [['ronny', `${n}, vad åt du till frukost?`], [o, 'RAAWR.'], ['ronny', 'Jag hoppas att det inte var en kommentator.']],
    [['ronny', `${n}, något att säga till fansen?`], [o, 'rawr?'], ['ronny', 'Så gulligt. Tillbaka till studion!']]]);
  if (f.skin === 6) return pickFrom('int_robot', [
    [['ronny', `${n}! Vad är din strategi?`], [o, 'BEEP. BOOP. BEEP.'], ['ronny', 'Starka ord. Tillbaka till studion!']],
    [['ronny', `${n}, är du nervös?`], [o, 'NERVÖSITET: NOLL PROCENT. BATTERI: TRE PROCENT.'], ['ronny', 'Någon, hämta en laddare!']],
    [['ronny', `${n}, vad tycker du om människor?`], [o, 'DE ÄR LÅNGSAMMA. MEN SNÄLLA. BEEP.'], ['ronny', 'Vi tar det som en komplimang.']]]);
  if (f.eyes === 2) return pickFrom('int_glasses', [
    [['ronny', `${n}, hur har uppvärmningen gått?`], [o, 'Jag har letat efter mina glasögon.'], ['ronny', 'De sitter på huvudet.'], [o, '... Ah.']],
    [['ronny', `${n}, ser du mållinjen härifrån?`], [o, 'Jag ser en suddig korv.'], ['ronny', 'Det är jag.']]]);
  return pickFrom('int', [
    [['ronny', `${n}, hur känns bilen idag?`], [o, 'Den har fyra hjul.'], ['ronny', 'Fantastiskt! Tillbaka till studion.']],
    [['ronny', `${n}! Vad är din strategi?`], [o, 'Köra framåt.'], ['ronny', 'Revolutionerande.']],
    [['ronny', `${n}, vad åt du till frukost?`], [o, 'Bensin.'], ['ronny', 'Ingen gör så.'], [o, 'Och en banan.'], ['ronny', 'Där har vi det!']],
    [['ronny', `${n}, någon kommentar inför loppet?`], [o, '*prrrrt*'], ['ronny', 'Det ... var inte munnen. Tillbaka till studion!']],
    [['ronny', `${n}, sov du gott i natt?`], [o, 'Jag sov i bilen.'], ['ronny', 'Dedikation!'], [o, 'Jag hittade inte hem.']],
    [['ronny', `${n}, är du nervös?`], [o, 'Nej.'], ['ronny', 'Varför skakar du då?'], [o, 'Motorn är på.']],
    [['ronny', `${n}, vad är din hemlighet?`], [o, 'Jag gasar när det är dags att gasa.'], ['ronny', 'Och när är det dags?'], [o, 'Alltid.']],
    [['ronny', `${n}, vad tycker du om banan?`], [o, 'Den är lång.'], ['ronny', 'Den är rund.'], [o, 'Lång OCH rund.']],
    [['ronny', `${n}, vem är din största konkurrent?`], [o, 'Min spegelbild.'], ['ronny', 'Varför då?'], [o, 'Den härmar allt jag gör.']],
    [['ronny', `${n}, har du en lyckosak med dig?`], [o, 'En sten.'], ['ronny', 'Varför en sten?'], [o, 'Den har aldrig förlorat ett lopp.']],
    [['ronny', `${n}, hur tränar du?`], [o, 'Jag springer runt köksbordet.'], ['ronny', 'Hur många varv?'], [o, 'Tills någon säger stopp.']],
    [['ronny', `${n}, vad gör du om du vinner?`], [o, 'Äter glass.'], ['ronny', 'Och om du förlorar?'], [o, 'Äter glass.']],
    [['ronny', `${n}, vad vill du säga till dina fans?`], [o, 'Hej mamma!'], ['ronny', 'Var det ... alla fansen?'], [o, 'Ja.']],
    [['ronny', `${n}, beskriv din körstil med ett ord.`], [o, 'Vrooom.'], ['ronny', 'Det är ett ljud.'], [o, 'VROOOOM.']],
    [['ronny', `${n}, är du redo?`], [o, 'Jag föddes redo.'], ['ronny', 'Du har skorna på fel fötter.'], [o, 'Jag föddes nästan redo.']],
    [['ronny', `${n}, några sista ord innan start?`], [o, 'Var är toaletten?'], ['ronny', 'Tillbaka till studion!']],
    [['ronny', `${n}, är det sant att du pratar med din bil?`], [o, 'Ja.'], ['ronny', 'Svarar den?'], [o, 'Bara när den är på gott humör.']],
    [['ronny', `${n}, hur många varv kör ni idag?`], [o, 'Tre.'], ['ronny', 'Och hur många har du tränat på?'], [o, 'Ett. Tre gånger.']],
  ]);
}
function resultComment(place, isFinal) {
  const h = heroName().toUpperCase();
  if (place === 1) return pickFrom('r1', [[['goran', `${h} VINNER! Magnifikt! Jag gråter inte, det är avgaser.`]], [['britt', `Rättvist. ${h} var bäst. Jag är nästan imponerad. Nästan.`]], [['goran', `Historiskt! ${h} kör som en raket med glass i tanken!`]], [['goran', 'Jag har kommenterat i fyrtio år och aldrig sett något liknande!'], ['britt', 'Du började i tisdags.']],
    [['goran', `${h} flyger över mållinjen!`], ['britt', 'Kör. Bilar kör, Göran.'], ['goran', 'Det såg ut som flygning!']], [['britt', `${h} vann. Jag skriver det i min dagbok. Med utropstecken.`]], [['goran', `Guld till ${h}! Någon, ge mig en näsduk!`], ['britt', 'Här.'], ['goran', 'Det är en strumpa.']],
    [['goran', `${h} VINNER! Jag har inte varit så glad sedan jag hittade en tia i fickan!`]], [['britt', `Imponerande av ${h}. Kapten Krut ser ut att vilja byta sport.`]], [['goran', 'Vilken förare! Vilken bil! Vilken ... jag har tappat rösten!']]]);
  if (place <= 3) return pickFrom('r2', [[['goran', `En pallplats för ${h}! Historiskt!`], ['britt', 'Det finns fem bilar, Göran.'], ['goran', 'Historiskt ändå!']], [['britt', `${h} på pallen. Stabilt. Jag skulle nästan kalla det proffsigt.`]], [['goran', `${h} tar poäng! Varenda en räknas!`], ['britt', 'Det är så poäng fungerar.']],
    [['goran', `${h} på pallen! Titta, ${h} vinkar!`], ['britt', 'Jag vinkar tillbaka.']], [['britt', `Snyggt, ${h}. Nästa gång kanske högst upp.`], ['goran', 'Eller ännu högre!'], ['britt', 'Det finns inget högre.']],
    [['goran', 'En pallplats! Nästan guld, bara lite mindre guld!']], [['goran', `${h} tar pallen! Publiken jublar!`], ['britt', 'Pingvinen jublar. Det räknas.']], [['britt', `Jämn och fin körning av ${h}. Poängen trillar in.`]]]);
  return pickFrom('r4', [[['goran', `${h} tog sig i mål med stil!`], ['britt', 'Och mål är mål.']], [['britt', 'Det viktiga är att ha roligt.'], ['goran', 'Och att komma före Kapten Krut nästa gång.']], [['goran', `${h} samlar kraft inför nästa lopp. Det kallas taktik.`], ['britt', 'Det kallas en snurr.'], ['goran', 'Taktisk snurr!']],
    [['goran', `${h} kom i mål! Och åt rätt håll dessutom!`], ['britt', 'Det är mer än Göran klarar.']], [['britt', 'Alla kan inte vinna varje gång. Då skulle det bli trångt på pallen.']], [['goran', `${h} sparar krafterna till nästa lopp. Smart!`]],
    [['goran', 'Ibland vinner man, ibland lär man sig!'], ['britt', 'Och ibland snurrar man.'], ['goran', 'Då lär man sig snurra!']], [['britt', `Nästa lopp, ${h}. Nästa lopp.`], ['goran', 'Jag känner det i mustaschen!']]]);
}
function buildPress(st) {
  const w = st[0], meWon = w.key === 'me', h = heroName().toUpperCase();
  const sc = [{ kind: 'press', who: w, dur: 1, lines: [] }];
  if (meWon) sc[0].lines = pickFrom('pressme', [
    [['ronny', `${h}! Mästare i TURBO-RACE WORLD TOUR! Hur känns det?`], ['goran', 'Mästaren säger ingenting. Mästaren behöver inte säga någonting.'], ['britt', 'Det är faktiskt helt korrekt.'], ['ronny', 'Sista frågan: vad händer nu?'], ['goran', 'Nu blir det saftdusch!']],
    [['ronny', `${h}! Världsmästare! Något att säga till alla där hemma?`], ['goran', 'Titta, mästaren ler!'], ['britt', 'Det gör jag också. I smyg.'], ['ronny', 'Det var allt från presskonferensen. Nu blir det glass!']],
    [['ronny', `${h}, du har slagit hela världen! Hur känns det?`], ['goran', 'Jag vet hur det känns! FANTASTISKT!'], ['britt', 'Han frågade inte dig, Göran.'], ['goran', 'Jag svarade ändå!']],
    [['ronny', `Mästaren ${h}! Var ska pokalen stå?`], ['britt', 'På en hylla, antagligen.'], ['goran', 'Eller i sängen! Man kan sova med en pokal!'], ['ronny', 'Tack och godnatt!']],
    [['goran', `${h} har gjort det! MÄSTARE!`], ['britt', 'Jag har inga fler ord.'], ['goran', 'Jag har ALLA orden! Hurra, hurra, HURRA!'], ['ronny', 'Och där tog Görans röst slut. Godnatt!']],
  ]);
  else sc[0].lines = [['ronny', `${w.name}, du vann! Vad tänkte du i sista kurvan?`], [w, pickFrom('pressq', ['Jag tänkte på korv.', 'BRUM.', 'Jag blundade.', 'Är det över?', 'Sväng inte fel. Sen svängde jag fel.', 'Jag tänkte på min mormor. Hon kör fortare än mig.', 'Det är en hemlighet.', 'Vilken kurva?', 'Jag nynnade på en sång om fiskpinnar.', 'Mest på glass.', 'Jag glömde att tänka.', 'Att jag borde köra fort.'])], ['ronny', 'Starka ord.'],
    pickFrom('pressend', [['goran', `Och ${h} har kört ett fantastiskt mästerskap! Nästa år tar vi dem!`], ['britt', `${h} kommer tillbaka starkare. Det syns i blicken.`], ['goran', `${h}! Nästa gång är det din tur. Jag lovar. Jag bestämmer inte, men jag lovar.`], ['goran', `Hela studion hejar på ${h} i nästa turnering!`]])];
  return sc;
}

// ---------- Rita scener ----------
const TICKER = ['BREAKING: Anka hittad. Ingen skadad.', 'Pingvin nominerad till årets förare – igen.', 'Forskare bekräftar: hjul fortfarande runda.', 'Väder: 100 % chans till väder.', 'Borttappad: en strumpa. Upphittaren får behålla den andra.', 'IFSB meddelar: nya regler kommer. Eller inte.', 'Kapten Krut förnekar allt.', 'Soffans Hemlighet™ vägrar kommentera fjärrkontrollen.', 'Sport: korv slog bröd med 2–1.', 'Trafik: kö vid soffan. Välj alternativ väg via mattan.', 'Kattens åsikt om loppet: mjau.', 'Rekord: längsta tut någonsin – 4 minuter.', 'Börsen: däck upp, grus ner.', 'Tips från tävlingsledningen: gasa inte på tisdagar. Det är ändå onsdag.',
  'Glassbil fast i rondell. Glassen mår bra.', 'Rekord: Göran sa WOW 44 gånger på en timme.', 'Sniglar kräver egen tävling. Planerad till år 2090.', 'Borttappat: Britt-Maries tålamod. Ingen belöning.', 'Väder imorgon: ungefär som idag, fast imorgon.', 'Ny studie: bilar som tutar är 3 % gladare.', 'Pingvin utnämnd till hedersdomare. Kräver fisk i lön.', 'Kapten Krut: "Jag har aldrig ätit bönor." Bönorna vill inte kommentera.', 'Forskare: korv är inte bränsle. Göran håller inte med.', 'Katt somnade på tangentbordet. Resultatlistan: ffffffffff.',
  'Duva hittad i målgången. Placering: 7:a.', 'Nya däck lanseras: nu ännu rundare.', 'Tävlingsledningen letar fortfarande efter regelboken.', 'IFSB fyller 203 år. Ingen vet varför.', 'Trafik: kö av ankor vid bron.', 'Rymdvädret: kallt, mörkt och lite pip.', 'Professor Långsam har räknat till 100. Nu jobbar han på 101.', 'Sport: strumpor slog tofflor på straffar.', 'Veckans mest sökta: "hur svänger man vänster".', 'Hittegods: 14 bilnycklar och en förvirrad hamster.'];
const JANITOR = { skin: 1, hair: 6, hairCol: 5, eyes: 0, beard: 3, mouth: 0, suit: 8 };
const CREW = [{ skin: 0, hair: 9, hairCol: 0, eyes: 0, beard: 0, mouth: 1, suit: 5 }, { skin: 2, hair: 9, hairCol: 0, eyes: 1, beard: 0, mouth: 1, suit: 5 }];
function drawShow() {
  const sc = SHOW.scenes[SHOW.i]; ctx.setTransform(1, 0, 0, 1, 0, 0); if (!sc) return;
  const u = H / 1000, t = SHOW.t, T = G.time;
  const font = (s, w = 'bold') => `${w} ${s * u | 0}px "Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif`;
  const txt = (s, x, y, size, col, align = 'center', stroke = 8) => { ctx.font = font(size); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; if (stroke) { ctx.lineWidth = stroke * u; ctx.strokeStyle = '#120a2a'; ctx.strokeText(s, x, y); } ctx.fillStyle = col; ctx.fillText(s, x, y); };
  const fig = (f, x, y, R, tt, who, pose, o = {}) => { ctx.save(); ctx.translate(x, y); const talk = who ? talkOpen(who) : 0; if (pose) drawRig(ctx, f, R, tt, pose, Object.assign({ talk }, o)); else drawFigureTalk(ctx, f, R, tt, talk); ctx.restore(); if (who) SHOW.pos[keyOf(who)] = [x, y]; };
  const speaking = who => talkOpen(who) > 0 || (SHOW.cur && !SHOW.cur.spoken && keyOf(SHOW.cur.who) === keyOf(who));
  const bgGrad = (a, b) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3); };
  const fx = sc.fx, ft = fx ? t - (fx.t0 || 0) : -1;
  // kamera
  const cam = SHOW.cam || { x: W / 2, y: H / 2, z: 1 };
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
  switch (sc.kind) {
    case 'title': {
      ctx.fillStyle = '#05030f'; ctx.fillRect(-W, -H, W * 3, H * 3);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(T * 0.2); for (let k = 0; k < 16; k++) { ctx.rotate(TAU / 16); ctx.fillStyle = k % 2 ? 'rgba(255,214,0,0.08)' : 'rgba(255,255,255,0.03)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-W * 0.12, -W); ctx.lineTo(W * 0.12, -W); ctx.fill(); } ctx.restore();
      const a = Math.min(1, t * 1.5); ctx.globalAlpha = a;
      txt('IFSB PRESENTERAR', W / 2, H * 0.24, 34, '#b0bec5', 'center', 0);
      txt(`LOPP ${sc.k + 1} AV ${sc.total}`, W / 2, H * 0.31, 30, '#ffd600', 'center', 0);
      const s = 0.9 + Math.min(0.1, t * 0.05); ctx.save(); ctx.translate(W / 2, H * 0.47); ctx.scale(s, s); txt(sc.gp.title, 0, 0, sc.gp.title.length > 22 ? 84 : 104, '#ffd54f', 'center', 12); ctx.restore();
      ctx.font = font(34, 'italic bold'); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(sc.gp.tag, W / 2, H * 0.6);
      ctx.save(); ctx.translate(W / 2, H * 0.73); ctx.rotate(Math.sin(T * 2) * 0.15); txt(sc.gp.flag, 0, 0, 90, '#fff', 'center', 0); ctx.restore();
      ctx.globalAlpha = 1; break;
    }
    case 'studio': {
      bgGrad('#1a237e', '#4a148c');
      for (let k = 0; k < 6; k++) {
        const x = W * (0.08 + k * 0.17), y = H * 0.12, mw = W * 0.14, mh = H * 0.16;
        ctx.fillStyle = `rgba(64,196,255,${0.15 + 0.1 * Math.sin(T * 2 + k)})`; rr(ctx, x, y, mw, mh, 12 * u); ctx.fill();
        ctx.save(); ctx.beginPath(); rr(ctx, x, y, mw, mh, 12 * u); ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x, y + mh * 0.62, mw, 4 * u);
        const cx = x + ((T * 90 * u + k * 70 * u) % (mw + 60 * u)) - 30 * u; ctx.font = font(30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(['🏎️', '🚓', '🦖', '🛋️', '🌭', '🛁'][k], cx, y + mh * 0.5);
        ctx.restore();
      }
      if (fx && fx.type === 'janitor' && ft > 0) { // vaktmästaren moppar förbi i bakgrunden
        const x = -120 * u + ft * 110 * u, R = 32 * u; if (x < W + 200 * u) { ctx.save(); ctx.translate(x, H * 0.33); ctx.scale(-1, 1); drawRig(ctx, JANITOR, R, T, 'walk', { legs: true, prop: (c, R, h) => { c.strokeStyle = '#8d6e63'; c.lineWidth = R * 0.14; c.beginPath(); c.moveTo(h[1][0], h[1][1] - R * 0.6); c.lineTo(h[1][0] + R * 1.4, R * 3.4); c.stroke(); c.fillStyle = '#eceff1'; rr(c, h[1][0] + R * 0.9, R * 3.25, R * 1.1, R * 0.35, R * 0.1); c.fill(); } }); ctx.restore(); ctx.fillStyle = 'rgba(129,212,250,0.25)'; ctx.fillRect(x - 400 * u, H * 0.33 + 108 * u, 400 * u, 8 * u); }
      }
      fig(CAST.goran.fig, W * 0.33, H * 0.52, 120 * u, T, 'goran', speaking('goran') ? 'gesture' : 'idle');
      fig(CAST.britt.fig, W * 0.67, H * 0.52, 120 * u, T + 1, 'britt', speaking('britt') ? 'gesture' : 'idle');
      ctx.fillStyle = '#5d4037'; rr(ctx, W * 0.12, H * 0.66, W * 0.76, H * 0.16, 20 * u); ctx.fill(); ctx.fillStyle = '#ffd54f'; ctx.fillRect(W * 0.12, H * 0.66, W * 0.76, 10 * u);
      txt(CAST.goran.name, W * 0.33, H * 0.705, 24, CAST.goran.col, 'center', 5); txt(CAST.britt.name, W * 0.67, H * 0.705, 24, CAST.britt.col, 'center', 5);
      txt('TURBO-RACE WORLD TOUR', W / 2, H * 0.765, 36, '#ffd54f', 'center', 0);
      if (fx && fx.type === 'duck' && ft > 0) { const x = W * 0.1 + ft * 130 * u; if (x < W * 0.92) { ctx.save(); ctx.translate(x, H * 0.64 - Math.abs(Math.sin(ft * 8)) * 10 * u); ctx.rotate(Math.sin(ft * 8) * 0.12); ctx.scale(-1, 1); ctx.font = font(70); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🦆', 0, 0); ctx.restore(); if (!fx.q && ft > 1.5) { fx.q = 1; Snd.play('boing'); } } }
      if (fx && fx.type === 'cameraman' && ft > 0) { // en kameraman går rakt genom bild
        const x = W + 300 * u - ft * 950 * u, y = H * 0.6; if (x > -400 * u) { ctx.save(); ctx.translate(x, y + Math.abs(Math.sin(ft * 10)) * 12 * u); ctx.fillStyle = '#0b0b14'; ctx.beginPath(); ctx.arc(0, 0, 150 * u, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 330 * u, 260 * u, 220 * u, 0, 0, TAU); ctx.fill(); rr(ctx, -330 * u, -60 * u, 260 * u, 150 * u, 20 * u); ctx.fill(); ctx.beginPath(); ctx.arc(-340 * u, 15 * u, 55 * u, 0, TAU); ctx.fill(); ctx.fillStyle = '#ff1744'; ctx.beginPath(); ctx.arc(-120 * u, -30 * u, 10 * u, 0, TAU); ctx.fill(); ctx.restore(); }
      }
      break;
    }
    case 'grid': {
      bgGrad('#263238', '#101820');
      for (let k = 0; k < 20; k++) { ctx.fillStyle = k % 2 ? '#fff' : '#111'; ctx.fillRect(k * W / 20, H * 0.08, W / 20, 16 * u); ctx.fillStyle = k % 2 ? '#111' : '#fff'; ctx.fillRect(k * W / 20, H * 0.08 + 16 * u, W / 20, 16 * u); }
      txt('STARTFÄLTET', W / 2, H * 0.19, 60, '#ffd600');
      const rs = [...sc.racers.filter(r => r.key !== 'me'), ...sc.racers.filter(r => r.key === 'me')], n = rs.length, cw = Math.min(W / n - 20 * u, 300 * u);
      const shown = sc.timed ? Math.min(n, Math.floor(t * 2.5) + 1) : SHOW.linesDone ? n : Math.min(n, Math.max(1, SHOW.li + 1));
      const heroTalk = SHOW.li === sc.lines.length - 1 && SHOW.cur && !SHOW.cur.spoken;
      rs.forEach((r, k) => {
        if (k >= shown) return; if (SHOW.revealT[k] == null) { SHOW.revealT[k] = t; Snd.play('tick'); }
        const flip = Math.min(1, (t - SHOW.revealT[k]) * 5), x = W / 2 + (k - (n - 1) / 2) * (cw + 20 * u), y = H * 0.52;
        ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.02, flip), 1);
        ctx.fillStyle = r.key === 'me' ? 'rgba(255,214,0,0.95)' : 'rgba(255,255,255,0.92)'; rr(ctx, -cw / 2, -230 * u, cw, 430 * u, 22 * u); ctx.fill();
        ctx.restore();
        if (flip < 0.6) return;
        const pose = r.key === 'me' ? (heroTalk || SHOW.linesDone ? 'cheer' : 'idle') : (speaking(r) ? 'wave' : 'idle');
        ctx.save(); ctx.beginPath(); rr(ctx, x - cw / 2, y - 230 * u, cw, 430 * u, 22 * u); ctx.clip();
        fig(r.fig, x, y - 95 * u, 55 * u, T + k, r, pose);
        ctx.restore();
        ctx.save(); ctx.translate(x, y + 95 * u); ctx.scale(1.5 * u, 1.5 * u); drawCar(ctx, r.d, T); ctx.restore();
        txt(r.name, x, y + 145 * u, r.name.length > 12 ? 20 : 26, '#1a1033', 'center', 0);
        ctx.font = font(17, 'italic'); ctx.fillStyle = '#37474f'; ctx.textAlign = 'center'; wrapText(nickFor(r), x, y + 175 * u, cw - 20 * u, 22 * u);
      });
      break;
    }
    case 'anthem': {
      bgGrad('#4fc3f7', '#e1f5fe');
      // publik med tändare
      for (let k = 0; k < 22; k++) { const side = k < 11 ? 0 : 1, x = side ? W * (0.8 + (k - 11) * 0.02) : W * (0.02 + k * 0.02), y = H * (0.72 + (k % 3) * 0.04); ctx.fillStyle = '#37474f'; ctx.beginPath(); ctx.arc(x, y, 22 * u, 0, TAU); ctx.fill(); ctx.fillRect(x - 24 * u, y + 18 * u, 48 * u, 60 * u); if (k % 2 === 0) { const sw = Math.sin(T * 1.5 + k) * 10 * u; ctx.strokeStyle = '#37474f'; ctx.lineWidth = 8 * u; ctx.beginPath(); ctx.moveTo(x + 18 * u, y + 20 * u); ctx.lineTo(x + 26 * u + sw, y - 40 * u); ctx.stroke(); ctx.fillStyle = '#ffab00'; ctx.beginPath(); ctx.ellipse(x + 26 * u + sw, y - 56 * u, 7 * u, 13 * u + Math.sin(T * 12 + k) * 3 * u, 0, 0, TAU); ctx.fill(); } }
      // flaggstång + vajande flagga
      const px = W / 2 - 180 * u, top = H * 0.14; ctx.fillStyle = '#9e9e9e'; ctx.fillRect(px - 6 * u, top, 12 * u, H * 0.5); ctx.fillStyle = '#ffd600'; ctx.beginPath(); ctx.arc(px, top, 14 * u, 0, TAU); ctx.fill();
      const fw = 360 * u, fh = 220 * u, N = 30, wave = i => Math.sin(T * 4 - i * 0.45) * 16 * u * (i / N);
      for (let i = 0; i < N; i++) { const x0 = px + i * fw / N, y0 = top + 10 * u + wave(i); const sh = 0.85 + 0.15 * Math.cos(T * 4 - i * 0.45); ctx.fillStyle = `rgb(${229 * sh | 0},${57 * sh | 0},${53 * sh | 0})`; ctx.fillRect(x0, y0, fw / N + 1, fh); ctx.fillStyle = `rgba(255,255,255,${0.9 * sh})`; ctx.fillRect(x0, y0 + fh * 0.42, fw / N + 1, fh * 0.16); }
      ctx.save(); ctx.translate(px + fw * 0.5, top + 10 * u + fh / 2 + wave(N / 2)); txt(sc.gp.flag, 0, 0, 110, '#fff', 'center', 0); ctx.restore();
      for (let k = 0; k < 6; k++) { const ph = (T * 0.5 + k / 6) % 1; ctx.globalAlpha = 1 - ph; txt(['♪', '♫'][k % 2], W * (0.62 + (k % 3) * 0.1) + Math.sin(T + k) * 30 * u, H * (0.55 - ph * 0.4), 60, '#1a237e', 'center', 0); } ctx.globalAlpha = 1;
      const rs = sc.racers; rs.forEach((r, k) => { const x = W / 2 + (k - (rs.length - 1) / 2) * 190 * u; const off = fx && fx.type === 'offbeat' && k === fx.who; fig(r.fig, x, H * 0.56, 46 * u, T + k * 0.3, null, off ? 'korv' : 'heart', { legs: true }); });
      txt('NATIONALSÅNG', W / 2, H * 0.09, 50, '#1a237e', 'center', 0);
      break;
    }
    case 'interview': {
      bgGrad('#455a64', '#263238');
      ctx.fillStyle = '#37474f'; ctx.fillRect(-W, H * 0.44, W * 3, H); // depågolv
      for (let k = 0; k < 5; k++) { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(W * 0.08, H * (0.3 + k * 0.1), 50 * u, 0, TAU); ctx.fill(); ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(W * 0.08, H * (0.3 + k * 0.1), 24 * u, 0, TAU); ctx.fill(); }
      if (fx && ft > 0) {
        const R = 30 * u, x = -150 * u + ft * (fx.type === 'tires' ? 420 : 220) * u, y = H * 0.24;
        const tire = (c, R, h) => { const mx = (h[0][0] + h[1][0]) / 2, my = Math.min(h[0][1], h[1][1]) - R * 0.5; c.fillStyle = '#111'; c.beginPath(); c.arc(mx, my, R * 0.9, 0, TAU); c.fill(); c.fillStyle = '#555'; c.beginPath(); c.arc(mx, my, R * 0.4, 0, TAU); c.fill(); };
        if (fx.type === 'tires') { for (let k = 0; k < 2; k++) { ctx.save(); ctx.translate(x - k * 150 * u, y); drawRig(ctx, CREW[k], R, T + k, 'carry', { legs: true, prop: tire }); ctx.restore(); } }
        else { const x2 = x - 220 * u; ctx.fillStyle = '#7e57c2'; rr(ctx, x2 - 20 * u, y - 70 * u, 260 * u, 55 * u, 14 * u); ctx.fill(); rr(ctx, x2 - 20 * u, y - 115 * u, 260 * u, 45 * u, 14 * u); ctx.fill(); for (let k = 0; k < 2; k++) { ctx.save(); ctx.translate(x - k * 220 * u, y); drawRig(ctx, CREW[k], R, T + k * 0.5, 'carry', { legs: true }); ctx.restore(); } }
      }
      txt('📍 DEPÅN', W / 2, H * 0.13, 44, '#76ff03');
      fig(CAST.ronny.fig, W * 0.35, H * 0.5, 110 * u, T, 'ronny', 'mic', { prop: (c, R, h) => { const [x, y] = h[1]; c.fillStyle = '#212121'; c.save(); c.translate(x, y); c.rotate(-0.9); c.fillRect(-R * 0.08, -R * 0.1, R * 0.16, R * 0.7); c.beginPath(); c.arc(0, -R * 0.2, R * 0.2, 0, TAU); c.fill(); c.restore(); } });
      fig(sc.who.fig, W * 0.65, H * 0.5, 110 * u, T + 2, sc.who, speaking(sc.who) ? 'gesture' : 'idle');
      if (sc.who.d) { ctx.save(); ctx.translate(W * 0.84, H * 0.7); ctx.scale(2.2 * u, 2.2 * u); drawCar(ctx, sc.who.d, T); ctx.restore(); }
      txt(CAST.ronny.name, W * 0.35, H * 0.765, 26, CAST.ronny.col, 'center', 5); txt(sc.who.name, W * 0.65, H * 0.765, 26, '#ffd600', 'center', 5);
      break;
    }
    case 'prof': {
      bgGrad('#1b5e20', '#0d3311');
      const fall = SHOW.linesDone ? clamp((t - SHOW.doneAt) / 0.8, 0, 1) : 0; if (fall >= 1 && !sc.fell) { sc.fell = 1; Snd.play('bonk'); G.cam && (SHOW.cam.z += 0.04); }
      ctx.save(); ctx.translate(W * 0.94, H * 0.74); ctx.rotate(fall * fall * 1.45); ctx.translate(-W * 0.94, -H * 0.74);
      ctx.fillStyle = '#2e7d32'; ctx.fillRect(W * 0.46, H * 0.12, W * 0.48, H * 0.62); ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 18 * u; ctx.strokeRect(W * 0.46, H * 0.12, W * 0.48, H * 0.62);
      txt(sc.p.title, W * 0.7, H * 0.2, 40, '#fff', 'center', 0);
      drawChart(sc.p.chart, W * 0.7, H * 0.46, 170 * u, T, u, sc.p);
      ctx.restore();
      fig(CAST.prof.fig, W * 0.24, H * 0.5, 120 * u, T, 'prof', fall >= 1 ? 'sulk' : 'point', { prop: fall > 0 ? null : (c, R, h) => { const [x, y] = h[1]; c.strokeStyle = '#a1887f'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(x, y); c.lineTo(x + R * 2.4, y - R * 0.5 + Math.sin(T * 3) * R * 0.15); c.stroke(); } });
      txt(CAST.prof.name, W * 0.24, H * 0.765, 24, CAST.prof.col, 'center', 5);
      break;
    }
    case 'ad': {
      ctx.fillStyle = sc.ad.col; ctx.fillRect(-W, -H, W * 3, H * 3);
      ctx.save(); ctx.translate(W * 0.3, H * 0.45); ctx.rotate(T * 0.6); for (let k = 0; k < 12; k++) { ctx.rotate(TAU / 12); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-60 * u, -W); ctx.lineTo(60 * u, -W); ctx.fill(); } ctx.restore();
      const b = Math.abs(Math.sin(T * 4)); ctx.save(); ctx.translate(W * 0.3, H * 0.5 - b * 40 * u); ctx.scale(1 + (1 - b) * 0.08, 1 - (1 - b) * 0.08); txt(sc.ad.ico, 0, 0, 240, '#fff', 'center', 0); ctx.restore();
      ctx.fillStyle = '#ffeb3b'; ctx.fillRect(W * 0.03, H * 0.07, 170 * u, 50 * u); txt('REKLAM', W * 0.03 + 85 * u, H * 0.07 + 25 * u, 30, '#1a1033', 'center', 0);
      ctx.save(); ctx.translate(W * 0.7, H * 0.4); ctx.rotate(-0.06 + Math.sin(T * 3) * 0.02); txt(sc.ad.name, 0, 0, sc.ad.name.length > 16 ? 50 : 70, '#fff', 'center', 10); ctx.restore();
      ctx.font = font(34); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; wrapText(sc.ad.slogan, W * 0.7, H * 0.55, W * 0.5, 44 * u);
      const fine = '*Villkor gäller. Kan innehålla spår av produkt. Ej lämplig för bilar under 3 år. Läs bruksanvisningen upp och ned. Resultatet kan variera. Varierat resultat kan resultera. Förpackningen är inte ätbar. Det är inte heller produkten. IFSB tar inget ansvar för något, någonsin.';
      ctx.font = font(18, '600'); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'left'; const fw = ctx.measureText(fine).width; ctx.fillText(fine, W - ((t * 1100 * u) % (fw + W)), H * 0.77);
      break;
    }
    case 'cut': {
      ctx.fillStyle = '#f3e5ab'; ctx.fillRect(-W, -H, W * 3, H * 3);
      txt('OCH NU TILL NÅGOT HELT ANNAT.', W / 2, H * 0.18, 56, '#3e2723', 'center', 0);
      if (t > 0.9) { ctx.save(); ctx.translate(W / 2, H * 0.5); ctx.rotate(Math.sin(T * 1.2) * 0.1); ctx.scale(1 + Math.sin(T * 2) * 0.03, 1 + Math.sin(T * 2) * 0.03); txt(sc.c.ico, 0, 0, 300, '#fff', 'center', 0); ctx.restore(); txt(sc.c.name, W / 2, H * 0.75, 44, '#3e2723', 'center', 0); }
      break;
    }
    case 'stewards': {
      bgGrad('#3e2723', '#1b0f0b');
      ctx.fillStyle = '#fff8e1'; rr(ctx, W * 0.18, H * 0.12, W * 0.64, H * 0.66, 12 * u); ctx.fill();
      txt('TÄVLINGSLEDNINGEN MEDDELAR', W / 2, H * 0.2, 44, '#3e2723', 'center', 0);
      ctx.font = font(34, '600'); ctx.fillStyle = '#3e2723'; ctx.textAlign = 'center'; wrapText(sc.text, W / 2, H * 0.34, W * 0.56, 46 * u);
      if (t > 1.2) { const s = Math.max(1, 3.2 - (t - 1.2) * 9); if (s === 1 && !sc.stamped) { sc.stamped = 1; Snd.play('bonk'); } ctx.save(); ctx.translate(W * 0.7, H * 0.66); ctx.rotate(-0.25); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, (t - 1.2) * 5); ctx.strokeStyle = '#e53935'; ctx.lineWidth = 8 * u; ctx.strokeRect(-140 * u, -44 * u, 280 * u, 88 * u); txt('BESLUT ✔', 0, 0, 44, '#e53935', 'center', 0); ctx.restore(); ctx.globalAlpha = 1; }
      break;
    }
    case 'press': {
      bgGrad('#0d47a1', '#1a237e');
      ctx.globalAlpha = 0.07; for (let y = 1; y < 5; y++) for (let x = 0; x < 8; x++) txt('IFSB', W * (0.06 + x * 0.13), H * (0.1 + y * 0.15), 40, '#fff', 'center', 0); ctx.globalAlpha = 1;
      txt('PRESSKONFERENS', W / 2, H * 0.13, 50, '#ffd600');
      fig(sc.who.fig, W / 2, H * 0.34, 110 * u, T, sc.who, 'hold', { prop: (c, R, h) => drawTrophy(c, 0, R * 1.75 - Math.abs(Math.sin(T * 3)) * R * 0.1, R / 175, T) });
      ctx.fillStyle = '#263238'; rr(ctx, W * 0.2, H * 0.64, W * 0.6, H * 0.12, 14 * u); ctx.fill(); txt((sc.who.key === 'me' ? heroName().toUpperCase() : sc.who.name) + ' – MÄSTARE', W / 2, H * 0.7, 34, '#ffd600', 'center', 0);
      for (let k = 0; k < 5; k++) { const x = W * (0.32 + k * 0.09); ctx.fillStyle = '#111'; ctx.fillRect(x - 4 * u, H * 0.58, 8 * u, H * 0.06); ctx.fillStyle = TOY_COLS[k]; ctx.beginPath(); ctx.arc(x, H * 0.58, 16 * u, 0, TAU); ctx.fill(); }
      fig(CAST.ronny.fig, W * 0.12, H * 0.62, 70 * u, T + 3, 'ronny', 'mic');
      if (Math.random() < 0.08) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-W, -H, W * 3, H * 3); }
      break;
    }
  }
  ctx.restore();
  // LIVE-skylt
  if (!['ad', 'cut', 'title'].includes(sc.kind)) {
    const x = W * 0.03, y = H * 0.07; ctx.fillStyle = '#d50000'; rr(ctx, x, y, 128 * u, 44 * u, 10 * u); ctx.fill();
    ctx.fillStyle = Math.floor(T * 2) % 2 ? '#fff' : '#ff8a80'; ctx.beginPath(); ctx.arc(x + 24 * u, y + 22 * u, 9 * u, 0, TAU); ctx.fill();
    txt('LIVE', x + 78 * u, y + 23 * u, 28, '#fff', 'center', 0); txt('*nästan', x + 140 * u, y + 24 * u, 18, 'rgba(255,255,255,0.75)', 'left', 0);
  }
  // letterbox + nyhetsrad
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H * 0.045); ctx.fillRect(0, H * 0.955, W, H * 0.045);
  { if (!SHOW.tk) SHOW.tk = shuffle(TICKER.slice()).slice(0, 12); const tk = SHOW.tk.join('   ★   '); ctx.font = font(22, '600'); const tw = ctx.measureText(tk + '   ★   ').width; ctx.fillStyle = '#ffd600'; ctx.fillRect(0, H * 0.955, 150 * u, H * 0.045); txt('NYHETER', 75 * u, H * 0.9775, 20, '#120a2a', 'center', 0);
    ctx.save(); ctx.beginPath(); ctx.rect(150 * u, H * 0.955, W, H * 0.045); ctx.clip(); ctx.font = font(22, '600'); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; const x0 = 160 * u + W - ((SHOW.tick || 0) * 130 * u) % (tw + W); ctx.fillText(tk, x0, H * 0.9775); ctx.fillText(tk, x0 + tw, H * 0.9775); ctx.restore(); }
  ctx.globalAlpha = 0.7; txt('ENTER = HOPPA ÖVER · ESC = TILL LOPPET', W - 20 * u, H * 0.0225, 18, '#fff', 'right', 0); ctx.globalAlpha = 1;
  // undertext med inglidande namnskylt
  if (SHOW.cur) {
    const w = showWho(SHOW.cur.who); const bw = W * 0.8, bx = (W - bw) / 2, by = H * 0.83;
    ctx.fillStyle = 'rgba(0,0,0,0.72)'; rr(ctx, bx, by, bw, H * 0.11, 16 * u); ctx.fill();
    const e = Math.min(1, SHOW.cur.t * 4), slide = (1 - e) * (1 - e) * -260 * u;
    ctx.globalAlpha = e; ctx.fillStyle = w.col; rr(ctx, bx + 16 * u + slide, by - 22 * u, Math.min(bw * 0.6, (w.name.length * 17 + 30) * u), 40 * u, 10 * u); ctx.fill();
    txt(w.name, bx + 30 * u + slide, by - 2 * u, 24, '#120a2a', 'left', 0); ctx.globalAlpha = 1;
    ctx.font = font(32, '600'); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const shown = SHOW.cur.text.slice(0, Math.floor(SHOW.cur.t * 45) + 1); wrapText(shown, W / 2, by + H * 0.055 - (shown.length > 60 ? 18 * u : 0), bw - 60 * u, 38 * u);
  }
  // scenbyte: IFSB-svep
  if (SHOW.wipe > 0) {
    const p = 1 - SHOW.wipe / 0.55, x = -W * 0.7 + p * W * 2.3;
    ctx.fillStyle = '#ffd600'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + W * 0.45, 0); ctx.lineTo(x + W * 0.3, H); ctx.lineTo(x - W * 0.15, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#120a2a'; ctx.beginPath(); ctx.moveTo(x + W * 0.45, 0); ctx.lineTo(x + W * 0.49, 0); ctx.lineTo(x + W * 0.34, H); ctx.lineTo(x + W * 0.3, H); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(x + W * 0.15, H / 2); ctx.rotate(-0.3); txt('IFSB', 0, 0, 120, '#120a2a', 'center', 0); ctx.restore();
  }
}
function wrapText(s, x, y, maxW, lh) {
  const words = s.split(' '); let line = '', lines = [];
  for (const w of words) { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; }
  lines.push(line); lines.forEach((l, k) => ctx.fillText(l, x, y + k * lh));
}
function drawChart(kind, x, y, R, t, u, P) {
  const lbl = (s, xx, yy, size = 26, col = '#fff') => { ctx.font = `bold ${size * u | 0}px Arial`; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, xx, yy); };
  if (kind === 'pie' || kind === 'half' || kind === 'pie2' || kind === 'pieP') {
    const parts = kind === 'pieP' ? P.parts : kind === 'pie' ? [[1, '#ffd600', 'SNABBAST 100 %']] : kind === 'half' ? [[0.5, '#40c4ff', 'REGN'], [0.5, '#ffd600', 'INTE REGN']] : [[0.97, '#ff7043', 'ETT VARV'], [0.03, '#fff', 'KORV']];
    let a0 = -Math.PI / 2; for (const [f, c] of parts) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, R, a0, a0 + f * TAU); ctx.closePath(); ctx.fill(); a0 += f * TAU; }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4 * u; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.stroke();
    parts.forEach((p, k) => lbl(p[2], x, y + R + 40 * u + k * 34 * u, 26));
  } else if (kind === 'bars') {
    const bs = P.bars, n = bs.length, bw = 2 * R / n;
    bs.forEach(([lab, v], k) => { const h = 2 * R * v * Math.min(1, t * 0.8); ctx.fillStyle = ['#ffd600', '#76ff03', '#ff7043', '#40c4ff'][k % 4]; ctx.fillRect(x - R + k * bw + bw * 0.15, y + R - h, bw * 0.7, h); lbl(lab, x - R + k * bw + bw / 2, y + R + 30 * u, 22); });
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4 * u; ctx.beginPath(); ctx.moveTo(x - R, y + R); ctx.lineTo(x + R, y + R); ctx.stroke();
  } else if (kind === 'brum') {
    ['BRUM', 'BRUM', 'BRUM'].forEach((s, k) => { const h = R * (0.9 + Math.sin(t * 3 + k) * 0.1); ctx.fillStyle = ['#ff7043', '#ffd600', '#76ff03'][k]; ctx.fillRect(x - R + k * R * 0.7, y + R - h, R * 0.5, h); lbl(s, x - R + k * R * 0.7 + R * 0.25, y + R + 30 * u); });
  } else {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4 * u; ctx.beginPath(); ctx.moveTo(x - R, y - R); ctx.lineTo(x - R, y + R); ctx.lineTo(x + R, y + R); ctx.stroke();
    ctx.strokeStyle = '#ffd600'; ctx.lineWidth = 8 * u; ctx.beginPath(); for (let k = 0; k <= 20; k++) { const px = x - R + k / 20 * 2 * R, f = kind === 'down' ? 1 - k / 20 : k / 20, py = y + R - f * 2 * R * Math.min(1, t * 0.6) + Math.sin(k * 1.7) * 12 * u; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
    lbl('???', x, y + R + 34 * u);
  }
}

// ---------- Under loppet: stallradio & tävlingsledning ----------
function showRaceTick(dt) {
  if (!CUP.active || !SETTINGS.show || G.mode !== 'race') return;
  G.radioT = (G.radioT == null ? 14 : G.radioT) - dt;
  if (G.radio) { G.radio.t -= dt; if (G.radio.t <= 0) G.radio = null; }
  if (G.radioT <= 0 && !G.radio) {
    G.radioT = 22 + Math.random() * 14;
    const opp = G.cars.filter(c => !c.isPlayer); const c = opp[Math.floor(Math.random() * opp.length)]; if (!c) return;
    G.radio = { lines: pickFrom('radio', RADIO)(c.who.name), t: 7, icon: '📻' }; Snd.play('tick'); if (G.radio.lines.some(l => /prrr/.test(l[1]))) Snd.horn('prutt');
  }
}
function showStewardSpin(c) {
  if (!CUP.active || !SETTINGS.show || c.isPlayer || G.radio || Math.random() > 0.35) return;
  G.radio = { lines: [['britt', `Tävlingsledningen utreder en snurr av ${c.who.name}. Snurren bedöms som ${pickFrom('snurr', ['otillåtet snurrig', 'onödigt elegant', 'medsols', 'moturs, vilket är värre', 'lite för snurrig för en tisdag', 'mycket vacker. Åtta poäng', 'godkänd, men bara nätt och jämnt', 'som en tvättmaskin', 'ett dansnummer', 'snurrig, men artig'])}.`]], t: 6, icon: '⚖️' };
}
function drawRadio(u) {
  const R = G.radio; if (!R) return; const lines = R.lines;
  const bw = W * 0.6, bx = (W - bw) / 2, fb = `bold ${26 * u | 0}px "Arial Rounded MT Bold", Arial`, fn = `600 ${24 * u | 0}px "Arial Rounded MT Bold", Arial`;
  // radbryt varje replik
  const rows = [];
  for (const [who, text] of lines) {
    const w = showWho(who), nm = R.icon + ' ' + w.name + ': '; ctx.font = fb; const nw = ctx.measureText(nm).width; ctx.font = fn;
    let line = '', first = true;
    for (const word of text.split(' ')) { const test = line ? line + ' ' + word : word; if (ctx.measureText(test).width > bw - 40 * u - (first ? nw : 0) && line) { rows.push({ nm: first ? nm : '', col: w.col, text: line, ind: first ? nw : 0 }); first = false; line = word; } else line = test; }
    rows.push({ nm: first ? nm : '', col: w.col, text: line, ind: first ? nw : 0 });
  }
  const bh = (24 + rows.length * 34) * u, by = H - bh - 30 * u;
  ctx.globalAlpha = Math.min(1, R.t * 2); ctx.fillStyle = 'rgba(10,5,30,0.82)'; rr(ctx, bx, by, bw, bh, 18 * u); ctx.fill();
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  rows.forEach((r, k) => { const y = by + (29 + k * 34) * u; if (r.nm) { ctx.font = fb; ctx.fillStyle = r.col; ctx.fillText(r.nm, bx + 20 * u, y); } ctx.font = fn; ctx.fillStyle = '#fff'; ctx.fillText(r.text, bx + 20 * u + r.ind, y); });
  ctx.globalAlpha = 1;
}

const ROCKET_LINES = ['RAKETSTART! Vilken reaktion! Snabbare än en nysning!', 'RAKETSTART! Jag såg det inte ens. Ingen såg det!', 'RAKETSTART! Britt-Marie, spillde du kaffe?', 'RAKETSTART! Däcken hann inte ens säga hej då!', 'RAKETSTART! Snabbare än en elefant som nyser!', 'RAKETSTART! Jag tappade mikrofonen!', 'RAKETSTART! Spola tillbaka! Vi har ingen spola-tillbaka-knapp!', 'RAKETSTART! Jag blinkade och missade allt!'];
