import type { MessageShowEvent } from './Cursor'
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

export const lerp = (a: number, b: number, t: number): number => ( a + (b - a) * t );

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

export function fitTextToContainer(el: HTMLElement, container: HTMLElement, offset?: number) {
  const maxWidth = container.clientWidth
  const maxHeight = container.clientHeight
  let newFontSize = container.clientHeight
  let textWidth = el.offsetWidth
  let textHeight = el.offsetHeight
  for ( let j = 0; textWidth > maxWidth - offset || textHeight > maxHeight - offset; j++) {
    newFontSize--
    if (newFontSize < 5) {
      console.log('Reached limit, break')
      break
    }
    container.style.fontSize = newFontSize + 'px'
    textWidth = el.offsetWidth
    textHeight = el.offsetHeight
  }
  return newFontSize
}

export function fitTextToContainerScr(el: HTMLElement, container: HTMLElement, offset = 0) {
  let fontSizeChanged = false
  let scrollHeight = container.scrollHeight
  let newFontSize = container.clientHeight
  let textHeight = el.offsetHeight
  for ( let j = 0; scrollHeight > textHeight; j++) {
    fontSizeChanged = true
    newFontSize--
    if (newFontSize < 5) {
      console.log('Reached limit, break')
      break
    }
    container.style.fontSize = newFontSize + 'px'
    textHeight = el.offsetHeight
    scrollHeight = container.scrollHeight
  }
  if(fontSizeChanged) {
    container.style.fontSize = newFontSize + offset + 'px'
    return newFontSize
  }
}

export function showCursorMessage(opts: MessageShowEvent){
  const event = new CustomEvent('show-cursor-message', {
    detail: opts
  })
  window.dispatchEvent(event)
}

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export function translateValidity(errCode: string, inputName: string){
  switch(errCode){
    case 'badInput': return `Invalid ${inputName}`
    case 'customError': return `Invalid ${inputName}`
    case 'patternMismatch': return `Invalid characters in ${inputName}`
    case 'rangeOverflow': return `Value is too high`
    case 'rangeUnderflow': return `Value is too low`
    case 'stepMismatch': return `Invalid step`
    case 'tooLong': return `Too many characters!`
    case 'tooShort': return `${capitalize( inputName )} is too short`
    case 'typeMismatch': return `Not a valid ${inputName}`
    case 'valid': return `Valid`
    case 'valueMissing': return `The ${inputName} is required`
  }

}
