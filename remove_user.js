import { promises as fsPromises } from "fs";
import { writeToLogFile } from "./logwriter.js";
import { errToLogFile } from "./errwriter.js";
import { bd_path } from "./config.js";

export async function remove_user(jsonKey) {
  try {
    // Чтение содержимого файла
    const data = await fsPromises.readFile(bd_path, "utf-8");

    if (!data) {
      await errToLogFile("Файл пустой или не содержит данных");
    }

    // Парсинг JSON из файла
    let graph;
    try {
      graph = JSON.parse(data);
    } catch (parseError) {
      await errToLogFile("Ошибка при парсинге JSON файла: " + parseError);
    }

    // Удаление вершин графа с указанным JSON ключом
    let deleted = false;
    for (let key in graph) {
      if (key === jsonKey) {
        delete graph[key];
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      await writeToLogFile(`Ключ "${jsonKey}" не найден в файле`);
      return;
    }

    // Запись изменений обратно в файл
    await fsPromises.writeFile(bd_path, JSON.stringify(graph, null, 2));
    await writeToLogFile(`Ключ "${jsonKey}" был успешно удален из файла`);
  } catch (e) {
    await errToLogFile("Произошла ошибка:", e);
  }
}
