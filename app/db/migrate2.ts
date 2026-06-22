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

  // Make unionId nullable
  try {
    await conn.execute(
      "ALTER TABLE users MODIFY COLUMN unionId VARCHAR(255) NULL"
    );
    console.log("✓ unionId made nullable");
  } catch (e: any) {
    console.log("unionId:", e.message);
  }

  // Add passwordHash
  try {
    await conn.execute(
      "ALTER TABLE users ADD COLUMN passwordHash VARCHAR(255) NULL"
    );
    console.log("✓ passwordHash added");
  } catch (e: any) {
    if (e.code === "ER_DUP_FIELDNAME") {
      console.log("✓ passwordHash already exists");
    } else {
      console.log("passwordHash error:", e.message);
    }
  }

  // Create wheel_referral_bonuses table
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS wheel_referral_bonuses (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL,
        referredUserId BIGINT UNSIGNED NOT NULL,
        investmentAmount DECIMAL(12,2) NOT NULL,
        spinsEarned INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ wheel_referral_bonuses table created");
  } catch (e: any) {
    console.log("wheel_referral_bonuses error:", e.message);
  }

  await conn.end();
  console.log("\n✅ Migration 2 complete!");
}

main().catch(console.error);
