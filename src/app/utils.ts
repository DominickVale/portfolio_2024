import type { MessageShowEvent } from './modules/Cursor'
import type { Vec2 } from './types'
import * as THREE from 'three'

import type { TimelineMax } from 'gsap'
import { CustomEase } from 'gsap/all'

export const TAU = Math.PI * 2

export const $ = (selector: string, parentElement: HTMLElement | Document = document.body): HTMLElement | null =>
  parentElement.querySelector(selector)

export const $all = (selector: string, parentElement: HTMLElement | Document = document.body): NodeListOf<HTMLElement> =>
  parentElement.querySelectorAll(selector)

export const degToRad = (degrees: number) => degrees * (Math.PI / 180)

export const radToDeg = (rad: number) => rad / (Math.PI / 180)

export const mag = (vec: Vec2) => Math.sqrt(vec.x ** 2 + vec.y ** 2)

export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function getCurrentPage() {
  if (window.location.pathname === '/') return 'home'
  else {
    const path = window.location.pathname.split('/').slice(1)
    return path.join('/')
  }
}

//debounce with trailing call
export function debounceTrailing<T extends Function>(cb: T, wait = 20) {
  let timer = 0
  return function debouncedFn(...args: any) {
    clearTimeout(timer)
    timer = setTimeout(() => cb(...args), wait)
  }
}

//debounce with leading call
export function debounce<T extends Function>(cb: T, wait = 20) {
  let timer = 0
  return function debouncedFn(...args: any) {
    if (Date.now() - timer > wait) {
      cb(...args)
    }
    timer = Date.now()
  }
}

export function fitTextToContainerScr(el: HTMLElement, container: HTMLElement, offset = 0) {
  let newFontSize = container.clientHeight / 2
  el.style.fontSize = newFontSize + 'px'
  let { scrollHeight, clientHeight } = container

  while (scrollHeight > clientHeight) {
    newFontSize--
    if (newFontSize <= 12) {
      console.log('Reached limit, break')
      break
    }
    el.style.fontSize = newFontSize + 'px'
    clientHeight = container.clientHeight
    scrollHeight = container.scrollHeight
  }
  return newFontSize
}

export function showCursorMessage(opts: MessageShowEvent) {
  const event = new CustomEvent('show-cursor-message', {
    detail: opts,
  })
  window.dispatchEvent(event)
}

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export function translateValidity(errCode: string, inputName: string) {
  switch (errCode) {
    case 'badInput':
      return `Invalid ${inputName}`
    case 'customError':
      return `Invalid ${inputName}`
    case 'patternMismatch':
      return `Invalid characters in ${inputName}`
    case 'rangeOverflow':
      return `Value is too high`
    case 'rangeUnderflow':
      return `Value is too low`
    case 'stepMismatch':
      return `Invalid step`
    case 'tooLong':
      return `Too many characters!`
    case 'tooShort':
      return `${capitalize(inputName)} is too short`
    case 'typeMismatch':
      return `Not a valid ${inputName}`
    case 'valid':
      return `Valid`
    case 'valueMissing':
      return `The ${inputName} is required`
  }
}

export function isMobile() {
  let check = false
  // prettier-ignore
  //@ts-ignore
  ;(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check || window.innerWidth / window.innerHeight < 1;
}

export function splitTextChars(el: HTMLElement, tag: string, className?: string) {
  const splitChars = el.textContent.split('').map((c) => `<${tag} ${className ? `class="${className}"` : ''}>${c}</${tag}>`)
  el.innerHTML = splitChars.join('')
  return el.childNodes
}

/*
 * Given a rootEl containing an SVG element with TEXT inside, it sets up the text to fit the svg container
 */
export function setupSvgText(rootEl: HTMLElement, isDesktop: boolean) {
  const svg = $('svg', rootEl)
  const text = $('text', svg) as unknown as SVGTextElement
  let bbox = text.getBBox()

  svg.setAttribute('viewBox', [bbox.x, bbox.y, bbox.width, bbox.height].join(' '))
  svg.setAttribute('preserveAspectRatio', isDesktop ? 'xMinYMin' : 'xMidYMid meet')
}

export function getZPosition() {
  const minWidth = 320
  const maxWidth = 1300
  const minNumber = -65
  const maxNumber = -1.5

  const width = window.innerWidth
  const ease = CustomEase.create(
    'custom',
    'M0,0 C0.366,0 0.29,0.144 0.326,0.19 0.385,0.266 0.472,0.431 0.615,0.48 0.809,0.546 0.958,0.736 0.977,0.784 1,0.844 1,1 1,1 ',
  )
  const p = (width - minWidth) / (maxWidth - minWidth)
  const percentage = ease(Math.min(1, p))
  const n = THREE.MathUtils.lerp(minNumber, maxNumber, percentage)

  return Math.max(minNumber, Math.min(maxNumber, n))
}

//https://gist.github.com/cvazac/db99a3fcfd502d3965d21cac7fb99143
export function wasServedFromBrowserCache(url: string) {
  //@ts-ignore
  const {transferSize, decodedBodySize, duration} = performance.getEntriesByName(url)[0]
  
  // if we transferred bytes, it must not be a cache hit
  // (will return false for 304 Not Modified)
  if (transferSize > 0) return false;

  // if the body size is non-zero, it must mean this is a
  // ResourceTiming2 browser, this was same-origin or TAO,
  // and transferSize was 0, so it was in the cache
  if (decodedBodySize > 0) return true;

  // fall back to duration checking (non-RT2 or cross-origin)
  return duration < 30;
}

export function deepKillTimeline(tl: TimelineMax) {
	tl.add && tl.getChildren(true, true, true).forEach(animation => animation.kill());
	tl.kill();
}
