import type Cursor from './Cursor'
import RadialMenu, { type RadialMenuItem } from './RadialMenu'
import { $all, getCurrentPage } from './utils'

export default class Menus {
  menus: RadialMenu[]
  constructor(
    public cursor: Cursor,
    public onToggleDebug?: () => void,
  ) {
    this.init()
    this.addListeners()
  }

  init() {
    this.menus = [...this.getMenus()]
  }
  destroy() {
    this.menus.forEach((m) => m.destroy())
  }

  addListeners() {
    const triggers = [...$all('[data-menu-trigger]', document)].map((el) => {
      const menuId = el.getAttribute('data-menu-trigger')
      const menu = this.menus.find((m) => m.id === menuId)
      if (!menu) throw new Error(`Radial menu with ID "${menuId}" not found!`)
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        menu.open(e.clientX, e.clientY, e.target as HTMLElement)
      })
    })
  }

  getMenus() {
    const cb = (slice, target) => console.log('CLICL')
    const navigateTo = (url) => () => {
      window.location.href = url
    }
    console.log(getCurrentPage())

    const homeSlice: RadialMenuItem = {
      iconId: 'home',
      label: 'HOME',
      position: 2,
      callback: navigateTo('/'),
    }

    const aboutSlice: RadialMenuItem= {
      iconId: 'about',
      label: 'ABOUT',
      position: 2,
      callback: navigateTo('/about'),
    }

    const worksSlice: RadialMenuItem= {
      iconId: 'works',
      label: 'WORKS',
      position: 5,
      callback: navigateTo('/works'),
    }
    const blogSlice: RadialMenuItem = {
      iconId: 'blog',
      label: 'BLOG',
      position: 1,
      callback: navigateTo('/blog'),
    }
    const contactSlice: RadialMenuItem = {
      iconId: 'contact',
      label: 'CONTACT',
      position: 5,
      callback: navigateTo('/contact'),
    }
    const labSlice: RadialMenuItem = {
      iconId: 'lab',
      label: 'LAB',
      position: 4,
      callback: navigateTo('/lab'),
    }
    const settingsSlice: RadialMenuItem= {
      iconId: 'settings',
      label: 'SETTINGS',
      position: 7,
      callback: (e, slice, origTarget) => {
        const fn = () => {
          settingsMenu.open(this.cursor.pos.x, this.cursor.pos.y, slice)
        }
        setTimeout(fn.bind(this), 250)
      },
    }

    const contextSlice: RadialMenuItem = {
      iconId: 'context-menu',
      label: 'CONTEXT',
      position: 8,
      callback: (e, slice, origTarget) => {
        const fn = () => {
          //contextMenu.open(this.cursor.pos.x, this.cursor.pos.y, slice)
        }
        setTimeout(fn.bind(this), 250)
      }
    }

    let defaultMenuItems: RadialMenuItem[] = [
      homeSlice,
      labSlice,
      aboutSlice,
      worksSlice,
      blogSlice,
      contactSlice,
      settingsSlice,
      contextSlice
    ]

    const settingsItems: RadialMenuItem[] = [
      {
        iconId: 'debug',
        label: 'DEBUG',
        callback: () => {
          this.onToggleDebug()
        },
      },
      {
        iconId: 'audio',
        label: 'TOGGLE AUDIO',
        callback: cb,
      },
    ]
    const settingsMenu = new RadialMenu('settings', settingsItems)

    const textMenuItems: RadialMenuItem[] = [
      {
        iconId: 'copy',
        label: 'COPY TEXT',
        callback: (ev, slice, origTarget) => {
          //@TODO: Add success message on cursor
          console.log(window.getSelection())
          navigator.clipboard.writeText(origTarget.innerText)
        },
      },
      settingsSlice,
      contextSlice
    ]

    const defaultMenu = new RadialMenu('default', defaultMenuItems)
    const defaultBlogMenu = new RadialMenu('default-blog', defaultMenuItems)
    const textMenu = new RadialMenu('text', textMenuItems)
    return [defaultMenu, textMenu, settingsMenu, defaultBlogMenu]
  }
}
