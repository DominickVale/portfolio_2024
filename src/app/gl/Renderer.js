import * as THREE from 'three'
import Experience from './Experience.js'

import fullScreenVertex from './shaders/fullscreen.vert';
import fullScreenFragment from './shaders/fullscreen.frag';
import {ChromaticAberrationEffect, DepthOfFieldEffect, EffectComposer, EffectPass, KawaseBlurPass, KernelSize, RenderPass, SelectiveBloomEffect } from 'postprocessing';

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
    window.addEventListener('resize', this.resize.bind(this))

    //setup instance
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
    })
    this.instance.outputColorSpace = THREE.SRGBColorSpace
    this.instance.setClearColor(0x000000, 0)
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
    this.instance.outputEncoding = THREE.sRGBEncoding

    this.composer = new EffectComposer(this.instance, { frameBufferType: THREE.HalfFloatType})
    this.composer.setSize(this.sizes.width, this.sizes.height)
    const renderPass = new RenderPass(this.scene, this.camera.instance)
    this.composer.addPass(renderPass)

    this.bloomEffect = new SelectiveBloomEffect(this.scene, this.camera.instance, {
			blendFunction: this.params.bloomBlendFunction,
			mipmapBlur: true,
			luminanceThreshold: this.params.bloomLuminanceThreshold,
			luminanceSmoothing: this.params.bloomLuminanceSmoothing,
			intensity: this.params.bloomIntensity,
      radius: this.params.bloomRadius,
	});
    const chromaticAberrationEffect = new ChromaticAberrationEffect()
    this.chromaticAberrationEffect = chromaticAberrationEffect
    chromaticAberrationEffect.offset = new THREE.Vector2(0,0)
    this.blurPass = new KawaseBlurPass({
			height: 500,
      kernelSize: KernelSize.VERY_LARGE
		});
    this.blurPass.enabled = false
    this.composer.addPass(this.blurPass)
    this.composer.addPass(new EffectPass(this.camera.instance, this.chromaticAberrationEffect))
    this.composer.addPass(new EffectPass(this.camera.instance, this.bloomEffect))
    this.createBackground()
    this.resize()
  }

  resize() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.instance.setSize(width, height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
  }

update(delta) {
    this.instance.setRenderTarget(null)
  
    this.composer.render()
    // this.instance.render(this.scene, this.camera.instance);
    if (this.debug) {
      this.debug.update()
      if (this.debug.shouldSaveImage) {
        this.saveImage()
        this.debug.shouldSaveImage = false
      }
    }

    this.experience.world.afterRender(this.instance, delta)
    this.composer.setSize(this.sizes.width, this.sizes.height)
}

  saveImage() {
    const renderer = this.experience.renderer.instance
    const canvas = renderer.domElement
    const link = document.createElement('a')
    link.download = window.location.hostname + '_lorenz_attractor.jpeg'
    link.href = canvas.toDataURL('image/jpeg')
    alert("Please don't use this for commercial purposes or as part of an identity. Contact me if you reeeeally want to. Thank you.")
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
