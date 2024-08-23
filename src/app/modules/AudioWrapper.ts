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
  id: string
  name?: string
  fadeState: 'in' | 'out' | 'none' = 'none'
  fadeIn?: number
  fadeOut?: number
}

class AudioWrapper {
  activeSounds: Map<string, ExtendedHowl>
  backgroundMusic: ExtendedHowl
  enabled: boolean
  soundLabelEl: HTMLElement

  constructor() {
    this.activeSounds = new Map()
    this.enabled = localStorage.getItem('soundEnabled') === 'true'
    this.soundLabelEl = $('#sound-toggled-label')
    this.soundLabelEl.innerText = `SOUND ${ this.enabled ? "ON" : "OFF" }`
  }

  toggle() {
    console.log("enabled?", this.enabled)
    if (this.enabled) this.disable()
    else {
      this.enable()
      this.playBgMusic()
    }
  }

  enable() {
    this.enabled = true
    this.soundLabelEl.innerText = 'SOUND ON'
    // save setting to localstorage
    localStorage.setItem('soundEnabled', 'true')
  }

  disable() {
    this.enabled = false
    this.activeSounds.forEach((s) => this.stop(s.id))
    this.soundLabelEl.innerText = 'SOUND OFF'
    localStorage.setItem('soundEnabled', 'false')
  }

  playBgMusic() {
    if (!this.enabled) {
      console.warn('Audio not enabled, cant start bg music')
    }
    this.play('background', 'song', {
      volume: 0.5,
      loop: true,
    })
  }

  play(id: string | null, soundName: string, options: PlayOptions = {}): ExtendedHowl {
    if (!this.enabled) return
    const { loop = false, volume = 1, seek = 0, pan = 0, fadeIn = 0, fadeOut, onplay, onend, sprite, ...rest } = options

    const soundPath = window.app.experience.resources!.items[soundName]?.path

    if (!soundPath) {
      console.warn('Sound not found: ', soundName)
      return
    }
    let sound = (id && this.activeSounds.get(id)) || new ExtendedHowl({ src: [soundPath], loop, sprite, ...rest })

    sound.name = soundName
    sound.fadeIn = fadeIn
    sound.fadeOut = fadeOut
    sound.id = id

    if (sound.fadeState === 'out') {
      gsap.killTweensOf(sound)
      sound.fadeState = 'none'
    }
    if (sound.state() === 'unloaded') {
      sound.load()
    }

    if (id === 'background') {
      sound.filterType('lowpass')
      sound.frequency(this.getFrequency(1))
      this.backgroundMusic = sound
    } else if (soundName === 'vibration' && this.backgroundMusic) {
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

    if (sprite) {
      const soundFile = Math.floor(Math.random() * 3).toString()
      sound.play(soundFile)
    } else {
      sound.play()
    }

    if (window.app.debug) console.log('[AUDIO] Playing', soundName, id, '\nwith options: ', options, '\ninner howler:', sound)
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
    sound.on('end', (iid) => {
      if (!this.activeSounds.get(id)) {
        sound.stop(iid)
        if (onend) onend(sound)
      }
    })
    if (seek) sound.seek(seek)
    if (loop) {
      if (!id) throw new Error('Looping requires an id')
      this.activeSounds.set(id, sound)
    }

    return sound
  }

  stop(id: string): void {
    const sound = this.activeSounds.get(id)

    if (!sound) {
      console.warn('Sound not found: ', id)
      return
    }

    const unload = () => {
      sound.stop()
      sound.fadeState = 'none'
      sound.unload()
      this.activeSounds.delete(id)
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

    if (sound.name === 'vibration' && this.backgroundMusic) {
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
    $all('[data-audio]')?.forEach((el, i) => {
      let id = el.getAttribute('data-audio-id')

      if (!id) {
        id = `${name}-${Date.now() + i}`
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
          const disabled = el.getAttribute('data-audio-disabled')

          if (Howler.ctx.state === 'running' && !disabled) {
            this.play(loop ? id : null, name, {
              volume,
              loop,
              pan,
              fadeIn,
              fadeOut,
              rate,
            })
          }

          // this is another hack to prevent audio playing on hover after a transition
          if(evtType === 'click' || evtType === 'mousedown'){
            el.setAttribute('data-audio-disabled', 'true')
            setTimeout(() => {
              el.removeAttribute('data-audio-disabled')
            }, 1000)
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

  muffleMusic(muffle: boolean) {
    if (!this.backgroundMusic) return
    const tmp = { v: muffle ? 1 : 0.2 }
    gsap.to(tmp, {
      v: muffle ? 0.2 : 1,
      duration: 3,
      onUpdate: () => {
        this.backgroundMusic.frequency(this.getFrequency(tmp.v))
      },
    })
  }
}

export default AudioWrapper
