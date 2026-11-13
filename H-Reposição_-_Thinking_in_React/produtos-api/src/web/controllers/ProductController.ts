/**
 * Camada Web - ProductController
 *
 * Responsável exclusivamente por traduzir requisições HTTP em chamadas ao
 * `ProductService` e devolver respostas no Nível 2 de Maturidade de Richardson
 * (Recursos + Verbos HTTP + Status Codes adequados: 200, 201, 204).
 *
 * REGRA ARQUITETURAL:
 * - Importa apenas o `ProductService` (e `BadRequestError` do domínio para upload).
 * - Jamais monta respostas de erro manualmente; qualquer exceção é propagada
 *   ao `errorHandler.ts` (Express 5 captura erros assíncronos nativamente).
 */

import { Request, Response } from 'express';
import { BadRequestError } from '../../domain/errors/HttpError';
import { ProductService } from '../../services/ProductService';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * GET /api/products
   * Lista todos os produtos (com suporte a filtros de busca, estoque e categoria).
   * Status HTTP: 200 OK
   */
  public list = async (req: Request, res: Response): Promise<void> => {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const inStockOnly = req.query.inStockOnly === 'true' ? true : undefined;

    const products = await this.productService.listProducts({
      search,
      category,
      inStockOnly,
    });

    res.status(200).json(products);
  };

  /**
   * GET /api/products/:id
   * Busca um único produto pelo seu identificador numérico.
   * Status HTTP: 200 OK (ou 404 Not Found via errorHandler)
   */
  public getById = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const product = await this.productService.getProductById(id);
    res.status(200).json(product);
  };

  /**
   * POST /api/products
   * Cria um novo produto (corpo já validado na rota pelo middleware Zod).
   * Status HTTP: 201 Created
   */
  public create = async (req: Request, res: Response): Promise<void> => {
    const { name, category, price, stocked } = req.body;
    const created = await this.productService.createProduct({
      name,
      category,
      price,
      stocked,
    });

    res.status(201).json(created);
  };

  /**
   * PUT /api/products/:id e PATCH /api/products/:id
   * Atualiza os dados de um produto existente.
   * Status HTTP: 200 OK
   */
  public update = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { name, category, price, stocked } = req.body;

    const updated = await this.productService.updateProduct(id, {
      name,
      category,
      price,
      stocked,
    });

    res.status(200).json(updated);
  };

  /**
   * POST /api/products/:id/photo
   * Recebe o arquivo de imagem processado pelo Multer e atualiza o campo `photoUrl`.
   * Status HTTP: 200 OK
   */
  public uploadPhoto = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (!req.file) {
      throw new BadRequestError('Nenhum arquivo de imagem foi enviado no campo "photo".');
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    const updated = await this.productService.updateProductPhoto(id, photoUrl);

    res.status(200).json(updated);
  };

  /**
   * DELETE /api/products/:id
   * Remove um produto existente.
   * Status HTTP: 204 No Content (sem corpo na resposta, conforme Nível 2 de Richardson)
   */
  public remove = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    await this.productService.deleteProduct(id);
    res.status(204).send();
  };
}

