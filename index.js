import Botkit from 'botkit'

const controller = Botkit.consolebot({ debug: false })
controller.setTickDelay(100)

controller.on('message_received', (bot, message) => {
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

    convo.addMessage('Thread 1', '1')
    convo.addQuestion('Do you wanna go to thread 2?', [
      {
        pattern: bot.utterances.yes,
        callback: (res, convo) => {
          convo.gotoThread('2')
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
    ], {}, '1')

    convo.addMessage('Thread 2', '2')
    convo.addQuestion('Do you wanna go to thread 3?', [
      {
        pattern: bot.utterances.yes,
        callback: (res, convo) => {
          convo.gotoThread('3')
        }
      },
      {
        default: true,
        callback: (res, convo) => {
          convo.repeat()
          convo.next()
        }
      }
    ], {}, '2')

    convo.addMessage('Thread 3', '3')
    convo.addQuestion('Which thread do you like?', [
      {
        pattern: '1',
        callback: (res, convo) => {
          convo.gotoThread('1')
        }
      },
      {
        pattern: '2',
        callback: (res, convo) => {
          convo.gotoThread('2')
        }
      },
      {
        default: true,
        callback: (res, convo) => {
          convo.gotoThread('complete')
        }
      }
    ], {}, '3')

    convo.addMessage('Conversation end', 'complete')
    convo.activate()
  })
})

controller.spawn()
