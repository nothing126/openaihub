import { readFileSync, writeFileSync } from "fs";
import { errToLogFile } from "./errwriter.js";
import { writeToLogFile } from "./logwriter.js";
import { bd_path } from "./config.js";

export async function plus_count(userId, incrementBy) {
  const userDataPath = bd_path; // Replace with the actual path

  try {
    // Read data from file
    const rawData = readFileSync(userDataPath, "utf-8");
    const usersData = JSON.parse(rawData);

    // Check if user exists
    if (usersData[userId]) {
      // Increment messageCount
      usersData[userId].messageCount += incrementBy;

      // Write updated data back to file
      writeFileSync(userDataPath, JSON.stringify(usersData, null, 2), "utf-8");

      await writeToLogFile(
        `messageCount for user ${userId} increased by ${incrementBy}`,
      );
    } else {
      await errToLogFile(`User with id ${userId} not found in the file`);
    }
  } catch (e) {
    await errToLogFile("Error updating messageCount:", e);
  }
}
