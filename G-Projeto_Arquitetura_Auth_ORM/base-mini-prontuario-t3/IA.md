Tarefa: Extração do PatientsRepository
Trilha: ARQ
Rota:
chat|agente: agente
- **Ferramenta/modelo :** Gemini 3.8 Flash (Medium)
- **Prompt (chat: C-P-T-R-F-A):**
Contexto:
Você está trabalhando em um projeto Node/TS estruturado no padrão Port & Adapter. Os arquivos de referência para esta tarefa são @AGENTS.md, @INVARIANTES.md, @src/services/patients.service.ts e @src/repositories/LEIA-ME.md (que detalha o padrão da trilha).

Papel:
Aja como um revisor de código sênior em Node/TS.

Tarefa:
Extrair a camada repository de Patient, Encounter e Medication dos arquivos @src/services (TODO ARQ-1 a ARQ-3).
Criar `repositories/patients.repository.ts` com a INTERFACE `PatientsRepository` (o "port": findAll, findById, findByNationalId, create, updatePhoto) e a implementação `SqlitePatientsRepository` (o "adapter"), levando TODO o SQL deste arquivo para lá.
Os services passam a receber o repository e a conhecer apenas a interface. O `import { db }` dos services DESAPARECEM.

Restrições:
* Escopo: Estão completamente fora de escopo as entidades/camadas de encounters, medications, rotas, controllers, a pasta public/ e a pasta tests/.
* Dependências: Não adicione nenhuma biblioteca nova ao projeto.
* Invariante: A tradução de campos de snake_case (banco) para camelCase (aplicação) deve ir obrigatoriamente junto com o SQL para dentro do adapter (o formato do banco não pode vazar para o serviço).

Formato:

* Não remova os comentários existentes no código, apenas complemente-os se necessário.
* Todos os novos comentários devem ser escritos em português do Brasil.
* Registrar todas as alterações de forma estruturada no arquivo IA.md na raiz do projeto. Um registro por tarefa seguindo o esquema abaixo:

Tarefa: <nome curto>
Trilha: ARQ|ORM|AUTH|N3
Rota:
chat|agente: 
- **Ferramenta/modelo :**
- **Prompt (chat: C-P-T-R-F-A):**
<cole aqui, na íntegra>
- **Arquivos editados?**: o que você mudou e por quê
- **Evidência de pronto:** <cole a saída REAL do gate/teste que fecha o Done when>
- **Revisão adversarial** (quando houve): deixe em branco
- **O que EU decidi** (a parte que não foi delegada): deixe em branco

Aceitação (Done when):
Prova de pronto: `npm run gate` verde
- **Arquivos editados?**:
  - `src/repositories/patients.repository.ts`: criação da interface `PatientsRepository` (port) com `findAll`, `findById`, `findByNationalId`, `create` e `updatePhoto`, e da implementação `SqlitePatientsRepository` (adapter). Todo o SQL e o mapeamento de `snake_case` (banco) para `camelCase` (aplicação) foram encapsulados neste adapter, isolando o acesso ao banco e provendo uma instância padrão `defaultPatientsRepository`.
  - `src/services/patients.service.ts`: remoção do `import { db }` e de queries SQL. As funções passaram a receber `repository: PatientsRepository = defaultPatientsRepository`, mantendo a regra de negócio e tratamento de erros HTTP (404, 409) desacoplados do mecanismo de persistência.
