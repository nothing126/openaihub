import { Telegraf,session} from 'telegraf';
import { Markup} from 'telegraf';
import {openai} from "./openai.js";

import {code} from "telegraf/format";
import {oga} from './oga.js';
import {RandN} from "./rand.js";

import {downloadImage}  from "./image.js"
import {remove_file} from "./remove.js";
import {  tgKey } from './config.js';

import {message} from "telegraf/filters";
import{writeToLogFile} from './logwriter.js'
import {errToLogFile} from "./errwriter.js";

import{loadUserData} from'./loaddata.js';
import {plus_count}from "./plus_count.js"
import {remove_user} from "./remove_user.js";

import {plus_limit} from "./plus_limit.js";
import {addUser} from "./new_user.js";
import {owner_id} from "./config.js";

const bot = new Telegraf(tgKey)

const INITIAL_SESSION= {
    messages: [],
}

bot.use(session())


bot.command('start', async (ctx)=>{
    ctx.session = INITIAL_SESSION
    const userId = ctx.from.id;

    await writeToLogFile(`User: ${ctx.message.from.id} enter start command`)
    try
    {
        const usersData = await loadUserData();
        const count = usersData[userId].messageCount
        const limit = usersData[userId].messageLimit
        if (usersData[userId] && count < limit)
        {
                await ctx.reply('здравствуйте, выберите режим', Markup.inlineKeyboard([
                    [Markup.button.callback('Разговор с ChatGPT', 'gpt')],
                    [Markup.button.callback('Генерация картинок', 'dalle')],
                    [Markup.button.callback('анализ картинки', 'vision')],
                    [Markup.button.callback('голос в текст', 'v2t')],

                ]))
            }else
            {
                await ctx.reply('Вы достигли лимита сообщений.');
            }
    }catch (e)
    {
        await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
        await errToLogFile(`ERROR WHILE START COMMAND: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} , 
        FILE: main.js}`)

    }
})

bot.command('admin', async (ctx)=>{
    ctx.session= INITIAL_SESSION
    const user_id = ctx.from.id
    try{
    if (user_id == owner_id ){
    ctx.reply("вы вошли в режим администратора" , Markup.inlineKeyboard([
        [Markup.button.callback('удалить пользователя', 'delete_user')],
        [Markup.button.callback('добавить пользователя', 'add_user')],
        [Markup.button.callback('повысить лимит пользователя', 'increase_limit')],
        [Markup.button.callback('список пользователей', 'user_list')]
    ]
    ))
    }else{
         await ctx.reply("кажется у вас недостаточно прав для совершения это действия, прошу обратиться к администратору")
    }
    }catch (e) {
        await ctx.reply("что-то не так")
         await errToLogFile(`ERROR WHILE ADMIN COMMAND (LIMIT) COMMAND: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} , 
        FILE: main.js}`
    )
    }
})

bot.action('delete_user', async (ctx)=>{
    ctx.session ??= INITIAL_SESSION;
    try {
        ctx.session.mode = 'delete_user'
        await ctx.reply("выбери кого удалить:")
        const userData = await loadUserData();
        for (const key in userData)
        {
            if (!isNaN(Number(key)))
            {
                await ctx.reply(`пользователь: ${key} `);
            }
        }
        await ctx.reply("-------------------------------")
    }catch (e)
    {
        await ctx.reply('Что-то пошло не так')
        await errToLogFile(`ERROR WHILE PROCESSING DELETE USER STATE: {
        User: ${ctx.message.from.id}
         ERROR: ${e} ,
          FILE: main.js}`)
    }
})

