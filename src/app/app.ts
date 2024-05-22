import Cursor from './modules/Cursor'
import Menus from './modules/Menus'
import TextScramble from './modules/animations/TextScramble'
import Experience from './gl/Experience'
import { $, $all, showCursorMessage } from './utils'
import Typewriter from './modules/animations/Typewriter'
import Animations from './modules/animations'
import { Core as TaxiCore } from '@unseenco/taxi'
import DefaultRenderer from './modules/renderers/base'
import DefaultTransition from './modules/transitions/base'
import WorksRenderer from './modules/renderers/WorksRenderer'
import FromWorkTransition from './modules/transitions/fromWorks'
import ToWorkTransition from './modules/transitions/toWorks'

export default class App {
  experience: Experience
  menus: Menus
  cursor: Cursor
  scrambles: TextScramble
  typewriter: Typewriter
  taxi: TaxiCore

  constructor(public debug = false) {
    this.cursor = new Cursor()
    this.experience = new Experience($('#webgl') as HTMLCanvasElement, this.cursor)
    this.menus = new Menus(this.onToggleDebug.bind(this))
    this.scrambles = new TextScramble()
    this.typewriter = new Typewriter()
    this.taxi = new TaxiCore({
      allowInterruption: true,
      reloadCssFilter: (element) => true,
      transitions: {
        default: DefaultTransition,
        fromWorks: FromWorkTransition,
        toWorks: ToWorkTransition
      },
      renderers: {
        default: DefaultRenderer,
        works: WorksRenderer,
      },
    })
    this.taxi.on('NAVIGATE_IN', ({ to, trigger }) => {
      this.scrambles.reload()
      this.cursor.reload()
    })
    this.taxi.addRoute('/works', '.*', 'fromWorks')
    this.taxi.addRoute('.*', '/works', 'toWorks')
    Animations.init(this.cursor, this.experience)
  }

  onToggleDebug() {
    if (this.debug) {
      this.debug = false
      this.experience.debug.stop()
    } else {
      this.debug = true
      this.experience.debug.start()
    }
  }
}
