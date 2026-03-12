require("dotenv").config();
const fs = require("fs");
const mysql = require("mysql2/promise");

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true, // important for running full SQL file
  });

  console.log("✅ Connected. Running migrations...");
  const sql = fs.readFileSync("./config/schema.sql", "utf8");
  await connection.query(sql);
  console.log("✅ Migration complete. Tables created.");
  await connection.end();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});