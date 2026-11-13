/**
 * Camada Web - Middleware de Upload Seguro de Fotos (`uploadMiddleware.ts`)
 *
 * Configura o Multer aplicando boas práticas de segurança (OWASP):
 * 1. Validação estrita de MIME type (`image/jpeg`, `image/png`, `image/webp`)
 *    e de extensão do arquivo (`.jpg`, `.jpeg`, `.png`, `.webp`).
 * 2. Geração de nome único aleatório (`crypto.randomUUID()`) descartando o nome
 *    original do cliente para impedir ataques de Path Traversal ou sobrescrita.
 * 3. Limite estrito de tamanho (máximo de 2 MB por foto) e apenas 1 arquivo por vez.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { BadRequestError } from '../../domain/errors/HttpError';

const uploadsDir =
  process.env.UPLOADS_DIR || path.resolve(__dirname, '../../../uploads');

// Garante que o diretório de uploads exista na inicialização
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeExt = ALLOWED_MIME_TYPES[file.mimetype] || '.jpg';
    const uniqueName = `${crypto.randomUUID()}${safeExt}`;
    cb(null, uniqueName);
  },
});

export const uploadProductPhoto = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Máximo de 2 MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeAllowed = Boolean(ALLOWED_MIME_TYPES[file.mimetype]);
    const isExtAllowed = ALLOWED_EXTENSIONS.has(ext);

    if (!isMimeAllowed || !isExtAllowed) {
      cb(
        new BadRequestError(
          'Formato de imagem não permitido. Envie apenas arquivos JPG, PNG ou WEBP.',
        ),
      );
      return;
    }

    cb(null, true);
  },
});

