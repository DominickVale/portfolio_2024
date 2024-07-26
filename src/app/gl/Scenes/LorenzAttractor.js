import * as THREE from 'three'
import Experience from '../Experience.js'
import { LORENZ_PRESETS } from '../../constants'

import renderFrag from '../shaders/render.frag'
import renderVert from '../shaders/render.vert'
import simFragment from '../shaders/simulation.frag'
import simVert from '../shaders/simulation.vert'

export default class LorenzAttractor {
  #lorenzGeometry
  constructor(type) {
    this.firstRender = true
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.renderer = this.experience.renderer
    this.params = this.experience.params
    this.time = this.experience.time
    this.sizes = this.experience.sizes
    this.debug = this.experience.debug
    this.boxCenter = new THREE.Vector3(0, 0, 0)
    this.type = type

    this.init()
  }

  init() {
    //setup ping pong
    this.bufferScene = new THREE.Scene()
    this.bufferCamera = new THREE.OrthographicCamera(-1, 1, 1, -1)
    this.#lorenzGeometry = new THREE.BufferGeometry()

    const settings = {
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      stencilBuffer: false,
      toneMapping: THREE.NoToneMapping,
    }

    this.renderBufferA = new THREE.WebGLRenderTarget(this.params.particlesBufWidth, this.params.particlesBufWidth, settings)
    this.renderBufferB = new THREE.WebGLRenderTarget(this.params.particlesBufWidth, this.params.particlesBufWidth, settings)

    this.pool = [this.renderBufferA, this.renderBufferB]

    const positions = new Float32Array(this.params.particlesBufWidth * this.params.particlesBufWidth * 3)
    const refs = new Float32Array(this.params.particlesBufWidth * this.params.particlesBufWidth * 2)
    for (let i = 0; i < this.params.particlesBufWidth * this.params.particlesBufWidth; i++) {
      let xx = (i % this.params.particlesBufWidth) / this.params.particlesBufWidth
      let yy = ~~(i / this.params.particlesBufWidth) / this.params.particlesBufWidth
      positions.set([0, 0, 0], i * 3)
      refs.set([xx, yy], i * 2)
    }

    this.#lorenzGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.#lorenzGeometry.setAttribute('reference', new THREE.BufferAttribute(refs, 2))

    const [initialTexture, initialTextureData] = this.createInitialTexture()
    const initialTexturePos = initialTexture.clone()

    //Screen Material
    this.renderMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      dithering: true,
      uniforms: {
        uTexture: { value: null },
        uInitialPositions: { value: initialTexturePos },
        uColor: { value: new THREE.Color(this.params.lorenzColor) },
        uSize: {
          value: (this.experience.isMobile ? 50 : 100) * this.sizes.pixelRatio,
        },
      },
      vertexShader: renderVert,
      fragmentShader: renderFrag,
    })

    const preset = this.type ? LORENZ_PRESETS[this.type] : this.params

    this.points = new THREE.Points(this.#lorenzGeometry, this.renderMaterial)

    this.points.rotation.x = preset.rotationX
    this.points.rotation.y = preset.rotationY
    this.points.rotation.z = preset.rotationZ

    this.points.position.x = preset.positionX
    this.points.position.y = preset.positionY
    this.points.position.z = preset.positionZ

    // Simulation Material
    this.bufferMaterial = new THREE.ShaderMaterial({
      dithering: true,
      uniforms: {
        uTime: { value: 0.0 },
        uSigma: { value: preset.sigma },
        uRho: { value: preset.rho },
        uBeta: { value: preset.beta },
        uDt: { value: 0.0001 * Math.pow(preset.speed, 2) },
        uTexture: { value: initialTexture },
        uInitialPositions: { value: initialTexturePos },
      },
      vertexShader: simVert,
      fragmentShader: simFragment,
    })

    this.bufferMaterial.defines.resolution =
      'vec2( ' + this.params.particlesBufWidth.toFixed(1) + ' , ' + this.params.particlesBufWidth.toFixed(1) + ' )'

    this.bufferMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.bufferMaterial)
    this.bufferScene.add(this.bufferMesh)
  }

  setTexture(texture) {
    texture.minFilter = THREE.LinearMipMapLinearFilter
    this.renderMaterial.uniforms.alphaMap.value = texture
  }

  resetParams(){
    this.bufferMaterial.uniforms.uSigma.value = this.params.sigma
    this.bufferMaterial.uniforms.uRho.value = this.params.rho
    this.bufferMaterial.uniforms.uBeta.value = this.params.beta
  }

  reset() {
    this.firstRender = true
    this.type = 'default'
    // this.bufferMesh.geometry.dispose()
    // this.bufferMesh.material.dispose()
    // this.bufferScene.remove(this.bufferMesh)

    const [initialTexture, initialTextureData] = this.createInitialTexture()
    const initialTexturePos = initialTexture.clone()

    this.points.rotation.x = this.params.rotationX
    this.points.rotation.y = this.params.rotationY
    this.points.rotation.z = this.params.rotationZ

    this.points.position.x = this.params.positionX
    this.points.position.y = this.params.positionY
    this.points.position.z = this.params.positionZ

    this.resetParams()

    this.points.material.uniforms.uTexture.value = initialTexture
    this.points.material.uniforms.uInitialPositions.value = initialTexturePos
    this.bufferMaterial.uniforms.uTexture.value = initialTexture
    this.bufferMaterial.uniforms.uInitialPositions.value = initialTexturePos
  }

  resize() {}

  update(renderer, delta) {
    const [read, write] = this.pool.reverse()
    renderer.setRenderTarget(write)
    renderer.render(this.bufferScene, this.bufferCamera)
    this.points.material.uniforms.uTexture.value = read.texture
    this.bufferMaterial.uniforms.uTexture.value = write.texture

    this.bufferMaterial.uniforms.uDt = {
      value: delta * 0.0001 * Math.pow(this.params.speed, 2),
    }
  }

  createInitialTexture() {
    const size = this.params.particlesBufWidth * this.params.particlesBufWidth * 4
    const data = new Float32Array(size)

    const preset = LORENZ_PRESETS[this.type || 'default']

    if (this.type === 'collapsed') {
      const scaleX = 0.01
      const scaleY = 0.01
      const scaleZ = 0.2
      const gradientFactor = 10

      // Use the geometry of a filled elongated sphere (almost like a line)
      for (let i = 0; i < size; i += 4) {
        const u = Math.random()
        const v = Math.random()
        const theta = 2 * Math.PI * u
        const phi = Math.acos(2 * v - 1)
        const r = Math.cbrt(Math.random() * Math.exp(gradientFactor * Math.random())) // Gradient distribution

        const x = r * Math.sin(phi) * Math.cos(theta) * scaleX
        const y = r * Math.sin(phi) * Math.sin(theta) * scaleY
        const z = r * Math.cos(phi) * scaleZ

        data[i] = x
        data[i + 1] = y
        data[i + 2] = z
        data[i + 3] = 1
      }
    } else {
      // Original Lorenz system
      const a = preset.sigma
      const b = preset.rho
      const c = preset.beta

      let x = 0.1
      let y = 0.1
      let z = 0.1

      let minX = x
      let minY = y
      let minZ = z
      let maxX = x
      let maxY = y
      let maxZ = z

      for (let i = 0; i < size; i += 4) {
        let dt = 0.01
        let dx = a * (y - x) * dt
        let dy = (x * (b - z) - y) * dt
        let dz = (x * y - c * z) * dt
        x = x + dx
        y = y + dy
        z = z + dz

        data[i] = x
        data[i + 1] = y
        data[i + 2] = z
        data[i + 3] = 1

        if (x < minX) minX = x
        if (y < minY) minY = y
        if (z < minZ) minZ = z
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
        if (z > maxZ) maxZ = z
      }

      this.boxCenter.x = (minX + maxX) / 2
      this.boxCenter.y = (minY + maxY) / 2
      this.boxCenter.z = (minZ + maxZ) / 2
    }

    const dataTexture = new THREE.DataTexture(data, this.params.particlesBufWidth, this.params.particlesBufWidth, THREE.RGBAFormat, THREE.FloatType)
    dataTexture.needsUpdate = true

    return [dataTexture, data]
  }
}
