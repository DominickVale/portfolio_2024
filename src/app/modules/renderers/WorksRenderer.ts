import { $, $all, isMobile, setupSvgText } from '../../utils'
import { PROJECTS_LIST } from '../../constants'
import { radToDeg } from 'three/src/math/MathUtils.js'
import gsap from 'gsap'
import * as taxi from '@dominickvale/taxi'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { workDetailsTL } from '../animations/gsap'
import { WorksPageAttractorAnim } from '../animations/attractor/WorksPageAttractor'

type ProjectListItem = typeof PROJECTS_LIST[number];

type ProjectElement = {
  element: HTMLElement;
} & ProjectListItem;

export default class WorksRenderer extends BaseRenderer {
  currIdx: number
  projects: Record<string, ProjectElement> = {}
  pIds: string[]
  experience: Experience
  static enterTL: gsap.core.Timeline
  isFirstRender: boolean
  canChange: boolean
  handleActiveProjectBound: (event: UIEvent) => void
  lastTouchY: number
  handleTouchStartBound: (event: UIEvent) => void

  initialLoad() {
    super.initialLoad()
  }

  onEnter() {
    super.onEnter()
    this.isFirstRender = true
    // user can change active/highlighted element. Resets on transitions complete
    this.canChange = false
    // run after the new content has been added to the Taxi container
    this.currIdx = 0
    // make this coherent...
    this.isDesktop = !(isMobile() || window.innerWidth < 1024)
    this.projects = {}
    this.pIds = []
    this.lastTouchY = 0

    BaseRenderer.resizeHandlers.push(this.handleResize.bind(this))

    this.handleActiveProjectBound = this.handleActiveProject.bind(this)
    this.handleTouchStartBound = this.handleTouchStart.bind(this)

    window.addEventListener('wheel', this.handleActiveProjectBound)
    window.addEventListener('touchstart', this.handleTouchStart.bind(this))
    $('#works-list-mobile').addEventListener('touchmove', this.handleActiveProjectBound)
    const workImage = $('#works-image')
    workImage.addEventListener('click', this.navigateToProject.bind(this))

    this.experience = new Experience()

    if (window.app.preloaderFinished) {
      this.prepareAnimations()
    } else {
      window.addEventListener('preload-end', this.prepareAnimations.bind(this))
    }
  }

  onEnterCompleted() {
    // run after the transition.onEnter has fully completed
  }

  onLeave() {
    // run before the transition.onLeave method is called
    window.removeEventListener('wheel', this.handleActiveProjectBound)
    window.removeEventListener('touchstart', this.handleTouchStartBound)
    window.removeEventListener('touchmove', this.handleActiveProjectBound)
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
  }

  ////////////////////////////////

  navigateToProject() {
    window.app.taxi.navigateTo(PROJECTS_LIST[this.currIdx].linkCase)
    window.app.audio.play(null, 'vibration-click', {
      volume: 0.3
    })
  }

