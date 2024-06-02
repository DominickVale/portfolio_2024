import { $, $all, debounce, fitTextToContainerScr, showCursorMessage } from '../../utils'
import gsap from 'gsap'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { TypewriterPlugin } from '../animations/TypeWriterPlugin'
import { blurStagger } from '../animations/gsap'
import { PROJECTS_LIST } from '../../constants'
gsap.registerPlugin(TypewriterPlugin)

function removeOpacity() {
  this.targets()[0].classList.remove('opacity-0')
}

export default class BlogArticleRenderer extends BaseRenderer {
  experience: Experience
  tlStack: gsap.core.Timeline[]
  isFirstRender: boolean

  initialLoad() {
    super.initialLoad()
  }

  onEnter() {
    super.onEnter()

    this.isFirstRender = true
    this.isDesktop = window.innerWidth > 1024

    this.experience = new Experience()
    const lettersTL = blurStagger($('h1'), 0.08, 0.8)
    const imageSmall1 = $('#main-image-container .small-1')
    const imageSmall2 = $('#main-image-container .small-2')
    const imageSectionCable = $('#image-section .cable')
    gsap.set(imageSmall1, { opacity: 0 })
    gsap.set(imageSmall2, { opacity: 0 })
    gsap.set(imageSmall2, { opacity: 0 })
    gsap.set(imageSectionCable, { opacity: 0 })
    gsap.set('#open-proj-btn', {
      opacity: 0,
    })

    ///
    // IMAGE TIMELINE
    //
    //
    const imageTL = gsap
      .timeline({
        onStart: () => {
          window['image-section'].classList.remove('opacity-0')
          $all('#main-image-container small').forEach((e) => gsap.set(e, { autoAlpha: 0 }))
        },
      })
      .from('#main-image-container .fui-corners', {
        scale: 0,
        duration: 0.35,
        ease: 'circ.in',
      })
      .fromTo(
        '#main-image-container .fui-corners',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.09,
          stagger: {
            repeat: 20,
            each: 0.1,
          },
        },
        '<+50%',
      )
      .fromTo(
        imageSectionCable,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.09,
          stagger: {
            repeat: 10,
            each: 0.1,
          },
        },
        '<+25%',
      )
      .fromTo(
        '#image-section .corners',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.09,
          stagger: {
            repeat: 20,
            each: 0.1,
          },
        },
        '<+10%',
      )
      .from(
        '#image-section .corners',
        {
          scaleX: 0,
          duration: 0.5,
          ease: 'expo.inOut',
        },
        '<',
      )
      .set(
        '#open-proj-btn',
        {
          borderLeftWidth: 1,
        },
        '<+5%',
      )
      .fromTo(
        '#main-image',
        {
          scaleY: 0,
        },
        {
          scaleY: 1,
          duration: 0.5,
          ease: 'expo.in',
        },
        '<',
      )
      .to(imageSmall1, {
        onStart: function () {
          gsap.set(imageSmall1, { opacity: 0.4, visibility: 'unset' })
        },
        typewrite: {
          speed: 0.35,
        },
        ease: 'power4.in',
      })
      .to(
        imageSmall2,
        {
          onStart: function () {
            gsap.set(imageSmall2, { opacity: 0.4, visibility: 'unset' })
          },
          typewrite: {
            speed: 0.35,
          },
          ease: 'power4.in',
        },
        '<',
      )
      .fromTo(
        '#image-section th',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.09,
          stagger: {
            repeat: 20,
            each: 0.1,
          },
        },
        '<+25%',
      )
      .to(
        '#image-section .work-details-role',
        {
          onStart: removeOpacity,
          typewrite: {},
          duration: 1,
          ease: 'power4.out',
        },
        '<',
      )
      .to(
        '#image-section .work-details-client',
        {
          onStart: removeOpacity,
          typewrite: {},
          duration: 1,
          ease: 'power4.out',
        },
        '<+20%',
      )
      .to(
        '#image-section .work-details-year',
        {
          onStart: removeOpacity,
          typewrite: {},
          duration: 1,
          ease: 'power4.out',
        },
        '<+20%',
      )
      .to(
        '#image-section .work-details-tech',
        {
          onStart: removeOpacity,
          typewrite: {},
          duration: 1.5,
          ease: 'power4.out',
        },
        '<+20%',
      )
      .to('#open-proj-btn', { opacity: 1, duration: 0.5, ease: 'power4.in' }, "<")

    window['bg-blur'].classList.remove('opacity-0')

    ///
    // MAIN TIMELINE
    //
    //
    const tl = gsap.timeline({})
    tl.to('#case-n', {
      typewrite: {
        speed: 0.2,
      },
      ease: 'power4.inOut',
      onStart: function () {
        window['case-n'].classList.remove('!opacity-0')
      },
    })
      .add(lettersTL)
      .to(
        '#subtitle',
        {
          typewrite: {
            speed: 0.5,
            charClass: 'text-primary-lightest drop-shadow-glow',
          },
          ease: 'power4.inOut',
          onStart: function () {
            window['subtitle'].classList.remove('!opacity-0')
          },
        },
        '<+50%',
      )
      .to('#intro', {
        typewrite: {
          charClass: 'text-primary-lightest drop-shadow-glow',
        },
        duration: 3,
        ease: 'power4.inOut',
        onStart: function () {
          window['intro'].classList.remove('opacity-0')
          window['intro-details'].classList.remove('!opacity-0')
        },
      }, "<")
      .add(imageTL, '<')
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

  ////////////////////////////////
}
