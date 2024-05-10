import Experience from '../Experience.js'
import LorenzAttractor from './LorenzAttractor.js'
import { $ } from '../../utils'
import {ChromaticAberrationEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import * as THREE from 'three'

const perspective = 1000
 const fov = (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.sizes = this.experience.sizes
    this.resources = this.experience.resources
    this.isReady = false
    this.attractor = new LorenzAttractor()
    this.scene.add(this.attractor.points)
    this.page = window.location.pathname.split('/').pop()

    this.resources.on('ready', () => {
      // this.attractor.setTexture(this.resources.items.star)
      if(this.page === "works"){
        const planeGeometry = new THREE.PlaneGeometry(1, 1);

        const planeMaterial = new THREE.MeshBasicMaterial({ map: this.resources.items.reggaecat });
        this.worksScene = new THREE.Scene();

        const imagePlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.worksScene.userData.plane = imagePlane
        this.worksScene.add(imagePlane);

        const worksCamera = new THREE.PerspectiveCamera(fov, this.sizes.aspectRatio, 1, 1000)
        worksCamera.position.z = perspective
        this.worksScene.userData.camera = worksCamera

        const image = $("#works-image")
        this.worksScene.userData.element = image

        this.composer = new EffectComposer(this.experience.renderer.instance, { frameBufferType: THREE.HalfFloatType})
        this.composer.setSize(this.experience.sizes.width, this.experience.sizes.height)
        const renderPass = new RenderPass(this.worksScene, worksCamera)
        this.composer.addPass(renderPass)

        const chromaticAberrationEffect = new ChromaticAberrationEffect()
        this.chromaticAberrationEffect = chromaticAberrationEffect
        chromaticAberrationEffect.offset = new THREE.Vector2(0.005, 0.005)
        this.composer.addPass(new EffectPass(worksCamera, this.chromaticAberrationEffect))
      }
      this.isReady = true
    })
  }

  update(renderer, delta) {
    if(!this.isReady) return
    this.attractor.update(renderer, delta)
  }

  afterRender(renderer, delta, composer){
    const element = this.worksScene.userData.element;
    const camera = this.worksScene.userData.camera;
    const plane = this.worksScene.userData.plane;

    const rect = element.getBoundingClientRect();

    const pos = {
      x: rect.left - window.innerWidth / 2 + rect.width / 2,
      y: -rect.top + window.innerHeight / 2 - rect.height / 2,
    }

    plane.scale.set(rect.width - 50, rect.height - 50, 1)
    plane.position.set(pos.x, pos.y, 1)


    const tex = this.resources.items.reggaecat
    const planeAspect = rect.width / rect.height;
    const imageAspect = tex.image.naturalWidth / tex.image.naturalHeight;
    const aspect = imageAspect / planeAspect;

    tex.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
    tex.repeat.x = aspect > 1 ? 1 / aspect : 1;

    tex.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
    tex.repeat.y = aspect > 1 ? 1 : aspect;
    text.wrapS = THREE.ClampToEdgeWrapping
    text.wrapT = THREE.RepeatWrapping

    plane.material.map = tex

    renderer.render(this.worksScene, camera);
  }
}
