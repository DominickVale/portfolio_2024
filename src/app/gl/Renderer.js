import * as THREE from 'three'
import Experience from './Experience.js'

export default class Renderer {
  constructor() {
    this.experience = new Experience()
    this.debug = this.experience.debug
    this.params = this.experience.params
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.camera = this.experience.camera

    this.setInstance()
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })
    this.instance.setClearColor(this.experience.bgColor)
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
    this.instance.outputEncoding = THREE.sRGBEncoding
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
  }

  update() {
    this.instance.render(this.scene, this.camera.instance)
      if (this.debug) {
      this.debug.update()
      if (this.debug.shouldSaveImage) {
        this.saveImage()
        this.debug.shouldSaveImage = false
      }
    }
  }

  saveImage() {
    const renderer = this.experience.renderer.instance
    const canvas = renderer.domElement
    const link = document.createElement('a')
    link.download = window.location.hostname + '_lorenz_attractor.jpeg'
    link.href = canvas.toDataURL('image/jpeg')
    link.click()
  }
}
