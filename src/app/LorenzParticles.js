import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

export default class LorenzAttractorParticleSystem {
  constructor(numParticles, scene, pixelRatio) {
    this.numParticles = numParticles
    this.scene = scene
    this.time = 0
    this.pixelRatio = pixelRatio
  }

  init() {
    this.lastTime = performance.now()
    // Create particle geometry and material
    const particleGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(this.numParticles * 3)
    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3),
    )

    // Create particle shader material
    this.particleShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xff6347) },
        uTime: { value: 0.0 },
        uSize: { value: 30 * this.pixelRatio },
        dt: { value: 0.01 }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
    })

    // Create particle mesh
    this.particleMesh = new THREE.Points(
      particleGeometry,
      this.particleShaderMaterial,
    )
    this.scene.add(this.particleMesh)

    // Initialize particle positions
    this.initParticlePositions()
  }

  initParticlePositions() {
    const particlePositions =
      this.particleMesh.geometry.attributes.position.array
    for (let i = 0; i < particlePositions.length; i += 3) {
      // Initialize particle positions with random values
      particlePositions[i] = Math.random() * 2 - 1
      particlePositions[i + 1] = Math.random() * 2 - 1
      particlePositions[i + 2] = Math.random() * 2 - 1
    }
    this.particleMesh.geometry.attributes.position.needsUpdate = true
  }

  render(time) {
    if (this.particleShaderMaterial) {
      this.particleShaderMaterial.uniforms.uTime.value += time
    }
  }
}
