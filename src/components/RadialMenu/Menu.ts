import type { Vec2 } from '../../app/types'
import { $, $all, TAU, degToRad } from '../../app/utils'

type RadialMenuOptions = {
  innerRadiusPercent?: number
  gap?: number
  labelsPosFactor?: number
  position?: Vec2
}

const SVGNS = "http://www.w3.org/2000/svg";
const bgColor = 'var(--bg-radial-02)'
const hoverColor =  'white'

export default class Menu {
  private _radius: number
  private _centralAngle: number
  private _size: string
  private _position: Vec2

  private _shape: HTMLElement
  private _wrapper: HTMLElement
  private _bg: HTMLElement
  private _thumb: HTMLElement

  private _thumbPos: Vec2

  items: NodeListOf<HTMLElement>
  innerRadiusPercent: number
  gap: number

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

    console.info(`Creating radial menu ${id}`, this)

    this._wrapper = $(`#${id}`)

    if (!this._wrapper)
      throw new Error(
        `Radial menu with ID "${id}" not found! \n Did you include <RadialMenu id="${id}">?`,
      )
    this.items = $all(`.radial-menu-item`, this._wrapper)
    this._bg = $('.radial-menu-bg', this._wrapper)
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
    const thumbBounds = this._thumb.getBoundingClientRect()
    this._thumbPos = {
      x: thumbBounds.right + window.pageXOffset,
      y: thumbBounds.top + window.pageYOffset
    }

    this._wrapper.style.setProperty('--pos-x', this._position.x + "px")
    this._wrapper.style.setProperty('--pos-y', this._position.y + "px")

    this._radius = menuBounds.width / 2
    this._centralAngle = 360 / this.items.length
  }

  create() {
    const innerRadius = this._radius * this.innerRadiusPercent / 100
    const center = this._radius
    const gapRad = degToRad(this.gap / 10)
    const sliceAngle = degToRad(this._centralAngle)
    const maskPathData: string[] = []

    this._shape.setAttribute('viewBox', `0 0 ${this._radius * 2} ${this._radius * 2}`)
    this.items.forEach((aaa, i) => {
      const startAngle = ( i * sliceAngle) + TAU / 4
      const endAngle = startAngle + sliceAngle

      const menuItemAngleRad = startAngle + sliceAngle / 2
      const menuItemPosFactor = (this._radius / 2) + (this._radius * this.innerRadiusPercent / 100) / 2
      const menuItemPos = {
        x:
          Math.cos(menuItemAngleRad) * menuItemPosFactor + this._radius,
        y:
         Math.sin(menuItemAngleRad) * menuItemPosFactor + this._radius,
      }

      const menuItemEl = $all('.radial-menu-item', this._wrapper)[i] as HTMLElement
      menuItemEl.style.setProperty('--x', menuItemPos.x + 'px')
      menuItemEl.style.setProperty('--y', menuItemPos.y + 'px')
      menuItemEl.setAttribute('data-i', i.toString())


      const existingSlice = $(`[data-i="${i}"]`, this._shape)
      const slice = existingSlice || document.createElementNS(SVGNS, "path");
      slice.setAttribute('fill', bgColor)
      slice.setAttribute('data-i', i.toString())

      const radiusesRatio = this._radius / innerRadius
      const innerGapRad = degToRad(( this.gap / 10 ) * radiusesRatio )
      const outerStartX = center + (this._radius * Math.cos(startAngle + gapRad))
      const outerStartY = center + (this._radius * Math.sin(startAngle + gapRad))
      const outerEndX = center + (this._radius * Math.cos(endAngle - gapRad))
      const outerEndY = center + (this._radius * Math.sin(endAngle - gapRad))

      const innerStartX = center + (innerRadius * Math.cos(startAngle + innerGapRad))
      const innerStartY = center + (innerRadius * Math.sin(startAngle + innerGapRad))
      const innerEndX = center + (innerRadius * Math.cos(endAngle - innerGapRad))
      const innerEndY = center + (innerRadius * Math.sin(endAngle - innerGapRad))

      const pathData = `M ${outerStartX } ${outerStartY}
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
    })

    // MASK
    const maskPath = maskPathData.join(" ")

    const defs = $('defs', this._shape)
    const mask = $('mask', defs)
    const maskId =  `radial-menu-mask-${this.id}`
    mask.setAttribute('id', maskId)
    mask.setAttribute("viewBox", `0 0 ${this._radius * 2} ${this._radius * 2}`);

    const existingGapPath = $(`path`, mask)
    const gapPath = existingGapPath || document.createElementNS(SVGNS, "path");
    gapPath.setAttribute("fill", "white");
    gapPath.setAttribute("d", maskPath);
    mask.appendChild(gapPath);
    defs.appendChild(mask);
    this._shape.appendChild(defs);
    this._bg.style.setProperty('--mask', `url(#${maskId})`)
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
    console.log("CLICK! Add sound here")
  }
  onSliceMouseEnter(ev: MouseEvent) {
    const slice = ev.currentTarget as SVGElement;
    const i = slice.getAttribute('data-i')
    const item = this.items[i]
    item.setAttribute('data-hover', 'true')
  }
  onSliceMouseLeave(ev: MouseEvent) {
    const slice = ev.currentTarget as SVGElement;
    const i = slice.getAttribute('data-i')
    const item = this.items[i]
    item.setAttribute('data-hover', 'false')
  }

  handleThumb(ev: MouseEvent) {
    const x = ev.clientX
    const y = ev.clientY
//wip
    const newX = x
    const newY = y
    this._thumb.style.setProperty('--x', newX + 'px')
    this._thumb.style.setProperty('--y', newY + 'px')
  }
}
