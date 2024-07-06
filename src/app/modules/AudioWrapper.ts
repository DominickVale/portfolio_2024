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

interface AudioOptions {
  name: string
  loop: boolean
  pan: number
  fadeIn: number
  fadeOut: number
}

class ExtendedHowl extends Howl {
  fadeState: 'in' | 'out' | 'none' = 'none'
  fadeIn?: number
  fadeOut?: number
}

class AudioWrapper {
  activeSounds: Map<string, ExtendedHowl>

  constructor() {
    this.activeSounds = new Map()
  }

  play(id: string, soundName: string, options: PlayOptions = {}): ExtendedHowl {
    const { loop = false, volume = 1, rate = 1, seek = 0, pan = 0, fadeIn = 0, fadeOut, onplay, onend, ...rest } = options

    const soundPath = window.app.experience.resources.items[soundName].path
    let sound = this.activeSounds.get(id) || new ExtendedHowl({ src: [soundPath], loop, ...rest })

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
    if (loop) this.activeSounds.set(id, sound)

    return sound
  }

  stop(id: string): void {
    const sound = this.activeSounds.get(id)

    console.log("Stopping: ", id, sound)
    if (!sound) throw new Error(`Sound ${id} not found`)

    const unload = () => {
      console.log("unloading: ", sound)
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
    const loop = options.includes('loop')
    const pan = Number(options.find((opt) => opt.startsWith('pan:'))?.replace('pan:', '') || 0)
    const fadeIn = Number(options.find((opt) => opt.startsWith('fadeIn:'))?.replace('fadeIn:', '') || 0)
    const fadeOut = Number(options.find((opt) => opt.startsWith('fadeOut:'))?.replace('fadeOut:', '') || 0)

    return {
      name,
      loop,
      pan,
      fadeIn,
      fadeOut,
    }
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
          console.log("Attaching stop evt: ", e)
          el.addEventListener(e, () => this.stop(id))
        })
      }


      if (attributeValue && !['id', 'stopon'].includes(evtType)) {
        const { name, loop, pan, fadeIn, fadeOut } = this.parseAudioAttributes(attributeValue)

        if(loop) loopCount++
        if(loopCount > 1) console.warn(`Only one loop per element is allowed, has ${loopCount} instead: `, el)

        el.addEventListener(evtType, () => {
          if (Howler.ctx.state === 'running') {
            this.play(loop ? id : null, name, {
              loop,
              pan,
              fadeIn,
              fadeOut,
            })
          }
        })
      }
    })
  }
}

export default AudioWrapper
