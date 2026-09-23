import {
  AlertService,
  formatearFechaCorta,
  apiRequest,
  ROUTES,
  crearGestorFormulario,
} from "../../../shared/js/globalscripts.js";

let DialogFormClassroom = null;
let DialogInfoClassroom = null;
let DialogBuscarAula = null;
let formClassroom = null;
let inputSearch = null;
let anioLectivoActivo = null;
let ultimoAnio = null;
let paginatorList = null;

// Este formulario usa custom-autocomplete además de los tipos habituales,
// por eso se pasa selectorCampos explícito.
const gestorForm = crearGestorFormulario(() => formClassroom, {
  selectorCampos: "custom-select, custom-text-field, custom-autocomplete",
});

async function init() {
  await obtenerAnioActivo();
  await obtenerUltimoAnio();

  DialogFormClassroom = document.getElementById("DialogFormClassroom");
  DialogInfoClassroom = document.getElementById("DialogInfoClassroom");
  DialogBuscarAula = document.getElementById("DialogBuscarAula");

  if (document.getElementById("contentList")) {
    Listar();
  }

  paginatorList = document.getElementById("paginatorList");
  if (paginatorList) {
    paginatorList.addEventListener("page-change", (e) => {
      const container = document.getElementById("contentList");
      container.innerHTML = "";
      e.detail.data.forEach(renderRows);
      // ✅ Scroll al inicio
      container.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  formClassroom = document.getElementById("formClassroom");
  if (formClassroom && !formClassroom.hasSubmitListener) {
    formClassroom.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateForm()) {
        console.log("Formulario no válido");
        return;
      }
      GuardaryEditar();
    });
    formClassroom.hasSubmitListener = true;
  }

  const docenteAutocomplete = document.querySelector(
    "custom-autocomplete[name='idDocente']",
  );
  if (docenteAutocomplete) {
    const opciones = await getDocente();
    docenteAutocomplete.setOptions(opciones);
  }

  const nivelSelect = document.querySelector("custom-select[name='idNivel']");
  const gradoSelect = document.querySelector("custom-select[name='idGrado']");
  if (nivelSelect) {
    const opciones = await getNivel();
    nivelSelect.setOptions(opciones);

    nivelSelect.addEventListener("change", async (e) => {
      const idNivel = e.detail.value;

      if (!gradoSelect) return;

      gradoSelect.initInput();

      if (!idNivel) {
        gradoSelect.setOptions([]);
        return;
      }

      const opcionesGrado = await getGrado(idNivel);
      gradoSelect.setOptions(opcionesGrado);
    });
  }

  const turnoSelect = document.querySelector("custom-select[name='idTurno']");
  if (turnoSelect) {
    const opciones = await getTurno();
    turnoSelect.setOptions(opciones);
  }

  inputSearch = document.querySelector("custom-text-field[name='searchText']");
  if (inputSearch) {
    inputSearch.addEventListener("input", InputSearch);
  }
}
async function Listar() {
  document.getElementById("contentList").innerHTML = "";
  const json = await apiRequest(ROUTES.AULA, "listar");
  if (json.status) {
    paginatorList.setData(json.data);
  } else {
    document.getElementById("contentList").innerHTML = `
        <div class="p-5 text-center text-gray-500">
          <i class="bi bi-emoji-astonished text-4xl mb-3 block"></i>
          <p class="font-medium">${json.msg || "No se encontraron datos"}</p>
          <p class="text-sm mt-2 text-gray-400">No se encontraron aulas registradas</p>
        </div>
      `;
  }
}

async function Buscar() {
  document.getElementById("contentList").innerHTML = "";
  let searchText = inputSearch.getValue().trim();
  try {
    let formData = new FormData();
    formData.append("textsearch", searchText);
    let resp = await fetch("../../../app/routes/aula.route.php?op=buscar", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      body: formData,
    });
    let json = await resp.json();
    if (json.status) {
      let data = json.data;
      if (paginatorList) {
        paginatorList.setData(data);
      } else {
        data.forEach(renderRows);
      }
    } else {
      if (paginatorList) {
        paginatorList.setData([]);
      }
      document.getElementById("contentList").innerHTML = `
        <div class="p-5 text-center text-gray-500">
          <i class="bi bi-search text-4xl mb-3 block"></i>
          <p class="font-medium">${json.msg || "No se encontraron datos"}</p>
          ${
            searchText
              ? `<p class="text-sm mt-2 text-gray-400">Búsqueda: "${searchText}"</p>`
              : ""
          }
        </div>
      `;
    }
  } catch (error) {
    console.error(error);
  }
}

