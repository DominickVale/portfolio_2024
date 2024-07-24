import gsap from 'gsap'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { $, $all, getZPosition } from '../../utils'
import { blurStagger } from '../animations/gsap'
import { LORENZ_PRESETS } from '../../constants'


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
      .to(
        attractor.bufferMaterial.uniforms.uRho,
        {
          value: 30,
          duration: 0.01,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uBeta,
        {
          value: 20.252,
          duration: 0.01,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: -2.16,
          duration: 0.01,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        this.experience.params,
        {
          speed: 20,
          duration: 0.1,
          ease: 'power2.in',
          onComplete: () => {
            gsap.to(this.experience.params, {
              speed: LORENZ_PRESETS['default'].speed,
              duration: 2.5,
              ease: 'power2.out',
            })
          },
        },
        '<',
      )
      .add(lettersTL)
      .to(
        attractor.points.position,
        {
          x: this.experience.params.positionX,
          y: this.experience.params.positionY,
          z: getZPosition(),
          duration: 1,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          x: this.experience.params.rotationX,
          z: this.experience.params.rotationZ,
          duration: 1,
          ease: 'power2.inOut',
        },
        '<',
      )
  }

  handleResize() {
    if (!window.app.preloaderFinished) return //@TODO: figure out later
    const attractor = this.experience.world.attractor
    this.experience.params.positionZ = getZPosition()
    const aspect = window.innerWidth / window.innerHeight
    const newY = aspect > 1 ? this.experience.params.positionY : this.experience.params.positionY + window.innerHeight / 150
    gsap.to(attractor.points.position, { z: this.experience.params.positionZ, y: newY, duration: 0.25, ease: 'power4.out' })
  }
}
