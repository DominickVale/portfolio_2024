import { $, $all } from '../../utils'

// const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!|'
// this is cooler
const CHARS = 'ᚠᚢᚦᚨᚩᚬᚭᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻᚼᚽᚾᚿᛀᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛠᛡᛢᛣᛤᛥᛦ'

export default class TextScramble {
  static #elsIntervals: Record<string, any> = {}

  constructor() {
    TextScramble.init()
  }

  static init() {
    $all('[data-text-scramble]').forEach((el, i) => {
      el.setAttribute('data-text-scramble', el.innerText)
      el.addEventListener('mouseover', () => TextScramble.scramble(el))
    })
  }

  public reload() {
    TextScramble.init()
  }

  public static scramble(el: HTMLElement, speed: number = 45) {
    const originalText = el.getAttribute('data-text-scramble')
    if (!originalText) return

    const id = el.getAttribute('data-text-scramble-id') || Math.random().toString()
    el.setAttribute('data-text-scramble-id', id)

    if (TextScramble.#elsIntervals[id]) {
      clearInterval(TextScramble.#elsIntervals[id])
      delete TextScramble.#elsIntervals[id]
      el.removeAttribute('data-text-scramble-id')
      el.innerText = originalText
    }

    let iteration = 0

    TextScramble.#elsIntervals[id] = setInterval(() => {
      el.innerText = originalText
        .split('')
        .map((_, index) => {
          const ignoreRegex = /\s|\n/ // ignore spaces and newlines
          if (index < iteration || ignoreRegex.test(originalText[index])) {
            return originalText[index]
          }
          return CHARS[Math.floor(Math.random() * 39)]
        })
        .join('')

      if (iteration >= originalText.length || !TextScramble.#elsIntervals[id]) {
        clearInterval(TextScramble.#elsIntervals[id])
        delete TextScramble.#elsIntervals[id]
        el.removeAttribute('data-text-scramble-id')
        el.innerText = originalText
      }

      iteration += 1 / 2
    }, speed)
  }
}
