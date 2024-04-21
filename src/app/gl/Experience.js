import * as THREE from 'three'

import Debug from './utils/Debug.js'
import Sizes from './utils/Sizes.js'
import Resources from './utils/Resources.js'
import Time from './utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Cursor from '../Cursor'

import { isMobile } from '../utils'
import sources from './sources.js'

let instance = null

/*@TODO:
 * add animations, let users export their lorenz attractor via some button
 * (maybe add entire custom section to settings?)
 * add animations on page transition
 * figure out how to reset to initial positions after page transitions
 * add a reset lorenz button
 * differennt positions for each page
 * (maybe) add some interactions with mouse wheel?
 * (maybe move to ogl)
 */
export default class Experience {
  constructor(_canvas, debugEnabled) {
    // Singleton
    if (instance) return instance
    instance = this

    // Global access
    window.experience = this

    this.canvas = _canvas
    this.appEl = document.getElementById('app')
    // get primary color from css global variables
    this.primaryColor = getComputedStyle(this.appEl).getPropertyValue(
      '--primary',
    )
    this.bgColor = getComputedStyle(this.appEl).getPropertyValue('--bg-dark')
    this.isMobile = isMobile()
    this.oldColor = this.primaryColor
    this.params = {
      sigma: 10,
      rho: 28,
      beta: 8 / 3,
      speed: 5,
      color: this.primaryColor,
      rotationX: 0,
      rotationY: 0.0753,
      rotationZ: -Math.PI / 5,
      positionX: this.isMobile ? -2 : -1.6,
      positionY: this.isMobile ? 25 : 4.5,
      positionZ: this.isMobile ? -65 : 0,
      particlesBufWidth: this.isMobile ? 100 : 250,
    }

    // Setup
    this.debug = new Debug()
    this.cursor = new Cursor()
    this.sizes = new Sizes()
    this.time = new Time()
    this.clock = new THREE.Clock()
    this.resources = new Resources(sources)
    this.scene = new THREE.Scene()
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.world = new World()

    if (debugEnabled) {
      this.debug.start()
    }

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
    const { pos } = this.cursor

    //@TODO: use gsap for this
    this.camera.instance.rotation.x = -( pos.y - this.sizes.width / 2 )/50000
    this.camera.instance.rotation.y = -( pos.x - this.sizes.width / 2 )/50000
    this.camera.instance.rotation.z = ( pos.y - this.sizes.width / 2 )/50000
    this.camera.instance.updateProjectionMatrix()
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    this.camera.update()
    this.world.update()
    this.renderer.update()
  }

  destroy() {
    this.sizes.off('resize')
    this.time.off('tick')
    this.debug?.stop()
    this.renderer.instance.dispose()
  }
}
