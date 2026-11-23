// Metodo + ruta -> middlewares -> controlador.
// Lectura publica; escritura solo admin, y cada admin modifica unicamente sus propias recetas.
import { Router } from "express";
import {
  createRecipe,
  deleteRecipe,
  getRecipeById,
  listMyRecipes,
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

// Panel admin: solo las recetas propias (va antes de /:id para que "mine" no se tome como id)
router.get("/mine", authMiddleware, requireRole("admin"), validateQuery(listRecipesQuerySchema), listMyRecipes);

router.get("/:id", getRecipeById);

// Escritura: sesion + rol admin
router.post("/", authMiddleware, requireRole("admin"), validateBody(createRecipeSchema), createRecipe);
router.put("/:id", authMiddleware, requireRole("admin"), validateBody(createRecipeSchema), updateRecipe);
router.patch("/:id", authMiddleware, requireRole("admin"), validateBody(patchRecipeSchema), updateRecipe);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteRecipe);

export default router;
