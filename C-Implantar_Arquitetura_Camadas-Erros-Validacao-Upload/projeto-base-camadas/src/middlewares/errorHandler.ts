/**
 * ============================================================
 * TODO 9 (Encontro 2) -- Middleware central de erro
 * ============================================================
 * So depois do TODO 8 (HttpError) estar pronto.
 *
 * Um unico middleware de 4 argumentos (err, req, res, next) que:
 *   - se err for HttpError -> res.status(err.statusCode).json({ error: {...} })
 *   - senao -> console.error(err) + res.status(500).json({ error: {...} })
 *
 * Registre em server.ts com app.use(errorHandler) -- DEPOIS de
 * todas as rotas (veja o TODO 9 la no final de server.ts).
 * ============================================================
 */

import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { HttpError } from "../errors/HttpError.ts";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({
            error: {
                message: err.message,
                statusCode: err.statusCode,
                details: err.details,
            },
        });
        return;
    }

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(413).json({
                error: {
                    message: "Arquivo excede o tamanho permitido",
                    statusCode: 413,
                },
            });
            return;
        }
        res.status(400).json({
            error: {
                message: err.message,
                statusCode: 400,
            },
        });
        return;
    }


    console.error(err);
    res.status(500).json({
        error: {
            message: "Erro interno do servidor",
            statusCode: 500,
        },
    });
}
