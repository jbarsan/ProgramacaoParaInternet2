# IA.md — Registro Completo de Arquitetura e Passos Executados

Este documento descreve todas as decisões arquiteturais e todos os passos executados para a construção completa do projeto **produtos-web** (Frontend React + Vite + TypeScript + TailwindCSS) e seu **backend** (Node.js 24 + Express 5 + TypeScript strict + TypeORM + better-sqlite3 + Zod 4 + Multer + Argon2 + JWT + Swagger), conforme especificado no arquivo `AGENTS.md`.

---

## 1. Escolha Arquitetural: Arquitetura Hexagonal (Ports & Adapters) combinada com táticas de DDD

### Por que escolhemos a Arquitetura Hexagonal (Ports & Adapters) com núcleo DDD?

Optamos pela **Arquitetura Hexagonal (Ports & Adapters)** aliada à modelagem tática de **Domain-Driven Design (DDD)** no núcleo (`src/domain/`) pelos seguintes motivos:

1. **Alinhamento Exato com a Regra da Dependência (`AGENTS.md`)**:
   O layout exigido (`src/domain/`, `src/services/`, `src/infra/`, `src/web/`) e a regra *"Dependências apontam para dentro. Precisa de algo externo no domínio? Declare interface em `domain/` e implemente em `infra/`"* descrevem literalmente o padrão **Ports & Adapters (Hexagonal)** proposto por Alistair Cockburn:
   - **Domínio (`src/domain/`)**: Contém as entidades ricas (`Product`, `User`), erros de negócio (`HttpError` e subclasses) e as **Portas de Saída (Driven Ports)**: `IProductRepository`, `IUserRepository`, `IHashProvider` e `ITokenProvider`. Possui **zero imports externos** (não conhece Express, TypeORM, SQLite, Zod, Argon2 ou JWT).
   - **Aplicação / Serviços (`src/services/`)**: Contém os casos de uso (`ProductService`, `AuthService`). Depende **exclusivamente** de `src/domain/` (**zero imports de Express, rotas, controllers, middlewares ou bibliotecas de infraestrutura**).
   - **Infraestrutura (`src/infra/`)**: Contém os **Adaptadores Secundários (Driven Adapters)** que implementam as portas declaradas no domínio:
     - `TypeOrmProductRepository` e `TypeOrmUserRepository` (implementando `IProductRepository` e `IUserRepository` sobre o `TypeORM` + `better-sqlite3`).
     - `Argon2HashProvider` (implementando `IHashProvider` com `argon2`).
     - `JwtTokenProvider` (implementando `ITokenProvider` com `jsonwebtoken`).
   - **Interface Web (`src/web/`)**: Contém os **Adaptadores Primários (Driving Adapters)** que recebem estímulos HTTP externos:
     - `routes/` (`productRoutes.ts`, `authRoutes.ts`) — apenas roteiam e aplicam o middleware `validate(schema)` do Zod 4 e o `authMiddleware`.
     - `controllers/` (`ProductController.ts`, `AuthController.ts`) — traduzem HTTP ↔ Domínio invocando apenas os `services/`.
     - `middlewares/` (`errorHandler.ts`, `authMiddleware.ts`, `uploadMiddleware.ts`).
     - `validation/` (`productSchemas.ts`, `authSchemas.ts`, `validate.ts`).
     - `docs/` (`swagger.ts` — especificação OpenAPI 3.0).

2. **Isolamento Total entre `snake_case` (Banco) e `camelCase` (API)**:
   Na Arquitetura Hexagonal, o adaptador de persistência (`TypeOrmProductRepository` e `TypeOrmUserRepository`) atua como um **Anticorruption Layer (ACL)** / tradutor:
   - O banco SQLite armazena colunas em `snake_case` (`is_stocked`, `photo_url`, `password_hash`, `created_at`, `updated_at`).
   - O repositório converte esses registros para as entidades de domínio em `camelCase` (`stocked`, `photoUrl`, `createdAt`, `updatedAt`) e omite dados sensíveis (`passwordHash` nunca sai em `User.toPublic()`).

