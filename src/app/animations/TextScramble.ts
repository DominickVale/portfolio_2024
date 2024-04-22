import { $, $all } from '../utils'

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export default class TextScramble {
  els: HTMLElement[]
  elsIntervals: Record<string, any>

  constructor() {
    console.log('TextAnimations')
    this.elsIntervals = {}
    this.init()
  }

  init() {
    this.els = Array.from($all('[data-text-scramble]')) as HTMLElement[]
    console.log(this.els)
    this.els.forEach((el, i) => {
      el.addEventListener('mouseover', this.onMouseHover.bind(this, el, i))
    })
  }

  onMouseHover(el: HTMLElement, id: number, ev: Event) {
    const text = el.innerText
    if (!text) return
    this.scramble(el,id, text)
  }

  scramble(el: HTMLElement, id: number, text: string) {
    let iteration = 0
    const originalText = el.getAttribute('data-text-scramble')
    let newText = originalText
    if(this.elsIntervals[id]){
      clearInterval(this.elsIntervals[id])
      delete this.elsIntervals[id]
    } 
    this.elsIntervals[id] = setInterval(() => {
      el.innerText = newText
        .split('')
        .map((letter, index) => {
          if (index < iteration) {
            return originalText[index]
          }

          return CHARS[Math.floor(Math.random() * 26)]
        })
        .join('')
      if (iteration >= originalText.length) {
        clearInterval(this.elsIntervals[id])
        delete this.elsIntervals[id]
      }

      iteration += 1 / 3
    }, 30)
  }
}
