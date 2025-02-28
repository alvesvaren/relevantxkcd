import { db } from ".";
import { comic } from "./schema";

export async function clear() {
  await db.delete(comic);
  console.log("Database cleared");
  process.exit(0);
}

clear();
