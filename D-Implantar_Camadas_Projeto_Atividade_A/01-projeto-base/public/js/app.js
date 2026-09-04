/**
 * ============================================================
 * ORQUESTRAÇÃO
 * ------------------------------------------------------------
 * Este arquivo é o maestro. Ele não guarda estado e não desenha
 * nada sozinho. Ele apenas:
 *
 *   1. liga eventos do usuário às AÇÕES do estado
 *   2. manda a tela ser redesenhada quando o estado muda
 *   3. dispara a carga inicial dos dados
 *
 * O fluxo é sempre o mesmo, e sempre em um sentido só:
 *
 *   evento  ->  ação  ->  estado  ->  render  ->  tela
 *
 * Nunca o contrário. A tela nunca é a fonte da verdade.
 * ============================================================
 */
import {
  listPatients,
  getPatient,
  createPatient,
  deletePatient,
  listEncounters,
  createEncounter,
} from "./api.js";
import {
  subscribe,
  getState,
  setPatients,
  setSearchTerm,
  setOnlyActive,
  setError,
  selectPatient,
  setPatientDetail,
  setDetailNotFound,
  setDetailError,
  backToList,
  setEncounterFormSubmitting,
  setEncounterFormError,
  addEncounter,
  openAddPatientModal,
  closeAddPatientModal,
  setPatientFormSubmitting,
  setPatientFormError,
  addPatient,
  removePatient,
} from "./state.js";
import {
  renderPatientList,
  renderCounter,
  renderLoading,
  renderError,
  renderPatientDetail,
  renderPatientModal,
} from "./render.js";

/* --- Os elementos que existem na página. Buscamos UMA vez. --- */
const listViewElement = document.querySelector("#list-view");
const detailViewElement = document.querySelector("#detail-view");
const modalContainerElement = document.querySelector("#modal-container");
const searchInput = document.querySelector("#search-input");
const onlyActiveInput = document.querySelector("#only-active-input");
const patientListElement = document.querySelector("#patient-list");
const resultCounterElement = document.querySelector("#result-counter");

/**
 * A ÚNICA função que desenha a tela inteira.
 * Ela é chamada toda vez que o estado muda — e apenas por isso.
 */
function renderApp(state) {
  // Renderiza o modal (se estiver aberto ou limpa se fechado)
  renderPatientModal(state, modalContainerElement);

  if (state.view === "detail") {
    listViewElement.style.display = "none";
    detailViewElement.style.display = "block";
    renderPatientDetail(state, detailViewElement);
    return;
  }

  // Visão de Listagem
  detailViewElement.style.display = "none";
  listViewElement.style.display = "block";

  if (state.errorMessage) {
    renderError(state.errorMessage, patientListElement);
    resultCounterElement.textContent = "";
    return;
  }

  if (state.isLoading) {
    renderLoading(patientListElement);
    resultCounterElement.textContent = "";
    return;
  }

  renderPatientList(state.visiblePatients, state.searchTerm, patientListElement);
  renderCounter(state.visiblePatients.length, state.patients.length, resultCounterElement);
}

/* --- Ações assíncronas disparadas por eventos --- */

/** Abre o painel de prontuário e atendimentos de um paciente */
async function openPatient(patientId, updateHistory = true) {
  selectPatient(patientId);

  if (updateHistory) {
    const url = new URL(window.location.href);
    url.searchParams.set("id", String(patientId));
    window.history.pushState({ id: patientId }, "", url);
  }

  try {
    const [patient, encounters] = await Promise.all([
      getPatient(patientId),
      listEncounters(patientId),
    ]);
    setPatientDetail(patient, encounters);
  } catch (error) {
    const isNotFound =
      error.message.includes("404") ||
      error.message.toLowerCase().includes("não encontrado") ||
      error.message.toLowerCase().includes("nao encontrado");

    if (isNotFound) {
      setDetailNotFound();
    } else {
      setDetailError(error.message);
    }
  }
}

/** Retorna para a visão de listagem */
function handleBackToList(updateHistory = true) {
  backToList();
  if (updateHistory) {
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    window.history.pushState({}, "", url);
  }
}

/** Trata a remoção de um paciente */
async function handleDeletePatient(patientId, patientName) {
  const nameDisplay = patientName ? `"${patientName}"` : "este paciente";
  const confirmed = window.confirm(
    `Deseja realmente remover o paciente ${nameDisplay}?\n\nTodos os atendimentos vinculados também serão excluídos. Esta ação não pode ser desfeita.`
  );

  if (!confirmed) return;

  try {
    await deletePatient(patientId);
    removePatient(patientId);

    // Se estávamos na visão de detalhes do paciente removido, limpa a URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("id") === String(patientId)) {
      const url = new URL(window.location.href);
      url.searchParams.delete("id");
      window.history.pushState({}, "", url);
    }
  } catch (error) {
    alert(error.message || "Erro ao remover paciente.");
  }
}

