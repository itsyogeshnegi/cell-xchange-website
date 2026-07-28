import mongoose from "mongoose";

const state = global.mongooseState || { connection: null, promise: null, uri: null, pendingUri: null };
state.uri ??= null;
state.pendingUri ??= null;
global.mongooseState = state;

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  const uri = process.env.MONGODB_URI;

  if (state.connection && state.uri === uri && mongoose.connection.readyState === 1) return state.connection;

  if ((state.connection && state.uri !== uri) || (state.promise && state.pendingUri && state.pendingUri !== uri)) {
    await state.promise?.catch(() => {});
    await mongoose.disconnect();
    state.connection = null;
    state.promise = null;
    state.uri = null;
    state.pendingUri = null;
  }

  if (!state.promise) {
    state.pendingUri = uri;
    state.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
    });
  }

  try {
    state.connection = await state.promise;
    state.uri = uri;
    state.pendingUri = null;
    return state.connection;
  } catch (error) {
    state.promise = null;
    state.pendingUri = null;
    throw error;
  }
}