bot.action('increase_limit', async (ctx)=>{
    ctx.session ??= INITIAL_SESSION;
    try {
        ctx.session.mode = 'increase_limit'
        await ctx.reply("для кого повысить лимит")
        const userData = await loadUserData();
        for (const key in userData)
        {
            if (!isNaN(Number(key)))
            {
                await ctx.reply(`пользователь: ${key} `);
            }
        }
        await ctx.reply("-------------------------------")
    }catch (e)
    {
        await ctx.reply('Что-то пошло не так')
        await errToLogFile(`ERROR WHILE PROCESSING DELETE USER STATE: {
        User: ${ctx.message.from.id}
         ERROR: ${e} ,
          FILE: main.js}`)
    }
})
bot.action('user_list', async (ctx) =>{
    try{
        ctx.session.mode = 'user_list'
         ctx.reply("список пользователей:")
        const userData = await loadUserData();
        for (const key in userData)
        {
            if (!isNaN(Number(key)))
            {
                await ctx.reply(`пользователь: ${key} `);
            }
        }
        await ctx.reply("-------------------------------")
    }catch (e)
    {
        await ctx.reply('Что-то пошло не так')
        await errToLogFile(`ERROR WHILE PROCESSING USER LIST STATE: {
        User: ${ctx.message.from.id}
         ERROR: ${e} ,
          FILE: main.js}`)
    }
})


bot.action('gpt', async (ctx) => {
    ctx.session ??= INITIAL_SESSION;
    try
    {
        ctx.session.mode = 'gpt';
        await ctx.reply("Отправьте свой запросдля ChatGPT в текстовом или аудио формате");
    }catch (e)
    {
        await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
        await errToLogFile(`ERROR WHILE PROCESSING DALLE STATE: {
        User: ${ctx.message.from.id}
         ERROR: ${e} ,
          FILE: main.js}`)
    }
});


bot.action('dalle', async (ctx) => {
    ctx.session ??= INITIAL_SESSION;
    try
    {
        ctx.session.mode = 'dalle';
        await ctx.reply('Отправьте ваш ваш запрос в текстовом или аудио формате для генерации картинок');
    }catch (e)
    {
        await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
        await errToLogFile(`ERROR WHILE PROCESSING DALLE STATE: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} , 
        FILE: main.js}`)

    }
});


bot.action('v2t', async (ctx) => {
    ctx.session ??= INITIAL_SESSION;
    try
    {
        ctx.session.mode = 'v2t';
        await ctx.reply('Отправьте или перешлите голосовое сообщение для перевода голос в текст');
    }catch (e)
    {
        await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
        await errToLogFile(`ERROR WHILE PROCESSING  V2T STATE: {
        User: ${ctx.message.from.id}
         ERROR: ${e} , 
         FILE: main.js}`)
    }
});
bot.action('vision', async (ctx) => {
    ctx.session ??= INITIAL_SESSION;
    try
    {
        ctx.session.mode = 'vision';
        await ctx.reply('отправьте картинку для анализа');
    }catch (e)
    {
        await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
        await errToLogFile(`ERROR WHILE PROCESSING  IMAGE STATE: {
        User: ${ctx.message.from.id}
         ERROR: ${e} , 
         FILE: main.js}`)
    }
});
bot.action('add_user', async (ctx)=>{
try{
    ctx.session.mode = 'add_user';
    ctx.reply("введите id нужного пользователя")
}catch (e)
{
    await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
    await errToLogFile(`ERROR WHILE PROCESSING ADD USER STATE: {
        User: ${ctx.message.from.id}
         ERROR: ${e} , 
         FILE: main.js}`)
}
})


bot.on(message('text'), async (ctx) => {
    try {
        const userId = ctx.from.id;
        const usersData = await loadUserData();
        const count = usersData[userId].messageCount
        const limit = usersData[userId].messageLimit
        if (usersData[userId] && count < limit)
        {

            ctx.session ??= INITIAL_SESSION;

            switch (ctx.session.mode) {
                case 'gpt':
                    await GPT_t(ctx)
                    break;

                case 'dalle':
                    await dalle_t(ctx)
                    break;

                case 'v2t':
                    await v2t_t(ctx)
                    break;

                case 'vision':
                    await vision_t(ctx)
                    break;

                case 'delete_user':
                    await delete_user(ctx)
                    break;

                case 'increase_limit':
                    await increase_limit(ctx)
                    break;

                case 'add_user':
                    await add_user(ctx)
                    break;

                default:
                    await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
            }
        }else
        {
            ctx.reply("вы достигли лимита сообщений")
        }
    } catch (e)
    {
        await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
        await errToLogFile(`ERROR WHILE HANDLING TEXT MESSAGE: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} ,
         FILE: main.js}`)
    }});