/** Trata o envio do formulário de novo paciente */
async function handlePatientSubmit(form) {
  const formData = new FormData(form);
  const name = (formData.get("name") ?? "").toString().trim();
  const birthDate = (formData.get("birthDate") ?? "").toString().trim();
  const nationalId = (formData.get("nationalId") ?? "").toString().trim();
  const active = form.querySelector("#patient-active")?.checked ?? true;

  setPatientFormSubmitting(true);

  try {
    const newPatient = await createPatient({
      name,
      birthDate,
      nationalId,
      active,
    });
    addPatient(newPatient);
  } catch (error) {
    setPatientFormError(error.message);
  }
}

/** Trata o envio do formulário de novo atendimento */
async function handleEncounterSubmit(form) {
  const currentState = getState();
  const patientId = currentState.selectedPatientId;
  if (!patientId) return;

  const formData = new FormData(form);
  const startedAt = (formData.get("startedAt") ?? "").toString();
  const chiefComplaint = (formData.get("chiefComplaint") ?? "").toString();
  const notes = (formData.get("notes") ?? "").toString();

  setEncounterFormSubmitting(true);

  try {
    const newEncounter = await createEncounter(patientId, {
      startedAt,
      chiefComplaint,
      notes: notes.trim() === "" ? null : notes,
    });
    addEncounter(newEncounter);
  } catch (error) {
    setEncounterFormError(error.message);
  }
}

/* --- Eventos do usuário viram AÇÕES, nunca alterações diretas de DOM --- */
searchInput.addEventListener("input", (event) => {
  setSearchTerm(event.target.value);
});

onlyActiveInput.addEventListener("change", (event) => {
  setOnlyActive(event.target.checked);
});

// Ações na barra de ferramentas e lista de pacientes
listViewElement.addEventListener("click", (event) => {
  // Abrir modal de novo paciente
  const openModalBtn = event.target.closest("[data-action='open-add-patient-modal']");
  if (openModalBtn) {
    openAddPatientModal();
    return;
  }

  // Ver atendimentos / detalhes do paciente
  const viewBtn = event.target.closest("[data-action='view-patient']");
  if (viewBtn) {
    const patientId = viewBtn.dataset.patientId;
    if (patientId) {
      openPatient(Number(patientId));
    }
    return;
  }
});

// Ações no painel de detalhes (botão voltar e botão remover paciente)
detailViewElement.addEventListener("click", (event) => {
  const backBtn = event.target.closest("[data-action='back-to-list']");
  if (backBtn) {
    event.preventDefault();
    handleBackToList();
    return;
  }

  const deleteBtn = event.target.closest("[data-action='delete-patient']");
  if (deleteBtn) {
    event.preventDefault();
    const patientId = deleteBtn.dataset.patientId;
    const patientName = deleteBtn.dataset.patientName;
    if (patientId) {
      handleDeletePatient(Number(patientId), patientName);
    }
    return;
  }
});

// Submissão do formulário de atendimento
detailViewElement.addEventListener("submit", (event) => {
  if (event.target.id === "encounter-form") {
    event.preventDefault();
    handleEncounterSubmit(event.target);
  }
});

// Ações no modal de cadastro de paciente (fechar e submit)
modalContainerElement.addEventListener("click", (event) => {
  const closeBtn = event.target.closest("[data-action='close-add-patient-modal']");
  const isBackdrop = event.target.classList.contains("patient-modal-backdrop");
  if (closeBtn || isBackdrop) {
    closeAddPatientModal();
  }
});

modalContainerElement.addEventListener("submit", (event) => {
  if (event.target.id === "patient-form") {
    event.preventDefault();
    handlePatientSubmit(event.target);
  }
});

// Teclado: fechar modal ao pressionar Escape
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && getState().isAddPatientModalOpen) {
    closeAddPatientModal();
  }
});

// Navegação pelo histórico do navegador (botão voltar/avançar)
window.addEventListener("popstate", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (id) {
    openPatient(Number(id), false);
  } else {
    handleBackToList(false);
  }
});

/* --- Sempre que o estado mudar, a tela é redesenhada --- */
subscribe(renderApp);

/* --- Carga inicial --- */
async function start() {
  const params = new URLSearchParams(window.location.search);
  const initialId = params.get("id");

  if (initialId) {
    openPatient(Number(initialId), false);
  } else {
    renderApp(getState());
  }

  try {
    const patients = await listPatients();
    setPatients(patients);
  } catch (error) {
    setError(error.message);
  }
}

start();