3. **Testabilidade e Substituibilidade**:
   Como `ProductService` e `AuthService` dependem apenas de interfaces TypeScript puras (`IProductRepository`, `IUserRepository`, `IHashProvider`, `ITokenProvider`), é possível trocar o ORM, o banco de dados ou o provedor de criptografia sem alterar uma única linha das regras de negócio.

---

## 2. Passo a Passo do Que Foi Realizado

### Passo 1 — Configuração de Ambiente Node.js 24 (`.nvmrc`)
- Verificada a versão do Node.js gerenciada via `nvm` (`v24.22.1`).
- Criados arquivos `.nvmrc` definindo a versão `24` na raiz do projeto, em `produtos-api/.nvmrc` e em `produtos-web/.nvmrc`.

### Passo 2 — Estruturação do Backend (`produtos-api/`)
- Criado o pacote `produtos-api/package.json` e `produtos-api/tsconfig.json` com `strict: true`, `experimentalDecorators: true` e `emitDecoratorMetadata: true`.
- Criados os arquivos de variáveis de ambiente `produtos-api/.env` e `produtos-api/.env.example`, além de `produtos-api/Dockerfile` e `produtos-api/.dockerignore` para deploy em containers (Render).

### Passo 3 — Implementação da Camada de Domínio (`produtos-api/src/domain/`)
- **`src/domain/entities/Product.ts`**: Entidade `Product` seguindo o modelo de dados da documentação *Thinking in React* (`id`, `name`, `category`, `price`, `stocked`, `photoUrl`, `createdAt`, `updatedAt`) com serialização `camelCase`.
- **`src/domain/entities/User.ts`**: Entidade `User` e método `toPublic()` que garante que `passwordHash` jamais vaze na resposta da API.
- **`src/domain/errors/HttpError.ts`**: Hierarquia de erros (`HttpError`, `BadRequestError`, `UnauthorizedError`, `NotFoundError`, `ConflictError`, `UnprocessableEntityError`).
- **`src/domain/repositories/IProductRepository.ts` e `IUserRepository.ts`**: Interfaces (portas) para persistência de dados.
- **`src/domain/providers/IHashProvider.ts` e `ITokenProvider.ts`**: Interfaces (portas) para hash de senha e token JWT.

### Passo 4 — Implementação da Camada de Serviços (`produtos-api/src/services/`)
- **`src/services/ProductService.ts`**: Casos de uso de listagem com filtros (`search`, `inStockOnly`, `category`), busca por ID, criação com verificação de duplicidade, atualização cadastral, vínculo de foto enviada pelo Multer e remoção. Zero imports externos.
- **`src/services/AuthService.ts`**: Casos de uso de registro de usuário (gerando hash Argon2), login (verificando hash Argon2 e emitindo token JWT) e consulta de perfil (`/me`). Zero imports externos.

### Passo 5 — Implementação da Camada de Infraestrutura (`produtos-api/src/infra/`)
- **`src/infra/database/entities/ProductEntity.ts` e `UserEntity.ts`**: Entidades do TypeORM mapeadas para as tabelas `products` e `users` no SQLite com colunas em `snake_case` (`is_stocked`, `photo_url`, `password_hash`, `created_at`, `updated_at`).
- **`src/infra/database/dataSource.ts`**: Configuração do `AppDataSource` do TypeORM com driver `better-sqlite3` e função `initializeDatabase()` que popula automaticamente os 6 produtos canônicos da página *Thinking in React* (`Maçã`, `Fruta do dragão`, `Maracujá`, `Espinafre`, `Abóbora`, `Ervilhas`) e o usuário de demonstração (`admin@produtos.dev` / `Admin@123`).
- **`src/infra/repositories/TypeOrmProductRepository.ts` e `TypeOrmUserRepository.ts`**: Implementação das portas de repositório usando `QueryBuilder` parametrizado (prevenindo SQL Injection) e traduzindo `snake_case` ↔ `camelCase`.
- **`src/infra/providers/Argon2HashProvider.ts` e `JwtTokenProvider.ts`**: Implementações concretas de hash (`argon2id`) e token (`jsonwebtoken`).

