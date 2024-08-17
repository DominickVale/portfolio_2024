import Experience from './Experience'
import LorenzAttractor from './Scenes/LorenzAttractor'
import WorksImage from './Scenes/WorksImage'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.sizes = this.experience.sizes
    this.resources = this.experience.resources
    this.isReady = false
    this.attractor = new LorenzAttractor('collapsed')
    this.worksImage = new WorksImage()
    this.scene.add(this.attractor.points)
    this.objects = []

    this.resources.on('ready', () => {
      this.worksImage.show()
      this.isReady = true
      this.resize()
    })
  }

  resize() {
    if (!this.isReady) return
    this.attractor.resize()
    this.worksImage.resize()
  }

  update(renderer, delta, elapsed) {
    if (!this.isReady) return
    this.attractor.update(renderer, delta, elapsed)
    this.worksImage.update(renderer, delta, elapsed)
  }

  afterRender(renderer, delta) {
    if (!this.isReady) return
    this.worksImage.afterRender(renderer, delta)
  }
}
