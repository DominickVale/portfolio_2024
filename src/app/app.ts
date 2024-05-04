import Cursor from './modules/Cursor'
import Menus from './modules/Menus'
import TextScramble from './modules/animations/TextScramble'
import Experience from './gl/Experience'
import { $, $all, showCursorMessage } from './utils'
import Typewriter from './modules/animations/Typewriter'
import Animations from './modules/animations'


export default class App {
  experience: Experience
  menus: Menus
  cursor: Cursor
  scrambles: TextScramble
  typewriter: Typewriter

  constructor(public debug = false) {
    this.cursor = new Cursor()
    this.experience = new Experience($('#webgl'))
    this.menus = new Menus(this.onToggleDebug.bind(this))
    this.scrambles = new TextScramble()
    this.typewriter = new Typewriter()
    Animations.init(this.cursor, this.experience)
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
