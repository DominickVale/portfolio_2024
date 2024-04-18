import { ICON_IDS } from './constants'
import type { Vec2 } from './types'
import { $, $all, TAU, clamp, degToRad, mag } from './utils'

type RadialMenuOptions = {
  innerRadiusPercent?: number
  gap?: number
  labelsPosFactor?: number
  position?: Vec2
  isMobile?: boolean
}

export type RadialMenuItem = {
  id?: string
  iconId: typeof ICON_IDS[number]
  label: string
  position?: number
  callback: (event: MouseEvent, target: HTMLElement, originalTarget: HTMLElement) => void
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

  itemsEl: HTMLElement[]
  innerRadiusPercent: number
  gap: number
  innerRadius: number
  innerRadiusBound: number
  shown: boolean
  isMobile: boolean
  currTarget: HTMLElement | null

  constructor(
    public id: string,
    public items: RadialMenuItem[],
    {
      innerRadiusPercent = 35,
      gap = 8,
      position = { x: 0, y: 0 },
      isMobile = false
    }: RadialMenuOptions = {},
  ) {
    this.shown = false
    this.isMobile = isMobile
    this.innerRadiusPercent = innerRadiusPercent
    this.gap = gap
    this._position = position
    this._bgs = []

    // console.info(`Creating radial menu ${id}`, this)

    this._wrapper = $(`#${id}`)
    if (!this._wrapper)
      throw new Error(
        `Radial menu with ID "${id}" not found! \n Did you include <RadialMenu id="${id}">?`,
      )
    this._menuElContainer = $(`.radial-menu`, this._wrapper)
    this._thumb = $(`#radial-menu-thumb-${this.id}`, this._wrapper)
    window.addEventListener('mousemove', this.handleMouseMove.bind(this))
    window.addEventListener('keyup', this.handleKeyboard.bind(this))
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true, })
    window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true, })
    this._thumb.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
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
    if(this.isMobile){
      this._position ={
        x: this._wrapperBounds.x + this._wrapperBounds.width / 2,
        y: this._wrapperBounds.y + this._wrapperBounds.height / 2,
      }
    }
    this._thumbBounds = this._thumb.getBoundingClientRect()


    this._wrapper.style.setProperty('--pos-x', this._position.x + 'px')
    this._wrapper.style.setProperty('--pos-y', this._position.y + 'px')

    this._radius = menuBounds.width / 2
    this.innerRadius = (this._radius * this.innerRadiusPercent) / 100
    this._centralAngle = ( this.isMobile ? 180 : 360 ) / this.itemsEl.length
    this.innerRadiusBound = this.innerRadius - this._thumbBounds.width / 2
  }

  populateItems() {
    const orderedItems = this.items.sort((a, b) => a.position - b.position)
    this.itemsEl = orderedItems.map(( item, i ) => {
      const existingItem = $(`.radial-menu-item[data-i="${item.id}"]`, this._wrapper)
      if(!existingItem){
        const menuEl = document.createElement('li')
        menuEl.setAttribute('class', 'radial-menu-item')
        menuEl.setAttribute('data-i', i.toString())
        menuEl.setAttribute('id', item.id)

        const iq = $( `#_icon_${item.iconId}`)
        if(!iq) throw new Error(`Icon with ID "${item.iconId}" not found!\nAvailable icons: ` + JSON.stringify(ICON_IDS))
        const icon = iq.cloneNode(true)

        const span = document.createElement('span');
        span.classList.add('radial-menu-item-label');
        span.innerHTML = item.label

        menuEl.appendChild(icon);
        menuEl.appendChild(span);
        menuEl.addEventListener('click', item.callback.bind(this))
        this._menuElContainer.appendChild(menuEl);
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
    const maskPathData: string[] = []

    this._shape.setAttribute(
      'viewBox',
      `0 0 ${this._radius * 2} ${this._radius * 2}`,
    )
    this.itemsEl.forEach((_, i) => {
      const startAngle = i * sliceAngle + (this.isMobile ? Math.PI : TAU / 4)
      const endAngle = startAngle + sliceAngle

      const menuItemAngleRad = startAngle + sliceAngle / 2
      const menuItemPosFactor =
        this._radius / 2 + (this._radius * this.innerRadiusPercent) / 100 / 2
      const menuItemPos = {
        x: Math.cos(menuItemAngleRad) * menuItemPosFactor + this._radius,
        y: Math.sin(menuItemAngleRad) * menuItemPosFactor + this._radius,
      }

      const menuItemEl = this.itemsEl[ i ] as HTMLElement
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

      const innerStartX =
        center + innerRadius * Math.cos(startAngle + innerGapRad)
      const innerStartY =
        center + innerRadius * Math.sin(startAngle + innerGapRad)
      const innerEndX = center + innerRadius * Math.cos(endAngle - innerGapRad)
      const innerEndY = center + innerRadius * Math.sin(endAngle - innerGapRad)

      const pathData = `M ${outerStartX} ${outerStartY}
                      A ${this._radius} ${this._radius} 0 0 1 ${outerEndX} ${outerEndY}
                      L ${innerEndX} ${innerEndY}
                      A ${innerRadius} ${innerRadius} 0 0 0 ${innerStartX} ${innerStartY}
                      Z`

      maskPathData.push(pathData)
      slice.setAttribute('d', pathData)
      slice.style.cursor = 'pointer'
      slice.addEventListener('mouseenter', this.onSliceMouseEnter.bind(this))
      slice.addEventListener('mouseup', this.onSliceClick.bind(this))
      slice.addEventListener('mouseleave', this.onSliceMouseLeave.bind(this))
      slice.addEventListener('touchstart', this.onSliceClick.bind(this))

      this._shape.appendChild(slice)

      const maskId = `radial-menu-mask-${this.id}-${i}`;
       // MASK
      const defs = $('defs', this._shape) ?? document.createElementNS(SVGNS, 'defs');
      const mask = $(`${maskId}`, defs  as HTMLElement) ?? document.createElementNS(SVGNS, 'mask');

      mask.setAttribute('id', maskId);
      mask.setAttribute('viewBox', `0 0 ${this._radius * 2} ${this._radius * 2}`);

      const gapPath = document.createElementNS(SVGNS, 'path');
      gapPath.setAttribute('fill', 'white');
      gapPath.setAttribute('d', pathData);

      mask.appendChild(gapPath);
      defs.appendChild(mask);
      this._shape.appendChild(defs);

      menuItemBg.style.setProperty('--mask', `url(#${maskId})`)
      // menuItemBg.style.setProperty('--mask', `url(#${maskId})`)
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

    this.itemsEl.forEach(el => {
      const itemIndex = Number(el.dataset.i)
      const itemCallback = this.items[itemIndex].callback

      const callbackWrapper = (event: MouseEvent) => {
        itemCallback(event, el, this.currTarget)
      }

      el.removeEventListener('click', callbackWrapper)
      el.remove()
    })

    this._bgs.forEach(bg => bg.remove())

    Array.from(this._shape.children).forEach(child => {
      if (child.tagName === 'path') {
        child.removeEventListener('mouseenter', this.onSliceMouseEnter)
        child.removeEventListener('mouseup', this.onSliceClick)
        child.removeEventListener('mouseleave', this.onSliceMouseLeave)
        child.removeEventListener('touchstart', this.onSliceClick)
      }
      child.remove()
    })
  }

  open(x: number, y:number, target: HTMLElement) {
    this.position = { x, y }
    this.shown = true
    this._wrapper.classList.remove('radial-menu-hidden')
    this._thumb.classList.add('pressed')
    this.currTarget = target
  }

  close() {
    console.log("Closed")
    this.currTarget = null;
    this.shown = false;
    this._wrapper.classList.add('radial-menu-hidden');
    this._thumb.style.setProperty('--x', '50%');
    this._thumb.style.setProperty('--y', '50%');
    this._thumb.classList.remove('pressed')
    const i = this._lastActiveSliceId;
    if(typeof i !== 'number') return;
    this.itemsEl[i].setAttribute('data-highlighted', 'false');
    this._shape.children[i].setAttribute('data-highlighted', 'false');
    this._bgs[i].setAttribute('data-highlighted', 'false');
  }

  set size(size: string) {
    this._wrapper.style.setProperty('--size', size)
    this.recalculateBounds()
    this.create()
  }

  set position(pos: Vec2) {
    this._position = pos
    this.recalculateBounds()
  }

  onSliceActivate(id: number, target:HTMLElement, ev: Event){
    this.items[id]?.callback?.call(this, ev, target, this.currTarget)
  }

  onSliceClick(ev: MouseEvent) {
    console.log('CLICK! Add sound here')
    const slice = ev.currentTarget as SVGElement
    const i = slice.getAttribute('data-i')
    this.onSliceActivate(Number(i), ev.target as HTMLElement, ev)
    this.close()
  }
  onSliceMouseEnter(ev: MouseEvent) {
    const slice = ev.currentTarget as SVGElement
    const i = slice.getAttribute('data-i')
    const item = this.itemsEl[i]
    item.setAttribute('data-hover', 'true')
  }
  onSliceMouseLeave(ev: MouseEvent) {
    const slice = ev.currentTarget as SVGElement
    const i = slice.getAttribute('data-i')
    const item = this.itemsEl[i]
    item.setAttribute('data-hover', 'false')
  }

  handleKeyboard(ev: KeyboardEvent) {
    if(!this.shown) return

    if (ev.key === 'Escape') {
      this.close()
    }
  }

  handleClickInside(ev: MouseEvent) {
    if(this.isMobile) return
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
    this.handleThumb({x,y}, ev)
  }

  handleMouseDown(ev: MouseEvent) {
    ev.preventDefault()
    if(this.shown) {
      this.close()
      return
    }
    this.open(this._position.x, this._position.y, this.currTarget)
  }

  handleTouchStart(ev: TouchEvent) {
    const el = ev.currentTarget as HTMLElement
    if(!el.getAttribute('data-menu-trigger') && el !== this._thumb) return
    this._thumb.classList.add('pressed')
    this.open(this._position.x, this._position.y, this.currTarget)
  }

  handleTouchMove(ev: TouchEvent) {
    ev.stopPropagation()
    const touch = ev.targetTouches[0]
    const x = touch.clientX
    const y = touch.clientY
    this.handleThumb({x,y}, ev)
  }

  handleTouchEnd(ev: TouchEvent) {
    this.close()
    this._thumb.classList.remove('pressed')
  }

  handleThumb(pos: Vec2, ev: TouchEvent | MouseEvent) {
    if(!this.shown) return
    const { x, y } = pos

    const rel = {
      x: x - this._position.x,
      y: y - this._position.y,
    }

    const distance = Math.sqrt(rel.x ** 2 + rel.y ** 2)

    const clampedDistance = clamp(distance, 0, this.innerRadiusBound)
    const newX = (this._radius + (rel.x / distance) * clampedDistance) || this._radius
    const newY = (this._radius + (rel.y / distance) * clampedDistance) || this._radius

    const progress = distance / ( this._radius + this.innerRadius ) * 100

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
        const distanceFromItem = Math.sqrt(
          (itemPos.x - newX) ** 2 + (itemPos.y - newY) ** 2,
        )
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
      this.itemsEl[closest.id].setAttribute('data-highlighted', 'true')
      this._shape.children[closest.id].setAttribute('data-highlighted', 'true')
      this._bgs[closest.id].setAttribute('data-highlighted', 'true')
      this._bgs[closest.id].style.setProperty('--progress', progress + '%')
      this._lastActiveSliceId = closest.id
      if(progress> 72 && this.shown){
        this.onSliceActivate(closest.id, ev.target as HTMLElement, ev)
        this.close()
        return
      }
    } else {
      this.itemsEl.forEach((item, i) => {
        item.setAttribute('data-highlighted', 'false')
        this._shape.children[i].setAttribute('data-highlighted', 'false')
        this._bgs[i].setAttribute('data-highlighted', 'false')
      })
    }

    this._thumb.style.setProperty('--x', newX + 'px')
    this._thumb.style.setProperty('--y', newY + 'px')
  }
}
