import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Direct PostgreSQL connection pool
export const pgPool = new Pool({
  host: process.env.POSTGRES_HOST!,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
  database: process.env.POSTGRES_DATABASE!,
  ssl: process.env.POSTGRES_SSL === 'true' ? {
    rejectUnauthorized: false // For self-hosted, can be false if no certificate
  } : false,
  max: 20, // Max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Function to log chat interactions (direct SQL)
export async function logChatInteraction(
  userFingerprint: string,
  userInput: string,
  systemOutput: string
) {
  try {
    await pgPool.query(
      `INSERT INTO public.chat_logs (user_fingerprint, user_input, system_output)
       VALUES ($1, $2, $3)`,
      [userFingerprint, userInput, systemOutput]
    );
  } catch (error) {
    console.error('Error logging chat interaction:', error);
  }
}

