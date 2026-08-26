/**
 * ============================================================
 * RENDERIZAÇÃO
 * ------------------------------------------------------------
 * Este arquivo desenha o estado na tela. E só isso.
 *
 * REGRA DE OURO: aqui não se DECIDE nada.
 * Não se filtra, não se ordena, não se calcula regra de negócio.
 * Ele recebe o que deve aparecer e coloca na tela.
 *
 * Um bom `render` é burro de propósito. Toda a inteligência
 * mora no estado.
 * ============================================================
 */

/* ------------------------------------------------------------
   SEGURANÇA - por que escapar o texto?
   ------------------------------------------------------------
   Vamos montar HTML com `innerHTML`. Se o nome de um paciente
   fosse `<img src=x onerror="alert(1)">`, o navegador executaria
   esse código. Isso se chama XSS.
   Escapar significa: transformar caractere de marcação em texto.
   Voltaremos a isso com calma em OWASP Top 10.
   ------------------------------------------------------------ */
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** 1991-03-14  ->  14/03/1991 */
function formatDate(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

/** 2026-08-24T09:30  ->  24/08/2026 às 09:30 */
function formatDateTime(isoDateTime) {
  if (!isoDateTime) return "";
  const [datePart, timePart] = isoDateTime.split("T");
  if (!datePart) return isoDateTime;
  const [year, month, day] = datePart.split("-");
  const time = timePart ? timePart.slice(0, 5) : "";
  return time ? `${day}/${month}/${year} às ${time}` : `${day}/${month}/${year}`;
}

/** Monta o HTML de UM cartão de paciente na listagem. */
function patientCardTemplate(patient) {
  const cardModifier = patient.active ? "" : " patient-card--inactive";
  const badgeModifier = patient.active ? "status-badge--active" : "status-badge--inactive";
  const badgeLabel = patient.active ? "Ativo" : "Inativo";

  return `
    <li class="patient-card${cardModifier} patient-card--clickable" data-action="view-patient" data-patient-id="${patient.id}">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <h2 class="patient-card__name">${escapeHtml(patient.name)}</h2>
        <span class="status-badge ${badgeModifier}">${badgeLabel}</span>
      </div>
      <p class="patient-card__meta">
        Nascimento: ${formatDate(patient.birthDate)} (${patient.age} anos)
      </p>
      <p class="patient-card__meta patient-card__id">
        CNS ${escapeHtml(patient.nationalId)} · #${patient.id}
      </p>
      <div class="patient-card__action">
        <button type="button" class="btn btn-sm btn-outline-primary w-100" data-action="view-patient" data-patient-id="${patient.id}">
          Ver Atendimentos
        </button>
      </div>
    </li>
  `;
  // João Carlos:
  // O ${patient.age} na linha 52 foi adicionado para exibir a idade do paciente,
  // todo o cálculo da idade foi feito no arquivo state.js
}

/** Tela de "nada encontrado" na busca. */
function emptyStateTemplate(searchTerm) {
  const term = searchTerm ? searchTerm.trim() : "";
  const complement = term
    ? `Nenhum paciente corresponde a “${escapeHtml(term)}”.`
    : "Nenhum paciente cadastrado ainda.";

  return `
    <li>
      <div class="empty-state">
        <p class="empty-state__title">Nada por aqui</p>
        <p class="m-0">${complement}</p>
      </div>
    </li>
  `;
}

/**
 * TODO RENDER-1 (Encontro 1, Prática 1)
 * Desenhe a lista de pacientes dentro do elemento `container`.
 *
 * Passos:
 *   1. se `patients` estiver vazio, use emptyStateTemplate(searchTerm)
 *   2. senão, transforme cada paciente em HTML com patientCardTemplate
 *      e junte tudo numa única string
 *   3. coloque o resultado em container.innerHTML
 *
 * Dica: `patients.map(...).join("")`
 *
 * Repare que redesenhamos a lista INTEIRA a cada mudança. Para
 * oito pacientes isso é instantâneo e o código fica trivial.
 * Para dez mil linhas com foco e rolagem, não seria — e é
 * exatamente esse problema que o React resolve. Você vai
 * entender o React muito melhor depois de ter vivido isso.
 */
export function renderPatientList(patients, searchTerm, container) {
  // escreva aqui:
  if (patients.length === 0) {
    container.innerHTML = emptyStateTemplate(searchTerm);
    return;
  }

  const patientList = patients.map((patient) => patientCardTemplate(patient)).join("");
  container.innerHTML = patientList;
}

/** Atualiza o contador de resultados. */
export function renderCounter(visibleCount, totalCount, container) {
  container.textContent =
    visibleCount === totalCount
      ? `${totalCount} paciente(s) no prontuário`
      : `${visibleCount} de ${totalCount} paciente(s)`;
}

/** Mensagem enquanto os dados da lista não chegaram. */
export function renderLoading(container) {
  container.innerHTML = `
    <li>
      <div class="empty-state">
        <p class="empty-state__title">Carregando…</p>
        <p class="m-0">Buscando os pacientes.</p>
      </div>
    </li>
  `;
}

/** Mensagem quando a comunicação da lista falhou. */
export function renderError(message, container) {
  container.innerHTML = `
    <li>
      <div class="empty-state">
        <p class="empty-state__title">Algo deu errado</p>
        <p class="m-0">${escapeHtml(message)}</p>
      </div>
    </li>
  `;
}

/* ------------------------------------------------------------
   PAINEL DE DETALHE DO PACIENTE E ATENDIMENTOS (ENCOUNTER)
   ------------------------------------------------------------ */

/** Monta o HTML de UM atendimento (Componente .encounter-item em BEM). */
function encounterItemTemplate(encounter) {
  const notesHtml = encounter.notes
    ? `
      <div class="encounter-item__notes-card">
        <p class="encounter-item__label">Conduta / Observações</p>
        <p class="encounter-item__notes-text">${escapeHtml(encounter.notes)}</p>
      </div>
    `
    : "";

  return `
    <li class="encounter-item">
      <div class="encounter-item__header">
        <span class="encounter-item__date">${formatDateTime(encounter.startedAt)}</span>
        <span class="encounter-item__id">#${encounter.id}</span>
      </div>
      <div class="encounter-item__body">
        <p class="encounter-item__label">Queixa Principal</p>
        <p class="encounter-item__complaint">${escapeHtml(encounter.chiefComplaint)}</p>
        ${notesHtml}
      </div>
    </li>
  `;
}

/** Empty state quando o paciente não tem atendimentos registrados. */
function encounterEmptyStateTemplate() {
  return `
    <li>
      <div class="empty-state">
        <p class="empty-state__title">Nenhum atendimento</p>
        <p class="m-0">Este paciente ainda não possui atendimentos registrados no prontuário.</p>
      </div>
    </li>
  `;
}

/** Tela de paciente 404 (não encontrado). */
function patientNotFoundTemplate() {
  return `
    <div class="patient-detail">
      <div class="patient-detail__nav">
        <button type="button" class="patient-detail__back-btn" data-action="back-to-list">
          ← Voltar para a lista
        </button>
      </div>
      <div class="empty-state">
        <p class="empty-state__title">Paciente não encontrado</p>
        <p class="mb-3">O paciente que você tentou acessar não existe ou foi removido do prontuário.</p>
        <button type="button" class="btn btn-sm btn-primary" data-action="back-to-list">
          Voltar para a lista de pacientes
        </button>
      </div>
    </div>
  `;
}

/** Gera a data e hora atual no formato ISO AAAA-MM-DDTHH:MM para o formulário. */
function getCurrentDateTimeInput() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/** Monta o painel completo de detalhes do paciente e atendimentos. */
function patientDetailTemplate(state) {
  const { selectedPatient, encounters, encounterFormError, encounterFormSubmitting } = state;
  const badgeModifier = selectedPatient.active ? "status-badge--active" : "status-badge--inactive";
  const badgeLabel = selectedPatient.active ? "Ativo" : "Inativo";

  const formErrorHtml = encounterFormError
    ? `
      <div class="form-alert-error" role="alert">
        <span>⚠️</span>
        <span>${escapeHtml(encounterFormError)}</span>
      </div>
    `
    : "";

  const encountersListHtml =
    encounters.length === 0
      ? encounterEmptyStateTemplate()
      : encounters.map(encounterItemTemplate).join("");

  return `
    <div class="patient-detail">
      <div class="patient-detail__nav">
        <button type="button" class="patient-detail__back-btn" data-action="back-to-list">
          ← Voltar para a lista
        </button>
      </div>

      <!-- Cartão de informações do paciente -->
      <section class="patient-detail__header-card">
        <div class="patient-detail__title-group">
          <h2 class="patient-detail__name">${escapeHtml(selectedPatient.name)}</h2>
          <span class="status-badge ${badgeModifier}">${badgeLabel}</span>
        </div>
        <div class="patient-detail__meta-grid">
          <div><strong>Data de Nascimento:</strong> ${formatDate(selectedPatient.birthDate)} (${selectedPatient.age} anos)</div>
          <div><strong>CNS:</strong> <span style="font-family: var(--fonte-mono)">${escapeHtml(selectedPatient.nationalId)}</span> · ID #${selectedPatient.id}</div>
        </div>
      </section>

      <!-- Grade de atendimentos e formulário -->
      <div class="patient-detail__grid">
        <!-- Coluna de atendimentos -->
        <section>
          <h3 class="patient-detail__section-title">
            Atendimentos (${encounters.length})
          </h3>
          <ul class="encounter-list">
            ${encountersListHtml}
          </ul>
        </section>

        <!-- Coluna do formulário de novo atendimento -->
        <section>
          <div class="encounter-form-card">
            <h3 class="encounter-form-card__title">Registrar Atendimento</h3>
            
            ${formErrorHtml}

            <form id="encounter-form" novalidate>
              <div class="mb-3">
                <label for="encounter-started-at" class="form-label">Data e Hora *</label>
                <input
                  type="datetime-local"
                  id="encounter-started-at"
                  name="startedAt"
                  class="form-control"
                  value="${getCurrentDateTimeInput()}"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="encounter-complaint" class="form-label">Queixa Principal *</label>
                <textarea
                  id="encounter-complaint"
                  name="chiefComplaint"
                  class="form-control"
                  rows="3"
                  placeholder="Ex: Cefaleia há três dias, febre constante…"
                  required
                ></textarea>
              </div>

              <div class="mb-3">
                <label for="encounter-notes" class="form-label">Conduta / Observações (opcional)</label>
                <textarea
                  id="encounter-notes"
                  name="notes"
                  class="form-control"
                  rows="3"
                  placeholder="Ex: Prescrita hidratação e retorno em 7 dias."
                ></textarea>
              </div>

              <button
                type="submit"
                class="btn btn-success w-100"
                ${encounterFormSubmitting ? "disabled" : ""}
              >
                ${encounterFormSubmitting ? "Salvando…" : "Salvar Atendimento"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  `;
}

/** Renderiza a tela de detalhe do paciente no container */
export function renderPatientDetail(state, container) {
  if (state.isLoadingDetail) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__title">Carregando prontuário…</p>
        <p class="m-0">Buscando informações e atendimentos do paciente.</p>
      </div>
    `;
    return;
  }

  if (state.isDetailNotFound) {
    container.innerHTML = patientNotFoundTemplate();
    return;
  }

  if (state.detailError) {
    container.innerHTML = `
      <div class="patient-detail">
        <div class="patient-detail__nav">
          <button type="button" class="patient-detail__back-btn" data-action="back-to-list">
            ← Voltar para a lista
          </button>
        </div>
        <div class="empty-state">
          <p class="empty-state__title">Erro ao carregar prontuário</p>
          <p class="m-0">${escapeHtml(state.detailError)}</p>
        </div>
      </div>
    `;
    return;
  }

  if (!state.selectedPatient) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = patientDetailTemplate(state);
}
