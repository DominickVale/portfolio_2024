import App from './app'
import gsap from 'gsap'
import { ScrollTrigger, TextPlugin } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(TextPlugin);
new App()

function fancyMotd() {
    const styles = [
    'color: #FFFFFF',
    'background-color: #000000',
    'font-family: monospace',
    'font-size: 14px',
    'font-weight: bold',
    'padding: 10px 20px',
    'border: 1px solid #FFFFFF'
  ].join(';');

  console.log('%cWelcome, please enjoy your stay 😸', styles);
}

;(() => {
  fancyMotd()
  return 0
})()
