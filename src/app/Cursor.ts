import type { Vec2 } from './types'
import { $, lerp } from './utils'

type MessageShowEvent = CustomEvent<{ message: string, isError?: boolean }>

export default class Cursor {
  pos: Vec2
  el: HTMLElement
  textEl: HTMLSpanElement
  ringEl: HTMLElement
  lastPos: Vec2

  constructor(public speed = 0.25) {
    this.init()
    this.pos = {
      x: 0,
      y: 0,
    }
    this.lastPos = this.pos
    this.el = $('#cursor')
    this.ringEl = $('#cursor-ring')
    this.textEl = $('#cursor-text')
  }

  init() {
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    window.addEventListener('touchmove', this.onTouchMove.bind(this))
    window.addEventListener('show-cursor-message', this.onShowMessage.bind(this))
    document.body.classList.add('no-cursor')
    requestAnimationFrame(this.render.bind(this))
  }

  onTouchMove(e: TouchEvent) {
    const pos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
    this.pos = pos
  }

  onMouseMove(e: MouseEvent) {
    const pos = {
      x: e.clientX,
      y: e.clientY,
    }
    this.pos = pos
  }

  onShowMessage(e: MessageShowEvent){
    const { message, isError } = e.detail
    this.textEl.textContent = message
    if(isError) this.textEl.classList.add('error')
    else this.textEl.classList.remove('error')
    setTimeout(() => this.textEl.textContent = '', 2000)
  }

  render(e: MouseEvent){
    this.el.style.transform = `translate(${this.pos.x}px, ${this.pos.y}px)`
    this.textEl.style.transform = `translate(${this.pos.x + 12}px, ${this.pos.y + 8}px)`
    this.lastPos.x = lerp(this.lastPos.x, this.pos.x, this.speed)
    this.lastPos.y = lerp(this.lastPos.y, this.pos.y, this.speed)
    this.ringEl.style.transform = `translate(${this.lastPos.x}px, ${this.lastPos.y}px)`
    requestAnimationFrame(this.render.bind(this))
  }
}
