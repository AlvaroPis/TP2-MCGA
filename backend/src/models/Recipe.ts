// Entidad propia del TP: Receta. Usa texto, numeros, booleano, fecha y un enum.
import { Schema, model, type HydratedDocument } from "mongoose";

export const RECIPE_CATEGORIES = ["entrada", "principal", "postre", "bebida", "snack"] as const;
export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

export interface IRecipe {
  title: string;
  description: string;
  category: RecipeCategory;
  prepTimeMinutes: number;
  servings: number;
  vegetarian: boolean;
  publishedAt: Date;
  createdBy?: string;
}

export type RecipeDocument = HydratedDocument<IRecipe>;

const recipeSchema = new Schema<IRecipe>(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      maxlength: [100, "El título no puede superar los 100 caracteres"],
    },
    description: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
      maxlength: [2000, "La descripción no puede superar los 2000 caracteres"],
    },
    category: {
      type: String,
      enum: RECIPE_CATEGORIES,
      required: [true, "La categoría es obligatoria"],
    },
    prepTimeMinutes: {
      type: Number,
      required: [true, "El tiempo de preparación es obligatorio"],
      min: [1, "Mínimo 1 minuto"],
      max: [1440, "Máximo 1440 minutos"],
    },
    servings: {
      type: Number,
      required: [true, "Las porciones son obligatorias"],
      min: [1, "Mínimo 1 porción"],
      max: [50, "Máximo 50 porciones"],
    },
    vegetarian: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: () => new Date(),
    },
    // Id del usuario (Better Auth) que la cargo. Solo informativo.
    createdBy: {
      type: String,
    },
  },
  { timestamps: true },
);

recipeSchema.index({ title: 1 });

const Recipe = model<IRecipe>("Recipe", recipeSchema);

export default Recipe;
