import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useLocation } from "react-router";
import { FormField } from "../components/FormField";
import { apiFetch } from "../lib/api";
import { signIn, useSession } from "../lib/auth-client";
import { loginSchema, type LoginValues } from "../schemas/auth.schema";

type SocialProvider = "github" | "google";
type ProvidersConfig = Record<SocialProvider, boolean>;

const PROVIDER_LABELS: Record<SocialProvider, string> = { github: "GitHub", google: "Google" };

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

  // El backend informa que proveedores sociales estan configurados: solo se muestran esos botones.
  const [providers, setProviders] = useState<ProvidersConfig>({ github: false, google: false });
  useEffect(() => {
    apiFetch<ProvidersConfig>("/config/providers")
      .then(setProviders)
      .catch(() => setProviders({ github: false, google: false }));
  }, []);

  // Si ya hay sesion (o el login acaba de crearla) vuelve a la ruta que se queria visitar.
  if (!isPending && session) return <Navigate to={from} replace />;

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    const { error } = await signIn.email(values);
    if (error) setServerError(error.status === 401 ? "Email o contraseña incorrectos" : (error.message ?? "No se pudo iniciar sesión"));
  };

  const loginWithProvider = async (provider: SocialProvider) => {
    setServerError(null);
    const { error } = await signIn.social({
      provider,
      callbackURL: `${window.location.origin}${from}`,
      errorCallbackURL: `${window.location.origin}/login`,
    });
    if (error) setServerError(error.message ?? `No se pudo iniciar sesión con ${PROVIDER_LABELS[provider]}`);
  };

  const hasSocial = providers.github || providers.google;

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

      {hasSocial && (
        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" /> o <span className="h-px flex-1 bg-slate-200" />
        </div>
      )}

      <div className="space-y-2">
      {providers.github && (
      <button type="button" onClick={() => loginWithProvider("github")} className="btn w-full bg-slate-900 text-white hover:bg-slate-700">
        <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        Continuar con GitHub
      </button>
      )}

      {providers.google && (
        <button type="button" onClick={() => loginWithProvider("google")} className="btn-secondary w-full">
          <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          Continuar con Google
        </button>
      )}
      </div>

      <p className="mt-4 text-center text-sm text-slate-600">
        ¿No tenés cuenta?{" "}
        <Link to="/registro" className="font-medium text-brand-700 underline">
          Registrate
        </Link>
      </p>
    </section>
  );
};
