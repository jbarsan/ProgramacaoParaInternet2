/**
 * ============================================================
 * RENDERIZAÇÃO
 * ------------------------------------------------------------
 * Desenha o estado na tela. Não decide nada. Mesmo padrão do
 * Mini-Prontuário.
 * ============================================================
 */

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDateTime(isoDateTime) {
  const [datePart, timePart] = isoDateTime.split("T");
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year} às ${timePart}`;
}

function medicationCardTemplate(med) {
  return `
    <li class="medication-card" data-medication-id="${med.id}" role="button" tabindex="0">
      <h2 class="medication-card__name">${escapeHtml(med.medicationName)} — ${escapeHtml(med.dosage)}</h2>
      <p class="medication-card__meta">${escapeHtml(med.patientName)}</p>
      <p class="medication-card__meta">${escapeHtml(med.route)} · ${formatDateTime(med.scheduledAt)}</p>
    </li>
  `;
}

function emptyStateTemplate() {
  return `
    <li>
      <div class="empty-state">
        <p class="empty-state__title">Nada por aqui</p>
        <p class="m-0">Nenhuma prescrição cadastrada ainda.</p>
      </div>
    </li>
  `;
}

// ============================================================
// PASSO 2 — implemente renderMedicationList(medications, container)
//   vazio -> emptyStateTemplate(); senão -> map + join('') com medicationCardTemplate
// ============================================================


export function renderCounter(count, container) {
  container.textContent = `${count} prescrição(ões) no painel`;
}

export function renderLoading(container) {
  container.innerHTML = `<li><div class="empty-state"><p class="empty-state__title">Carregando…</p></div></li>`;
}

export function renderError(message, container) {
  container.innerHTML = `<li><div class="empty-state"><p class="empty-state__title">Algo deu errado</p><p class="m-0">${escapeHtml(message)}</p></div></li>`;
}

// João Carlos
export function renderMedicationList(medications, container) {
  if (medications.length === 0) {
    container.innerHTML = emptyStateTemplate();
    return;
  }

  container.innerHTML = medications
    .map(medicationCardTemplate)
    .join('');
}

// ============================================================
// PASSO 4 — implemente renderDetail(state, container)
//   sem selectedMedication -> container.hidden = true; container.innerHTML = ""
//   com selectedMedication -> desenhe nome, paciente, dosagem, via, horário,
//   observações (se houver) e um botão <button id="remove-button">Suspender</button>
//   dica: veja o padrão renderDetail do Mini-Prontuário (gabarito da Atividade 01)
// ============================================================

// João Carlos
export function renderDetail(state, container) {
  // Se houver erro ao buscar os detalhes (ex: ID inexistente / 404)
  if (state.detailErrorMessage) {
    container.hidden = false;
    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h2 class="h5 text-danger m-0">Não foi possível carregar a prescrição</h2>
        <button id="close-detail-button" class="btn btn-sm btn-outline-secondary" type="button">Fechar</button>
      </div>
      <p class="text-danger m-0">${escapeHtml(state.detailErrorMessage)}</p>
    `;
    return;
  }

  // Se estiver carregando os dados do detalhe
  if (state.isLoadingDetail) {
    container.hidden = false;
    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <p class="m-0 text-muted">Carregando detalhes…</p>
        <button id="close-detail-button" class="btn btn-sm btn-outline-secondary" type="button">Fechar</button>
      </div>
    `;
    return;
  }

  const med = state.selectedMedication;

  // Sem prescrição selecionada
  if (!med) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  const notes = med.notes ?? med.observations;

  // Com prescrição selecionada
  container.hidden = false;
  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-start mb-2">
      <h2 class="h4 mb-0">${escapeHtml(med.medicationName)} — ${escapeHtml(med.dosage)}</h2>
      <button id="close-detail-button" class="btn btn-sm btn-outline-secondary" type="button">Fechar</button>
    </div>
    <p class="mb-1"><strong>Paciente:</strong> ${escapeHtml(med.patientName)}</p>
    <p class="mb-1"><strong>Via:</strong> ${escapeHtml(med.route)} · <strong>Horário:</strong> ${formatDateTime(med.scheduledAt)}</p>
    ${notes ? `<p class="mb-2"><strong>Observações:</strong> ${escapeHtml(notes)}</p>` : ""}
    <div class="mt-3">
      <button id="remove-button" class="btn btn-danger" type="button">Suspender</button>
    </div>
  `;
}