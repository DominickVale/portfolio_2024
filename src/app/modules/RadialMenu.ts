import { ICON_IDS } from '../constants'
import type { Vec2 } from '../types'
import { $, $all, TAU, clamp, debounce, debounceTrailing, degToRad, mag } from '../utils'
import TextScramble from './animations/TextScramble'
import gsap from 'gsap'
import { resetGsapProps } from './animations/gsap'

type RadialMenuOptions = {
  innerRadiusPercent?: number
  gap?: number
  labelsPosFactor?: number
  position?: Vec2
  isMobile?: boolean
  size?: string
}

export type RadialMenuItem = {
  id?: string
  iconId: (typeof ICON_IDS)[number]
  label: string
  position?: number
  callback: (event: MouseEvent, target: HTMLElement, originalTarget: HTMLElement) => void
  hoverCallback: () => void
}

const SVGNS = 'http://www.w3.org/2000/svg'

export default class RadialMenu {
  private _radius: number
  private _centralAngle: number
  private _position: Vec2

  private _shape: HTMLElement
  private _wrapper: HTMLElement
  private _menuElContainer: HTMLElement
  private _bgs: HTMLElement[]
  private _thumb: HTMLElement
  private _wrapperBounds: DOMRect
  private _thumbBounds: DOMRect
  private _lastActiveSliceId: number
  private _size: string

  private _thumbLock: boolean

  id: string
  itemsEl: HTMLElement[]
  innerRadiusPercent: number
  gap: number
  innerRadius: number
  innerRadiusBound: number
  shown: boolean
  isMobile: boolean
  currTarget: HTMLElement | null
  canChange: any

