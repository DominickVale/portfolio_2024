import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import * as THREE from 'three'

const BLEND_TYPES = { Additive: THREE.AdditiveBlending, Normal: THREE.NormalBlending, Subtractive: THREE.SubtractiveBlending };
export default class Debug {
  constructor(experience) {
    this.experience = experience
    this.shouldSaveImage = false
    this.enabled = false
    this.showFBOTextures = false
  }
  start() {
    this.enabled = true
    this.params = this.experience.params
    this.stats = new Stats()
    this.experience.appEl.appendChild(this.stats.dom)

    this.gui = new GUI()
    const lorenzParams = this.gui.addFolder('Lorenz parameters')
    lorenzParams.add(this.params, 'sigma', -8, 100)
    lorenzParams.add(this.params, 'rho', -100, 100)
    lorenzParams.add(this.params, 'beta', -6, 6)
    lorenzParams.add(this.params, 'speed', 1, 100)
    lorenzParams.add(this.params, 'dt', 0.0001, 0.1, 0.00001)
    const colors = this.gui.addFolder('Colors')
    colors.addColor(this.params, 'lorenzColor').onChange(this.updateLorenzColor.bind(this));
    colors.addColor(this.params, 'primaryColor')
    colors.addColor(this.params, 'bgColor').onChange ( this.updateBgColor.bind(this) )
    colors.add( this.params, 'blending', BLEND_TYPES ).onChange( this.updateBlending.bind(this) );
    const postfx = this.gui.addFolder('Post-processing')
    // postfx.add(this.params, 'bloom', 0, 1, 0.001)
    // postfx.add(this.params, 'bloomThreshold', 0, 1, 0.001)
    // postfx.add(this.params, 'bloomStrength', 0, 10, 0.001)
    // postfx.add(this.params, 'bloomRadius', 0, 1, 0.001)
    postfx.add(this.params, 'chromaticAberration', -0.01, 0.01, 0.0001).onChange(this.updateChromaticAberration.bind(this))
    const positioning = this.gui.addFolder('Positioning')
    positioning.add(this.params, 'rotationX', -Math.PI, Math.PI)
    positioning.add(this.params, 'rotationY', -Math.PI, Math.PI)
    positioning.add(this.params, 'rotationZ', -Math.PI, Math.PI)
    positioning.add(this.params, 'positionX', -50, 50)
    positioning.add(this.params, 'positionY', -50, 50)
    positioning.add(this.params, 'positionZ', -50, 50)
    const misc = this.gui.addFolder('Misc')
    misc.add({ saveImage: () => this.shouldSaveImage = true }, 'saveImage').name('Save as Image');
    misc.add(this, 'showFBOTextures', false).name('Show FBO Textures');

    this.controls = new OrbitControls(
      this.experience.camera.instance,
      this.experience.appEl,
    )
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.enabled = false

    this.gui.add(this.controls, 'enabled').name('Orbit controls')
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

  updateChromaticAberration(value){
    // this.experience.renderer.chromaticAberrationPass.uniforms.amount.value = value
    this.experience.renderer.chromaticAberrationEffect.offset = new THREE.Vector2(value, value)
  }
  updateBgColor(value){
    this.experience.renderer.fullScreenBg.material.uniforms.uColor.value = new THREE.Color(value);
  }
  updateLorenzColor(value){
    console.log(this.experience.world)
    this.experience.world.attractor.renderMaterial.uniforms.uColor.value = new THREE.Color(value)
  }

  updateBlending(value){
    this.experience.world.attractor.renderMaterial.blending = value
  }
}
