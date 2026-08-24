/**
 * ============================================================
 * ESTADO
 * ------------------------------------------------------------
 * Este arquivo guarda a resposta para: "o que a tela precisa
 * mostrar agora?"
 *
 * REGRA DE OURO: este arquivo NÃO conhece o DOM.
 * Se você escrever `document` aqui, algo saiu do lugar.
 * Teste mental: se eu apagasse o index.html inteiro, este
 * arquivo ainda faria sentido? Tem que fazer.
 * ============================================================
 */

/**
 * O estado. Uma única fonte da verdade.
 *
 * Repare no que NÃO está aqui: a lista filtrada.
 * A lista filtrada é CONSEQUÊNCIA de `patients` + `searchTerm`.
 * Guardar consequência no estado é criar duas verdades que
 * um dia vão discordar entre si.
 */
const state = {
  view: "list", // "list" | "detail"
  patients: [],
  searchTerm: "",
  onlyActive: false,
  isLoading: true,
  errorMessage: null,

  // Detalhe do paciente selecionado
  selectedPatientId: null,
  selectedPatient: null,
  encounters: [],
  isLoadingDetail: false,
  detailError: null,
  isDetailNotFound: false,

  // Formulário de atendimento
  encounterFormSubmitting: false,
  encounterFormError: null,
};

/** Quem quer ser avisado quando o estado mudar. */
const listeners = [];

/**
 * Registra um interessado nas mudanças de estado.
 * @param {(state: object) => void} listener
 */
export function subscribe(listener) {
  listeners.push(listener);
}

/** Avisa todo mundo que o estado mudou. */
function notify() {
  const snapshot = getState();
  listeners.forEach((listener) => listener(snapshot));
}

/**
 * Devolve uma FOTOGRAFIA do estado, já com os dados derivados.
 * Devolvemos uma cópia para que ninguém de fora consiga alterar
 * o estado por acidente.
 */
export function getState() {
  return {
    ...state,
    selectedPatient: state.selectedPatient
      ? {
        ...state.selectedPatient,
        age: calculateAge(state.selectedPatient.birthDate),
      }
      : null,
    visiblePatients: getVisiblePatients(),
  };
}

/* ------------------------------------------------------------
   DADOS DERIVADOS
   ------------------------------------------------------------ */

/**
 * Calcula quais pacientes devem aparecer, combinando os filtros.
 * Isto é uma função pura: mesma entrada, mesma saída, sem efeito
 * colateral. Fácil de testar, fácil de confiar.
 */
