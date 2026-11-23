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
| Frontend | https://recetario-unry.onrender.com            |
| Backend  | https://recetario-api-y1xv.onrender.com        |


## Usuarios de prueba

Los crea el script `npm run seed` (en `backend/`).

| Rol   | Email                 | Contraseña   | Nota                                          |
| ----- | --------------------- | ------------ | --------------------------------------------- |
| admin | admin@recetario.com   | Admin12345   | Dueño de las 5 recetas de ejemplo             |
| admin | admin2@recetario.com  | Admin2345    | Sin recetas: sirve para probar el 403 al editar recetas ajenas |
| user  | user@recetario.com    | User12345    | Solo lectura                                  |

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
| GET    | `/api/recipes`     | público       | Listado. Query: `page`, `limit`, `search`, `category`, `vegetarian`, `sort` (`recent` / `popular`) |
| GET    | `/api/recipes/mine` | `admin`      | Solo las recetas creadas por el admin logueado (mismos filtros)          |
| GET    | `/api/recipes/liked` | con sesión  | Recetas a las que el usuario logueado le dio like (mismos filtros)       |
| GET    | `/api/recipes/:id` | público       | Detalle (404 si no existe)                                               |
| POST   | `/api/recipes/:id/like` | con sesión | Da like (uno por usuario). Devuelve `{ likesCount, likedByMe }`        |
| DELETE | `/api/recipes/:id/like` | con sesión | Quita el like. Devuelve `{ likesCount, likedByMe }`                    |
| POST   | `/api/recipes`     | `admin`       | Crea una receta (201), queda a nombre de quien la crea                   |
| PUT    | `/api/recipes/:id` | `admin` dueño | Reemplaza la receta completa (todos los campos obligatorios)             |
| PATCH  | `/api/recipes/:id` | `admin` dueño | Actualiza solo los campos enviados                                       |
| DELETE | `/api/recipes/:id` | `admin` dueño | Elimina la receta (204)                                                  |
| GET    | `/api/config/providers` | público  | Qué logins sociales están habilitados: `{ github, google }`              |
| GET    | `/health`          | público       | Health check para Render                                                 |

Códigos de respuesta: `201` al crear, `204` al eliminar, `400` datos inválidos (con detalle por campo),
`401` sin sesión, `403` sin permisos (rol `user`, o admin que intenta modificar una receta ajena),
`404` receta inexistente.

Las rutas de escritura usan `authMiddleware` + `requireRole("admin")`. Además, PUT/PATCH/DELETE
verifican que `createdBy` de la receta sea el usuario logueado: **cada admin solo edita y elimina sus
propias recetas**, y en su panel ve únicamente las suyas. El listado público muestra todas.

**Likes:** cualquier usuario logueado (`user` o `admin`) puede darle like a una receta, una sola vez.
Cada receta devuelve `likesCount` y `likedByMe` (si el usuario logueado ya le dio like; sin sesión es
`false`). La lista de quiénes dieron like no se expone. El like y el unlike son atómicos e idempotentes:
repetirlos no cambia el contador.

### Autenticación (Better Auth, montado en `/api/auth/*`)

| Método | Ruta                               | Rol requerido | Descripción                         |
| ------ | ---------------------------------- | ------------- | ----------------------------------- |
| POST   | `/api/auth/sign-up/email`          | público       | Registro (rol `user` por defecto)   |
| POST   | `/api/auth/sign-in/email`          | público       | Login con email y contraseña        |
| POST   | `/api/auth/sign-in/social`         | público       | Login con GitHub o Google           |
| GET    | `/api/auth/callback/github`        | público       | Callback de la OAuth App de GitHub  |
| GET    | `/api/auth/callback/google`        | público       | Callback del cliente OAuth de Google |
| GET    | `/api/auth/get-session`            | público       | Sesión actual (la usa `useSession`) |
| POST   | `/api/auth/sign-out`               | con sesión    | Logout                              |
| GET    | `/api/auth/admin/list-users`       | `admin`       | Listado de usuarios                 |
| POST   | `/api/auth/admin/set-role`         | `admin`       | Cambia el rol de un usuario         |

