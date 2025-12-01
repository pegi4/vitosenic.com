import { Pool, type PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create PostgreSQL connection pool
let pgPool: Pool | null = null;

function getPool(): Pool | null {
  // Return null if database is not configured
  if (!process.env.POSTGRES_HOST) {
    return null;
  }

  // Create pool if it doesn't exist
  if (!pgPool) {
    const config: PoolConfig = {
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
    };

    // Handle SSL connection
    if (process.env.POSTGRES_SSL) {
      // If POSTGRES_SSL is set to 'true' or '1', use SSL
      if (process.env.POSTGRES_SSL.toLowerCase() === 'true' || process.env.POSTGRES_SSL === '1') {
        config.ssl = {
          rejectUnauthorized: false, // For self-signed certificates
        };
      } else {
        // If it's a JSON string, parse it
        try {
          const parsed = JSON.parse(process.env.POSTGRES_SSL);
          config.ssl = parsed as PoolConfig['ssl'];
        } catch {
          // If parsing fails, treat as boolean
          config.ssl = {
            rejectUnauthorized: false,
          };
        }
      }
    }

    pgPool = new Pool(config);

    // Handle pool errors
    pgPool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }

  return pgPool;
}

/**
 * Log chat interaction to PostgreSQL database
 * Saves user input and system output with fingerprint for analytics
 */
export async function logChatInteraction(
  userFingerprint: string,
  userInput: string,
  systemOutput: string
): Promise<void> {
  const pool = getPool();
  
  // No-op if database is not configured
  if (!pool) {
    return;
  }

  try {
    await pool.query(
      `INSERT INTO public.chat_logs (user_fingerprint, user_input, system_output)
       VALUES ($1, $2, $3)`,
      [userFingerprint, userInput, systemOutput]
    );
  } catch (error) {
    // Log error but don't throw - we don't want to break the chat if logging fails
    console.error('Failed to log chat interaction to database:', error);
  }
}

/**
 * Close the database connection pool (useful for cleanup in tests or shutdown)
 */
export async function closeDatabasePool(): Promise<void> {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
}
