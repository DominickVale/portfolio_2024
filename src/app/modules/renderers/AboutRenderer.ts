import gsap from 'gsap'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { TypewriterPlugin } from '../animations/TypeWriterPlugin'
import { CustomEase } from 'gsap/all'
import { $, $all } from '../../utils'

gsap.registerPlugin(CustomEase)
gsap.registerPlugin(TypewriterPlugin)

export default class AboutRenderer extends BaseRenderer {
  experience: Experience
  isFirstRender: boolean
  tl: gsap.core.Timeline
  aboutPage: string

  initialLoad() {
    super.initialLoad()
  }

  onEnter() {
    super.onEnter()
    this.isFirstRender = true
    this.isDesktop = window.innerWidth > 1024
    this.aboutPage = window.location.pathname

    this.experience = new Experience()
    const attractor = this.experience.world.attractor

    const isIndexPage = this.aboutPage.split('/').length <= 2
    const isFirstTime = !window.aboutPageVisited


    gsap.set('table td, table th', { opacity: 0 })
    gsap.set('.fake-logs > *', { opacity: 0 })
    gsap.set('h2:first-of-type', { opacity: 0 })
    gsap.set('h2:last-of-type', { opacity: 0 })
    gsap.set('p', { opacity: 0 })
    gsap.set('.btn', { opacity: 0 })


    const imagesTL = gsap.timeline()

    $all('.img-container').forEach((img, i) => {
      const imageSmall1 = $('.small-1', img)
      const imageSmall2 = $('.small-2', img)
      gsap.set(imageSmall1, { opacity: 0 })
      gsap.set(imageSmall2, { opacity: 0 })
      const tl = gsap.timeline()
      .from($('.new-fui-corners', img), {
        scale: 0,
        duration: 0.35,
        ease: 'circ.in',
      })
      .fromTo($('.new-fui-corners', img),
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
        $('img', img),
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

      imagesTL.add(tl, "<+10%")
    })

    function removeOpacity() {
      gsap.to(this.targets()[0], { opacity: 1 })
    }

    const fakeCodeTL = gsap
      .timeline()
      .to('.fake-logs pre:nth-child(1)', {
        typewrite: {
          charClass: 'text-primary-lightest',
        },
        duration: 0.75,
        onStart: removeOpacity,
      })
      .to('.fake-logs pre:nth-child(2)', {
        typewrite: {
          charClass: 'text-primary-lightest',
        },
        duration: 1,
        delay: 1,
        onStart: removeOpacity,
      })
      .to('.fake-logs pre:nth-child(3)', {
        typewrite: {
          charClass: 'text-primary-lightest',
        },
        duration: 1,
        onStart: removeOpacity,
        onComplete: () => {
          setTimeout(() => {
            gsap.to('.fake-logs pre:nth-child(4)', {
              typewrite: {
                charClass: 'text-primary-lightest',
              },
              duration: 1,
              onStart: removeOpacity,
            })
          }, 1000)
        },
      })

    const attractorPosTl = gsap
      .timeline()
      .to(
        attractor.points.position,
        {
          // x: -1.4,
          // y: -15,
          // z: -11.5,
          x: -1.4,
          y: isIndexPage ? -21 : -31.5,
          z: -50,
          duration: attractor.points.position.x === -1.4 ? 0.1 : 2,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          x: -0.201061929829747,
          z: -0.746,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )
    const btnsTL = gsap
      .timeline()
      .from('.btn', {
        width: 0,
        duration: 2.6,
        ease: CustomEase.create('custom', 'M0,0 C0.5,0 0.467,0.024 0.511,0.05 0.596,0.101 0.713,0.301 0.713,0.579 0.713,1.062 0.99,0.923 1,1'),
      })
      .to(
        '.btn',
        {
          opacity: 1,
          duration: 0.085,
          repeat: 28,
        },
        '<',
      )

    const detailsTL = gsap
      .timeline()
      .to('table th', {
        opacity: 1,
        duration: 0.075,
        stagger: {
          repeat: 10,
          each: 0.1,
        },
      })
      .to(
        '.details-services',
        {
          onStart: removeOpacity,
          typewrite: {},
          duration: 1,
          ease: 'power4.out',
        },
        '<+25%',
      )
      .to(
        '.details-company',
        {
          onStart: removeOpacity,
          typewrite: {},
          duration: 1,
          ease: 'power4.out',
        },
        '<+20%',
      )
      .to(
        '.details-main-tech',
        {
          onStart: removeOpacity,
          typewrite: {},
          duration: 1,
          ease: 'power4.out',
        },
        '<+20%',
      )
      .to(
        '.details-tech',
        {
          onStart: removeOpacity,
          typewrite: {},
          duration: 1.5,
          ease: 'power4.out',
        },
        '<+20%',
      )

    this.tl = gsap
      .timeline({
        onComplete: () => {
          window.aboutPageVisited = true
        }
      })
      .add(attractorPosTl)
      .add(fakeCodeTL, '<')
      .to(
        'h2:first-of-type',
        {
          typewrite: {
            charClass: 'text-primary-lightest drop-shadow-glow',
            maxScrambleChars: 1,
          },
          ease: 'power1.out',
          duration: isIndexPage && isFirstTime ? 1 : 0.75,
          onStart: () => gsap.set('h2:first-of-type', { opacity: 1 }),
        },
        '<+40%',
      )
      .to(
        'h2:last-of-type',
        {
          typewrite: {
            charClass: 'text-primary-lightest drop-shadow-glow',
            value: isIndexPage && !isFirstTime ? "NICE TO SEE YOU AGAIN!" : undefined,
            maxScrambleChars: 2,
          },
          ease: 'power1.out',
          duration: isIndexPage && isFirstTime ? 2 : 1,
          onStart: () => gsap.set('h2:last-of-type', { opacity: 1 }),
        },
        isIndexPage && isFirstTime ? undefined : '<+80%',
      )
      .to(
        '.intro-paragraph',
        {
          delay: isIndexPage && isFirstTime ? 1 : 0,
          opacity: 1,
          duration: 1,
          ease: 'power4.in',
        },
        isIndexPage && isFirstTime ? undefined : '<+80%',
      )
      .add(detailsTL)
      .add(imagesTL, "<")
      // .to('.intro-paragraph', {
      //   typewrite: {
      //     charClass: 'text-primary-lightest drop-shadow-glow',
      //     maxScrambleChars: 8,
      //   },
      //   delay: 1,
      //   duration: 2,
      //   onStart: () => gsap.set('p', { opacity: 1 }),
      // })
      .add(btnsTL, '<')
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
