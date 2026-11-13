/**
 * Camada Web - Schemas de Validação de Produtos (Zod 4)
 *
 * Define os contratos de entrada da fronteira HTTP para criação, atualização
 * e filtragem de produtos. Aplicados exclusivamente nas rotas via middleware `validate()`.
 */

import { z } from 'zod';

/**
 * Schema para criação de produto (POST /api/products)
 */
export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ error: 'O nome do produto é obrigatório.' })
      .trim()
      .min(2, 'O nome do produto deve ter pelo menos 2 caracteres.')
      .max(120, 'O nome do produto deve ter no máximo 120 caracteres.'),
    category: z
      .string({ error: 'A categoria do produto é obrigatória.' })
      .trim()
      .min(2, 'A categoria deve ter pelo menos 2 caracteres.')
      .max(80, 'A categoria deve ter no máximo 80 caracteres.'),
    price: z
      .string({ error: 'O preço do produto é obrigatório.' })
      .trim()
      .regex(
        /^(R?\$?\s?\d+([.,]\d{1,2})?)$/,
        'O preço deve estar em formato válido (ex.: "$1", "$2", "4" ou "R$ 10,00").',
      ),
    stocked: z.boolean({
      error: 'O campo stocked deve ser um booleano (true ou false).',
    }),
  }),
});

/**
 * Schema para atualização de produto (PUT /api/products/:id ou PATCH /api/products/:id)
 */
export const updateProductSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'O parâmetro ID deve ser um número inteiro positivo.'),
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, 'O nome do produto deve ter pelo menos 2 caracteres.')
        .max(120, 'O nome do produto deve ter no máximo 120 caracteres.')
        .optional(),
      category: z
        .string()
        .trim()
        .min(2, 'A categoria deve ter pelo menos 2 caracteres.')
        .max(80, 'A categoria deve ter no máximo 80 caracteres.')
        .optional(),
      price: z
        .string()
        .trim()
        .regex(
          /^(R?\$?\s?\d+([.,]\d{1,2})?)$/,
          'O preço deve estar em formato válido (ex.: "$1", "$2", "4" ou "R$ 10,00").',
        )
        .optional(),
      stocked: z
        .boolean({
          error: 'O campo stocked deve ser um booleano (true ou false).',
        })
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Informe ao menos um campo para atualização.',
    }),
});

/**
 * Schema para validação de parâmetro `:id` em rotas GET/DELETE/POST photo
 */
export const productIdParamSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'O parâmetro ID deve ser um número inteiro positivo.'),
  }),
});

/**
 * Schema para validação de filtros de busca na query string (GET /api/products)
 */
export const listProductsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    inStockOnly: z
      .enum(['true', 'false'], {
        error: 'inStockOnly deve ser "true" ou "false".',
      })
      .optional(),
    category: z.string().optional(),
  }),
});
