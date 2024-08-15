import { $, $all, debounce, fitTextToContainerScr, showCursorMessage } from '../../utils'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { TypewriterPlugin } from '../animations/TypeWriterPlugin'
import { blurStagger, workDetailsTL } from '../animations/gsap'
import Lenis from 'lenis'
import { ContactsInternalRenderer } from './ContactsRenderer'
gsap.registerPlugin(TypewriterPlugin)

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
  els: any

  initialLoad() {
    super.initialLoad()
  }

  onEnter() {
    super.onEnter()

    this.isFirstRender = true
    this.isDesktop = window.innerWidth > 1024

    document.body.dataset.page = 'blogArticle'
    this.experience = new Experience()

    this.prepareAnimations()

    const debouncedHandleResizeFn = debounce(this.handleResize.bind(this), 100)
    BaseRenderer.resizeHandlers.push(debouncedHandleResizeFn)

    this.lenis = new Lenis({ duration: 2, smoothWheel: true })

    this.lenis.on('scroll', ScrollTrigger.update)
    this.lenis.on('scroll', ({ velocity }) => {
      this.experience.params.speed = Math.max(5, 1.5 * Math.abs(velocity))
    })
    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)
    this.lenis.scrollTo('top', { immediate: true })

    this.createBlogParagraphsAnims()
    this.createEnterAnim()

    this.handleResize(true)

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
      const newFontSize = fitTextToContainerScr(shadowTitle, shadowTitle.parentElement, 5)

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
    const newFontSize = fitTextToContainerScr(shadowTitle, shadowTitle.parentElement, 5)

    Array.from(newTitleEl.childNodes).forEach((e: HTMLElement) => {
      e.style.opacity = '1'
      e.style.filter = ''
      e.style.lineHeight = '130%'
      e.style.fontSize = newFontSize + 'px'
    })
    // reinsert tmpEl in parent as a child
    parent.append(newTitleEl)
    gsap.timeline().add(this.createBlogDetailsTL())
  }

  ////////   ANIMS   ////////

  prepareAnimations() {
    const imageSectionQuery = this.isDesktop ? '#image-section' : '#image-section-mobile'
    const mainImageContainerQuery = this.isDesktop ? '#main-image-container' : '#main-image-container-mobile'

    this.els = {
      ...this.els,
      marquee: $('.marquee-container'),
      imageSmall1: $(`${mainImageContainerQuery} .small-1`),
      imageSmall2: $(`${mainImageContainerQuery} .small-2`),
      imageSectionCable: $(`${imageSectionQuery} .cable`),
    }

    gsap.set(this.els.marquee, { opacity: 0 })
    gsap.set(this.els.imageSmall1, { opacity: 0 })
    gsap.set(this.els.imageSmall2, { opacity: 0 })
    gsap.set('#intro-details', { opacity: 0 })
    gsap.set(this.els.imageSectionCable, { opacity: 0 })
    gsap.set('#open-proj-btn', {
      opacity: 0,
    })
    gsap.set('#bg-blur', { opacity: 1 })

    setTimeout(() => {
      //contacts bg blur on scroll
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

      const attractor = this.experience.world.attractor

      const that = this
      const attractorScrollTL = gsap
        .timeline({
          scrollTrigger: {
            trigger: '#body-wrapper',
            start: 'top top',
            end: 'bottom center',
            scrub: true,
          },
        })
        .to(
          attractor.bufferMaterial.uniforms.uSigma,
          {
            value: -20,
          },
          '<',
        )
        .to(
          attractor.bufferMaterial.uniforms.uRho,
          {
            value: 60,
          },
          '<',
        )
        .to(
          attractor.bufferMaterial.uniforms.uBeta,
          {
            value: 2,
          },
          '<',
        )
      .to(
        attractor.points.position,
        {
          x: -15,
          y: 16,
          z: -45,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          x: 1.67132729170977,
          y: 1.13097335529233,
          z: 0.131946891450771,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )
    }, 500)
  }

  createBlogParagraphsAnims() {
    $all('.blog-section').forEach((b) => {
      const img = $('.blog-image', b)
      const smallAlt = $('small:not(.shadow)', img)
      smallAlt.innerText = smallAlt.innerText.replace('3', String((Math.random() * 10).toFixed(0)))
      const content = $all('.blog-section-content > *:not(h2)', b)
      const title = $('h2', b)
      const stripes = $('.bg-striped', b)

      gsap.set(content, { opacity: 0 })
      gsap.set(title, { opacity: 0 })
      gsap.set($('.alt', img), { opacity: 0 })
      gsap.set(smallAlt, { opacity: 0 })
      //TODO: use stroke or some path to animate stripes
      const imgtl = gsap
        .timeline({})
        .fromTo(
          stripes,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.1,
            repeat: 10,
          },
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
              repeat: window.app.reducedMotion ? 1 : 10,
              each: 0.1,
            },
          },
          '<',
        )
        .from(
          $all('.img-small-left .bg-lines', img),
          {
            opacity: 0,
            duration: 0.075,
            stagger: {
              repeat: window.app.reducedMotion ? 1 : 10,
              each: 0.1,
            },
          },
          '<+20%',
        )
        .from(
          $('img', img),
          {
            scaleY: window.app.reducedMotion ? 1 : 0,
            opacity: window.app.reducedMotion ? 0 : 1,
            duration: window.app.reducedMotion ? 1.5 : 0.5,
            ease: 'expo.in',
          },
          '<',
        )
        .set($('.alt', img), { autoAlpha: 1 })
        .to($('.alt', img), {
          typewrite: {},
          duration: 1,
        })
        .set(smallAlt, { autoAlpha: 0.25 }, '<')
        .to(
          smallAlt,
          {
            typewrite: {},
            duration: 1.5,
            ease: 'circ.inOut',
          },
          '<',
        )

      const blogSectionImageTl = gsap
        .timeline({
          scrollTrigger: {
            trigger: img,
            start: 'top center+=80vh',
            end: 'bottom center',
          },
        })
        .add(imgtl)
        .to(
          title,
          {
            typewrite: {},
            duration: 2,
            ease: 'circ.inOut',
            onStart: removeSetOpacity,
          },
          '<',
        )
        .to(
          content,
          {
            opacity: 1,
            duration: 2,
            stagger: 0.5,
            ease: 'circ.inOut',
          },
          '<',
        )
    })
  }

  createBlogDetailsTL(){
    const imageSectionQuery = this.isDesktop ? '#image-section' : '#image-section-mobile'
    return workDetailsTL(imageSectionQuery)
  }

  createEnterAnim() {
    window.app.audio.muffleMusic(true)
    const mainImageQuery = this.isDesktop ? '#main-image' : '#main-image-mobile'
    const imageSectionQuery = this.isDesktop ? '#image-section' : '#image-section-mobile'
    const mainImageContainerQuery = this.isDesktop ? '#main-image-container' : '#main-image-container-mobile'

    const marquee = $('.marquee-container')

    const titleLettersTL = blurStagger($('#article-title'), 0.01, 0.5)

    const { imageSectionCable, imageSmall1, imageSmall2 } = this.els

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
          $all(`${mainImageContainerQuery} small`).forEach((e) => gsap.set(e, { autoAlpha: 0 }))
        },
      })
      .from(`${mainImageContainerQuery} .new-fui-corners`, {
        scale: 0,
        duration: 0.35,
        ease: 'circ.in',
      })
      .fromTo(
        `${mainImageContainerQuery} .new-fui-corners`,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.09,
          stagger: {
            repeat: window.app.reducedMotion ? 2 : 20,
            each: 0.1,
          },
        },
        '<+50%',
      )
      .fromTo(
        mainImageQuery,
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
            repeat: window.app.reducedMotion ? 1 : 10,
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
            repeat: window.app.reducedMotion ? 1 : 10,
            each: 0.1,
          },
        },
        '<',
      )
      .fromTo(
        `${imageSectionQuery} .fui-corners-dot`,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.09,
          stagger: {
            repeat: window.app.reducedMotion ? 1 : 20,
            each: 0.1,
          },
        },
        '<+10%',
      )
      .from(
        `${imageSectionQuery} .fui-corners-dot`,
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
      .add(this.createBlogDetailsTL(), '<')
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
  }
}
