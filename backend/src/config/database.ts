import mongoose from 'mongoose';
import { config } from './env';

/**
 * Connect to MongoDB using Mongoose.
 * Logs clear connection status and error handling.
 */
export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[Database Error] Failed to connect to MongoDB:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Gracefully close the MongoDB connection.
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB connection closed gracefully');
  } catch (error) {
    console.error('[Database Error] Error disconnecting from MongoDB:', error);
  }
}

