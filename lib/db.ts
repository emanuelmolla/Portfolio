import mongoose from 'mongoose'

/**
 * Cached Mongo connection for serverless.
 *
 * Every Vercel invocation runs in a container that may be reused (warm) or created
 * fresh (cold). Calling mongoose.connect() per request would open a new connection
 * each time and exhaust the Atlas connection pool under any real traffic.
 *
 * The cache is hung off globalThis rather than a plain module-level variable because
 * module scope can be re-evaluated across hot reloads in dev and across some bundler
 * boundaries in production, which would silently create a second pool.
 */

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var _mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = globalThis._mongooseCache ?? { conn: null, promise: null }
globalThis._mongooseCache = cached

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  // Read the env var here rather than at module load, so importing this file
  // during a build without secrets present does not throw.
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      // Fail fast instead of queueing operations while disconnected. Buffering
      // turns a dead database into a request that hangs until the function times
      // out, which is much harder to diagnose than an immediate error.
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    // Clear the failed promise so the next invocation retries instead of
    // permanently caching a rejection for the life of the container.
    cached.promise = null
    throw err
  }

  return cached.conn
}
