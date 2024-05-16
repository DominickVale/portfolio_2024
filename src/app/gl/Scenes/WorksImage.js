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
    this.isShown = false
    this.page = window.location.pathname.split('/').pop()
    this.firstRender = true
  }

  init(){
    const planeGeometry = new THREE.PlaneGeometry(1, 1, 100, 100);

    this.planeMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: null },
        uOffset: { value: new THREE.Vector2(0.01, 0.009) },
        uAspect: {value: 1},
        uImageSize: {value: new THREE.Vector2(1, 1)},
        uPlaneSize: {value: new THREE.Vector2(1, 1)},
        uAlpha: {
          value: 1,
        },
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
    })
    this.worksScene = new THREE.Scene();

    const imagePlane = new THREE.Mesh(planeGeometry, this.planeMat);
    this.worksScene.userData.plane = imagePlane

    const worksCamera = new THREE.PerspectiveCamera(FOV, this.sizes.aspectRatio, 1, 1000)
    worksCamera.position.z = PERSPECTIVE
    this.worksScene.userData.camera = worksCamera
  }

  show(){
    if(this.isShown) return
    if(this.firstRender) {
      this.firstRender = false
      this.init()
    }
    this.worksScene.add(this.worksScene.userData.plane);
    this.isShown = true
    this.resize()
  }

  hide(){
    this.isShown = false
    this.worksScene?.remove(this.worksScene.userData.plane)
  }

  resize(){
    if(!this.isShown) return
    const element = $("#works-image")
    const plane = this.worksScene.userData.plane;

    const rect = element.getBoundingClientRect();

    const pos = {
      x: rect.left - window.innerWidth / 2 + rect.width / 2,
      y: -rect.top + window.innerHeight / 2 - rect.height / 2,
    }

    plane.scale.set(rect.width - 50, rect.height - 50, 1)
    plane.position.set(pos.x, pos.y, 1)

    const tex = this.resources.items.reggaecat

    plane.material.uniforms.uTexture.value = tex
    plane.material.uniforms.uPlaneSize.value = new THREE.Vector2(rect.width, rect.height)
    plane.material.uniforms.uImageSize.value = new THREE.Vector2(tex.image.naturalWidth, tex.image.naturalHeight)
  }

  update(renderer, delta) {
    if(!this.isShown) return
    this.planeMat.uniforms.uTime.value = delta
  }

  afterRender(renderer, delta, composer){
    if(!this.isShown) return
    const camera = this.worksScene.userData.camera;
    renderer.render(this.worksScene, camera);
  }
}
