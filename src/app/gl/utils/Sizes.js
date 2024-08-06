import Emitter from 'tiny-emitter'

export default class Sizes extends Emitter {
  constructor() {
    super()

    // Setup
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.pixelRatio = Math.min(window.devicePixelRatio, 1.5)
    this.aspectRatio = this.width / this.height

    // Resize event
    window.addEventListener('resize', () => {
      this.width = window.innerWidth
      this.height = window.innerHeight
    this.aspectRatio = this.width / this.height
      this.pixelRatio = Math.min(window.devicePixelRatio, 1.5)

      this.emit('resize')
    })
  }
}
