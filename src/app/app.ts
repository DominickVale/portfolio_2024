import Cursor from './Cursor'
import Menus from './Menus'
import GL from './gl'


export default class App {
  gl: GL
  menus: Menus
  cursor: Cursor

  constructor(public debug = false) {
    this.gl = new GL(this.debug)
    this.cursor = new Cursor()
    this.menus = new Menus(this.cursor, this.onToggleDebug.bind(this))
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
