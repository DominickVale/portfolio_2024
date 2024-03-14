import * as THREE from 'three'
import LorenzParticles from './LorenzParticles'

export default class GL {
  constructor() {
    this.clock = new THREE.Clock()
    this.canvas = document.getElementById('webgl')
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000,
    )
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })

    this.lorenz = new LorenzParticles(1000, this.scene, this.renderer.getPixelRatio())
  }

  init() {
    this.camera.position.z = 5
    this.time = 0
    this.render()
    this.lorenz.init()
  }

  resize() {
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight
    const needResize =
      this.canvas.width !== width || this.canvas.height !== height
    if (needResize) {
      this.renderer.setSize(width, height, false)
    }
    return needResize
  }

  render() {
    const time = this.clock.getElapsedTime()
    this.time = time
    if (this.resize()) {
      this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight
      this.camera.updateProjectionMatrix()
    }
    this.lorenz.render(time)
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.render.bind(this))
  }
}
