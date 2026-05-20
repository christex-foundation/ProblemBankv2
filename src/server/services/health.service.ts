import 'server-only';

import { getSupabase } from '@/server/db/client';

export type HealthStatus = 'ok' | 'degraded';
export type DbStatus = 'ok' | 'down';

export type HealthCheck = {
  status: HealthStatus;
  db: DbStatus;
  timestamp: string;
};

export const HealthService = {
  /**
   * Lightweight DB ping. Returns `{ db: 'ok' }` on success, `{ db: 'down' }`
   * on any error. `status` is `'ok'` only when every subsystem is `'ok'`.
   */
  async check(): Promise<HealthCheck> {
    const timestamp = new Date().toISOString();
    try {
      const { error } = await getSupabase()
        .from('User')
        .select('id', { count: 'exact', head: true });
      if (error) throw error;
      return { status: 'ok', db: 'ok', timestamp };
    } catch {
      return { status: 'degraded', db: 'down', timestamp };
    }
  },
};

export type HealthServiceType = typeof HealthService;
