import type { RadialMenuItem } from './RadialMenu'
import RadialMenu from './RadialMenu'
import { $, $all, debounceTrailing, isMobile, showCursorMessage } from '../utils'

export default class Menus {
  menus: RadialMenu[]
  isMobile: boolean
  triggers: { el: HTMLElement; cb: (e: MouseEvent) => void }[]

  constructor(public onToggleDebug?: () => void) {
    this.isMobile = isMobile()
    this.init()
    this.addListeners()
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  init() {
    this.menus = [...this.getMenus()]
  }

  destroy() {
    this.menus.forEach((m) => m.destroy())
    this.triggers.forEach((t) => {
      t.el?.removeEventListener('contextmenu', t.cb)
    })
    this.menus = []
  }

  createContextMenuCb = (menu: RadialMenu) => (e: MouseEvent) => {
    if ((e.target as HTMLElement).id.includes('radial-menu-thumb')) return
    e.preventDefault()
    e.stopPropagation()

    const isTouchOrBound = window.app.cursor.pos.x <= 3 || window.app.cursor.pos.y <= 3 || (e.clientX <= 1 && e.clientY <= 1)
    const pos = {
      x: isTouchOrBound ? window.innerWidth / 2 : e.clientX,
      y: isTouchOrBound ? window.innerHeight / 2 : e.clientY,
    }
    menu.open(pos.x, pos.y, e.target as HTMLElement)
  }

  addListeners() {
    const triggerEls = $all('[data-menu-trigger]', document)
    this.triggers = Array.from(triggerEls)
      .map((el) => {
        const menuId = el.getAttribute('data-menu-trigger')
        const menu = this.menus.find((m) => m.id === menuId)
        if (!menu) {
          console.info('Skipping menu', menuId)
          return
        }
        if (menu.isMobile) {
          return null
        } else {
          const callback = this.createContextMenuCb(menu)
          el.addEventListener('contextmenu', callback)
          return {
            el,
            cb: callback,
          }
        }
      })
      .filter(Boolean)
  }

  getMenus() {
    const cb = (slice, target) => console.log('CLICL')
    const navigateTo = (url) => () => {
      window.app.taxi.navigateTo(url)
    }
    const preloadPage = (url) => () => {
      window.app.taxi.preload(url)
    }

    const homeSlice: RadialMenuItem = {
      iconId: 'home',
      label: 'HOME',
      position: 2,
      callback: navigateTo('/'),
      hoverCallback: preloadPage('/'),
    }

    const aboutSlice: RadialMenuItem = {
      iconId: 'about',
      label: 'ABOUT',
      position: 2,
      callback: navigateTo('/about'),
      hoverCallback: preloadPage('/about'),
    }

    const worksSlice: RadialMenuItem = {
      iconId: 'works',
      label: 'WORKS',
      position: 5,
      callback: navigateTo('/works'),
      hoverCallback: preloadPage('/works'),
    }
    const blogSlice: RadialMenuItem = {
      iconId: 'blog',
      label: 'BLOG',
      position: 1,
      callback: navigateTo('/blog'),
      hoverCallback: preloadPage('/blog'),
    }
    const contactSlice: RadialMenuItem = {
      iconId: 'contact',
      label: 'CONTACT',
      position: 5,
      callback: navigateTo('/contact'),
      hoverCallback: preloadPage('/contact'),
    }
    const labSlice: RadialMenuItem = {
      iconId: 'lab',
      label: 'LAB',
      position: 4,
      callback: navigateTo('/lab'),
      hoverCallback: preloadPage('/lab'),
    }
    const openProjSlice: RadialMenuItem = {
      iconId: 'lab',
      label: 'OPEN<br/>PROJECT',
      position: 4,
      callback: () => {
        navigateTo(($('#open-proj-mobile') as HTMLAnchorElement).href)
      },
      hoverCallback: null,
    }
    const settingsSlice: RadialMenuItem = {
      iconId: 'settings',
      label: 'SETTINGS',
      position: 7,
      callback: (e, slice, origTarget) => {
        const fn = () => {
          settingsMenu.open(window.app.cursor.pos.x, window.app.cursor.pos.y, slice)
        }
        setTimeout(fn.bind(this), 250)
      },
      hoverCallback: null,
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
      hoverCallback: null,
    }

    let defaultMenuItems: RadialMenuItem[] = [homeSlice, labSlice, aboutSlice, worksSlice, blogSlice, contactSlice, settingsSlice, contextSlice]
    const blogPageMenuItems: RadialMenuItem[] = [
      homeSlice,
      openProjSlice,
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

    let blogPageMenuItemsMobile: RadialMenuItem[] = [
      {
        ...homeSlice,
        position: 1,
      },
      aboutSlice,
      { ...blogSlice, position: 3 },
      openProjSlice,
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
        hoverCallback: null,
      },
      {
        iconId: 'audio',
        label: 'TOGGLE AUDIO',
        callback() {
          window.app.audio.toggle()
        },
        hoverCallback: null,
      },
    ]
    const settingsMenu = new RadialMenu('settings', settingsItems, { size: 'calc(10rem + 5vw)' })

    const textMenuItems: RadialMenuItem[] = [
      {
        iconId: 'copy',
        label: 'COPY TEXT',
        callback: (ev, slice, origTarget) => {
          navigator.clipboard.writeText(origTarget.innerText)
          showCursorMessage({ message: 'Copied to clipboard!' })
        },
        hoverCallback: null,
      },
      settingsSlice,
      contextSlice,
    ]

    const textMenu = new RadialMenu('text', textMenuItems, { size: 'calc(10rem + min(30vw, 10vh))' })
    if (this.isMobile) {
      const menus = [textMenu, settingsMenu]

      if (window.location.pathname.includes('blog/')) {
        const defaultBlogMenuMobile = new RadialMenu('default-blog-mobile', blogPageMenuItemsMobile, { isMobile: true })
        menus.push(defaultBlogMenuMobile)
      } else {
        const defaultMenuMobile = new RadialMenu('default-mobile', defaultMenuItemsMobile, { isMobile: true })
        menus.push(defaultMenuMobile)
      }
      return menus
    } else {
      const menus = [textMenu, settingsMenu]

      if (window.location.pathname.includes('blog/')) {
        const defaultBlogMenu = new RadialMenu('default-blog', blogPageMenuItems)
        menus.push(defaultBlogMenu)
      } else {
        const defaultMenu = new RadialMenu('default', defaultMenuItems)
        menus.push(defaultMenu)
      }

      return menus
    }
  }

  handleResize() {
    this.debounceResize()
  }

  debounceResize = debounceTrailing(() => {
    this.isMobile = isMobile()

    this.destroy()
    this.menus = this.getMenus()
    this.addListeners()
  }, 1000)
}
