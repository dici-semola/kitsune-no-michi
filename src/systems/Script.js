// Mini-linguaggio dichiarativo per condizioni ed effetti, usato da dialoghi, quest, portali e negozi.
//  Condizione: ['flag','x'] ['!flag','x'] ['item','id',n] ['!item','id'] ['level',n] ['quest','id','active|done|inactive']
//              ['gold',n] ['equip','slotOrId'] ['ability','id'] ['mount','id'] ['night'] ['map','id']
//  Una lista di condizioni è un AND.
//  Effetto:    ['flag','x'] ['unflag','x'] ['give','id',n] ['take','id',n] ['gold',±n] ['quest','id'] ['maxhp',n]
//              ['heal'] ['mount','id'] ['say','testo'] ['rest'] ['shop','id'] ['tp','mappa','ancora'] ['dlg','id'] ['credits']

export function check(c, s) {
  if (!c || !c.length) return true;
  if (Array.isArray(c[0])) return c.every((x) => check(x, s));
  const [k, a, b] = c;
  switch (k) {
    case 'flag': return s.flags.has(a);
    case '!flag': return !s.flags.has(a);
    case 'item': return s.inv.count(a) >= (b ?? 1);
    case '!item': return s.inv.count(a) < (b ?? 1);
    case 'level': return s.level >= a;
    case 'quest': return s.quests.status(a) === b;
    case 'gold': return s.inv.gold >= a;
    case 'equip': return s.inv.isEquipped(a);
    case 'ability': return s.abilities.has(a);
    case 'mount': return s.flags.has('mount:' + a);
    case 'night': return s.isNight();
    case 'map': return s.map === a;
    default: throw new Error('Condizione sconosciuta: ' + k);
  }
}

// ctx = { state, bus, scene?, defer(fn) }
export function run(fx, ctx) {
  const s = ctx.state;
  const defer = ctx.defer || ((fn) => fn());
  for (const f of fx || []) {
    const [k, a, b, c, d2] = f;
    switch (k) {
      case 'barrier': defer(() => ctx.scene.openBarrierById(a)); break; // apre una barriera di progressione
      case 'reveal': ctx.scene?.revealSecret(a, b, c, d2); break; // segna un luogo segreto sulla mappa
      case 'flag': s.setFlag(a); break;
      case 'unflag': s.flags.delete(a); break;
      case 'give': s.give(a, b ?? 1); break;
      case 'take': s.inv.remove(a, b ?? 1); break;
      case 'gold': s.inv.gold = Math.max(0, s.inv.gold + a); break;
      case 'quest': s.quests.start(a, s); break;
      case 'maxhp': s.bonusHp += a; s.hp += a; ctx.bus.emit('toast', `PV massimi +${a}`); break;
      case 'heal': s.hp = s.maxHp; s.ki = s.maxKi; break;
      case 'mount': s.setFlag('mount:' + a); ctx.bus.emit('toast', 'Nuovo mezzo di trasporto! Premi M per montare.'); break;
      case 'say': ctx.bus.emit('toast', a); break;
      case 'rest': defer(() => ctx.scene.rest()); break;
      case 'shop': defer(() => ctx.scene.openShop(a)); break;
      case 'tp': defer(() => ctx.scene.transition(a, b)); break;
      case 'dlg': defer(() => ctx.scene.startDialogue(a)); break;
      case 'credits': defer(() => ctx.scene.startCredits()); break;
      case 'camprest': defer(() => ctx.scene.campRest()); break;
      case 'campremove': defer(() => ctx.scene.campRemove(true)); break;
      case 'finale': defer(() => ctx.scene.startFinale()); break;
      default: throw new Error('Effetto sconosciuto: ' + k);
    }
  }
}
