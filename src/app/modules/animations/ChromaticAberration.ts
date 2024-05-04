import { $all } from '../../utils'
import type Cursor from '../Cursor'

const primaryColorWeight = 1.8
const maxOffset = 1.5
const maxBlur = 0.8

export default class ChromaticAberrationAnim {
  elements: HTMLElement[]
  constructor() { }

  init() {
    this.elements = Array.from($all('[data-aberration]'))
  }

  update(cursor: Cursor) {
    const dx = cursor.pos.x - cursor.lastPos.x
    const dy = cursor.pos.y - cursor.lastPos.y
    const velocity = Math.sqrt(dx * dx + dy * dy)

    const offset = Math.min(velocity / 8, maxOffset)
    const blur = Math.min(velocity / 8, maxBlur)

    for (const el of this.elements) {
      el.style.textShadow = `
        ${(primaryColorWeight * offset * dx) / velocity}px ${(primaryColorWeight * offset * dy) / velocity}px 0 var(--primary),
        ${(-offset * dx) / velocity}px ${(-offset * dy) / velocity}px 0 red,
        ${(-offset * dy) / velocity}px ${(offset * dx) / velocity}px 0 green,
        ${(offset * dy) / velocity}px ${(-offset * dx) / velocity}px 0 blue
      `

      el.style.filter = `blur(${blur}px)`
    }
  }
}
