// Helper di interfaccia disegnati sul canvas logico 480x270.
export const FONT = '8px monospace';

export function text(g, s, x, y, col = '#fff', o = {}) {
  g.font = o.font || FONT;
  g.textBaseline = 'top';
  g.textAlign = o.align || 'left';
  if (o.shadow !== false) { g.fillStyle = '#000'; g.fillText(s, x + 1, y + 1); }
  g.fillStyle = col;
  g.fillText(s, x, y);
  g.textAlign = 'left';
}

export function wrap(g, s, maxW) {
  g.font = FONT;
  const lines = [];
  for (const para of String(s).split('\n')) {
    let line = '';
    for (const w of para.split(' ')) {
      const t = line ? line + ' ' + w : w;
      if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    }
    lines.push(line);
  }
  return lines;
}

export function panel(g, x, y, w, h, o = {}) {
  g.fillStyle = o.bg || 'rgba(14,10,24,.92)';
  g.fillRect(x, y, w, h);
  g.strokeStyle = o.border || '#e8c8a0';
  g.lineWidth = 1;
  g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  g.strokeStyle = 'rgba(200,40,58,.9)';
  g.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
}

export function bar(g, x, y, w, h, pct, col, bg = '#1a1020') {
  g.fillStyle = '#000'; g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle = bg; g.fillRect(x, y, w, h);
  g.fillStyle = col; g.fillRect(x, y, Math.max(0, Math.round(w * Math.min(1, pct))), h);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x, y, Math.round(w * Math.min(1, pct)), 1);
}

// Lista verticale con cursore. Ritorna l'indice del primo elemento visibile.
export function list(g, items, sel, x, y, w, rowH, visible, draw) {
  const start = Math.max(0, Math.min(sel - Math.floor(visible / 2), Math.max(0, items.length - visible)));
  for (let i = 0; i < visible && start + i < items.length; i++) {
    const it = items[start + i], yy = y + i * rowH, on = start + i === sel;
    if (on) { g.fillStyle = 'rgba(200,40,58,.55)'; g.fillRect(x, yy - 1, w, rowH); }
    draw(it, x + 3, yy, on);
  }
  if (start > 0) text(g, '▲', x + w - 8, y - 9, '#e8c8a0');
  if (start + visible < items.length) text(g, '▼', x + w - 8, y + visible * rowH, '#e8c8a0');
}

export function nav(input, len, sel) {
  let n = sel;
  if (input.pressed('up')) n = (sel + len - 1) % len;
  else if (input.pressed('down')) n = (sel + 1) % len;
  if (n !== sel) input.audio?.sfx('select');
  return n;
}
