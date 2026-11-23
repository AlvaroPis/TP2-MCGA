import type { Request, Response } from "express";
import { isValidObjectId, type QueryFilter } from "mongoose";
import Recipe, { type IRecipe, type RecipeDocument } from "../models/Recipe.js";
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

// Respuesta de una receta: el JSON del documento (sin la lista de likes) + si el usuario logueado ya le dio like.
function serialize(recipe: RecipeDocument, userId?: string) {
  return {
    ...recipe.toJSON(),
    likesCount: recipe.likesCount ?? 0,
    likedByMe: userId ? (recipe.likes ?? []).includes(userId) : false,
  };
}

async function sendPage(req: Request, res: Response, filter: QueryFilter<IRecipe>, query: ListRecipesQuery) {
  const { page, limit, sort } = query;
  const order: Record<string, 1 | -1> =
    sort === "popular"
      ? { likesCount: -1, publishedAt: -1, _id: -1 }
      : { publishedAt: -1, _id: -1 };

  const [recipes, total] = await Promise.all([
    Recipe.find(filter)
      .sort(order)
      .skip((page - 1) * limit)
      .limit(limit),
    Recipe.countDocuments(filter),
  ]);

  res.status(200).json({
    data: recipes.map((recipe) => serialize(recipe, req.user?.id)),
    meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}

// GET /api/recipes?page=1&limit=9&search=tarta&category=postre&vegetarian=true&sort=popular  (publico)
export async function listRecipes(req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListRecipesQuery;
  await sendPage(req, res, buildFilter(query), query);
}

// GET /api/recipes/mine  (admin): solo las recetas que creo el usuario logueado
export async function listMyRecipes(req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListRecipesQuery;
  await sendPage(req, res, { ...buildFilter(query), createdBy: req.user!.id }, query);
}

// GET /api/recipes/liked  (cualquier usuario logueado): las recetas a las que el usuario le dio like
export async function listLikedRecipes(req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListRecipesQuery;
  await sendPage(req, res, { ...buildFilter(query), likes: req.user!.id }, query);
}

// GET /api/recipes/:id  (publico)
export async function getRecipeById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) return invalidId(res);

  const recipe = await Recipe.findById(id);
  if (!recipe) return notFound(res);

  res.status(200).json(serialize(recipe, req.user?.id));
}

// POST /api/recipes/:id/like  (cualquier usuario logueado): idempotente, un like por usuario.
// DELETE /api/recipes/:id/like: quita el like. Las dos devuelven { likesCount, likedByMe }.
async function setLike(req: Request<{ id: string }>, res: Response, liked: boolean): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) return invalidId(res);
  const userId = req.user!.id;

  // Update atomico y condicional: el contador solo cambia si realmente se agrega o se quita el like,
  // asi dos clics seguidos (o dos pestañas) no lo desincronizan.
  if (liked) {
    await Recipe.updateOne({ _id: id, likes: { $ne: userId } }, { $push: { likes: userId }, $inc: { likesCount: 1 } });
  } else {
    await Recipe.updateOne({ _id: id, likes: userId }, { $pull: { likes: userId }, $inc: { likesCount: -1 } });
  }

  const recipe = await Recipe.findById(id);
  if (!recipe) return notFound(res);

  res.status(200).json({ likesCount: recipe.likesCount ?? 0, likedByMe: (recipe.likes ?? []).includes(userId) });
}

export const likeRecipe = (req: Request<{ id: string }>, res: Response) => setLike(req, res, true);
export const unlikeRecipe = (req: Request<{ id: string }>, res: Response) => setLike(req, res, false);

// POST /api/recipes  (admin): la receta queda a nombre de quien la crea
export async function createRecipe(
  req: Request<{}, {}, CreateRecipeInput>,
  res: Response,
): Promise<void> {
  const recipe = await Recipe.create({ ...req.body, createdBy: req.user!.id });
  res.status(201).json(serialize(recipe, req.user!.id));
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

  res.status(200).json(serialize(recipe, req.user!.id));
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
