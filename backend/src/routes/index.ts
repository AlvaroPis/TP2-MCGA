// Agrupa los routers de cada recurso. Las entidades nuevas se montan aca, no en server.ts.
import { Router } from "express";
import recipesRouter from "./recipes.routes.js";

const router = Router();

router.use("/recipes", recipesRouter);

export default router;
