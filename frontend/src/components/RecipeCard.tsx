import { Link } from "react-router";
import { CATEGORY_LABELS, type Recipe } from "../types/recipe";
import { LikeButton } from "./LikeButton";

// El link cubre el contenido; el boton de like queda afuera del <a> (no se anidan elementos interactivos).
export const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
  <article className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <Link to={`/recetas/${recipe._id}`} className="flex flex-1 flex-col p-5 pb-3">
      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="rounded-full bg-brand-100 px-2 py-0.5 font-medium text-brand-700">
          {CATEGORY_LABELS[recipe.category]}
        </span>
        {recipe.vegetarian && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700">Vegetariana</span>
        )}
      </div>
      <h3 className="text-lg font-semibold group-hover:text-brand-700">{recipe.title}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-600">{recipe.description}</p>
    </Link>
    <div className="flex items-center justify-between gap-4 px-5 pb-4 text-xs text-slate-500">
      <div className="flex gap-4">
        <span>⏱ {recipe.prepTimeMinutes} min</span>
        <span>🍽 {recipe.servings} porciones</span>
      </div>
      <LikeButton
        recipeId={recipe._id}
        initial={{ likesCount: recipe.likesCount ?? 0, likedByMe: recipe.likedByMe ?? false }}
      />
    </div>
  </article>
);
