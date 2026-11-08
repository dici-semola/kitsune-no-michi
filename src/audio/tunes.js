// Musiche originali in stile chiptune 16-bit (GBA / Zelda-like), scritte come dati.
// Ogni brano: bpm, 8 accordi (uno per battuta), 8 battute di melodia (16 sedicesimi ciascuna, "Nota:durata", r = pausa),
// pattern di basso/arpeggio/batteria. Il compilatore li trasforma in eventi per un sequencer a passi.

const NOTES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function midi(name) { // es. "F#5", "Bb4"
  const m = /^([A-G])([#b]?)(\d)$/.exec(name);
  if (!m) throw new Error('nota non valida ' + name);
  return 12 * (Number(m[3]) + 1) + NOTES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
const QUAL = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], dim: [0, 3, 6] };
export function chord(name) {
  const m = /^([A-G][#b]?)(m7|m|7|dim)?$/.exec(name);
  if (!m) throw new Error('accordo non valido ' + name);
  const root = midi(m[1] + '3');
  return QUAL[m[2] || ''].map((i) => root + i);
}

// pattern di basso: [passo, grado(0 = fondamentale, 1 = quinta, 2 = ottava), durata]
const BASS = {
  root: [[0, 0, 6], [8, 0, 6]],
  oct: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [i * 2, i % 2 ? 2 : 0, 2]),
  walk: [[0, 0, 4], [4, 1, 4], [8, 2, 4], [12, 1, 4]],
  pump: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [i * 2, 0, 1.5]),
  sync: [[0, 0, 2], [3, 1, 2], [6, 0, 2], [8, 0, 2], [11, 1, 2], [14, 2, 2]],
};
// batteria: K kick+hat, S snare+hat, k kick, s snare, h hat, o hat aperto
const DRUMS = {
  calm: 'k.h.s.h.k.h.s.h.', march: 'K.h.S.h.K.h.S.h.', rock: 'K.hhS.hhK.hhS.hh', driving: 'KhhhShhhKhhhShhh',
  fast: 'KhShKhShKhShKhSS', boss: 'KhKhShKhKhKhShSS', none: '................',
};

export const TUNES = {
  title: { bpm: 96, wave: 'p50', bass: 'oct', arp: 'up', drums: 'calm', chords: 'Am F C G Am F Dm E'.split(' '), lead: [
    'E5:4 A5:4 C6:4 B5:2 A5:2', 'A5:4 F5:4 A5:4 G5:2 F5:2', 'G5:4 E5:4 G5:4 A5:2 G5:2', 'D5:4 G5:4 B5:6 r:2',
    'E5:4 A5:4 C6:4 E6:4', 'D6:4 C6:4 A5:4 F5:4', 'D5:4 F5:4 A5:4 D6:4', 'E5:4 G#5:4 B5:6 r:2'] },
  hinomura: { bpm: 104, wave: 'p25', bass: 'walk', arp: 'sparse', drums: 'calm', chords: 'C Am F G C Am F G7'.split(' '), lead: [
    'E5:2 G5:2 C6:4 G5:2 E5:2 G5:4', 'A5:4 C6:2 A5:2 E5:4 r:4', 'A5:2 C6:2 F6:4 C6:2 A5:2 C6:4', 'B5:4 D6:2 B5:2 G5:4 r:4',
    'C6:4 B5:2 A5:2 G5:4 E5:4', 'E5:2 A5:2 C6:4 B5:2 A5:2 A5:4', 'F5:4 A5:4 C6:4 A5:4', 'G5:2 B5:2 D6:2 F6:2 G6:8'] },
  hinomura_night: { bpm: 72, wave: 'p12', bass: 'root', arp: 'updown', drums: 'none', chords: 'Am Em F Dm Am Em F E'.split(' '), lead: [
    'E5:6 C5:2 E5:8', 'G5:4 E5:4 B4:8', 'A5:6 F5:2 C5:8', 'D5:4 F5:4 A5:8', 'C6:6 A5:2 E5:8', 'B5:4 G5:4 E5:8', 'A5:4 C6:4 F6:8', 'E5:4 G#5:4 B5:8'] },
  field: { bpm: 124, wave: 'p50', bass: 'pump', arp: null, drums: 'march', chords: 'D A Bm G D A G A'.split(' '), lead: [
    'D5:2 F#5:2 A5:4 F#5:2 A5:2 D6:4', 'C#6:4 A5:4 E5:4 A5:4', 'B5:2 D6:2 F#6:4 D6:2 B5:2 F#5:4', 'G5:4 B5:4 D6:4 B5:4',
    'A5:2 D6:2 F#6:4 E6:2 D6:2 A5:4', 'E6:4 C#6:4 A5:4 E5:4', 'D6:4 B5:2 G5:2 B5:4 D6:4', 'C#6:2 E6:2 A6:8 r:4'] },
  field_night: { bpm: 88, wave: 'p25', bass: 'oct', arp: 'up', drums: 'calm', chords: 'Em C G D Em C Am B'.split(' '), lead: [
    'B4:4 E5:4 G5:4 B5:4', 'G5:4 E5:4 C5:4 E5:4', 'D5:4 G5:4 B5:4 D6:4', 'A5:4 F#5:4 D5:8',
    'E5:2 G5:2 B5:4 A5:2 G5:2 E5:4', 'C6:4 B5:2 A5:2 G5:4 E5:4', 'A5:4 C6:4 E6:8', 'D#6:4 B5:4 F#5:8'] },
  forest: { bpm: 100, wave: 'p12', bass: 'walk', arp: 'updown', drums: 'none', chords: 'Em Bm C D Em Bm C B'.split(' '), lead: [
    'E5:3 G5:3 B5:2 A5:3 G5:3 E5:2', 'D5:3 F#5:3 B5:2 A5:3 F#5:3 D5:2', 'E5:3 G5:3 C6:2 B5:3 G5:3 E5:2', 'F#5:3 A5:3 D6:2 C#6:3 A5:3 F#5:2',
    'G5:4 B5:4 E6:4 B5:4', 'F#5:4 B5:4 D6:4 B5:4', 'G5:4 C6:4 E6:4 G5:4', 'F#5:4 A5:4 B5:8'] },
  swamp: { bpm: 70, wave: 'p25', bass: 'root', arp: 'sparse', drums: 'none', chords: 'Dm Bb Gm A Dm Bb A Dm'.split(' '), lead: [
    'D5:6 F5:2 A5:8', 'Bb4:6 D5:2 F5:8', 'G5:6 Bb5:2 D6:8', 'C#6:6 E6:2 A5:8', 'A5:4 F5:4 D5:8', 'D6:4 Bb5:4 F5:8', 'E5:4 A5:4 C#6:8', 'D6:8 A5:8'] },
  desert: { bpm: 112, wave: 'p25', bass: 'sync', arp: null, drums: 'march', chords: 'Am Bb Am Bb Am G Bb Am'.split(' '), lead: [
    'A5:2 Bb5:2 C#6:4 D6:2 C#6:2 Bb5:4', 'Bb5:2 C#6:2 D6:4 E6:2 D6:2 C#6:4', 'A5:4 E5:4 A5:4 C#6:4', 'D6:4 Bb5:4 A5:8',
    'E6:2 D6:2 C#6:4 Bb5:2 A5:2 Bb5:4', 'G5:4 B5:4 D6:4 B5:4', 'F6:4 D6:4 Bb5:4 D6:4', 'C#6:4 Bb5:4 A5:8'] },
  snow: { bpm: 84, wave: 'p12', bass: 'root', arp: 'up', drums: 'none', chords: 'Dm F Gm C Dm F Bb A'.split(' '), lead: [
    'A5:4 D6:4 F6:4 E6:4', 'C6:4 F6:4 A6:4 G6:4', 'D6:4 G6:4 Bb6:4 A6:4', 'G6:4 E6:4 C6:8', 'F6:4 D6:4 A5:8', 'A5:4 C6:4 F6:8', 'D6:4 F6:4 Bb6:8', 'C#6:4 E6:4 A6:8'] },
  canyon: { bpm: 118, wave: 'p50', bass: 'oct', arp: null, drums: 'rock', chords: 'Em G D Am Em C D B'.split(' '), lead: [
    'E5:4 G5:2 B5:2 E6:4 D6:2 B5:2', 'D6:4 B5:2 G5:2 B5:4 D6:4', 'A5:4 D6:2 F#6:2 A6:4 F#6:4', 'E6:4 C6:2 A5:2 C6:4 E6:4',
    'G6:4 E6:2 B5:2 E6:4 G6:4', 'E6:4 C6:2 G5:2 C6:4 E6:4', 'F#6:4 D6:2 A5:2 D6:4 F#6:4', 'D#6:4 F#6:4 B6:8'] },
  cave: { bpm: 76, wave: 'tri', bass: 'root', arp: 'sparse', drums: 'none', chords: 'Cm Ab Fm G Cm Ab G Cm'.split(' '), lead: [
    'C5:8 Eb5:4 G5:4', 'Ab5:8 Eb5:8', 'F5:8 Ab5:4 C6:4', 'B5:8 D6:4 r:4', 'G5:6 Eb5:2 C5:8', 'C6:6 Ab5:2 Eb5:8', 'D6:6 B5:2 G5:8', 'C5:12 r:4'] },
  aurelburg: { bpm: 108, wave: 'p25', bass: 'walk', arp: 'sparse', drums: 'calm', chords: 'G D Em C G D C D7'.split(' '), lead: [
    'B5:4 D6:4 G6:4 D6:4', 'A5:2 D6:2 F#6:4 D6:2 A5:2 F#5:4', 'G5:4 B5:4 E6:4 B5:4', 'G5:2 C6:2 E6:4 C6:2 G5:2 E5:4',
    'D6:4 B5:2 G5:2 B5:4 D6:4', 'F#6:4 A6:4 F#6:4 D6:4', 'E6:4 C6:4 G5:4 C6:4', 'A5:2 C6:2 D6:4 F#6:8'] },
  hamlet: { bpm: 90, wave: 'p25', bass: 'root', arp: 'up', drums: 'none', chords: 'F C Dm Bb F C Bb C'.split(' '), lead: [
    'A5:4 C6:4 F6:4 C6:4', 'G5:4 C6:4 E6:4 C6:4', 'A5:4 D6:4 F6:4 D6:4', 'F5:4 Bb5:4 D6:4 Bb5:4',
    'C6:4 A5:2 F5:2 A5:4 C6:4', 'E6:4 C6:2 G5:2 C6:4 E6:4', 'D6:4 Bb5:4 F5:4 Bb5:4', 'G5:4 C6:4 E6:8'] },
  interior: { bpm: 92, wave: 'p12', bass: 'root', arp: null, drums: 'none', chords: 'C Am F G C Am Dm G'.split(' '), lead: [
    'E5:4 G5:4 C6:8', 'C6:4 A5:4 E5:8', 'F5:4 A5:4 C6:8', 'B5:4 G5:4 D5:8', 'G5:4 E5:4 C5:8', 'A5:4 C6:4 E6:8', 'D6:4 A5:4 F5:8', 'D5:4 G5:4 B5:8'] },
  cyber: { bpm: 132, wave: 'saw', bass: 'pump', arp: 'up', drums: 'driving', chords: 'Cm Ab Bb Gm Cm Ab Bb G'.split(' '), lead: [
    'G5:2 r:2 G5:2 Bb5:2 C6:4 Bb5:4', 'Eb6:2 r:2 Eb6:2 C6:2 Ab5:4 C6:4', 'D6:2 r:2 D6:2 F6:2 Bb5:4 D6:4', 'D6:2 r:2 Bb5:2 G5:2 D5:8',
    'C6:2 Eb6:2 G6:4 F6:2 Eb6:2 C6:4', 'Ab5:2 C6:2 Eb6:4 D6:2 C6:2 Ab5:4', 'Bb5:2 D6:2 F6:4 Eb6:2 D6:2 Bb5:4', 'B5:4 D6:4 G6:8'] },
  underworld: { bpm: 90, wave: 'p12', bass: 'root', arp: 'updown', drums: 'calm', chords: 'Em F Em F Em Bm F B'.split(' '), lead: [
    'B5:6 E6:2 D6:4 B5:4', 'C6:6 F6:2 E6:4 C6:4', 'G5:4 B5:4 E6:8', 'A5:4 C6:4 F6:8', 'E6:6 D6:2 B5:8', 'D6:4 F#6:4 B6:8', 'C6:4 A5:4 F5:8', 'D#6:4 F#6:4 B5:8'] },
  parallel: { bpm: 100, wave: 'p12', bass: 'root', arp: 'updown', drums: 'none', chords: 'C D E F# C D E F#'.split(' '), lead: [
    'C5:2 E5:2 G#5:4 F#5:2 D5:2 A#5:4', 'D5:2 F#5:2 A#5:4 G#5:2 E5:2 C6:4', 'E5:2 G#5:2 C6:4 A#5:2 F#5:2 D6:4', 'F#5:2 A#5:2 D6:4 C6:2 G#5:2 E6:4',
    'C6:4 A#5:4 G#5:4 F#5:4', 'D6:4 C6:4 A#5:4 G#5:4', 'E6:4 D6:4 C6:4 A#5:4', 'F#6:8 C6:8'] },
  underwater: { bpm: 80, wave: 'p12', bass: 'root', arp: 'updown', drums: 'none', chords: 'F G Am C F G Am C'.split(' '), lead: [
    'C6:6 A5:2 F5:8', 'D6:6 B5:2 G5:8', 'E6:6 C6:2 A5:8', 'G5:4 C6:4 E6:8', 'A5:4 C6:4 E6:4 C6:4', 'B5:4 D6:4 G6:8', 'C6:4 E6:4 A6:8', 'G6:8 E6:8'] },
  battle: { bpm: 148, wave: 'p50', bass: 'pump', arp: null, drums: 'fast', chords: 'Am G F E Am G F E'.split(' '), lead: [
    'A5:2 A5:2 C6:2 A5:2 E6:4 D6:4', 'B5:2 B5:2 D6:2 B5:2 G6:4 F#6:4', 'A5:2 A5:2 C6:2 A5:2 F6:4 E6:4', 'G#5:2 G#5:2 B5:2 G#5:2 E6:4 B5:4',
    'C6:2 E6:2 A6:4 G6:2 E6:2 C6:4', 'D6:2 G6:2 B6:4 A6:2 G6:2 D6:4', 'C6:2 F6:2 A6:4 G6:2 F6:2 C6:4', 'E6:2 G#6:2 B6:4 G#6:2 E6:2 B5:4'] },
  boss: { bpm: 156, wave: 'saw', bass: 'pump', arp: 'up', drums: 'boss', chords: 'Dm Dm Bb A Dm Gm Bb A'.split(' '), lead: [
    'D6:2 D6:2 F6:2 D6:2 A6:4 G6:2 F6:2', 'E6:2 E6:2 G6:2 E6:2 Bb6:4 A6:4', 'D6:2 D6:2 F6:2 D6:2 Bb6:4 A6:4', 'C#6:2 C#6:2 E6:2 C#6:2 A6:8',
    'F6:2 A6:2 D7:4 C7:2 A6:2 F6:4', 'G6:2 Bb6:2 D7:4 C7:2 Bb6:2 G6:4', 'F6:2 Bb6:2 D7:4 C7:2 Bb6:2 F6:4', 'E6:2 A6:2 C#7:4 E7:8'] },
  boss_final: { bpm: 168, wave: 'p25', bass: 'pump', arp: 'up', drums: 'boss', chords: 'Em C D B Em C B B7'.split(' '), lead: [
    'E6:2 B5:2 E6:2 G6:2 B6:4 A6:4', 'G6:2 E6:2 C6:2 E6:2 G6:4 F#6:4', 'A6:2 F#6:2 D6:2 F#6:2 A6:4 G6:4', 'F#6:2 D#6:2 B5:2 D#6:2 F#6:4 B6:4',
    'B6:2 G6:2 E6:2 G6:2 B6:2 E7:2 D7:4', 'C7:2 G6:2 E6:2 G6:2 C7:4 B6:4', 'B6:2 F#6:2 D#6:2 F#6:2 B6:4 A#6:4', 'B6:2 D#7:2 F#7:4 E7:2 D#7:2 B6:4'] },
  credits: { bpm: 100, wave: 'p50', bass: 'oct', arp: 'up', drums: 'march', chords: 'C G Am Em F C F G'.split(' '), lead: [
    'G5:4 C6:4 E6:4 G6:4', 'D6:4 G6:4 B6:4 G6:4', 'C6:4 E6:4 A6:4 E6:4', 'B5:4 E6:4 G6:4 B6:4', 'A5:4 C6:4 F6:4 A6:4', 'G5:4 C6:4 E6:4 C6:4', 'A6:4 G6:4 F6:4 E6:4', 'D6:4 G6:4 B6:8'] },
};

const cache = {};
// Compila un brano in eventi per passo: ev[step] = [{ch, m, len}]
export function compile(name) {
  if (cache[name]) return cache[name];
  const t = TUNES[name];
  if (!t) return null;
  const steps = 16 * t.chords.length, ev = Array.from({ length: steps }, () => []);
  t.lead.forEach((bar, b) => {
    let p = 0;
    for (const tok of bar.split(' ')) {
      const [n, l] = tok.split(':'), len = Number(l);
      if (n !== 'r') ev[b * 16 + p].push({ ch: 'lead', m: midi(n), len });
      p += len;
    }
    if (p !== 16) throw new Error(`${name}: battuta ${b + 1} dura ${p} passi (attesi 16)`);
  });
  t.chords.forEach((c, b) => {
    const ch = chord(c), root = ch[0];
    for (const [s, deg, len] of BASS[t.bass]) ev[b * 16 + Math.floor(s)].push({ ch: 'bass', m: deg === 0 ? root : deg === 1 ? root + 7 : root + 12, len });
    if (t.arp) {
      const tones = [...ch, ch[0] + 12, ch[1] + 12, ch[2] + 12];
      const order = t.arp === 'up' ? [0, 1, 2, 3, 4, 5, 4, 3] : t.arp === 'updown' ? [0, 2, 4, 5, 4, 2, 1, 3] : null;
      if (order) for (let i = 0; i < 8; i++) ev[b * 16 + i * 2].push({ ch: 'arp', m: tones[order[i] % tones.length] + 12, len: 1.6 });
      else for (let i = 0; i < 4; i++) ev[b * 16 + i * 4].push({ ch: 'arp', m: tones[(i * 2) % tones.length] + 12, len: 3 });
    }
    DRUMS[t.drums].split('').forEach((d, i) => { if (d !== '.') ev[b * 16 + i].push({ ch: 'drum', d }); });
  });
  return (cache[name] = { bpm: t.bpm, wave: t.wave, steps, ev });
}
