import { $, $all, delay } from '../../utils'

// const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!|'
const CHARS = '::abcdefghijklmnopqrstuv::::wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!|!<>-_\\/[]{}-=+*^?#________'


export default class Typewriter {
  private static running: Record<string, any> = {}

  constructor() {
    this.init()
  }

  private init() {
    const els = Array.from($all('[data-typewriter-scramble]')) as HTMLElement[]
    els.forEach((el) => {
      el.addEventListener('mouseover', () => Typewriter.typewrite(el))
    })
  }

  public static async typewrite(
    el: HTMLElement,
    message?: string,
    iterations?: number,
    interval = 30,
  ) {
    const text = message || el.getAttribute('data-typewriter-scramble') || ''

    const id =
      el.getAttribute('data-typewriter-scramble-id') || Math.random().toString()
    el.setAttribute('data-typewriter-scramble-id', id)

    if (Typewriter.running[id]) {
      Typewriter.stop(el)
    }
    Typewriter.running[id] = true

    let currentText = []
    const iter = iterations || 1

    for (let i = 0; i < text.length; i++) {
      const originalLetter = text[i]
      for (let j = 0; j < iter; j++) {
        if (!Typewriter.running[id]) { break }
        let tmpTxt = currentText.map((l, idx) => {
          if (idx > currentText.length - 3 ) {
            return `<span class="text-stone-200">${CHARS[Math.floor(Math.random() * CHARS.length)]}</span>`
          } else {
            return l
          }
        })
        el.innerHTML = tmpTxt.join('')

        const newInterval = interval * Math.pow(i, 1.2) / text.length
        await delay(newInterval)
      }
      currentText.push(originalLetter)
      el.innerHTML = currentText.join('')
    }
  }

  public static stop(el: HTMLElement) {
    const id = el.getAttribute('data-typewriter-scramble-id')
    if (Typewriter.running[id]) {
      delete Typewriter.running[id]
    }
  }
}
