import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/HttpError";

export function errorHandler(
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction
): void {
    if (error instanceof HttpError) {
        response.status(error.statusCode).json({
            error: error.message,
            statusCode: error.statusCode,
            details: error.details
        });
        return;
    }

    console.error(error);
    response.status(500).json({
        error: "Erro interno do servidor.",
        statusCode: 500
    });
}