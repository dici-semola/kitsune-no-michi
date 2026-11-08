// Bus di eventi minimale: kill, talk, enter, flag, toast, levelup...
export class EventBus {
  constructor() { this.h = new Map(); }
  on(ev, fn) {
    if (!this.h.has(ev)) this.h.set(ev, new Set());
    this.h.get(ev).add(fn);
    return () => this.h.get(ev)?.delete(fn);
  }
  emit(ev, payload) {
    const s = this.h.get(ev);
    if (s) for (const fn of [...s]) fn(payload);
  }
}
