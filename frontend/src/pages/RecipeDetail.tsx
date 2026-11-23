import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getRole, useSession } from "../lib/auth-client";
import { ApiError, getErrorMessage } from "../lib/api";
import { formatDate } from "../lib/format";
import { LikeButton } from "../components/LikeButton";
import { recipesService } from "../services/recipes";
import { CATEGORY_LABELS, type Recipe } from "../types/recipe";

export const RecipeDetail = () => {
  const { id = "" } = useParams();
  const { data: session } = useSession();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Se recarga si cambia el usuario logueado, para saber si ya le dio like.
  const userId = session?.user.id;
  useEffect(() => {
    recipesService
      .get(id)
      .then(setRecipe)
      .catch((err) =>
        setError(err instanceof ApiError && err.status === 404 ? "La receta no existe." : getErrorMessage(err)),
      );
  }, [id, userId]);

  if (error) {
    return (
      <div className="text-center">
        <p className="mb-4 text-red-700">{error}</p>
        <Link to="/" className="btn-secondary">
          Volver al listado
        </Link>
      </div>
    );
  }

  if (!recipe) return <p className="text-slate-500">Cargando receta...</p>;

  return (
    <article className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <Link to="/" className="text-sm text-brand-700 hover:underline">
        ← Volver a las recetas
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-brand-100 px-2 py-0.5 font-medium text-brand-700">
          {CATEGORY_LABELS[recipe.category]}
        </span>
        {recipe.vegetarian && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700">Vegetariana</span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">{recipe.title}</h1>
        <LikeButton
          size="md"
          recipeId={recipe._id}
          initial={{ likesCount: recipe.likesCount ?? 0, likedByMe: recipe.likedByMe ?? false }}
        />
      </div>

      <dl className="my-6 grid grid-cols-3 gap-4 rounded-lg bg-brand-50 p-4 text-center text-sm">
        <div>
          <dt className="text-slate-500">Preparación</dt>
          <dd className="text-lg font-semibold">{recipe.prepTimeMinutes} min</dd>
        </div>
        <div>
          <dt className="text-slate-500">Porciones</dt>
          <dd className="text-lg font-semibold">{recipe.servings}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Publicada</dt>
          <dd className="text-lg font-semibold">{formatDate(recipe.publishedAt)}</dd>
        </div>
      </dl>

      <p className="whitespace-pre-line leading-relaxed text-slate-700">{recipe.description}</p>

      {/* Solo el admin que la creo puede editarla */}
      {getRole(session?.user) === "admin" && recipe.createdBy === session?.user.id && (
        <Link to={`/admin/recetas/${recipe._id}/editar`} className="btn-secondary mt-8">
          Editar receta
        </Link>
      )}
    </article>
  );
};