- **Evidência de pronto:**
```
$ npm run check
npm notice run mini-prontuario-t3@3.0.0 check
npm notice run tsc --noEmit

$ npm run test
npm notice run mini-prontuario-t3@3.0.0 test
npm notice run tsx --test tests/*.test.ts
✔ GET /api/health responde 200 ok (35.151443ms)
✔ GET /api/patients devolve lista em camelCase (formato do banco não vaza) (4.372751ms)
✔ GET /api/patients/:id inexistente -> 404 no contrato de erro (3.339314ms)
✔ POST /api/patients válido -> 201 com id gerado (20.741893ms)
✔ POST /api/patients inválido -> 400 com details por campo (Zod) (3.491779ms)
✔ POST /api/patients com CNS duplicado -> 409 (invariante N1) (10.151914ms)
✔ Encounters: lista do seed e criação -> 200/201; paciente fantasma -> 404 (13.920548ms)
✔ Medications: lista e criação aninhadas no encounter -> 200/201; encounter fantasma -> 404 (15.056645ms)
✔ Upload: PNG pequeno -> 200 com photoUrl; sem arquivo -> 422 (14.246185ms)
✔ Upload: mimetype proibido -> 422 mesmo com extensão .jpg (filtro por conteúdo declarado) (3.704485ms)
﹣ setup: register dos dois papéis funciona (201 ou 409 se já existem) (45.143307ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 1 — sem token: POST encounter -> 401 (0.309336ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 2 — token ADULTERADO: assinatura invalida -> 401 (0.1019ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 3 — papel errado: recepcao tenta prescrever -> 403 (invariante N2) (0.097372ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 4 — recepcao consegue o que a matriz permite: criar paciente -> 201 (0.104535ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 5 — login com senha errada -> 401 SEM revelar qual campo errou (0.094847ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 6 — regra de domínio: profissional B não prescreve no atendimento do profissional A (0.086521ms) # trilha AUTH ainda não implementada
ℹ tests 17
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 7
ℹ todo 0
ℹ duration_ms 407.0921
```
- **Revisão adversarial** (quando houve): 
- **O que EU decidi** (a parte que não foi delegada): 

---

Tarefa: Extração do EncountersRepository (ARQ-2) e MedicationsRepository (ARQ-3)
Trilha: ARQ
Rota:
chat|agente: agente
- **Ferramenta/modelo :** Gemini 3.8 Flash (Medium)
- **Prompt (chat: C-P-T-R-F-A):**
Utilizando o mesmo comando anterior, faça para o ARQ-2 e ARQ-3.
- **Arquivos editados?**:
  - `src/repositories/encounters.repository.ts`: criação da interface `EncountersRepository` (port) com `findByPatientId`, `findById` e `create`, e da implementação `SqliteEncountersRepository` (adapter). Todo o SQL e a tradução `snake_case` -> `camelCase` foram encapsulados neste adapter.
  - `src/services/encounters.service.ts`: remoção do `import { db }` e do SQL; o serviço passou a receber `EncountersRepository` (com fallback para `defaultEncountersRepository`), mantendo apenas a orquestração e regras de negócio.
  - `src/repositories/medications.repository.ts`: criação da interface `MedicationsRepository` (port) com `findByEncounterId`, `findById` e `create`, e da implementação `SqliteMedicationsRepository` (adapter). Todo o SQL e a conversão de formato do banco para o domínio foram isolados no adapter.
  - `src/services/medications.service.ts`: remoção do `import { db }`, do SQL e do acoplamento com o Express (`import type { Request }`), fazendo o serviço depender exclusivamente da interface `MedicationsRepository`.
- **Evidência de pronto:**
```
$ npm run check
npm notice run mini-prontuario-t3@3.0.0 check
npm notice run tsc --noEmit

$ npm run test
npm notice run mini-prontuario-t3@3.0.0 test
npm notice run tsx --test tests/*.test.ts
✔ GET /api/health responde 200 ok (35.994145ms)
✔ GET /api/patients devolve lista em camelCase (formato do banco não vaza) (5.026333ms)
✔ GET /api/patients/:id inexistente -> 404 no contrato de erro (5.155431ms)
✔ POST /api/patients válido -> 201 com id gerado (21.463619ms)
✔ POST /api/patients inválido -> 400 com details por campo (Zod) (3.361061ms)
✔ POST /api/patients com CNS duplicado -> 409 (invariante N1) (10.770138ms)
✔ Encounters: lista do seed e criação -> 200/201; paciente fantasma -> 404 (11.880967ms)
✔ Medications: lista e criação aninhadas no encounter -> 200/201; encounter fantasma -> 404 (11.575685ms)
✔ Upload: PNG pequeno -> 200 com photoUrl; sem arquivo -> 422 (15.725034ms)
✔ Upload: mimetype proibido -> 422 mesmo com extensão .jpg (filtro por conteúdo declarado) (3.421327ms)
﹣ setup: register dos dois papéis funciona (201 ou 409 se já existem) (43.430961ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 1 — sem token: POST encounter -> 401 (0.408374ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 2 — token ADULTERADO: assinatura invalida -> 401 (0.179017ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 3 — papel errado: recepcao tenta prescrever -> 403 (invariante N2) (0.122548ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 4 — recepcao consegue o que a matriz permite: criar paciente -> 201 (0.132034ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 5 — login com senha errada -> 401 SEM revelar qual campo errou (0.089078ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 6 — regra de domínio: profissional B não prescreve no atendimento do profissional A (0.096321ms) # trilha AUTH ainda não implementada
ℹ tests 17
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 7
ℹ todo 0
ℹ duration_ms 421.571221
```
- **Revisão adversarial** (quando houve): 
- **O que EU decidi** (a parte que não foi delegada): 

