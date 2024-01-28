import {readFileSync, writeFileSync} from "fs";
import {errToLogFile} from "./errwriter.js";
import {bd_path} from "./config.js";

export async function addUser(id) {
    try { // Путь к файлу
        const filePath = bd_path;

        const newUser = {
            [id]: {
                "messageLimit": 10,
                "messageCount": 0
            }
        };

        let data;
        try {
            data = JSON.parse(readFileSync(filePath));
        } catch (err) {
            data = {};
        }

        const newData = {...data, ...newUser};

        // Записываем новые данные в файл
        writeFileSync(filePath, JSON.stringify(newData, null, 2));

    }catch (e) {
        await errToLogFile(`ERROR WHILE ADDING USER: {
        ERROR: ${e} , 
        FILE: new_user.js}`)
    }
}

