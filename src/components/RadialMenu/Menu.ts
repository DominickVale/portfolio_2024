import type { Vec2 } from '../../app/types'
import { $, $all, TAU, clamp, degToRad, mag } from '../../app/utils'

type RadialMenuOptions = {
  innerRadiusPercent?: number
  gap?: number
  labelsPosFactor?: number
  position?: Vec2
}

const SVGNS = 'http://www.w3.org/2000/svg'
const bgColor = 'var(--bg-radial-02)'

export default class Menu {
  private _radius: number
  private _centralAngle: number
  private _size: string
  private _position: Vec2

  private _shape: HTMLElement
  private _wrapper: HTMLElement
  private _bgs: HTMLElement[]
  private _thumb: HTMLElement
  private _wrapperBounds: DOMRect
  private _thumbBounds: DOMRect

  items: NodeListOf<HTMLElement>
  innerRadiusPercent: number
  gap: number
  innerRadius: number

  constructor(
    public id: string,
    {
      innerRadiusPercent = 35,
      gap = 8,
      position = { x: 0, y: 0 },
    }: RadialMenuOptions = {},
  ) {
    this.innerRadiusPercent = innerRadiusPercent
    this.gap = gap
    this._position = position
    this._bgs = []

    console.info(`Creating radial menu ${id}`, this)

    this._wrapper = $(`#${id}`)

    if (!this._wrapper)
      throw new Error(
        `Radial menu with ID "${id}" not found! \n Did you include <RadialMenu id="${id}">?`,
      )
    this.items = $all(`.radial-menu-item`, this._wrapper)
    this._thumb = $('.radial-menu-thumb', this._wrapper)
    window.addEventListener('mousemove', this.handleThumb.bind(this))

    this._size = this._wrapper.style.getPropertyValue('--size')
    this._shape = $(`.radial-menu-shape`, this._wrapper)
    this.recalculateBounds()
    this.create()
  }

  recalculateBounds() {
    if (!this._wrapper) throw new Error(`No root element for menu ${this.id}`)
    const menuBounds = this._shape.getBoundingClientRect()
    this._wrapperBounds = this._wrapper.getBoundingClientRect()
    this._thumbBounds = this._thumb.getBoundingClientRect()

    this._wrapper.style.setProperty('--pos-x', this._position.x + 'px')
    this._wrapper.style.setProperty('--pos-y', this._position.y + 'px')

    this._radius = menuBounds.width / 2
    this.innerRadius = (this._radius * this.innerRadiusPercent) / 100
    this._centralAngle = 360 / this.items.length
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
    this.items.forEach((_, i) => {
      const startAngle = i * sliceAngle + TAU / 4
      const endAngle = startAngle + sliceAngle

      const menuItemAngleRad = startAngle + sliceAngle / 2
      const menuItemPosFactor =
        this._radius / 2 + (this._radius * this.innerRadiusPercent) / 100 / 2
      const menuItemPos = {
        x: Math.cos(menuItemAngleRad) * menuItemPosFactor + this._radius,
        y: Math.sin(menuItemAngleRad) * menuItemPosFactor + this._radius,
      }

      const menuItemEl = $all('.radial-menu-item', this._wrapper)[ i ] as HTMLElement
      const existingBg = $(`[data-i="${i}"]`, this._shape)
      const menuItemBg = existingBg || document.createElement('div')
      menuItemBg.setAttribute('id', `radial-menu-bg-${this.id}-${i}`)
      menuItemBg.setAttribute('class', 'radial-menu-item-bg')

      menuItemEl.style.setProperty('--x', menuItemPos.x + 'px')
      menuItemEl.style.setProperty('--y', menuItemPos.y + 'px')
      menuItemEl.setAttribute('data-i', i.toString())
      menuItemEl.setAttribute('data-x', menuItemPos.x.toString())
      menuItemEl.setAttribute('data-y', menuItemPos.y.toString())

      const existingSlice = $(`[data-i="${i}"]`, this._shape)
      const slice = existingSlice || document.createElementNS(SVGNS, 'path')
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

      this._shape.appendChild(slice)

      const maskId = `radial-menu-mask-${this.id}-${i}`;
       // MASK
      const defs = $('defs', this._shape) || document.createElementNS(SVGNS, 'defs');
      //@ts-ignore
      const mask = $(`${maskId}`, defs) || document.createElementNS(SVGNS, 'mask');

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

  set size(size: string) {
    this._wrapper.style.setProperty('--size', size)
    this._size = size
    this.recalculateBounds()
    this.create()
  }

  set position(pos: Vec2) {
    this._position = pos
    this.recalculateBounds()
  }

  onSliceClick(ev: MouseEvent) {
    console.log('CLICK! Add sound here')
  }
  onSliceMouseEnter(ev: MouseEvent) {
    const slice = ev.currentTarget as SVGElement
    const i = slice.getAttribute('data-i')
    const item = this.items[i]
    item.setAttribute('data-hover', 'true')
  }
  onSliceMouseLeave(ev: MouseEvent) {
    const slice = ev.currentTarget as SVGElement
    const i = slice.getAttribute('data-i')
    const item = this.items[i]
    item.setAttribute('data-hover', 'false')
  }

  /*
   * @TODO: bigger thumb, callback on progress 120%
   */
  handleThumb(ev: MouseEvent) {
    const x = ev.clientX
    const y = ev.clientY

    const rel = {
      x: x - this._position.x,
      y: y - this._position.y,
    }

    const distance = Math.sqrt(rel.x ** 2 + rel.y ** 2)
    const innerRadiusBound = this.innerRadius - this._thumbBounds.width / 2

    const clampedDistance = clamp(distance, 0, innerRadiusBound)
    const newX = (this._radius + (rel.x / distance) * clampedDistance) || this._radius
    const newY = (this._radius + (rel.y / distance) * clampedDistance) || this._radius

    const progress = distance / ( this._radius + this.innerRadius ) * 100

    let closest = {
      id: -1,
      distance: Infinity,
    }
    if (clampedDistance >= innerRadiusBound) {
      this.items.forEach((item, i) => {
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
      this.items[closest.id].setAttribute('data-highlighted', 'true')
      this._shape.children[closest.id].setAttribute('data-highlighted', 'true')
      this._bgs[closest.id].setAttribute('data-highlighted', 'true')
      this._bgs[closest.id].style.setProperty('--progress', progress + '%')
    } else {
      this.items.forEach((item, i) => {
        item.setAttribute('data-highlighted', 'false')
        this._shape.children[i].setAttribute('data-highlighted', 'false')
        this._bgs[i].setAttribute('data-highlighted', 'false')
      })
    }

    this._thumb.style.setProperty('--x', newX + 'px')
    this._thumb.style.setProperty('--y', newY + 'px')
  }
}
