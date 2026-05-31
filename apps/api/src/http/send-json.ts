import type { Response } from 'express';
import type { z } from 'zod';

export function sendJson<TSchema extends z.ZodType>(
  response: Response,
  schema: TSchema,
  payload: z.input<TSchema>,
) {
  return response.json(schema.parse(payload));
}
