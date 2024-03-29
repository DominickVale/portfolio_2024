import { $, $all, degToRad } from '../../app/utils'

export default class Menu {
  id: string
  radius: number
  innerRadius: string
  centralAngle: number
  skew: number
  gap: string

  slices: NodeListOf<HTMLElement>

  constructor(id: string) {
    this.id = id
    console.log('Creating radial menu' + id)

    this.slices = $all(`#${id} .radial-menu-item`)

    const menuEl = $(`#${id} .radial-menu`)
    const menuBounds = menuEl.getBoundingClientRect()
    const menuSize = {
      width: menuBounds.width,
      height: menuBounds.height,
    }

    this.radius = menuSize.width / 2
    this.innerRadius = '40px'
    this.centralAngle = 360 / this.slices.length
    this.skew = 90 - this.centralAngle
    this.gap = '-0.1rem'
    this.createMenu()
  }

  createMenu() {
    this.slices.forEach((el, i, arr) => {
      const angleDeg = this.centralAngle * i - 90
      const angleRad = degToRad(angleDeg)
      const labelPosition = {
        x: Math.cos(angleRad - Math.PI / 2) * (this.radius / 1.8) + this.radius,
        y: Math.sin(angleRad - Math.PI / 2) * (this.radius / 1.8) + this.radius,
      }
      const shapeEl = $('.radial-menu-item-shape', el) as HTMLElement
      const bgEl = $('.radial-menu-item-bg', el) as HTMLElement
      const labelEl = $('.radial-menu-item-label', el) as HTMLElement

      labelEl.style.setProperty('--x', labelPosition.x + 'px')
      labelEl.style.setProperty('--y', labelPosition.y + 'px')

      shapeEl.style.setProperty('--size', this.radius + 'px')
      const angle = this.getSpecialValues(angleDeg, arr.length).angleDeg
      shapeEl.style.setProperty('--rotate', angle + 'deg')
      const unrotateAngle = -(90 - angle / 2)
      bgEl.style.setProperty('--unrotate', unrotateAngle + 'deg')
      shapeEl.style.setProperty('--skew', this.skew + 'deg')
      shapeEl.style.setProperty('--gap', this.gap)
      shapeEl.style.setProperty('--inner-radius', this.innerRadius)
    })
  }

  getSpecialValues(angle, length) {
    switch (length) {
      case 3:
        return { angleDeg: angle + 30 }
      case 4:
        return { angleDeg: angle + 45 }
      case 5:
        return { angleDeg: angle + 55 }
      case 7:
        return { angleDeg: angle + 65 }
      default:
        return { angleDeg: angle }
    }
  }
}
