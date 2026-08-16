import type { Context } from 'hono';
import type { ZodSchema } from 'zod';
import { badRequest } from './http-error';

export async function parseJsonBody<T>(c: Context, schema: ZodSchema<T>): Promise<T> {
  let json: unknown;
  try {
    json = await c.req.json();
  } catch {
    throw badRequest('Cuerpo de la petición inválido');
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    throw badRequest(result.error.issues[0]?.message ?? 'Datos inválidos');
  }
  return result.data;
}
