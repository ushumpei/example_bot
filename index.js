import Botkit from 'botkit';

const controller = Botkit.consolebot({ debug: true });
controller.on('message_received', (bot, message) => {
  bot.reply(message, 'Hello world!');
});
controller.spawn();
