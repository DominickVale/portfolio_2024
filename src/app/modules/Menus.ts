import type { RadialMenuItem } from './RadialMenu'
import RadialMenu from './RadialMenu'
import { $, $all, debounceTrailing, getPageName, isMobile, showCursorMessage } from '../utils'

export default class Menus {
  menus: RadialMenu[]
  isMobile: boolean

  constructor(public onToggleDebug?: () => void) {
    this.isMobile = isMobile()
    this.init()
    window.addEventListener('resize', this.handleResize.bind(this))
    document.addEventListener('contextmenu', this.handleContextMenu.bind(this))
  }

  init() {
    this.menus = [...this.getMenus()]
  }

  destroy() {
    this.menus.forEach((m) => m.destroy())
    this.menus = []
  }

  reload() {
    this.destroy()
    this.init()
  } 

  handleContextMenu = (e: MouseEvent) => {
    if(!window.app.preloaderFinished) return
    const el = e.target as HTMLElement
    if (el.id.includes('radial-menu-thumb')) return
    e.preventDefault()
    e.stopPropagation()

    const menuId = el.getAttribute('data-menu-trigger')
    let menu = this.menus.find((m) => m.id === menuId) || this.menus[0]

    if (menu.isMobile) {
      return null
    } else {
      this.showMenu(menu, e, e.target as HTMLElement)
    }
  }

  showMenu(menu: RadialMenu, e: MouseEvent, target: HTMLElement) {
    const isTouchOrBound = window.app.cursor.pos.x <= 3 || window.app.cursor.pos.y <= 3 || (e.clientX <= 1 && e.clientY <= 1)
    const pos = {
      x: isTouchOrBound ? window.innerWidth / 2 : e.clientX,
      y: isTouchOrBound ? window.innerHeight / 2 : e.clientY,
    }

    window.app.audio.play(null, 'menu-open-alt', {
      volume: 0.5,
    })
    menu.open(pos.x, pos.y, target)
  }

getMenus() {
    const navigateTo = (url: string) => () => {
      window.app.taxi.navigateTo(url)
    }

    const preloadPage = (url: string) => () => {
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
      iconId: 'visit',
      label: 'VISIT',
      position: 4,
      callback: () => {
        const link = ($('#open-proj-mobile') as HTMLAnchorElement)
        link.click()
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

    const closeSlice: RadialMenuItem = {
      iconId: 'close',
      label: 'CLOSE',
      position: 8,
      callback: () => {
        // noop
      },
      hoverCallback: null,
    }

    const defaultMenuItems: RadialMenuItem[] = [homeSlice, labSlice, aboutSlice, worksSlice, blogSlice, contactSlice, settingsSlice, closeSlice]

    const blogPageMenuItems: RadialMenuItem[] = [
      homeSlice,
      openProjSlice,
      aboutSlice,
      worksSlice,
      blogSlice,
      contactSlice,
      settingsSlice,
      closeSlice,
    ]

    const defaultMenuItemsMobile: RadialMenuItem[] = [
      {
        ...homeSlice,
        position: 1,
      },
      aboutSlice,
      { ...blogSlice, position: 3 },
      worksSlice,
      {
        ...contactSlice,
        position: 5,
      },
      {
        ...labSlice,
        position: 6,
      },
    ]

    const blogPageMenuItemsMobile: RadialMenuItem[] = [
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
        position: 5,
      },
      {
        ...labSlice,
        position: 6,
      },
    ]

    const settingsItems: RadialMenuItem[] = [
      closeSlice,
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
        label: 'COPY',
        callback: (ev, slice, origTarget) => {
          navigator.clipboard.writeText(origTarget.innerText)
          showCursorMessage({ message: 'Copied to clipboard!' })
        },
        hoverCallback: null,
      },
      settingsSlice,
      closeSlice,
    ]

    const textMenu = new RadialMenu('text', textMenuItems, { size: 'calc(10rem + min(30vw, 10vh))' })

    const pageName = getPageName(window.location.pathname)
    const defaultMenu = new RadialMenu(
      'default',
      pageName === 'blogarticle'
        ? this.isMobile
          ? blogPageMenuItemsMobile
          : blogPageMenuItems
        : this.isMobile
          ? defaultMenuItemsMobile
          : defaultMenuItems,
      { isMobile: this.isMobile }
    )

    return [defaultMenu, textMenu, settingsMenu]
  }

  handleResize() {
    this.debounceResize()
  }

  debounceResize = debounceTrailing(() => {
    this.isMobile = isMobile()
    this.reload()
  }, 1000)
}