export function getVisiblePatients() {
  const term = normalizeText(state.searchTerm);

  return state.patients
    .filter((patient) => {
      const matchesName = normalizeText(patient.name).includes(term);
      const matchesCns = normalizeText(patient.nationalId).includes(term);
      const matchesTerm = matchesName || matchesCns;
      const matchesStatus = state.onlyActive ? patient.active : true;
      return matchesTerm && matchesStatus;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")) // Ordena os pacientes por nome em ordem alfabética
    .map((patient) => ({
      ...patient,
      age: calculateAge(patient.birthDate), // Injeta a idade como dado derivado!
    }));

  // João Carlos: anotações
  // o states.js cuida de tudo relacionado ao estado, então o melhor lugar
  // para ordenar os pacientes é aqui na função getVisiblePatients().
  // Além de organizar, ela é chamada toda vez que o estado muda, então
  // os pacientes estarão sempre ordenados.
}


/* ------------------------------------------------------------
   AÇÕES - as únicas autorizadas a mudar o estado
   ------------------------------------------------------------ */

/**
 * TODO STATE-1 (Encontro 1, Prática 1)
 * Guarde a lista recebida no estado, marque que o carregamento
 * terminou, limpe qualquer mensagem de erro anterior — e avise
 * os interessados.
 *
 * Três linhas de atribuição e uma chamada de notify().
 */
export function setPatients(patients) {
  // escreva aqui: 
  state.patients = patients;  // Adiciona a lista de pacientes ao estado.
  state.isLoading = false;    // Marca que o carregamento terminou.
  state.errorMessage = null;  // Limpa qualquer mensagem de erro anterior.
  notify();  // Notifica os interessados sobre a mudança no estado.
}

/**
 * TODO STATE-2 (Encontro 1, Prática 2)
 * Guarde o termo de busca e avise os interessados.
 */
export function setSearchTerm(term) {
  // escreva aqui:
  state.searchTerm = term;  // Adiciona o termo de busca ao estado.
  notify();  // Notifica os interessados sobre a mudança no estado.
}

/** Liga/desliga o filtro de pacientes ativos. */
export function setOnlyActive(onlyActive) {
  state.onlyActive = onlyActive;
  notify();
}

/** Registra uma falha para a tela poder mostrar. */
export function setError(message) {
  state.errorMessage = message;
  state.isLoading = false;
  notify();
}

/** Inicia a navegação para o detalhe de um paciente */
export function selectPatient(patientId) {
  state.view = "detail";
  state.selectedPatientId = patientId;
  state.selectedPatient = null;
  state.encounters = [];
  state.isLoadingDetail = true;
  state.detailError = null;
  state.isDetailNotFound = false;
  state.encounterFormError = null;
  state.encounterFormSubmitting = false;
  notify();
}

/** Preenche o paciente e seus atendimentos carregados da API */
export function setPatientDetail(patient, encounters) {
  state.selectedPatient = patient;
  state.encounters = encounters;
  state.isLoadingDetail = false;
  state.detailError = null;
  state.isDetailNotFound = false;
  notify();
}

/** Registra que o paciente não foi encontrado (404) */
export function setDetailNotFound() {
  state.selectedPatient = null;
  state.encounters = [];
  state.isLoadingDetail = false;
  state.isDetailNotFound = true;
  state.detailError = null;
  notify();
}

/** Registra erro ao carregar o detalhe do paciente */
export function setDetailError(message) {
  state.isLoadingDetail = false;
  state.detailError = message;
  notify();
}

/** Volta para a visualização da lista */
export function backToList() {
  state.view = "list";
  state.selectedPatientId = null;
  state.selectedPatient = null;
  state.encounters = [];
  state.isLoadingDetail = false;
  state.detailError = null;
  state.isDetailNotFound = false;
  state.encounterFormError = null;
  state.encounterFormSubmitting = false;
  notify();
}

/** Define o estado de submissão do formulário de atendimento */
export function setEncounterFormSubmitting(isSubmitting) {
  state.encounterFormSubmitting = isSubmitting;
  notify();
}

/** Define mensagem de erro vinda do backend para o formulário */
export function setEncounterFormError(errorMessage) {
  state.encounterFormError = errorMessage;
  state.encounterFormSubmitting = false;
  notify();
}

/** Adiciona o novo atendimento criado à lista */
export function addEncounter(encounter) {
  state.encounters = [encounter, ...state.encounters];
  state.encounterFormError = null;
  state.encounterFormSubmitting = false;
  notify();
}

// Funções auxiliares

/**
 * Remove acentos e converte para minúsculas para comparações insensíveis a acentos e maiúsculas/minúsculas.
 * Ex: "José" -> "jose", "Vitória" -> "vitoria"
 */
function normalizeText(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Calcula a idade em anos a partir de "AAAA-MM-DD" */
function calculateAge(isoDate) {
  if (!isoDate) return 0;
  const [year, month, day] = isoDate.split("-").map(Number);
  const today = new Date();

  let age = today.getFullYear() - year;
  const currentMonth = today.getMonth() + 1; // getMonth() vai de 0 a 11
  const currentDay = today.getDate();

  // Se ainda não chegou o mês ou o dia do aniversário neste ano, subtrai 1
  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age--;
  }

  return age;
}


