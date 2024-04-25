import * as THREE from 'three'
import Experience from '../Experience.js'

import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import positionSimulation from '../shaders/positionSimulation.glsl'
import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'
import fragmentShaderMobile from '../shaders/fragmentMobile.glsl'

export default class LorenzAttractor {
  constructor(_texture) {
    this._texture = _texture
    this.experience = new Experience()
    this.oldColor = this.experience.oldColor
    this.renderer = this.experience.renderer
    this.params = this.experience.params
    this.time = this.experience.time
    this.sizes = this.experience.sizes
    this.debug = this.experience.debug

    this.init()
  }

  init() {
    this._texture.minFilter = THREE.LinearMipMapLinearFilter

    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0.0 },
        uColor: { value: new THREE.Color(this.params.color) },
        uSize: {
          value:
            (this.experience.isMobile ? 70 : 60) *
            this.sizes.pixelRatio,
        },
        uPositionTexture: { value: null },
        alphaMap: { value: this._texture },
      },
      vertexShader,
      fragmentShader: this.experience.isMobile ? fragmentShaderMobile : fragmentShader,
      transparent: true,
      depthWrite: false,
    })
    this.geometry = new THREE.BufferGeometry()

    const positions = new Float32Array( this.params.particlesBufWidth * this.params.particlesBufWidth * 3,)
    const refs = new Float32Array( this.params.particlesBufWidth * this.params.particlesBufWidth * 2,)
    for ( let i = 0; i < this.params.particlesBufWidth * this.params.particlesBufWidth; i++) {
      let xx = (i % this.params.particlesBufWidth) / this.params.particlesBufWidth
      let yy = ~~(i / this.params.particlesBufWidth) / this.params.particlesBufWidth
      // no need to set these in this case
      positions.set([0, 0, 0], i * 3)
      refs.set([xx, yy], i * 2)
    }

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3),
    )
    this.geometry.setAttribute('reference', new THREE.BufferAttribute(refs, 2))
    this.points = new THREE.Points(this.geometry, this.material)
    this.points.rotation.x = this.params.rotationX
    this.points.rotation.y = this.params.rotationY
    this.points.rotation.z = this.params.rotationZ
    this.points.position.x = this.params.positionX
    this.points.position.y = this.params.positionY
    this.points.position.z = this.params.positionZ
    this.points.geometry.center()

    this.initGPGPU()
  }


  initGPGPU() {
    const gpu = new GPUComputationRenderer(this.params.particlesBufWidth, this.params.particlesBufWidth, this.renderer.instance)
    const dtPosition = gpu.createTexture()
    this.initPositions(dtPosition)
    this.positionVariable = gpu.addVariable(
      'uPositionTexture',
      positionSimulation,
      dtPosition,
    )
    this.positionVariable.material.uniforms['uTime'] = { value: 0.0 }
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
  initPositions(gpgpuTexture) {
    let arr = gpgpuTexture.image.data
    const a = this.params.sigma
    const b = this.params.rho
    const c = this.params.beta

    let x = 0.1
    let y = 0.1
    let z = 0.1

    for (let i = 0; i < arr.length; i += 4) {
      //lorenz attractor, euler's method
      let dt = 0.01// * Math.random()
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

  update() {
    const a = this.gpu.getCurrentRenderTarget(this.positionVariable).texture
    this.material.uniforms.uPositionTexture.value = a

    const delta = this.experience.clock.getDelta()

    if (this.oldColor !== this.params.color) {
      this.material.uniforms.uColor.value = new THREE.Color(this.params.color)
      this.oldColor = this.params.color
    }

    this.points.rotation.x = this.params.rotationX
    this.points.rotation.y = this.params.rotationY
    this.points.rotation.z = this.params.rotationZ
    this.points.position.x = this.params.positionX
    this.points.position.y = this.params.positionY
    this.points.position.z = this.params.positionZ

    this.positionVariable.material.uniforms.uSigma.value = this.params.sigma
    this.positionVariable.material.uniforms.uRho.value = this.params.rho
    this.positionVariable.material.uniforms.uBeta.value = this.params.beta
    this.positionVariable.material.uniforms.uDt = {
      value: delta * 0.0001 * Math.pow(this.params.speed, 2),
    }

    this.gpu.compute()
    this.material.uniforms.uPositionTexture.value =
      this.gpu.getCurrentRenderTarget(this.positionVariable).texture
  }
}
