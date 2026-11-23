import { Link } from "react-router";

export const NotFound = () => (
  <section className="py-16 text-center">
    <p className="text-6xl font-bold text-brand-600">404</p>
    <p className="mt-2 text-slate-600">Esta página no existe.</p>
    <Link to="/" className="btn-secondary mt-6">
      Ir a las recetas
    </Link>
  </section>
);
