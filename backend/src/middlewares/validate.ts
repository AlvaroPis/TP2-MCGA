// Middlewares genericos de validacion con Zod. Si falla responden 400 con el detalle por campo.
import type { NextFunction, Request, Response } from "express";
import { z, type ZodType } from "zod";

function badRequest(res: Response, error: z.ZodError): void {
  res.status(400).json({
    error: "Los datos enviados no son válidos",
    details: z.flattenError(error).fieldErrors,
  });
}

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      badRequest(res, result.error);
      return;
    }
    // Reemplaza el body por la version parseada (trim, defaults y tipos ya convertidos).
    req.body = result.data;
    next();
  };
}

// En Express 5 req.query es de solo lectura: el resultado parseado se guarda en res.locals.query.
export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      badRequest(res, result.error);
      return;
    }
    res.locals.query = result.data;
    next();
  };
}
