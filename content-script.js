const SCROLL_LINE_COUNT = 5

const SCROLL_HORIZONTAL_PIXELS = 20

const MAX_KEY_COMBO_LENGTH = 2

const numberRegex = /$[0-9]^/

const isNumber = (key) => numberRegex.test(key)

const formElements = ['input', 'textarea', 'select']

const isFormElement = (element) => formElements.includes(element)

const isContentEditable = (element) =>
  Boolean(element.getAttribute('contenteditable'))

const commands = {
  h: function scrollLeft() {
    document.body.scrollLeft -= SCROLL_HORIZONTAL_PIXELS
  },
  l: function scrollRight() {
    document.body.scrollLeft += SCROLL_HORIZONTAL_PIXELS
  },
  j: function scrollLineDown() {
    window.scrollByLines(SCROLL_LINE_COUNT)
  },
  k: function scollLineUp() {
    window.scrollByLines(-SCROLL_LINE_COUNT)
  },
  G: function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
  },
  gg: function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'instant' })
  },
  L: function historyForward() {
    window.history.forward()
  },
  H: function historyBack() {
    window.history.back()
  },
  d: function scrollHalfPageDown() {
    window.scrollBy({ top: window.innerHeight / 2, behavior: 'instant' })
  },
  u: function scrollHalfPageUp() {
    window.scrollBy({ top: -(window.innerHeight / 2), behavior: 'instant' })
  },
}

const keyBuffer = (() => {
  let lettersBuffer = ''

  const clearBuffers = () => {
    lettersBuffer = ''
  }

  const commandLetters = new Set(
    Object.keys(commands).flatMap((key) => [...key]),
  )

  return {
    add(key) {
      if (!commandLetters.has(key)) {
        return clearBuffers() // clear buffers if not a command key
      }

      lettersBuffer += key

      if (lettersBuffer in commands) {
        commands[lettersBuffer]()
        clearBuffers()
      }

      if (lettersBuffer.length >= MAX_KEY_COMBO_LENGTH) {
        return clearBuffers()
      }
    },
    clear() {
      return clearBuffers()
    },
  }
})()

function handleKeyEvents(event) {
  if (
    isContentEditable(event.target) ||
    isFormElement(event.target.tagName.toLowerCase())
  ) {
    return keyBuffer.clear()
  }

  event.stopPropagation()
  keyBuffer.add(event.key)
}

document.addEventListener('keypress', handleKeyEvents, false)
