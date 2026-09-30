### O que foi feito por nível?

#### 1. Nível ARQ — Arquitetura Hexagonal (Ports & Adapters)
- **Extração dos Repositórios (Ports e Adapters):**
  - Isolamento das entidades `Patient`, `Encounter` e `Medication` em contratos de interface (`PatientsRepository`, `EncountersRepository`, `MedicationsRepository`) localizados na camada de repositórios.
  - Implementação dos adaptadores iniciais em SQLite (`SqlitePatientsRepository`, `SqliteEncountersRepository`, `SqliteMedicationsRepository`), encapsulando todo o SQL puro (`better-sqlite3`) e garantindo a tradução de `snake_case` (banco) para `camelCase` (domínio/API).
- **Desacoplamento e Regra da Dependência:**
  - Eliminação completa de chamadas a `import { db }` de dentro dos serviços (`src/services/`).
  - Correção das violações arquiteturais detectadas pelo `dependency-cruiser` (`npm run arch`), garantindo que:
    1. *Controllers não tocam o banco:* acesso a dados ocorre estritamente via services.
    2. *Services não conhecem a web:* remoção de importações e objetos de contexto do Express (`Request`, `Response`) de dentro dos serviços.

#### 2. Nível ORM — Migração para Prisma ORM
- **Modelagem e Preservação de Esquema:**
  - Configuração do Prisma Client para SQLite mantendo compatibilidade integral com o esquema legado.
  - Utilização de atributos `@map` (colunas como `birth_date`, `national_id`, `created_at`) e `@@map` (tabelas como `patients`, `encounters`, `medication_requests`) para respeitar o vocabulário `snake_case` no banco e `camelCase` no TypeScript.
  - Criação da baseline migration `0_init` marcada como aplicada (`prisma migrate resolve --applied 0_init`), preservando o histórico de migrations do projeto.
- **Implementação dos Adaptadores Prisma:**
  - Criação de `PrismaPatientsRepository`, `PrismaEncountersRepository` e `PrismaMedicationsRepository`.
  - Substituição transparente dos repositórios padrão sem alterar uma única linha de regra de negócio nos services, comprovando na prática a eficácia da Arquitetura Hexagonal.

#### 3. Nível AUTH — Identidade, Autenticação e Controle de Acesso (RBAC & Domínio)
- **Modelagem e Persistência de Usuários:**
  - Adição do modelo `User` no schema Prisma (`name`, `email` único, `password_hash`, `role` enum) e relação de chave estrangeira `Encounter.professionalId -> User.id`. Migration gerada e aplicada.
- **Camada de Erros e Contratos:**
  - Criação das classes `UnauthorizedError` (401) e `ForbiddenError` (403) padronizadas sob o contrato `{ error: { message, statusCode, details } }`.
- **Autenticação Segura (OWASP A07):**
  - Hashing e verificação de senhas com `Argon2`.
  - Emissão e validação de tokens JWT assinados com `JWT_SECRET`.
  - Mensagens de erro padronizadas e genéricas para credenciais incorretas, eliminando a enumeração de usuários.
- **Controle de Acesso em Camadas (OWASP A01 & Matriz de Permissões):**
  - Middleware de borda `requireAuth`: extrai e valida o token `Bearer`, anexando o usuário a `req.user`.
  - Middleware de borda `requireRole`: valida autorização de papéis (RBAC) para rotas administrativas, recepção e profissionais.
  - Regra de Domínio no Service: garantia de que **apenas o profissional que registrou o atendimento pode prescrever medicamentos** (`medications.service.ts`), barrando até mesmo outros profissionais ou administradores com `403 Forbidden` (ATAQUE 6).


---

### Por que o login não valida tamanho de senha com 400?

A ausência de validação de tamanho mínimo de senha no schema de login é uma decisão deliberada de segurança e integridade de software baseada nas diretrizes do **OWASP A07 (Identification and Authentication Failures)**:

No **registro**, a validação de tamanho (`min(8)`) com `400 Bad Request` é obrigatória para forçar o usuário a adotar uma senha forte antes de persistir o hash.

No **login**, responder `400` para senhas com menos de 8 caracteres revela ao atacante informações sobre as regras de validação internas e o comportamento da API antes mesmo de tentar autenticar. Para quem ataca, quanto mais respostas com status ou mensagens diferenciadas o endpoint der, mais fácil fica afunilar listas de dicionário e força bruta.

---

### Autoavaliação

#### a. Qual foi a decisão mais difícil e por quê;
A decisão mais difícil foi **definir a fronteira arquitetural da regra "somente o profissional que registrou o atendimento pode prescrever medicamentos"**.

A tentação comum seria resolver tudo na borda HTTP criando um middleware customizado no Express que buscasse o `encounter` e comparasse os IDs. No entanto, na Arquitetura Hexagonal, autorização baseada em estado/posse de entidade é **regra de negócio de domínio**, não controle de acesso puramente estrutural de rotas. 

A decisão correta foi manter os middlewares (`requireRole`) cuidando apenas de papéis genéricos na borda e delegar a verificação de propriedade para o `medications.service.ts`. Essa decisão exigiu reconciliar o `EncounterRepository` com o campo `professionalId` e garantir a integridade da chave estrangeira sem quebrar os testes legados de fumaça que criavam atendimentos sem usuário logado.

#### b. Um achado de IA que vocês recusaram e o motivo;
Durante o desenvolvimento do middleware de autenticação (`requireAuth`), a IA inicialmente posicionou a invocação do `next()` dentro do bloco `try { ... } catch { ... }` que validava o JWT. Isso fazia com que qualquer exceção lançada pelos middlewares subsequentes — em especial o `ForbiddenError` (403) gerado pelo `requireRole` — fosse capturada inadvertidamente pelo bloco `catch` do JWT e reescrita como `UnauthorizedError` (401: *"Token inválido ou expirado"*). 
Recusamos essa estrutura, isolando a verificação criptográfica do token em seu próprio escopo e executando `next()` fora do bloco `try/catch`. Isso garantiu que erros de autorização (403) e regras de domínio downstream fluíssem de forma limpa e fiel até o manipulador global de erros.

#### c. O que fariam diferente começando de novo.
Começando de novo, eu teria antecipado a inclusão da coluna `professional_id` em `encounters` logo no planejamento inicial do banco ou previsto o relacionamento como opcional com fallback explícito de teste desde a trilha ORM. Ter de ajustar a modelagem relacional na transição entre ORM e AUTH exigiu atenção redobrada para não violar restrições de integridade referencial do SQLite nos cenários mistos de execução (testes de fumaça versus testes de ataque com autenticação ativa).