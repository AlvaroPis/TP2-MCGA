import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { getRole, signOut, useSession } from "../lib/auth-client";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-2 py-1 hover:bg-white/15 ${isActive ? "bg-white/20" : ""}`;

export const Layout = () => {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const user = session?.user;

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-brand-50 font-sans text-slate-800">
      <header className="bg-brand-600 text-white shadow">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="text-xl font-bold tracking-tight">
            🍲 Recetario
          </Link>
          <nav className="flex flex-1 gap-2 text-sm">
            <NavLink to="/" end className={navClass}>
              Recetas
            </NavLink>
            {getRole(user) === "admin" && (
              <>
                <NavLink to="/admin" end className={navClass}>
                  Panel admin
                </NavLink>
                <NavLink to="/admin/usuarios" className={navClass}>
                  Usuarios
                </NavLink>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {isPending ? null : user ? (
              <>
                <span className="hidden sm:inline">
                  {user.name} <span className="rounded bg-white/20 px-1.5 py-0.5 text-xs">{getRole(user)}</span>
                </span>
                <button type="button" onClick={handleLogout} className="rounded px-3 py-1.5 hover:bg-white/15">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded px-3 py-1.5 hover:bg-white/15">
                  Ingresar
                </Link>
                <Link to="/registro" className="rounded bg-white px-3 py-1.5 font-medium text-brand-700">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="py-6 text-center text-xs text-slate-500">
        Recetario · TP2 Metodologías y Desarrollos Web
      </footer>
    </div>
  );
};