bot.on(message('voice'), async (ctx) => {
    try {
        const userId = ctx.from.id;
        const usersData = await loadUserData();
        const count = usersData[userId].messageCount
        const limit = usersData[userId].messageLimit
        if (usersData[userId] && count < limit)
        {
            ctx.session ??= INITIAL_SESSION;

            switch (ctx.session.mode) {
                case 'gpt':
                    await GPT_v(ctx)
                    break;

                case 'dalle':
                    await dalle_v(ctx)
                    break;

                case 'v2t':
                    await v2t_v(ctx)
                    break;

                case 'vision':
                    await vision_v(ctx)
                    break;

                default:
                    await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
            }
        }else
        {
            ctx.reply("вы достигли лимита сообщений")
        }
    } catch (e)
    {
        await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
        await errToLogFile(`ERROR WHILE HANDLING VOICE MESSAGE: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} , 
        FILE: main.js}`)

    }
});

bot.on(message('photo'), async (ctx)=>{
    ctx.session ??= INITIAL_SESSION;
    try {
        switch (ctx.session.mode) {
            case 'vision':
                await get_href(ctx)
                break;
        }
    }catch (e)
    {
        await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
        await errToLogFile(`ERROR WHILE HANDLING PICTURE: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} , 
        FILE: main.js}`)
    }
})

async function vision_t(ctx){
    ctx.session ??= INITIAL_SESSION;
try 
{
    const userId = ctx.from.id;
    const usersData = await loadUserData();
    const count = usersData[userId].messageCount
    const limit = usersData[userId].messageLimit
    if (usersData[userId] && count < limit)
    {
        await plus_count(userId, 1)
        await writeToLogFile(`User: ${ctx.message.from.id} make GPT-vision text request`)
        await ctx.reply("запрос принял, ожидайте")
        ctx.session.messages.push({
            text: ctx.message.text
        })
        const resp = await openai.gptvision(ctx.session.messages[0].link, ctx.session.messages[1].text)
        await ctx.reply(resp.message.content, Markup.inlineKeyboard([
                Markup.button.callback('Выйти', 'exit'),
            ]
        ))
    }else
    {
    ctx.reply('Вы достигли лимита сообщений.');
     }
}catch (e)
{
    await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
    await errToLogFile(`ERROR WHILE TEXT REQUEST TO GPT-VISION: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} , 
        FILE: main.js}`)

}
}

async function delete_user(ctx){
    ctx.session ??= INITIAL_SESSION;
    try{
        const text = ctx.message.text
        try {
            await remove_user(text)
            ctx.reply("пользователь успешно удален")
        }catch (e) {
            ctx.reply("действие не выполнено, повторите попытку")
        }

    }catch (e) {
      await ctx.reply("что то пошло не так")
        await errToLogFile(`ERROR WHILE DELETING USER: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} , 
        FILE: main.js}`)

    }
}

async function increase_limit(ctx){
    ctx.session ??= INITIAL_SESSION;
    try {
       const text = ctx.message.text
        try {
            await plus_limit(text, 10 )
             await ctx.reply("лимит успешно повышен на 10 запросов")
        }catch (e) {
            await ctx.reply("что-то не так, повтори попытку")
        }
    }catch (e) {
        await ctx.reply("что то пошло не так")
        await errToLogFile(`ERROR WHILE INCREASING LIMIT: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} , 
        FILE: main.js}`)

    }
}

