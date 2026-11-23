import { Link, Navigate, Outlet, useLocation } from "react-router";
import { getRole, useSession, type UserRole } from "../lib/auth-client";

interface ProtectedRouteProps {
  roles?: UserRole[];
}

export const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  // useSession() consulta /api/auth/get-session: al recargar (F5) la sesion se recupera desde la cookie.
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return <p className="text-slate-500">Verificando sesión...</p>;
  }

  // Sin sesion: al login, guardando la ruta pedida para volver despues de ingresar.
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Con sesion pero sin el rol: pantalla de "sin permisos".
  if (roles && !roles.includes(getRole(session.user))) {
    return (
      <section className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-red-800">Sin permisos</h2>
        <p className="mt-2 text-sm text-red-700">
          Esta sección es solo para administradores. Tu usuario tiene rol <b>{getRole(session.user)}</b>.
        </p>
        <Link to="/" className="btn-secondary mt-6">
          Volver al recetario
        </Link>
      </section>
    );
  }

  return <Outlet />;
};