function InputSearch() {
  let searchText = inputSearch.getValue().trim();
  if (searchText === "") {
    Listar();
  } else {
    Buscar();
  }
}

async function ObtenerAula(id) {
  const json = await apiRequest(ROUTES.AULA, "mostrar", { id });
  if (!json.status) {
    AlertService.error("Error", json.msg || "No se encontraron datos");
    return null;
  }
  return json.data;
}

async function Mostrar(id) {
  const aula = await ObtenerAula(id);
  if (!aula) return;
  document.getElementById("idAulaLectiva").value = aula.idAulaLectiva;
  document.getElementById("idAula").value = aula.idAula;
  gestorForm.poblar(aula);
}

async function GuardaryEditar() {
  let form = document.getElementById("formClassroom");
  const data = new FormData(form);
  data.append("idAnioLectivo", anioLectivoActivo.id_aniolectivo);

  const json = await apiRequest(ROUTES.AULA, "guardaryeditar", data);

  if (json.status) {
    AlertService.success("¡Exito!", json.msg);
    closeModalForm();
  } else {
    alert("Error al guardar:" + json.msg);
  }
}

async function verDetalles(id) {
  try {
    const formData = new FormData();
    formData.append("id", id);
    let resp = await fetch("../../../app/routes/aula.route.php?op=mostrar", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      body: formData,
    });
    let json = await resp.json();
    if (json.status) {
      poblarInfoAula(json.data);
    }
  } catch (error) {
    console.error(error);
  }
}

function poblarInfoAula(data) {
  document.getElementById("descGradoAula").textContent = data.descGrado || "-";
  document.getElementById("seccAula").textContent = data.seccionAula || "-";
  document.getElementById("descNivelAula").textContent = data.descNivel || "-";
  document.getElementById("nomDocenteAula").textContent =
    data.nomDocente || "Sin tutor asignado";
}

