// Listado publico con busqueda, filtros y paginacion. Los filtros viven en la URL (?search=&page=...).
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { RecipeCard } from "../components/RecipeCard";
import { getErrorMessage } from "../lib/api";
import { recipesService } from "../services/recipes";
import {
  CATEGORY_LABELS,
  RECIPE_CATEGORIES,
  type Paginated,
  type Recipe,
  type RecipeCategory,
} from "../types/recipe";

export const Home = () => {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page")) || 1;
  const search = params.get("search") ?? "";
  const category = (params.get("category") ?? "") as RecipeCategory | "";
  const vegetarian = (params.get("vegetarian") ?? "") as "true" | "false" | "";

  const [searchInput, setSearchInput] = useState(search);
  const [result, setResult] = useState<Paginated<Recipe> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    recipesService
      .list({ page, limit: 9, search, category, vegetarian })
      .then((data) => !cancelled && (setResult(data), setError(null)))
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, search, category, vegetarian]);

  const updateParams = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page");
    setParams(next);
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Recetas</h1>
        <p className="text-slate-600">Ideas para cocinar hoy, de la entrada al postre.</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          updateParams({ search: searchInput.trim() });
        }}
        className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto_auto]"
      >
        <input
          className="input"
          placeholder="Buscar por título o descripción..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <select
          className="input"
          value={category}
          onChange={(event) => updateParams({ category: event.target.value })}
        >
          <option value="">Todas las categorías</option>
          {RECIPE_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={vegetarian}
          onChange={(event) => updateParams({ vegetarian: event.target.value })}
        >
          <option value="">Todas</option>
          <option value="true">Solo vegetarianas</option>
          <option value="false">No vegetarianas</option>
        </select>
        <button type="submit" className="btn-primary">
          Buscar
        </button>
      </form>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && !result && <p className="text-slate-500">Cargando recetas...</p>}

      {result && (
        <>
          {result.data.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No se encontraron recetas con esos filtros.
            </p>
          ) : (
            <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
              {result.data.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-4 text-sm">
            <button
              type="button"
              className="btn-secondary"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              ← Anterior
            </button>
            <span>
              Página {result.meta.page} de {result.meta.totalPages} · {result.meta.total} recetas
            </span>
            <button
              type="button"
              className="btn-secondary"
              disabled={page >= result.meta.totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </section>
  );
};
