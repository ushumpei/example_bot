import Botkit from 'botkit'

const controller = Botkit.consolebot({ debug: false })
controller.setTickDelay(100)

controller.hears(/^\d+$/, ['message_received'], (bot, message) => {
  if (message.text <= 0) return bot.reply(message, 'Please enter a non zero positive number')
  bot.reply(message, 'Hello world!')
  bot.createConversation(message, (err, convo) => {
    if (err) throw err
    convo.say('Conversation start')
    convo.ask('Do you wanna go to thread 1?', [
      {
        pattern: bot.utterances.yes,
        callback: (res, convo) => {
          convo.gotoThread('1')
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

    const loop = message.text
    let jump
    for (let i = 1; i < loop; i++) {
      convo.addMessage(`Thread ${i}`, `${i}`)
      convo.addQuestion(`Do you wanna go to thread ${i + 1}?`, [
        {
          pattern: bot.utterances.yes,
          callback: (res, convo) => {
            convo.gotoThread(jump || `${i + 1}`)
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
      ], {}, `${i}`)
    }

    convo.addMessage(`Thread ${loop}`, `${loop}`)
    convo.addQuestion('Which thread do you like?', [
      ...((l) => {
        const arr = []
        for (let i = 1; i < l; i++) {
          arr.push({
            pattern: `${i}`,
            callback: (res, convo) => {
              jump = `${loop}`
              convo.gotoThread(`${i}`)
            }
          })
        }
        return arr
      })(loop),
      {
        default: true,
        callback: (res, convo) => {
          convo.gotoThread('complete')
        }
      }
    ], {}, `${loop}`)

    convo.addMessage('Conversation end', 'complete')
    convo.activate()
  })
})

controller.hears(/[^\d]*/, ['message_received'], (bot, message) => {
  bot.reply(message, 'Please enter a non zero positive number')
})

controller.spawn()
