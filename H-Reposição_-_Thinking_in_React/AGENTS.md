# AGENTS.md — Guia Operacional para Agentes de IA (`produtos-web`)

> **Instrução ao Agente:** Leia este arquivo integralmente antes de executar qualquer tarefa. Cada regra aqui definida é mandatória. Em caso de dúvida ou necessidade de pacote fora da lista permitida, **pare e pergunte ao humano**.

---

## 1. Visão Geral do Projeto

Implementação full-stack baseada no guia oficial do React [**Thinking in React**](https://pt-br.react.dev/learn/thinking-in-react), dividida em dois módulos independentes na raiz do repositório:

- **`produtos-web/` (Frontend)**: Aplicação SPA construída com Vite, React 19, TypeScript (`strict`) e TailwindCSS v4.
- **`produtos-api/` (API REST)**: Servidor Express 5 em TypeScript (`strict`), estruturado com **Arquitetura Hexagonal (Ports & Adapters) + DDD**, persistência via TypeORM + SQLite (`better-sqlite3`), validação com Zod 4, upload seguro com Multer, autenticação com Argon2 + JWT e documentação OpenAPI/Swagger.

---

## 2. Ambiente e Comandos Rápidos

- **Gerenciador de versão Node.js**: Utilize `nvm` (Node.js **v24**, definido em `.nvmrc`).

```bash
# Backend (porta 3333)
cd produtos-api && nvm use && npm install
npm run dev      # Executa em modo watch com tsx
npm run build    # Compila TypeScript (tsc)

# Frontend (porta 5173)
cd produtos-web && nvm use && npm install
npm run dev      # Inicia servidor Vite
npm run build    # Valida tipos (tsc -b) e gera build de produção
```

---

## 3. Arquitetura do Backend e Regra da Dependência

O backend adota **Arquitetura Hexagonal (Ports & Adapters)** com modelagem tática de **DDD**.
**Regra de Ouro:** *As dependências apontam exclusivamente para dentro (em direção ao domínio).*

```text
produtos-api/src/
├── domain/        # Entidades, erros de negócio (HttpError) e interfaces (Portas).
├── services/      # Casos de uso e regras de aplicação.
├── infra/         # Adaptadores secundários: TypeORM, SQLite, Argon2, JWT.
└── web/           # Adaptadores primários: routes, controllers, middlewares, validation, docs.
```

### Restrições Estritas por Camada

1. **`src/domain/`**: **ZERO imports externos**. Contém apenas TypeScript puro (entidades, objetos de valor, `HttpError` e interfaces `I*Repository` / `I*Provider`). Precisa de recurso externo? Declare a interface em `domain/` e implemente-a em `infra/`.
2. **`src/services/`**: **ZERO imports de `express`, `infra/`, `routes/`, `controllers/` ou `middlewares/`**. Importa exclusivamente tipos, entidades, erros e portas de `src/domain/`.
3. **`src/infra/`**: Único local autorizado a importar `typeorm`, `better-sqlite3`, `argon2` e `jsonwebtoken`. Implementa as interfaces definidas em `src/domain/`.
4. **`src/web/routes/`**: Apenas declara rotas e encadeia middlewares (`authMiddleware`, `validate(schema)`, `uploadMiddleware`) aos métodos dos controllers.
5. **`src/web/controllers/`**: Traduz HTTP ↔ Domínio. Importa apenas `src/services/` (e erros de domínio). Nunca realiza validação de schema nem formata erros manualmente.
6. **`src/web/validation/`, `src/web/middlewares/`, `src/web/docs/`**: Utilitários de fronteira HTTP e documentação Swagger (`/api/docs`).

---

## 4. Convenções Inegociáveis de Código e API

- **Nomenclatura (`snake_case` vs `camelCase`)**:
  - O banco de dados SQLite utiliza exclusivamente `snake_case` (`is_stocked`, `photo_url`, `password_hash`, `created_at`, `updated_at`).
  - A API REST e o Domínio utilizam exclusivamente `camelCase` (`stocked`, `photoUrl`, `createdAt`, `updatedAt`).
  - A tradução ocorre dentro do repositório (`src/infra/repositories/`) — o formato interno do banco e o `password_hash` **nunca** vazam na resposta HTTP.
- **Contrato Único de Erros**:
  - Todo erro sai exclusivamente por `src/web/middlewares/errorHandler.ts` no formato:
    ```json
    {
      "error": {
        "message": "Descrição legível do erro",
        "statusCode": 400,
        "details": null
      }
    }
    ```
  - É proibido usar `res.status(...).json({ error })` manualmente dentro de controllers ou rotas.
- **Segurança em Consultas SQL**:
  - Toda query deve ser parametrizada (`?` ou parâmetros nomeados `:param` no TypeORM). Concatenação de strings em SQL é tratada como defeito grave.
- **Validação na Fronteira com Zod 4**:
  - Toda validação de `body`, `params` e `query` ocorre na definição da rota via middleware `validate(schema)` — jamais dentro do controller.
- **Maturidade REST (Nível 2 de Richardson)**:
  - Uso correto de substantivos no plural para recursos (`/api/products`, `/api/auth`), verbos HTTP semânticos (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) e códigos de status adequados (`200`, `201`, `204`, `400`, `401`, `404`, `409`, `500`).
- **Upload Seguro de Imagens (Multer)**:
  - Validar MIME type e extensão (`jpg`, `jpeg`, `png`, `webp`), limitar tamanho do arquivo (máx. 2 MB) e renomear arquivos com `crypto.randomUUID()`.
- **Autenticação**:
  - Senhas hasheadas com `argon2` (`argon2id`) e sessões stateless via `jsonwebtoken` (Bearer Token JWT).
- **Código Comentado em Português**:
  - Todo arquivo, classe e método relevante deve conter comentários explicativos claros em português.

---

## 5. Escopo Fechado de Bibliotecas (Allowlist)

**Não instale nenhum pacote fora da lista abaixo.** Caso julgue necessária qualquer outra biblioteca, pare a execução e pergunte ao humano.

- **Backend (`produtos-api/`)**:
  - Produção: `express`, `better-sqlite3`, `typeorm`, `reflect-metadata`, `zod`, `multer`, `argon2`, `jsonwebtoken`, `dotenv`, `cors`, `swagger-ui-express`.
  - Desenvolvimento: `typescript`, `tsx`, `@types/node`, `@types/express`, `@types/better-sqlite3`, `@types/multer`, `@types/jsonwebtoken`, `@types/cors`, `@types/swagger-ui-express`.
- **Frontend (`produtos-web/`)**:
  - Produção: `react`, `react-dom`.
  - Desenvolvimento: `vite`, `typescript`, `tailwindcss`, `@tailwindcss/vite`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`.

---

## 6. Requisitos de Domínio e Entregáveis

1. **Frontend (`produtos-web/`)**:
   - Implementar fielmente a hierarquia de componentes de *Thinking in React*: `FilterableProductTable` → `SearchBar` + `ProductTable` (`ProductCategoryRow` + `ProductRow`).
   - Integrar à API REST do backend para listagem, criação, edição, exclusão, upload de foto e login/cadastro JWT.
2. **Banco de Dados SQLite**:
   - Seguir o modelo de produtos de *Thinking in React* (`products`) acrescido da tabela de usuários (`users`) para autenticação, incluindo seed inicial com os 6 produtos da documentação oficial.
3. **Documentação (`IA.md` e Swagger)**:
   - Expor a documentação interativa OpenAPI 3.0 em `/api/docs`.
   - Registrar no arquivo `IA.md` (na raiz do projeto) a justificativa da escolha entre DDD/Hexagonal e todos os passos executados na implementação.

