import { Howl, type HowlOptions } from 'howler'
import { $, $all } from '../utils'
import gsap from 'gsap'

export type PlayOptions = {
  seek?: number
  pan?: number
  fadeIn?: number
  fadeOut?: number
  onplay?: () => void
  onend?: (audio: ExtendedHowl) => void
} & Omit<HowlOptions, 'src' | 'onend'>

export interface AudioOptions {
  name?: string
  volume?: number
  loop?: boolean
  pan?: number
  fadeIn?: number
  fadeOut?: number
  rate?: number
}

// Needed until @types/howler is updated
class ExtendedHowl extends Howl {
  name?: string
  fadeState: 'in' | 'out' | 'none' = 'none'
  fadeIn?: number
  fadeOut?: number
  filterType(v: string){
    //@ts-ignore
    super.filterType(v)
  }
  frequency(v: number) {
    //@ts-ignore
    super.frequency(v)
  }
}

class AudioWrapper {
  activeSounds: Map<string, ExtendedHowl>
  backgroundMusic: ExtendedHowl

  constructor() {
    this.activeSounds = new Map()
  }

  play(id: string | null, soundName: string, options: PlayOptions = {}): ExtendedHowl {
    const { loop = false, volume = 1, rate = 1, seek = 0, pan = 0, fadeIn = 0, fadeOut, onplay, onend, ...rest } = options

    const soundPath = window.app.experience.resources!.items[soundName].path
    let sound = (id && this.activeSounds.get(id)) || new ExtendedHowl({ src: [soundPath], loop, ...rest })

    sound.name = soundName
    sound.fadeIn = fadeIn
    sound.fadeOut = fadeOut

    if (sound.fadeState === 'out') {
      gsap.killTweensOf(sound)
      sound.fadeState = 'none'
    }
    if (sound.state() === 'unloaded') {
      sound.load()
    }

    if (rate) sound.rate(rate)

    if (id === 'background') {
      sound.filterType('lowpass')
      sound.frequency(this.getFrequency(1))
      this.backgroundMusic = sound
    } else if (soundName === 'vibration') {
      if (!this.backgroundMusic) throw new Error('Background music not loaded')
      const v = { freq: 1 }
      gsap.to(v, {
        freq: 0.35,
        duration: 0.5,
        onUpdate: () => {
          this.backgroundMusic.frequency(this.getFrequency(v.freq))
        },
      })

      gsap.to(this.backgroundMusic, {
        volume: 0.35,
        duration: 1,
      })
    }
    sound.play()

    if (pan) sound.stereo(pan)
    if (fadeIn) {
      sound.volume(0)
      sound.fadeState = 'in'
      gsap.to(sound, {
        volume,
        duration: fadeIn,
        onUpdate: () => {
          if (!sound.playing()) {
            gsap.killTweensOf(sound)
            sound.fadeState = 'none'
          }
        },
        onComplete: () => {
          sound.fadeState = 'none'
        },
      })
    } else {
      sound.volume(volume)
    }

    if (onplay) sound.on('play', onplay)
    if (onend) sound.on('end', () => onend(sound))
    if (seek) sound.seek(seek)
    if (loop) {
      if (!id) throw new Error('Looping requires an id')
      this.activeSounds.set(id, sound)
    }

    return sound
  }

  stop(id: string): void {
    const sound = this.activeSounds.get(id)

    if (!sound) throw new Error(`Sound ${id} not found`)

    const unload = () => {
      sound.stop()
      sound.fadeState = 'none'
      sound.unload()
    }

    if (sound.fadeOut && sound && sound.playing()) {
      if (sound.fadeState === 'in') {
        gsap.killTweensOf(sound)
      }
      sound.fadeState = 'out'
      gsap.to(sound, {
        volume: 0,
        duration: sound.fadeOut,
        onUpdate: () => {
          const playing = sound.playing()
          if (!playing) {
            gsap.killTweensOf(sound)
            unload()
          }
        },
        onComplete: unload,
      })
    } else unload()

    if (sound.name === 'vibration') {
      const oldVol = this.backgroundMusic.volume()
      if (!this.backgroundMusic) throw new Error('Background music not loaded')
      const v = { freq: 0.35 }
      gsap.to(v, {
        freq: 1,
        duration: 0.5,
        onUpdate: () => {
          this.backgroundMusic.frequency(this.getFrequency(v.freq))
        },
      })

      gsap.to(this.backgroundMusic, {
        volume: 0.34,
        duration: 1,
      })
    }
  }

  setPan(id: string, pan: number): void {
    const sound = this.activeSounds.get(id)
    if (!sound) throw new Error(`Sound ${id} not found`)
    sound.stereo(pan)
  }

  setupEvents(): void {
    $all('[data-audio]')?.forEach((el) => {
      let id = el.getAttribute('data-audio-id')

      if (!id) {
        id = `${name}-${Date.now()}`
        el.setAttribute('data-audio-id', id)
      }

      this.attachAudioEvents(el, id)
    })
  }

  parseAudioAttributes(attributeValue: string): AudioOptions {
    const [name, ...options] = attributeValue.split(' ')
    const result: AudioOptions = { name }

    options.forEach((opt) => {
      if (opt === 'loop') result.loop = true
      else {
        const [key, value] = opt.split(':')
        if (['pan', 'fadeIn', 'fadeOut', 'rate', 'volume'].includes(key)) {
          result[key] = Number(value)
        }
      }
    })

    return result
  }

  attachAudioEvents(el: Element, id: string) {
    const audioAttributes = el.getAttributeNames().filter((attr) => attr.startsWith('data-audio-'))
    let loopCount = 0

    audioAttributes.forEach((attr) => {
      const evtType = attr.replace('data-audio-', '')
      const attributeValue = el.getAttribute(attr)

      if (evtType === 'stopon' && attributeValue) {
        const evts = attributeValue.split(' ') || []
        evts.forEach((e) => {
          el.addEventListener(e, () => this.stop(id))
        })
      }

      if (attributeValue && !['id', 'stopon'].includes(evtType)) {
        const { name, loop, pan = 0, fadeIn, fadeOut, rate = 1, volume = 1 } = this.parseAudioAttributes(attributeValue)

        if (!name) return
        if (loop) loopCount++
        if (loopCount > 1) console.warn(`Only one loop per element is allowed, has ${loopCount} instead: `, el)

        el.addEventListener(evtType, () => {
          if (Howler.ctx.state === 'running') {
            this.play(loop ? id : null, name, {
              volume,
              loop,
              pan,
              fadeIn,
              fadeOut,
              rate,
            })
          }
        })
      }
    })
  }

  getFrequency(inputValue: number) {
    const minValue = 40
    const maxValue = Howler.ctx.sampleRate / 2
    const numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2
    const multiplier = Math.pow(2, numberOfOctaves * (inputValue - 1.0))

    return maxValue * multiplier
  }
}

export default AudioWrapper
