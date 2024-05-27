import gsap from 'gsap'
import { $all, delay } from '../../utils'
import { TypewriterPlugin } from './TypeWriterPlugin'
gsap.registerPlugin(TypewriterPlugin)

export default class Typewriter {
  static #running: Record<string, any> = {}

  constructor() {
    this.init()
  }

  private init() {
    const els = Array.from($all('[data-typewriter-scramble]')) as HTMLElement[]
    els.forEach((el) => {
      el.addEventListener('mouseover', () => Typewriter.typewrite(el))
    })
  }

  public static async typewrite(el: HTMLElement, message?: string, speed?: number, charClass?: string) {
    if (el.getAttribute('data-typewriter-id')) {
      Typewriter.stop(el)
      await delay(100) // i don't like this one bit, but it'll do for now
    }

    const id = Math.random().toString()
    el.setAttribute('data-typewriter-id', id)

    const tl = gsap.timeline({
      onComplete: () => {
        el.removeAttribute('data-typewriter-id')
      },
    })
    Typewriter.#running[id] = {
      el,
      progress: 0,
      tl,
    }

    tl.to(el, {
      typewrite: {
        value: message,
        speed: speed || 0.8,
        charClass: charClass || 'text-primary-lightest',
      },
      ease: 'power4.inOut',
    })
  }

  public static stop(el: HTMLElement | string) {
    const id = typeof el === 'string' ? el : el.getAttribute('data-typewriter-id')
    const running = Typewriter.#running[id]
    if (running) {
      running.tl.kill()
      delete Typewriter.#running[id]
    }
  }
}
