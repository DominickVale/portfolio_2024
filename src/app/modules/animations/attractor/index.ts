import { AboutPageAttractorAnim } from './AboutPageAttractor'
import { WorksPageAttractorAnim } from './WorksPageAttractor'
import { HomePageAttractorAnim } from './HomePageAttractorAnim'
import { BlogPageAttractorAnim } from './BlogPageAttractorAnim'
import { WipPageAttractorAnim } from './WipPageAttractorAnim'
import { ContactsPageAttractorAnim } from './ContactsPageAttractorAnim'
import {CustomEase} from 'gsap/all'

CustomEase.create("attractor_speed", "M0,0 C0.057,0.112 -0.001,0.976 0.2,1 0.499,1.034 0.224,0.037 1,0 ")

export function getAttractorByPage(page: string): GSAPTimeline {
  let attractorAnim = null

  switch (page) {
    case 'about':
      attractorAnim = AboutPageAttractorAnim.create('main')
      break
    case 'works':
      attractorAnim = WorksPageAttractorAnim.create()
      break
    case 'blog':
      attractorAnim = BlogPageAttractorAnim.create()
      break
    case 'lab':
      attractorAnim = WipPageAttractorAnim.create()
      break
    case 'contact':
      attractorAnim = ContactsPageAttractorAnim.create()
      break
    case 'home':
    default:
      attractorAnim = HomePageAttractorAnim.create()
      break
  }
  return attractorAnim.play(0)
}
