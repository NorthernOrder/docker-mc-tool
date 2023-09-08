import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { Config } from "./config";

export interface Context {
  db: BetterSQLite3Database;
  config: Config;
}

export function createContext(
  db: BetterSQLite3Database,
  config: Config
): Context {
  return {
    db,
    config,
  };
}
