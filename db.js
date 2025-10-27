import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.env.DATA_DIR || ".", "data.sqlite");
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

export function initFromSQL() {
  const sql = fs.readFileSync("./schema.sql", "utf8");
  db.exec(sql);
  console.log("✅ SQLite schema ready");
}

initFromSQL();
