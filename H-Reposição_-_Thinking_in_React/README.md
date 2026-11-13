# Produtos Web & API — Thinking in React

- **Curso:** Tecnologia em Análise e Desenvolvimento de Sistemas (TADS)
- **Disciplina:** Programação para Internet II
- **Professor:** Rogério Silva
- **Aluno:** João Carlos B. Santos
- **Atividade:** H - Reposição - Thinking in React
- **Data de Entrega:** 14/11/2026

---

## 1. Sobre o Projeto

Este projeto é uma aplicação full-stack desenvolvida a partir do guia oficial da documentação do React [**Thinking in React**](https://pt-br.react.dev/learn/thinking-in-react), expandida com uma API RESTful completa e segura.

O repositório está organizado em dois módulos principais na raiz:

1. **`produtos-web/` (Frontend Web)**:
   - Construído com **Vite**, **React 19**, **TypeScript (`strict`)** e **TailwindCSS v4**.
   - Implementa a hierarquia de componentes do guia *Thinking in React*:
     - `FilterableProductTable`: Componente raiz que gerencia o estado mínimo (`filterText` e `inStockOnly`), sincroniza os dados com a API REST e controla a sessão autenticada (JWT).
     - `SearchBar`: Barra de busca por texto e filtro de produtos em estoque utilizando *fluxo de dados inverso*.
     - `ProductTable`: Filtra e agrupa os produtos por categoria de forma derivada durante a renderização.
     - `ProductCategoryRow`: Exibe o cabeçalho de cada categoria (`Frutas`, `Vegetais`, etc.).
     - `ProductRow`: Exibe cada produto (destacando em vermelho os itens sem estoque), a miniatura da foto enviada e as ações de edição/exclusão para usuários autenticados.
   - Possui modais integrados para **Autenticação JWT** (`AuthModal`) e **Cadastro/Edição de Produtos com Upload de Foto** (`ProductFormModal`).

2. **`produtos-api/` (Backend REST API)**:
   - Construído com **Node.js 24**, **Express 5** e **TypeScript (`strict`)**.
   - Estruturado com **Arquitetura Hexagonal (Ports & Adapters)** aliada a **Domain-Driven Design (DDD)**:
     - `src/domain/`: Entidades (`Product`, `User`), erros (`HttpError`) e portas (`IProductRepository`, `IUserRepository`, `IHashProvider`, `ITokenProvider`) com **zero imports externos**.
     - `src/services/`: Casos de uso (`ProductService`, `AuthService`) desacoplados de infraestrutura e HTTP.
     - `src/infra/`: Repositórios TypeORM + SQLite (`better-sqlite3`) com consultas parametrizadas e tradução automática entre `snake_case` (banco) e `camelCase` (API), além dos provedores `Argon2` e `JWT`.
     - `src/web/`: Rotas, controllers no **Nível 2 de Maturidade de Richardson**, validação de fronteira com **Zod 4**, upload seguro de imagens com **Multer**, middleware central de erros (`errorHandler.ts`) e documentação **Swagger (OpenAPI 3.0)**.

---

## 2. Estrutura de Diretórios

```text
.
├── produtos-api/              # Backend REST API (Express 5 + TypeORM + SQLite)
│   ├── src/
│   │   ├── domain/            # Entidades, erros e interfaces (Portas)
│   │   ├── services/          # Regras de aplicação / Casos de uso
│   │   ├── infra/             # TypeORM, SQLite (better-sqlite3), Argon2, JWT
│   │   ├── web/               # Routes, Controllers, Middlewares, Zod, Swagger
│   │   ├── app.ts             # Composição da aplicação Express
│   │   └── server.ts          # Ponto de entrada HTTP
│   ├── Dockerfile             # Containerização para deploy (ex.: Render)
│   └── package.json
├── produtos-web/              # Frontend SPA (React 19 + Vite + TailwindCSS v4)
│   ├── src/
│   │   ├── components/        # Componentes do Thinking in React + Modais
│   │   ├── services/          # Cliente HTTP (integração com produtos-api)
│   │   ├── types/             # Contratos TypeScript
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── AGENTS.md                  # Guia operacional estruturado para agentes de IA
├── IA.md                      # Passos realizados 
└── README.md                  # Documentação principal do projeto
```

---

## 3. Pré-requisitos

- **Node.js v24** (gerenciado preferencialmente via `nvm`)
- **npm** (v10+)

---

## 4. Como Executar o Projeto Localmente

### Passo 1 — Iniciar a API Backend (`produtos-api`)

Em um terminal, acesse a pasta `produtos-api`, ative a versão do Node.js via `nvm`, instale as dependências e inicie o servidor:

```bash
cd produtos-api
nvm use
npm install
npm run dev
```

- O servidor iniciará em: **`http://localhost:3333`**
- Na primeira execução, o banco SQLite (`database.sqlite`) é criado e populado automaticamente (seed) com os **6 produtos oficiais** do exemplo *Thinking in React* (`Maçã`, `Pitaia`, `Maracujá`, `Espinafre`, `Abóbora`, `Ervilhas`) e uma conta de demonstração:
  - **E-mail:** `admin@produtos.dev`
  - **Senha:** `Admin@123`
- **Documentação Interativa Swagger UI:** **`http://localhost:3333/api/docs`**

---

### Passo 2 — Iniciar a Aplicação Web (`produtos-web`)

Em um segundo terminal, acesse a pasta `produtos-web`, instale as dependências e inicie o servidor de desenvolvimento do Vite:

```bash
cd produtos-web
nvm use
npm install
npm run dev
```

- A aplicação web estará disponível em: **`http://localhost:5173`**

---

## 5. Principais Endpoints da API (`produtos-api`)

| Método | Rota | Autenticação | Status | Descrição |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/health` | Pública | `200 OK` | Verifica o status de saúde do servidor |
| `GET` | `/api/docs` | Pública | `200 OK` | Interface interativa do Swagger UI |
| `POST` | `/api/auth/register` | Pública | `201 Created` | Cadastra novo usuário com hash Argon2 e retorna JWT |
| `POST` | `/api/auth/login` | Pública | `200 OK` | Autentica usuário e retorna token Bearer JWT |
| `GET` | `/api/auth/me` | Bearer JWT | `200 OK` | Retorna os dados públicos do usuário autenticado |
| `GET` | `/api/products` | Pública | `200 OK` | Lista produtos (filtros: `search`, `inStockOnly`, `category`) |
| `GET` | `/api/products/:id` | Pública | `200 OK` | Busca um produto específico pelo ID |
| `POST` | `/api/products` | Bearer JWT | `201 Created` | Cria um novo produto validado via Zod 4 |
| `PUT` / `PATCH` | `/api/products/:id` | Bearer JWT | `200 OK` | Atualiza os dados de um produto existente |
| `POST` | `/api/products/:id/photo` | Bearer JWT | `200 OK` | Faz upload seguro de foto via Multer (`JPG`, `PNG`, `WEBP` até 2MB) |
| `DELETE` | `/api/products/:id` | Bearer JWT | `204 No Content` | Remove um produto do banco de dados |

---

## 6. Scripts de Build para Produção e Docker

### Build de Produção
```bash
# Compilar o Backend TypeScript (gera produtos-api/dist/)
npm --prefix produtos-api run build

# Compilar o Frontend React + Vite (gera produtos-web/dist/)
npm --prefix produtos-web run build
```

### Executar o Backend com Docker
```bash
cd produtos-api
docker build -t produtos-api .
docker run -p 3333:3333 produtos-api
```

