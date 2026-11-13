/**
 * Ponto de Entrada do Servidor Backend (`server.ts`)
 *
 * Carrega variáveis de ambiente com `dotenv`, inicializa a conexão do TypeORM
 * com o banco SQLite (`better-sqlite3`), executa o seed inicial ("Thinking in React")
 * e inicia o servidor HTTP Express 5.
 */

import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

import { createApp } from './app';
import { initializeDatabase } from './infra/database/dataSource';

const PORT = Number(process.env.PORT) || 3333;

async function bootstrap(): Promise<void> {
  try {
    await initializeDatabase();
    console.log('[Banco de Dados] SQLite + TypeORM inicializado e populado com sucesso.');

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`[Servidor] API rodando em http://localhost:${PORT}`);
      console.log(`[Swagger] Documentação disponível em http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error('[Erro Fatal] Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

void bootstrap();

