import * as THREE from 'three'
import Experience from './Experience.js'

export default class Renderer {
  constructor() {
    this.experience = new Experience()
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
    // this.instance.toneMapping = THREE.CineonToneMapping
    // this.instance.toneMappingExposure = 1.75
    // this.instance.shadowMap.enabled = true
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
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
    if(this.debug){
      this.debug.update()
    }
    this.instance.render(this.scene, this.camera.instance)
  }
}