import OpenAIApi from "openai";
import Configuration from "openai";
import {createReadStream} from 'fs'
import {openaiKey} from "./config.js";
import{errToLogFile} from "./errwriter.js";

class openAI{
    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system',
    }
    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey,

        });
        this.openai = new OpenAIApi(configuration)
    }
    async chat(messages) {
        try
        {
            const response= await this.openai.chat.completions.create({
                model:'gpt-3.5-turbo',
                messages
            })
            return response.choices[0].message.content
        }
        catch (e)
        {
            errToLogFile(`error while gpt chat, ERROR:${e}, FILE: openai.js `)
        }
    }

    async transcription(filepath) {
        try {
            const response = await this.openai.audio.transcriptions.create({
                file: createReadStream(filepath),
                model: 'whisper-1'
            })
            return response.text
        }
        catch (e)
        {
            errToLogFile(`error while transcription, ERROR:${e}, FILE: openai.js`)
        }
    }
    async dalle(promt) {
        try {
            const response = await this.openai.images.generate({
                model:"dall-e-3",
                prompt: String(promt),
                n: 1,
                size: "1024x1024"
            })
            return response.data[0].url

        }catch (e){
            errToLogFile(`error in generating img, ERROR: ${e}, FILE: openai.js`)
        }
    }
}

export const openai = new openAI(openaiKey)