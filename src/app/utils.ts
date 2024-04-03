import type { Vec2 } from './types'

export const TAU = Math.PI * 2

export const $ = (
  selector: string,
  parentElement: HTMLElement | Document = document.body,
): HTMLElement | null => parentElement.querySelector(selector)

export const $all = (
  selector: string,
  parentElement: HTMLElement | Document = document.body,
): NodeListOf<HTMLElement> => parentElement.querySelectorAll(selector)

export const degToRad = (degrees: number) => degrees * (Math.PI / 180)

export const radToDeg = (rad: number) => rad / (Math.PI / 180)

export const mag = (vec: Vec2) => Math.sqrt(vec.x ** 2 + vec.y ** 2)

export const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max)

export function getCurrentPage() {
  if (window.location.pathname === '/') return 'home'
  else {
    const path = window.location.pathname.split('/').slice(1)
    return path.join('/')
  }
}

export function debounce<T extends Function>(cb: T, wait = 20) {
  let h = 0
  let callable = (...args: any) => {
    clearTimeout(h)
    h = setTimeout(() => cb(...args), wait)
  }
  return <T>(<any>callable)
}
