import type { Request, Response } from "express";
import { isValidObjectId, type QueryFilter } from "mongoose";
import Recipe, { type IRecipe } from "../models/Recipe.js";
import type {
  CreateRecipeInput,
  ListRecipesQuery,
  PatchRecipeInput,
} from "../schemas/recipe.schema.js";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function invalidId(res: Response): void {
  res.status(400).json({ error: "El id no es válido" });
}

function notFound(res: Response): void {
  res.status(404).json({ error: "Receta no encontrada" });
}

function notOwner(res: Response): void {
  res.status(403).json({ error: "Solo podés modificar las recetas que creaste vos" });
}

function buildFilter({ search, category, vegetarian }: ListRecipesQuery): QueryFilter<IRecipe> {
  const filter: QueryFilter<IRecipe> = {};
  if (category) filter.category = category;
  if (vegetarian !== undefined) filter.vegetarian = vegetarian;
  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { description: { $regex: safe, $options: "i" } },
    ];
  }
  return filter;
}

async function sendPage(res: Response, filter: QueryFilter<IRecipe>, page: number, limit: number) {
  const [data, total] = await Promise.all([
    Recipe.find(filter)
      .sort({ publishedAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Recipe.countDocuments(filter),
  ]);

  res.status(200).json({
    data,
    meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}

// GET /api/recipes?page=1&limit=9&search=tarta&category=postre&vegetarian=true  (publico)
export async function listRecipes(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListRecipesQuery;
  await sendPage(res, buildFilter(query), query.page, query.limit);
}

// GET /api/recipes/mine  (admin): solo las recetas que creo el usuario logueado
export async function listMyRecipes(req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListRecipesQuery;
  await sendPage(res, { ...buildFilter(query), createdBy: req.user!.id }, query.page, query.limit);
}

// GET /api/recipes/:id  (publico)
export async function getRecipeById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) return invalidId(res);

  const recipe = await Recipe.findById(id);
  if (!recipe) return notFound(res);

  res.status(200).json(recipe);
}

// POST /api/recipes  (admin): la receta queda a nombre de quien la crea
export async function createRecipe(
  req: Request<{}, {}, CreateRecipeInput>,
  res: Response,
): Promise<void> {
  const recipe = await Recipe.create({ ...req.body, createdBy: req.user!.id });
  res.status(201).json(recipe);
}

// PUT /api/recipes/:id (reemplazo completo) y PATCH /api/recipes/:id (parcial)  (admin dueño)
export async function updateRecipe(
  req: Request<{ id: string }, {}, CreateRecipeInput | PatchRecipeInput>,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) return invalidId(res);

  const recipe = await Recipe.findById(id);
  if (!recipe) return notFound(res);
  if (recipe.createdBy !== req.user!.id) return notOwner(res);

  recipe.set(req.body);
  await recipe.save();

  res.status(200).json(recipe);
}

// DELETE /api/recipes/:id  (admin dueño)
export async function deleteRecipe(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) return invalidId(res);

  const recipe = await Recipe.findById(id);
  if (!recipe) return notFound(res);
  if (recipe.createdBy !== req.user!.id) return notOwner(res);

  await recipe.deleteOne();
  res.status(204).send();
}
