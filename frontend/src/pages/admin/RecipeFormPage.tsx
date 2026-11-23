// Alta y edicion de recetas con React Hook Form + Zod. Con :id en la URL carga la receta y edita.
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router";
import { FormField } from "../../components/FormField";
import { getErrorMessage } from "../../lib/api";
import { useSession } from "../../lib/auth-client";
import { recipeFormSchema, type RecipeFormValues } from "../../schemas/recipe.schema";
import { recipesService } from "../../services/recipes";
import { CATEGORY_LABELS, RECIPE_CATEGORIES } from "../../types/recipe";

const today = () => new Date().toISOString().slice(0, 10);

export const RecipeFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(isEdit);
  const [notOwner, setNotOwner] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user.id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "principal",
      prepTimeMinutes: 30,
      servings: 4,
      vegetarian: false,
      publishedAt: today(),
    },
  });

  useEffect(() => {
    if (!id || !userId) return;
    recipesService
      .get(id)
      .then((recipe) => {
        // El backend igual responde 403, pero asi no se muestra un formulario que no se puede guardar.
        if (recipe.createdBy !== userId) {
          setNotOwner(true);
          return;
        }
        reset({
          title: recipe.title,
          description: recipe.description,
          category: recipe.category,
          prepTimeMinutes: recipe.prepTimeMinutes,
          servings: recipe.servings,
          vegetarian: recipe.vegetarian,
          publishedAt: recipe.publishedAt.slice(0, 10),
        });
      })
      .catch((err) => setServerError(getErrorMessage(err)))
      .finally(() => setLoadingRecipe(false));
  }, [id, userId, reset]);

  const onSubmit = async (values: RecipeFormValues) => {
    setServerError(null);
    try {
      const saved = id ? await recipesService.update(id, values) : await recipesService.create(values);
      navigate(`/recetas/${saved._id}`);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  if (loadingRecipe) return <p className="text-slate-500">Cargando receta...</p>;

  if (notOwner) {
    return (
      <section className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-red-800">Sin permisos</h2>
        <p className="mt-2 text-sm text-red-700">Solo podés editar las recetas que creaste vos.</p>
        <Link to="/admin" className="btn-secondary mt-6">
          Volver a tus recetas
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <Link to="/admin" className="text-sm text-brand-700 hover:underline">
        ← Volver al panel
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">{isEdit ? "Editar receta" : "Nueva receta"}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Título" error={errors.title?.message}>
          <input className="input" {...register("title")} />
        </FormField>

        <FormField label="Descripción / preparación" error={errors.description?.message}>
          <textarea rows={6} className="input" {...register("description")} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Categoría" error={errors.category?.message}>
            <select className="input" {...register("category")}>
              {RECIPE_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Fecha de publicación" error={errors.publishedAt?.message}>
            <input type="date" className="input" {...register("publishedAt")} />
          </FormField>
          <FormField label="Tiempo de preparación (minutos)" error={errors.prepTimeMinutes?.message}>
            <input type="number" className="input" {...register("prepTimeMinutes", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Porciones" error={errors.servings?.message}>
            <input type="number" className="input" {...register("servings", { valueAsNumber: true })} />
          </FormField>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-brand-600" {...register("vegetarian")} />
          Es vegetariana
        </label>

        {serverError && (
          <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Link to="/admin" className="btn-secondary">
            Cancelar
          </Link>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear receta"}
          </button>
        </div>
      </form>
    </section>
  );
};
