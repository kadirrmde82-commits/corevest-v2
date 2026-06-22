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
      "ALTER TABLE profiles ADD COLUMN monthlyWithdrawalCount INT NOT NULL DEFAULT 0"
    );
    console.log("✓ monthlyWithdrawalCount added");
  } catch (e: any) {
    if (e.code === "ER_DUP_FIELDNAME") console.log("✓ monthlyWithdrawalCount already exists");
    else console.log("monthlyWithdrawalCount error:", e.message);
  }

  try {
    await conn.execute(
      "ALTER TABLE profiles ADD COLUMN lastWithdrawalResetAt TIMESTAMP NULL"
    );
    console.log("✓ lastWithdrawalResetAt added");
  } catch (e: any) {
    if (e.code === "ER_DUP_FIELDNAME") console.log("✓ lastWithdrawalResetAt already exists");
    else console.log("lastWithdrawalResetAt error:", e.message);
  }

  await conn.end();
  console.log("\n✅ Migration 3 complete!");
}

main().catch(console.error);
