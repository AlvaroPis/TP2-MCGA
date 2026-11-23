// Crea los dos usuarios de prueba (admin y comun) y algunas recetas de ejemplo.
// Es idempotente: si ya existen, no los duplica. Uso: npm run seed
import { authDb, connectMongoDB, disconnectMongoDB } from "../config/db.js";
import { auth } from "../lib/auth.js";
import Recipe, { type IRecipe } from "../models/Recipe.js";

const testUsers = [
  {
    name: "Admin Recetario",
    email: process.env.SEED_ADMIN_EMAIL || "admin@recetario.com",
    password: process.env.SEED_ADMIN_PASSWORD || "Admin12345",
    role: "admin",
  },
  {
    name: "Usuario Recetario",
    email: process.env.SEED_USER_EMAIL || "user@recetario.com",
    password: process.env.SEED_USER_PASSWORD || "User12345",
    role: "user",
  },
];

const sampleRecipes: Omit<IRecipe, "createdBy">[] = [
  {
    title: "Empanadas de carne cortada a cuchillo",
    description:
      "Relleno de carne cortada a cuchillo con cebolla, morrón, huevo duro y aceitunas. Se hornean 20 minutos a horno fuerte.",
    category: "principal",
    prepTimeMinutes: 90,
    servings: 12,
    vegetarian: false,
    publishedAt: new Date("2026-09-01"),
  },
  {
    title: "Tarta de zapallitos",
    description:
      "Masa casera, zapallitos salteados con cebolla, huevos y queso rallado. Ideal para una cena liviana.",
    category: "principal",
    prepTimeMinutes: 60,
    servings: 6,
    vegetarian: true,
    publishedAt: new Date("2026-09-10"),
  },
  {
    title: "Flan casero con dulce de leche",
    description:
      "Flan clásico a baño María con caramelo. Se sirve frío con dulce de leche repostero y crema.",
    category: "postre",
    prepTimeMinutes: 75,
    servings: 8,
    vegetarian: true,
    publishedAt: new Date("2026-10-02"),
  },
  {
    title: "Provoleta a la parrilla",
    description: "Provolone con orégano y ají molido, a la parrilla o en plancha hasta que se dore.",
    category: "entrada",
    prepTimeMinutes: 15,
    servings: 2,
    vegetarian: true,
    publishedAt: new Date("2026-10-15"),
  },
  {
    title: "Limonada con menta y jengibre",
    description: "Jugo de limón, agua fría, hojas de menta y un toque de jengibre rallado. Endulzar a gusto.",
    category: "bebida",
    prepTimeMinutes: 10,
    servings: 4,
    vegetarian: true,
    publishedAt: new Date("2026-11-01"),
  },
];

async function seedUsers(): Promise<void> {
  const users = authDb.collection("user");

  for (const testUser of testUsers) {
    const existing = await users.findOne({ email: testUser.email });

    if (!existing) {
      await auth.api.signUpEmail({
        body: { name: testUser.name, email: testUser.email, password: testUser.password },
      });
      console.log(`[seed] usuario creado: ${testUser.email}`);
    } else {
      console.log(`[seed] usuario ya existente: ${testUser.email}`);
    }

    // Todo registro nuevo nace con rol "user": el admin se promueve directo en la base.
    await users.updateOne({ email: testUser.email }, { $set: { role: testUser.role } });
  }
}

async function seedRecipes(): Promise<void> {
  const count = await Recipe.countDocuments();
  if (count > 0) {
    console.log(`[seed] ya hay ${count} recetas, no se cargan las de ejemplo`);
    return;
  }
  await Recipe.insertMany(sampleRecipes);
  console.log(`[seed] ${sampleRecipes.length} recetas de ejemplo cargadas`);
}

async function main(): Promise<void> {
  await connectMongoDB();
  await seedUsers();
  await seedRecipes();
  await disconnectMongoDB();
}

main().catch(async (error: unknown) => {
  console.error("[seed] error:", error);
  await disconnectMongoDB().catch(() => undefined);
  process.exit(1);
});
