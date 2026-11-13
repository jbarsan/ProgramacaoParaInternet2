/**
 * Camada Web - Middleware de Autenticação JWT (`authMiddleware.ts`)
 *
 * Intercepta requisições às rotas protegidas, extrai o token Bearer do cabeçalho
 * `Authorization`, valida-o por meio da porta `ITokenProvider` e anexa os dados
 * do usuário autenticado ao objeto `req.user`.
 */

import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../domain/errors/HttpError';
import { ITokenProvider, TokenPayload } from '../../domain/providers/ITokenProvider';

/**
 * Estende a tipagem do Request do Express para incluir o usuário autenticado.
 */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function createAuthMiddleware(tokenProvider: ITokenProvider) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Cabeçalho Authorization não informado.');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
      throw new UnauthorizedError('Formato de token inválido. Use: Bearer <token>.');
    }

    const payload = tokenProvider.verify(parts[1]);
    req.user = payload;
    next();
  };
}

