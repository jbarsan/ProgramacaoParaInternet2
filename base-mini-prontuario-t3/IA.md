# Registro de Alterações de IA (IA.md)

Este documento registra o histórico de tarefas, objetivos, decisões técnicas e alterações realizadas no projeto pelo assistente de IA.

---

## [2026-09-30] Trilha ARQ: Separação de Portas e Adaptadores (ARQ-1, ARQ-2 e ARQ-3)

### Objetivo
Desacoplar a lógica de domínio/negócio da infraestrutura de acesso a dados (banco de dados SQLite). Remover queries SQL e conversões de formato dos *Services*, transferindo-os para uma nova camada de *Repositories* baseada no padrão Ports & Adapters (Hexagonal / Clean Architecture).

### Alterações Realizadas

1. **Criação da Camada de Repositories (`src/repositories/`):**
   - **`patients.repository.ts` (ARQ-1):**
     - Interface `PatientsRepository` (porta): métodos `findAll`, `findById`, `findByNationalId`, `create` e `updatePhoto`.
     - Classe `SqlitePatientsRepository` (adaptador): manipulação do banco via `better-sqlite3`, queries SQL parametrizadas e tradução `snake_case` → `camelCase` (`toPatientJson`).
   - **`encounters.repository.ts` (ARQ-2):**
     - Interface `EncountersRepository` (porta): métodos `findByPatientId`, `findById` e `create`.
     - Classe `SqliteEncountersRepository` (adaptador): queries SQL e conversão `toEncounterJson`.
   - **`medications.repository.ts` (ARQ-3):**
     - Interface `MedicationsRepository` (porta): métodos `findByEncounterId`, `findById` e `create`.
     - Classe `SqliteMedicationsRepository` (adaptador): queries SQL e conversão `toMedicationJson`.

2. **Refatoração dos Services (`src/services/`):**
   - **`patients.service.ts`:**
     - Removido `import { db } from "../database"`, SQL embutido e função `toPatientJson`.
     - Injeção de dependência do repositório (`repository: PatientsRepository = defaultRepository`).
     - Manutenção integral das regras de negócio (validação de unicidade do CNS - invariante N1 gerando 409, validações de existência gerando 404).
   - **`encounters.service.ts`:**
     - Removido `import { db } from "../database"` e queries SQL.
     - Injeção de dependência de `EncountersRepository`.
   - **`medications.service.ts`:**
     - Removido `import { db } from "../database"` e queries SQL.
     - Removido `import type { Request } from "express"`, eliminando o acoplamento do domínio com a web.
     - Injeção de dependência de `MedicationsRepository`.

3. **Validações e Verificações:**
   - `npm run check` (`tsc --noEmit`): Compilação TypeScript estrita sem erros.
   - `npm run db:reset`: Banco de dados e seeds recriados com sucesso.
   - `npm test`: Todos os 10 testes de fumaça da API aprovados sem regressões.

---

## [2026-09-30] Trilha ARQ: Correção das Violações Plantadas de Arquitetura (ARQ-4 e ARQ-5)

### Objetivo
Corrigir as duas violações da Regra da Dependência acusadas pelo `dependency-cruiser` (`npm run arch`), garantindo que:
1. Controllers não acessem a infraestrutura de banco de dados (`controllers-nao-tocam-o-banco`).
2. Services não conheçam objetos de contexto HTTP/Web (`services-nao-conhecem-a-web`).

### Alterações Realizadas

1. **`src/controllers/encounters.controller.ts` (ARQ-5):**
   - Removidos o `import { db } from "../database"` e o `import { NotFoundError }`.
   - Removida a verificação manual com SQL `SELECT 1 FROM patients WHERE id = ?`. O controller agora delega a operação diretamente para `encountersService.listEncountersByPatient(Number(request.params.id))`, onde a existência do paciente já é checada no domínio (`getPatientById`).

2. **`src/controllers/medications.controller.ts` e `src/services/medications.service.ts` (ARQ-4):**
   - No controller, extraiu-se o parâmetro `Number(request.params.encounterId)` do request HTTP antes de chamar o service.
   - No service, `listMedicationsByEncounter` agora recebe estritamente `encounterId: number`, eliminando completamente qualquer vínculo ou tipagem web no domínio.

