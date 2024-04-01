import type { Vec2 } from "./types"

export default class Cursor {
  pos: Vec2

  constructor() {
    this.init()
    this.pos = {
      x: 0,
      y: 0,
    }
  }

  init() {
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
  }

  onMouseMove(e: MouseEvent) {
    const pos = {
      x: e.clientX,
      y: e.clientY,
    }
    this.pos = pos
  }
}
