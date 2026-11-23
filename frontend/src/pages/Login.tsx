import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useLocation } from "react-router";
import { FormField } from "../components/FormField";
import { signIn, useSession } from "../lib/auth-client";
import { loginSchema, type LoginValues } from "../schemas/auth.schema";

export const Login = () => {
  const { data: session, isPending } = useSession();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  // Si ya hay sesion (o el login acaba de crearla) vuelve a la ruta que se queria visitar.
  if (!isPending && session) return <Navigate to={from} replace />;

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    const { error } = await signIn.email(values);
    if (error) setServerError(error.status === 401 ? "Email o contraseña incorrectos" : (error.message ?? "No se pudo iniciar sesión"));
  };

  const loginWithGithub = async () => {
    setServerError(null);
    const { error } = await signIn.social({
      provider: "github",
      callbackURL: `${window.location.origin}${from}`,
      errorCallbackURL: `${window.location.origin}/login`,
    });
    if (error) setServerError(error.message ?? "No se pudo iniciar sesión con GitHub");
  };

  return (
    <section className="mx-auto max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-semibold">Iniciar sesión</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <FormField label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="email" className="input" {...register("email")} />
        </FormField>
        <FormField label="Contraseña" error={errors.password?.message}>
          <input type="password" autoComplete="current-password" className="input" {...register("password")} />
        </FormField>

        {serverError && (
          <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> o <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button type="button" onClick={loginWithGithub} className="btn w-full bg-slate-900 text-white hover:bg-slate-700">
        <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        Continuar con GitHub
      </button>

      <p className="mt-4 text-center text-sm text-slate-600">
        ¿No tenés cuenta?{" "}
        <Link to="/registro" className="font-medium text-brand-700 underline">
          Registrate
        </Link>
      </p>
    </section>
  );
};
