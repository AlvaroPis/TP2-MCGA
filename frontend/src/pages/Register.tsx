import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate } from "react-router";
import { FormField } from "../components/FormField";
import { signUp, useSession } from "../lib/auth-client";
import { registerSchema, type RegisterValues } from "../schemas/auth.schema";

export const Register = () => {
  const { data: session, isPending } = useSession();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  // Better Auth inicia sesion automaticamente despues del registro.
  if (!isPending && session) return <Navigate to="/" replace />;

  const onSubmit = async ({ name, email, password }: RegisterValues) => {
    setServerError(null);
    const { error } = await signUp.email({ name, email, password });
    if (error) {
      setServerError(
        error.code === "USER_ALREADY_EXISTS" || error.status === 422
          ? "Ya existe una cuenta con ese email"
          : (error.message ?? "No se pudo crear la cuenta"),
      );
    }
  };

  return (
    <section className="mx-auto max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-semibold">Crear cuenta</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <FormField label="Nombre" error={errors.name?.message}>
          <input autoComplete="name" className="input" {...register("name")} />
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="email" className="input" {...register("email")} />
        </FormField>
        <FormField label="Contraseña" error={errors.password?.message}>
          <input type="password" autoComplete="new-password" className="input" {...register("password")} />
        </FormField>
        <FormField label="Repetir contraseña" error={errors.confirmPassword?.message}>
          <input type="password" autoComplete="new-password" className="input" {...register("confirmPassword")} />
        </FormField>

        {serverError && (
          <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Creando cuenta..." : "Registrarme"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="font-medium text-brand-700 underline">
          Ingresá
        </Link>
      </p>
    </section>
  );
};
