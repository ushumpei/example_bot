import Botkit from 'botkit'

const controller = Botkit.consolebot({ debug: false })
controller.setTickDelay(100)

const names = ['name', 'email', 'age', 'sex', 'phone number']

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
    for (let i = 0; i < names.length; i++) {
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
            const to = jump || (i === names.length - 1) ? 'confirm' : names[i + 1]
            convo.gotoThread(to)
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
    convo.addMessage('Check your inputs')
    convo.addMessage(names.map(n => `${n}: {{vars.${n}}}`).join('\n'), 'confirm')
    convo.addQuestion(`Do you want to change inputs? (no/${names.join('/')})`, [
      ...(() => {
        const arr = []
        for (let i = 0; i < names.length; i++) {
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
