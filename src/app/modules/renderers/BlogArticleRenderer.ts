import { $, $all, debounce, fitTextToContainerScr, showCursorMessage } from '../../utils'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { TypewriterPlugin } from '../animations/TypeWriterPlugin'
import { blurStagger } from '../animations/gsap'
import Lenis from 'lenis'
import { ContactsInternalRenderer } from './ContactsRenderer'
gsap.registerPlugin(TypewriterPlugin)

function removeOpacity() {
  this.targets()[0]?.classList.remove('opacity-0')
}

function removeSetOpacity() {
  gsap.set(this.targets()[0], { opacity: 1 })
}

export default class BlogArticleRenderer extends BaseRenderer {
  experience: Experience
  tlStack: gsap.core.Timeline[]
  isFirstRender: boolean
  static tl: gsap.core.Timeline
  static contactsTl: gsap.core.Timeline
  static scrollTl: gsap.core.Timeline
  lenis: any
  contactsRenderer: ContactsInternalRenderer

  initialLoad() {
    super.initialLoad()
  }

  onEnter() {
    super.onEnter()

    this.isFirstRender = true
    this.isDesktop = window.innerWidth > 1024

    this.experience = new Experience()
    const titleLettersTL = blurStagger($('#article-title'), 0.01, 0.5)
    const debouncedHandleResizeFn = debounce(this.handleResize.bind(this), 100)
    BaseRenderer.resizeHandlers.push(debouncedHandleResizeFn)
    this.handleResize(true)
    const imageSection = this.isDesktop ? '#image-section' : '#image-section-mobile'
    const mainImageContainer = this.isDesktop ? '#main-image-container' : '#main-image-container-mobile'
    const mainImage = this.isDesktop ? '#main-image' : '#main-image-mobile'

    const marquee = $('.marquee-container')
    const imageSmall1 = $(`${mainImageContainer} .small-1`)
    const imageSmall2 = $(`${mainImageContainer} .small-2`)
    const imageSectionCable = $(`${imageSection} .cable`)
    this.lenis = new Lenis({ duration: 2, smoothWheel: true })
    gsap.set('#bg-blur', { opacity: 1 })

    this.lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    gsap.set(marquee, { opacity: 0 })
    gsap.set(imageSmall1, { opacity: 0 })
    gsap.set(imageSmall2, { opacity: 0 })
    gsap.set('#intro-details', { opacity: 0 })
    gsap.set(imageSectionCable, { opacity: 0 })
    gsap.set('#open-proj-btn', {
      opacity: 0,
    })

    //contacts bg blur on scroll
    setTimeout(() => {
      BlogArticleRenderer.scrollTl = gsap
        .timeline({
          scrollTrigger: {
            trigger: '#contacts',
            start: 'top center',
            end: 'bottom bottom',
            scrub: 0.1,
          },
        })
        .to('#bg-blur', {
          opacity: 0,
        })
    }, 500)

    const blogParagraphs = $all('.blog-section').forEach((b) => {
      const img = $('.blog-image', b)
      const content = $all('.blog-section-content > *:not(h2)', b)
      const title = $('h2', b)

      gsap.set(content, { opacity: 0 })
      gsap.set(title, { opacity: 0 })
      gsap.set($('.alt', img), { opacity: 0 })
      gsap.set($('small', img), { opacity: 0 })
      const blogSectionImageTl = gsap
        .timeline({
          scrollTrigger: {
            trigger: img,
            start: 'top center',
            end: 'bottom center',
          },
        })
        .to(title, {
          typewrite: {},
          duration: 2,
          ease: 'circ.inOut',
          onStart: removeSetOpacity,
        })
        .to(
          content,
          {
            opacity: 1,
            duration: 3,
            stagger: 0.5,
            ease: 'circ.inOut',
          },
          '<',
        )
        .from(
          $('.fui-corners-dot', img),
          {
            scale: 0,
            duration: 0.5,
            ease: 'expo.in',
          },
          '<',
        )
        .from(
          $('.fui-corners-dot', img),
          {
            opacity: 0,
            duration: 0.075,
            stagger: {
              repeat: 10,
              each: 0.1,
            },
          },
          '<',
        )
        .from(
          $('img', img),
          {
            scaleY: 0,
            duration: 0.5,
            ease: 'expo.in',
          },
          '<',
        )
        .set($('.alt', img), { autoAlpha: 1 })
        .to($('.alt', img), {
          typewrite: {},
          duration: 1,
        })
        .set($('small', img), { autoAlpha: 0.4 }, '<')
        .to(
          $('small', img),
          {
            typewrite: {},
            duration: 1.5,
            ease: 'circ.inOut',
          },
          '<',
        )
    })
    ///
    // IMAGE TIMELINE
    //
    //
    const imageTL = gsap
      .timeline({
        onStart: () => {
          if (this.isDesktop) {
            window['image-section'].classList.remove('opacity-0')
          } else {
            window['image-section-mobile'].classList.remove('opacity-0')
          }
          $all(`${mainImageContainer} small`).forEach((e) => gsap.set(e, { autoAlpha: 0 }))
        },
      })
      .from(`${mainImageContainer} .new-fui-corners`, {
        scale: 0,
        duration: 0.35,
        ease: 'circ.in',
      })
      .fromTo(
        `${mainImageContainer} .new-fui-corners`,
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
        mainImage,
        {
          scaleY: 0,
        },
        {
          scaleY: 1,
          duration: 0.35,
          ease: 'power4.inOut',
        },
        '<+20%',
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
        '<+10%',
      )
      .fromTo(
        marquee,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.07,
          stagger: {
            repeat: 10,
            each: 0.1,
          },
        },
      '<'
      )
      .fromTo(
        `${imageSection} .fui-corners-dot`,
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
        `${imageSection} .fui-corners-dot`,
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
      .to(imageSmall1, {
        onStart: function () {
          gsap.set(imageSmall1, { opacity: 0.4, visibility: 'unset' })
        },
        typewrite: {},
        duration: 0.35,
        ease: 'power4.in',
      })
      .to(
        imageSmall2,
        {
          onStart: function () {
            gsap.set(imageSmall2, { opacity: 0.4, visibility: 'unset' })
          },
          typewrite: {},
          duration: 0.35,
          ease: 'power4.in',
        },
        '<',
      )
      .fromTo(
        `${imageSection} th`,
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
        `${imageSection} .work-details-role`,
        {
          onStart: removeOpacity,
          typewrite: {},
          duration: 1,
          ease: 'power4.out',
        },
        '<',
      )
      .to(
        `${imageSection} .work-details-client`,
        {
          onStart: removeOpacity,
          typewrite: {},
          duration: 1,
          ease: 'power4.out',
        },
        '<+20%',
      )
      .to(
        `${imageSection} .work-details-year`,
        {
          onStart: removeOpacity,
          typewrite: {},
          duration: 1,
          ease: 'power4.out',
        },
        '<+20%',
      )
      .to(
        `${imageSection} .work-details-tech`,
        {
          onStart: removeOpacity,
          typewrite: {},
          duration: 1.5,
          ease: 'power4.out',
        },
        '<+20%',
      )
      .to('#open-proj-btn', { opacity: 1, duration: 0.5, ease: 'power4.in' }, '<')

    ///
    // MAIN TIMELINE
    //
    //
    BlogArticleRenderer.tl = gsap
      .timeline({})
      .to('#case-n', {
        typewrite: {
          speed: 0.2,
        },
        ease: 'power4.inOut',
        onStart: function () {
          window['case-n'].classList.remove('!opacity-0')
        },
      })
      .add(titleLettersTL, '<')
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
      .to(
        '#intro',
        {
          typewrite: {
            charClass: 'text-primary-lightest drop-shadow-glow',
          },
          duration: 3,
          ease: 'power4.inOut',
          onStart: function () {
            window['intro'].classList.remove('opacity-0')
          },
        },
        '<',
      )
      .to('#intro-details', { opacity: 0.5, ease: 'power4.in' }, '<')
      .add(imageTL, '<')

    this.contactsRenderer = new ContactsInternalRenderer(this.isDesktop, BlogArticleRenderer.tl)
    BlogArticleRenderer.contactsTl = this.contactsRenderer.onEnter()
  }

