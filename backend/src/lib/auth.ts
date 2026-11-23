// Configuracion central de Better Auth: email/contraseña + GitHub, usuarios y sesiones guardados en MongoDB
// y plugin admin (agrega el campo role a user, con "user" por defecto, y endpoints para cambiar roles).
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { authDb } from "../config/db.js";
import { env } from "../config/env.js";

const githubEnabled = Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  // transaction: false -> funciona tambien con un Mongo local standalone (sin replica set).
  database: mongodbAdapter(authDb, { transaction: false }),
  trustedOrigins: [env.FRONTEND_URL],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  // Cada proveedor social se habilita solo si sus dos variables de entorno estan cargadas.
  socialProviders: {
    ...(githubEnabled && {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    }),
    ...(googleEnabled && {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    }),
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});

// Lo consume el frontend para mostrar solo los botones de login que estan configurados.
export const enabledProviders = { github: githubEnabled, google: googleEnabled };

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = AuthSession["user"];
export type UserRole = "user" | "admin";
