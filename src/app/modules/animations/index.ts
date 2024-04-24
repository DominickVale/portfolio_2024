import gsap from 'gsap'
import { $all } from '../../utils'

type EvtListenersContainer<T extends HTMLElement> = Partial<
  Record<keyof HTMLElementEventMap, (ev: Event, el: T) => void>
>

function getMockAnimationEvents(el): EvtListenersContainer<HTMLDivElement> {
  const svgs = el.querySelectorAll('svg')

  const tl = gsap.timeline({
    paused: true,
    defaults: {
      ease: 'power4.inOut',
    },
  })

  tl.to(svgs, {
    opacity: 1,
    x: 2,
    stagger: 0.15,
    repeat: -1,
  })
  return {
    mouseenter: () => {
      tl.play()
    },
    mouseleave: () => {
      tl.pause()
    },
  }
}

function bindEvents(
  el: HTMLElement,
  container: EvtListenersContainer<HTMLElement>,
) {
  Object.entries(container).forEach(([key, value]) => {
    el.addEventListener(key, (ev) => value(ev, el))
  })
}

export default {
  init() {
    const nextPageBtns = Array.from($all('.next-page-btn')) as HTMLDivElement[]
    nextPageBtns.forEach((el) => {
      el.classList.add('opacity-0')
      setTimeout(() => {
        el.classList.remove('opacity-0')
        el.classList.add('animating')
      }, 5_000)
    })
    // nextPageBtns.forEach((el) => bindEvents(el, getMockAnimationEvents(el)))
  },
}
