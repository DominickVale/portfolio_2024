import { $, $all, debounce, fitTextToContainer } from '../../utils'
import { PROJECTS_LIST } from '../../constants'
import { radToDeg } from 'three/src/math/MathUtils.js'
import Typewriter from '../../modules/animations/Typewriter'
import gsap from 'gsap'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'

export default class WorksRenderer extends BaseRenderer {
  currIdx: number
  isDesktop: boolean
  projects: Record<string, { element: HTMLElement; fontSize: number }>
  pIds: string[]
  experience: Experience
  debouncedHandleActiveFn: Function
  debouncedHandleResizeFn: Function
  onWheelBound: (event: WheelEvent) => void;
  onResizeBound: (event: UIEvent) => void;
  tl: gsap.core.Timeline

  initialLoad() {
    super.initialLoad()
    this.onEnter()
    this.onEnterCompleted()
  }

  onEnter() {
    super.onEnter()
    // run after the new content has been added to the Taxi container
     this.currIdx = 0
     this.isDesktop = window.innerWidth > 1024
     this.projects = {}
     this.pIds = []

    this.debouncedHandleActiveFn = debounce(this.handleActiveProject.bind(this), 200)
    this.debouncedHandleResizeFn = debounce(this.handleResize.bind(this), 200)

    this.onWheelBound = this.onWheel.bind(this);
    this.onResizeBound = this.onResize.bind(this);

    window.addEventListener('wheel', this.onWheelBound);
    window.addEventListener('resize', this.onResizeBound);
    this.experience = new Experience()
  }

  onEnterCompleted() {
    // run after the transition.onEnter has fully completed
    this.recalculateBaseFontSizes()
    this.pIds = Object.keys(this.projects)
    this.recalculateOthers()
    this.recalculateActive()

    this.tl = gsap.timeline()
    this.tl.to('.project-title span', {
      opacity: 1,
      duration: 0.05,
      ease: 'linear',
      stagger: {
        repeat: 20,
        each: 0.1,
        ease: 'expo.in',
      },
    })
      .to('#works-image', {
        opacity: 1,
        duration: 0.35,
        ease: 'power4.out',
        onComplete: () => {
          this.experience.world.worksImage.show()
        }
      }, "<+50%")
      .add(this.fuiCornersAnimationActive, '<')
      .to('.work-details', {
        opacity: 1,
        duration: 0.35,
        ease: 'power4.out',
      })
      .then(() => {
        this.updateProjectDetails()
      })
  }

  onLeave() {
    // run before the transition.onLeave method is called
    window.removeEventListener('wheel', this.onWheelBound);
    window.removeEventListener('resize', this.onResizeBound);
    this.experience.world.worksImage.hide()
    this.tl?.kill()
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
  }

  ////////////////////////////////
onWheel(...args) {
  this.debouncedHandleActiveFn(...args);
}

onResize(...args) {
  this.debouncedHandleResizeFn(...args);
}

  recalculateActive() {
    const activeProject = this.projects[this.currIdx]
    const highlightCorner = $('.highlighted-corner', activeProject.element)
    highlightCorner.classList.remove('hidden')
    activeProject.element.setAttribute('data-active', 'true')
    activeProject.element.setAttribute('data-', 'true')
    activeProject.element.style.fontSize =
      this.projects[this.currIdx].fontSize + 'px'

    if (this.isDesktop) {
      const p = activeProject.element
      const line = $('.dynamic-line', p)
      const horizontalLine = $('.line', p)
      const horizontalLineWidth = horizontalLine.clientWidth
      const element1 = p
      const element2 = $('#works-image .fui-corners')

      const element1Rect = element1.getBoundingClientRect()
      const element2Rect = element2.getBoundingClientRect()

      const x1 = element1Rect.left - horizontalLineWidth * 1.3
      const y1 = element1Rect.top + element1Rect.height / 2
      const x2 = element2Rect.left + element2Rect.width
      const y2 = element2Rect.top + element2Rect.height / 2

      const dx = x2 - x1
      const dy = y2 - y1

      const angle = radToDeg(Math.atan2(dy, dx))
      line.style.transform = `rotate(${angle}deg)`

      const distance = Math.sqrt(dx * dx + dy * dy)
      line.style.width = `${distance}px`
    }
  }

  recalculateOthers() {
    this.pIds.forEach((id, i) => {
      const p = this.projects[id]
      p.element.setAttribute('data-active', 'false')
      const newFontSize =
        this.projects[i].fontSize /
        Math.max(1, Math.abs(i - this.currIdx) + 1 / this.pIds.length)
      const blur = Math.pow(Math.abs(i - this.currIdx), 2)
      gsap.to(p.element, {
        opacity: i === this.currIdx ? 1 : 0.5,
        filter: `blur(${blur}px)`,
        duration: 0.45,
        ease: 'power4.out',
      })
      gsap.to(p.element.children[0], {
        fontSize: newFontSize,
        duration: 0.8,
        ease: 'power4.out',
      })
      if (i !== this.currIdx) {
        const highlightCorner = $('.highlighted-corner', p.element)
        gsap.to(highlightCorner, {
          opacity: 0,
          duration: 0.03,
          repeat: 3,
          onComplete: () => {
            highlightCorner.classList.add('hidden')
          },
        })
      }
    })
  }

  recalculateBaseFontSizes() {
    $all(this.isDesktop ? '.project-title' : '.project-title-mobile').forEach(
      (p, i) => {
        const innerText = $('span', p)
        const newFontSize = fitTextToContainer(
          innerText,
          p,
          window.innerWidth * 0.003,
        )
        this.projects[i] = {
          element: p,
          fontSize: newFontSize,
        }
      },
    )
  }

  updateProjectDetails() {
    const activeProject = PROJECTS_LIST[this.currIdx]
    const roleEls = $all('.work-details-role')
    roleEls.forEach((r) => {
      Typewriter.typewrite(r, activeProject.data.role)
    })
    const clientEls = $all('.work-details-client')
    clientEls.forEach((r) => {
      Typewriter.typewrite(r, activeProject.data.client)
    })
    const yearEls = $all('.work-details-year')
    yearEls.forEach((r) => {
      Typewriter.typewrite(r, activeProject.data.year)
    })
    const techEls = $all('.work-details-tech')
    techEls.forEach((r) => {
      Typewriter.typewrite(r, activeProject.data.tech)
    })
  }

  handleActiveProject(e) {
    if (typeof e.deltaY !== 'undefined') {
      const direction = e.deltaY > 0 ? 'down' : 'up'
      if (direction === 'down') {
        this.currIdx = (this.currIdx + 1) % this.pIds.length
      } else {
        this.currIdx = this.currIdx - 1
        this.currIdx = this.currIdx < 0 ? this.pIds.length - 1 : this.currIdx
      }
    }
    this.updateProjectDetails()
    this.recalculateOthers()
    this.recalculateActive()
    this.fuiCornersAnimationActive()
  }

  handleResize() {
    this.isDesktop = window.innerWidth > 1024

    $all('.project-title').forEach((p, i) => {
      let newFontSize = p.clientHeight
      p.style.fontSize = newFontSize + 'px'
    })
    this.recalculateBaseFontSizes()
    this.recalculateOthers()
    this.recalculateActive()
  }

  fuiCornersAnimationActive() {
    const fuiCornersTl = gsap.timeline({})
    const base = '.project-title[data-active="true"] .fui-corners'
    fuiCornersTl.to(base, {
      opacity: 1,
      duration: 0.05,
      repeat: 6,
    })
  }
}
