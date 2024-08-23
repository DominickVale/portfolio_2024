import { $, $all, getPageName, getZPosition, isMobile } from '../utils'
import gsap from 'gsap'
import BaseRenderer from './renderers/base'
import Experience from '../gl/Experience'
import { LORENZ_PRESETS } from '../constants'
import { BlendFunction } from 'postprocessing'
import { CustomEase } from 'gsap/all'
import { getAttractorByPage } from './animations/attractor'

gsap.registerPlugin(CustomEase)

//@TODO: !IMPORTANT: split loading bar into own chunk and use an svg for the star, otherwise it's useless
// add prefers-reduced-motion stuff
export default class Preloader {
  description: HTMLElement
  progress: number
  bar: HTMLElement
  title: HTMLElement
  buttons: NodeListOf<HTMLElement>
  buttonsContainer: HTMLElement
  container: HTMLElement
  experience: Experience
  isMobile: boolean
  loadingTL: gsap.core.Timeline
  enterTL: gsap.core.Timeline
  loaderInterval: Timer

  constructor() {
    this.container = $('#preloader')
    this.description = $('p.description', this.container)
    this.title = $('h1', this.container)
    this.bar = $('#progress-bar div')
    this.buttonsContainer = $('#preloader-buttons')
    this.buttons = $all('#preloader-buttons > *')
    this.progress = 10

    this.isMobile = isMobile()

    this.experience = new Experience()
    this.experience.params.speed = 0.001
    this.createLoadingBarTL()
    if (!window.app.overridePreloader) {
      this.experience.resources.on('ready', () => {
        this.progress += 50
        this.onProgress()
      })
    }
  }

  playBasePageAnimations() {
    const page = getPageName(window.location.pathname)
    const attractorTL = getAttractorByPage(page)

    const tl = gsap.timeline({})

    tl.add(attractorTL).play(0)
    BaseRenderer.enterTL.play()
  }

  init() {
    if (window.app.overridePreloader || window.app.reducedMotion) {
      window.app.preloaderFinished = true
      const dpreset = LORENZ_PRESETS['default']
      this.experience.world.attractor.points.position.z = getZPosition()
      this.experience.renderer.bloomEffect.blendMode.setBlendFunction(dpreset.bloomBlendFunction)
      this.experience.params.speed = dpreset.speed
      this.experience.world.attractor.reset()
      this.playBasePageAnimations()
      window.dispatchEvent(new CustomEvent('preload-end'))
      return
    }
    this.container.classList.remove('hidden')
    this.loaderInterval = setInterval(() => {
      const isReady = this.experience.resources.isReady

      if (this.progress >= 100 && isReady) {
        clearInterval(this.loaderInterval)
      }

      this.onProgress()

      const random = Math.random()
      let probability = 0

      if (!isReady) {
        probability = Math.max(0.01, 1 - (this.progress / 100) ** 2)
      } else {
        probability = 0.1
      }

      if (random < probability) {
        if (!isReady && this.progress >= 99) {
          this.progress = 99
        } else if (this.progress < 100) {
          this.progress++
        }
      }
    }, 50)

    if (this.isMobile) {
      this.buttons[0].addEventListener('touchstart', () => {
        // enable sound engine, play sounds
        this.onEnter(true)
      })
      this.buttons[1].addEventListener('touchstart', () => {
        this.onEnter()
      })
    } else {
      this.buttons[0].addEventListener('mousedown', () => {
        // enable sound engine, play sounds
        this.onEnter(true)
      })
      this.buttons[1].addEventListener('mousedown', () => {
        this.onEnter()
      })
    }
  }

