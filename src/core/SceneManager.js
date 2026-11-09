// Pila di scene. Le scene con `overlay = true` vengono disegnate sopra la precedente,
// ma solo la scena in cima riceve update().
export class SceneManager {
  constructor(game) { this.game = game; this.stack = []; }
  get top() { return this.stack[this.stack.length - 1]; }
  push(scene, params) {
    scene.game = this.game;
    this.stack.push(scene);
    scene.enter?.(params);
    return scene;
  }
  pop(result) {
    const s = this.stack.pop();
    s?.exit?.();
    this.top?.resume?.(result);
    return s;
  }
  replace(scene, params) {
    while (this.stack.length) this.stack.pop().exit?.();
    return this.push(scene, params);
  }
  update(dt) { this.top?.update(dt); }
  render(g) {
    let i = this.stack.length - 1;
    while (i > 0 && this.stack[i].overlay) i--;
    for (; i < this.stack.length; i++) this.stack[i].render(g);
  }
}
