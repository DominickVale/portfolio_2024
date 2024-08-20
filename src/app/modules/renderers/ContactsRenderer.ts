import { $, $all, clamp, debounce, fitTextToContainerScr, showCursorMessage, splitTextChars, translateValidity } from '../../utils'
import gsap from 'gsap'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { TypewriterPlugin } from '../animations/TypeWriterPlugin'
import { EMAIL, INPUT_SOUND_SPRITES } from '../../constants'
import * as emailjs from '@emailjs/browser'
import { blurStagger } from '../animations/gsap'

gsap.registerPlugin(TypewriterPlugin)

export default class ContactsRenderer extends BaseRenderer {
  internalRenderer: ContactsInternalRenderer
  static enterTL: gsap.core.Timeline
  initialLoad() {
    super.initialLoad()
  }

  onEnter() {
    super.onEnter()
    ContactsRenderer.enterTL = gsap.timeline({ paused: true })
    this.internalRenderer = new ContactsInternalRenderer(this.isDesktop, ContactsRenderer.enterTL)
    this.internalRenderer.onEnter()
  }
}

// Special case of reusable renderer. (Contacts is re-used under the blog article pages)
export class ContactsInternalRenderer {
  experience: Experience
  tlStack: gsap.core.Timeline[]
  isFirstRender: boolean
  form: HTMLFormElement
  submitButton: HTMLElement
  sendingEmail: boolean
  textboxes: NodeListOf<HTMLInputElement>
  // Is this the actual page or the embedded version?
  isContactsPage: boolean
  tl: gsap.core.Timeline

  constructor(
    public isDesktop: boolean,
    tl: gsap.core.Timeline,
  ) {
    this.tl = tl
  }

  onEnter() {
    this.isFirstRender = true
    this.isContactsPage = window.location.pathname.includes('/contact')

    emailjs.init(import.meta.env.PUBLIC_EMAILJS_USER_KEY)

    this.tlStack = []

    this.experience = new Experience()
    this.setupForm()
    $('#email-button').addEventListener('click', (e) => {
      navigator.clipboard.writeText(EMAIL)
      setTimeout(() => {
        showCursorMessage({
          message: 'Copied to clipboard!<br/>See you soon :)',
          timeout: 5000,
          isSuccess: true,
        })
      }, 200)
      gsap.to($('#email-button-text'), {
        typewrite: {
          speed: 1,
          charClass: 'text-primary-lightest',
        },
        ease: 'circ.inOut',
      })
    })

    return this.prepareAnimations()
  }

  onEnterCompleted() {
    // run after the transition.onEnter has fully completed
  }

  onLeave() {
    // run before the transition.onLeave method is called
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
  }

  ////////////////////////////////

  setupForm() {
    this.sendingEmail = false
    this.form = $('form') as HTMLFormElement
    if (!this.form) return
    this.textboxes = $all('.textbox') as NodeListOf<HTMLInputElement>
    this.submitButton = $('#send', this.form)

    this.textboxes.forEach((textbox) => {
      textbox.addEventListener('blur', this.handleTextboxBlur.bind(this))
      textbox.addEventListener('input', this.handleTextboxInput.bind(this))
      textbox.addEventListener('focusin', this.handleTextboxFocus.bind(this))
    })
  }

  handleMouseLeave(event) {}

  handleTextboxFocus(event) {
    window.app.audio.play(null, 'input-sprite', {
      volume: 0.3,
      //@ts-ignore
      sprite: INPUT_SOUND_SPRITES,
    })
  }

  handleTextboxBlur(event) {
    const textbox = event.target
    const wrapper = textbox.parentNode
    const isValid = textbox.validity.valid
    const errorMessageElement = document.getElementById(`${textbox.name}-error`)

    if (!textbox.value) {
      wrapper.classList.remove('textbox-wrapper-valid')
      wrapper.classList.remove('textbox-wrapper-invalid')
      textbox.removeAttribute('aria-invalid')
      errorMessageElement.textContent = ''
      return
    }

    if (!isValid) {
      wrapper.classList.remove('textbox-wrapper-valid')
      wrapper.classList.add('textbox-wrapper-invalid')
      textbox.setAttribute('aria-invalid', 'true')

      let currErrorKey = ''
      for (const k in textbox.validity) {
        if (textbox.validity[k]) {
          currErrorKey = k
        }
      }

      window.app.audio.play(null, 'error', {
        volume: 0.2,
      })

      const errorMessage = translateValidity(currErrorKey, textbox.name).toUpperCase()
      showCursorMessage({
        message: errorMessage,
        isError: true,
        timeout: 2000,
      })
      errorMessageElement.textContent = errorMessage
    } else {
      wrapper.classList.remove('textbox-wrapper-invalid')
      wrapper.classList.add('textbox-wrapper-valid')
      textbox.removeAttribute('aria-invalid')
      errorMessageElement.textContent = ''
    }

    this.form.addEventListener('submit', this.handleFormSubmit.bind(this))
    this.updateButtonOpacity()
  }

