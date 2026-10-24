import { pgTable, text, jsonb, timestamp, serial, primaryKey, index } from "drizzle-orm/pg-core";

// Student profile per user (Netlify Identity user id or demo account id)
export const profiles = pgTable("profiles", {
  id: text().primaryKey(),
  email: text(),
  data: jsonb().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const roadmapTasks = pgTable(
  "roadmap_tasks",
  {
    userId: text("user_id").notNull(),
    id: text().notNull(),
    data: jsonb().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })]
);

export const documents = pgTable(
  "documents",
  {
    userId: text("user_id").notNull(),
    id: text().notNull(),
    data: jsonb().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })]
);

export const applications = pgTable(
  "applications",
  {
    userId: text("user_id").notNull(),
    id: text().notNull(),
    data: jsonb().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })]
);

// Bookmarked universities and scholarships ("university" | "scholarship")
export const savedItems = pgTable(
  "saved_items",
  {
    userId: text("user_id").notNull(),
    kind: text().notNull(),
    itemId: text("item_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.kind, t.itemId] })]
);

// Admin-created or edited catalog entries layered over the built-in seed catalog
export const catalogEntries = pgTable(
  "catalog_entries",
  {
    kind: text().notNull(),
    id: text().notNull(),
    data: jsonb().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.kind, t.id] })]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial().primaryKey(),
    actor: text().notNull(),
    action: text().notNull(),
    details: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("audit_logs_created_at_idx").on(t.createdAt)]
);
