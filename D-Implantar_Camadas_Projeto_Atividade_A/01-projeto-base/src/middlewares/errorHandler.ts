import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/HttpError";
import multer from 'multer';

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({
            error: err.message,
            statusCode: err.statusCode,
            details: err.details,
        });
        return;
    }

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(413).json({
                error: {
                    message: "Arquivo excede o tamanho máximo permitido",
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