  constructor(
    id: string,
    public items: RadialMenuItem[],
    { innerRadiusPercent = 40, gap = 8, position = { x: 0, y: 0 }, isMobile = false, size }: RadialMenuOptions = {},
  ) {
    this.id = id
    this.shown = false
    this.isMobile = isMobile
    this.innerRadiusPercent = innerRadiusPercent
    this.gap = gap
    this._position = position
    this._bgs = []
    this._size = size || (this.isMobile ? 'calc(8rem + 50vw)' : 'calc(10rem + 10vw)')
    this.canChange = true

    this.createWrapper()

    this._menuElContainer = $(`.radial-menu`, this._wrapper)
    this._thumb = $(`#radial-menu-thumb-${id}`, this._wrapper)
    window.addEventListener('mousemove', this.handleMouseMove.bind(this))
    window.addEventListener('keyup', this.handleKeyboard.bind(this))
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true })
    window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true })
    this._thumb.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true })
    this._thumb.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this._wrapper.addEventListener('click', this.handleClickInside.bind(this))

    this._shape = $(`.radial-menu-shape`, this._wrapper)
    this.populateItems()
    this.recalculateBounds()
    this.create()
  }

  recalculateBounds() {
    if (!this._wrapper) throw new Error(`No root element for menu ${this.id}`)
    const menuBounds = this._shape.getBoundingClientRect()
    this._wrapperBounds = this._wrapper.getBoundingClientRect()
    if (this.isMobile) {
      this._position = {
        x: this._wrapperBounds.x + this._wrapperBounds.width / 2,
        y: this._wrapperBounds.y + this._wrapperBounds.height / 2,
      }
    }
    this._thumbBounds = this._thumb.getBoundingClientRect()

    this._wrapper.style.setProperty('--pos-x', this._position.x + 'px')
    this._wrapper.style.setProperty('--pos-y', this._position.y + 'px')

    this._radius = menuBounds.width / 2
    this.innerRadius = (this._radius * this.innerRadiusPercent) / 100
    this._centralAngle = (this.isMobile ? 180 : 360) / this.itemsEl.length
    this.innerRadiusBound = this.innerRadius - this._thumbBounds.width / 2
    // Force a reflow because firefox
    void this._wrapper.offsetHeight
  }

  createWrapper() {
    const wrapper = document.createElement('div')
    wrapper.id = 'radial-menu-' + this.id
    wrapper.classList.add('radial-menu-wrapper', 'radial-menu-hidden', this.isMobile && 'mobile')
    wrapper.style.setProperty('--size', this._size)
    const thumbWrapperSize = this.isMobile ? "2.5rem" : "4rem"
    const thumbSize = this.isMobile ? 18 : 30
    wrapper.innerHTML = `
  <ul class="radial-menu cursor-none" aria-hidden="true">
    <div id="radial-menu-thumb-${this.id}" class="${`radial-menu-thumb ${this.isMobile && 'mobile'}`}" style="--size:${thumbWrapperSize}">
      <svg id="_icon_brand" width="${thumbSize}" height="${thumbSize}" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M4.85049 0.25L3.05916 4.60453L0.606445 3.59555L7.99953 16.4008V15H10.9995V16.4031L18.54 3.34255L15.4646 4.60768L13.672 0.25H4.85049ZM9.00038 9.00011H10.0004V7.00011H9.00038V9.00011ZM7.65734 12.1614L6.97414 12.5559L3.17747 5.97985L3.86066 5.58541L7.65734 12.1614ZM14.9383 5.50311L15.7975 5.99913L12.0008 12.5752L11.1416 12.0791L14.9383 5.50311Z" fill="#363636"/>
      </svg>
    </div>
    <svg class="radial-menu-shape" width="${this._size}" height="${this._size}">
      <defs class="pointer-events-none"><mask width="${this._size}" height="${this._size}"></mask></defs>
    </svg>
  </ul>
  <div class="radial-menu-bgs cursor-none"></div>
`
    document.body.append(wrapper)
    this._wrapper = wrapper
  }

  populateItems() {
    const orderedItems = this.items.sort((a, b) => a.position - b.position)
    this.itemsEl = orderedItems.map((item, i) => {
      const existingItem = $(`.radial-menu-item[data-i="${item.id}"]`, this._wrapper)
      if (!existingItem) {
        const menuEl = document.createElement('li')
        menuEl.setAttribute('class', 'radial-menu-item')
        menuEl.setAttribute('data-i', i.toString())
        menuEl.setAttribute('id', item.id)

        const iq = $(`#_icon_${item.iconId}`)
        if (!iq) throw new Error(`Icon with ID "${item.iconId}" not found!\nAvailable icons: ` + JSON.stringify(ICON_IDS))
        const icon = iq.cloneNode(true)

        const span = document.createElement('span')
        span.classList.add('radial-menu-item-label')
        span.innerHTML = item.label
        span.setAttribute('data-text-scramble', item.label)
        // span.setAttribute('data-text-scramble-audio', 'typing volume:0.1 rate:1.25')

        menuEl.appendChild(icon)
        menuEl.appendChild(span)
        menuEl.addEventListener('click', item.callback.bind(this))
        this._menuElContainer.appendChild(menuEl)
        return menuEl as HTMLElement
      }
      return existingItem as HTMLElement
    })
  }

  create() {
    const innerRadius = (this._radius * this.innerRadiusPercent) / 100
    const center = this._radius
    const gapRad = degToRad(this.gap / 10)
    const sliceAngle = degToRad(this._centralAngle)

    this._shape.setAttribute('viewBox', `0 0 ${this._radius * 2} ${this._radius * 2}`)
    this.itemsEl.forEach((_, i) => {
      const startAngle = i * sliceAngle + (this.isMobile ? Math.PI : TAU / 4)
      const endAngle = startAngle + sliceAngle

      const menuItemAngleRad = startAngle + sliceAngle / 2
      const menuItemPosFactor = this._radius / 2 + (this._radius * this.innerRadiusPercent) / 100 / 2
      const menuItemPos = {
        x: Math.cos(menuItemAngleRad) * menuItemPosFactor + this._radius,
        y: Math.sin(menuItemAngleRad) * menuItemPosFactor + this._radius,
      }

      const menuItemEl = this.itemsEl[i] as HTMLElement
      const existingBg = $(`[data-i="${i}"]`, this._shape)
      const menuItemBg = existingBg ?? document.createElement('div')
      menuItemBg.setAttribute('id', `radial-menu-bg-${this.id}-${i}`)
      menuItemBg.setAttribute('class', 'radial-menu-item-bg')

      menuItemEl.style.setProperty('--x', menuItemPos.x + 'px')
      menuItemEl.style.setProperty('--y', menuItemPos.y + 'px')
      menuItemEl.setAttribute('data-x', menuItemPos.x.toString())
      menuItemEl.setAttribute('data-y', menuItemPos.y.toString())

      const existingSlice = $(`[data-i="${i}"]`, this._shape)
      const slice = existingSlice ?? document.createElementNS(SVGNS, 'path')
      slice.setAttribute('id', `radial-menu-slice-${i}`)
      slice.setAttribute('fill', 'transparent')
      slice.setAttribute('data-i', i.toString())

      const radiusesRatio = this._radius / innerRadius
      const innerGapRad = degToRad((this.gap / 10) * radiusesRatio)
      const outerStartX = center + this._radius * Math.cos(startAngle + gapRad)
      const outerStartY = center + this._radius * Math.sin(startAngle + gapRad)
      const outerEndX = center + this._radius * Math.cos(endAngle - gapRad)
      const outerEndY = center + this._radius * Math.sin(endAngle - gapRad)

      const innerStartX = center + innerRadius * Math.cos(startAngle + innerGapRad)
      const innerStartY = center + innerRadius * Math.sin(startAngle + innerGapRad)
      const innerEndX = center + innerRadius * Math.cos(endAngle - innerGapRad)
      const innerEndY = center + innerRadius * Math.sin(endAngle - innerGapRad)

      const pathData = `M ${outerStartX} ${outerStartY}
                      A ${this._radius} ${this._radius} 0 0 1 ${outerEndX} ${outerEndY}
                      L ${innerEndX || 0} ${innerEndY || 0}
                      A ${innerRadius} ${innerRadius} 0 0 0 ${innerStartX || 0} ${innerStartY || 0}
                      Z`

      slice.setAttribute('d', pathData)
      slice.style.cursor = 'none'
      slice.addEventListener('mouseenter', this.onSliceMouseEnter.bind(this))
      slice.addEventListener('mouseup', this.onSliceClick.bind(this))
      slice.addEventListener('mouseleave', this.onSliceMouseLeave.bind(this))
      slice.addEventListener('touchstart', this.onSliceClick.bind(this))

      // The slice is only used for mouse events. It does not affect the visible shape of the menu.
      this._shape.appendChild(slice)

      const clipPathId = `radial-menu-clip-${this.id}-${i}`
      const defs = $('defs', this._shape) ?? document.createElementNS(SVGNS, 'defs')
      const clipPath = $(`#${clipPathId}`, defs as HTMLElement) ?? document.createElementNS(SVGNS, 'clipPath')

      clipPath.setAttribute('id', clipPathId)

      const clipPathPath = document.createElementNS(SVGNS, 'path')
      clipPathPath.setAttribute('d', pathData)

      clipPath.appendChild(clipPathPath)
      defs.appendChild(clipPath)
      this._shape.appendChild(defs)

      menuItemBg.style.setProperty('--clip-path', `url(#${clipPathId})`)
      $('.radial-menu-bgs', this._wrapper).appendChild(menuItemBg)
      this._bgs.push(menuItemBg)
    })
  }

  destroy() {
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('keyup', this.handleKeyboard)
    window.removeEventListener('touchmove', this.handleTouchMove)
    window.removeEventListener('touchend', this.handleTouchEnd)
    this._thumb.removeEventListener('touchstart', this.handleTouchStart)
    this._thumb.removeEventListener('mousedown', this.handleMouseDown)
    this._wrapper.removeEventListener('click', this.handleClickInside)

    this.itemsEl.forEach((el) => {
      const itemIndex = Number(el.dataset.i)
      const itemCallback = this.items[itemIndex].callback

      const callbackWrapper = (event: MouseEvent) => {
        itemCallback(event, el, this.currTarget)
      }

      el.removeEventListener('click', callbackWrapper)
      el.remove()
    })

    this._bgs.forEach((bg) => bg.remove())

    Array.from(this._shape.children).forEach((child) => {
      if (child.tagName === 'path') {
        child.removeEventListener('mouseenter', this.onSliceMouseEnter)
        child.removeEventListener('mouseup', this.onSliceClick)
        child.removeEventListener('mouseleave', this.onSliceMouseLeave)
        child.removeEventListener('touchstart', this.onSliceClick)
      }
      child.remove()
    })
    this._wrapper.remove()
  }

  open(x: number, y: number, target: HTMLElement) {
    this.position = { x, y }
    this.shown = true
    this._wrapper.classList.remove('radial-menu-hidden')
    this._thumb.classList.add('pressed')
    this.currTarget = target

    if (window.app.reducedMotion || this.isMobile) {
      gsap.timeline({}).fromTo(
        this._wrapper,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.25,
          onComplete: resetGsapProps,
        },
        '<',
      )
    } else {
      const slicesTL = gsap
        .timeline()
        .from('#' + this._wrapper.id + ' .radial-menu .radial-menu-item', {
          opacity: 0,
          duration: 0.05,
          repeat: 12,
          onComplete: resetGsapProps,
        })
        .from(
          '#' + this._wrapper.id + ' .radial-menu-bgs div',
          {
            scale: 0.75,
            duration: 0.1,
            stagger: 0.08,
            onComplete: resetGsapProps,
          },
          '<+20%',
        )

      gsap
        .timeline({})
        .add(slicesTL)
        .from(
          this._wrapper,
          {
            scale: 0,
            duration: 0.25,
            ease: 'power4.inOut',
            onComplete: resetGsapProps,
          },
          '<',
        )
        .fromTo(
          this._wrapper,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: 0.06,
            repeat: 6,
            onComplete: resetGsapProps,
          },
          '<',
        )
        .fromTo(
          this._menuElContainer,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: 0.06,
            repeat: 6,
            onComplete: resetGsapProps,
          },
          '<+50%',
        )
    }
  }

  close() {
    const itemS = '#' + this._wrapper.id + ' .radial-menu .radial-menu-item'
    const bgItemS = '#' + this._wrapper.id + ' .radial-menu-bgs div'
    const cb = () => {
      this.currTarget = null
      this.shown = false
      this._wrapper.classList.add('radial-menu-hidden')
      this._thumb.style.setProperty('--x', '50%')
      this._thumb.style.setProperty('--y', '50%')
      this._thumb.classList.remove('pressed')
      const i = this._lastActiveSliceId
      if (typeof i === 'number' && this.itemsEl[i]) {
        this.itemsEl[i].setAttribute('data-highlighted', 'false')
        this._shape.children[i].setAttribute('data-highlighted', 'false')
        this._bgs[i].setAttribute('data-highlighted', 'false')
      }
      this.canChange = true
    }

    const slicesTL = gsap.timeline({
      onComplete: function () {
        resetGsapProps.bind(this)
        cb()
      },
    })

    // if(!this.isMobile){
    //   slicesTL.to(itemS, {
    //     opacity: 0,
    //     duration: 0.25,
    //   })
    //   slicesTL.to(
    //     bgItemS,
    //     {
    //       opacity: 0,
    //       duration: 0.25,
    //     },
    //     '<',
    //   )
    //
    // }
  }

  set size(size: string) {
    this._size = size
    this._wrapper.style.setProperty('--size', size)
    this.recalculateBounds()
    this.create()
  }

  set position(pos: Vec2) {
    this._position = pos
    this.recalculateBounds()
  }

  onSliceActivate(id: number, target: HTMLElement, ev: Event) {
    this.items[id]?.callback?.call(this, ev, target, this.currTarget)
    window.app.audio.play(null, 'vibration-click', {
      volume: 0.2,
      rate: gsap.utils.random(1.3, 1.5),
    })
  }

  onSliceClick(ev: MouseEvent) {
    const slice = ev.currentTarget as SVGElement
    const i = slice.getAttribute('data-i')
    this.onSliceActivate(Number(i), ev.target as HTMLElement, ev)
    this.close()
  }
  onSliceMouseEnter(ev: MouseEvent) {
    const slice = ev.currentTarget as SVGElement
    const i = Number(slice.getAttribute('data-i'))
    const itemEl = this.itemsEl[i]
    const item = this.items[i]
    itemEl.setAttribute('data-hover', 'true')
    if (item.hoverCallback) item.hoverCallback()
  }
  onSliceMouseLeave(ev: MouseEvent) {
    const slice = ev.currentTarget as SVGElement
    const i = slice.getAttribute('data-i')
    const item = this.itemsEl[i]
    item.setAttribute('data-hover', 'false')
  }

  handleKeyboard(ev: KeyboardEvent) {
    if (!this.shown) return

    if (ev.key === 'Escape') {
      this.close()
    }
  }

  handleClickInside(ev: MouseEvent) {
    if (this.isMobile) return
    const x = ev.clientX
    const y = ev.clientY
    const rel = {
      x: x - this._position.x,
      y: y - this._position.y,
    }
    const distance = Math.sqrt(rel.x ** 2 + rel.y ** 2)
    if (distance < this.innerRadius) {
      this.close()
    }
  }

  handleMouseMove(ev: MouseEvent) {
    const x = ev.clientX
    const y = ev.clientY
    this.handleThumb({ x, y }, ev)
  }

  handleMouseDown(ev: MouseEvent) {
    ev.preventDefault()
    if (this.shown) {
      this.close()
      return
    }
    this.open(this._position.x, this._position.y, this.currTarget)
  }

  handleTouchStart(ev: TouchEvent) {
    const el = ev.currentTarget as HTMLElement
    if (!el.getAttribute('data-menu-trigger') && el !== this._thumb) return
    this._thumb.classList.add('pressed')
    this.open(this._position.x, this._position.y, this.currTarget)
    const t = setTimeout(() => {
      clearTimeout(t)
      this._thumbLock = true
    }, 400)
  }

  handleTouchMove(ev: TouchEvent) {
    ev.stopPropagation()
    const touch = ev.targetTouches[0]
    const x = touch.clientX
    const y = touch.clientY
    this.handleThumb({ x, y }, ev)
    this._thumbLock = false
  }

  handleTouchEnd(ev: TouchEvent) {
    if (this.shown && !this._thumbLock) {
      this.close()
      this._thumb.classList.remove('pressed')
    } else {
      this._thumbLock = false
    }
  }

  handleThumb(pos: Vec2, ev: TouchEvent | MouseEvent) {
    if (!this.shown) return
    const { x, y } = pos

    const rel = {
      x: x - this._position.x,
      y: y - this._position.y,
    }

    const distance = Math.sqrt(rel.x ** 2 + rel.y ** 2)

    const clampedDistance = clamp(distance, 0, this.innerRadiusBound)
    const newX = this._radius + (rel.x / distance) * clampedDistance || this._radius
    const newY = this._radius + (rel.y / distance) * clampedDistance || this._radius

    const progress = (distance / (this._radius + this.innerRadius)) * 100

    let closest = {
      id: -1,
      distance: Infinity,
    }
    if (clampedDistance >= this.innerRadiusBound) {
      //@TODO: find a more performant approach
      this.itemsEl.forEach((item, i) => {
        const itemPos = {
          x: Number(item.getAttribute('data-x')),
          y: Number(item.getAttribute('data-y')),
        }
        const distanceFromItem = Math.sqrt((itemPos.x - newX) ** 2 + (itemPos.y - newY) ** 2)
        if (distanceFromItem < closest.distance) {
          closest = {
            id: i,
            distance: distanceFromItem,
          }
        }
        item.setAttribute('data-highlighted', 'false')
        this._shape.children[i].setAttribute('data-highlighted', 'false')
        this._bgs[i].setAttribute('data-highlighted', 'false')
      })
      const closestEl = this.itemsEl[closest.id]
      closestEl.setAttribute('data-highlighted', 'true')
      this._shape.children[closest.id].setAttribute('data-highlighted', 'true')
      this._bgs[closest.id].setAttribute('data-highlighted', 'true')
      this._bgs[closest.id].style.setProperty('--progress', progress + '%')

      if (this._lastActiveSliceId !== closest.id) {
        const label = $('.radial-menu-item-label', closestEl)
        TextScramble.scramble(label)
        window.app.audio.play(null, 'hover-1', {
          volume: 0.2,
          rate: 1.5,
        })
      }
      this._lastActiveSliceId = closest.id

      if (progress > 72 && this.shown) {
        if (!this.canChange) return
        this.canChange = false
        this.onSliceActivate(closest.id, ev.target as HTMLElement, ev)
        this.close()
        return
      }
    } else {
      this.itemsEl.forEach((item, i) => {
        item.setAttribute('data-highlighted', 'false')
        this._shape.children[i].setAttribute('data-highlighted', 'false')
        this._bgs[i].setAttribute('data-highlighted', 'false')
        this._lastActiveSliceId = -1
      })
    }

    this._thumb.style.setProperty('--x', newX + 'px')
    this._thumb.style.setProperty('--y', newY + 'px')
  }
}
