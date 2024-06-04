import { $, $all, setupSvgText } from '../../utils'
import { PROJECTS_LIST } from '../../constants'
import { radToDeg } from 'three/src/math/MathUtils.js'
import gsap from 'gsap'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'

export default class WorksRenderer extends BaseRenderer {
  currIdx: number
  projects: Record<string, { element: HTMLElement; image: string }>
  pIds: string[]
  experience: Experience
  tl: gsap.core.Timeline
  isFirstRender: boolean
  canChange: boolean
  handleActiveProjectBound: (event: UIEvent) => void

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
    this.isDesktop = window.innerWidth > 1024
    this.projects = {}
    this.pIds = []
    BaseRenderer.resizeHandlers.push(this.handleResize.bind(this))

    this.handleActiveProjectBound = this.handleActiveProject.bind(this)

    window.addEventListener('wheel', this.handleActiveProjectBound)
    this.experience = new Experience()
  }

  revealImage() {
    this.experience.world.worksImage.show()
    this.experience.world.worksImage.setImage(this.experience.resources.items[this.projects[this.currIdx].image])
    const renderer = this.experience.renderer
    const params = this.experience.params
    const attractor = this.experience.world.attractor

    const attractorPosTl = gsap
      .timeline()
      .to(
        attractor.points.position,
        {
          x: params.positionX - 36.2,
          y: params.positionY - 2,
          z: params.positionZ + 8,
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
    const attractorUniformsTl = gsap
      .timeline()
      .to(
        params,
        {
          speed: 70,
          duration: 0.8,
          ease: 'power4.inOut',
          onComplete: () => {
            gsap.to(params, {
              speed: 20,
              duration: 1.5,
              ease: 'power2.in',
            })
          },
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: -8,
          duration: 0.01,
          ease: 'power2.out',
        },
        '<',
      )

    this.tl = gsap.timeline({
      onComplete: () => {
        this.updateProjectDetails()
      },
    })

    this.tl
      .add(attractorPosTl)
      .add(attractorUniformsTl, '<')
      .to('.project-title svg', {
        opacity: 1,
        duration: 0.05,
        ease: 'linear',
        stagger: {
          repeat: 20,
          each: 0.1,
          ease: 'expo.in',
        },
      })
      .to(
        renderer.textureEffect.blendMode.opacity,
        {
          value: 0,
          duration: 0.8,
          ease: 'circ.in',
        },
        '<',
      )
      .to(
        this.experience.world.worksImage.planeMat.uniforms.uStrength,
        {
          value: 0.1,
          duration: 2.5,
          ease: 'power4.inOut',
          onComplete: () => {
            this.isFirstRender = false
            this.canChange = true
          },
        },
        '<',
      )
      .to(
        '#works-image',
        {
          opacity: 1,
          duration: 0.35,
          ease: 'power4.out',
        },
        '<',
      )
      .add(this.fuiCornersAnimationActive, '<+50%')
      .to('.work-details', {
        opacity: 1,
        duration: 0.35,
        ease: 'power4.out',
      })
  }

  onEnterCompleted() {
    // run after the transition.onEnter has fully completed
    this.setupProjectTitles()
    this.pIds = Object.keys(this.projects)
    this.recalculateOthers()
    this.recalculateActive()

    if (this.experience.resources.isReady) {
      this.revealImage()
    } else {
      this.experience.resources.on('ready', this.revealImage.bind(this))
    }
  }

  onLeave() {
    // run before the transition.onLeave method is called
    window.removeEventListener('wheel', this.handleActiveProjectBound)
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
  }

  ////////////////////////////////

  recalculateActive() {
    const resources = this.experience.resources.items
    const activeProject = this.projects[this.currIdx]
    const highlightCorner = $('.highlighted-corner', activeProject.element)
    highlightCorner.classList.remove('hidden')
    activeProject.element.setAttribute('data-active', 'true')

    if (!this.isFirstRender) {
      const planeMatUni = this.experience.world.worksImage.planeMat.uniforms
      //can't change el while transitioning
      this.canChange = false
      planeMatUni.uNextTexture.value = resources[activeProject.image]
      planeMatUni.uProgress.value = 0.0
      const tl = gsap.timeline()
      tl.to(planeMatUni.uProgress, {
        value: 1,
        duration: 0.25,
        ease: 'power4.inOut',
        onComplete: () => {
          planeMatUni.uTexture.value = resources[activeProject.image]
          this.canChange = true
        },
      })
        .to(
          planeMatUni.uStrength,
          {
            value: 0.4,
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
    }

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
      const newScale = 1 / Math.max(1, Math.abs(i - this.currIdx) + 1 / this.pIds.length)
      const svg = $('svg', p.element)
      gsap.to(svg, {
        scale: newScale,
        duration: 0.45,
        ease: 'power4.out',
      })
      const blur = Math.pow(Math.abs(i - this.currIdx), 2)
      gsap.to(p.element, {
        opacity: i === this.currIdx ? 1 : 0.5,
        filter: `blur(${blur}px)`,
        duration: 0.45,
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

  setupProjectTitles() {
    $all(this.isDesktop ? '.project-title' : '.project-title-mobile').forEach((p, i) => {
      setupSvgText(p)
      this.projects[i] = {
        element: p,
        image: PROJECTS_LIST[i].image,
      }
    })
  }

  updateProjectDetails() {
    const activeProject = PROJECTS_LIST[this.currIdx]
    gsap.to('.work-details-role', {
      typewrite: {
        value: activeProject.data.role,
      },
      ease: 'power4.out',
    })
    gsap.to('.work-details-client', {
      typewrite: {
        value: activeProject.data.client,
      },
      duration: 1.5,
      ease: 'power4.out',
    })
    gsap.to('.work-details-year', {
      typewrite: {
        value: activeProject.data.year,
      },
      duration: 2,
      ease: 'power4.out',
    })
    gsap.to('.work-details-tech', {
      typewrite: {
        value: activeProject.data.tech,
      },
      duration: 1.5,
      ease: 'power4.out',
    })
  }

  handleActiveProject(e) {
    if (!this.canChange) return
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
    this.setupProjectTitles()
    this.recalculateOthers()
    this.recalculateActive()
  }

  fuiCornersAnimationActive() {
    const fuiCornersTl = gsap.timeline({})
    const base = '.project-title[data-active="true"] .fui-corners'
    fuiCornersTl.to(base, {
      opacity: 1,
      duration: 0.065,
      repeat: 6,
    })
  }
}
