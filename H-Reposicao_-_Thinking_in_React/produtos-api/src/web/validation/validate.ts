/**
 * Camada Web - Middleware de Validação com Zod 4 (`validate`)
 *
 * Executa a validação de `body`, `params` e `query` na rota (fronteira da API),
 * nunca dentro do controller. Caso a validação falhe, envia um `BadRequestError`
 * (HTTP 400) que é capturado pelo `errorHandler.ts` no contrato padronizado:
 * `{ error: { message, statusCode, details } }`.
 */

import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodType } from 'zod';
import { BadRequestError } from '../../domain/errors/HttpError';

interface ValidatedRequestShape {
  body?: unknown;
  params?: unknown;
  query?: unknown;
}

export function validate(schema: ZodType<ValidatedRequestShape>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formattedDetails = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        next(new BadRequestError('Erro de validação nos dados enviados.', formattedDetails));
        return;
      }
      next(err);
    }
  };
}
