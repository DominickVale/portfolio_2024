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
  private _skew: number
  private _size: string
  private _position: Vec2

  private _shape: HTMLElement
  private _wrapper: HTMLElement
  private _bg: HTMLElement

  slices: NodeListOf<HTMLElement>
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

    console.info(`Creating radial menu ${id},\n
      innerRadiusPercent: ${this.innerRadiusPercent},\n
      gap: ${this.gap},\n
      `)

    this.slices = $all(`#${id} .radial-menu-item`)

    this._wrapper = $(`#${id}`)
    this._bg = $('.radial-menu-bg', this._wrapper)
    if (!this._wrapper)
      throw new Error(
        `Radial menu with ID "${id}" not found! \n Did you include <RadialMenu id="${id}">?`,
      )
    this._size = this._wrapper.style.getPropertyValue('--size')
    this._shape = $(`.radial-menu-shape`, this._wrapper)
    this.calculateSize()
    this.create()
  }

  calculateSize() {
    if (!this._wrapper) throw new Error(`No root element for menu ${this.id}`)
    const menuBounds = this._shape.getBoundingClientRect()

    this._radius = menuBounds.width / 2
    this._centralAngle = 360 / this.slices.length
    this._skew = 90 - this._centralAngle
  }

  create() {
    const menuCenter = this._radius
    this._wrapper.style.setProperty('--pos-x', this._position.x + "px")
    this._wrapper.style.setProperty('--pos-y', this._position.y + "px")

    this._shape.setAttribute('width', '100%')
    this._shape.setAttribute('height', '100%')
    this._shape.setAttribute('viewBox', `0 0 ${this._radius * 2} ${this._radius * 2}`)

    const gapRad = degToRad(this.gap / 10)
    const sliceAngle = ( TAU / this.slices.length )

    const INNER_RADIUS = this._radius * this.innerRadiusPercent / 100

    const maskPathData: string[] = []
    this.slices.forEach((_, i) => {
      const startAngle = ( i * sliceAngle) + TAU / 4
      const endAngle = ( startAngle + sliceAngle )

      const labelAngleRad = startAngle + sliceAngle / 2
      const labelsFactor = (this._radius / 2) + (this._radius * this.innerRadiusPercent / 100) / 2
      const labelPosition = {
        x:
          Math.cos(labelAngleRad) * labelsFactor + this._radius,
        y:
         Math.sin(labelAngleRad) * labelsFactor + this._radius,
      }

      const sliceButton = this._wrapper.querySelectorAll('.radial-menu-item')[i] as HTMLElement
      sliceButton.style.setProperty('--x', labelPosition.x + 'px')
      sliceButton.style.setProperty('--y', labelPosition.y + 'px')
      const slice = document.createElementNS(SVGNS, "path");
      slice.setAttribute('fill', bgColor)

      const radiusesRatio = this._radius / INNER_RADIUS
      const innerGapRad = degToRad(( this.gap / 10 ) * radiusesRatio )
      const outerStartX = menuCenter + (this._radius * Math.cos(startAngle + gapRad))
      const outerStartY = menuCenter + (this._radius * Math.sin(startAngle + gapRad))
      const outerEndX = menuCenter + (this._radius * Math.cos(endAngle - gapRad))
      const outerEndY = menuCenter + (this._radius * Math.sin(endAngle - gapRad))

      const innerStartX = menuCenter + (INNER_RADIUS * Math.cos(startAngle + innerGapRad))
      const innerStartY = menuCenter + (INNER_RADIUS * Math.sin(startAngle + innerGapRad))
      const innerEndX = menuCenter + (INNER_RADIUS * Math.cos(endAngle - innerGapRad))
      const innerEndY = menuCenter + (INNER_RADIUS * Math.sin(endAngle - innerGapRad))

      const pathData = `M ${outerStartX } ${outerStartY}
                      A ${this._radius} ${this._radius} 0 0 1 ${outerEndX} ${outerEndY}
                      L ${innerEndX} ${innerEndY}
                      A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${innerStartX} ${innerStartY}
                      Z`

      maskPathData.push(pathData)
      slice.setAttribute('d', pathData)
      slice.style.cursor = 'pointer'
      slice.addEventListener('mouseenter', () =>
        slice.setAttribute('fill', hoverColor),
      )
      slice.addEventListener('mouseleave', () =>
        slice.setAttribute('fill', bgColor),
      )

      this._shape.appendChild(slice)
    })

    // MASK
    //
    const maskPath = maskPathData.join(" ")

    const defs = $('defs', this._shape)
    const mask = $('mask', defs)
    const maskId =  `radial-menu-mask-${this.id}`
    mask.setAttribute('id', maskId)
    mask.setAttribute("viewBox", `0 0 ${this._radius * 2} ${this._radius * 2}`);

    const gapPath = document.createElementNS(SVGNS, "path");
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
    console.log(`Recreating with size: ${this._size}...`)
    this.calculateSize()
    this.create()
  }

  set position(pos: Vec2) {
    this._position = pos
    this.calculateSize()
    this.create()
  }
}
