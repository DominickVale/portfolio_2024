import type Cursor from './Cursor'
import type { RadialMenuItem } from './RadialMenu'
import RadialMenu from './RadialMenu'
import { $all, debounce, getCurrentPage } from './utils'

export default class Menus {
  menus: RadialMenu[]
  triggers: { el: HTMLElement, cb: (e: MouseEvent) => void }[]

  constructor(
    public cursor: Cursor,
    public onToggleDebug?: () => void,
  ) {
    this.init()
    this.addListeners()
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  init() {
    this.menus = [...this.getMenus()]
  }

  destroy() {
    console.log("Destroying menus")
    this.menus.forEach((m) => m.destroy())
    this.triggers.forEach((t) => {
      t.el?.removeEventListener('contextmenu', t.cb)
    })
    this.menus = []
  }

  createContextMenuCb = (menu: RadialMenu) => (e: MouseEvent) => {
    if((e.target as HTMLElement).id.includes('radial-menu-thumb')) return
    e.preventDefault()
    e.stopPropagation()
    menu.open(e.clientX, e.clientY, e.target as HTMLElement)
  }

  addListeners() {
    const triggerEls = $all('[data-menu-trigger]', document)
    this.triggers = Array.from(triggerEls).map((el) => {
      const menuId = el.getAttribute('data-menu-trigger')
      const menu = this.menus.find((m) => m.id === menuId)
      if (!menu) throw new Error(`Radial menu with ID "${menuId}" not found!`)
      if (menu.isMobile) {
        return null
      } else {
        const callback = this.createContextMenuCb(menu)
        el.addEventListener('contextmenu', callback)
        return {
          el, cb: callback
        }
      }
    }).filter(Boolean)
  }

  getMenus() {
    const cb = (slice, target) => console.log('CLICL')
    const navigateTo = (url) => () => {
      window.location.href = url
    }

    const homeSlice: RadialMenuItem = {
      iconId: 'home',
      label: 'HOME',
      position: 2,
      callback: navigateTo('/'),
    }

    const aboutSlice: RadialMenuItem = {
      iconId: 'about',
      label: 'ABOUT',
      position: 2,
      callback: navigateTo('/about'),
    }

    const worksSlice: RadialMenuItem = {
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
    const settingsSlice: RadialMenuItem = {
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
      },
    }

    let defaultMenuItems: RadialMenuItem[] = [
      homeSlice,
      labSlice,
      aboutSlice,
      worksSlice,
      blogSlice,
      contactSlice,
      settingsSlice,
      contextSlice,
    ]
    let defaultMenuItemsMobile: RadialMenuItem[] = [
      {
        ...homeSlice,
        position: 1,
      },
      aboutSlice,
      { ...blogSlice, position: 3 },
      labSlice,
      worksSlice,
      {
        ...contactSlice,
        position: 6,
      },
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
          navigator.clipboard.writeText(origTarget.innerText)
        },
      },
      settingsSlice,
      contextSlice,
    ]

    const defaultMenu = new RadialMenu('default', defaultMenuItems)
    const defaultBlogMenu = new RadialMenu('default-blog', defaultMenuItems)
    const textMenu = new RadialMenu('text', textMenuItems)
    const defaultMenuMobile = new RadialMenu(
      'default-mobile',
      defaultMenuItemsMobile,
      { isMobile: true },
    )
    // const defaultBlogMenuMobile = new RadialMenuMobile('default-blog-mobile', defaultMenuItems)
    return [
      defaultMenu,
      textMenu,
      settingsMenu,
      defaultBlogMenu,
      defaultMenuMobile,
    ] //defaultBlogMenuMobile]
  }

  handleResize() {
    this.debounceResize()
  }

  debounceResize = debounce(() => {
    const isMobile = window.innerWidth <= 768
    this.destroy()
    this.menus = [...this.getMenus().filter(menu => {
      const isMenuMobile = menu.isMobile
      if(isMobile && isMenuMobile) return true
      if(!isMobile && !isMenuMobile) return true
      return false
    })]
    this.addListeners()
  }, 1000)
}