  onEnterCompleted() {
    // run after the transition.onEnter has fully completed
  }

  onLeave() {
    // run before the transition.onLeave method is called
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
    this.lenis.destroy()
  }

  ////////////////////////////////
  handleResize(firstRender?: boolean) {
    // shadow title is the original title to be resized
    const shadowTitle = $('#article-shadow-title')
    // titleEl is the overlapped one with the split characters
    const oldTitleEl = $('#article-title')
    if (firstRender) {
      const newFontSize = fitTextToContainerScr(shadowTitle, shadowTitle.parentElement)

      Array.from(oldTitleEl.childNodes).forEach((e: HTMLElement) => {
        e.style.lineHeight = '130%'
        e.style.fontSize = newFontSize + 'px'
      })
      return
    }
    // else it's in the resize evt
    const parent = oldTitleEl.parentNode
    const newTitleEl = oldTitleEl.cloneNode(true)
    oldTitleEl.remove()
    const newFontSize = fitTextToContainerScr(shadowTitle, shadowTitle.parentElement)

    Array.from(newTitleEl.childNodes).forEach((e: HTMLElement) => {
      e.style.opacity = '1'
      e.style.filter = ''
      e.style.lineHeight = '130%'
      e.style.fontSize = newFontSize + 'px'
    })
    // reinsert tmpEl in parent as a child
    parent.append(newTitleEl)
  }
}
