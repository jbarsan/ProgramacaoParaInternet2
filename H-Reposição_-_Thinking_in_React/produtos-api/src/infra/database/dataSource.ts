/**
 * Camada de Infraestrutura - Configuração do Banco de Dados (TypeORM + better-sqlite3)
 *
 * Configura o DataSource do TypeORM utilizando o driver `better-sqlite3`
 * e executa o seed inicial com os 6 produtos oficiais da documentação
 * "Thinking in React" (https://pt-br.react.dev/learn/thinking-in-react),
 * além de um usuário administrador padrão para facilitar testes da API e UI.
 */

import 'reflect-metadata';
import path from 'path';
import argon2 from 'argon2';
import { DataSource } from 'typeorm';
import { ProductEntity } from './entities/ProductEntity';
import { UserEntity } from './entities/UserEntity';

const databasePath =
  process.env.DATABASE_PATH || path.resolve(__dirname, '../../../database.sqlite');

/**
 * Instância principal do DataSource do TypeORM conectada ao arquivo SQLite via better-sqlite3.
 */
export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: databasePath,
  synchronize: true,
  logging: false,
  entities: [ProductEntity, UserEntity],
});

/**
 * Popula o banco de dados SQLite com os dados iniciais do guia "Thinking in React"
 * caso a tabela `products` esteja vazia, utilizando consultas parametrizadas.
 */
export async function initializeDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const productRepo = AppDataSource.getRepository(ProductEntity);
  const count = await productRepo.count();

  if (count === 0) {
    /**
     * Lista oficial de produtos da página:
     * https://pt-br.react.dev/learn/thinking-in-react
     */
    const initialProducts: Array<Pick<ProductEntity, 'category' | 'price' | 'is_stocked' | 'name' | 'photo_url'>> = [
      { category: 'Frutas', price: '$1', is_stocked: true, name: 'Maçã', photo_url: null },
      { category: 'Frutas', price: '$1', is_stocked: true, name: 'Pitaia', photo_url: null },
      { category: 'Frutas', price: '$2', is_stocked: false, name: 'Maracujá', photo_url: null },
      { category: 'Vegetais', price: '$2', is_stocked: true, name: 'Espinafre', photo_url: null },
      { category: 'Vegetais', price: '$4', is_stocked: false, name: 'Abóbora', photo_url: null },
      { category: 'Vegetais', price: '$1', is_stocked: true, name: 'Ervilhas', photo_url: null },
    ];

    for (const item of initialProducts) {
      const entity = productRepo.create(item);
      await productRepo.save(entity);
    }
  }

  // Cria também um usuário de demonstração caso não exista nenhum cadastrado
  const userRepo = AppDataSource.getRepository(UserEntity);
  const userCount = await userRepo.count();
  if (userCount === 0) {
    const defaultPasswordHash = await argon2.hash('Admin@123');
    const demoUser = userRepo.create({
      name: 'Administrador Demo',
      email: 'admin@produtos.dev',
      password_hash: defaultPasswordHash,
    });
    await userRepo.save(demoUser);
  }
}

