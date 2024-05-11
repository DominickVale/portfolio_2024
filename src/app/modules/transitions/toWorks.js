import { Transition } from "@unseenco/taxi";
import gsap from "gsap";

export default class DefaultTransition extends Transition {
	/**
	 * Handle the transition leaving the previous page.
	 * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
	 */
	onLeave({ from, trigger, done }) {
		// const leaveTL = gsap.timeline({
		// 	onComplete: () => done(),
		// 	defaults: { duration: 0.5, ease: "power4.in" },
		// });
		// leaveTL.set("#transition", {
		// 	display: "block",
		// 	xPercent: 100,
		// });
		// leaveTL.to("#transition", { xPercent: 0 });
    done()
	}

	/**
	 * Handle the transition entering the next page.
	 * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
	 */
	onEnter({ to, trigger, done }) {
		// const enterTL = gsap.timeline({
		// 	onComplete: () => done(),
		// 	defaults: { duration: 0.5, ease: "power4.in" },
		// });
		// enterTL.to("#transition", { xPercent: -100 });
		// enterTL.set("#transition", { display: "hidden", xPercent: 100 });
    done()
	}
}
