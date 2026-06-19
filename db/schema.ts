import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), 
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin", "member"] }).default("member"),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  amount: real("amount").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  status: text("status", { enum: ["pending", "paid"] }).default("pending"),
  dueDateDay: integer("due_date_day"),
  date: text("date").notNull(),
  isFixed: integer("is_fixed", { mode: "boolean" }).default(false),
  categoryId: integer("category_id").references(() => categories.id),
  // NOVO CAMPO: Identifica se o lançamento é seu ou do seu marido
  responsavel: text("responsavel").default("eu"), 
});