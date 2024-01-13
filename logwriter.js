import { appendFile } from 'fs/promises';
export async function writeToLogFile(text) {
    try
    {
        // Путь к файлу
        const filePath = 'logs';

        // Добавляем текущую дату к тексту
        const logEntry = `${new Date().toISOString()}: ${text}\n`;

        // Записываем текст в файл
       await appendFile(filePath, logEntry)
    }catch (e)
    {
        await writeToLogFile(`ERROR WHILE LOG WRITING: ERROR: ${e} , FILE: logwriter.js}`)
    }
}

