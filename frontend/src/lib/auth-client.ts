// Cliente de Better Auth. Usa el mismo origen del frontend: /api/auth se reescribe hacia el backend
// (proxy de Vite en local, rewrite de Render en produccion), asi la cookie de sesion es first-party.
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  plugins: [adminClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;

export type SessionUser = NonNullable<ReturnType<typeof useSession>["data"]>["user"];
export type UserRole = "user" | "admin";

export const getRole = (user: SessionUser | undefined | null): UserRole =>
  user?.role === "admin" ? "admin" : "user";
