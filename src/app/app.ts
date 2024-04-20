import Cursor from './Cursor'
import Menus from './Menus'
import GL from './gl'
import { $all, showCursorMessage } from './utils'


export default class App {
  gl: GL
  menus: Menus
  cursor: Cursor

  constructor(public debug = false) {
    this.cursor = new Cursor()
    this.gl = new GL(this.cursor, this.debug)
    this.menus = new Menus(this.cursor, this.onToggleDebug.bind(this))
    this.initCursorMessages()
  }

  initCursorMessages(){
    $all('[data-cursor-message]', document).forEach((el) => {
      el.addEventListener('mouseover', (e) => {
        const message = el.getAttribute('data-cursor-message')
        const timeout = Number(el.getAttribute('data-cursor-timeout'))
        if(timeout <= 0) el.addEventListener('mouseout', () => {
          showCursorMessage({ message: "" })
        })
        showCursorMessage({ message, timeout })
      })
    })
  }

  onToggleDebug() {
   if(this.debug) {
      this.debug = false
      this.gl.stopDebug()
    } else {
      this.debug = true
      this.gl.startDebug()
    }

  }
}
