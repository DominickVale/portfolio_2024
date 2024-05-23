import App from './app'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)
new App()

;(() => {
  console.log('Welcome, and enjoy your stay. This portfolio is open source. You can find it at https://github.com/DominickVale/portfolio_2024')
  return 0
})()
