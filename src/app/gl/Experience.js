import gsap from 'gsap'
import * as THREE from 'three'

import Camera from './Camera'
import Renderer from './Renderer'
import World from './World'
import Debug from './utils/Debug'
import Resources from './utils/Resources'
import Sizes from './utils/Sizes'
import Time from './utils/Time'

import { BlendFunction } from 'postprocessing'
import { getZPosition, isMobile } from '../utils'
import sources from './sources'

let instance = null

export default class Experience {
  constructor(_canvas, cursor) {
    // Singleton
    if (instance) return instance
    instance = this
    this.cursor = cursor

    this.isShown = false

    // Global access
    window.experience = this

    this.canvas = _canvas
    this.appEl = document.getElementById('root')
    // get primary color from css global variables
    this.primaryColor = getComputedStyle(this.appEl).getPropertyValue('--primary')
    this.lorenzColor = getComputedStyle(this.appEl).getPropertyValue('--lorenz')
    this.bgColor = getComputedStyle(this.appEl).getPropertyValue('--bg-dark')
    this.isMobile = isMobile() && window.innerWidth <= 640

    this.params = {
      sigma: 10,
      rho: 28,
      beta: 8 / 3,
      speed: 5,
      dt: 0.01,
      rotationX: 0,
      rotationY: 0.0753,
      rotationZ: -Math.PI / 5,
      positionX: this.isMobile ? -2 : -1.6,
      positionY: this.isMobile ? 25 : 4.5,
      positionZ: getZPosition(),
      particlesBufWidth: this.isMobile ? 100 : 250,
      bgColor: this.bgColor,
      primaryColor: this.primaryColor,
      lorenzColor: this.lorenzColor,
      blending: THREE.AdditiveBlending,
      chromaticAberration: 0,
      bloomIntensity: 20,
      bloomLuminanceThreshold: 0,
      bloomLuminanceSmoothing: 0,
      bloomRadius: 0.64,
      bloomBlendFunction: BlendFunction.MULTIPLY,
    }

    // Setup
    this.debug = new Debug(this)
    this.sizes = new Sizes()
    this.time = new Time()
    this.clock = new THREE.Clock()
    this.resources = new Resources(sources)
    this.scene = new THREE.Scene()
    this.camera = new Camera(this)
    this.renderer = new Renderer(this)
    this.world = new World(this)

    this.camXto = gsap.quickTo(this.camera.instance.position, 'x', { duration: 2, ease: 'power3' })
    this.camYto = gsap.quickTo(this.camera.instance.position, 'y', { duration: 2, ease: 'power3' })

    this.sizes.on('resize', () => {
      this.resize()
    })

    this.time.on('tick', () => {
      this.update()
    })

    window.addEventListener('mousemove', this.onMouseMove.bind(this))
  }

  onMouseMove() {
    if (this.isMobile || !this.cursor || !window.app.preloaderFinished) return
    const { pos } = this.cursor

    this.camXto(-(pos.y - this.sizes.width / 2) / 30000)
    this.camYto(-(pos.x - this.sizes.width / 2) / 30000)
    this.camera.instance.updateProjectionMatrix()
  }

  resize() {
    this.camera.resize()
    this.world.resize()
    this.renderer.resize()
  }

  update() {
    const delta = this.clock.getDelta()
    const elapsed = this.clock.getElapsedTime()
    this.camera.update()
    if (this.world.isReady) {
      this.renderer.update(delta)
      this.world.update(this.renderer.instance, delta, elapsed)

      if (!this.isShown) {
        this.isShown = true
        gsap.fromTo(
          this.canvas,
          { opacity: 0 },
          {
            opacity: 1,
            repeat: 9,
            duration: 0.06,
          },
        )
      }
    }
  }

  destroy() {
    this.sizes.off('resize')
    this.time.off('tick')
    this.debug?.stop()
    this.renderer.instance.dispose()
  }
}
