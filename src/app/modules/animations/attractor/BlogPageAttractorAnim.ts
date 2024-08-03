import gsap from 'gsap'
import { CustomEase } from 'gsap/all'

export const BlogPageAttractorAnim = {
  create(onComplete?: () => void) {
    const experience = window.app.experience
    const attractor = experience.world.attractor

    const uniTL = gsap
      .timeline()
      .set(experience.params, { speed: 70 })
      .to(
        experience.params,
        {
          speed: 5,
          duration: 3.5,
          ease: 'power4.inOut',
        },
      )
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: 0.005,
          duration: 0.2,
          ease: 'power4.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uRho,
        {
          value: 37,
          duration: 0,
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uBeta,
        {
          value: 0.696,
          duration: 0.1,
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: 100,
          duration: 0,
          ease: 'power4.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: 0.005,
          duration: 0.8,
          ease: 'power4.out',
        },
      )

    const posTL = gsap
      .timeline()
      .to(
        attractor.points.position,
        {
          x: -1.5,
          y: 4.5,
          z: -5,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          x: 0.131946891450771,
          y: 0.439822971502571,
          z: 1.13097335529233,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )
    return gsap.timeline({ onComplete, paused: true }).add(uniTL).add(posTL, "<")
  },
}
