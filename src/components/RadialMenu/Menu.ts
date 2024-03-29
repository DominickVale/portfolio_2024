import type { Vec2 } from '../../app/types'
import { $, $all, TAU, degToRad } from '../../app/utils'

type RadialMenuOptions = {
  innerRadius?: string
  gap?: string
  labelsPosFactor?: number
  position?: Vec2
}

export default class Menu {
  private _radius: number
  private _centralAngle: number
  private _skew: number
  private _size: string
  private _position: Vec2

  private _root: HTMLElement
  private _wrapper: HTMLElement

  slices: NodeListOf<HTMLElement>
  innerRadius: string
  gap: string
  labelsPosFactor: number

  constructor(
    public id: string,
    {
      innerRadius = '15%',
      gap = '-0.1rem',
      labelsPosFactor = 1.5,
      position = { x: 0, y: 0 },
    }: RadialMenuOptions = {},
  ) {
    this.innerRadius = innerRadius
    this.gap = gap
    this.labelsPosFactor = labelsPosFactor
    this._position = position

    console.info(`Creating radial menu ${id},\n
      innerRadius: ${this.innerRadius},\n
      gap: ${this.gap},\n
      labelsPosFactor: ${this.labelsPosFactor}`)

    this.slices = $all(`#${id} .radial-menu-item`)

    this._wrapper = $(`#${id}`)
    if (!this._wrapper)
      throw new Error(
        `Radial menu with ID "${id}" not found! \n Did you include <RadialMenu id="${id}">?`,
      )
    this._size = this._wrapper.style.getPropertyValue('--size')
    this._root = $(`#${id} .radial-menu`)
    this.calculateSize()
    this.create()
  }

  calculateSize() {
    if (!this._wrapper) throw new Error(`No root element for menu ${this.id}`)
    const menuBounds = this._root.getBoundingClientRect()

    this._radius = menuBounds.width/ 2
    this._centralAngle = 360 / this.slices.length
    this._skew = 90 - this._centralAngle
  }

  create() {
    this._wrapper.style.setProperty('--pos-x', this._position.x + "px")
    this._wrapper.style.setProperty('--pos-y', this._position.y + "px")
    this.slices.forEach((el, i, arr) => {
      const angleDeg = this._centralAngle * i - 90
      const labelAngleRad = degToRad(angleDeg - this._centralAngle / 2)
      const labelPosition = {
        x:
          Math.cos(labelAngleRad) * (this._radius / this.labelsPosFactor) + this._radius,
        y:
         -Math.sin(labelAngleRad) * (this._radius / this.labelsPosFactor) + this._radius,
      }
      const shapeEl = $('.radial-menu-item-shape', el) as HTMLElement
      const bgEl = $('.radial-menu-item-bg', el) as HTMLElement
      const labelEl = $('.radial-menu-item-label', el) as HTMLElement
      // just to be sure and save minutes debugging (:
      if (!shapeEl)
        throw new Error(
          `Radial menu shape not found for element ${i} with id ${this.id}`,
        )
      if (!bgEl)
        throw new Error(
          `Radial menu background not found for element ${i} with id ${this.id}`,
        )
      if (!labelEl)
        throw new Error(
          `Radial menu label not found for element ${i} with id ${this.id}`,
        )

      labelEl.style.setProperty('--x', labelPosition.x + 'px')
      labelEl.style.setProperty('--y', labelPosition.y + 'px')

      shapeEl.style.setProperty('--size', this._radius * 1.3 + 'px')
      shapeEl.style.setProperty('--rotate', angleDeg + 'deg')
      shapeEl.style.setProperty('--skew', this._skew + 'deg')
      shapeEl.style.setProperty('--gap', this.gap)
      shapeEl.style.setProperty('--inner-radius', this.innerRadius)
    })
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
