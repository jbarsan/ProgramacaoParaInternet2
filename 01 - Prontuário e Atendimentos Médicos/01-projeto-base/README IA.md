## Interação 1

- **Ferramenta**: Gemini
- **Objetivo**: Gerar mais nomes aleatórios para testar a ordenação
- **Decisão**: total - aceitei as sugestões de nomes
- **Validei**: rodei o app e os nomes apareceram em ordem alfabética

## Interação 2

- **Ferramenta**: Gemini
- **Objetivo**: Ajudar a criar a função function calculateAge(isoDate){} para calcular a idade do paciente
- **Decisão**: Aceitei a sugestão de função, mas não entendi de primeira como fazer para inserir no código, então pedi ajuda ao Gemini novamente
- **Validei**: Rodei o app e a idade do paciente apareceu corretamente

## Interação 3

- **Ferramenta**: Gemini
- **Objetivo**: Ajudar a criar a função normalizeText(text) para normalizar os textos, removendo acentos e convertendo para minúsculas
- **Decisão**: Aceitei a sugestão de função, pois conseguiu resolver o problema de busca por nomes com acentos
- **Validei**: Rodei o app e ele funcionou corretamente

## Interação 4

- **Ferramenta**: Gemini
- **Objetivo**: Ajudar a utilizar a ferramenta REST Client do VS Code para interagir com a API, enviando os métodos GET e POST
- **Decisão**: Aceitei as explicações e segui o passo a passo de como utilizar a ferramenta.
- **Validei**: Consegui utilizar a ferramenta e interagir com a API corretamente.

## Interação 5

- **Ferramenta**: Gemini
- **Objetivo**: Ajudar a inserir dados no banco de dados do zero, utilizando o comando npm run db:reset
- **Decisão**: Aceitei as explicações e segui o passo a passo de como utilizar o comando.
- **Validei**: Consegui inserir os dados no banco de dados corretamente.

## Interação 6

- **Ferramenta**: Gemini
- **Objetivo**: Ajudar a migrar os dados do do Mock para o banco de dados SQLite3.
- **Decisão**: Revisei as explicações e aceitei algumas alterações sugeridas, principalmente na criação da rota /api/patients/:id.
- **Validei**: Rodei o app e os dados foram migrados corretamente.

## Interação 7

- **Ferramenta**: Gemini
- **Objetivo**: Ajudar com erro no momento de inserir os dados no banco de dados. Eu estava recebendo o erro 500.
- **Decisão**: Recebi a explicação do erro e percebi que estava passando mais parâmetros para o banco do que o necessário. Corrigi o código e os dados foram inseridos corretamente.
- **Validei**: Rodei o app e os dados foram inseridos corretamente.

## Interação 8

- **Ferramenta**: Gemini
- **Objetivo**: Solicitei ajuda para elaborar a API de Encounter, principalmente na elaboração das função validaEncounterInput. Também solicitei ajuda na elaboração da tela de detalhe do paciente e atendimentos, além de ajuda na elaboração dos componentes CSS (que não possuo expertize). Também foi solicitado ajuda na elaboração dos scripts JS (que também não possuo expertize) e ajustes na página index.html
- **Decisão**: Recebi as explicações e exemplos de códigos, além de ajustes e orientações de onde deveria ser feito os ajustes necessários.
- **Validei**: Após as orientações e ajustes, rodei o app e ele funcionou corretamente.

## Interação 9

- **Ferramenta**: Gemini
- **Objetivo**: Implementar a funcionalidade de cadastrar e remover paciente, criando a rota `DELETE /api/patients/:id` e aprimorando `POST /api/patients` no backend (Express + TypeScript + SQLite, SQL parametrizado, sem ORM), e integrando ao frontend mantendo a separação estrita de camadas (`api.js` como única porta de rede, `state.js`, `render.js` e `app.js`).
- **Decisão**: Aceitei o plano de implementação e a estrutura de código proposta para o backend (validação e tratamento de duplicidade de CNS) e frontend (modal de cadastro e fluxo de estado/renderização).
- **Validei**: Validação de tipos com `npm run check`, testes automatizados de rotas HTTP no servidor e verificação do fluxo ponta a ponta.

## Interação 10

- **Ferramenta**: Gemini
- **Objetivo**: Ajustar a interface para que a opção de remover paciente seja exibida apenas dentro da tela de Detalhes do paciente, e corrigir o comportamento dos botões Cancelar e Fechar do modal de cadastro de paciente.
- **Decisão**: Aceitei as alterações para restringir a exclusão à visualização detalhada e para corrigir o tratamento de eventos de clique e cancelamento do modal no DOM.
- **Validei**: Rodei o app e validei que o botão de remoção só aparece nos detalhes do paciente e que o modal fecha corretamente através dos botões Cancelar, Fechar (✕), clique no backdrop ou pressionando Escape.

