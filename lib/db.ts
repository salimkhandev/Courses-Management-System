import mongoose from 'mongoose';

// MongoDB connection string - for local MongoDB, use: mongodb://localhost:27017/courses-db
// For remote MongoDB, use your Atlas or other hosted connection string
const MONGODB_URI = process.env.MONGODB_URI as string || 'mongodb://localhost:27017/courses-db';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

// Module-level cache to reuse connection across hot-reloads in dev
// and across serverless function invocations in prod
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
