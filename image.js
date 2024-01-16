import axios from "axios";
import { createWriteStream } from 'fs';
import {dirname, resolve} from "path";
import {fileURLToPath} from "url";
import{errToLogFile} from "./errwriter.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function downloadImage(url, filename) {
    try
    {
        const Path = resolve(__dirname, 'C:\\Users\\ajiga\\WebstormProjects\\untitled2\\img', `${filename}.png`)
        const response = await axios({
            method: 'get',
            url,
            responseType: 'stream'
        })
        return new Promise(resolve => {
            const stream = createWriteStream(Path)
            response.data.pipe(stream)
            stream.on('finish', () => resolve(Path))
        })
    } catch (e)
    {
        await errToLogFile(`error while downloading img, ERROR:${e}, FILE: image.js`)
    }
}
