import Botkit from 'botkit'

const controller = Botkit.consolebot({ debug: false })
controller.setTickDelay(100)

const names = ['name', 'email', 'age', 'sex', 'phone number', 'confirm']

controller.hears(['start', 'ok', 'go'], ['message_received'], (bot, message) => {
  bot.createConversation(message, (err, convo) => {
    if (err) throw err
    convo.say('Hello')

    convo.ask('Please answer some questions (ok/not)', [
      {
        pattern: bot.utterances.yes,
        callback: (res, convo) => {
          convo.gotoThread(`${names[0]}`)
        }
      },
      {
        pattern: bot.utterances.no,
        callback: (res, convo) => {
          convo.gotoThread('complete')
        }
      },
      {
        default: true,
        callback: (res, convo) => {
          convo.repeat()
          convo.next()
        }
      }
    ])

    let jump
    for (let i = 0; i < names.length - 1; i++) {
      convo.addQuestion(`What is your ${names[i]}`, [
        {
          pattern: /^(quit|cancel)$/,
          callback: (res, convo) => {
            convo.gotoThread('complete')
          }
        },
        {
          pattern: /^(.+)$/,
          callback: (res, convo) => {
            convo.gotoThread(jump || `${names[i + 1]}`)
          }
        },
        {
          default: true,
          callback: (res, convo) => {
            convo.repeat()
            convo.next()
          }
        }
      ], { key: `${names[i]}` }, `${names[i]}`)
    }

    convo.beforeThread('confirm', (convo, next) => {
      names.forEach(n => {
        convo.setVar(n, convo.extractResponse(n))
      })
      next()
    })

    convo.addMessage('Thank you', 'confirm')
    convo.addMessage(names.slice(0, names.length - 1).map(n => `${n}: {{vars.${n}}}`).join('\n'), 'confirm')
    convo.addQuestion(`Do you want to change inputs? (no/${names.slice(0, names.length - 1).join('/')})`, [
      ...(() => {
        const arr = []
        for (let i = 0; i < names.length - 1; i++) {
          arr.push({
            pattern: `${names[i]}`,
            callback: (res, convo) => {
              jump = 'confirm'
              convo.gotoThread(`${names[i]}`)
            }
          })
        }
        return arr
      })(),
      {
        pattern: bot.utterances.no,
        callback: (res, convo) => {
          convo.gotoThread('complete')
        }
      },
      {
        default: true,
        callback: (res, convo) => {
          convo.repeat()
          convo.next()
        }
      }
    ], {}, 'confirm')

    convo.addMessage('Bye', 'complete')
    convo.activate()
  })
})

controller.hears(/^(?!.*(start|ok|go)).+$/, ['message_received'], (bot, message) => {
  bot.reply(message, 'Please enter "start"')
})

controller.spawn()
