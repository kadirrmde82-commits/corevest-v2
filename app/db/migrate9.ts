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
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS referral_earnings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        referrerUserId INT UNSIGNED NOT NULL,
        referredUserId INT UNSIGNED NOT NULL,
        tier INT NOT NULL,
        clickEarning DECIMAL(12,2) NOT NULL,
        commissionRate DECIMAL(5,2) NOT NULL,
        commissionAmount DECIMAL(12,2) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ referral_earnings table created");
  } catch (e: any) {
    console.log("Migration 9 error:", e.message);
  }

  await conn.end();
  console.log("\n✅ Migration 9 complete!");
}

main().catch(console.error);
