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
      "ALTER TABLE deposits ADD COLUMN email VARCHAR(320) NOT NULL DEFAULT ''"
    );
    console.log("✓ deposits.email added");
  } catch (e: any) {
    if (e.code === "ER_DUP_FIELDNAME") console.log("✓ email already exists");
    else console.log("email error:", e.message);
  }

  try {
    await conn.execute(
      "ALTER TABLE deposits ADD COLUMN cryptoType ENUM('trc20','sol','trx','eth') DEFAULT 'trc20' NOT NULL"
    );
    console.log("✓ deposits.cryptoType added");
  } catch (e: any) {
    if (e.code === "ER_DUP_FIELDNAME") console.log("✓ cryptoType already exists");
    else console.log("cryptoType error:", e.message);
  }

  await conn.end();
  console.log("\n✅ Migration 7 complete!");
}

main().catch(console.error);