async function add_user(ctx){
    ctx.session ??= INITIAL_SESSION
    try{
        const new_user_id = ctx.message.text
        try{
        await addUser(new_user_id)
            ctx.reply(`пользователь ${new_user_id} успешно добавлен`)
        }catch (e) {
            ctx.reply("ошибка при добавлении пользователя")
        }
    }catch (e) {
        await ctx.reply("что то пошло не так")
        await errToLogFile(`ERROR WHILE ADDING USER: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} , 
        FILE: main.js}`)
    }
}
async function vision_v(ctx){
    ctx.session ??= INITIAL_SESSION;
    try
    {
    const userId = ctx.from.id;
    const usersData = await loadUserData();
    const count = usersData[userId].messageCount
    const limit = usersData[userId].messageLimit
    if (usersData[userId] && count < limit)
    {
        await ctx.reply("запрос принял, ожидайте")
        await plus_count(userId, 1)
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const user_id = String(ctx.message.from.id)
        const ogaPath = await oga.create(link.href, user_id)
        const filename = await RandN()
        const mp3Path = await oga.toMp3(ogaPath, filename)
        const txt = await openai.transcription(mp3Path)
        await ctx.reply(`Ваш запрос: ${String(txt)}`)
        ctx.session.messages.push({
            text: txt

        })
        const resp = await openai.gptvision(ctx.session.messages[0].link, ctx.session.messages[1].text)
        await ctx.reply(resp.message.content, Markup.inlineKeyboard([
                Markup.button.callback('Выйти', 'exit'),
            ]
        ))
    }else
    {
        ctx.reply("вы достигли лимита сообщений")
    }

}catch (e) {
        await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
        await errToLogFile(`ERROR WHILE VOICE REQUEST TO GPT-VISION: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} , 
        FILE: main.js}`)
}
}
async function get_href(ctx){
    try
    {
        ctx.session ??= INITIAL_SESSION
        ctx.session.messages.splice(0, ctx.session.messages.length);
        await ctx.reply("получил фотографию")
        const link = await ctx.telegram.getFileLink(ctx.message.photo[0].file_id);
        const link1= link.href
        await ctx.reply("отправьте свой запрос")
        ctx.session.messages.push({
            link: link1
        })

    }catch (e)
    {
        await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
        await errToLogFile(`ERROR WHILE RECEIVING HREF: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} , 
        FILE: main.js}`)
    }

}
async function GPT_t(ctx){
    ctx.session ??= INITIAL_SESSION
    try
    {
        const userId = ctx.from.id;
        ctx.session.messages.splice(0, ctx.session.messages.length);
        const usersData = await loadUserData();
        const count = usersData[userId].messageCount
        const limit = usersData[userId].messageLimit
        if (usersData[userId] && count < limit)
        {
            await ctx.reply("принял ваш запрос, ожидайте ответа (это может занять несколько минут)")
            await plus_count(userId,1)
                await writeToLogFile(`User: ${ctx.message.from.id} make GPT text request`)

                ctx.session.messages.push({
                    role: openai.roles.USER,
                    content: ctx.message.text
                })

                const rsp = await openai.chat_gpt(ctx.session.messages);
                ctx.session.messages.push({
                    role: openai.roles.ASSISTANT,
                    content: rsp
                })

                await ctx.reply(String(rsp), Markup.inlineKeyboard([
                        Markup.button.callback('Выйти', 'exit'),
                    ]
                ))
            } else
            {
                ctx.reply('Вы достигли лимита сообщений.');
            }
        }catch (e)
    {
        await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
        await errToLogFile(`ERROR IN GPT TEXT REQUEST: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} ,
         FILE: main.js}`)
        }
    }


  async function GPT_v(ctx){
        ctx.session ??= INITIAL_SESSION
        try
        {

            const userId = ctx.from.id;
            ctx.session.messages.splice(0, ctx.session.messages.length);
            const usersData = await loadUserData();
            const count = usersData[userId].messageCount
            const limit = usersData[userId].messageLimit
            if (usersData[userId] && count < limit)
            {
                    await plus_count(userId,1)
                    await writeToLogFile(`User: ${ctx.message.from.id} make GPT voice request`)
                    await ctx.reply('сообщение получил, жду ответа от сервера (это может занять несколько минут)')
                    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
                    const user_id = String(ctx.message.from.id)
                    const ogaPath = await oga.create(link.href, user_id)
                    const filename = await RandN()
                    const mp3Path = await oga.toMp3(ogaPath, filename)
                    const txt = await openai.transcription(mp3Path)
                    await ctx.reply(`Ваш запрос: ${String(txt)}`)

                    ctx.session.messages.push({
                        role: openai.roles.USER,
                        content: txt
                    })

                    const rsp = await openai.chat_gpt(ctx.session.messages)
                    ctx.session.messages.push({
                        role: openai.roles.ASSISTANT,
                        content: rsp
                    })

                    await ctx.reply(String(rsp), Markup.inlineKeyboard([
                        Markup.button.callback('Выйти', 'exit'),]))

                } else
                {
                    ctx.reply('Вы достигли лимита сообщений.');
                }
        } catch(e)
        {
            await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
            await errToLogFile(`ERROR IN GPT VOICE REQUEST : {
            User: ${ctx.message.from.id}, 
            ERROR: ${e} , 
            FILE: main.js}`)
        }}


