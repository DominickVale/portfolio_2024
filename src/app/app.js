import GL from './gl'

export default class App {
  constructor() {
    this.gl = new GL()
    this.gl.init();
  }
}
