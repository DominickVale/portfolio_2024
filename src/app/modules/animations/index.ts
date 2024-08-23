import { $all } from '../../utils'
import ChromaticAberrationAnim from './ChromaticAberration'
import type Cursor from '../Cursor'
import type Experience from '../../gl/Experience'

export default class Animations {
  chromaticAberrAnim: ChromaticAberrationAnim

  constructor() {}

  init(cursor: Cursor, experience: Experience) {
    this.chromaticAberrAnim = new ChromaticAberrationAnim(cursor, experience)
    this.chromaticAberrAnim.init()

    cursor.addAnimation(this.chromaticAberrAnim.update.bind(this.chromaticAberrAnim))

    const nextPageBtns = Array.from($all('.next-page-btn')) as HTMLDivElement[]
    nextPageBtns.forEach((el) => {
      setTimeout(() => {
        el.classList.remove('opacity-0')
        el.classList.add('animating')
      }, 5_000)
    })
  }
}
