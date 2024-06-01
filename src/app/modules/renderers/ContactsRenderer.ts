import { $, $all, debounce, fitTextToContainerScr, showCursorMessage, splitTextChars, translateValidity } from '../../utils'
import gsap from 'gsap'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { TypewriterPlugin } from '../animations/TypeWriterPlugin'
import { EMAIL } from '../../constants'
import * as emailjs from '@emailjs/browser'

gsap.registerPlugin(TypewriterPlugin)

export default class ContactsRenderer extends BaseRenderer {
  experience: Experience
  tlStack: gsap.core.Timeline[]
  isFirstRender: boolean
  form: HTMLFormElement
  submitButton: HTMLElement
  sendingEmail: boolean
  textboxes: NodeListOf<HTMLInputElement>
  submitButtonInner: Element
  // Is this the actual page or the embedded version?
  isContactsPage: boolean
  static tl: gsap.core.Timeline

  initialLoad() {
    super.initialLoad()
  }

  onEnter() {
    super.onEnter()
    this.isFirstRender = true
    this.isDesktop = window.innerWidth > 1024
    this.isContactsPage = window.location.pathname.includes('/contact')

    emailjs.init(import.meta.env.EMAILJS_USER_KEY)

    this.tlStack = []

    const split = splitTextChars($('h1'), 'span')

    gsap.set('#smiley', { autoAlpha: 0 })
    gsap.set('h2', { autoAlpha: 0 })
    this.experience = new Experience()
    console.log(this.isContactsPage, window.location.pathname)
    if (this.isContactsPage) {
      window["bg-blur"].classList.remove('opacity-0')
    }
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
    ContactsRenderer.tl = gsap.timeline({})
    ContactsRenderer.tl.set('h2', { autoAlpha: 0 })

    const lettersTLduration = 0.1
    const lettersTL = gsap.timeline({ duration: lettersTLduration, delay: 0.9 })
    const splitArr = Array.from(split)

    const links = Array.from($all('#socials > *'))

    let remainingLetters = [...splitArr]
    splitArr.forEach((_, __, arr) => {
      //random letter
      const ri = Math.floor(Math.random() * remainingLetters.length)
      const rl = remainingLetters[ri]
      remainingLetters.splice(ri, 1)
      const randomDelay = Math.random() * lettersTLduration
      const ltl = gsap
        .timeline({ delay: randomDelay })
        .fromTo(
          rl,
          { alpha: 0 },
          {
            alpha: 1,
            duration: 0.05,
            repeat: 20 * Math.random(),
          },
          '<',
        )
        .fromTo(
          rl,
          {
            filter: 'blur(10px)',
          },
          {
            duration: 2.5 * Math.max(Math.random(), 0.2),
            ease: 'circ.inOut',
            filter: 'blur(0px)',
          },
          '<',
        )

      lettersTL.add(ltl, '<')
    })

    const linksTL = gsap.timeline().fromTo(
      links,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.045,
        stagger: {
          each: 0.15,
          repeat: 10,
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
            repeat: 15,
            each: 0.1,
          },
        },
        '<+20%',
      )
      .set('form > *', { clearProps: 'all' })

    ContactsRenderer.tl
      .fromTo(
        '.h2-bg',
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
        '.h2-bg',
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.06,
          repeat: 20,
        },
        '<',
      )
    ContactsRenderer.tl.set('h2', { autoAlpha: 1 }, '<+50%').to(
      'h2',
      {
        typewrite: {
          speed: 0.8,
          charClass: 'text-primary-lightest drop-shadow-glow',
        },
        ease: 'power4.inOut',
      },
      '<',
    )
    ContactsRenderer.tl.add(lettersTL)
    ContactsRenderer.tl.add(formTL, '<+30%')
    ContactsRenderer.tl.add(linksTL, '<+20%').set('#smiley', { autoAlpha: 1 })
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
    this.submitButtonInner = this.submitButton.children[0]

    this.textboxes.forEach((textbox) => {
      textbox.addEventListener('blur', this.handleTextboxBlur.bind(this))
      textbox.addEventListener('input', this.handleTextboxInput.bind(this))
    })
  }

  handleMouseLeave(event) {}

  handleTextboxBlur(event) {
    const textbox = event.target
    const wrapper = textbox.parentNode
    const isValid = textbox.validity.valid

    if (!textbox.value) {
      wrapper.classList.remove('textbox-wrapper-valid')
      wrapper.classList.remove('textbox-wrapper-invalid')
      return
    }
    if (!isValid) {
      wrapper.classList.remove('textbox-wrapper-valid')
      wrapper.classList.add('textbox-wrapper-invalid')

      let currErrorKey = ''
      for (const k in textbox.validity) {
        console.log(k, textbox.validity[k])
        if (textbox.validity[k]) {
          currErrorKey = k
        }
      }
      showCursorMessage({
        message: translateValidity(currErrorKey, textbox.name).toUpperCase(),
        isError: true,
        timeout: 2000,
      })
    }

    this.form.addEventListener('submit', this.handleFormSubmit.bind(this))
    this.updateButtonOpacity()
  }

  handleTextboxInput(event) {
    const textbox = event.target
    const wrapper = textbox.parentNode
    const isValid = textbox.validity.valid

    if (isValid) {
      wrapper.classList.remove('textbox-wrapper-invalid')
      wrapper.classList.add('textbox-wrapper-valid')
    }
    this.updateButtonOpacity()
    this.submitButtonInner.textContent = 'SEND IT'
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

  handleFormSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (this.sendingEmail) return
    this.sendingEmail = true

    //@TODO: RE-ENABLE
    // emailjs.sendForm(import.meta.env.EMAILJS_SERVICE_ID, import.meta.env.EMAILJS_TEMPLATE_ID, event.target as HTMLFormElement)
    //   .then(() => {
    //     showCursorMessage({ message: 'Sent!<br/>I\'ll get back to you ASAP.', timeout: 5000, isSuccess: true })
    //   }, (error) => {
    //     showCursorMessage({ message: 'ERROR: ' + error.text, timeout: 10_000, isError: true});
    //   }).finally(() => {
    //     this.sendingEmail = false
    //   })
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
  }

  //@TODO: add additional message element (cursor doesn't show on mobile)
}
