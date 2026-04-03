import { db } from '../db/index.js';
import { squawkLogs, clearanceLogs } from '../db/schema.js';
import { eq, gt, sql } from 'drizzle-orm';

export const squawkService = {
  async set(code: string): Promise<string> {
    const expiresAt = Math.floor(Date.now() / 1000) + 25 * 60;
    const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    await db.insert(squawkLogs).values({
      code,
      createdAt,
      expiresAt,
    });

    return createdAt;
  },

  async getAll(): Promise<{ code: string; createdAt: string }[]> {
    const now = Math.floor(Date.now() / 1000);
    const results = await db
      .select({ code: squawkLogs.code, createdAt: squawkLogs.createdAt })
      .from(squawkLogs)
      .where(gt(squawkLogs.expiresAt, now));

    return results;
  },

  async cleanup(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await db.delete(squawkLogs).where(sql`${squawkLogs.expiresAt} < ${now}`);
  },
};

export const clearanceService = {
  async set(callsign: string, status: boolean): Promise<void> {
    const expiresAt = Math.floor(Date.now() / 1000) + 50 * 60;

    await db
      .insert(clearanceLogs)
      .values({
        callsign: callsign.toUpperCase(),
        status,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: clearanceLogs.callsign,
        set: { status, expiresAt },
      });
  },

  async getAll(): Promise<{ callsign: string; status: boolean }[]> {
    const now = Math.floor(Date.now() / 1000);

    const results = await db
      .select({ callsign: clearanceLogs.callsign, status: clearanceLogs.status })
      .from(clearanceLogs)
      .where(gt(clearanceLogs.expiresAt, now));

    return results;
  },

  async cleanup(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await db.delete(clearanceLogs).where(sql`${clearanceLogs.expiresAt} < ${now}`);
  },
};
