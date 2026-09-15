import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/HttpError";
import type { ZodSchema } from "zod";

export function validateSchema(schema: ZodSchema) {
    return (request: Request, response: Response, next: NextFunction) => {
        if (!request.body || typeof request.body != "object") {
            throw new BadRequestError();
        }

        const result = schema.safeParse(request.body);

        if (!result.success) {
            const message = result.error.issues?.[0]?.message || "Requisição inválida";
            throw new BadRequestError(message, result.error.flatten().fieldErrors);
        }

        request.body = result.data;
        next();
    }
}
