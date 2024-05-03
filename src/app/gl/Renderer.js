import * as THREE from 'three'
import Experience from './Experience.js'

import fullScreenVertex from './shaders/fullscreen.vert';
import fullScreenFragment from './shaders/fullscreen.frag';
import { ChromaticAberrationEffect, EffectComposer, EffectPass, RenderPass, ShaderPass } from 'postprocessing';

export default class Renderer {
  constructor() {
    this.experience = new Experience()
    this.debug = this.experience.debug
    this.params = this.experience.params
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.camera = this.experience.camera

    this.init()
  }

  init() {
    window.addEventListener('resize', this.onResize.bind(this))

    //setup instance
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false
    })
    this.instance.outputColorSpace = THREE.SRGBColorSpace
    this.instance.setClearColor(0x000000, 0)
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
    this.instance.outputEncoding = THREE.sRGBEncoding

    this.composer = new EffectComposer(this.instance)
    this.composer.setSize(this.sizes.width, this.sizes.height)
    const renderPass = new RenderPass(this.scene, this.camera.instance)
    this.composer.addPass(renderPass)

    const chromaticAberrationEffect = new ChromaticAberrationEffect()
    this.chromaticAberrationEffect = chromaticAberrationEffect
    chromaticAberrationEffect.offset = new THREE.Vector2(0,0)
    this.composer.addPass(new EffectPass(this.camera.instance, this.chromaticAberrationEffect))
    this.createBackground()
    this.onResize()
  }

  onResize() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.instance.setSize(width, height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
  }

render() {
    const delta = this.experience.clock.getDelta()
    //refactor later
    this.experience.world.update(this.instance, delta)
    this.instance.setRenderTarget(null)
  
    this.composer.render()
    // this.instance.render(this.scene, this.camera.instance);
}

  saveImage() {
    const renderer = this.experience.renderer.instance
    const canvas = renderer.domElement
    const link = document.createElement('a')
    link.download = window.location.hostname + '_lorenz_attractor.jpeg'
    link.href = canvas.toDataURL('image/jpeg')
    link.click()
  }

  //Needed because of the setClearColor to transparent. Additive particles have a black background otherwise.
  createBackground() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: fullScreenVertex,
      fragmentShader: fullScreenFragment,
      uniforms: {
        uColor: { value: new THREE.Color(this.experience.bgColor)},
      },
      depthTest: false,
      blending: THREE.AdditiveBlending      
    });

    this.fullScreenBg = new THREE.Mesh(geometry, material);
    this.scene.add(this.fullScreenBg);
  }
}
