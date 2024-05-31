import gsap from 'gsap'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { TypewriterPlugin } from '../animations/TypeWriterPlugin'

gsap.registerPlugin(TypewriterPlugin)

export default class HomeRenderer extends BaseRenderer {
  isDesktop: boolean
  experience: Experience
  isFirstRender: boolean

  initialLoad() {
    super.initialLoad()
  }

  onEnter() {
    super.onEnter()
    this.isFirstRender = true
    this.isDesktop = window.innerWidth > 1024

    console.log("HOME RENDER")
    this.experience = new Experience()
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
}
