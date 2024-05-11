
import { Renderer } from '@unseenco/taxi';

export default class DefaultRenderer extends Renderer {
  onEnter() {
    // run after the new content has been added to the Taxi container
    console.log("renderer onEnter")
  }

  onEnterCompleted() {
     // run after the transition.onEnter has fully completed
    console.log("renderer onEnterCompleted")
  }

  onLeave() {
    // run before the transition.onLeave method is called
    console.log("renderer onLeave")
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
    console.log("renderer onLeaveCompleted")
  }
}
