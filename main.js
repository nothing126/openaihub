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
                    [Markup.button.callback('голос в текст', 'v2t')],
                ]))
            }else
            {
                await ctx.reply('Вы достигли лимита сообщений.');
            }
    }catch (e)
    {
        await ctx.reply('что то пошло не так, повторите попытку')
        await errToLogFile(`ERROR WHILE START COMMAND: {
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
        await ctx.reply('что то пошло не так, повторите попытку')
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
       await ctx.reply('что то пошло не так, повторите попытку')
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
        await ctx.reply('что то пошло не так, повторите попытку')
        await errToLogFile(`ERROR WHILE PROCESSING  V2T STATE: {
        User: ${ctx.message.from.id}
         ERROR: ${e} , 
         FILE: main.js}`)
    }
});


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

                default:
                    await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду ' + code('/new'))
            }
        }else
        {
            ctx.reply("вы достигли лимита сообщений")
        }
    } catch (e)
    {
       await ctx.reply('что то пошло не так, повторите попытку')
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

                default:
                    await ctx.reply('Что-то пошло не так, попробуйте заново выбрат режим или ввести команду /new')
            }
        }else
        {
            ctx.reply("вы достигли лимита сообщений")
        }
    } catch (e)
    {
        await ctx.reply('что то пошло не так, повторите попытку')
        await errToLogFile(`ERROR WHILE HANDLING VOICE MESSAGE: {
        User: ${ctx.message.from.id} 
        ERROR: ${e} , 
        FILE: main.js}`)

    }
});


async function GPT_t(ctx){
    ctx.session ??= INITIAL_SESSION


    try {
        const userId = ctx.from.id;
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

                const rsp = await openai.chat(ctx.session.messages);
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
       await ctx.reply('что то пошло не так, повторите попытку')
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

                    const rsp = await openai.chat(ctx.session.messages)
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
           await ctx.reply('что то пошло не так, повторите попытку')
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
            await ctx.reply('что то пошло не так, повторите попытку')
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
            await ctx.reply('что то пошло не так, повторите попытку')
            await errToLogFile(`ERROR IN DALLE VOICE REQUEST: {User: ${ctx.message.from.id} 
            ERROR: ${e} , 
            FILE: main.js}`)
        }
    }


async function v2t_v(ctx){
    ctx.session ??= INITIAL_SESSION
        try
        {
            const userId = ctx.from.id;
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
            ctx.reply('что то пошло не так, повторите попытку')
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

bot.launch()

process.once('SIGINT',() => bot.stop('SIGINT'));
process.once('SIGTERM',() => bot.stop('SIGTERM'))