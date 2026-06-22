import "dotenv/config";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL || "";

async function main() {
  const url = new URL(DATABASE_URL);
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port) || 4000,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace("/", ""),
    ssl: { rejectUnauthorized: false },
  });

  try {
    await conn.execute(
      "ALTER TABLE deposits ADD COLUMN userNote VARCHAR(255) NULL"
    );
    console.log("✓ deposits.userNote added");
  } catch (e: any) {
    if (e.code === "ER_DUP_FIELDNAME") console.log("✓ userNote already exists");
    else console.log("userNote error:", e.message);
  }

  await conn.end();
  console.log("\n✅ Migration 5 complete!");
}

main().catch(console.error);
