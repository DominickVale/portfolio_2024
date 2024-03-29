import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'

import positionSimulation from './shaders/positionSimulation.glsl'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

const WIDTH = 200

/*@TODO: refactor, move to separate class
 * add some mouse interactions (rotate on mouse move)
 * add animations, let users export their lorenz attractor via some button
 * (maybe add entire custom section to settings?)
 * add animations on page transition
 * figure out how to reset to initial positions after page transitions
 * (maybe move to ogl)
 */
export default class GL {
  constructor(debug) {
    this.debug = debug
    const app = document.getElementById('app')
    // get primary color from css global variables
    this.primaryColor = getComputedStyle(app).getPropertyValue('--primary')
    this.bgColor = getComputedStyle(app).getPropertyValue('--bg-dark')
    this.oldColor = this.primaryColor
    this.params = {
      sigma: 10,
      rho: 28,
      beta: 8 / 3,
      speed: 5,
      color: this.primaryColor,
      rotationX: 0,
      rotationY: 0,
      rotationZ: -Math.PI / 5,
      positionX: 0.68,
      positionY: 4.5,
      positionZ: 0,
    }

    this.clock = new THREE.Clock()
    this.canvas = document.getElementById('webgl')
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.001,
      1000,
    )
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })
    this.renderer.setClearColor(this.bgColor)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(this.width, this.height)
    this.renderer.outputEncoding = THREE.sRGBEncoding

    if (debug) {
      this.stats = new Stats()
      app.appendChild(this.stats.dom)

      this.gui = new GUI()
      this.gui.add(this.params, 'sigma', -8, 100)
      this.gui.add(this.params, 'rho', -100, 100)
      this.gui.add(this.params, 'beta', -6, 6)
      this.gui.add(this.params, 'speed', 1, 100)
      this.gui.addColor(this.params, 'color')
      this.gui.add(this.params, 'rotationX', -Math.PI, Math.PI)
      this.gui.add(this.params, 'rotationY', -Math.PI, Math.PI)
      this.gui.add(this.params, 'rotationZ', -Math.PI, Math.PI)
      this.gui.add(this.params, 'positionX', -50, 50)
      this.gui.add(this.params, 'positionY', -50, 50)
      this.gui.add(this.params, 'positionZ', -50, 50)

      this.controls = new OrbitControls(this.camera, app)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.05
      this.controls.enabled = false

      this.gui.add(this.controls, 'enabled').name('Orbit controls')
    }
  }

  async init() {
    this.camera.position.z = 74
    this.time = 0
    await this.addObjects()
    this.initGPGPU()
    this.render()
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener)
    }
    this.resizeListener = window.addEventListener(
      'resize',
      this.resize.bind(this),
    )
  }

  async addObjects() {
    const loader = new THREE.TextureLoader()
    const texture = await loader.loadAsync('star.png')
    texture.minFilter = THREE.LinearMipMapLinearFilter

    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0.0 },
        uColor: { value: new THREE.Color(this.params.color) },
        uSize: { value: 50 * this.renderer.getPixelRatio() },
        uPositionTexture: { value: null },
        alphaMap: { value: texture },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    })
    this.geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(WIDTH * WIDTH * 3)
    const refs = new Float32Array(WIDTH * WIDTH * 2)
    for (let i = 0; i < WIDTH * WIDTH; i++) {
      let xx = (i % WIDTH) / WIDTH
      let yy = ~~(i / WIDTH) / WIDTH
      // no need to set these in this case
      positions.set([0, 0, 0], i * 3)
      refs.set([xx, yy], i * 2)
    }

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3),
    )
    this.geometry.setAttribute('reference', new THREE.BufferAttribute(refs, 2))
    this.plane = new THREE.Points(this.geometry, this.material)
    this.plane.rotation.x = this.params.rotationX
    this.plane.rotation.y = this.params.rotationY
    this.plane.rotation.z = this.params.rotationZ
    this.plane.position.x = this.params.positionX
    this.plane.position.y = this.params.positionY
    this.plane.position.z = this.params.positionZ
    this.plane.geometry.center()

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
    this.positionVariable.material.uniforms['uSigma'] = {
      value: this.params.sigma,
    }
    this.positionVariable.material.uniforms['uRho'] = { value: this.params.rho }
    this.positionVariable.material.uniforms['uBeta'] = {
      value: this.params.beta,
    }
    this.positionVariable.material.uniforms['uDt'] = { value: 1 }
    this.positionVariable.wrapT = THREE.RepeatWrapping
    this.positionVariable.wrapS = THREE.RepeatWrapping
    gpu.init()

    this.gpu = gpu
  }

  //initializes positions of the lorenz attractor.
  // each particle is placed into an initial position in a different step in time
  initPositions(texture) {
    let arr = texture.image.data
    const a = this.params.sigma
    const b = this.params.rho
    const c = this.params.beta

    let x = 0.1
    let y = 0.1
    let z = 0.1

    for (let i = 0; i < arr.length; i += 4) {
      //lorenz attractor, euler's method
      let dt = 0.01 // * Math.random()
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
    this.width = window.innerWidth
    this.height = window.innerHeight

    this.renderer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  render() {
    const delta = this.clock.getDelta()

    // this.material.uniforms.uTime.value = elapsedtime
    if (this.oldColor !== this.params.color) {
      this.material.uniforms.uColor.value = new THREE.Color(this.params.color)
      this.oldColor = this.params.color
    }

    this.plane.rotation.x = this.params.rotationX
    this.plane.rotation.y = this.params.rotationY
    this.plane.rotation.z = this.params.rotationZ
    this.plane.position.x = this.params.positionX
    this.plane.position.y = this.params.positionY
    this.plane.position.z = this.params.positionZ

    this.positionVariable.material.uniforms.uSigma.value = this.params.sigma
    this.positionVariable.material.uniforms.uRho.value = this.params.rho
    this.positionVariable.material.uniforms.uBeta.value = this.params.beta
    this.positionVariable.material.uniforms.uDt = {
      value: delta * 0.0001 * Math.pow(this.params.speed, 2),
    }

    this.gpu.compute()
    this.material.uniforms.uPositionTexture.value =
      this.gpu.getCurrentRenderTarget(this.positionVariable).texture

    if (this.resize()) {
      this.camera.aspect = this.width / this.height
      this.camera.updateProjectionMatrix()
    }
    this.renderer.render(this.scene, this.camera)
    if(this.debug){
      this.stats.update()
    }
    requestAnimationFrame(this.render.bind(this))
  }
}
