/**
 * ============================================================
 * ORQUESTRAÇÃO
 * ------------------------------------------------------------
 * evento -> ação -> estado -> render -> tela. Sempre nesse sentido.
 * ============================================================
 */
import { listMedications, createMedication, getMedication, removeMedication } from "./api.js";
import {
  subscribe,
  getState,
  setMedications,
  setError,
  addMedication,
  selectMedication,
  setMedicationDetail,
  clearSelection,
  setDetailError,
  removeMedicationFromState,
} from "./state.js";
import { renderCounter, renderLoading, renderError, renderMedicationList, renderDetail } from "./render.js";

const medicationListElement = document.querySelector("#medication-list");
const resultCounterElement = document.querySelector("#result-counter");
const detailPanelElement = document.querySelector("#detail-panel");

const patientNameInput = document.querySelector("#patient-name-input");
const medicationNameInput = document.querySelector("#medication-name-input");
const dosageInput = document.querySelector("#dosage-input");
const routeInput = document.querySelector("#route-input");
const scheduledAtInput = document.querySelector("#scheduled-at-input");
const notesInput = document.querySelector("#notes-input");
const saveButton = document.querySelector("#save-button");
const formFeedbackElement = document.querySelector("#form-feedback");

/** A única função que desenha a tela inteira. */
function renderApp(state) {
  if (state.errorMessage) {
    renderError(state.errorMessage, medicationListElement);
    resultCounterElement.textContent = "";
    return;
  }
  if (state.isLoading) {
    renderLoading(medicationListElement);
    resultCounterElement.textContent = "";
    return;
  }

  // PASSO 2: chame renderMedicationList aqui
  // PASSO 4: chame renderDetail(state, detailPanelElement) aqui

  // João Carlos
  renderMedicationList(state.medications, medicationListElement);
  renderDetail(state, detailPanelElement);

  renderCounter(state.medications.length, resultCounterElement);
}

subscribe(renderApp);

// ============================================================
// PASSO 2 — carga inicial
//   async function start() {
//     renderApp(getState());
//     try {
//       const medications = await listMedications();
//       setMedications(medications);
//     } catch (error) {
//       setError(error.message);
//     }
//   }
//   start();
// ============================================================

// João Carlos
async function start() {
  renderApp(getState());
  try {
    const medications = await listMedications();
    setMedications(medications);
  } catch (error) {
    setError(error.message);
  }
}
start();

// ============================================================
// PASSO 3 — clique em "Cadastrar prescrição"
//   ler os inputs, chamar createMedication(), addMedication(),
//   limpar o formulário, mostrar feedback de sucesso/erro
// ============================================================

// João Carlos
saveButton.addEventListener("click", async () => {
  // Limpa feedback anterior e desabilita o botão temporariamente
  formFeedbackElement.textContent = "";
  formFeedbackElement.className = "med-form__feedback";
  saveButton.disabled = true;

  try {
    const payload = {
      patientName: patientNameInput.value.trim(),
      medicationName: medicationNameInput.value.trim(),
      dosage: dosageInput.value.trim(),
      route: routeInput.value,
      scheduledAt: scheduledAtInput.value,
      notes: notesInput.value.trim() || undefined,
    };

    // Chama API
    const created = await createMedication(payload);
    addMedication(created);

    // Limpa formulário e mostra feedback de sucesso
    clearForm();
    showFormFeedback("Prescrição cadastrada com sucesso!", "success");
  } catch (error) {
    showFormFeedback(error.message, "error");
  } finally {
    saveButton.disabled = false;
  }
});

// ============================================================
// PASSO 4 — clique num cartão da lista (delegação de evento no <ul>)
//   event.target.closest('[data-medication-id]') -> selectMedication(id)
//   -> buscar o detalhe com getMedication(id) -> tratar 404
// ============================================================

// João Carlos
medicationListElement.addEventListener("click", async (event) => {
  const card = event.target.closest("[data-medication-id]");
  if (card) {
    openDetail(Number(card.dataset.medicationId));
  }
});

async function openDetail(id) {
  selectMedication(id);
  try {
    const med = await getMedication(id);
    setMedicationDetail(med);
  } catch (error) {
    setDetailError(error.message);
  }
}

// ============================================================
// PASSO 5 — clique em "Suspender" dentro do painel de detalhe
//   (delegação de evento no #detail-panel, já que ele é redesenhado)
//   removeMedication(id) -> removeMedicationFromState(id)
// ============================================================

// João Carlos
detailPanelElement.addEventListener("click", async (event) => {
  // Clique no botão "Fechar"
  if (event.target.closest("#close-detail-button")) {
    clearSelection();
    return;
  }

  // Clique no botão "Suspender"
  const removeButton = event.target.closest("#remove-button");
  if (removeButton) {
    const selectedId = getState().selectedId;
    if (!selectedId) return;

    removeButton.disabled = true;
    try {
      await removeMedication(selectedId);
      removeMedicationFromState(selectedId);
    } catch (error) {
      alert(error.message);
      removeButton.disabled = false;
    }
  }
});


// Funções auxiliares

// Função auxiliar para exibir mensagens de feedback no formulário
function showFormFeedback(message, type) {
  formFeedbackElement.textContent = message;
  formFeedbackElement.className = `med-form__feedback med-form__feedback--${type}`;
}
function clearForm() {
  patientNameInput.value = "";
  medicationNameInput.value = "";
  dosageInput.value = "";
  routeInput.selectedIndex = 0;
  scheduledAtInput.value = "";
  notesInput.value = "";
}
