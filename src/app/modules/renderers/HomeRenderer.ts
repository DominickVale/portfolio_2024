import gsap from 'gsap'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { TypewriterPlugin } from '../animations/TypeWriterPlugin'
import { $, $all, getZPosition } from '../../utils'
import { blurStagger } from '../animations/gsap'
import { LORENZ_PRESETS } from '../../constants'
import { HomePageAttractorAnim } from '../animations/attractor/HomePageAttractorAnim'

gsap.registerPlugin(TypewriterPlugin)

export default class HomeRenderer extends BaseRenderer {
  experience: Experience
  isFirstRender: boolean
  static enterTL: gsap.core.Timeline

  initialLoad() {
    super.initialLoad()
    window.addEventListener('preload-end', () => HomePageAttractorAnim.create())
  }

  onEnter() {
    super.onEnter()
    this.isFirstRender = true
    this.isDesktop = window.innerWidth > 1024

    this.experience = new Experience()
    BaseRenderer.resizeHandlers.push(this.handleResize.bind(this))
    this.createEnterAnim()

    if (window.app.preloaderFinished) {
      HomeRenderer.enterTL.play()
    } else {
      window.addEventListener('preload-end', () => {
        HomeRenderer.enterTL.play()
      })
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
    const statusItems = $all('.status-item')
    const itemsTL = gsap.timeline()

    statusItems.forEach((el, i) => {
      gsap.set(el, { opacity: 0 })
      const tl = gsap
        .timeline()
        .to(
          el,
          {
            typewrite: {
              charClass: 'text-primary-lightest drop-shadow-glow',
              maxScrambleChars: 3,
              soundOptions: {
                volume: 0.25,
              },
            },
            duration: 1,
            delay: i / 20,
          },
          '<',
        )
        .to(el, { opacity: 1, duration: 0.15, ease: 'power4.inOut' }, '<')
      itemsTL.add(tl, '<')
    })

    const lettersTL = blurStagger($('h1'))

    HomeRenderer.enterTL = gsap
      .timeline({ paused: true })
      .add(lettersTL)
      .add(itemsTL, '<+80%')
      .from('#status-available', {
        autoAlpha: 0,
        duration: 0.1,
        repeat: 3,
        ease: 'linear',
      })
      .from(
        '#home-about',
        {
          opacity: 0,
          duration: 1.5,
          ease: 'power4.inOut',
        },
        '<50%',
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
