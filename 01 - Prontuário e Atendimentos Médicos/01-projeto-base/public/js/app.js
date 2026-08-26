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
import { listPatients, getPatient, listEncounters, createEncounter } from "./api.js";
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
} from "./state.js";
import {
  renderPatientList,
  renderCounter,
  renderLoading,
  renderError,
  renderPatientDetail,
} from "./render.js";

/* --- Os elementos que existem na página. Buscamos UMA vez. --- */
const listViewElement = document.querySelector("#list-view");
const detailViewElement = document.querySelector("#detail-view");
const searchInput = document.querySelector("#search-input");
const onlyActiveInput = document.querySelector("#only-active-input");
const patientListElement = document.querySelector("#patient-list");
const resultCounterElement = document.querySelector("#result-counter");

/**
 * A ÚNICA função que desenha a tela inteira.
 * Ela é chamada toda vez que o estado muda — e apenas por isso.
 */
function renderApp(state) {
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

// Clique na lista para abrir o prontuário
patientListElement.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action='view-patient']");
  if (!target) return;

  const patientId = target.dataset.patientId;
  if (patientId) {
    openPatient(Number(patientId));
  }
});

// Ações no painel de detalhes (botão voltar)
detailViewElement.addEventListener("click", (event) => {
  const backBtn = event.target.closest("[data-action='back-to-list']");
  if (backBtn) {
    event.preventDefault();
    handleBackToList();
  }
});

// Submissão do formulário de atendimento
detailViewElement.addEventListener("submit", (event) => {
  if (event.target.id === "encounter-form") {
    event.preventDefault();
    handleEncounterSubmit(event.target);
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
