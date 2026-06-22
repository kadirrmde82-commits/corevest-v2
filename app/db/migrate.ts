import "dotenv/config";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL || "";

async function main() {
  // Parse the connection URL manually for mysql2
  const url = new URL(DATABASE_URL);
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port) || 4000,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace("/", ""),
    ssl: { rejectUnauthorized: false },
  });

  // Add consecutiveClicks to profiles
  try {
    await conn.execute(
      "ALTER TABLE profiles ADD COLUMN consecutiveClicks INT NOT NULL DEFAULT 0"
    );
    console.log("✓ consecutiveClicks added to profiles");
  } catch (e: any) {
    if (e.code === "ER_DUP_FIELDNAME") {
      console.log("✓ consecutiveClicks already exists");
    } else {
      console.log("consecutiveClicks error:", e.message);
    }
  }

  // Add lastWithdrawalAt to profiles
  try {
    await conn.execute(
      "ALTER TABLE profiles ADD COLUMN lastWithdrawalAt TIMESTAMP NULL"
    );
    console.log("✓ lastWithdrawalAt added to profiles");
  } catch (e: any) {
    if (e.code === "ER_DUP_FIELDNAME") {
      console.log("✓ lastWithdrawalAt already exists");
    } else {
      console.log("lastWithdrawalAt error:", e.message);
    }
  }

  // Create wheel_spins table
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS wheel_spins (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL,
        prize DECIMAL(12,2) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ wheel_spins table created/verified");
  } catch (e: any) {
    console.log("wheel_spins error:", e.message);
  }

  await conn.end();
  console.log("\n✅ Migration complete!");
}

main().catch(console.error);