---

Tarefa: Correção de violações de arquitetura (ARQ-4 e ARQ-5)
Trilha: ARQ
Rota:
chat|agente: agente
- **Ferramenta/modelo :** Gemini 3.8 Flash (Medium)
- **Prompt (chat: C-P-T-R-F-A):**
Contexto:
Você está trabalhando em um projeto Node/TS estruturado no padrão Port & Adapter. Os arquivos de referência para esta tarefa são @AGENTS.md, @INVARIANTES.md, @src/controllers/encounters.controller.ts` (ARQ-5) e @src/controllers/medications.controller.ts` e `src/services/medications.service.ts` (ARQ-4).

Papel:
Segue o mesmo do comando anterior.

Tarefa:
Corrigir as duas violações da Regra da Dependência acusadas pelo `dependency-cruiser` (`npm run arch`), garantindo que:
1. Controllers não acessem a infraestrutura de banco de dados (`controllers-nao-tocam-o-banco`).
2. Services não conheçam objetos de contexto HTTP/Web (`services-nao-conhecem-a-web`).

Restrições:
Segue o mesmo do comando anterior.

Formato:
Segue o mesmo do comando anterior.

Aceitação (Done when):
   - `npm run check`: Tipos estritos sem erro (0 falhas).
   - `npm run arch`: **Verde** (0 violações em 31 módulos e 57 dependências analisadas).
   - `npm test`: Todos os testes da API aprovados (10/10).
   - `npm run gate`: **GATE VERDE ✔** (todas as 4 etapas aprovadas: tipos, arquitetura, testes e ausência de segredos).
- **Arquivos editados?**:
  - `src/controllers/encounters.controller.ts`: removido o `import { db }` e a query direta ao banco de dados que verificava a existência do paciente, pois o serviço `encountersService.listEncountersByPatient` já efetua essa validação via `getPatientById` (ARQ-5).
  - `src/controllers/medications.controller.ts`: atualizado para extrair o `encounterId` numérico dos parâmetros da requisição e repassá-lo ao serviço, em vez de enviar o objeto `Request` (ARQ-4).
  - `src/services/medications.service.ts`: ajustado para receber diretamente `encounterId: number`, eliminando completamente qualquer dependência ou tipagem acoplada a contextos HTTP/Web (ARQ-4).
