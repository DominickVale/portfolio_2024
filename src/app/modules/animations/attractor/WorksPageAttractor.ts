import gsap from 'gsap'
import { isMobile as isMobileFn } from 'src/app/utils'

export const WorksPageAttractorAnim = {
  create(onComplete?: () => void) {
    const isMobile = isMobileFn()
    const isDesktop = !(isMobile || window.innerWidth < 1024)
    const experience = window.app.experience
    const attractor = experience.world.attractor
    const params = experience.params

    const pos = isMobile
      ? {
          x: -6,
          y: 20,
          z: -25,
        }
      : {
          x: isDesktop ? -55 : params.positionX - 20,
          y: params.positionY - 2,
          z: -22,
        }

    const uni = isMobile
      ? {
          sigma: -7,
        }
      : {
          sigma: -8,
        }

    const posTL = gsap
      .timeline()
      .add(() => {
        window.app.audio.play(null, 'whoosh-short', {
          volume: 0.15,
          pan: -0.5,
        })
      })
      .to(
        attractor.points.position,
        {
          ...pos,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          y: 0.565486677646163,
          z: -0.980176907920016,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )

    const uniTL = gsap
      .timeline()
      .add(() => {
        window.app.audio.play(null, 'shimmer-long', {
          volume: 0.05,
          rate: 1.35,
          pan: -0.5,
        })
      })
      .set(experience.params, { speed: 80 })
      .to(experience.params, {
        speed: 10,
        duration: 6,
        ease: 'attractor_speed',
      })
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: uni.sigma,
          duration: 0.8,
          ease: 'power2.out',
        },
        '<',
      )

    return gsap
      .timeline({ onComplete, paused: true })
      .to(experience.renderer.chromaticAberrationEffect.offset, {
        x: '0.002',
        y: '0.002',
        duration: 0.8,
      })
      .add(uniTL, '<')
      .add(posTL, '<+20%')
      .to(experience.renderer.chromaticAberrationEffect.offset, {
        x: 0,
        y: 0,
        duration: 4,
      })
  },
}
