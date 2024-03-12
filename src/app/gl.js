import * as THREE from 'three'

export default class GL {
  constructor() {
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

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    this.cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material)
    this.scene.add(this.cube)
  }

  init() {
    this.camera.position.z = 5
    this.time = 0
    this.render()
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

  render(time) {
    this.time += 0.001
    if (this.resize()) {
      this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight
      this.camera.updateProjectionMatrix()
    }
    this.cube.rotation.x = this.time
    this.cube.rotation.z = this.time
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.render.bind(this))
  }
}
