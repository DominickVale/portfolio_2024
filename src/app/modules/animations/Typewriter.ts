import { $, $all, delay } from '../../utils'

// const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!|'
// this is cooler
const CHARS = 'ᚠᚢᚦᚨᚩᚬᚭᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻᚼᚽᚾᚿᛀᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛠᛡᛢᛣᛤᛥᛦ<>-_\\/[]{}-=+*^?#________'

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

  public static async typewrite(el: HTMLElement, message?: string, iterations?: number, interval = 30, customCharsSet?: string) {
    const chars = customCharsSet || CHARS
    if (el.getAttribute('data-typewriter-id')) {
      Typewriter.stop(el)
      await delay(100) // i don't like this one bit, but it'll do for now
    }

    const text = message || ''
    const id = Math.random().toString()
    el.setAttribute('data-typewriter-id', id)

    Typewriter.#running[id] = true

    let currentText = []
    const iter = iterations || 1
    const speed = interval + (interval / text.length) * 20

    for (let i = 0; i < text.length; i++) {
      const originalLetter = text[i]
      for (let j = 0; j < iter; j++) {
        if (!Typewriter.#running[id]) {
          el.innerHTML = ''
          el.removeAttribute('data-typewriter-id')
          return
        }
        let tmpTxt = currentText.map((l, idx) => {
          if (idx > text.length - text.length / 3 ? idx > currentText.length - 2 : idx > currentText.length - 4) {
            return `<span class="text-primary-lightest">${chars[Math.floor(Math.random() * chars.length)]}</span>`
          } else {
            return l
          }
        })

        el.innerHTML = tmpTxt.join('')

        const newSpeed = (speed * Math.pow(i, 1.2)) / text.length
        await delay(newSpeed)
      }
      currentText.push(originalLetter)
      el.innerHTML = currentText.join('')
    }

    el.removeAttribute('data-typewriter-id')
  }

  public static stop(el: HTMLElement | string) {
    const id = typeof el === 'string' ? el : el.getAttribute('data-typewriter-id')
    if (Typewriter.#running[id]) {
      delete Typewriter.#running[id]
    }
  }
}
