const { Telegraf } = require('telegraf')

const BotUser = require("../models/botUser");

const bot = new Telegraf('1425912102:AAEDzsUhbYQhbQUU3t1NvSehzaxWY-xN0Xc');

bot.start(async (ctx) => {  
    console.log('bot start pressed')
    let user = await BotUser.findOne({ chat_id: ctx.chat.id });
   
    if(!user){
        const newUser = {
            chat_id: ctx.chat.id,
            username: ctx.from.username
        };

        user = new BotUser(newUser);
        user.save((err, saved) => {
            if(err) console.log(err, ' ,error in telegram/index.js');
            if (saved) console.log('user saved');
        });

        bot.telegram.sendMessage(ctx.chat.id, 'Привет) Я бот который будет уведомлять тебя о новых заказах. ');
    }else{
        bot.telegram.sendMessage(ctx.chat.id, 'Ку) Зачем нажимаешь старт?');
    }
});

bot.launch()

module.exports = {
  bot
};
