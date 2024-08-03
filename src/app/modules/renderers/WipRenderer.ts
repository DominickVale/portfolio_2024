import gsap from 'gsap'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { $, $all, getZPosition } from '../../utils'
import { blurStagger } from '../animations/gsap'
import { LORENZ_PRESETS } from '../../constants'
import { WipPageAttractorAnim } from '../animations/attractor/WipPageAttractorAnim'


export default class WipRenderer extends BaseRenderer {
  experience: Experience
  isFirstRender: boolean
  static enterTL: gsap.core.Timeline

  initialLoad() {
    super.initialLoad()
  }

  onEnter() {
    super.onEnter()
    this.isDesktop = window.innerWidth > 1024

    this.experience = new Experience()
    BaseRenderer.resizeHandlers.push(this.handleResize.bind(this))
    this.createEnterAnim()

    if (window.app.preloaderFinished) {
      WipRenderer.enterTL.play()
    } else {
      window.addEventListener('preload-end', () => WipRenderer.enterTL.play())
    }
  }

  onEnterCompleted() {
    // run after the transition.onEnter has fully completed
  }

  onLeave() {
    // run before the transition.onLeave method is called
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
  }
  //////////////////////////////////////

  createEnterAnim() {
    const lettersTL = blurStagger($('h1'))
    const attractor = this.experience.world.attractor

    WipRenderer.enterTL = gsap
      .timeline({ paused: true })
      .add(lettersTL)
  }

  //@TODO: remove, use base and this.getZOffset
  handleResize() {
    if (!window.app.preloaderFinished) return //@TODO: figure out later
    const attractor = this.experience.world.attractor
    this.experience.params.positionZ = getZPosition()
    const aspect = window.innerWidth / window.innerHeight
    const newY = aspect > 1 ? this.experience.params.positionY : this.experience.params.positionY + window.innerHeight / 150
    // gsap.to(attractor.points.position, { z: this.experience.params.positionZ, y: newY, duration: 0.25, ease: 'power4.out' })
    attractor.points.position.z = this.experience.params.positionZ
    attractor.points.position.y = newY
  }
}