  handleTextboxInput(event) {
    const textbox = event.target
    const wrapper = textbox.parentNode
    const isValid = textbox.validity.valid

    window.app.audio.play(null, 'input-sprite', {
      volume: 0.6,
      //@ts-ignore
      sprite: INPUT_SOUND_SPRITES,
    })

    if (isValid) {
      wrapper.classList.remove('textbox-wrapper-invalid')
      wrapper.classList.add('textbox-wrapper-valid')
    }
    this.updateButtonOpacity()
    this.submitButton.textContent = 'SEND IT'
  }

  updateButtonOpacity() {
    const allValid = Array.from(this.textboxes).every((textbox) => textbox.validity.valid)
    if (allValid) {
      this.submitButton.classList.remove('btn--disabled')
      this.submitButton.classList.add('btn--enabled')
    } else {
      this.submitButton.classList.remove('btn--enabled')
      this.submitButton.classList.add('btn--disabled')
    }
  }

  async handleFormSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (this.sendingEmail) return
    this.sendingEmail = true

    try {
      await emailjs.sendForm(import.meta.env.PUBLIC_EMAILJS_SERVICE_ID, import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID, event.target as HTMLFormElement)
      showCursorMessage({ message: "Sent!<br/>I'll get back to you ASAP.", timeout: 5000, isSuccess: true })

      gsap.to('#send button', {
        typewrite: {
          value: 'SENT!',
          speed: 0.4,
          charClass: 'text-primary-lightest drop-shadow-glow',
        },
        ease: 'power4.inOut',
        onComplete: () => {
          this.textboxes.forEach((textbox) => {
            const wrapper = textbox.parentNode as HTMLElement
            textbox.value = ''
            wrapper.classList.remove('textbox-wrapper-valid')
            wrapper.classList.remove('textbox-wrapper-invalid')
          })
          this.submitButton.classList.remove('btn--enabled')
          this.submitButton.classList.add('btn--disabled')
          setTimeout(() => {})
        },
      })
    } catch (e) {
      showCursorMessage({ message: 'ERROR: ' + (e.text || e), timeout: 10_000, isError: true })
    }
    this.sendingEmail = false
  }

  ////////   ANIMS   ////////
  prepareAnimations() {
    // scoped selector
    const s = (query: string) => $(query, $(this.isContactsPage ? 'main' : '#contacts'))

    gsap.set(s('h2:not(.shadow)'), { autoAlpha: 0 })
    gsap.set('#smiley', { autoAlpha: 0 })
    gsap.set('#or', { autoAlpha: 0 })

    const lettersTL = blurStagger(s('h1'))

    const links = Array.from($all('#socials > *'))

    const linksTL = gsap.timeline().fromTo(
      links,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.045,
        stagger: {
          each: 0.08,
          repeat: window.app.reducedMotion ? 2 : 6,
          from: 'random',
        },
        ease: 'circ.inOut',
        onComplete: function () {
          gsap.set(this.targets(), { clearProps: 'all' })
        },
      },
    )

    const formTL = gsap
      .timeline()
      .from('form > *', {
        translateX: '-100vw',
        duration: 0.25,
        stagger: 0.1,
        ease: 'power4.out',
      })
      .fromTo(
        'form > * ',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.05,
          stagger: {
            repeat: window.app.reducedMotion ? 3 : 15,
            each: 0.1,
          },
        },
        '<+20%',
      )
      .set('form > *', { clearProps: 'all' })

    if (this.isContactsPage) {
      if (window.app.preloaderFinished) {
        gsap.set('#bg-blur', { opacity: 1 })
        ContactsRenderer.enterTL.play()
      } else {
        window.addEventListener('preload-end', () => {
          gsap.set('#bg-blur', { opacity: 1 })
          ContactsRenderer.enterTL.play()
        })
      }
    }

    return (
      this.isContactsPage
        ? this.tl
        : gsap.timeline({
            scrollTrigger: {
              trigger: '#contacts',
              start: 'top center',
            },
          })
    )
      .fromTo(
        s('.h2-bg'),
        {
          scaleX: 0,
        },
        {
          delay: 0.5,
          scaleX: 1,
          duration: 1.5,
          ease: 'circ.inOut',
        },
      )
      .fromTo(
        s('.h2-bg'),
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.06,
          repeat: window.app.reducedMotion ? 2 : 20,
        },
        '<',
      )
      .set(s('h2:not(.shadow)'), { autoAlpha: 1 }, '<+50%')
      .to(
        s('h2:not(.shadow)'),
        {
          typewrite: {
            speed: 0.8,
            charClass: 'text-primary-lightest drop-shadow-glow',
          },
          ease: 'power4.inOut',
        },
        '<',
      )
      .add(lettersTL)
      .add(this.isDesktop ? formTL : linksTL, '<+30%')
      .to('#or', { autoAlpha: 1, duration: this.isDesktop ? 0 : 1, ease: 'power4.in' }, this.isDesktop ? '<' : '<+30%')
      .add(this.isDesktop ? linksTL : formTL, '<+30%')
      .to('#smiley', { autoAlpha: 1, duration: 1, ease: 'power4.in' })
  }
}
