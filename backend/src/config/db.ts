// Dos accesos a la misma base:
// - Mongoose para la entidad propia (Recipe), con schema y validaciones.
// - El driver nativo (MongoClient) para Better Auth, que guarda ahi las colecciones user, session y account.
import dns from "node:dns";
import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { env } from "./env.js";

// En algunas PCs con Windows Node toma 127.0.0.1 como DNS y falla al resolver las URIs mongodb+srv://
// (error "querySrv ECONNREFUSED"). DNS_SERVERS permite forzar DNS publicos, ej: 8.8.8.8,1.1.1.1
if (env.DNS_SERVERS.length > 0) {
  dns.setServers(env.DNS_SERVERS);
}

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
