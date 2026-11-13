/**
 * Camada Web - Rotas de Produtos (`productRoutes.ts`)
 *
 * REGRA ARQUITETURAL (AGENTS.md):
 * - Rotas apenas roteiam → importam exclusivamente controllers, middlewares e schemas de validação.
 * - Validação de corpo/params/query: Zod via `validate(schema)` na rota — nunca dentro do controller.
 */

import { RequestHandler, Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { uploadProductPhoto } from '../middlewares/uploadMiddleware';
import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
  updateProductSchema,
} from '../validation/productSchemas';
import { validate } from '../validation/validate';

export function createProductRoutes(
  productController: ProductController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  // Rotas públicas de leitura (Nível 2 de Maturidade de Richardson)
  router.get('/', validate(listProductsQuerySchema), productController.list);
  router.get('/:id', validate(productIdParamSchema), productController.getById);

  // Rotas protegidas por autenticação JWT para mutação de recursos
  router.post(
    '/',
    authMiddleware,
    validate(createProductSchema),
    productController.create,
  );

  router.put(
    '/:id',
    authMiddleware,
    validate(updateProductSchema),
    productController.update,
  );

  router.patch(
    '/:id',
    authMiddleware,
    validate(updateProductSchema),
    productController.update,
  );

  router.post(
    '/:id/photo',
    authMiddleware,
    validate(productIdParamSchema),
    uploadProductPhoto.single('photo'),
    productController.uploadPhoto,
  );

  router.delete(
    '/:id',
    authMiddleware,
    validate(productIdParamSchema),
    productController.remove,
  );

  return router;
}

