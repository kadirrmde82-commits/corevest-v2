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
      CREATE TABLE IF NOT EXISTS wallet_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`key\` VARCHAR(16) NOT NULL UNIQUE,
        label VARCHAR(64) NOT NULL,
        address VARCHAR(128) NOT NULL,
        color VARCHAR(16) NOT NULL,
        active INT DEFAULT 1 NOT NULL,
        sortOrder INT DEFAULT 0 NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ wallet_addresses table created or already exists");

    const [rows] = await conn.execute("SELECT COUNT(*) as count FROM wallet_addresses");
    if (rows && (rows as any)[0].count === 0) {
      await conn.execute(`
        INSERT INTO wallet_addresses (\`key\`, label, address, color, active, sortOrder) VALUES
        ('trc20', 'USDT (TRC20)', 'TA8iYcRTAKrCuq4P8KgWwegXw2SJUNUqHM', '#FF060A', 1, 0),
        ('sol', 'SOL', 'BWgMWCpnGwCaLZvun29LdBh9ZYVptxb6b5BrqbfJyLs1', '#00D4AA', 1, 1),
        ('trx', 'TRX (Tron)', 'TA8iYcRTAKrCuq4P8KgWwegXw2SJUNUqHM', '#FF060A', 1, 2),
        ('eth', 'ETH (ERC20)', '0x0242e8f55Ef76Cf874635c4cE42c7C4DE457f54B', '#627EEA', 1, 3)
      `);
      console.log("✓ Default wallet addresses inserted");
    } else {
      console.log("✓ Wallet addresses already populated");
    }
  } catch (e: any) {
    console.log("Migration 8 error:", e.message);
  }

  await conn.end();
  console.log("\n✅ Migration 8 complete!");
}

main().catch(console.error);
