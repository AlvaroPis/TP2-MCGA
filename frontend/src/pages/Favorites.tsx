// /favoritas: las recetas a las que el usuario logueado le dio like (ruta privada, cualquier rol).
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { RecipeCard } from "../components/RecipeCard";
import { getErrorMessage } from "../lib/api";
import { recipesService } from "../services/recipes";
import type { Paginated, Recipe } from "../types/recipe";

export const Favorites = () => {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<Recipe> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    recipesService
      .listLiked({ page, limit: 9 })
      .then((data) => {
        setResult(data);
        setError(null);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [page]);

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mis favoritas ❤</h1>
        <p className="text-slate-600">Las recetas a las que les diste me gusta.</p>
      </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!result && !error && <p className="text-slate-500">Cargando...</p>}

      {result && result.data.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          <p>Todavía no le diste me gusta a ninguna receta.</p>
          <Link to="/" className="btn-primary mt-4">
            Ver recetas
          </Link>
        </div>
      )}

      {result && result.data.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>

          {result.meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4 text-sm">
              <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                ← Anterior
              </button>
              <span>
                Página {page} de {result.meta.totalPages}
              </span>
              <button
                type="button"
                className="btn-secondary"
                disabled={page >= result.meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
