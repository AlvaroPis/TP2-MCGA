# 🍲 Recetario — TP2 Metodologías y Desarrollos Web

Aplicación full stack para publicar y consultar **recetas de cocina**. Cualquier visitante puede ver el
listado (con búsqueda, filtros y paginación) y el detalle de cada receta; los usuarios se registran con
email/contraseña o con GitHub, y los **administradores** gestionan las recetas (alta, edición y baja) y los
roles de los usuarios desde un panel propio.

## Entidad elegida: `Recipe` (receta)

| Campo             | Tipo      | Reglas                                                       |
| ----------------- | --------- | ------------------------------------------------------------ |
| `title`           | texto     | obligatorio, 3–100 caracteres                                |
| `description`     | texto     | obligatorio, 10–2000 caracteres                              |
| `category`        | texto (enum) | `entrada` · `principal` · `postre` · `bebida` · `snack`   |
| `prepTimeMinutes` | número    | entero, 1–1440                                               |
| `servings`        | número    | entero, 1–50                                                 |
| `vegetarian`      | booleano  | por defecto `false`                                          |
| `publishedAt`     | fecha     | por defecto la fecha actual                                  |
| `createdBy`       | texto     | id del admin que la creó (lo completa el backend)            |

## URLs en Render

| Parte    | URL                                       |
| -------- | ----------------------------------------- |
| Frontend | https://recetario.onrender.com            |
| Backend  | https://recetario-api.onrender.com        |

> Si Render asigna otras URLs al crear los servicios, actualizarlas acá y en `render.yaml`.

## Usuarios de prueba

Los crea el script `npm run seed` (en `backend/`).

| Rol   | Email                 | Contraseña   |
| ----- | --------------------- | ------------ |
| admin | admin@recetario.com   | Admin12345   |
| user  | user@recetario.com    | User12345    |

## Stack

- **Backend** (`backend/`): Node.js + Express 5 + TypeScript, MongoDB (Mongoose para las recetas, driver
  nativo para Better Auth), Zod para validar, **Better Auth** (email/contraseña + GitHub, plugin `admin`
  para roles).
- **Frontend** (`frontend/`): React 19 + Vite + TypeScript, React Router, React Hook Form + Zod,
  Tailwind CSS, cliente de Better Auth (`useSession()`).

```
backend/
  src/
    config/        env.ts, db.ts (Mongoose + MongoClient)
    lib/auth.ts    configuración de Better Auth
    middlewares/   authMiddleware, requireRole, validateBody / validateQuery
    models/        Recipe.ts
    schemas/       recipe.schema.ts (Zod)
    controllers/   recipes.controller.ts
    routes/        index.ts, recipes.routes.ts
    scripts/       seed.ts
    server.ts
frontend/
  src/
    lib/           auth-client.ts, api.ts
    router/        rutas + ProtectedRoute (por rol)
    pages/         Home, RecipeDetail, Login, Register, admin/*
render.yaml        blueprint de los dos servicios
```

## Endpoints de la API

### Recetas

| Método | Ruta               | Rol requerido | Descripción                                                              |
| ------ | ------------------ | ------------- | ------------------------------------------------------------------------ |
| GET    | `/api/recipes`     | público       | Listado. Query: `page`, `limit`, `search`, `category`, `vegetarian`      |
| GET    | `/api/recipes/:id` | público       | Detalle (404 si no existe)                                               |
| POST   | `/api/recipes`     | `admin`       | Crea una receta (201). Body validado con Zod                             |
| PUT    | `/api/recipes/:id` | `admin`       | Reemplaza la receta completa (todos los campos obligatorios)             |
| PATCH  | `/api/recipes/:id` | `admin`       | Actualiza solo los campos enviados                                       |
| DELETE | `/api/recipes/:id` | `admin`       | Elimina la receta (204)                                                  |
| GET    | `/health`          | público       | Health check para Render                                                 |

Códigos de respuesta: `201` al crear, `204` al eliminar, `400` datos inválidos (con detalle por campo),
`401` sin sesión, `403` sin permisos (rol `user`), `404` receta inexistente.

Las rutas de escritura usan `authMiddleware` + `requireRole("admin")`.

### Autenticación (Better Auth, montado en `/api/auth/*`)

| Método | Ruta                               | Rol requerido | Descripción                         |
| ------ | ---------------------------------- | ------------- | ----------------------------------- |
| POST   | `/api/auth/sign-up/email`          | público       | Registro (rol `user` por defecto)   |
| POST   | `/api/auth/sign-in/email`          | público       | Login con email y contraseña        |
| POST   | `/api/auth/sign-in/social`         | público       | Login con GitHub                    |
| GET    | `/api/auth/callback/github`        | público       | Callback de la OAuth App de GitHub  |
| GET    | `/api/auth/get-session`            | público       | Sesión actual (la usa `useSession`) |
| POST   | `/api/auth/sign-out`               | con sesión    | Logout                              |
| GET    | `/api/auth/admin/list-users`       | `admin`       | Listado de usuarios                 |
| POST   | `/api/auth/admin/set-role`         | `admin`       | Cambia el rol de un usuario         |

