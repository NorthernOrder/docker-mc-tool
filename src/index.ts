import { exit } from "node:process";

import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

import * as paths from "./paths";
import * as configuration from "./config";
import { createContext } from "./context";

async function main() {
  paths.validate();

  const config = configuration.parse(paths.configFile);
  const sqlite = new Database(paths.dbFile);
  const db: BetterSQLite3Database = drizzle(sqlite);

  const ctx = createContext(db, config);
}

main().catch((err) => {
  console.error(err);

  exit(1);
});
