import { Link } from "react-router";
import { CATEGORY_LABELS, type Recipe } from "../types/recipe";

export const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
  <Link
    to={`/recetas/${recipe._id}`}
    className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
  >
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
    <div className="mt-4 flex gap-4 text-xs text-slate-500">
      <span>⏱ {recipe.prepTimeMinutes} min</span>
      <span>🍽 {recipe.servings} porciones</span>
    </div>
  </Link>
);
