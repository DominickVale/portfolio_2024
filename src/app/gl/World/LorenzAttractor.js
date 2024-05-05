import * as THREE from 'three'
import Experience from '../Experience.js'

import renderFrag from '../shaders/render.frag'
import renderVert from '../shaders/render.vert'
import simFragment from '../shaders/simulation.frag'
import simVert from '../shaders/simulation.vert'

export default class LorenzAttractor {
  #lorenzGeometry
  constructor() {
    this.firstRender = true
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.renderer = this.experience.renderer
    this.params = this.experience.params
    this.time = this.experience.time
    this.sizes = this.experience.sizes
    this.debug = this.experience.debug

    this.init()
  }

  init() {
    //setup ping pong
    this.bufferScene = new THREE.Scene()
    this.bufferCamera = new THREE.OrthographicCamera( -1, 1, 1, -1);

    const initialTexture = this.createInitialTexture();
    const initialTexturePos = initialTexture.clone();
    this.#lorenzGeometry = new THREE.BufferGeometry()

    const settings = {
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type:THREE.FloatType,
      stencilBuffer: false,
      toneMapping: THREE.NoToneMapping
    }

    this.renderBufferA = new THREE.WebGLRenderTarget(this.params.particlesBufWidth, this.params.particlesBufWidth, settings)
    this.renderBufferB = new THREE.WebGLRenderTarget(this.params.particlesBufWidth, this.params.particlesBufWidth, settings)

    this.pool = [this.renderBufferA, this.renderBufferB]

    const positions = new Float32Array( this.params.particlesBufWidth * this.params.particlesBufWidth * 3,)
    const refs = new Float32Array( this.params.particlesBufWidth * this.params.particlesBufWidth * 2,)
    for ( let i = 0; i < this.params.particlesBufWidth * this.params.particlesBufWidth; i++) {
      let xx = (i % this.params.particlesBufWidth) / this.params.particlesBufWidth
      let yy = ~~(i / this.params.particlesBufWidth) / this.params.particlesBufWidth
      positions.set([0, 0, 0], i * 3)
      refs.set([xx, yy], i * 2)
    }

    this.#lorenzGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3),
    )
    this.#lorenzGeometry.setAttribute('reference', new THREE.BufferAttribute(refs, 2))

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
          value: (this.experience.isMobile ? 70 : 120) * this.sizes.pixelRatio,
        },
      },
      defines: {
        isMobile: this.experience.isMobile ? 1 : 0,
      },
      vertexShader: renderVert,
      fragmentShader: renderFrag,
    });

    this.points = new THREE.Points(this.#lorenzGeometry, this.renderMaterial)
    this.points.rotation.x = this.params.rotationX
    this.points.rotation.y = this.params.rotationY
    this.points.rotation.z = this.params.rotationZ
    this.points.position.x = this.params.positionX
    this.points.position.y = this.params.positionY
    this.points.position.z = this.params.positionZ

    // Simulation Material
    this.bufferMaterial = new THREE.ShaderMaterial({
      dithering: true,
      uniforms: {
        uTime: { value: 0.0 },
        uSigma: { value: this.params.sigma },
        uRho: { value: this.params.rho },
        uBeta: { value: this.params.beta },
        uDt: { value: 0.0001 * Math.pow(this.params.speed, 2) },
        uTexture: { value: initialTexture },
        uInitialPositions: { value: initialTexturePos }
      },
      vertexShader: simVert,
      fragmentShader: simFragment,
    })

    this.bufferMaterial.defines.resolution = 'vec2( ' + this.params.particlesBufWidth.toFixed( 1 ) + ' , ' + this.params.particlesBufWidth.toFixed( 1 ) + ' )';

    const bufferMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.bufferMaterial);

    this.bufferScene.add(bufferMesh)
  }

  setTexture(texture){
    texture.minFilter = THREE.LinearMipMapLinearFilter
    this.renderMaterial.uniforms.alphaMap.value = texture
  }

  update(renderer, delta) {
    const [read, write] = this.pool.reverse()
    renderer.setRenderTarget(write)
    renderer.render(this.bufferScene, this.bufferCamera);
    this.points.material.uniforms.uTexture.value = read.texture;
    this.bufferMaterial.uniforms.uTexture.value = write.texture

    this.bufferMaterial.uniforms.uDt = {
      value: delta * 0.0001 * Math.pow(this.params.speed, 2),
    };

    if(this.debug.showFBOTextures){
      if(!this.debugPlane){
        this.debugPlane = new THREE.Mesh( new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial())
        this.debugPlane.position.x = 10
        this.debugPlane.position.z = 60
        this.scene.add(this.debugPlane)
      }
      this.debugPlane.material.map = read.texture
    }else if (this.debugPlane) {
      this.scene.remove(this.debugPlane)
      this.debugPlane = null
    }
  }

  createInitialTexture() {
    const size = this.params.particlesBufWidth * this.params.particlesBufWidth * 4;
    const data = new Float32Array(size);

    const a = this.params.sigma;
    const b = this.params.rho;
    const c = this.params.beta;

    let x = 0.1;
    let y = 0.1;
    let z = 0.1;

    for (let i = 0; i < size; i += 4) {
      let dt = 0.01;
      let dx = a * (y - x) * dt;
      let dy = (x * (b - z) - y) * dt;
      let dz = (x * y - c * z) * dt;
      x = x + dx;
      y = y + dy;
      z = z + dz;

      data[i] = x;
      data[i + 1] = y;
      data[i + 2] = z;
      data[i + 3] = 1;
    }
    const dataTexture = new THREE.DataTexture(data, this.params.particlesBufWidth, this.params.particlesBufWidth, THREE.RGBAFormat, THREE.FloatType);
    dataTexture.needsUpdate = true
    return dataTexture
  }
}
