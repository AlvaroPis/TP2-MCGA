// Lee y valida las variables de entorno una sola vez. Si falta algo obligatorio, el server no arranca.
import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisá backend/.env (ver .env.example).`);
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV ?? "development",
  MONGODB_URI: required("MONGODB_URI"),
  BETTER_AUTH_SECRET: required("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ?? "",
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ?? "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  // Opcional: lista separada por comas de servidores DNS (ver config/db.ts)
  DNS_SERVERS: (process.env.DNS_SERVERS ?? "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean),
};
