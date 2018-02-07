import Botkit from 'botkit'

const controller = Botkit.consolebot({ debug: true })

controller.on('message_received', (bot, message) => {
  bot.reply(message, 'Hello world!')
  bot.startConversation(message, (err, convo) => {
    if (err) throw err
    convo.say('Conversation start')
    convo.say('Conversation end')
  })
})

controller.spawn()