## Funcionalidades del frontend

- `/` listado público con búsqueda, filtro por categoría y vegetariana, y paginación (los filtros quedan en la URL).
- `/recetas/:id` detalle de la receta.
- `/login` (email + GitHub) y `/registro`; logout desde el header.
- `/admin` panel con el ABM de recetas; `/admin/recetas/nueva` y `/admin/recetas/:id/editar` con
  formularios React Hook Form + Zod que muestran los errores de validación.
- `/admin/usuarios` cambio de roles con `authClient.admin.setRole` (opcional del TP).
- Rutas `/admin/*` protegidas por rol: sin sesión redirige a `/login` (y vuelve después de ingresar);
  un usuario común ve la pantalla **"Sin permisos"**.
- La sesión se obtiene con `useSession()`: al recargar la página (F5) se mantiene.

### Opcionales implementados

- ✅ Paginación, filtros y búsqueda en el listado.
- ✅ Página de admin para cambiar roles (`authClient.admin.setRole`).

## Cómo correrlo en local

Requisitos: Node.js 20+ y una base MongoDB (Atlas o local).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # completar los valores (ver tabla abajo)
npm run seed              # crea los usuarios de prueba y recetas de ejemplo
npm run dev               # http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

En local Vite hace proxy de `/api` hacia `http://localhost:3000` (igual que el rewrite de Render en
producción), así el frontend nunca llama directo a la URL del backend. Si el backend corre en otro
puerto, se puede cambiar con la variable `VITE_BACKEND_URL` al levantar Vite.

### Variables de entorno (`backend/.env`)

| Variable               | Ejemplo local                    | Descripción                                                   |
| ---------------------- | -------------------------------- | ------------------------------------------------------------- |
| `PORT`                 | `3000`                           | Puerto del backend                                            |
| `NODE_ENV`             | `development`                    | `development` / `production`                                  |
| `MONGODB_URI`          | `mongodb://127.0.0.1:27017/recetario` | Conexión a MongoDB                                       |
| `BETTER_AUTH_SECRET`   | (string aleatorio de 32+ chars)  | Firma de sesiones. `npx @better-auth/cli secret`              |
| `BETTER_AUTH_URL`      | `http://localhost:5173`          | URL pública desde donde el navegador llega a `/api/auth`      |
| `FRONTEND_URL`         | `http://localhost:5173`          | Origen permitido (CORS + `trustedOrigins`)                    |
| `GITHUB_CLIENT_ID`     | —                                | OAuth App de GitHub                                           |
| `GITHUB_CLIENT_SECRET` | —                                | OAuth App de GitHub                                           |
| `SEED_*`               | (opcionales)                     | Emails/contraseñas de los usuarios que crea el seed           |

Para GitHub crear una **OAuth App** (GitHub → Settings → Developer settings → OAuth Apps):

- Local: Homepage `http://localhost:5173`, callback `http://localhost:5173/api/auth/callback/github`.
- Producción (otra OAuth App): Homepage `https://recetario.onrender.com`, callback
  `https://recetario.onrender.com/api/auth/callback/github`.

## Deploy en Render

El archivo `render.yaml` define los dos servicios (Render → **New → Blueprint** y elegir este repo):

- **recetario-api** — Web Service (`backend/`): `npm ci --include=dev && npm run build` y `npm start`.
  Cargar en el dashboard `MONGODB_URI`, `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET`
  (`BETTER_AUTH_SECRET` lo genera Render).
- **recetario** — Static Site (`frontend/`): publica `dist/` con dos rewrites:
  - `/api/*` → `https://recetario-api.onrender.com/api/*` (el frontend llama a `/api`, no al backend directo).
  - `/*` → `/index.html` (F5 en cualquier ruta funciona).

Como el navegador solo habla con la URL del frontend, la cookie de sesión de Better Auth es del mismo
sitio y por eso `BETTER_AUTH_URL` apunta al frontend.

Después del primer deploy, crear los usuarios de prueba desde la **Shell** del servicio backend:

```bash
npm run seed:prod
```

## Seguridad

- No hay secretos en el repositorio: `.env` está en `.gitignore` y solo se versionan los `.env.example`.
- Contraseñas hasheadas por Better Auth; sesión en cookie `httpOnly` (`Secure` en producción).
- Los usuarios nuevos siempre reciben el rol `user`; solo un admin puede cambiar roles.