  onEnter(withSound?: boolean) {
    if (window.app.overridePreloader) return
    if (withSound) window.app.audio.enable()
    else window.app.audio.disable()

    window.app.audio.play(null, 'g', {
      volume: 0.5,
    })

    const preset = LORENZ_PRESETS['collapsedAfter']
    const attractor = this.experience.world.attractor
    const attractorUniforms = attractor.bufferMaterial.uniforms

    const bloom = this.experience.renderer.bloomEffect

    attractorUniforms.uSigma.value = preset.sigma
    attractorUniforms.uRho.value = preset.rho
    attractorUniforms.uBeta.value = preset.beta
    attractor.points.rotation.x = preset.rotationX
    attractor.points.rotation.y = preset.rotationY
    attractor.points.rotation.z = preset.rotationZ
    // attractor.points.position.x = preset.positionX
    // attractor.points.position.y = preset.positionY
    attractor.points.position.z = preset.positionZ

    // bloom.blendMode.setBlendFunction(BlendFunction.ADD)

    gsap
      .timeline()
      .to(this.experience.renderer.chromaticAberrationEffect.offset, {
        x: '-0.0036',
        y: '-0.0036',
        duration: 0.2,
      })
      .to(this.experience.renderer.chromaticAberrationEffect.offset, {
        x: 'random(-0.0025, 0.0025)',
        y: 'random(-0.0025, 0.0025)',
        duration: 2,
      })

    this.enterTL = gsap
      .timeline({})
      .to(this.container, {
        autoAlpha: 0,
        duration: window.app.isFirstTime ? 0.85 : 0.5,
        ease: 'power4.out',
      })
      .to(
        bloom,
        {
          intensity: 200,
          duration: 0.25,
          ease: 'power4.inOut',
        },
        '<',
      )
      .add(() => {
        this.experience.params.speed = this.isMobile ? 80 : 90
      }, '<')
      .to(
        this.experience.params,
        {
          speed: 3,
          duration: 0.2,
          ease: 'circ.in',
        },
        '<',
      )
      .add(
        () => {
          bloom.blendMode.setBlendFunction(BlendFunction.ADD)
          this.experience.renderer.shockWaveEffect.explode()
          window.app.audio.play(null, 'boom', {
            volume: 0.75,
          })
          window.app.audio.playBgMusic()
          setTimeout(() => {
            window.app.audio.play(null, 'woosh', {
              volume: 0.5,
            })
          }, 2000)
        },
        window.app.isFirstTime ? '+=1.5' : '+=0.8',
      )
      .to(
        bloom,
        {
          intensity: preset.bloomIntensity,
          // repeat: 6,
          // duration: 0.08,
          duration: 0.35,
          ease: 'power4.inOut',
        },
        '<',
      )
      .to(attractor.points.position, {
        z: 70,
        y: 0,
        duration: window.app.isFirstTime ? 3 : 1.5,
        ease: 'power4.in',
      })
      .to(
        '#flash-screen',
        {
          opacity: 1,
          duration: 1,
          ease: 'power4.in',
        },
        '<+80%',
      )

      .to('#flash-screen', {
        autoAlpha: 0,
        duration: 3,
        ease: 'power4.in',
        delay: 1,
        onStart: () => {
          $('#flash-screen').classList.remove('mix-blend-lighten')

          const dpreset = LORENZ_PRESETS['default']
          attractor.points.position.z = getZPosition()
          bloom.blendMode.setBlendFunction(dpreset.bloomBlendFunction)
          this.experience.params.speed = dpreset.speed
          this.experience.world.attractor.reset()
        },
      })
      .to(
        this.experience.renderer.chromaticAberrationEffect.offset,
        {
          x: '0',
          y: '0',
          duration: 0,
        },
        '<',
      )
      .to(
        bloom,
        {
          intensity: LORENZ_PRESETS['default'].bloomIntensity,
          duration: 3,
          ease: 'linear',
        },
        '<+40%',
      )
      .add(() => {
        window.app.preloaderFinished = true
        this.playBasePageAnimations()
        console.log('Preloader finished', window.app.preloaderFinished)

        localStorage.setItem('visited', 'true')
        window.app.isFirstTime = false
        window.dispatchEvent(new CustomEvent('preload-end'))
      })
  }

  onProgress() {
    this.description.innerText = Math.min(100, this.progress) + '%'
    this.bar.style.setProperty('--progress', this.progress + '%')
    this.bar.setAttribute('aria-valuenow', String(this.progress))
    if (this.progress >= 100) {
      this.loadingTL.play()
      clearInterval(this.loaderInterval)
    }
  }

  createLoadingBarTL() {
    this.loadingTL = gsap
      .timeline({ paused: true })
      .to(this.title, {
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
      })
      .to(this.bar.parentElement, { opacity: 0, duration: 0.6, ease: 'power4.in' }, '<')
      .to(this.description, { opacity: 0, duration: 0.5, ease: 'power4.in' }, '<+20%')
      .set(this.buttons, { opacity: 0 })
      .addLabel('welcome')
      .add(() => {
        this.bar.classList.add('hidden')
        this.buttonsContainer.classList.remove('hidden')
        this.buttonsContainer.classList.add('flex')
        this.description.innerText = 'This website uses audio to enhance the overall experience. Headphones recommended.'
      }, 'welcome')
      .to(
        this.title,
        {
          opacity: 1,
          duration: 0.85,
          ease: 'power4.out',
        },
        '<',
      )
      .to(
        this.title,
        {
          typewrite: {
            value: window.app.isFirstTime ? 'WELCOME' : 'WELCOME BACK ',
            charClass: 'text-primary-lightest drop-shadow-glow',
            maxScrambleChars: 1,
          },
          duration: 2,
          ease: 'power4.inOut',
        },
        '<',
      )
      .to(this.description, {
        opacity: 1,
        duration: 2.2,
        ease: 'power4.inOut',
      })
      .to(
        this.buttons[0],
        {
          opacity: 1,
          repeat: 9,
          duration: 0.06,
        },
        '<+50%',
      )
      .to(
        this.buttons[1],
        {
          opacity: 1,
          repeat: 9,
          duration: 0.06,
          ease: 'power4.inOut',
        },
        '<+30%',
      )
    if (!window.app.isFirstTime) {
      this.loadingTL.duration(3.5)
    }
  }
}
