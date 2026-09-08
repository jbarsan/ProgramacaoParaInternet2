import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { BadRequestError } from "../errors/HttpError";

export function validateSchema(schema: ZodSchema) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.body || typeof req.body !== "object") {
            throw new BadRequestError();
        }

        const result = schema.safeParse(req.body);

        if (!result.success) {
            const message = result.error.issues?.[0]?.message || "Requisição inválida";
            throw new BadRequestError(message, result.error.flatten().fieldErrors);
        }

        req.body = result.data;
        next();
    };
}