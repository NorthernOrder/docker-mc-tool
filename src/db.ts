import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const restarts = sqliteTable("restarts", {
  id: integer("id").primaryKey(),
  name: text("name"),
});
