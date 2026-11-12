import mongoose from 'mongoose';
import { config } from './env';

let cachedPromise: Promise<typeof mongoose> | null = null;

/**
 * Connect to MongoDB using Mongoose.
 * Reuses connections across serverless invocations to avoid pool exhaustion.
 */
export async function connectDatabase(): Promise<typeof mongoose> {
  // If connection is already open, reuse it immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If connection is in progress, await the ongoing promise
  if (cachedPromise) {
    return cachedPromise;
  }

  cachedPromise = mongoose
    .connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    })
    .then((conn) => {
      console.log(`[Database] MongoDB Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    })
    .catch((error) => {
      cachedPromise = null;
      console.error('[Database Error] Failed to connect to MongoDB:', error instanceof Error ? error.message : error);
      throw error;
    });

  return cachedPromise;
}

/**
 * Gracefully close the MongoDB connection.
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    cachedPromise = null;
    await mongoose.disconnect();
    console.log('[Database] MongoDB connection closed gracefully');
  } catch (error) {
    console.error('[Database Error] Error disconnecting from MongoDB:', error);
  }
}


