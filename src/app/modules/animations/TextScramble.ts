import { $, $all } from '../../utils'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!|'

export default class TextScramble {
  static #elsIntervals: Record<string, any> = {}

  constructor() {
    console.log('TextAnimations')
    this.#init()
  }

  #init() {
    const els = Array.from($all('[data-text-scramble]')) as HTMLElement[]
    console.log(els)
    els.forEach((el, i) => {
      el.addEventListener('mouseover', () => TextScramble.scramble(el))
    })
  }

  public static scramble(el: HTMLElement, speed: number = 45) {
    const text = el.innerText
    if (!text) return

    const originalText = el.getAttribute('data-text-scramble') || text
    let iteration = 0

    const id =
      el.getAttribute('data-text-scramble-id') || Math.random().toString()
    el.setAttribute('data-text-scramble-id', id)

    if (TextScramble.#elsIntervals[id]) {
      clearInterval(TextScramble.#elsIntervals[id])
      delete TextScramble.#elsIntervals[id]
    }

    TextScramble.#elsIntervals[id] = setInterval(() => {
      el.innerText = originalText
        .split('')
        .map((letter, index) => {
          if (index < iteration) {
            return originalText[index]
          }
          return CHARS[Math.floor(Math.random() * 39)]
        })
        .join('')

      if (iteration >= originalText.length) {
        clearInterval(TextScramble.#elsIntervals[id])
        delete TextScramble.#elsIntervals[id]
      }

      iteration += 1 / 2
    }, speed)
  }
}
