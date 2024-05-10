import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import * as THREE from 'three'
import { BlendFunction } from 'postprocessing'
import Experience from '../Experience'
import { LORENZ_PRESETS } from '../../constants'
import { TAU } from '../../utils'

const BLEND_TYPES = { Additive: THREE.AdditiveBlending, Normal: THREE.NormalBlending, Subtractive: THREE.SubtractiveBlending }
export default class Debug {
  constructor() {
    this.experience = new Experience()
    this.shouldSaveImage = false
    this.enabled = false
    this.showFBOTextures = false
    this.preset = LORENZ_PRESETS['default']
  }
  start() {
    this.enabled = true
    this.params = this.experience.params
    this.stats = new Stats()
    this.experience.appEl.appendChild(this.stats.dom)

    this.gui = new GUI()
    const lorenzParams = this.gui.addFolder('Lorenz parameters')
    lorenzParams.add(this.params, 'sigma', -8, 100).onChange(this.updateLorenzParams.bind(this))
    lorenzParams.add(this.params, 'rho', -100, 100).onChange(this.updateLorenzParams.bind(this))
    lorenzParams.add(this.params, 'beta', -6, 6).onChange(this.updateLorenzParams.bind(this))
    lorenzParams.add(this.params, 'speed', 1, 100)
    const colors = this.gui.addFolder('Colors')
    colors.addColor(this.params, 'lorenzColor').onChange(this.updateLorenzColor.bind(this))
    colors.addColor(this.params, 'primaryColor').onChange(this.updateCssVariables.bind(this))
    colors.addColor(this.params, 'bgColor').onChange ( this.updateBgColor.bind(this) )
    colors.add( this.params, 'blending', BLEND_TYPES ).onChange( this.updateBlending.bind(this) )
    const postfx = this.gui.addFolder('Post-processing')
    postfx.add(this.params, 'bloomIntensity', 0, 100, 0.1).onChange(this.updateBloom.bind(this))
    postfx.add(this.params, 'bloomLuminanceThreshold', 0.0, 1.0, 0.001).onChange(this.updateBloom.bind(this))
    postfx.add(this.params, 'bloomLuminanceSmoothing', 0.0, 1.0, 0.001).onChange(this.updateBloom.bind(this))
    postfx.add(this.params, 'bloomRadius', 0.0, 1.0, 0.001).onChange(this.updateBloom.bind(this))
    postfx.add(this.params, 'bloomBlendFunction', BlendFunction).onChange(this.updateBloom.bind(this))

    postfx.add(this.params, 'chromaticAberration', -0.01, 0.01, 0.0001).onChange(this.updateChromaticAberration.bind(this))
    const positioning = this.gui.addFolder('Positioning')
    positioning.add(this.params, 'rotationX', -TAU, TAU).onChange(this.updateRotation.bind(this))
    positioning.add(this.params, 'rotationY', -TAU, TAU).onChange(this.updateRotation.bind(this))
    positioning.add(this.params, 'rotationZ', -TAU, TAU).onChange(this.updateRotation.bind(this))
    positioning.add(this.params, 'positionX', -50, 50).onChange(this.updatePosition.bind(this))
    positioning.add(this.params, 'positionY', -50, 50).onChange(this.updatePosition.bind(this))
    positioning.add(this.params, 'positionZ', -50, 50).onChange(this.updatePosition.bind(this))
    const misc = this.gui.addFolder('Misc')
    misc.add({ saveImage: () => this.shouldSaveImage = true }, 'saveImage').name('Save as Image')
    misc.add(this, 'showFBOTextures', false).name('Show FBO Textures')
    misc.add(this, 'preset', LORENZ_PRESETS).onChange(this.setPreset.bind(this)).name('Preset')

    this.controls = new OrbitControls(
      this.experience.camera.instance,
      this.experience.appEl,
    )
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.enabled = false

    misc.add(this.controls, 'enabled').name('Orbit controls')
  }

  stop() {
    this.enabled = false
    if (this.stats) {
      this.stats.dom.remove()
    }
    if (this.gui) {
      this.gui.destroy()
    }
    if (this.controls) {
      this.controls.dispose()
    }
  }

  update() {
    if(this.stats){
      this.stats.update()
    }
  }

  setPreset(value){
    this.params = {...this.params, ...value}
    this.gui.controllersRecursive().forEach(c => {
      if(c.parent._title === "Misc") return
      const newValue = this.params[c.property]
      c.setValue(newValue)
    })
  }

  updateCssVariables(){
    document.documentElement.style.setProperty('--primary', this.params.primaryColor)
    document.documentElement.style.setProperty('--lorenz', this.params.lorenzColor)
    document.documentElement.style.setProperty('--bg-dark', this.params.bgColor)

    this.experience.renderer.fullScreenBg.material.uniforms.uColor.value = new THREE.Color(this.params.bgColor)
  }

  updateBloom(){
    const bloom = this.experience.renderer.bloomEffect
    bloom.intensity = this.params.bloomIntensity
    bloom.luminanceMaterial.threshold = this.params.bloomLuminanceThreshold
    bloom.luminanceMaterial.smoothing = this.params.bloomLuminanceSmoothing
    bloom.mipmapBlurPass.radius = this.params.bloomRadius
    bloom.blendMode.setBlendFunction(Number(this.params.bloomBlendFunction))
  }

  updateRotation() {
    const points = this.experience.world.attractor.points
    points.rotation.x = this.params.rotationX
    points.rotation.y = this.params.rotationY
    points.rotation.z = this.params.rotationZ
  }

  updatePosition() {
    const points = this.experience.world.attractor.points
    points.position.x = this.params.positionX
    points.position.y = this.params.positionY
    points.position.z = this.params.positionZ
  }

  updateLorenzParams() {
    const bufferMaterial = this.experience.world.attractor.bufferMaterial
    bufferMaterial.uniforms.uSigma.value = this.params.sigma
    bufferMaterial.uniforms.uRho.value = this.params.rho
    bufferMaterial.uniforms.uBeta.value = this.params.beta
  }

  updateChromaticAberration(value){
    this.experience.renderer.chromaticAberrationEffect.offset.set(value, value)
  }
  updateBgColor(value){
    this.experience.renderer.fullScreenBg.material.uniforms.uColor.value = new THREE.Color(value)
  }
  updateLorenzColor(value){
    this.experience.world.attractor.renderMaterial.uniforms.uColor.value = new THREE.Color(value)
  }

  updateBlending(value){
    this.experience.world.attractor.renderMaterial.blending = value
  }
}
