// Agrupa los routers de cada recurso. Las entidades nuevas se montan aca, no en server.ts.
import { Router } from "express";
import { enabledProviders } from "../lib/auth.js";
import recipesRouter from "./recipes.routes.js";

const router = Router();

router.use("/recipes", recipesRouter);

// GET /api/config/providers -> { github: boolean, google: boolean }
router.get("/config/providers", (_req, res) => {
  res.json(enabledProviders);
});

export default router;
