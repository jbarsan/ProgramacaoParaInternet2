/**
 * Instância singleton do PrismaClient para a camada de repositórios.
 * Conforme as regras de arquitetura (.dependency-cruiser.cjs),
 * apenas a camada de repositórios tem permissão para importar @prisma.
 */
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
