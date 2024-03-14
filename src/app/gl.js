import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
import positionSimulation from './shaders/positionSimulation.glsl'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

const WIDTH = 32

export default class GL {
  constructor() {
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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

  }

  init() {
    this.camera.position.z = 2
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
        positionTexture: { value: null}
      },
      vertexShader,
      fragmentShader,
    })
    this.geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(WIDTH * WIDTH * 3)
    const refs = new Float32Array(WIDTH * WIDTH * 2)
    for (let i = 0; i < WIDTH * WIDTH; i++) {
      let x = Math.random()
      let y = Math.random()
      let z = Math.random()
      let xx = (i%WIDTH)/WIDTH
      let yy = ~~(i/WIDTH)/WIDTH
      positions.set([x, y, z], i*3)
      refs.set([xx, yy], i*2)
    }

    console.log(refs)
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.geometry.setAttribute('reference', new THREE.BufferAttribute(refs, 2))
    this.plane = new THREE.Points(this.geometry, this.material)


    this.scene.add(this.plane)
  }

  // GPGPU STUFF

  initGPGPU(){
    const gpu = new GPUComputationRenderer( WIDTH, WIDTH, this.renderer );
    const dtPosition = gpu.createTexture();
    this.initPositions(dtPosition)
    this.positionVariable = gpu.addVariable( 'tPosition', positionSimulation, dtPosition );
    this.positionVariable.material.uniforms['time'] = { value: 0.0 };
    this.positionVariable.wrapT = THREE.RepeatWrapping;
    this.positionVariable.wrapS = THREE.RepeatWrapping;
    gpu.init()
    
    this.gpu = gpu;
  }

  
  initPositions(texture){
    let arr = texture.image.data
    for (let i = 0; i < arr.length; i += 4) {
      let x = Math.random()
      let y = Math.random()
      let z = Math.random()

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
    if (this.resize()) {
      this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight
      this.camera.updateProjectionMatrix()
    }
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.render.bind(this))
  }
}
