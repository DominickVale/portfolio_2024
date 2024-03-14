import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'

import positionSimulation from './shaders/positionSimulation.glsl'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

const WIDTH = 128

export default class GL {
  constructor() {

    let app = document.getElementById("app");
    this.stats = new Stats();
    app.appendChild(this.stats.dom);
    this.params = {
      sigma: 10,
      rho: 28,
      beta: 8 / 3,
      dt: 0.0005
    }
    this.gui = new GUI()
    this.gui.add(this.params, 'sigma', 0, 100)
    this.gui.add(this.params, 'rho', 0, 100)
    this.gui.add(this.params, 'beta', 0, 10)
    this.gui.add(this.params, 'dt', 0.00001, 0.01)

    this.clock = new THREE.Clock()
    this.canvas = document.getElementById('webgl')
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.001,
      1000,
    )
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.renderer.outputEncoding = THREE.sRGBEncoding
  }

  init() {
    this.camera.position.z = 80
    this.time = 0
    this.addObjects()
    this.initGPGPU()
    this.render()
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0.0 },
        uSize: { value: 100 * this.renderer.getPixelRatio() },
        uPositionTexture: { value: null },
      },
      vertexShader,
      fragmentShader,
    })
    this.geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(WIDTH * WIDTH * 3)
    const refs = new Float32Array(WIDTH * WIDTH * 2)
    for (let i = 0; i < WIDTH * WIDTH; i++) {
      let x = 0
      let y = 0
      let z = 0
      let xx = (i % WIDTH) / WIDTH
      let yy = ~~(i / WIDTH) / WIDTH
      positions.set([x, y, z], i * 3)
      refs.set([xx, yy], i * 2)
    }

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3),
    )
    this.geometry.setAttribute('reference', new THREE.BufferAttribute(refs, 2))
    this.plane = new THREE.Points(this.geometry, this.material)

    this.scene.add(this.plane)
  }

  // GPGPU STUFF

  initGPGPU() {
    const gpu = new GPUComputationRenderer(WIDTH, WIDTH, this.renderer)
    const dtPosition = gpu.createTexture()
    this.initPositions(dtPosition)
    this.positionVariable = gpu.addVariable(
      'tPosition',
      positionSimulation,
      dtPosition,
    )
    this.positionVariable.material.uniforms['time'] = { value: 0.0 }
    this.positionVariable.material.uniforms['uSigma'] = { value: this.params.sigma, }
    this.positionVariable.material.uniforms['uRho'] = { value: this.params.rho }
    this.positionVariable.material.uniforms['uBeta'] = { value: this.params.beta, }
    this.positionVariable.material.uniforms['uDt'] = { value: this.params.dt }
    this.positionVariable.wrapT = THREE.RepeatWrapping
    this.positionVariable.wrapS = THREE.RepeatWrapping
    gpu.init()

    this.gpu = gpu
  }

  //initializes positions of the lorenz attractor.
  // each particle is placed into an initial positionn in a different step in time
  initPositions(texture) {
    let arr = texture.image.data
    const a = this.params.sigma
    const b = this.params.rho
    const c = this.params.beta

    let x = 0.1
    let y = 0
    let z = 0

    for (let i = 0; i < arr.length; i += 4) {
      //lorenz attractor
      let dt = 0.008 + 0.0005 * Math.random()
      let dx = a * (y - x) * dt
      let dy = (x * (b - z) - y) * dt
      let dz = (x * y - c * z) * dt
      x = x + dx
      y = y + dy
      z = z + dz

      arr[i] = x
      arr[i + 1] = y
      arr[i + 2] = z
      arr[i + 3] = 1
    }
  }

  //////

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

    // this.material.uniforms.uTime.value = time
    this.positionVariable.material.uniforms.uSigma.value = this.params.sigma
    this.positionVariable.material.uniforms.uRho.value = this.params.rho
    this.positionVariable.material.uniforms.uBeta.value = this.params.beta
    this.positionVariable.material.uniforms.uDt = { value: this.params.dt }

    this.gpu.compute()
    this.material.uniforms.uPositionTexture.value =
      this.gpu.getCurrentRenderTarget(this.positionVariable).texture

    if (this.resize()) {
      this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight
      this.camera.updateProjectionMatrix()
    }
    this.renderer.render(this.scene, this.camera)
    this.stats.update()
    requestAnimationFrame(this.render.bind(this))
  }
}
