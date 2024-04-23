import Experience from '../Experience.js'
import LorenzAttractor from './LorenzAttractor.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    // Wait for resources
    this.resources.on('ready', () => {
      this.attractor = new LorenzAttractor(this.resources.items.star)
      this.scene.add(this.attractor.points)
      console.log("Ready, added lorenz: ", this.attractor)
    })
  }

  update() {
    if(this.attractor) this.attractor.update()
  }
}