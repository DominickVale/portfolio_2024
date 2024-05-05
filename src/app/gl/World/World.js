import Experience from '../Experience.js'
import LorenzAttractor from './LorenzAttractor.js'
import * as THREE from 'three'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.isReady = false
    this.attractor = new LorenzAttractor()
    this.scene.add(this.attractor.points)

    this.resources.on('ready', () => {
      // this.attractor.setTexture(this.resources.items.star)
      this.isReady = true
    })
  }

  update(renderer, delta) {
    this.attractor.update(renderer, delta)
  }
}
