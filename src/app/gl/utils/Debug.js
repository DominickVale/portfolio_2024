import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import Experience from '../Experience'

export default class Debug {
  constructor() {
    this.shouldSaveImage = false
  }
  start() {
    this.experience = new Experience()
    this.params = this.experience.params
    this.stats = new Stats()
    this.experience.appEl.appendChild(this.stats.dom)

    this.gui = new GUI()
    this.gui.add(this.params, 'sigma', -8, 100)
    this.gui.add(this.params, 'rho', -100, 100)
    this.gui.add(this.params, 'beta', -6, 6)
    this.gui.add(this.params, 'speed', 1, 100)
    this.gui.addColor(this.experience.params, 'color')
    this.gui.add(this.params, 'rotationX', -Math.PI, Math.PI)
    this.gui.add(this.params, 'rotationY', -Math.PI, Math.PI)
    this.gui.add(this.params, 'rotationZ', -Math.PI, Math.PI)
    this.gui.add(this.params, 'positionX', -50, 50)
    this.gui.add(this.params, 'positionY', -50, 50)
    this.gui.add(this.params, 'positionZ', -50, 50)
    this.gui.add({ saveImage: () => this.shouldSaveImage = true }, 'saveImage').name('Save as Image');

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
}
