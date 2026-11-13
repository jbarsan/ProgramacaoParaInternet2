/**
 * Camada Web - Documentação OpenAPI 3.0 / Swagger (`swagger.ts`)
 *
 * Especifica todos os recursos, verbos HTTP, códigos de status (Nível 2 de Richardson),
 * autenticação Bearer JWT, upload multipart/form-data com Multer e o contrato de erro
 * padronizado `{ error: { message, statusCode, details } }`.
 */

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'API Produtos Web — Thinking in React',
    version: '1.0.0',
    description:
      'API RESTful construída com Node 24, Express 5, TypeScript (strict), Arquitetura Hexagonal + DDD, TypeORM + better-sqlite3, Zod 4, Multer e Autenticação Argon2 + JWT.',
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Servidor Local de Desenvolvimento',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Informe o token JWT obtido em /api/auth/login ou /api/auth/register',
      },
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Maçã' },
          category: { type: 'string', example: 'Frutas' },
          price: { type: 'string', example: '$1' },
          stocked: { type: 'boolean', example: true },
          photoUrl: {
            type: 'string',
            nullable: true,
            example: '/uploads/a1b2c3d4.png',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateProductInput: {
        type: 'object',
        required: ['name', 'category', 'price', 'stocked'],
        properties: {
          name: { type: 'string', example: 'Manga' },
          category: { type: 'string', example: 'Frutas' },
          price: { type: 'string', example: '$3' },
          stocked: { type: 'boolean', example: true },
        },
      },
      UpdateProductInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Manga Palmer' },
          category: { type: 'string', example: 'Frutas' },
          price: { type: 'string', example: '$4' },
          stocked: { type: 'boolean', example: false },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Administrador Demo' },
          email: { type: 'string', example: 'admin@produtos.dev' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Erro de validação nos dados enviados.' },
              statusCode: { type: 'integer', example: 400 },
              details: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastra um novo usuário com senha Argon2 e retorna token JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'João Carlos' },
                  email: { type: 'string', example: 'joao@ifpi.edu.br' },
                  password: { type: 'string', example: 'Senha@123' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Usuário criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': {
            description: 'Erro de validação Zod',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'E-mail já cadastrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autentica um usuário (Demo: admin@produtos.dev / Admin@123)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@produtos.dev' },
                  password: { type: 'string', example: 'Admin@123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Autenticação realizada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Autenticação'],
        summary: 'Retorna o perfil do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Perfil do usuário autenticado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Token ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Produtos'],
        summary: 'Lista todos os produtos (com filtros de busca, estoque e categoria)',
        parameters: [
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filtra produtos pelo nome (case-insensitive)',
          },
          {
            name: 'inStockOnly',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['true', 'false'] },
            description: 'Se "true", retorna apenas produtos em estoque',
          },
          {
            name: 'category',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filtra por categoria (ex.: Frutas, Vegetais)',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de produtos em camelCase',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Product' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Produtos'],
        summary: 'Cria um novo produto (Requer autenticação JWT)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProductInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Produto criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '400': { description: 'Erro de validação Zod' },
          '401': { description: 'Não autenticado' },
          '409': { description: 'Produto com mesmo nome já existente' },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Produtos'],
        summary: 'Busca um produto pelo ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Produto encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '404': { description: 'Produto não encontrado' },
        },
      },
      put: {
        tags: ['Produtos'],
        summary: 'Atualiza um produto pelo ID (Requer autenticação JWT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProductInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Produto atualizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '404': { description: 'Produto não encontrado' },
        },
      },
      delete: {
        tags: ['Produtos'],
        summary: 'Remove um produto pelo ID (Requer autenticação JWT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '204': { description: 'Produto removido com sucesso (Sem conteúdo)' },
          '404': { description: 'Produto não encontrado' },
        },
      },
    },
    '/api/products/{id}/photo': {
      post: {
        tags: ['Produtos'],
        summary: 'Faz upload seguro da foto do produto via Multer (JPG, PNG, WEBP até 2MB)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['photo'],
                properties: {
                  photo: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Foto vinculada ao produto com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '400': { description: 'Arquivo inválido ou acima de 2MB' },
          '404': { description: 'Produto não encontrado' },
        },
      },
    },
  },
};