  recalculateActive() {
    const resources = this.experience.resources.items
    const activeProject = this.projects[this.currIdx]
    const highlightCorner = ($('.highlighted-corner', activeProject.element) as HTMLElement);

    ($('#mobile-read-btn') as HTMLAnchorElement).href = activeProject.linkCase;
    ($('#mobile-visit-btn') as HTMLAnchorElement).href = activeProject.linkWebsite;

    highlightCorner.classList.remove('hidden')
    activeProject.element.setAttribute('data-active', 'true')

    if (!this.isFirstRender) {
      const planeMatUni = this.experience.world.worksImage.planeMat.uniforms
      //can't change el while transitioning
      this.canChange = false
      const activeImage = resources[activeProject.image].file
      planeMatUni.uNextTexture.value = activeImage
      this.experience.world.worksImage.currentTexture = activeImage
      planeMatUni.uProgress.value = 0.0
      const tl = gsap.timeline()
      tl.to(planeMatUni.uProgress, {
        value: 1,
        duration: 0.25,
        ease: 'power4.inOut',
        onComplete: () => {
          planeMatUni.uTexture.value = activeImage
          this.canChange = true
        },
      })
        .to(
          planeMatUni.uStrength,
          {
            value: window.app.reducedMotion ? 0.2 : 0.4,
            duration: 0.09,
            ease: 'power4.out',
          },
          '<',
        )
        .to(planeMatUni.uStrength, {
          value: 0,
          duration: 0.09,
          ease: 'power4.in',
        })
      window.app.audio.play(null, 'hover-1', {
        rate: 1,
        volume: 0.2,
      })
    }

    if (this.isDesktop) {
      const p = activeProject.element
      const line = $('.dynamic-line', p)
      const horizontalLine = $('.line', p)
      const horizontalLineWidth = horizontalLine.clientWidth
      const workImage = $('#works-image')
      const element1 = p
      const element2 = $('.fui-corners', workImage)

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

  recalculateInactiveElement(el: HTMLElement, idx?: number) {
    el.setAttribute('data-active', 'false')
    const i = idx || Number(el.getAttribute('data-i'))

    const newScale = 1 / Math.max(1, Math.abs(i - this.currIdx) + 1 / this.pIds.length)
    const svg = $('svg', el)
    gsap.to(svg, {
      scale: newScale,
      duration: window.app.reducedMotion ? 0.1 : 0.45,
      ease: 'power4.out',
    })
    const blur = Math.pow(Math.abs(i - this.currIdx), 2)
    gsap.to(el, {
      opacity: i === this.currIdx ? 1 : 0.5,
      filter: `blur(${blur}px)`,
      duration: 0.45,
      ease: 'power4.out',
    })
    if (i !== this.currIdx) {
      const highlightCorner = $('.highlighted-corner', el)
      gsap.to(highlightCorner, {
        opacity: 0,
        duration: 0.03,
        repeat: 3,
        onComplete: () => {
          highlightCorner.classList.add('hidden')
        },
      })
    }
  }

  recalculateOthers() {
    this.pIds.forEach((id, i) => {
      const p = this.projects[id]
      this.recalculateInactiveElement(p.element, i)
    })
  }

  setupProjectTitles() {
    $all(this.isDesktop ? '.project-title' : '.project-title-mobile').forEach((p, i) => {
      setupSvgText(p, this.isDesktop)
      p.addEventListener('mouseover', (e) => {
        e.stopPropagation()
        gsap.to(e.currentTarget, {
          opacity: 0.9,
          duration: 0.35,
          ease: 'power4.inOut',
        })
      })
      p.addEventListener('mouseout', (e) => {
        this.recalculateInactiveElement(e.currentTarget as HTMLElement)
      })
      const onFocus = (e: MouseEvent) => {
        e.preventDefault()
        const el = e.currentTarget as HTMLElement
        const i = Number(el.getAttribute('data-i'))
        if (i === this.currIdx) {
          this.navigateToProject()
        } else {
          this.currIdx = i
          this.handleActiveProject(null)
        }
      }
      p.addEventListener('focus', onFocus)
      p.addEventListener('mousedown', onFocus)

      this.projects[i] = {
        element: p,
        ...PROJECTS_LIST[i],
      }
    })
  }

  updateProjectDetails() {
    const activeProject = PROJECTS_LIST[this.currIdx]
    Object.keys(activeProject.data).forEach((field, i) => {
      const value = activeProject.data[field]
      const el = $(`${this.isDesktop ? '.work-details' : '.work-details-mobile'} .work-details-${field}`)
      if (!el) return
      const tl = gsap
        .timeline()
        .to(
          el,
          {
            typewrite: {
              charClass: 'text-primary-lightest drop-shadow-glow',
              maxScrambleChars: 3,
              soundOptions: {
                volume: 0.25,
              },
              value,
            },
            duration: 1.5,
            delay: i / 20,
            ease: 'power4.out',
          },
          '<',
        )
        .to(el, { opacity: 1, duration: 0.15, ease: 'power4.inOut' }, '<')
    })
  }

  handleTouchStart(e) {
    if (e.touches.length > 0) {
      this.lastTouchY = e.touches[0].clientY
    }
  }

  handleActiveProject(e) {
    let direction: 'up' | 'down'
    if (!this.canChange) return

    if (typeof e?.deltaY !== 'undefined') {
      // Wheel event
      direction = e.deltaY > 0 ? 'down' : 'up'
    } else if (e?.touches && e?.touches.length > 0) {
      // Touch event
      const currentTouchY = e.touches[0].clientY
      direction = currentTouchY > this.lastTouchY ? 'up' : 'down'
      this.lastTouchY = currentTouchY
    }

    if (direction === 'down') {
      this.currIdx = (this.currIdx + 1) % this.pIds.length
    } else if (e) {
      this.currIdx = this.currIdx - 1
      this.currIdx = this.currIdx < 0 ? this.pIds.length - 1 : this.currIdx
    }
    // if direction !== down and e is null, just update the entries

    this.updateProjectDetails()
    this.recalculateOthers()
    this.recalculateActive()
    this.fuiCornersAnimationActive()
  }

  handleResize() {
    this.isDesktop = !(isMobile() || window.innerWidth < 1024)
    const projectTitleQuery = this.isDesktop ? '.project-title' : '.project-title-mobile'

    gsap.to(`${projectTitleQuery} svg`, {
      opacity: 1,
      duration: 0.05,
      ease: 'linear',
      stagger: {
        repeat: 20,
        each: 0.1,
        ease: 'expo.in',
      },
    })

    this.updateProjectDetails()
    workDetailsTL(this.isDesktop ? '.works-details' : '.work-details-mobile')
    this.setupProjectTitles()
    this.recalculateOthers()
    this.recalculateActive()
    this.fuiCornersAnimationActive()
    if (!this.isFirstRender) this.experience.world.worksImage.resize()
  }

  fuiCornersAnimationActive() {
    const fuiCornersTl = gsap.timeline({})
    const base = `.project-title${this.isDesktop ? '' : '-mobile'}[data-active="true"] .fui-corners`
    fuiCornersTl.to(base, {
      opacity: 1,
      duration: 0.065,
      repeat: window.app.reducedMotion ? 1 : 6,
    })
  }

  ////////   ANIMS   ////////

  prepareAnimations() {
    this.setupProjectTitles()
    this.pIds = Object.keys(this.projects)
    this.recalculateOthers()
    this.recalculateActive()

    if (!this.experience.resources.items[this.projects[this.currIdx].image]?.file) {
      this.experience.resources.on('ready', this.animateIn.bind(this))
    } else {
      this.animateIn()
    }
  }

  animateIn() {
    this.experience.world.worksImage.show()
    this.experience.world.worksImage.setImage(this.experience.resources.items[this.projects[this.currIdx].image]?.file)
    this.createEnterAnim()
    WorksRenderer.enterTL.play()
  }

  createEnterAnim() {
    const workImage = $('#works-image')
    const projectTitleQuery = this.isDesktop ? '.project-title' : '.project-title-mobile'

    WorksRenderer.enterTL = gsap.timeline({
      delay: 1,
      paused: true,
      onComplete: () => {
        this.updateProjectDetails()
      },
    })

    WorksRenderer.enterTL
      .to(
        this.experience.world.worksImage.planeMat.uniforms.uOpacity,
        {
          value: 1.0,
          duration: window.app.reducedMotion ? 1 : 0,
          ease: 'power4.inOut',
        },
        '<',
      )
      .to(this.experience.world.worksImage.planeMat.uniforms.uStrength, {
        value: 0.1,
        duration: 2.5,
        ease: 'power4.inOut',
        onComplete: () => {
          this.isFirstRender = false
        },
      })
      .to(
        workImage,
        {
          opacity: 1,
          duration: 0.35,
          ease: 'power4.out',
        },
        '<',
      )
      .to(
        `${projectTitleQuery} svg`,
        {
          onComplete: () => {
            this.canChange = true
          },
          opacity: 1,
          duration: window.app.reducedMotion ? 1 : 0.05,
          ease: 'linear',
          stagger: {
            repeat: window.app.reducedMotion ? 0 : 20,
            each: 0.1,
            ease: 'expo.in',
          },
        },
        '<',
      )
      .add(this.fuiCornersAnimationActive.bind(this), '<+50%')
      .to(
        '.work-details',
        {
          opacity: 1,
          duration: 0.35,
          ease: 'power4.out',
        },
        '<+50%',
      )
      .add(workDetailsTL('.work-details-mobile'), '<')
      .from(['#mobile-read-btn', '#mobile-visit-btn'], {
        opacity: 0,
        duration: 0.06,
        repeat: 8,
        stagger: 0.01
      }, "<+20%")
  }
}
