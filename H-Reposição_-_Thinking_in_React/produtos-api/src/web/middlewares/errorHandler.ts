/**
 * Camada Web - Middleware Central de Tratamento de Erros (`errorHandler.ts`)
 *
 * REGRA OBRIGATÓRIA (AGENTS.md):
 * - Todo erro da aplicação sai exclusivamente por este middleware no contrato:
 *   `{ error: { message, statusCode, details } }`
 * - Nenhum `res.status().json({ error })` manual é feito fora daqui.
 * - Compatível com o tratamento nativo de Promises rejeitadas do Express 5.
 */

import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { HttpError } from '../../domain/errors/HttpError';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // 1. Erros de domínio/HTTP conhecidos (HttpError e subclasses)
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
        details: err.details ?? null,
      },
    });
    return;
  }

  // 2. Erros de upload originados pelo Multer (ex.: arquivo maior que o limite)
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'O arquivo enviado excede o tamanho máximo permitido de 2MB.'
        : `Erro no upload do arquivo: ${err.message}`;

    res.status(400).json({
      error: {
        message,
        statusCode: 400,
        details: { code: err.code, field: err.field ?? null },
      },
    });
    return;
  }

  // 3. Erro de JSON malformado no corpo da requisição
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: {
        message: 'O corpo da requisição contém um JSON inválido.',
        statusCode: 400,
        details: null,
      },
    });
    return;
  }

  // 4. Erros inesperados (500 Internal Server Error)
  console.error('[ErrorHandler] Erro interno não tratado:', err);
  res.status(500).json({
    error: {
      message: 'Erro interno do servidor.',
      statusCode: 500,
      details: null,
    },
  });
}

