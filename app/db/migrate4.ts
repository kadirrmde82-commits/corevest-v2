import "dotenv/config";
import mysql from "mysql2/promise";
import { createHash, randomBytes } from "crypto";

const DATABASE_URL = process.env.DATABASE_URL || "";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(password + salt).digest("hex");
  return `${salt}:${hash}`;
}

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

  // Check if admin user exists
  const [rows]: any = await conn.execute(
    "SELECT id FROM users WHERE email = ?",
    ["admin@corevest.com"]
  );

  if (rows.length === 0) {
    // Insert admin user
    const passwordHash = hashPassword("159753852qwe");
    const [result]: any = await conn.execute(
      `INSERT INTO users (email, passwordHash, name, role, createdAt, updatedAt, lastSignInAt)
       VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())`,
      ["admin@corevest.com", passwordHash, "Admin", "admin"]
    );
    const adminId = result.insertId;

    // Insert admin profile
    await conn.execute(
      `INSERT INTO profiles (userId, referralCode, balance, investment, vipLevel, totalClicks, consecutiveClicks, monthlyWithdrawalCount, joinDate, createdAt, updatedAt)
       VALUES (?, ?, '0.00', '0.00', 0, 0, 0, 0, NOW(), NOW(), NOW())`,
      [adminId, "CVADMIN"]
    );

    console.log(`✓ Admin user created (ID: ${adminId})`);
  } else {
    // Update existing admin to have role='admin'
    await conn.execute(
      "UPDATE users SET role = 'admin' WHERE email = ?",
      ["admin@corevest.com"]
    );
    console.log("✓ Admin user already exists, role updated to admin");
  }

  await conn.end();
  console.log("\n✅ Admin seed complete!");
}

main().catch(console.error);
