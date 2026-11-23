import { z } from "zod";
import { RECIPE_CATEGORIES } from "../models/Recipe.js";

export const createRecipeSchema = z.object({
  title: z
    .string({ error: "El título es obligatorio" })
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(100, "El título no puede superar los 100 caracteres"),
  description: z
    .string({ error: "La descripción es obligatoria" })
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(2000, "La descripción no puede superar los 2000 caracteres"),
  category: z.enum(RECIPE_CATEGORIES, { error: "Categoría inválida" }),
  prepTimeMinutes: z
    .number({ error: "El tiempo de preparación debe ser un número" })
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 minuto")
    .max(1440, "Máximo 1440 minutos"),
  servings: z
    .number({ error: "Las porciones deben ser un número" })
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 porción")
    .max(50, "Máximo 50 porciones"),
  vegetarian: z.boolean({ error: "Debe ser verdadero o falso" }).default(false),
  publishedAt: z.coerce.date({ error: "Fecha inválida" }).optional(),
});

// PATCH: todos los campos opcionales, pero al menos uno.
export const patchRecipeSchema = createRecipeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Mandá al menos un campo para actualizar",
  });

// Query string del listado: todo llega como texto, por eso coerce.
export const listRecipesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
  search: z.string().trim().max(100).optional(),
  category: z.enum(RECIPE_CATEGORIES).optional(),
  vegetarian: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  // recent: las mas nuevas primero (por defecto) · popular: las de mas likes primero
  sort: z.enum(["recent", "popular"]).default("recent"),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type PatchRecipeInput = z.infer<typeof patchRecipeSchema>;
export type ListRecipesQuery = z.infer<typeof listRecipesQuerySchema>;
