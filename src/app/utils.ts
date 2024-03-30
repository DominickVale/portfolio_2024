import type { Vec2 } from "./types";

export const TAU = Math.PI * 2;

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

export function mag(vec: Vec2){
  return Math.sqrt( (vec.x ** 2) + (vec.y ** 2) )
}

export const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max)
