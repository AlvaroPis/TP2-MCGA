// Mismas reglas que el backend, para mostrar los errores antes de mandar el formulario.
import { z } from "zod";
import { RECIPE_CATEGORIES } from "../types/recipe";

export const recipeFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(100, "El título no puede superar los 100 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(2000, "La descripción no puede superar los 2000 caracteres"),
  category: z.enum(RECIPE_CATEGORIES, { error: "Elegí una categoría" }),
  prepTimeMinutes: z
    .number({ error: "Ingresá un número" })
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 minuto")
    .max(1440, "Máximo 1440 minutos"),
  servings: z
    .number({ error: "Ingresá un número" })
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 porción")
    .max(50, "Máximo 50 porciones"),
  vegetarian: z.boolean(),
  publishedAt: z.string().min(1, "La fecha es obligatoria"),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;
