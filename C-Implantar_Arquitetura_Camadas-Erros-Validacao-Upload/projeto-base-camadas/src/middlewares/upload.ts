/**
 * ============================================================
 * TODO 12 (Encontro 2) -- Configuracao do multer
 * ============================================================
 * multer.diskStorage: destino "uploads/", nome de arquivo GERADO
 * pelo servidor (nunca o nome original do cliente -- e o que
 * previne path traversal).
 *
 * fileFilter: so aceitar image/jpeg e image/png.
 * limits.fileSize: 2 * 1024 * 1024 (2MB).
 *
 * export const uploadPhoto = multer({ storage, limits, fileFilter });
 * ============================================================
 */

import multer from "multer";
import path from "path";
import crypto from "crypto";
import { UnprocessableEntityError } from "../errors/HttpError.ts";

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`),
});

const ALLOWED = ["image/jpeg", "image/png"];

export const uploadPhoto = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED.includes(file.mimetype)) {
            return cb(new UnprocessableEntityError("Formato de arquivo invalido. Apenas JPEG e PNG sao permitidos."));
        }
        cb(null, true);
    },
});