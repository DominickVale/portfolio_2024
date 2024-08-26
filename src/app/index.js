import App from './app'
import gsap from 'gsap'
import { ScrollTrigger, TextPlugin } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(TextPlugin)
new App()

function fancyMotd() {
  const styles = `
  color: #FFFFFF;
  background-color: #000000;
  font-family: monospace;
  font-size: 14px;
  font-weight: bold;
  padding: 10px 20px;
  border: 1px solid #FFFFFF;
`

  const smallerStyles = `
  color: #FFFFFF;
  background-color: #000000;
  font-family: monospace;
  font-size: 10px;
  font-weight: bold;
  padding: 8px 16px;
  border: 1px solid #FFFFFF;
`

  console.log('\n\n\n')
  console.log('%cWelcome, please enjoy your stay 😸', styles)
  console.log('%cSound design: Domenico Vale ⋅ Music: Scott Buckley', smallerStyles)
  console.log(`
'Shadows and Dust' by Scott Buckley - released under CC-BY 4.0. https://www.scottbuckley.com.au
`)
  console.log('\n\n\n')
}

;(() => {
  fancyMotd()
  return 0
})()
