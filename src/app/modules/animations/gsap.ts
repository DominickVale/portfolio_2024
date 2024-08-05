import { TITLE_REVEAL_SOUND_SPRITES } from 'src/app/constants'
import { $, splitTextChars } from '../../utils'
import gsap from 'gsap'

export function blurStagger(el: HTMLElement, duration?: number, delay?: number) {
  const split = splitTextChars(el, 'span')

  const lettersTLduration = duration || 0.1
  const lettersTL = gsap.timeline({ duration: lettersTLduration, delay: delay || 0.9 })
  const splitArr = Array.from(split)

  let remainingLetters = [...splitArr]
  splitArr.forEach((_, __, arr) => {
    //random letter
    const ri = Math.floor(Math.random() * remainingLetters.length)
    const rl = remainingLetters[ri]
    remainingLetters.splice(ri, 1)
    const randomDelay = Math.random() * lettersTLduration

    const blurTimeFactor = Math.max(Math.random(), 0.2)
    const ltl = gsap
      .timeline({ delay: randomDelay })
      .add(() => {
        window.app.audio.play(null, 'title-reveal', {
          volume: 0.3,
          rate: blurTimeFactor + 0.4,
          //@ts-ignore
          sprite: TITLE_REVEAL_SOUND_SPRITES,
        })
      }, "<")
      .fromTo(
        rl,
        { alpha: 0 },
        {
          alpha: 1,
          duration: window.app.reducedMotion ? 1 : 0.05,
          repeat: window.app.reducedMotion ? 0 : 20 * Math.random(),
        },
        '<',
      )
      .fromTo(
        rl,
        {
          filter: 'blur(10px)',
        },
        {
          duration: 2.5 * blurTimeFactor,
          ease: 'circ.inOut',
          filter: 'blur(0px)',
        },
        '<',
      )

    lettersTL.add(ltl, '<')
  })

  return lettersTL
}

export function workDetailsTL(imageSectionQuery: string) {
  function removeOpacity() {
    this.targets()[0]?.classList.remove('opacity-0')
  }

  const tl = gsap
    .timeline()
    .set(imageSectionQuery, { opacity: 1 })
    .fromTo(
      `${imageSectionQuery} th`,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.09,
        stagger: {
          repeat: 20,
          each: 0.1,
        },
      },
      '<+25%',
    )
    .to(
      `${imageSectionQuery} .work-details-role`,
      {
        onStart: removeOpacity,
        typewrite: {},
        duration: 1,
        ease: 'power4.out',
      },
      '<',
    )
    .to(
      `${imageSectionQuery} .work-details-client`,
      {
        onStart: removeOpacity,
        typewrite: {},
        duration: 1,
        ease: 'power4.out',
      },
      '<+20%',
    )
    .to(
      `${imageSectionQuery} .work-details-year`,
      {
        onStart: removeOpacity,
        typewrite: {},
        duration: 1,
        ease: 'power4.out',
      },
      '<+20%',
    )
    .to(
      `${imageSectionQuery} .work-details-tech`,
      {
        onStart: removeOpacity,
        typewrite: {},
        duration: 1.5,
        ease: 'power4.out',
      },
      '<+20%',
    )

  return tl
}
