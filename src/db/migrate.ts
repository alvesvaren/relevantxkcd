import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  console.log("Migration started...");

  // First enable the vector extension
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);

  // Then run the migrations
  await migrate(db, { migrationsFolder: "drizzle" });

  console.log("Migration completed!");
}

main().catch(err => {
  console.error("Migration failed!", err);
  process.exit(1);
});
