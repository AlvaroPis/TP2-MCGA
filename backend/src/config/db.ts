// Dos accesos a la misma base:
// - Mongoose para la entidad propia (Recipe), con schema y validaciones.
// - El driver nativo (MongoClient) para Better Auth, que guarda ahi las colecciones user, session y account.
import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { env } from "./env.js";

export const mongoClient = new MongoClient(env.MONGODB_URI);
export const authDb = mongoClient.db();

export async function connectMongoDB(): Promise<void> {
  mongoose.connection.on("connected", () => console.log("[mongodb] conexion establecida"));
  mongoose.connection.on("error", (error: Error) =>
    console.error("[mongodb] error de conexion:", error.message),
  );

  await Promise.all([mongoose.connect(env.MONGODB_URI), mongoClient.connect()]);
}

export async function disconnectMongoDB(): Promise<void> {
  await Promise.all([mongoose.connection.close(), mongoClient.close()]);
}
