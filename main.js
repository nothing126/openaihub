import { Telegraf,Markup, session} from 'telegraf';
import {openai} from "./openai.js";
import {message} from "telegraf/filters";
import {code} from "telegraf/format";
import {oga} from './oga.js'
import {RandN} from "./rand.js";
import {downloadImage}  from "./image.js"
import {remove_file} from "./remove.js";
import { tgKey } from './config.js';

const bot = new Telegraf(tgKey)

const INITIAL_SESSION= {
    messages: [],
}

bot.use(session())

bot.command('start', async (ctx)=>{
    ctx.session = INITIAL_SESSION
    try{
        await ctx.reply('здравствуйте, выберите режим', Markup.inlineKeyboard([
            [Markup.button.callback('Разговор с ChatGPT', 'gpt')],
            [Markup.button.callback('Генерация картинок', 'dalle')],
            [Markup.button.callback('голос в текст', 'v2t')],
        ]))
    }catch (e) {
        console.log('error while start command',e)
    }
})

bot.action('gpt', async (ctx) => {
    ctx.session ??= INITIAL_SESSION;
    try {
        ctx.session.mode = 'gpt';
        await ctx.reply("жду ваш запрос в текстовом или аудио формате");
    }catch (e) {
       console.log( 'error while processing v2t state',e)
    }
});

bot.action('dalle', async (ctx) => {
    ctx.session ??= INITIAL_SESSION;
    try {
        ctx.session.mode = 'dalle';
        await ctx.reply('жду ваш запрос в текстовом или аудио формате для генерации картинок');
    }catch (e) {
        console.log('error while processing dalle state',e)
    }
});

bot.action('v2t', async (ctx) => {
    ctx.session ??= INITIAL_SESSION;
    try {
        ctx.session.mode = 'v2t';
        await ctx.reply('отправьте или перешлите голосовое сообщение для голос в текст');
    }catch (e) {
        console.log('error while processing v2t state',e)
    }
});

bot.on(message('text'), async (ctx) => {
    try {
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
                await ctx.reply('Выберите режим:');
        }
    } catch (e) {
        console.log('Error while handling text message', e);
    }
});

bot.on(message('voice'), async (ctx) => {
    try {
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
                // Действия по умолчанию (не в режиме)
                await ctx.reply('Выберите режим:');
        }
    } catch (e) {
        console.log('Error while handling voice message', e);
    }
});
async function GPT_t(ctx){
    ctx.session ??= INITIAL_SESSION
    await ctx.reply("принял ваш запрос")

        try {
            ctx.session.messages.push({
                role: openai.roles.USER,
                content:ctx.message.text
            })

            const rsp = await openai.chat(ctx.session.messages);
            ctx.session.messages.push({
                role: openai.roles.ASSISTANT,
                content: rsp
            })

            await ctx.reply(`ответ от gpt: ${String(rsp)}`, Markup.inlineKeyboard([
                Markup.button.callback('Выйти', 'exit'),
            ]
            ))

        }catch (e) {
            console.log('error while processing txt gpt request',e)
        }
    }

  async function GPT_v(ctx){
        ctx.session ??= INITIAL_SESSION
        try {
            await ctx.reply('сообщение получил, жду ответа от сервера')
            const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
            const user_id = String(ctx.message.from.id)
            const ogaPath = await oga.create(link.href,user_id)
            const filename = await  RandN()
            const mp3Path = await oga.toMp3(ogaPath,filename)
            const txt = await openai.transcription(mp3Path)
            await ctx.reply(`Ваш запрос: ${String(txt)}`)
            ctx.session.messages.push({
                role: openai.roles.USER,
                content: txt
            })
            const rsp = await openai.chat( ctx.session.messages)
            ctx.session.messages.push({
                role: openai.roles.ASSISTANT,
                content: rsp
            })
            await ctx.reply(`ответ от chatGPT: ${String(rsp)}`, Markup.inlineKeyboard([
                Markup.button.callback('Выйти', 'exit'),]))
        } catch(e) {
            console.log("error while processing voice gpt request", e)
        }}


async function dalle_t(ctx){
    ctx.session ??= INITIAL_SESSION
        try {
            ctx.reply(code('генерация картинки...'))

            const url = await openai.dalle(ctx.message.text)
            const filename = await RandN()
            const image_path = await downloadImage(url, filename)
            await ctx.replyWithDocument({source: image_path})

            ctx.reply('хотите выйти?',Markup.inlineKeyboard([
                Markup.button.callback('Выйти', 'exit'),
            ]))
            await remove_file(image_path)

        }catch (e) {
            console.log('error while processing dall-e text request',e)
        }
    }
async function dalle_v(ctx){
      ctx.session ??= INITIAL_SESSION
        try {
          ctx.reply(code('генерация картинки...'))
            const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
            const filename = await RandN()
            const ogaPath = await oga.create(link.href, filename)
            const mp3Path = await oga.toMp3(ogaPath, filename)
            const text = await openai.transcription(mp3Path)

            await ctx.reply(code(`ваш запрос: ${text}`))

            const url = await openai.dalle(String(text))
            const image_path = await downloadImage(url, filename)
            await ctx.replyWithDocument({source: image_path})

            ctx.reply('хотите выйти?', Markup.inlineKeyboard([
                Markup.button.callback('Выйти', 'exit'),
            ]))
            await remove_file(image_path)
        }catch (e) {
            console.log('error while processing dall-e voice request',e)
        }
    }



async function v2t_v(ctx){
    ctx.session ??= INITIAL_SESSION
        try {
            await ctx.reply('отправьте или перешлите голосовое сообщение')
            await ctx.reply(code('сообщение принял, жду ответ от сервера...'))
            const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
            const filename = await RandN()
            const ogaPath = await oga.create(link.href, filename)
            const mp3Path = await oga.toMp3(ogaPath, filename)
            const text = await openai.transcription(mp3Path)
            await ctx.reply(`текст сообщения: ${text}`, Markup.inlineKeyboard([
                Markup.button.callback('Выйти', 'exit'),
            ]))
            await remove_file(mp3Path)
        }catch (e){
            console.log('error in processing voice to text(v2t_v function)',e)
        }
    }
async function v2t_t (ctx){
    ctx.session ??= INITIAL_SESSION
    try {
            ctx.reply('отправьте или перешлите голосовое сообщение', Markup.inlineKeyboard([
                Markup.button.callback('Выйти', 'exit'),
            ]
            ))
        }catch (e) {
            console.log('error in text handling v2t_t',e)

        }
    }

bot.action('exit', (ctx) => {
    ctx.session = INITIAL_SESSION
    try {
        ctx.reply('Вы вышли из режима. Выберите режим:', Markup.inlineKeyboard([
            [Markup.button.callback('Разговор с ChatGPT', 'gpt')],
            [Markup.button.callback('Генерация картинок', 'dalle')],
            [Markup.button.callback('голос в текст', 'v2t')],
        ]
        ))
    }catch (e) {
        console.log('error while exit message',e)
    }
})

bot.launch()

process.once('SIGINT',() => bot.stop('SIGINT'));
process.once('SIGTERM',() => bot.stop('SIGTERM'))
