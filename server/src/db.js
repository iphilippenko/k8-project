import { Pool } from 'pg';

export function createDatabase() {
  const connectionString = process.env.DATABASE_URL;
  let pool;

  function getPool() {
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }

    if (!pool) {
      pool = new Pool({ connectionString });
    }

    return pool;
  }

  return {
    isConfigured() {
      return Boolean(connectionString);
    },

    async query(text, params = []) {
      return getPool().query(text, params);
    },

    async checkConnection() {
      if (!connectionString) {
        return {
          ok: false,
          reason: 'DATABASE_URL is not configured'
        };
      }

      try {
        await getPool().query('SELECT 1');

        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          reason: error.message
        };
      }
    },

    async close() {
      if (pool) {
        await pool.end();
      }
    }
  };
}
