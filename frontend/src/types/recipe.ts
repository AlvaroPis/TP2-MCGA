export const RECIPE_CATEGORIES = ["entrada", "principal", "postre", "bebida", "snack"] as const;
export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  entrada: "Entrada",
  principal: "Plato principal",
  postre: "Postre",
  bebida: "Bebida",
  snack: "Snack",
};

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  category: RecipeCategory;
  prepTimeMinutes: number;
  servings: number;
  vegetarian: boolean;
  publishedAt: string;
  /** Id del admin que la creo: solo el puede editarla o borrarla. */
  createdBy?: string;
  likesCount: number;
  /** true si el usuario logueado ya le dio like (false sin sesion). */
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface RecipeFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: RecipeCategory | "";
  vegetarian?: "true" | "false" | "";
  sort?: "recent" | "popular";
}

export interface LikeStatus {
  likesCount: number;
  likedByMe: boolean;
}
