import * as THREE from 'three'
import Experience from './Experience'

export default class Camera {
  constructor() {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas

    this.setInstance()
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(60, this.sizes.width / this.sizes.height, 0.001, 1000)
    this.instance.position.set(0, 0, 74)
    this.scene.add(this.instance)

    const listener = new THREE.AudioListener();
    this.audioListener = listener
    this.instance.add(listener)
  }

  resize() {
    this.instance.aspect = this.sizes.aspectRatio
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.instance.lookAt(this.experience.world.attractor.boxCenter)
  }
}
