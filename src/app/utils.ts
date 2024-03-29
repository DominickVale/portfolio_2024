export const $ = (selector: string, parentElement: HTMLElement = document.body): HTMLElement | null =>
	parentElement.querySelector(selector);

export const $all = (selector: string, parentElement: HTMLElement = document.body): NodeListOf<HTMLElement> =>
  parentElement.querySelectorAll(selector);

export function degToRad(degrees: number) {
  return degrees * (Math.PI / 180);
}

export function radToDeg(rad: number) {
  return rad / (Math.PI / 180);
}