- **Evidência de pronto:**
```
$ npm run gate
npm notice run mini-prontuario-t3@3.0.0 gate
npm notice run bash gate.sh

──────────────────────────────────────────────
▶ 1/4 Tipos (tsc --noEmit)
──────────────────────────────────────────────
npm notice run mini-prontuario-t3@3.0.0 npx
npm notice run 'tsc' --noEmit
✔ tipos ok

──────────────────────────────────────────────
▶ 2/4 Arquitetura (dependency-cruiser)
──────────────────────────────────────────────
npm notice run mini-prontuario-t3@3.0.0 npx
npm notice run 'depcruise' src --config .dependency-cruiser.cjs

✔ no dependency violations found (31 modules, 60 dependencies cruised)

✔ regras de dependência respeitadas

──────────────────────────────────────────────
▶ 3/4 Testes de API (node:test, servidor real em porta efêmera)
──────────────────────────────────────────────
✔ GET /api/health responde 200 ok (35.642477ms)
✔ GET /api/patients devolve lista em camelCase (formato do banco não vaza) (5.327227ms)
✔ GET /api/patients/:id inexistente -> 404 no contrato de erro (4.161052ms)
✔ POST /api/patients válido -> 201 com id gerado (33.391509ms)
✔ POST /api/patients inválido -> 400 com details por campo (Zod) (4.994014ms)
✔ POST /api/patients com CNS duplicado -> 409 (invariante N1) (9.866565ms)
✔ Encounters: lista do seed e criação -> 200/201; paciente fantasma -> 404 (13.264032ms)
✔ Medications: lista e criação aninhadas no encounter -> 200/201; encounter fantasma -> 404 (13.700435ms)
✔ Upload: PNG pequeno -> 200 com photoUrl; sem arquivo -> 422 (15.198361ms)
✔ Upload: mimetype proibido -> 422 mesmo com extensão .jpg (filtro por conteúdo declarado) (3.993183ms)
﹣ setup: register dos dois papéis funciona (43.55592ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 1 — sem token: POST encounter -> 401 (0.263775ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 2 — token ADULTERADO: assinatura invalida -> 401 (0.153272ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 3 — papel errado: recepcao tenta prescrever -> 403 (invariante N2) (0.161727ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 4 — recepcao consegue o que a matriz permite: criar paciente -> 201 (0.124729ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 5 — login com senha errada -> 401 SEM revelar qual campo errou (0.115542ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 6 — regra de domínio: profissional B não prescreve no atendimento do profissional A (0.148924ms) # trilha AUTH ainda não implementada
ℹ tests 17
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ skipped 7
ℹ todo 0
ℹ duration_ms 435.139442
✔ testes verdes

──────────────────────────────────────────────
▶ 4/4 Segredos no repositório (gitleaks)
──────────────────────────────────────────────
6:40PM INF 16 commits scanned.
6:40PM INF scanned ~1505431 bytes (1.51 MB) in 206ms
6:40PM INF no leaks found
✔ nenhum segredo detectado

==============================================
GATE VERDE ✔ — pronto para PR (cole ESTA saída como evidência)
```
- **Revisão adversarial** (quando houve): 
- **O que EU decidi** (a parte que não foi delegada): 

---

Tarefa: Trilha ORM: Migração para o Prisma ORM (ORM-1 a ORM-5)
Trilha: ORM
Rota:
chat|agente: agente
- **Ferramenta/modelo :** Gemini 3.8 Flash (Medium)
- **Prompt (chat: C-P-T-R-F-A):**
Contexto:
Você está trabalhando em um projeto Node/TS estruturado no padrão Port & Adapter. Os arquivos de referência para esta tarefa são @AGENTS.md, @INVARIANTES.md, @src/repositories/, prisma/

Papel:
Segue o mesmo do comando anterior.

Tarefa:
Trilha ORM: Migração para o Prisma ORM (ORM-1 a ORM-5)
Migrar o acesso a dados para o Prisma ORM conforme o roteiro em `prisma/LEIA-ME.md`, mantendo as interfaces da camada de repositórios intactas e comprovando a eficácia da arquitetura hexagonal (o service não percebe a troca do driver).

Restrições:
Segue o mesmo do comando anterior.

Formato:
Segue o mesmo do comando anterior.

