import App from './app'
import gsap from 'gsap'
import { ScrollTrigger, TextPlugin } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(TextPlugin);
new App()

;(() => {
  console.log('Welcome, and enjoy your stay. This portfolio is open source. You can find it at https://github.com/DominickVale/portfolio_2024')
  return 0
})()
