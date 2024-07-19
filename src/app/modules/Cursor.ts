import type { Vec2 } from '../types'
import gsap from 'gsap'
import { $, $all, isMobile, lerp, showCursorMessage } from '../utils'
import Typewriter from './animations/Typewriter'

export type MessageShowEvent = {
  message: string
  isError?: boolean
  isSuccess?: boolean
  timeout?: number
  delay?: number
  speed?: number
  charClass?: string
  ease?: gsap.EaseString | gsap.EaseFunction
  maxScrambleChars?: number
}

export default class Cursor {
  pos: Vec2
  el: HTMLElement
  textEl: HTMLSpanElement
  ringEl: HTMLElement
  lastPos: Vec2
  isMobile: boolean
  animations: Array<() => void>
  els: HTMLElement[]
  wasLastClickTouch: boolean

  constructor(public speed = 0.25) {
    this.isMobile = isMobile()
    this.pos = {
      x: 0,
      y: 0,
    }
    this.lastPos = this.pos
    this.el = $('#cursor')
    this.ringEl = $('#cursor-ring')
    this.textEl = this.isMobile ? $('#cursor-text-mobile') : $('#cursor-text')
    this.animations = []
    this.init()
  }

  init() {
    window.addEventListener('pointerup', this.onPointerUp.bind(this))
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    window.addEventListener('touchmove', this.onTouchMove.bind(this))
    window.addEventListener('mousedown', this.onClick.bind(this))
    window.addEventListener('show-cursor-message', this.onShowMessage.bind(this))
    document.body.classList.add('no-cursor')

    this.assignListeners()
    if (!this.isMobile) {
      requestAnimationFrame(this.render.bind(this))
    }
  }

  onClick() {
    Typewriter.stop(this.textEl)
  }

  onPointerUp(e: PointerEvent) {
    if (e.pointerType !== 'mouse' && !this.wasLastClickTouch) {
      gsap.to(this.el.parentElement, { autoAlpha: 0, duration: 0.5, ease: 'power4.out' })
      this.wasLastClickTouch = true
    }
  }

  abortCursorMessage(el: HTMLElement, showEmptyMessage: boolean) {
    const delayID = el.getAttribute('data-cursor-delay-id')
    if (showEmptyMessage) {
      showCursorMessage({ message: '' })
    }
    if (delayID) {
      clearTimeout(Number(delayID))
    }
    Typewriter.stop(this.textEl)
    this.textEl.textContent = ''
  }

  assignListeners() {
    const els = Array.from($all('[data-cursor-message]', document))
    this.els = els
    els.forEach((el) => {
      const message = el.getAttribute('data-cursor-message')
      const charClass = el.getAttribute('data-cursor-char-class')
      const timeout = Number(el.getAttribute('data-cursor-timeout'))
      const delay = Number(el.getAttribute('data-cursor-delay')) || 0
      const speed = Number(el.getAttribute('data-cursor-speed'))
      const ease = el.getAttribute('data-cursor-ease')
      const type = el.getAttribute('data-cursor-type')
      const oldPage = window.location.href

      el.addEventListener('mouseenter', (e) => {
        const delayID = setTimeout(() => {
          if (!window.app.isTransitioning && oldPage == window.location.href) {
            showCursorMessage({
              message,
              timeout,
              speed,
              ease,
              charClass,
              maxScrambleChars: message.length > 10 ? undefined : Math.ceil(message.length / 5),
              isSuccess: type === 'success',
              isError: type === 'error',
            })
          }
        }, delay)
        el.setAttribute('data-cursor-delay-id', delayID.toString())
      })

      el.addEventListener('mouseout', () => {
        if (timeout <= 0) {
          this.abortCursorMessage(el, true)
        }
      })
    })
  }

  reload() {
    this.assignListeners()
    Typewriter.stop(this.textEl)
    this.textEl.textContent = ''
  }

  addAnimation(fn: () => void) {
    this.animations.push(fn)
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
    
    if (this.wasLastClickTouch) {
      this.wasLastClickTouch = false
      gsap.to(this.el.parentElement, { autoAlpha: 1, duration: 0.15, ease: 'power4.out' })
    }
  }

  onShowMessage(e: CustomEvent<MessageShowEvent>) {
    const { message, isError, isSuccess, timeout, speed, charClass, ease, maxScrambleChars } = e.detail
    if (message.length > 1) Typewriter.typewrite(this.textEl, { message, speed, charClass, ease, maxScrambleChars, soundOptions: { volume: message.length > 8 ? 0.25 : 0 }})
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

  //@TODO: split into another animationn
  render(e: MouseEvent) {
    this.el.style.transform = `translate(${this.pos.x}px, ${this.pos.y}px)`
    this.textEl.style.transform = `translate(${this.pos.x}px, ${this.pos.y + 30}px)`
    this.lastPos.x = lerp(this.lastPos.x, this.pos.x, this.speed)
    this.lastPos.y = lerp(this.lastPos.y, this.pos.y, this.speed)
    this.ringEl.style.transform = `translate(${this.lastPos.x}px, ${this.lastPos.y}px)`

    for (const fn of this.animations) {
      fn()
    }
    requestAnimationFrame(this.render.bind(this))
  }
}