3. **Validações e Verificações:**
   - `npm run check`: Tipos estritos sem erro (0 falhas).
   - `npm run arch`: **Verde** (0 violações em 31 módulos e 57 dependências analisadas).
   - `npm test`: Todos os testes da API aprovados (10/10).
   - `npm run gate`: **GATE VERDE ✔** (todas as 4 etapas aprovadas: tipos, arquitetura, testes e ausência de segredos).

---

## [2026-09-30] Trilha ARQ: Promoção da Régua de Arquitetura (ARQ-6)

### Objetivo
Subir a escada de enforcement do `INVARIANTES.md` (A1 — Direção de dependência) adicionando ao `.dependency-cruiser.cjs` a regra executável que proíbe qualquer camada fora de `repositories/` de importar o banco de dados (`src/database` ou `@prisma`).

### Alterações Realizadas

1. **`.dependency-cruiser.cjs` (ARQ-6):**
   - Adicionada a regra `so-repositories-importam-o-driver`:
     - `severity`: `"error"`
     - `from`: `{ path: "^src/(?!repositories)" }`
     - `to`: `{ path: "^src/database|@prisma" }`
   - Garante permanentemente que rotas, controllers, services e utilitários não possam importar diretamente a conexão ou driver do banco de dados.

2. **Validações e Verificações:**
   - `npm run check`: Tipos TypeScript estritos validados (0 erros).
   - `npm run arch`: Verificação arquitetural aprovada com a nova regra ativa (0 violações).
   - `npm test`: Testes de fumaça da API aprovados (10/10).
   - `npm run gate`: **GATE VERDE ✔** (4/4 checagens concluídas com sucesso).

---

## [2026-09-30] Trilha ORM: Migração para o Prisma ORM (ORM-1 a ORM-5)

### Objetivo
Migrar o acesso a dados para o Prisma ORM conforme o roteiro em `prisma/LEIA-ME.md`, mantendo as interfaces da camada de repositórios intactas e comprovando a eficácia da arquitetura hexagonal (o service não percebe a troca do driver).

### Alterações Realizadas

1. **Configuração e Introspecção do Prisma (`prisma/schema.prisma`):**
   - Configurado `DATABASE_URL` relativo ao arquivo de schema (`file:../database/prontuario.db`).
   - Executado `npx prisma db pull` para introspecção do banco SQLite existente.
   - Renomeados models (`Patient`, `Encounter`, `MedicationRequest`) e campos (`birthDate`, `nationalId`, `photoUrl`, `patientId`, `startedAt`, `chiefComplaint`, `encounterId`) para `camelCase`, mantendo o mapeamento físico com `@map` e `@@map`.
   - Executado `npx prisma generate` para criação dos tipos e cliente Prisma.

2. **Criação do Cliente Prisma (`src/repositories/prisma.ts`):**
   - Instanciado o singleton `prisma = new PrismaClient()`, isolado dentro da camada de repositórios conforme a regra arquitetural `so-repositories-importam-o-driver`.

3. **Implementação dos Repositórios Prisma (`src/repositories/`):**
   - **`patients.repository.ts`:** Criada a classe `PrismaPatientsRepository` implementando `PatientsRepository`.
   - **`encounters.repository.ts`:** Criada a classe `PrismaEncountersRepository` implementando `EncountersRepository`.
   - **`medications.repository.ts`:** Criada a classe `PrismaMedicationsRepository` implementando `MedicationsRepository`.
   - As interfaces foram alinhadas para operações assíncronas (`Promise<...>`), sendo implementadas tanto pelos adaptadores Prisma quanto pelos adaptadores SQLite legados.

4. **Transição nos Services e Controllers:**
   - Services agora usam as implementações Prisma como repositório padrão (`new PrismaPatientsRepository()`, `new PrismaEncountersRepository()`, `new PrismaMedicationsRepository()`).
   - Controllers e Services ajustados para `async`/`await`, aproveitando o suporte nativo a promises do Express 5.

5. **Marcação da Baseline de Migrations (Invariante OP-1):**
   - Gerada a migration inicial `prisma/migrations/0_init/migration.sql` a partir do estado atual do banco.
   - Marcada como aplicada via `npx prisma migrate resolve --applied 0_init`.
   - A partir deste ponto, alterações de esquema no banco são feitas exclusivamente via `npx prisma migrate dev`.

6. **Validações e Verificações:**
   - `npm run check`: Tipos estritos validados com sucesso.
   - `npm run arch`: Arquitetura aprovada com 0 violações (34 módulos analisados).
   - `npm test`: Todos os 10 testes de fumaça da API aprovados utilizando o Prisma.
   - `npm run gate`: **GATE VERDE ✔** em todas as 4 etapas.

