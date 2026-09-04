/**
 * ============================================================
 * ESTADO
 * ------------------------------------------------------------
 * Guarda a resposta para "o que a tela precisa mostrar agora?".
 * Não conhece o DOM. Mesmo padrão do Mini-Prontuário.
 * ============================================================
 */

const state = {
  medications: [],
  isLoading: true,
  errorMessage: null,

  selectedId: null,
  isLoadingDetail: false,
  detailErrorMessage: null,
};

const listeners = [];

export function subscribe(listener) {
  listeners.push(listener);
}

function notify() {
  const snapshot = getState();
  listeners.forEach((listener) => listener(snapshot));
}

export function getState() {
  return {
    ...state,
    selectedMedication: getSelectedMedication(),
  };
}

/** Derivado: o registro aberto no painel de detalhe (nunca guardado duas vezes). */
export function getSelectedMedication() {
  if (state.selectedId === null) return null;
  return state.medications.find((m) => m.id === state.selectedId) ?? null;
}

// ============================================================
// PASSO 2 — implemente setMedications(medications)
//   guarde a lista, encerre o loading, limpe o erro, notify()
// ============================================================

// João Carlos
export function setMedications(medications) {
  state.medications = medications;
  state.isLoading = false;
  state.errorMessage = null;
  notify();
}

/** Registra uma falha de carregamento da lista. */
export function setError(message) {
  state.errorMessage = message;
  state.isLoading = false;
  notify();
}

// ============================================================
// PASSO 3 — implemente addMedication(medication)
//   acrescenta ao array de medications (imutável: [...state.medications, medication])
//   notify()
// ============================================================

// João Carlos
export function addMedication(medication) {
  state.medications = [...state.medications, medication];
  notify();
}

// ============================================================
// PASSO 4 — implemente selectMedication(id) e clearSelection()
//   selectMedication: guarda o id, zera erro de detalhe, notify()
//   clearSelection: volta selectedId para null, notify()
// ============================================================

// João Carlos
export function selectMedication(id) {
  state.selectedId = id;
  state.detailErrorMessage = null;
  state.isLoadingDetail = true;
  notify();
}

export function setMedicationDetail(medication) {
  state.selectedId = medication.id;
  state.isLoadingDetail = false;
  state.detailErrorMessage = null;

  // Atualiza ou insere o medicamento com os dados frescos da API
  const index = state.medications.findIndex((m) => m.id === medication.id);
  if (index >= 0) {
    state.medications = state.medications.map((m) => (m.id === medication.id ? medication : m));
  } else {
    state.medications = [...state.medications, medication];
  }
  notify();
}

export function clearSelection() {
  state.selectedId = null;
  state.isLoadingDetail = false;
  state.detailErrorMessage = null;
  notify();
}

/** Registra uma falha ao buscar o detalhe. */
export function setDetailError(message) {
  state.detailErrorMessage = message;
  state.isLoadingDetail = false;
  notify();
}

// ============================================================
// PASSO 5 — implemente removeMedicationFromState(id)
//   filtra o array tirando o id removido, limpa a seleção, notify()
// ============================================================

// João Carlos
export function removeMedicationFromState(id) {
  state.medications = state.medications.filter((m) => m.id !== id);
  state.selectedId = null;
  state.isLoadingDetail = false;
  state.detailErrorMessage = null;
  notify();
}