## Funcionalidades del frontend

- `/` listado público con búsqueda, filtro por categoría y vegetariana, orden "Más recientes" /
  "Más gustadas", y paginación (los filtros quedan en la URL).
- `/recetas/:id` detalle de la receta.
- Botón ❤ **Me gusta** con contador en cada tarjeta y en el detalle. Sin sesión lleva al login y
  después vuelve a la misma página.
- `/favoritas` (**Mis favoritas**, ruta privada para cualquier usuario logueado): las recetas a las
  que el usuario le dio like.
- `/login` (email + GitHub + Google) y `/registro`; logout desde el header. Los botones sociales se
  muestran solo si el proveedor está configurado en el backend.
- `/admin` panel con el ABM de **las recetas propias** del admin; `/admin/recetas/nueva` y
  `/admin/recetas/:id/editar` con formularios React Hook Form + Zod que muestran los errores de
  validación. Si un admin abre la edición de una receta ajena ve "Sin permisos".
- `/admin/usuarios` cambio de roles con `authClient.admin.setRole` (opcional del TP).
- Rutas `/admin/*` protegidas por rol: sin sesión redirige a `/login` (y vuelve después de ingresar);
  un usuario común ve la pantalla **"Sin permisos"**.
- La sesión se obtiene con `useSession()`: al recargar la página (F5) se mantiene.

### Opcionales implementados

Están los cuatro:

- ✅ Paginación, filtros y búsqueda en el listado.
- ✅ Cada usuario ve / edita solo sus propios registros: cada admin gestiona únicamente las recetas
  que creó (`GET /api/recipes/mine` + chequeo de `createdBy` en PUT/PATCH/DELETE → 403).
- ✅ Login con Google, además de GitHub.
- ✅ Página de admin para cambiar roles (`authClient.admin.setRole`).

Extra:

- ✅ Likes en las recetas, orden por "Más gustadas" y página **Mis favoritas**.

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
| `GOOGLE_CLIENT_ID`     | —                                | Cliente OAuth de Google                                       |
| `GOOGLE_CLIENT_SECRET` | —                                | Cliente OAuth de Google                                       |
| `DNS_SERVERS`          | `8.8.8.8,1.1.1.1` (opcional)     | Solo si aparece `querySrv ECONNREFUSED` al usar `mongodb+srv://` |
| `SEED_*`               | (opcionales)                     | Emails/contraseñas de los usuarios que crea el seed           |

Para GitHub crear una **OAuth App** (GitHub → Settings → Developer settings → OAuth Apps):

- Local: Homepage `http://localhost:5173`, callback `http://localhost:5173/api/auth/callback/github`.
- Producción (otra OAuth App): Homepage `https://recetario-unry.onrender.com`, callback
  `https://recetario-unry.onrender.com/api/auth/callback/github`.

Para Google crear un **ID de cliente de OAuth** (Google Cloud Console → APIs y servicios →
Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web):

- Orígenes de JavaScript autorizados: `http://localhost:5173` y `https://recetario-unry.onrender.com`.
- URIs de redireccionamiento autorizados: `http://localhost:5173/api/auth/callback/google` y
  `https://recetario-unry.onrender.com/api/auth/callback/google`.

## Deploy en Render

El archivo `render.yaml` define los dos servicios (Render → **New → Blueprint** y elegir este repo):

- **recetario-api** — Web Service (`backend/`): `npm ci --include=dev && npm run build` y `npm start`.
  Cargar en el dashboard `MONGODB_URI`, `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET`
  (`BETTER_AUTH_SECRET` lo genera Render).
- **recetario** — Static Site (`frontend/`): publica `dist/` con dos rewrites:
  - `/api/*` → `https://recetario-api-y1xv.onrender.com/api/*` (el frontend llama a `/api`, no al backend directo).
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
