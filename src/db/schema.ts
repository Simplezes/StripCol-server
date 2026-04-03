import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const squawkLogs = sqliteTable('squawk_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull(),
  createdAt: text('created_at').notNull(),
  expiresAt: integer('expires_at').notNull(),
});

export const clearanceLogs = sqliteTable('clearance_logs', {
  callsign: text('callsign').primaryKey(),
  status: integer('status', { mode: 'boolean' }).notNull(),
  expiresAt: integer('expires_at').notNull(),
});
