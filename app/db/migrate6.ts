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
      CREATE TABLE IF NOT EXISTS market_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        symbol VARCHAR(16) NOT NULL UNIQUE,
        name VARCHAR(64) NOT NULL,
        basePrice DECIMAL(18,8) NOT NULL,
        \`change\` DECIMAL(8,2) NOT NULL,
        color VARCHAR(16) NOT NULL,
        active INT DEFAULT 1 NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ market_prices table created or already exists");

    const [rows] = await conn.execute("SELECT COUNT(*) as count FROM market_prices");
    if (rows && (rows as any)[0].count === 0) {
      await conn.execute(`
        INSERT INTO market_prices (symbol, name, basePrice, \`change\`, color, active) VALUES
        ('BTC', 'Bitcoin', 84732.45, 2.34, '#FFD700', 1),
        ('ETH', 'Ethereum', 4521.18, -1.12, '#8C8C8C', 1),
        ('SOL', 'Solana', 198.76, 5.67, '#00D4AA', 1),
        ('DOGE', 'Dogecoin', 0.3421, -3.45, '#C2A633', 1),
        ('LTC', 'Litecoin', 98.54, 1.23, '#345D9D', 1)
      `);
      console.log("✓ Default market prices inserted");
    } else {
      console.log("✓ Market prices already populated");
    }
  } catch (e: any) {
    console.log("Migration 6 error:", e.message);
  }

  await conn.end();
  console.log("\n✅ Migration 6 complete!");
}

main().catch(console.error);
