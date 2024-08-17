import { $ } from '../../utils'
import Experience from '../Experience.js'
import * as THREE from 'three'
import frag from '../shaders/worksImage.frag'
import vert from '../shaders/worksImage.vert'
import { DigitalGlitch } from 'three/examples/jsm/Addons.js'

const PERSPECTIVE = 1000
const FOV = (180 * (2 * Math.atan(window.innerHeight / 2 / PERSPECTIVE))) / Math.PI

export default class WorksImage {
  constructor() {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.resources = this.experience.resources
    this.page = window.location.pathname.split('/').pop()
    this.firstRender = true
    this.currentTexture = null
  }

  init() {
    const planeGeometry = new THREE.PlaneGeometry(1, 1, 100, 100)

    this.planeMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 1 },
        uTexture: { value: null },
        uNextTexture: { value: null },
        uImageSize: { value: new THREE.Vector2(1, 1) },
        uPlaneSize: { value: new THREE.Vector2(1, 1) },
        uStrength: { value: 3.0 },
        uOpacity: { value: window.app.reducedMotion ? 0.0 : 1.0 },
        uMouse: { value: new THREE.Vector2(0.0, 0.0) },
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
    })
    this.worksScene = new THREE.Scene()

    const imagePlane = new THREE.Mesh(planeGeometry, this.planeMat)
    this.worksScene.userData.plane = imagePlane

    const worksCamera = new THREE.PerspectiveCamera(FOV, this.sizes.aspectRatio, 1, 1000)
    worksCamera.position.z = PERSPECTIVE
    this.worksScene.userData.camera = worksCamera
  }

  show() {
    if (this.firstRender) {
      this.firstRender = false
      this.init()
    }
    this.worksScene.add(this.worksScene.userData.plane)
    this.resize()
  }

  hide() {
    this.worksScene?.remove(this.worksScene.userData.plane)
  }

  resize() {
    const element = $('#works-image')
    if (!element) return
    const plane = this.worksScene.userData.plane
    const camera = this.worksScene.userData.camera

    camera.aspect = this.sizes.aspectRatio
    camera.fov = 2 * Math.atan(window.innerHeight / 2 / camera.position.z) * (180 / Math.PI)
    camera.updateProjectionMatrix()

    const rect = element.getBoundingClientRect()

    const pos = {
      x: rect.left - window.innerWidth / 2 + rect.width / 2,
      y: -rect.top + window.innerHeight / 2 - rect.height / 2,
    }

    plane.scale.set(rect.width, rect.height, 1)
    plane.position.set(pos.x, pos.y, 1)

    const tex = this.currentTexture || this.resources.items.ambientify1.file
    plane.material.uniforms.uTexture.value = tex
    plane.material.uniforms.uPlaneSize.value = new THREE.Vector2(rect.width, rect.height)
    plane.material.uniforms.uImageSize.value = new THREE.Vector2(tex.image.naturalWidth, tex.image.naturalHeight)
  }

  update(renderer, delta, elapsed) {
    this.planeMat.uniforms.uTime.value = elapsed * 100
    this.planeMat.uniforms.uMouse.value = new THREE.Vector2(this.experience.cursor.pos.x, this.experience.cursor.pos.y)
  }

  afterRender(renderer, composer) {
    const camera = this.worksScene.userData.camera
    renderer.render(this.worksScene, camera)
  }

  setImage(tex) {
    this.currentTexture = tex
    this.planeMat.uniforms.uTexture.value = tex
    this.planeMat.uniforms.uImageSize.value = new THREE.Vector2(tex.image.naturalWidth, tex.image.naturalHeight)
  }
}
