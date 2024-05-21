import * as THREE from 'three'
import gsap from 'gsap'

import Debug from './utils/Debug'
import Sizes from './utils/Sizes'
import Resources from './utils/Resources'
import Time from './utils/Time'
import Camera from './Camera'
import Renderer from './Renderer'
import World from './World'

import { isMobile } from '../utils'
import sources from './sources'
import { BlendFunction } from 'postprocessing'
import { LORENZ_PRESETS } from '../constants'

let instance = null

/*@TODO:
 * add animations
 * add animations on page transition
 * figure out how to reset to initial positions after page transitions
 * add a reset lorenz button
 * differennt positions for each page
 * (maybe) add some interactions with mouse wheel?
 * (maybe move to ogl)
 */
export default class Experience {
  constructor(_canvas, cursor) {
    // Singleton
    if (instance) return instance
    instance = this
    this.cursor = cursor

    // Global access
    window.experience = this

    this.canvas = _canvas
    this.appEl = document.getElementById('root')
    // get primary color from css global variables
    this.primaryColor = getComputedStyle(this.appEl).getPropertyValue(
      '--primary',
    )
    this.lorenzColor = getComputedStyle(this.appEl).getPropertyValue(
      '--lorenz'
    )
    this.bgColor = getComputedStyle(this.appEl).getPropertyValue('--bg-dark')
    this.isMobile = isMobile()

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
      positionZ: this.isMobile ? -65 : -1.5,
      particlesBufWidth: this.isMobile ? 100 : 250,
      bgColor: this.bgColor,
      primaryColor: this.primaryColor,
      lorenzColor: this.lorenzColor,
      blending: THREE.AdditiveBlending,
      chromaticAberration: 0,
      bloomIntensity: 14,
      bloomLuminanceThreshold: 0,
      bloomLuminanceSmoothing: 0,
      bloomRadius: 0.64,
      bloomBlendFunction: BlendFunction.MULTIPLY
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

    this.camXto = gsap.quickTo(this.camera.instance.rotation, "x", { duration: 2, ease: "power3" })
    this.camYto = gsap.quickTo(this.camera.instance.rotation, "y", { duration: 2, ease: "power3" })

    this.sizes.on('resize', () => {
      this.resize()
    })

    this.time.on('tick', () => {
      this.update()
    })

    window.addEventListener('mousemove', this.onMouseMove.bind(this))
  }


  onMouseMove(){
    if(this.isMobile) return;
    const { pos } = window.app.cursor

    this.camXto(-( pos.y - this.sizes.width / 2 )/50000)
    this.camYto(-( pos.x - this.sizes.width / 2 )/50000)
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
    if(this.world.isReady){
      this.renderer.update(delta)
      this.world.update(this.renderer.instance, delta, elapsed)
      // @TODO: remove, use gsap
      this.canvas.style.opacity = 1
    }
  }

  destroy() {
    this.sizes.off('resize')
    this.time.off('tick')
    this.debug?.stop()
    this.renderer.instance.dispose()
  }
}
