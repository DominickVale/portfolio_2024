import { $, $all, getZPosition, isMobile } from '../utils'
import gsap from 'gsap'
import BaseRenderer from './renderers/base'
import Experience from '../gl/Experience'
import { LORENZ_PRESETS } from '../constants'
import { BlendFunction } from 'postprocessing'
import { CustomEase } from 'gsap/all'

gsap.registerPlugin(CustomEase)

//@TODO: !IMPORTANT: split loading bar into own chunk and use an svg for the star, otherwise it's useless
export default class Preloader {
  p: HTMLElement
  progress: number
  bar: HTMLElement
  title: HTMLElement
  buttons: NodeListOf<HTMLElement>
  buttonsContainer: HTMLElement
  container: HTMLElement
  experience: any
  isMobile: boolean

  constructor(public onEnterCb: (withSound: boolean) => void) {
    this.container = $('#preloader')
    this.p = $('p', this.container)
    this.title = $('h1', this.container)
    this.bar = $('#progress-bar div')
    this.buttonsContainer = $('#preloader-buttons')
    this.buttons = $all('#preloader-buttons > *')
    this.progress = 0

    this.isMobile = isMobile()

    this.experience = new Experience()
    this.experience.params.speed = 0.001
    this.experience.resources.on('ready', () => {
      this.progress += 50
      this.onProgress()
    })
  }

  init() {
    this.container.classList.remove('hidden')
    const iid = setInterval(() => {
      const random = Math.random()
      if (random < this.progress / 100) return
      if (this.progress >= 100) {
        clearInterval(iid)
        return
      }
      this.progress++
      this.onProgress()
    }, 10)

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
      .timeline({
        onComplete: () => {
          // this.container.style.display = 'none'
          this.onEnterCb(withSound)
          window.app.isFirstTime = false
        },
      })
      .to(this.container, {
        autoAlpha: 0,
        duration: 0.85,
        ease: 'power4.out',
      })
      .to(
        attractor.points.position,
        {
          z: -60,
          duration: 0.35,
          ease: 'power4.out',
        },
        '<',
      )
      .to(
        bloom,
        {
          intensity: 8,
          repeat: 6,
          duration: 0.08,
        },
        '<',
      )
      .to(bloom, {
        intensity: 200,
        // repeat: 6,
        // duration: 0.08,
        duration: 0.25,
        ease: 'power4.inOut',
      })
      .to(
        attractor.points.position,
        {
          y: 3,
          z: 0,
          duration: 0.25,
          ease: 'power4.out',
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
      .add(() => {
        bloom.blendMode.setBlendFunction(BlendFunction.ADD)
        this.experience.renderer.shockWaveEffect.explode()
      }, '+=1.5')
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
        duration: 3,
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
        duration: 4,
        delay: 1,
        onStart: () => {
          $('#flash-screen').classList.remove('mix-blend-lighten')

          attractor.points.position.z = getZPosition()
          bloom.blendMode.setBlendFunction(LORENZ_PRESETS['default'].bloomBlendFunction)
          this.experience.world.attractor.reset()
        },
      })
      .to(
        bloom,
        {
          intensity: LORENZ_PRESETS['default'].bloomIntensity,
          duration: 3,
          ease: 'linear',
        },
        '<+60%',
      )
      .add(() => BaseRenderer.enterTL.play(), '<+30%')
      .add(() => {
        window.dispatchEvent(new CustomEvent('preload-end'))
      }, "<")
  }

  onProgress() {
    this.p.innerText = Math.min(100, this.progress) + '%'
    // update --progress variable
    this.bar.style.setProperty('--progress', this.progress + '%')
    if (this.progress >= 100) {
      gsap
        .timeline()
        .to(this.title, {
          opacity: 0,
          duration: 1.5,
          ease: 'power4.out',
        })
        .to(this.bar.parentElement, { opacity: 0, duration: 0.6, ease: 'power4.in' }, '<')
        .to(this.p, { opacity: 0, duration: 0.5, ease: 'power4.in' }, '<+20%')
        .set(this.buttons, { opacity: 0 })
        .add(() => {
          this.bar.classList.add('hidden')
          this.buttonsContainer.classList.remove('hidden')
          this.buttonsContainer.classList.add('flex')
          this.p.innerText = 'This website uses audio to enhance the overall experience. Headphones recommended.'
        })
        .to(this.title, {
          opacity: 1,
          duration: 1,
          ease: 'power4.out',
        }, "<")
        .to(
          this.title,
          {
            typewrite: {
              value: 'WELCOME',
              charClass: 'text-primary-lightest drop-shadow-glow',
              maxScrambleChars: 1,
            },
            duration: 2,
            ease: 'power4.inOut',
          },
          '<',
        )
        .to(this.p, {
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
    }
  }
}
