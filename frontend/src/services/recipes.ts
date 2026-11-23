import { apiFetch } from "../lib/api";
import type { RecipeFormValues } from "../schemas/recipe.schema";
import type { Paginated, Recipe, RecipeFilters } from "../types/recipe";

function toPayload(values: RecipeFormValues) {
  return { ...values, publishedAt: `${values.publishedAt}T00:00:00.000Z` };
}

export const recipesService = {
  list(filters: RecipeFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.set(key, String(value));
    });
    const query = params.toString();
    return apiFetch<Paginated<Recipe>>(`/recipes${query ? `?${query}` : ""}`);
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