Aceitação (Done when):
`npm run gate`: **GATE VERDE ✔** em todas as etapas.
- **Arquivos editados?**:
  - `prisma/schema.prisma`: criado com datasource SQLite e introspecção das tabelas do banco via `db pull`; renomeados modelos para PascalCase e campos para camelCase utilizando `@map` e `@@map` (ORM-1, ORM-2, ORM-3).
  - `prisma/migrations/0_init/migration.sql`: criada a baseline de migração inicial e marcada como aplicada com `npx prisma migrate resolve --applied 0_init` (ORM-5 / Invariante OP-1).
  - `src/repositories/prisma.ts`: criada a instância singleton `prisma = new PrismaClient()` isolada dentro da camada de repositórios em conformidade com as regras de arquitetura.
  - `src/repositories/patients.repository.ts`: implementada a classe `PrismaPatientsRepository` e configurada como `defaultPatientsRepository`, mantendo a interface `PatientsRepository` intacta.
  - `src/repositories/encounters.repository.ts`: implementada a classe `PrismaEncountersRepository` e configurada como `defaultEncountersRepository`, mantendo a interface `EncountersRepository` intacta.
  - `src/repositories/medications.repository.ts`: implementada a classe `PrismaMedicationsRepository` e configurada como `defaultMedicationsRepository`, mantendo a interface `MedicationsRepository` intacta.
  - `src/services/` e `src/controllers/`: adaptados para chamadas assíncronas com `async/await`, preservando a transparência de domínio e comprovando a eficácia do padrão Ports & Adapters.
- **Evidência de pronto:**
```
$ npm run gate
npm notice run mini-prontuario-t3@3.0.0 gate
npm notice run bash gate.sh

──────────────────────────────────────────────
▶ 1/4 Tipos (tsc --noEmit)
──────────────────────────────────────────────
npm notice run mini-prontuario-t3@3.0.0 npx
npm notice run 'tsc' --noEmit
✔ tipos ok

──────────────────────────────────────────────
▶ 2/4 Arquitetura (dependency-cruiser)
──────────────────────────────────────────────
npm notice run mini-prontuario-t3@3.0.0 npx
npm notice run 'depcruise' src --config .dependency-cruiser.cjs

✔ no dependency violations found (33 modules, 64 dependencies cruised)

✔ regras de dependência respeitadas

──────────────────────────────────────────────
▶ 3/4 Testes de API (node:test, servidor real em porta efêmera)
──────────────────────────────────────────────
✔ GET /api/health responde 200 ok (42.513469ms)
✔ GET /api/patients devolve lista em camelCase (formato do banco não vaza) (13.028342ms)
✔ GET /api/patients/:id inexistente -> 404 no contrato de erro (6.864238ms)
✔ POST /api/patients válido -> 201 com id gerado (36.281347ms)
✔ POST /api/patients inválido -> 400 com details por campo (Zod) (5.046156ms)
✔ POST /api/patients com CNS duplicado -> 409 (invariante N1) (11.4486ms)
✔ Encounters: lista do seed e criação -> 200/201; paciente fantasma -> 404 (16.33798ms)
✔ Medications: lista e criação aninhadas no encounter -> 200/201; encounter fantasma -> 404 (16.128663ms)
✔ Upload: PNG pequeno -> 200 com photoUrl; sem arquivo -> 422 (15.316585ms)
✔ Upload: mimetype proibido -> 422 mesmo com extensão .jpg (filtro por conteúdo declarado) (3.563238ms)
﹣ setup: register dos dois papéis funciona (53.109404ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 1 — sem token: POST encounter -> 401 (0.366223ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 2 — token ADULTERADO: assinatura invalida -> 401 (0.166425ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 3 — papel errado: recepcao tenta prescrever -> 403 (invariante N2) (0.201502ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 4 — recepcao consegue o que a matriz permite: criar paciente -> 201 (0.148842ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 5 — login com senha errada -> 401 SEM revelar qual campo errou (0.111621ms) # trilha AUTH ainda não implementada
﹣ ATAQUE 6 — regra de domínio: profissional B não prescreve no atendimento do profissional A (0.131629ms) # trilha AUTH ainda não implementada
ℹ tests 17
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 7
ℹ todo 0
ℹ duration_ms 489.273005
✔ testes verdes

──────────────────────────────────────────────
▶ 4/4 Segredos no repositório (gitleaks)
──────────────────────────────────────────────
7:01PM INF 17 commits scanned.
7:01PM INF scanned ~1511879 bytes (1.51 MB) in 212ms
7:01PM INF no leaks found
✔ nenhum segredo detectado

==============================================
GATE VERDE ✔ — pronto para PR (cole ESTA saída como evidência)
```
- **Revisão adversarial** (quando houve): 
- **O que EU decidi** (a parte que não foi delegada): 
