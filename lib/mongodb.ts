import mongoose from 'mongoose';

// Define the connection object structure with proper types
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global namespace to cache the connection
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection | undefined;
}


/**
 * Global cache for the mongoose connection.
 * In development, Next.js hot-reloads and creates new module instances,
 * which could lead to multiple connections. Using global ensures we reuse
 * the same connection across hot-reloads.
 */
//let cached: MongooseConnection = global.mongoose || {
const cached: MongooseConnection = global.mongoose || {

  conn: null,
  promise: null,
};

// Cache the connection globally to persist across hot-reloads in development
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes and returns a cached MongoDB connection using Mongoose.
 * 
 * This function ensures that only one connection is active at a time by:
 * - Returning the existing connection if already established
 * - Reusing a pending connection promise if one is in progress
 * - Creating a new connection only when necessary
 * 
 * @returns {Promise<typeof mongoose>} The mongoose instance with an active connection
 */
async function connectDB(): Promise<typeof mongoose> {
  // Retrieve MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Validate that the MongoDB URI is defined
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // If no promise exists, create a new connection
  if (!cached.promise) {
    const options = {
      bufferCommands: false, // Disable command buffering for better error handling
    };

    // Store the connection promise to prevent duplicate connections
    cached.promise = mongoose.connect(MONGODB_URI!, options).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Await the connection promise and cache the result
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise on error to allow retry on next call
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
