import { Renderer } from '@unseenco/taxi'
import gsap from 'gsap'
import { $all, $ } from '../../utils'

export default class BaseRenderer extends Renderer {
  navLinks: HTMLAnchorElement[]
  initialLoad(): void {
    this.navLinks = Array.from($all('nav li a')) as HTMLAnchorElement[]
    $('#navbar').addEventListener('click', (e) => {
      const clickedEl = e.target as HTMLElement
      if (clickedEl.parentElement.classList.contains('nav-link')) {
        this.navLinks.forEach((link) => {
          link.classList.remove('active')
        })
        clickedEl.classList.add('active')
      }
    })

    const currentUrl = window.location.href
    this.navLinks.forEach((link) => {
      if (link.href === currentUrl) {
        link.classList.add('active')
      } else {
        link.classList.remove('active')
      }
    })

    const enterTL = gsap.timeline({}).from(this.navLinks, {
      opacity: 0,
      duration: 0.08,
      ease: 'elastic.in',
      stagger: {
        repeat: 10,
        each: 0.12,
      },
    })
  }
  onEnter() {
    // run after the new content has been added to the Taxi container
    console.log('renderer onEnter')
  }

  onEnterCompleted() {
    // run after the transition.onEnter has fully completed
    console.log('renderer onEnterCompleted')
  }

  onLeave() {
    // run before the transition.onLeave method is called
    console.log('renderer onLeave')
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
    console.log('renderer onLeaveCompleted')
  }
}