async function dalle_t(ctx){
    ctx.session ??= INITIAL_SESSION
        try
        {
            const userId = ctx.from.id;
            ctx.session.messages.splice(0, ctx.session.messages.length);
            const usersData = await loadUserData();
            const count = usersData[userId].messageCount
            const limit = usersData[userId].messageLimit
            if (usersData[userId] || count < limit)
            {

                await plus_count(userId,1)
                    await writeToLogFile(`User: ${ctx.message.from.id} make dall-e text request`)
                    ctx.reply(code('генерация картинки...'))
                    ctx.reply(code('дождитесь окончания генерации, это может занять несколько минут'))


                    const url = await openai.dalle(ctx.message.text)
                    const filename = await RandN()
                    const image_path = await downloadImage(url, filename)
                    await ctx.replyWithDocument({source: image_path})
                    ctx.reply('следующая генерация доступна через минуту')

                    ctx.reply('хотите выйти?', Markup.inlineKeyboard([
                            Markup.button.callback('Выйти', 'exit'),
                        ]
                    ))
                    await remove_file(image_path)
                } else
                {
                    ctx.reply('Вы достигли лимита сообщений.');
                }

        }catch (e)
        {
            await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
            await errToLogFile(`ERROR IN DALLE TEXT REQUEST: {
            User: ${ctx.message.from.id} 
            ERROR: ${e} ,
             FILE: main.js}`)
        }
    }


async function dalle_v(ctx)
{
      ctx.session ??= INITIAL_SESSION
        try
        {
            const userId = ctx.from.id;
            ctx.session.messages.splice(0, ctx.session.messages.length);
            const usersData = await loadUserData();
            const count = usersData[userId].messageCount
            const limit = usersData[userId].messageLimit
            if (usersData[userId] || count < limit)
            {
                await plus_count(userId,1)
                    ctx.reply(code('генерация картинки...'))
                    await writeToLogFile(`User: ${ctx.message.from.id} make dall-e voice request`)
                    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
                    const filename = await RandN()
                    const ogaPath = await oga.create(link.href, filename)
                    const mp3Path = await oga.toMp3(ogaPath, filename)
                    const text = await openai.transcription(mp3Path)

                    await ctx.reply(code(`ваш запрос: ${text}`))

                    const url = await openai.dalle(String(text))
                    const image_path = await downloadImage(url, filename)
                    await ctx.replyWithDocument({source: image_path})
                    ctx.reply('следующая генерация доступна через минуту')

                    ctx.reply('хотите выйти?', Markup.inlineKeyboard([
                            Markup.button.callback('Выйти', 'exit'),
                        ]
                    ))
                    await remove_file(image_path)
                } else {
                    ctx.reply('Вы достигли лимита сообщений.');
                }
        }catch (e)
        {
            await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /start')
            await errToLogFile(`ERROR IN DALLE VOICE REQUEST: {User: ${ctx.message.from.id} 
            User: ${ctx.message.from.id} 
            ERROR: ${e} , 
            FILE: main.js}`)
        }
    }


