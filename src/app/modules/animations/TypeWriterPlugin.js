import { TextPlugin } from "gsap/all"
const { splitInnerHTML } = TextPlugin

const CHARS = 'ᚠᚢᚦᚨᚩᚬᚭᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻᚼᚽᚾᚿᛀᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛠᛡᛢᛣᛤᛥᛦ<>-_\\/[]{}-=+*^?#________'

let _tempDiv

//@TODO: Maybe make it a library or something? (Add back the support for rtl, classes etc.)
export const TypewriterPlugin = {
  version: '1.0.0',
  name: 'typewrite',
  init(target, value, tween) {
    typeof value !== 'object' && (value = { value: value })
    let data = this,
      { preserveSpaces } = value,
      delimiter = (data.delimiter = value.delimiter || ''),
      text

    data.target = target
    _tempDiv || (_tempDiv = document.createElement('div'))
    _tempDiv.innerHTML = typeof value.value === 'string' ? value.value : target.innerHTML
    text = splitInnerHTML(_tempDiv, delimiter, false, preserveSpaces)
    const newSpeed = Math.min(0.05 / value.speed * text.length, value.maxDuration || 9999)
    value.speed && tween.duration(newSpeed)
    data.speed = newSpeed
    data.text = text
    data._props.push('text')
    data.maxScrambleChars = value.maxScrambleChars || 4
    data.charClass = value.charClass 
  },
  render(progress, data) {
    console.log(progress, data.text)
    if (progress > 1) {
      progress = 1
    } else if (progress < 0) {
      progress = 0
    }

    let { text, delimiter, target, fillChar, previousProgress, maxScrambleChars, charClass, speed } = data,
      l = text.length,
      i = (progress * l + 0.5) | 0,
      str

    const dp = progress - previousProgress
    const dSpeed = Math.abs(dp)

    // Determine the number of characters to scramble based on delta speed
    const n = Math.ceil(dSpeed * maxScrambleChars * data.text.length)

    if (progress) {
      const randomChar = () => `<span class="${charClass}">${CHARS[Math.floor(Math.random() * CHARS.length)]}</span>`
      if (i === 0) {
        str = ""
      } else if (i >= l) {
        str = text.join(delimiter)
      } else if (speed * dp < 0.9) {
        const startScrambleIndex = Math.max(0, i - n)
        let scrambledPart = text
          .slice(startScrambleIndex, i)
          .map(() => randomChar())
          .join(delimiter)

        let nonScrambledPart = text.slice(0, startScrambleIndex).join(delimiter)

        str = nonScrambledPart + scrambledPart
      } else str = text.slice(0, i).join(delimiter)
    } else {
      str = ''
    }
    data.previousProgress = progress
    target.innerHTML = fillChar === '&nbsp;' && ~str.indexOf('  ') ? str.split('  ').join('&nbsp;&nbsp;') : str
  },
}
