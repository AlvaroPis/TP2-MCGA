// Panel admin: tabla con las recetas PROPIAS del admin logueado y acciones de alta, edicion y baja (ABM).
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { getErrorMessage } from "../../lib/api";
import { formatDate } from "../../lib/format";
import { recipesService } from "../../services/recipes";
import { CATEGORY_LABELS, type Paginated, type Recipe } from "../../types/recipe";

export const AdminRecipes = () => {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<Recipe> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    recipesService
      .listMine({ page, limit: 20 })
      .then((data) => {
        setResult(data);
        setError(null);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [page]);

  useEffect(load, [load]);

  const handleDelete = async (recipe: Recipe) => {
    if (!window.confirm(`¿Eliminar "${recipe.title}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(recipe._id);
    try {
      await recipesService.remove(recipe._id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Panel de administración</h1>
          <p className="text-sm text-slate-600">
            Tus recetas: solo podés editar y eliminar las que creaste vos.
          </p>
        </div>
        <Link to="/admin/recetas/nueva" className="btn-primary">
          + Nueva receta
        </Link>
      </div>

      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!result && !error && <p className="text-slate-500">Cargando...</p>}

      {result && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Tiempo</th>
                <th className="px-4 py-3">Porciones</th>
                <th className="px-4 py-3">Veg.</th>
                <th className="px-4 py-3">Publicada</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.data.map((recipe) => (
                <tr key={recipe._id}>
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/recetas/${recipe._id}`} className="hover:underline">
                      {recipe.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{CATEGORY_LABELS[recipe.category]}</td>
                  <td className="px-4 py-3">{recipe.prepTimeMinutes} min</td>
                  <td className="px-4 py-3">{recipe.servings}</td>
                  <td className="px-4 py-3">{recipe.vegetarian ? "Sí" : "No"}</td>
                  <td className="px-4 py-3">{formatDate(recipe.publishedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/recetas/${recipe._id}/editar`} className="btn-secondary px-3 py-1">
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="btn-danger px-3 py-1"
                        disabled={deletingId === recipe._id}
                        onClick={() => handleDelete(recipe)}
                      >
                        {deletingId === recipe._id ? "..." : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {result.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Todavía no creaste ninguna receta.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {result && result.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
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
    </section>
  );
};
