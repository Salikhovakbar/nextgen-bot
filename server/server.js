import TelegramBot from "node-telegram-bot-api";
import { survey } from "../database/questions.js";
import dotenv from 'dotenv'
dotenv.config() 
 
const bot = new TelegramBot(process.env.TOKEN, {polling: true})
const admin = process.env.ADMIN
const user = {}
const languages = ['🇷🇺 Русский', "🇺🇿 Uzbek"]
bot.onText(/\/start/, async msg => {
    try {
    const { id } = msg.from
    await bot.sendMessage(id, `Hello ${msg.from.first_name || msg.from.last_name}
Что-бы продолжить пожалуйста выберите язык 🇷🇺 что-бы записаться на наши курсы английского языка (Nextgen) 📚📖📕 

Davom etish uchun ingliz tili kurslariga (Nextgen) 📚📖📕 yozilish uchun tilni 🇺🇿 tanlang 
    `, {
        reply_markup: {
            keyboard: [
                [{text: '🇺🇿 Uzbek'}, {text: '🇷🇺 Русский'}]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    })  
    } catch (err) {
        await bot.sendMessage(msg.from.id, err.message)
    }
})

let count = 0


async function* generator(){
    while(true){
        let [id, question] = yield
        await bot.sendMessage(id, question)
    }
}

const genfun = generator()
genfun.next()
bot.on('message', async msg => {
try {
    const { id } = msg.from 
    if(msg.from.is_bot || msg.text == '/start') return ;
if(!user[id] || languages.includes(msg.text)){
     count = 0
     user[id]=[]
     await bot.sendMessage(id, msg.text == "🇺🇿 Uzbek" ? "Keling, so'rovimizni boshlaymiz va Nextgen oilasining 👨‍👨‍👦‍👦 bir qismi bo'lamiz": 'Давайте начнем наш опрос и станем частью семьи 👨‍👨‍👦‍👦 Nextgen')
    }
    user[id].push(msg.text)
if(count < survey.find(e => e.language.toLowerCase() == user[id][0].toLowerCase()).data.length) genfun.next([id, survey.find(e => e.language.toLowerCase() == user[id][0].toLowerCase()).data[count++]])
else{ await bot.sendMessage(id, `
Users information 👤

Student🎓: ${user[id][1]}
Age🔢: ${user[id][2]}
Contact📞: ${user[id][3]}
Level📊: ${user[id][4]}

Application written ✍️ by ${'@' + msg.from.username || user[id][1]}
ID: ${id}
`, {
    reply_markup: {
        inline_keyboard: [
            [{text: '✅', callback_data: 'yes'}, {text: '❌', callback_data: 'no'}]
        ]
    }
})
if(user[id][0] == '🇺🇿 Uzbek') return await bot.sendMessage(id, 'Kiritilgan malumot 👆 togrimi ℹ️✅?')
else return await bot.sendMessage(id, 'Ваша информация 👆 правильная ?')
}
} catch (err) {
    await bot.sendMessage(msg.from.id, err.message)
}
})

bot.on('callback_query', async msg => {
    try {
        const { id } = msg.from
        // console.log(msg.message)
        await bot.deleteMessage(msg.from.id,msg.message.message_id) 
        if(msg.data == 'yes'){
    if(id == admin){
        await bot.sendMessage(msg.message.text.split(' ')[msg.message.text.split(' ').length - 1], `Ваша Регистрация была подтверждена админом ✅, Nextgen поздравляет вас 🥳🎉! \n Sizning ro'yxatdan o'tganingiz admin tomonidan tasdiqlangan, Nextgen sizni tabriklaydi 🥳🎉!`)
    }
    else{
        await bot.sendMessage(admin, msg.message.text, {
            reply_markup: {
                inline_keyboard: [
                    [{text: '✅', callback_data: 'yes'}, {text: '❌', callback_data: 'no'}]
                ]
            }
        })
    }
  } else { 
    await bot.deleteMessage(msg.from.id,msg.message.message_id)
    if(id == admin){
        await bot.sendMessage(msg.message.text.split(' ')[msg.message.text.split(' ').length - 1], `Ваша Регистрация не была подтверждена админом ⛔️🚫😢! \nSizning ro'yxatdan o'tganingiz admin tomonidan tasdiqlanmadi ⛔️🚫😢!`)
        await bot.deleteMessage(msg.from.id,msg.message.message_id)
    }
}
    } catch (err) {
        await bot.sendMessage(msg.from.id, err.message)
    }
})