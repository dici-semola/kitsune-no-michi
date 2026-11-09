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
- **Test**: `python3 tests/server.py`, poi aprire `http://127.0.0.1:8765/tests/index.html` (208 controlli). Non verificato: dispositivi mobili reali e prestazioni su telefono.
- **Missioni extra post storia**: i territori si aprono solo dopo aver concluso la storia principale (flag `game_cleared`) e col livello indicato. In ognuno c'è un'arena con un guardiano (boss ricalibrato) e l'eremita affida una missione (8 creature, guardiano, ritorno) con ricompensa. Dati in fondo a `src/data/territori.js`.
- **Forzieri sigillati**: i forzieri segreti dentro la roccia ricevono un sentiero scavato (`repairReach` in `src/world/NavAudit.js`, dopo le patch dell'editor); i raccoglibili irraggiungibili vengono tolti.
- Il "10×" è ottenuto con territori collegati, non con una mappa unica lineare.
