import { $, $all } from '../../utils'

// const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!|'
// this is cooler
const CHARS = 'ᚠᚢᚦᚨᚩᚬᚭᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻᚼᚽᚾᚿᛀᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛠᛡᛢᛣᛤᛥᛦ'

export default class TextScramble {
  static #elsIntervals: Record<string, any> = {}

  constructor() {
    TextScramble.init()
  }

  static onMouseHover(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement
    if (!el) return
    el.setAttribute('data-text-scramble', el.innerText)
    const speed = el.getAttribute('data-text-scramble-speed')
    TextScramble.scramble(el, Number(speed) || undefined)
  }

  static init() {
    $all('[data-text-scramble]').forEach((el, i) => {
      //this is going to be called on every transition, but identical event handlers are discarded
      //(only if the function is not anonymous)
      el.addEventListener('mouseover', TextScramble.onMouseHover)
    })
  }

  public reload() {
    TextScramble.init()
  }

  public static scramble(el: HTMLElement, speed: number = 45) {
    const originalText = el.getAttribute('data-text-scramble')
    const audioAttr = el.getAttribute('data-text-scramble-audio')
    const soundEnabled = !!audioAttr

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

    const soundId = 'typing_' + id
    if (soundEnabled) {
      const soundOptions = window.app.audio.parseAudioAttributes(audioAttr)
      window.app.audio.play(soundId, soundOptions.name || 'typing', {
        loop: true,
        volume: 0.05,
        rate: 1.4,
        ...soundOptions,
      })
    }

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
        if (soundEnabled) window.app.audio.stop(soundId)
      }

      iteration += 1 / 2
    }, speed)
  }
}