---

## [2026-09-30] Trilha AUTH: Identidade, Autenticação e Permissões (AUTH-1 a AUTH-8)

### Objetivo
Construir o sistema de autenticação e controle de acesso baseado em papéis (RBAC) e regras de domínio da aplicação, blindando o sistema contra os ataques de OWASP (A01 Broken Access Control e A07 Identification/Authentication Failures) e habilitando o frontend completo.

### Alterações Realizadas

1. **Erros HTTP de Identidade (`src/errors/HttpError.ts` - AUTH-1):**
   - `UnauthorizedError` (401) e `ForbiddenError` (403).

2. **Migração do Banco de Dados via Prisma (AUTH-2):**
   - Atualizado `prisma/schema.prisma` adicionando o model `User` (`name`, `email` único, `password_hash`, `role`, `created_at`).
   - Adicionado relacionamento `professional_id` em `encounters` apontando para `users.id`.
   - Gerada e aplicada a migration `20260930195700_add_users_and_professional_id/migration.sql` via `npx prisma migrate deploy`.

3. **Repositório de Usuários (`src/repositories/users.repository.ts`):**
   - Interface `UsersRepository` (`findByEmail`, `findById`, `create`) e implementação `PrismaUsersRepository`.

4. **Validação e Schemas Zod (`src/validation/auth.schemas.ts` - AUTH-4):**
   - `registerSchema`: valida nome, email, senha com no mínimo 8 caracteres e papel (`admin | profissional | recepcao`).
   - `loginSchema`: valida formato de email e presença da senha (sem exigir tamanho mínimo para não vazar informações para atacantes).

5. **Lógica de Autenticação (`src/services/auth.service.ts` e `controllers/auth.controller.ts`):**
   - `register`: senha é transformada em hash usando `argon2` antes de tocar o banco. Retorna o usuário criado sem hash de senha (201).
   - `login`: confere e-mail e hash argon2. Erro genérico `UnauthorizedError("Credenciais inválidas.")` para evitar enumeração de usuários (OWASP). Emite JWT assinado com `process.env.JWT_SECRET` e expiração configurada.
   - `me`: busca o usuário autenticado por ID.
   - **`src/routes/auth.routes.ts` (AUTH-3):** Rotas `/api/auth/register`, `/api/auth/login` e `/api/auth/me`.

6. **Middlewares de Segurança (`src/middlewares/auth.ts` - AUTH-5 e AUTH-6):**
   - `requireAuth`: valida cabeçalho `Authorization: Bearer <token>`, decodifica JWT e injeta `request.user`. Retorna 401 caso ausente, inválido ou expirado.
   - `requireRole`: intercepta chamadas e bloqueia papéis não autorizados com 403 Forbidden.

7. **Aplicação da Matriz de Permissões nas Rotas (AUTH-7):**
   - **Pacientes (`patients.routes.ts`):** Todas as rotas protegidas com `requireAuth` (admin, profissional e recepcao permitidos).
   - **Atendimentos (`encounters.routes.ts`):** `GET` com `requireAuth`. `POST` exige `requireRole("admin", "profissional")` (recepcao recebe 403).
   - **Prescrições (`medications.routes.ts`):** `GET` exige `requireRole("admin", "profissional")` (recepcao recebe 403). `POST` exige `requireRole("profissional")` (admin e recepcao recebem 403).

8. **Regra Fina de Domínio para Prescrição (AUTH-8):**
   - Em `encounters.service.ts`, `createEncounter` armazena o `professionalId` do usuário logado.
   - Em `medications.service.ts`, `createMedication` valida que apenas o profissional que registrou aquele atendimento específico tem permissão para prescrever nele. Se outro profissional tentar prescrever no mesmo atendimento, o domínio bloqueia com `ForbiddenError` (403), satisfazendo o ATAQUE 6.

9. **Validações e Verificações:**
   - `npm run check`: Tipos TypeScript estritos sem erro (0 falhas).
   - `npm run arch`: 0 violações arquiteturais em 39 módulos e 80 dependências.
   - `npm test`: **17/17 testes aprovados** (10 testes de fumaça da API + 6 testes de ataque OWASP + setup de registro).
   - `npm run gate`: **`GATE VERDE ✔`** em todas as 4 etapas.