### Passo 6 — Implementação da Camada Web (`produtos-api/src/web/`)
- **Validação na Fronteira com Zod 4 (`src/web/validation/`)**:
  - `productSchemas.ts` e `authSchemas.ts` definem os contratos de entrada.
  - `validate.ts` valida `body`, `params` e `query` diretamente nas rotas antes de chegar ao controller.
- **Middlewares (`src/web/middlewares/`)**:
  - `errorHandler.ts`: Único ponto de saída de erros da API, respondendo sempre no contrato `{ error: { message, statusCode, details } }`.
  - `authMiddleware.ts`: Protege rotas de escrita exigindo token Bearer JWT válido.
  - `uploadMiddleware.ts`: Configura o `Multer` com regras seguras (validação de MIME type e extensão para JPG/PNG/WEBP, limite de 2MB e geração de nome seguro com `crypto.randomUUID()`).
- **Controllers e Rotas Nível 2 de Maturidade de Richardson (`src/web/controllers/` e `src/web/routes/`)**:
  - Recursos bem definidos (`/api/auth`, `/api/products`), verbos HTTP semânticos (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) e códigos de status corretos (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `409 Conflict`).
- **Documentação Swagger (`src/web/docs/swagger.ts`)**:
  - Especificação OpenAPI 3.0 servida em `GET /api/docs` (Swagger UI) e `GET /api/docs.json`.

### Passo 7 — Implementação do Frontend React (`produtos-web/`)
- Criado o projeto `produtos-web` com **Vite**, **React 19**, **TypeScript strict** e **TailwindCSS v4**.
- Implementada toda a hierarquia de componentes descrita em [Thinking in React](https://pt-br.react.dev/learn/thinking-in-react), com código 100% comentado em português:
  1. `FilterableProductTable` (`src/components/FilterableProductTable.tsx`): Componente pai que concentra os estados mínimos `filterText` e `inStockOnly`, além da sincronização com a API REST e controle de sessão JWT.
  2. `SearchBar` (`src/components/SearchBar.tsx`): Barra de busca e filtro de estoque com fluxo de dados inverso (`onFilterTextChange` e `onInStockOnlyChange`).
  3. `ProductTable` (`src/components/ProductTable.tsx`): Filtra os produtos de forma derivada (sem duplicar estado) e agrupa por categoria.
  4. `ProductCategoryRow` (`src/components/ProductCategoryRow.tsx`): Linha de cabeçalho para cada categoria (`Frutas`, `Vegetais`).
  5. `ProductRow` (`src/components/ProductRow.tsx`): Linha de produto que destaca em vermelho (`text-rose-600`) os itens sem estoque (`!product.stocked`), exibe a miniatura da foto enviada via Multer e oferece botões de edição/exclusão para usuários autenticados.
- Criados os modais `AuthModal.tsx` (login/cadastro JWT) e `ProductFormModal.tsx` (criação/edição de produto + upload de foto `multipart/form-data`).

---

## 3. Como Executar o Projeto

### Backend (`http://localhost:3333`)
```bash
cd produtos-api
nvm use
npm install
npm run dev
```
- **API Base**: `http://localhost:3333/api/products`
- **Documentação Swagger UI**: `http://localhost:3333/api/docs`
- **Credenciais Demo**: `admin@produtos.dev` / `Admin@123`

### Frontend (`http://localhost:5173`)
```bash
cd produtos-web
nvm use
npm install
npm run dev
```

