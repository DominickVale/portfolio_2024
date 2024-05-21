import type Experience from '../../gl/Experience'
import { $all } from '../../utils'
import type Cursor from '../Cursor'

const primaryColorWeight = 1.8
const maxBlur = 0.8

export default class ChromaticAberrationAnim {
  elements: { el: HTMLElement; value: number }[]
  constructor(
    private cursor: Cursor,
    private experience: Experience,
  ) {}

  init() {
    const els = Array.from($all('[data-aberration]'))
    this.elements = els.map((el) => {
      const value = Number(el.getAttribute('data-aberration'))
      return { el, value: value }
    })
  }

  update() {
    const dx = this.cursor.pos.x - this.cursor.lastPos.x
    const dy = this.cursor.pos.y - this.cursor.lastPos.y
    const velocity = Math.sqrt(dx * dx + dy * dy)

    for (const { el, value } of this.elements) {
      const maxOffset = value || 1.5
      const offset = Math.min(velocity / 8, maxOffset)
      const blur = Math.min(velocity / 8, maxBlur)

      if (velocity <= 0) return

      const primaryShift = (primaryColorWeight * offset * dx) / velocity
      const shiftXNeg = (-offset * dx) / velocity
      const shiftYNeg = (-offset * dy) / velocity
      const shiftX = (offset * dx) / velocity
      const shiftY = (offset * dy) / velocity

      el.style.textShadow = `
        ${primaryShift}px ${primaryShift}px 0 var(--primary),
        ${shiftXNeg}px ${shiftYNeg}px 0 red,
        ${shiftYNeg}px ${shiftX}px 0 green,
        ${shiftY}px ${shiftXNeg}px 0 blue
      `

      this.experience.renderer.chromaticAberrationEffect.offset.set(shiftX / 1500, shiftY / 1500)

      el.style.filter = `blur(${blur}px)`
    }
  }
}
