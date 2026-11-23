// Metodo + ruta -> middlewares -> controlador.
// Lectura publica; likes para cualquier usuario logueado; escritura solo admin,
// y cada admin modifica unicamente sus propias recetas.
import { Router } from "express";
import {
  createRecipe,
  deleteRecipe,
  getRecipeById,
  likeRecipe,
  listLikedRecipes,
  listMyRecipes,
  listRecipes,
  unlikeRecipe,
  updateRecipe,
} from "../controllers/recipes.controller.js";
import { authMiddleware, optionalAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import {
  createRecipeSchema,
  listRecipesQuerySchema,
  patchRecipeSchema,
} from "../schemas/recipe.schema.js";

const router = Router();

// Publicas (optionalAuth: si hay sesion, cada receta indica si el usuario ya le dio like)
router.get("/", optionalAuth, validateQuery(listRecipesQuerySchema), listRecipes);

// Panel admin: solo las recetas propias (va antes de /:id para que "mine" no se tome como id)
router.get("/mine", authMiddleware, requireRole("admin"), validateQuery(listRecipesQuerySchema), listMyRecipes);

// Favoritas: las recetas que el usuario logueado marco con like (cualquier rol)
router.get("/liked", authMiddleware, validateQuery(listRecipesQuerySchema), listLikedRecipes);

router.get("/:id", optionalAuth, getRecipeById);

// Likes: cualquier usuario logueado (user o admin)
router.post("/:id/like", authMiddleware, likeRecipe);
router.delete("/:id/like", authMiddleware, unlikeRecipe);

// Escritura: sesion + rol admin
router.post("/", authMiddleware, requireRole("admin"), validateBody(createRecipeSchema), createRecipe);
router.put("/:id", authMiddleware, requireRole("admin"), validateBody(createRecipeSchema), updateRecipe);
router.patch("/:id", authMiddleware, requireRole("admin"), validateBody(patchRecipeSchema), updateRecipe);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteRecipe);

export default router;
