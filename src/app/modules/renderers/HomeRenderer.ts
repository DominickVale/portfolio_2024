import gsap from 'gsap'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { TypewriterPlugin } from '../animations/TypeWriterPlugin'
import { getZPosition } from '../../utils'

gsap.registerPlugin(TypewriterPlugin)

export default class HomeRenderer extends BaseRenderer {
  experience: Experience
  isFirstRender: boolean

  initialLoad() {
    super.initialLoad()
  }

  onEnter() {
    super.onEnter()
    this.isFirstRender = true
    this.isDesktop = window.innerWidth > 1024

    this.experience = new Experience()
    this.handleResize()
    BaseRenderer.resizeHandlers.push(this.handleResize.bind(this))

    const attractor = this.experience.world.attractor
    gsap
      .timeline()
      .to(attractor.points.position, {
        // x: -1.4,
        // y: -15,
        // z: -11.5,
        x: this.experience.params.positionX,
        y: this.experience.params.positionY,
        z: this.experience.params.positionZ,
        duration: 1,
        ease: 'power2.inOut',
      })
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

  handleResize() {
    const attractor = this.experience.world.attractor
    this.experience.params.positionZ = getZPosition()
    const aspect = window.innerWidth / window.innerHeight
    const newY = aspect > 1 ? this.experience.params.positionY : this.experience.params.positionY + (window.innerHeight / 150)
    gsap.to(attractor.points.position, { z: this.experience.params.positionZ, y: newY, duration: 0.25, ease: 'power4.out' })
  }
}