window.onDelete = async function (id) {
  AlertService.confirm(
    "¿Estás seguro?",
    "Esta acción no se puede deshacer.",
  ).then(async (result) => {
    if (result) {
      let formData = new FormData();
      formData.append("id", id);
      try {
        let resp = await fetch(
          "../../../app/routes/aula.route.php?op=eliminar",
          {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            body: formData,
          },
        );
        let json = await resp.json();
        if (json.status) {
          AlertService.success("¡Éxito!", json.msg);
          Listar();
        } else {
          AlertService.error("Error", json.msg);
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
};

async function getDocente() {
  const json = await apiRequest(ROUTES.GENERIC_LIST, "docente");
  if (json.status) {
    let data = json.data;
    let ops = data.map((p) => ({ value: p.id_docente, desc: p.nom_docente }));
    return ops;
  }
}

async function getNivel() {
  const json = await apiRequest(ROUTES.GENERIC_LIST, "nivel");
  if (json.status) {
    let data = json.data;
    let ops = data.map((p) => ({ value: p.id_nivel, desc: p.desc_nivel }));
    return ops;
  }
}

async function getGrado(id) {
  const json = await apiRequest(ROUTES.GENERIC_LIST, "grado", { idNivel: id });
  if (json.status) {
    let data = json.data;
    let ops = data.map((p) => ({ value: p.id_grado, desc: p.desc_grado }));
    return ops;
  }
}

async function getTurno() {
  const json = await apiRequest(ROUTES.GENERIC_LIST, "turno");
  if (json.status) {
    let data = json.data;
    let ops = data.map((p) => ({ value: p.id_turno, desc: p.nom_turno }));
    return ops;
  }
}

async function getAulas() {
  const json = await apiRequest(ROUTES.AULA, "listaraulas");
  if (json.status) {
    let data = json.data;
    return data;
  }
  return [];
}

async function obtenerAnioActivo() {
  const json = await apiRequest(ROUTES.ANIO_LECTIVO, "obteneranioactivo");
  if (json.status) {
    anioLectivoActivo = json.data;
  } else {
    anioLectivoActivo = null;
  }
}

async function obtenerUltimoAnio() {
  const json = await apiRequest(ROUTES.ANIO_LECTIVO, "obtenerultimoanio");
  if (json.status) {
    ultimoAnio = json.data;
  } else {
    ultimoAnio = null;
  }
}

function renderRows(item) {
  let existingRow = document.getElementById("row_" + item.id_aula);
  if (existingRow) {
    existingRow.remove();
  }
  let newdiv = document.createElement("div");
  newdiv.id = "row_" + item.id_aula;
  newdiv.className =
    "flex lg:flex-row flex-col gap-5 p-5 hover:bg-neutral-100 duration-300 ease-linear justify-between";
  newdiv.innerHTML = `
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-3 items-center">
        <h5 class="font-bold text-lg text-gray-700">${item.desc_grado}</h5>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${
          item.seccion_aula !== "UNICA"
            ? "bg-purple-300/40 text-purple-700"
            : "bg-orange-300/40 text-orange-700"
        }">${item.seccion_aula}</span>
      </div>
      <p class="text-neutral-500 text-sm">Tutor: ${item.nom_docente}</p>
      <div class="inline-flex self-start items-center gap-2 px-2 py-0.5 rounded-full ${item.id_nivel === 1 ? "bg-green-100" : "bg-blue-100"}">
        <span class="w-2 h-2 rounded-full ${item.id_nivel === 1 ? "bg-green-500" : "bg-sky-500"}"></span>
        <span class="text-xs font-semibold ${item.id_nivel === 1 ? "text-green-700" : "text-sky-700"} ">${item.desc_nivel}</span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <custom-button-fab
        icon="bi bi-eye-fill"
        btn-class="bg-sky-500 text-white hover:bg-sky-700"
        tooltip="Ver información"
        onclick="openModalInfo(${item.id_aulalectiva})">
      </custom-button-fab>
      <custom-button-fab
        icon="bi bi-tag-fill"
        btn-class="bg-purple-500 text-white hover:bg-purple-700"
        tooltip="Editar"
        onclick="openModalForm(${item.id_aulalectiva})">
      </custom-button-fab>
      <custom-button-fab
        icon="bi bi-trash-fill"
        btn-class="bg-red-500 text-white hover:bg-red-700"
        tooltip="Eliminar"
        onclick="onDelete(${item.id_aulalectiva})">
      </custom-button-fab>
    </div>
  `;
  document.getElementById("contentList").appendChild(newdiv);
}

window.openModalForm = async function (id = null) {
  if (!anioLectivoActivo) {
    AlertService.warning(
      "¡Atención!",
      "No hay un año lectivo activo o se encuentra vencido. Por favor, configure un año lectivo activo antes de continuar.",
    );
    return;
  }
  document.getElementById("infoAnioActivo").textContent =
    anioLectivoActivo.anio;
  document.getElementById("infoVigenciaActiva").textContent =
    `${formatearFechaCorta(anioLectivoActivo.fecha_inicio)} - ${formatearFechaCorta(anioLectivoActivo.fecha_fin)}`;

  if (!DialogFormClassroom) return;
  ModalManager.open(DialogFormClassroom);
  setTimeout(() => {
    if (id === null) {
      initInput();
    } else {
      Mostrar(id);
    }
  });
};

window.closeModalForm = function () {
  if (!DialogFormClassroom) return;
  initInput();
  DialogFormClassroom.close();
};

window.openModalInfo = function (id) {
  if (id === undefined || id === null) return;
  if (!DialogInfoClassroom) return;
  verDetalles(id);
  DialogInfoClassroom.open();
};

window.closeModalInfo = function () {
  if (!DialogInfoClassroom) return;
  DialogInfoClassroom.close();
};

window.openModalBuscarAula = async function () {
  if (!DialogBuscarAula) return;
  DialogBuscarAula.open();

  const listContainer = document.getElementById("listAulasDisponibles");
  const emptyMsg = document.getElementById("emptyAulasMsg");
  const countMsg = document.getElementById("countAulasDisponibles");
  const searchInput = document.getElementById("searchAula");

  listContainer.innerHTML = `
    <div class="text-center text-neutral-400 py-6">
      <p class="text-sm">Cargando aulas...</p>
    </div>
  `;
  emptyMsg.classList.add("hidden");

  const aulas = await getAulas();
  window._aulasDisponiblesCache = aulas;

  renderAulasDisponibles(aulas);

  if (searchInput && !searchInput.hasSearchListener) {
    searchInput.addEventListener("input", () => {
      const texto = searchInput.value.trim().toLowerCase();
      const filtradas = (window._aulasDisponiblesCache || []).filter((a) =>
        `${a.desc_grado} ${a.seccion_aula} ${a.desc_nivel}`
          .toLowerCase()
          .includes(texto),
      );
      renderAulasDisponibles(filtradas);
    });
    searchInput.hasSearchListener = true;
  }
};

function renderAulasDisponibles(aulas) {
  const listContainer = document.getElementById("listAulasDisponibles");
  const emptyMsg = document.getElementById("emptyAulasMsg");
  const countMsg = document.getElementById("countAulasDisponibles");

  listContainer.innerHTML = "";

  if (!aulas || aulas.length === 0) {
    emptyMsg.classList.remove("hidden");
    countMsg.textContent = "";
    return;
  }

  emptyMsg.classList.add("hidden");
  countMsg.textContent = `${aulas.length} aula(s) disponible(s)`;

  const estilosPorNivel = {
    1: {
      bg: "bg-green-100",
      text: "text-green-600",
      badgeText: "text-green-700",
    },
    2: { bg: "bg-sky-100", text: "text-sky-600", badgeText: "text-sky-700" },
    3: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      badgeText: "text-purple-700",
    },
  };

  aulas.forEach((aula) => {
    const estilo = estilosPorNivel[aula.id_nivel] || {
      bg: "bg-gray-100",
      text: "text-gray-600",
      badgeText: "text-gray-700",
    };

    const row = document.createElement("div");
    row.className =
      "flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-neutral-50 hover:shadow-sm transition group";
    row.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full flex items-center justify-center ${estilo.bg}">
          <i class="bi bi-door-open ${estilo.text}"></i>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-700">
            ${aula.desc_grado} <span class="font-normal text-gray-500">"${aula.seccion_aula}"</span>
          </p>
          <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${estilo.bg} ${estilo.badgeText}">${aula.desc_nivel}</span>
        </div>
      </div>
      <i class="bi bi-chevron-right text-neutral-300 group-hover:text-neutral-500 transition"></i>
    `;
    row.addEventListener("click", () => seleccionarAulaExistente(aula));
    listContainer.appendChild(row);
  });
}

function seleccionarAulaExistente(aula) {
  document.getElementById("idAula").value = aula.id_aula;
  document.getElementById("idAulaLectiva").value = "";

  const nivelSelect = document.querySelector("custom-select[name='idNivel']");
  const gradoSelect = document.querySelector("custom-select[name='idGrado']");
  const seccionField = document.querySelector(
    "custom-text-field[name='seccionAula']",
  );
  const docenteAutocomplete = document.querySelector(
    "custom-autocomplete[name='idDocente']",
  );
  const turnoSelect = document.querySelector("custom-select[name='idTurno']");

  if (nivelSelect) {
    nivelSelect.setOptions([{ value: aula.id_nivel, desc: aula.desc_nivel }]);
    nivelSelect.setValue(aula.id_nivel);
    nivelSelect.setDisabled(true);
  }
  if (gradoSelect) {
    gradoSelect.setOptions([{ value: aula.id_grado, desc: aula.desc_grado }]);
    gradoSelect.setValue(aula.id_grado);
    gradoSelect.setDisabled(true);
  }
  if (seccionField) {
    seccionField.setValue(aula.seccion_aula);
    seccionField.setDisabled(true);
  }
  if (docenteAutocomplete) {
    docenteAutocomplete.initInput();
    docenteAutocomplete.setDisabled(false);
  }
  if (turnoSelect) {
    turnoSelect.initInput();
    turnoSelect.setDisabled(false);
  }

  closeModalBuscarAula();
}

window.registrarAulaNueva = function () {
  document.getElementById("idAula").value = "";
  document.getElementById("idAulaLectiva").value = "";

  const nivelSelect = document.querySelector("custom-select[name='idNivel']");
  const gradoSelect = document.querySelector("custom-select[name='idGrado']");
  const seccionField = document.querySelector(
    "custom-text-field[name='seccionAula']",
  );
  const docenteAutocomplete = document.querySelector(
    "custom-autocomplete[name='idDocente']",
  );
  const turnoSelect = document.querySelector("custom-select[name='idTurno']");

  if (nivelSelect) {
    nivelSelect.initInput();
    getNivel().then((ops) => nivelSelect.setOptions(ops));
    nivelSelect.setDisabled(false);
  }
  if (gradoSelect) {
    gradoSelect.initInput();
    gradoSelect.setOptions([]);
    gradoSelect.setDisabled(false);
  }
  if (seccionField) {
    seccionField.initInput();
    seccionField.setValue("UNICA");
    seccionField.setDisabled(false);
  }
  if (docenteAutocomplete) {
    docenteAutocomplete.initInput();
    docenteAutocomplete.setDisabled(false);
  }
  if (turnoSelect) {
    turnoSelect.initInput();
    turnoSelect.setDisabled(false);
  }

  closeModalBuscarAula();
};

window.closeModalBuscarAula = function () {
  if (!DialogBuscarAula) return;
  DialogBuscarAula.close();
};

function initInput() {
  document.getElementById("idAulaLectiva").value = "";
  document.getElementById("idAula").value = "";
  gestorForm.initInput();
  gestorForm.campos.forEach((campo) => {
    if (typeof campo.setDisabled === "function") {
      campo.setDisabled(true);
    }
  });
}

function validateForm() {
  return gestorForm.validar();
}

init();
