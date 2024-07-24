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
    // el.setAttribute('data-text-scramble', el.innerText)
    const speed = el.getAttribute('data-text-scramble-speed')
    TextScramble.scramble(el, Number(speed) || undefined)
  }

  static init() {
    $all('[data-text-scramble]').forEach((el, i) => {
      //this is going to be called on every transition, but identical event handlers are discarded
      //(only if the function is not anonymous)
      el.addEventListener('mouseover', TextScramble.onMouseHover)

      if (!$('.scramble-container', el)) {
        const textNode = Array.from(el.childNodes).find((node) => node.nodeType === Node.TEXT_NODE)
        const oldText = textNode?.textContent
        el.removeChild(textNode)
        const oldHtml = el.innerHTML

        const scrambleHtml = `
<div class="scramble-container relative pointer-events-none">
  <span class="shadow opacity-0 text-red-500">${oldText || ''}</span>
  <span class="scramble-text absolute left-0 top-0 w-full h-full">${oldText || ''}</span>
</div>
`
        el.innerHTML = oldHtml + scrambleHtml
      }
    })
  }

  public reload() {
    TextScramble.init()
  }

  public static scramble(el: HTMLElement, speed: number = 45) {
    const target = $('.scramble-container .scramble-text', el)

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
      target.innerText = originalText
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
      target.innerText = originalText
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
        target.innerText = originalText
        if (soundEnabled) window.app.audio.stop(soundId)
      }

      iteration += 1 / 2
    }, speed)
  }
}
