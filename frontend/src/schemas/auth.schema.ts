import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Ingresá un email válido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(60),
    email: z.email("Ingresá un email válido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
