import { apiFetch } from "../lib/api";
import type { RecipeFormValues } from "../schemas/recipe.schema";
import type { LikeStatus, Paginated, Recipe, RecipeFilters } from "../types/recipe";

function toPayload(values: RecipeFormValues) {
  return { ...values, publishedAt: `${values.publishedAt}T00:00:00.000Z` };
}

function toQuery(filters: RecipeFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const recipesService = {
  list(filters: RecipeFilters = {}) {
    return apiFetch<Paginated<Recipe>>(`/recipes${toQuery(filters)}`);
  },

  // Solo las recetas creadas por el admin logueado (panel de administracion).
  listMine(filters: RecipeFilters = {}) {
    return apiFetch<Paginated<Recipe>>(`/recipes/mine${toQuery(filters)}`);
  },

  // Recetas a las que el usuario logueado le dio like.
  listLiked(filters: RecipeFilters = {}) {
    return apiFetch<Paginated<Recipe>>(`/recipes/liked${toQuery(filters)}`);
  },

  like(id: string) {
    return apiFetch<LikeStatus>(`/recipes/${id}/like`, { method: "POST" });
  },

  unlike(id: string) {
    return apiFetch<LikeStatus>(`/recipes/${id}/like`, { method: "DELETE" });
  },

  get(id: string) {
    return apiFetch<Recipe>(`/recipes/${id}`);
  },

  create(values: RecipeFormValues) {
    return apiFetch<Recipe>("/recipes", { method: "POST", body: JSON.stringify(toPayload(values)) });
  },

  update(id: string, values: RecipeFormValues) {
    return apiFetch<Recipe>(`/recipes/${id}`, {
      method: "PUT",
      body: JSON.stringify(toPayload(values)),
    });
  },

  remove(id: string) {
    return apiFetch<void>(`/recipes/${id}`, { method: "DELETE" });
  },
};
