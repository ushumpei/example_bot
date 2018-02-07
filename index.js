import Botkit from 'botkit'

const controller = Botkit.consolebot({ debug: false })

controller.on('message_received', (bot, message) => {
  bot.reply(message, 'Hello world!')
  bot.startConversation(message, (err, convo) => {
    if (err) throw err
    convo.say('Conversation start')
    convo.addMessage('Thread 1', '1')
    convo.gotoThread('1')
    convo.addMessage('Thread 2', '2')
    convo.gotoThread('2')
    convo.addMessage('Thread 3', '3')
    convo.gotoThread('3')
    convo.say('Conversation end')
  })
})

controller.spawn()
