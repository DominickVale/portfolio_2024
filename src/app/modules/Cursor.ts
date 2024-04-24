import type { Vec2 } from '../types'
import { $, $all, isMobile, lerp, showCursorMessage } from '../utils'
import Typewriter from './animations/Typewriter'

export type MessageShowEvent = {
  message: string
  isError?: boolean
  isSuccess?: boolean
  timeout?: number
  interval?: number
  iterations?: number
  delay?: number
}

export default class Cursor {
  pos: Vec2
  el: HTMLElement
  textEl: HTMLSpanElement
  ringEl: HTMLElement
  lastPos: Vec2
  isMobile: boolean

  constructor(public speed = 0.25) {
    this.isMobile = isMobile()
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
    window.addEventListener(
      'show-cursor-message',
      this.onShowMessage.bind(this),
    )
    document.body.classList.add('no-cursor')

    $all('[data-cursor-message]', document).forEach((el) => {
      const message = el.getAttribute('data-cursor-message')
      const timeout = Number(el.getAttribute('data-cursor-timeout'))
      const delay = Number(el.getAttribute('data-cursor-delay')) || 0
      const interval = Number(el.getAttribute('data-cursor-interval'))
      const iterations = Number(el.getAttribute('data-cursor-iterations'))
      const type = el.getAttribute('data-cursor-type')

      el.addEventListener('mouseenter', (e) => {
        const delayID = setTimeout(() => {
          showCursorMessage({
            message,
            timeout,
            interval,
            iterations,
            isSuccess: type === 'success',
            isError: type === 'error',
          })
        }, delay)
        el.setAttribute('data-cursor-delay-id', delayID.toString())
      })

      el.addEventListener('mouseout', () => {
        const delayID = el.getAttribute('data-cursor-delay-id')
        if (timeout <= 0) {
          showCursorMessage({ message: '' })
        }
        if (delayID) {
          clearTimeout(Number(delayID))
          Typewriter.stop(this.textEl)
        }
      })
    })

    if (!this.isMobile) {
      requestAnimationFrame(this.render.bind(this))
    }
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

  onShowMessage(e: CustomEvent<MessageShowEvent>) {
    const {
      message,
      isError,
      isSuccess,
      timeout,
      interval,
      iterations,
      delay,
    } = e.detail
    if (message.length > 1)
      Typewriter.typewrite(this.textEl, message, iterations, interval)
    else this.textEl.textContent = message
    if (isError) this.textEl.classList.add('error')
    else if (isSuccess) this.textEl.classList.add('success')
    else this.textEl.classList.remove('error', 'success')

    if (typeof timeout === 'number' && timeout > 0) {
      setTimeout(() => {
        Typewriter.stop(this.textEl)
        this.textEl.textContent = ''
      }, timeout)
    }
  }

  render(e: MouseEvent) {
    this.el.style.transform = `translate(${this.pos.x}px, ${this.pos.y}px)`
    this.textEl.style.transform = `translate(${this.pos.x}px, ${this.pos.y + 30}px)`
    this.lastPos.x = lerp(this.lastPos.x, this.pos.x, this.speed)
    this.lastPos.y = lerp(this.lastPos.y, this.pos.y, this.speed)
    this.ringEl.style.transform = `translate(${this.lastPos.x}px, ${this.lastPos.y}px)`
    requestAnimationFrame(this.render.bind(this))
  }
}
