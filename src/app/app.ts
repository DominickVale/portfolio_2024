import Cursor from './Cursor'
import Menus from './Menus'
import Experience from './gl/Experience'
import { $, $all, showCursorMessage } from './utils'


export default class App {
  experience: Experience
  menus: Menus
  cursor: Cursor

  constructor(public debug = false) {
    this.cursor = new Cursor()
    this.experience = new Experience($('#webgl'))
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
      this.experience.debug.stop()
    } else {
      this.debug = true
      this.experience.debug.start()
    }

  }
}
