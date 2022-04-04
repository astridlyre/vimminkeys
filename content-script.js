const SCROLL_LINE_COUNT = 1
const SCROLL_HORIZONTAL_PIXELS = 5
const normalize = (repetition) => (repetition == '' ? 1 : +repetition)

const actions = [
  { keyCombination: 'h', command: 'cmd_scrollLeft' },
  { keyCombination: 'j', command: 'cmd_scrollLineDown' },
  { keyCombination: 'k', command: 'cmd_scrollLineUp' },
  { keyCombination: 'l', command: 'cmd_scrollRight' },
  { keyCombination: 'G', command: 'cmd_scrollFileBottom' },
  { keyCombination: 'gg', command: 'cmd_scrollFileTop' },
  { keyCombination: 'gt', command: 'cmd_activateNextTab' },
  { keyCombination: 'gT', command: 'cmd_activatePreviousTab' },
  { keyCombination: 'H', command: 'cmd_historyBack' },
  { keyCombination: 'L', command: 'cmd_historyForward' },
]

const commands = {
  cmd_scrollLeft: function scrollLeft(repetition) {
    document.body.scrollLeft -= SCROLL_HORIZONTAL_PIXELS * normalize(repetition)
  },
  cmd_scrollRight: function scrollRight(repetition) {
    document.body.scrollLeft += SCROLL_HORIZONTAL_PIXELS * normalize(repetition)
  },
  cmd_scrollLineDown: function scrollLineDown(repetition) {
    window.scrollByLines(SCROLL_LINE_COUNT * normalize(repetition))
  },
  cmd_scrollLineUp: function scollLineUp(repetition) {
    window.scrollByLines(-SCROLL_LINE_COUNT * normalize(repetition))
  },
  cmd_scrollFileBottom: function scrollToBottom() {
    window.scrollTo(window.scrollX, document.body.scrollHeight)
  },
  cmd_scrollFileTop: function scrollToTop() {
    window.scrollTo(window.scrollX, 0)
  },
  cmd_activateNextTab: function activateNextTab(repetition) {
    browser.runtime.sendMessage({
      message: {
        to: 'background',
        command: 'activateNextTab',
        repetition,
      },
    })
  },
  cmd_activatePreviousTab: function activatePreviousTab(repetition) {
    browser.runtime.sendMessage({
      message: {
        command: 'activatePreviousTab',
        repetition,
      },
    })
  },
  cmd_historyForward: function historyForward() {
    window.history.forward()
  },
  cmd_historyBack: function historyBack() {
    window.history.back()
  },
}

//Store the longest action combination's length as the max length
const maxCombinationLength = actions.reduce(
  (acc, curr) => Math.max(curr.keyCombination.length, acc),
  0,
)
const numbers = []
const validKeys = new Set()
let repetition = ''
let keyCombination = ''

//Stringify numbers
for (let i = 0; i < 10; ++i) {
  numbers.push(`${i}`)
}

actions.map((action) => {
  for (let i = 0; i < action.keyCombination.length; ++i) {
    validKeys.add(action.keyCombination[i])
  }
})

/**
 * Resets the repetition and key combination histories
 * @method
 */
function resetHistory() {
  repetition = ''
  keyCombination = ''
}

/**
 * Runs an action
 * @param {vimmin~action} action
 */
function runAction(action) {
  commands[action.command](repetition)
  resetHistory()
}

function handleKeyEvents(event) {
  //Check if a number key is pressed (for repetition)
  if (numbers.includes(event.key)) {
    repetition += event.key
    return
  }

  //If a non-command key is pressed, bail
  if (!validKeys.has(event.key)) {
    resetHistory()
    return
  }

  //Store the key
  keyCombination += event.key

  // see if the key combination matches one of our vim command combinations
  const action = actions.find((value) => value.keyCombination == keyCombination)

  // bail if not supported action
  if (!action) {
    //If the combination length is reached the max length, there are no possible actions left.
    if (keyCombination.length == maxCombinationLength) resetHistory()
    return
  }

  // bail if in contenteditable elements, textareas, inputs, etc
  const contentEditable = event.target.getAttribute('contenteditable')
  const formElements = ['input', 'textarea', 'select']
  const isFormElement =
    formElements.indexOf(event.target.tagName.toLowerCase()) != -1

  if (contentEditable || isFormElement) {
    resetHistory()
    return
  }

  runAction(action)
}

document.addEventListener('keypress', handleKeyEvents, false)

/**
 * @typedef vimmin~action
 * @type {object}
 * @property {string} keyCombination The keystroke combination
 * @property {string} command The name of the command function
 */
