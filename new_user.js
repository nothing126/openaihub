import {readFileSync, writeFileSync} from "fs";
import {errToLogFile} from "./errwriter.js";

export function addUser(id) {
    try { // Путь к файлу
        const filePath = './userIds.json';

        // Создаем новый объект для добавления в файл
        const newUser = {
            [id]: {
                "messageLimit": 10,
                "messageCount": 0
            }
        };

        // Читаем текущие данные из файла (если они есть)
        let data = {};
        try {
            data = JSON.parse(readFileSync(filePath));
        } catch (err) {
            // Если файла нет или он пустой, то мы создаем пустой объект
            data = {};
        }

        // Объединяем текущие данные с новыми данными
        const newData = {...data, ...newUser};

        // Записываем новые данные в файл
        writeFileSync(filePath, JSON.stringify(newData, null, 2));

    }catch (e) {
        errToLogFile(`ERROR WHILE ADDING USER: {
        ERROR: ${e} , 
        FILE: new_user.js}`)
    }
}

