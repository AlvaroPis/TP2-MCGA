// Arbol de rutas: publicas (listado, detalle, login, registro) y privadas por rol (panel admin).
import { createBrowserRouter } from "react-router";
import { Layout } from "../layouts/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { Home } from "../pages/Home";
import { RecipeDetail } from "../pages/RecipeDetail";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { AdminRecipes } from "../pages/admin/AdminRecipes";
import { RecipeFormPage } from "../pages/admin/RecipeFormPage";
import { AdminUsers } from "../pages/admin/AdminUsers";
import { NotFound } from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "recetas/:id", element: <RecipeDetail /> },
      { path: "login", element: <Login /> },
      { path: "registro", element: <Register /> },

      {
        path: "admin",
        element: <ProtectedRoute roles={["admin"]} />,
        children: [
          { index: true, element: <AdminRecipes /> },
          { path: "recetas/nueva", element: <RecipeFormPage /> },
          { path: "recetas/:id/editar", element: <RecipeFormPage /> },
          { path: "usuarios", element: <AdminUsers /> },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);
