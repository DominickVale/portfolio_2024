import GL from './gl'

//@TODO: add to settings in radial menu
const DEBUG = true

export default class App {
  constructor() {
    this.gl = new GL(DEBUG)
    this.gl.init();
  }
}
