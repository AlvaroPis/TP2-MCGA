import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { env } from "./config/env.js";
import { connectMongoDB } from "./config/db.js";
import { auth } from "./lib/auth.js";
import apiRouter from "./routes/index.js";

const app = express();

// Render (y la mayoria de los hosts) ponen un proxy adelante: necesario para leer bien la IP / protocolo.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

// Better Auth va ANTES de express.json(): lee el body crudo por su cuenta.
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptimeSeconds: process.uptime(), timestamp: new Date().toISOString() });
});

app.use("/api", apiRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejador de errores: JSON mal formado -> 400, validaciones de Mongoose -> 400, el resto -> 500.
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido" });
    return;
  }
  if (error instanceof Error && error.name === "ValidationError") {
    res.status(400).json({ error: error.message });
    return;
  }
  console.error("[server] error no controlado:", error);
  res.status(500).json({ error: "Error interno del servidor" });
});

async function startServer(): Promise<void> {
  await connectMongoDB();
  app.listen(env.PORT, () => {
    console.log(`[server] escuchando en el puerto ${env.PORT} (${env.NODE_ENV})`);
  });
}

startServer().catch((error: unknown) => {
  console.error("[server] no se pudo iniciar:", error);
  process.exit(1);
});
