// authMiddleware: exige una sesion valida de Better Auth (cookie) -> 401 si no hay.
// requireRole: se usa DESPUES de authMiddleware y corta con 403 si el rol no alcanza.
import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth, type AuthSession, type UserRole } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthSession["user"];
      session?: AuthSession["session"];
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

    if (!session) {
      res.status(401).json({ error: "Tenés que iniciar sesión" });
      return;
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    next(error);
  }
}

// optionalAuth: para rutas publicas que muestran algo distinto si hay sesion (ej: "ya le di like").
// Si hay sesion completa req.user; si no, sigue igual sin cortar con 401.
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (session) {
      req.user = session.user;
      req.session = session.session;
    }
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Tenés que iniciar sesión" });
      return;
    }

    const role = (req.user.role ?? "user") as UserRole;
    if (!allowedRoles.includes(role)) {
      res.status(403).json({ error: "No tenés permisos para realizar esta acción" });
      return;
    }

    next();
  };
}
