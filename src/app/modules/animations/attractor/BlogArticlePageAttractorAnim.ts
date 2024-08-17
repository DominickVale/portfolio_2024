import gsap from 'gsap'
import { CustomEase } from 'gsap/all'

export const BlogArticlePageAttractorAnim = {
  create(onComplete?: () => void) {
    const experience = window.app.experience
    const attractor = experience.world.attractor

    const uniTL = gsap
      .timeline()
      .add(() => {
        const m = { v: 0, r: 1.5 }
        console.log('Starting sound')
        window.app.audio.play(null, 'shimmer-short', {
          volume: 0.04,
          rate: 0.9,
        })
        const s2 = window.app.audio.play(null, 'whoosh-short', {
          volume: 0.3,
          rate: 1,
        })
        const s = window.app.audio.play('shimmer-home', 'shimmer-medium', {
          volume: 0.3,
          rate: 0.9,
        })

        gsap
          .timeline()
          .fromTo(
            m,
            { v: 0.2, r: 1.5 },
            {
              v: 0.1,
              // r: 1,
              duration: 0.1,
              repeat: 10,
              yoyo: true,
              ease: 'sine.inOut',
              onUpdate() {
                s.volume(m.v)
                s2.volume(m.v)
                // s.rate(m.v)
              },
            },
          )
          .to(
            m,
            {
              v: 0.2,
              // r: 1,
              duration: 0.35,
              repeat: 2,
              yoyo: true,
              ease: 'sine.inOut',
              onUpdate() {
                s.volume(m.v)
                s2.volume(m.v)
                // s.rate(m.v)
              },
            },
          )
      })
      .set(experience.params, { speed: 70 })
      .to(experience.params, {
        speed: 5,
        duration: 3.5,
        ease: 'power4.inOut',
      })
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: -8,
          duration: 0.3,
          ease: 'power4.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uRho,
        {
          value: 70,
          duration: 0,
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uBeta,
        {
          value: 2.316,
          duration: 0.1,
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: 20,
          duration: 0,
          ease: 'power4.out',
        },
        '<',
      )
      .to(attractor.bufferMaterial.uniforms.uSigma, {
        value: -8,
        duration: 0.5,
        ease: 'power4.out',
      })

    const posTL = gsap
      .timeline()
      .to(
        attractor.points.position,
        {
          x: -16.4,
          y: 16.8,
          z: -45,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          x: 0.207345115136926,
          y: 0.439822971502571,
          z: 1.90380514807541,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )

    return gsap.timeline({ onComplete, paused: true }).add(uniTL).add(posTL, '<')
  },
}