async function v2t_v(ctx){
    ctx.session ??= INITIAL_SESSION
        try
        {
            const userId = ctx.from.id;
            ctx.session.messages.splice(0, ctx.session.messages.length);
            const usersData = await loadUserData();
            const count = usersData[userId].messageCount
            const limit = usersData[userId].messageLimit
            if (usersData[userId] || count < limit)
            {

                await plus_count(userId,1)
                    await writeToLogFile(`User: ${ctx.message.from.id} make v2t voice request`)
                    await ctx.reply('отправьте или перешлите голосовое сообщение')
                    await ctx.reply(code('сообщение принял, жду ответ от сервера...'))

                    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
                    const filename = await RandN()
                    const ogaPath = await oga.create(link.href, filename)
                    const mp3Path = await oga.toMp3(ogaPath, filename)
                    const text = await openai.transcription(mp3Path)
                    await ctx.reply(`текст сообщения: ${text}`, Markup.inlineKeyboard([
                            Markup.button.callback('Выйти', 'exit'),
                        ]
                    ))
                    await remove_file(mp3Path)
                } else {
                    ctx.reply('Вы достигли лимита сообщений.');
                }

        }catch (e)
        {
            await ctx.reply('что то пошло не так, повторите попытку')
            await errToLogFile(`ERROR IN V2T VOICE REQUEST: {
            User: ${ctx.message.from.id} 
            ERROR: ${e} , 
            FILE: main.js}`)
        }
    }
async function v2t_t (ctx){
    ctx.session ??= INITIAL_SESSION
    try
    {
        const userId = ctx.from.id;
        ctx.session.messages.splice(0, ctx.session.messages.length);
        const usersData = await loadUserData();
        const count = usersData[userId].messageCount
        const limit = usersData[userId].messageLimit
        if (usersData[userId] || count < limit) {

            await plus_count(userId,1)
            await writeToLogFile(`User: ${ctx.message.from.id} make dall-e text request`)
            ctx.reply('отправьте или перешлите голосовое сообщение', Markup.inlineKeyboard([
                    Markup.button.callback('Выйти', 'exit'),
                ]
            ))
        }else
        {
            ctx.reply('Вы достигли лимита сообщений.');
        }

        }catch (e)
    {
        await ctx.reply('что то пошло не так, повторите попытку')
        await errToLogFile(`ERROR IN V2T TEXT REQUEST: {
        User: ${ctx.message.from.id}
         ERROR: ${e} ,
          FILE: main.js}`)
        }
    }

bot.action('exit',  async (ctx) => {
    ctx.session = INITIAL_SESSION
    try
    {
        await ctx.reply('Вы вышли из режима. Выберите режим:', Markup.inlineKeyboard([
            [Markup.button.callback('Разговор с ChatGPT', 'gpt')],
            [Markup.button.callback('Генерация картинок', 'dalle')],
                [Markup.button.callback('анализ картинки', 'vision')],
                [Markup.button.callback('голос в текст', 'v2t')],
        ]
        ))
    }catch (e)
    {
        await ctx.reply('что то пошло не так, повторите попытку')
       await errToLogFile(`ERROR IN V2T TEXT REQUEST: {
       User: ${ctx.message.from.id} 
       ERROR: ${e} ,
        FILE: main.js}`)
    }
})

bot.launch().then(r => console.log("bot started successful",r))

process.once('SIGINT',() => bot.stop('SIGINT'));
process.once('SIGTERM',() => bot.stop('SIGTERM'))