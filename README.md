# Kitsune no Michi — RPG top-down (Canvas 2D, JS ES modules, zero dipendenze)

Avvio: `python3 tests/server.py` nella cartella, poi http://localhost:8765 (aggiungi `?debug` per i cheat: F1 livello 20 + abilità + mezzi, F2 mappa successiva, F3 god mode).
Test: apri http://localhost:8765/tests/index.html (il risultato viene salvato in tests/result.txt; oppure `node tests/smoke.mjs`).

## Architettura
- `core/` loop a passo fisso 60 Hz, input (azioni astratte), pila di scene, event bus.
- `engine/` TileMap (2 layer), collisioni AABB a sub-step + spatial hash, World, Atmosphere (giorno/notte, meteo per bioma, luci), Sprites procedurali, UI.
- `world/Generators.js` generatori per overworld, grotte, interni, dimensione parallela, cyber-città, abissi.
- `data/` tutto il contenuto dichiarativo: tiles, world (mappe, città, sentieri, requisiti d'accesso), items, enemies, npcs, dialogues, quests, abilities, mounts.
- `systems/` Script (condizioni/effetti), Inventory (5 categorie, equip, crafting), Quests, GameState (XP solo da kill, sblocco abilità livello+trama, salvataggio).
- `entities/` Player, Enemy (fisico/distanza/boss a fasi), NPC, Prop, Projectile, Pickup. `abilities/` Dash, Fuoco, Fiamma Nera.
- `scenes/` Titolo, Creazione, Mondo, Dialogo, Menu, Negozio, Morte, Crediti.

## Stato
Implementati e collegati: tutti i sistemi sopra, 19 mappe, 9 boss, 20 NPC, trama in 8 atti. Test di fumo nel browser: 0 errori (dati, raggiungibilità di tutte le mappe, boss, salvataggio). Resta da verificare a occhio la resa grafica e da bilanciare.

## Novità (seconda iterazione)
- **Mondo 4x**: overworld 320x224, avamposti sicuri (locande + santuari) e 6 santuari isolati lungo le strade; ~70 mappe.
- **Livelli in altezza**: dungeon a 2-3 livelli (scale giù/su), Monti Shirayuki e Canyon di Ryūko in 3 quote, cantine/soffitte negli edifici,
  torre dell'orologio a 4 piani, grattacielo con ascensore e tetto, fogne di Neo-Edo (dati in `src/data/world.js`: `stairs`, `next`/`prev`, `elevator`).
- **Mappa del gioco** (menu → scheda *Mappa*): nebbia di guerra, solo luoghi esplorati e punti d'interesse scoperti; salvata con la partita.
- **Audio**: chiptune sintetizzato con Web Audio (`src/audio/`): 22 brani originali (per bioma, giorno/notte, città, combattimento, boss) e 33 effetti. `N` = muto.
- **Nemici e NPC unici**: ogni nemico ha sagoma, accessori e un tratto (`src/entities/traits.js`); ogni boss ha attacchi firma; ogni NPC ha aspetto, animazioni (quirk) e orari.

## Terza iterazione — mondo aperto 20×
- **Mondo 640×576** (20,6× l'originale), generato da regni in diagramma di Voronoi deformato: **nessuna struttura ad anelli**. I confini tra regni diventano catene montuose con valichi naturali; 18 biomi
  (praterie, foreste, foresta primigenia, bosco incantato, bosco infestato, paludi nebbiose, deserti e mare di dune, calanchi, tundra, nevi, vulcano, valli di giada, altopiano, giungla, monti, canyon, coste, arcipelago).
- **Fiumi** dai monti al mare, **strade A\*** tra gli insediamenti con ponti, **radure nascoste** tra i monti raggiungibili solo con l'aquila, isole raggiungibili a nuoto.
- **Caricamento a chunk** (32×32 tile): al massimo ~80-300 entità attive nonostante 368.000 tile.
- **10 insediamenti** di civiltà diverse (villaggio giapponese, capitale medievale con castello/cattedrale/torri, città cinese, città imperiale con anfiteatro e acquedotto, città elfica sugli alberi, città del deserto, porto, villaggio tribale, distretto cyberpunk, isola su palafitte) + città nanica e città sotterranea.
- **Spiriti**: anime buone (parlano, danno missioni e luoghi segreti), spiriti della natura, guardiani con enigmi, oracoli, anime erranti (si placano con l'incenso), più spettri, banshee e altri non morti ostili. Regno degli Spiriti (di notte).
- **Notte**: luna con fasi, stelle, lucciole, nebbia, creature notturne, suoni ambientali (grilli, civette, rane, vento…).
- **Combattimento**: difesa con parata perfetta, schivata, stamina, **arco** con carica, mira (mouse/stick/auto) e frecce normali/incendiarie/avvelenate/magiche.
- **Creazione personaggio** (nome, sesso, aspetto, dono), **controlli touch**, **salvataggi a slot**, **PWA**: vedi `DEPLOY.md`.

## Quarta iterazione — città vive, progressione, crafting, Limbo
- **Città**: finestre (illuminate / buie / con imposte), porte, balconi, colonne, insegne, lampioni e torce (si accendono di notte), pozzi, panchine, carri, fiori. Hinomura e Aurelburg si estendono oltre le mura vecchie; le città di civiltà hanno ~2× la superficie e quartieri (mercato, artigiani, giardini, popolare) con stili diversi. Le case di quartiere hanno la porta chiusa (non visitabili); gli edifici con porta aperta hanno interno.
- **Guardia**: tieni **U/C** (o *Dif*). Ha una resistenza (GUA) che cala a ogni colpo: leggero ×1, pesante ×1,8, speciale di boss ×3. A zero la guardia si **spezza** (stordimento, vulnerabile, bloccata finché non si rigenera al 40%). Cresce con livello, dono *Vigore* e oggetti con stat `guard` (Amuleto del Limbo).
- **Barre con etichetta**: PV · KI · STA · GUA · ESP.
- **Progressione**: i regni esterni sono in 3 livelli d'accesso; i confini sono sigillati da barriere (masso → katana; frana → *Carica da Demolizione*; muro di ghiaccio → fuoco o bomba incendiaria; cancello sorvegliato → requisiti + guardiano; ponte interrotto → 4 Assi da Ponte o gelo). Requisiti: livello, missioni, boss/abilità. Volo e nuoto non scavalcano i regni sigillati.
- **Crafting**: Banco da lavoro (esplosivi) e Tavolo alchemico (pozioni) nelle città; ricette da trovare/comprare (avviso quando si sbloccano). Esplosivi: **Z** lancia, **O/G** cambia (G in modalità katana). Pozioni elementali (Ghiaccio, Fulmine, Acqua): **P** usa il potere per 2 minuti; acqua + fulmine = sinergia.
- **Limbo**: alla **terza morte consecutiva** (si azzera con livello, boss, riposo in locanda) l'anima finisce nel Limbo — 5 conformazioni, mai la stessa due volte di fila, seed diverso a ogni ciclo. Prove: enigma delle rune, Cuore della Rinascita (guardiano), orde di scheletri. Si rinasce (sequenza luminosa) nel centro abitato più vicino al luogo della morte.
- Test: `python3 tests/server.py` e apri `http://localhost:8765/tests/index.html`.

## Quinta iterazione — evoluzione del mondo
- **Nove nuovi territori** (640×576 tile ciascuno, generati solo quando vi si entra) collegati dal mondo principale tramite passaggi con livello minimo (8–24): Yggwen, Frontiera, Nebbiaria, Altopiani dei Giganti, Ankhar, Mille Isole, Nivalis, Lunaria, Ashkar. Area esplorabile totale circa 10 volte il mondo di partenza. Dati: `src/data/territori.js`, generatore: `src/world/Territory.js`.
- **Natura verticale**: montagne a piani, alberi alti per bioma, monumenti; la collisione resta solo alla base (`src/world/Vertical.js`, `src/engine/TallSprites.js`).
- **Varietà**: pavimentazioni e monumenti per città, santuari con aspetto legato al territorio, materiali degli interni (`src/world/Variety.js`).
- **Arco iniziale indistruttibile**, frecce acquistabili a pacchi nei negozi (massimo 100, anche come ricompensa).
- **Sonno nelle locande** (sequenza non interrompibile), **effetti a tema** dopo i boss, **cinematica finale** con ritorno alla capitale e Domus Imperiale (`src/world/Palace.js`).
- **Accampamento**: Kit da Campo dall'inventario; falò, banco da lavoro, riposo, rimovibile e salvato.
- **Regno sommerso di Thalassa** (portale vicino a Portomarea, serve la tuta) con il boss Thalassarkhos (fasi, finestre di vulnerabilità).
- **Navigazione dei nemici**: percorso a tile (`src/systems/Path.js`) quando un ostacolo blocca la via; audit di raggiungibilità in `src/world/NavAudit.js`.
- **Test**: `python3 tests/server.py`, poi aprire `http://127.0.0.1:8765/tests/index.html` (234 controlli). Non verificato: dispositivi mobili reali e prestazioni su telefono.
- **Missioni extra post storia**: i territori si aprono solo dopo aver concluso la storia principale (flag `game_cleared`) e col livello indicato. In ognuno c'è un'arena con un guardiano (boss ricalibrato) e l'eremita affida una missione (8 creature, guardiano, ritorno) con ricompensa. Dati in fondo a `src/data/territori.js`.
- **Forzieri sigillati**: i forzieri segreti dentro la roccia ricevono un sentiero scavato (`repairReach` in `src/world/NavAudit.js`, dopo le patch dell'editor); i raccoglibili irraggiungibili vengono tolti.
- Il "10×" è ottenuto con territori collegati, non con una mappa unica lineare.

## Sesta iterazione — bilanciamento e personalizzazione
- **Limbo**: PV e danni dei nemici seguono il livello del giocatore (`limboScale` in `src/systems/LimboSystem.js`): 40% a livello 1, 75% a 10, 120% a 20, tetto 150%.
- **Combattimento**: corretto il difetto per cui i nemici a contatto o a carica ti raggiungevano senza colpirti (corpi solidi che si fermano a filo). Test: ogni tipo di nemico colpisce un giocatore fermo.
- **Creazione del personaggio**: 9 colori di capelli (nero, biondo chiaro, rossiccio, castano, grigio argentato, oltre ai biondi), 10 colori di kimono e 7 di veste (nuova riga "Veste"). I vecchi salvataggi restano validi.
- **Icona**: nuova, pixel art; si rigenera con `python3 tools/make_icons.py`.

## Settima iterazione — accesso ai territori, scudi, grafica
- **Territori**: niente più portali sulla costa. In ogni città di riferimento un barcaiolo (`barcaiolo_<territorio>`) propone la missione extra (solo a storia conclusa e col livello richiesto) e fa partire la transizione; il ritorno è accanto a lui.
- **Guardiani**: ogni territorio ha un guardiano con aspetto proprio (palette e accessori `g_*` in `Sprites.js`) e un attacco firma (`gu_*` in `entities/traits.js`).
- **Scudi**: la difesa richiede uno scudo equipaggiato (`src/data/scudi.js`): 8 fasce per avanzamento, blocco %, durata, usura per bioma (il legno brucia nel fuoco, il metallo arrugginisce nell'umido), rottura. Si trovano (guardiani, boss), si creano (banco) o si comprano (negozi).
- **Animazioni**: katana con guardia e lama luminosa, scia colorata, affondo del corpo; arco tenuto in mano, teso con freccia incoccata, contraccolpo e corda che vibra; scudo disegnato per materiale con crepe.
- **Santuari sacri**: torii (anche di ghiaccio, pietra, luce), Buddha sdraiato, totem maya, croce celtica, dolmen con menhir, stupa, lanterne (`src/world/Sacred.js`, `src/engine/SacredSprites.js`).
- **Personaggio**: nuovo sprite con contorno scuro, cinque abiti (spadaccino magico, kimono, miko, ronin, principe kitsune), maschere in stile icona, animazioni (sciarpa, code, occhi, scintille). Contorno scuro anche su PNG, nemici e oggetti; portali a vortice animato.
- **Tetti e interni**: tetti diversi per edificio (stesse collisioni) e interni con tappeto, piante, lanterne e arazzi.
- **Gatto di Mio**: compare anche se il blocco di mappa era già caricato, accanto al cartello.
- Limiti noti: nessuna prova su telefono reale; le finestre degli edifici restano uguali; i guardiani riusano la sagoma di base di un boss esistente (con palette, accessori e attacco propri).

## Ottava iterazione — grafica coerente e mondo che reagisce
- **Skin di terreno e oggetti** (`src/engine/TileSkins.js`): erba con ciuffi di diversa altezza che ondeggiano e fiorellini, acqua e lava con onde e riflessi, sabbia con increspature, neve con dune e scintille, dirt con sassolini, mattoni, tetti a tegole, porte e recinti ridisegnati; falò, torce e lanterne animati. Oggetti con contorno scuro, come personaggio e nemici.
- **Volume sfumato**: luce dall'alto a sinistra e ombra morbida in basso e a destra su sprite e oggetti; ombre a terra con bordo sfumato; alberi, statue e rocce gettano un'ombra; gli edifici hanno una fascia d'ombra alla base.
- **Il mondo reagisce**: impronte sulla neve, sulla sabbia e sul fango che svaniscono; erba che salta e onde nell'acqua al passaggio; fuoco, veleno e ghiaccio che cadono, si espandono e bruciano a terra; katana sguainata e rinfoderata; arco con freccia presa dalla faretra; nemici che cadono dagli alberi, sbucano dalla neve o dalla sabbia, saltano fuori dall'acqua.
- **Transizioni**: portali (vortice con raggi e lampo, il personaggio ruota e si rimpicciolisce), porte (iride), scale (serrande).
- **Edifici meno anonimi**: tetti diversi per edificio, insegne per mestiere (locanda, negozio, fucina, municipio), noren, tende a righe, lanterne di carta, fioriere, bandiere, edera e camini con il fumo (`src/engine/FacadeSprites.js`, `facadeVariety`).
- Limiti noti: nessuna prova su telefono reale (il contorno e i gradienti pesano di più sui dispositivi lenti); le montagne non hanno il contorno; le finestre degli edifici restano uguali.

## Nona iterazione — profondità, ambienti, NPC
- **Schermata di creazione**: l'anteprima del personaggio ora sta tutta nel riquadro (scala 3×).
- **Profondità**: gli edifici hanno colmo del tetto, gronda con spessore, piano laterale in ombra, ombra della gronda sulla parete, zoccolo di pietra, architravi e davanzali (le varianti dei tile dipendono dai vicini, `WorldScene.edgeV`); le montagne sono altopiani a terrazze con parete verticale striata, bordo scuro e pietrisco alla base.
- **Barriere naturali per ambiente** (`src/world/NaturalBarriers.js`): dune di sabbia, rovine e cactus nel deserto; siepi, tronchi e giganti nei prati e nei boschi; mangrovie nelle paludi; bambù; cumuli di neve; tronchi di deriva, palme e massi bassi sulle rive. Niente più rocce alte nella sabbia o sul mare. Le barriere di progressione (`Barriers.js`) restano invariate.
- **Santuari**: nel mondo principale da 12 a 6 (almeno 50 tile l'uno dall'altro), nei territori almeno 90 tile; le ancore dei santuari eliminati puntano al più vicino.
- **NPC memorabili** (`src/engine/NpcLooks.js`): ogni persona ha tratti propri dal mestiere (grembiule e martello, zaino, elmo e lancia, bastone e barba, canna da pesca, ombrello, lanterna, libro...) e dalla personalità (motivi sui vestiti, animaletti, orecchini, cicatrici, corporature diverse).
- **Micro-animazioni di interazione**: colpo con impatto e fermo immagine, nemico che si schiaccia e rilascia un'anima, vignetta rossa al danno, PNG che si voltano e fanno comparire una bolla (! ? ♪ cuore), forziere con luce e monete, oggetti che volano al personaggio, cartelli che tremano, luce e petali al santuario, scintille per cura e livello, porte che si aprono, polvere nello scatto, erba che si piega e acqua che ondeggia attorno al personaggio.
- Limiti: nessuna prova su telefono reale; le finestre degli edifici variano poco; non ho avuto modo di confrontare 1:1 con le immagini di riferimento (ispirazione, non copia).

## Decima iterazione — altezza, ambienti, città uniche
- **Livelli in altezza** (`src/world/Terraces.js`): nei biomi rocciosi il terreno sale a due gradini di altopiano. Ogni dislivello ha la sua **parete di scogliera** (faccia a sud, lati a est/ovest, dorso a nord; palette per bioma) e si sale solo dalle **rampe di scalini**; un controllo di connessione riapre una rampa dove una zona resterebbe isolata. Gli altopiani hanno un bordo scuro con filo di luce. Valgono anche per promontori e scogliere sul mare. Le montagne piene sono terrazze con parete striata.
- **Transizioni fra ambienti** (`src/world/Blend.js`): i bordi dei biomi si mescolano a chiazze con vegetazione di passaggio; neve, deserto, vulcano e giungla non si toccano più direttamente (fascia di steppa, brughiera e massi); le spiagge fredde diventano neve e ghiaccio, quelle di canyon e vulcano sabbia e cenere.
- **Forzieri**: il sentiero verso i forzieri sigillati è già nella mappa base (lo vede anche l'editor); la riparazione protegge le celle della mappa dell'utente e riapre anche i portali eventualmente chiusi.
- **Città uniche** (`src/engine/TownStyles.js`, `LandmarkSprites.js`): ogni città ha palette di muri e tetti, forme di finestre (8) e un monumento proprio: torre della campana, albero degli elfi, torre dell'orologio, drago, obelisco con pozzo, totem, arco di trionfo, ancora, pilone al neon, guglia di corallo.
- **Interni**: piante diverse (L, nicchia, tramezzo, colonne) e arredi con volume (tavoli, scaffali, letti, botti, casse).
- **Arco**: postura da arciere con il braccio dell'arco teso e quello della corda che tira fino alla guancia, arco più grande.
- **Boss finali** (Mugenkai, Enma-Ō, KAMI-OS): nuove sagome animate (orologio-aureola, giudice dei morti con cappello e tavolette, occhio centrale con anelli e droni).
- **Raccoglibili**: ogni oggetto ha il suo sprite (bacche, erbe, funghi luminosi, minerali, cristalli...).
- Limiti: nessuna prova su telefono; le pareti di scogliera sono alte un tile (non quanto in alcuni giochi di riferimento); la Fucina resta rettangolare (mappa di prova dell'editor).

## Undicesima iterazione — rilievi calpestabili, nemici per bioma, architetture, ombre, dojo
- **Mappa dell'utente** (`map-editor/data/overworld.json`) ricompilata in `src/data/mapPatches.js` e applicata dopo la generazione.
- **Rilievi** (`src/world/Terraces.js`): altipiani fino a 3 quote nei biomi rocciosi (montagna, neve, tundra, vulcano, canyon, calanchi, altopiano, rovine) e colline in prato/foresta/giada/tropico/incanto/infestato. Pareti di scogliera alte 2 tile, rampe e scale, verifica di raggiungibilità (forzieri e portali compresi). Palette di roccia per bioma.
- **Nemici** (`src/data/enemies_biomi.js`): 17 biomi con almeno 3 nemici esclusivi ciascuno, sprite con accessori propri e un attacco firma per bioma (`bio_*` in `traits.js`). Nessun nemico compare in due biomi.
- **Edifici**: forme dei tetti (a tegole, piatto, pagoda, paglia), materiali dei muri (intonaco, graticcio, pietra, assi, adobe), gradini davanti alle porte, arredi con palette e forme per ogni interno.
- **Ombre e profondità**: ombra proiettata sagomata sugli oggetti e sugli edifici, ombra sotto gli sprite.
- **Combattimento**: braccia visibili durante il fendente di katana; il colpo subito dopo lo Scatto del Kitsune (entro 0,6 s) è un «Fendente in scatto» (danno x1,7, più portata); lo scatto stesso fa x2,2.
- **Dojo di addestramento**: la nuova partita inizia nel dojo con la Maestra Akane, che spiega comandi, combattimento, scatto, arco, mare; poi porta a Hinomura.
