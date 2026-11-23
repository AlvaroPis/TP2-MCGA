// Metodo + ruta -> middlewares -> controlador. Lectura publica, escritura solo admin.
import { Router } from "express";
import {
  createRecipe,
  deleteRecipe,
  getRecipeById,
  listRecipes,
  updateRecipe,
} from "../controllers/recipes.controller.js";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import {
  createRecipeSchema,
  listRecipesQuerySchema,
  patchRecipeSchema,
} from "../schemas/recipe.schema.js";

const router = Router();

// Publicas
router.get("/", validateQuery(listRecipesQuerySchema), listRecipes);
router.get("/:id", getRecipeById);

// Escritura: sesion + rol admin
router.post("/", authMiddleware, requireRole("admin"), validateBody(createRecipeSchema), createRecipe);
router.put("/:id", authMiddleware, requireRole("admin"), validateBody(createRecipeSchema), updateRecipe);
router.patch("/:id", authMiddleware, requireRole("admin"), validateBody(patchRecipeSchema), updateRecipe);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteRecipe);

export default router;
