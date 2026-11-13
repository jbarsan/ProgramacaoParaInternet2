/**
 * Composição da Aplicação Express 5 (`app.ts` - Composition Root)
 *
 * Ponto onde as camadas da Arquitetura Hexagonal são conectadas por Injeção de Dependência:
 * - Adaptadores de Infraestrutura (`TypeOrmProductRepository`, `TypeOrmUserRepository`,
 *   `Argon2HashProvider`, `JwtTokenProvider`) são injetados nos Serviços (`ProductService`,
 *   `AuthService`).
 * - Os Serviços são injetados nos Controllers (`ProductController`, `AuthController`).
 * - Os Controllers e Middlewares são registrados nas Rotas (`productRoutes`, `authRoutes`).
 * - Todo erro converge para o `errorHandler` central.
 */

import path from 'path';
import cors from 'cors';
import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { NotFoundError } from './domain/errors/HttpError';
import { Argon2HashProvider } from './infra/providers/Argon2HashProvider';
import { JwtTokenProvider } from './infra/providers/JwtTokenProvider';
import { TypeOrmProductRepository } from './infra/repositories/TypeOrmProductRepository';
import { TypeOrmUserRepository } from './infra/repositories/TypeOrmUserRepository';
import { AuthService } from './services/AuthService';
import { ProductService } from './services/ProductService';
import { AuthController } from './web/controllers/AuthController';
import { ProductController } from './web/controllers/ProductController';
import { swaggerSpec } from './web/docs/swagger';
import { createAuthMiddleware } from './web/middlewares/authMiddleware';
import { errorHandler } from './web/middlewares/errorHandler';
import { createAuthRoutes } from './web/routes/authRoutes';
import { createProductRoutes } from './web/routes/productRoutes';

export function createApp(): Express {
  const app = express();

  // Middlewares globais de infraestrutura HTTP
  app.use(cors());
  app.use(express.json());

  // Servir arquivos estáticos de fotos de produtos enviadas via Multer
  const uploadsDir =
    process.env.UPLOADS_DIR || path.resolve(__dirname, '../uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Documentação interativa Swagger UI e JSON OpenAPI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (_req, res) => {
    res.status(200).json(swaggerSpec);
  });

  // Rota de verificação de saúde (Health Check)
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Instanciação dos Adaptadores Secundários (Driven Adapters - Infraestrutura)
  const productRepository = new TypeOrmProductRepository();
  const userRepository = new TypeOrmUserRepository();
  const hashProvider = new Argon2HashProvider();
  const tokenProvider = new JwtTokenProvider();

  // Instanciação da Camada de Aplicação (Services)
  const productService = new ProductService(productRepository);
  const authService = new AuthService(userRepository, hashProvider, tokenProvider);

  // Instanciação dos Adaptadores Primários (Driving Adapters - Web Controllers & Middlewares)
  const productController = new ProductController(productService);
  const authController = new AuthController(authService);
  const authMiddleware = createAuthMiddleware(tokenProvider);

  // Registro das rotas RESTful (Nível 2 de Maturidade de Richardson)
  app.use('/api/auth', createAuthRoutes(authController, authMiddleware));
  app.use('/api/products', createProductRoutes(productController, authMiddleware));

  // Tratamento de rotas inexistentes encaminhando para o errorHandler central
  app.use((req, _res, next) => {
    next(new NotFoundError(`Rota ${req.method} ${req.originalUrl} não encontrada.`));
  });

  // Middleware centralizador de erros no contrato { error: { message, statusCode, details } }
  app.use(errorHandler);

  return app;
}

