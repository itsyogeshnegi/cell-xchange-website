import mongoose from "mongoose";

const state = global.mongooseState || { connection: null, promise: null };
global.mongooseState = state;

export async function connectDB() {
  if (state.connection) return state.connection;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  if (!state.promise) state.promise = mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false,
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 20000,
  });
  try {
    state.connection = await state.promise;
    return state.connection;
  } catch (error) {
    state.promise = null;
    throw error;
  }
}
