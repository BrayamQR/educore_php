import {
  AlertService,
  formatearFecha,
} from "../../../shared/js/globalscripts.js";

let DialogFormStudent = null;
let DialogGenararQRMasivo = null;
let DialogInfoStudent = null;
let DialogGenerarCarnet = null;
let formStudent = null;
let inputSearch = null;
let inputSearchQR = null;
let campos = [];
let estudiantesSeleccionados = new Set();
let todosLosEstudiantesQR = [];
let paginatorCarnet = null;
let estudiantesSeleccionadosCarnet = new Set();
let todosLosEstudiantesCarnet = [];

// ✅ Variables para paginadores
let paginatorList = null;
let paginatorQR = null;

function init() {
  DialogFormStudent = document.getElementById("DialogFormStudent");
  DialogGenararQRMasivo = document.getElementById("DialogGenararQRMasivo");
  DialogInfoStudent = document.getElementById("DialogInfoStudent");
  DialogGenerarCarnet = document.getElementById("DialogGenerarCarnet");

  // ✅ Inicializar paginador principal
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

  // ✅ Inicializar paginador del modal QR
  paginatorQR = document.getElementById("paginatorQR");
  if (paginatorQR) {
    paginatorQR.addEventListener("page-change", (e) => {
      const container = document.getElementById("contentListGenerarQR");
      container.innerHTML = "";
      e.detail.data.forEach(renderRowsGenerarQR);
      // ✅ Scroll directo al contenedor (CORREGIDO)
      container.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  paginatorCarnet = document.getElementById("paginatorCarnet");
  if (paginatorCarnet) {
    paginatorCarnet.addEventListener("page-change", (e) => {
      const container = document.getElementById("contentListCarnet");
      container.innerHTML = "";
      e.detail.data.forEach(renderRowsCarnet);
      container.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (document.getElementById("contentList")) {
    Listar();
  }

  formStudent = document.getElementById("formStudent");
  if (formStudent && !formStudent.hasSubmitListener) {
    formStudent.addEventListener("submit", function (e) {
      e.preventDefault();
      campos = formStudent.querySelectorAll(
        "custom-select, custom-text-field, custom-datepicker, custom-autocomplete",
      );
      if (!validateForm()) {
        console.log("Formulario no válido 🚫");
        return;
      }
      GuardaryEditar();
    });
    formStudent.hasSubmitListener = true;
  }

  inputSearch = document.querySelector("custom-text-field[name='searchText']");
  if (inputSearch) {
    inputSearch.addEventListener("input", InputSearch);
  }
}

// ✅ Listar con paginador
async function Listar() {
  document.getElementById("contentList").innerHTML = "";

  try {
    let resp = await fetch(
      "../../../app/routes/estudiante.route.php?op=listar",
    );
    let json = await resp.json();

    if (json.status) {
      // ✅ Pasar datos al paginador
      paginatorList.setData(json.data);
    } else {
      document.getElementById("contentList").innerHTML = `
        <div class="p-5 text-center text-gray-500">
          <i class="bi bi-emoji-astonished text-4xl mb-3 block"></i>
          <p class="font-medium">${json.msg || "No se encontraron datos"}</p>
          <p class="text-sm mt-2 text-gray-400">No se encontraron alumnos registrados</p>
        </div>
      `;
    }
  } catch (error) {
    console.error(error);
  }
}

// ✅ Listar sin QR con paginador
async function ListarSinQR() {
  document.getElementById("contentListGenerarQR").innerHTML = "";

  try {
    let resp = await fetch(
      "../../../app/routes/estudiante.route.php?op=listarsinqr",
    );
    let json = await resp.json();

    if (json.status) {
      let data = json.data;
      todosLosEstudiantesQR = data;
      document.getElementById("totalMenusAvailable").textContent = data.length;

      // ✅ Pasar datos al paginador
      paginatorQR.setData(data);

      // Inicializar búsqueda
      inicializarBusquedaQR();
      updateCounters();
    } else {
      document.getElementById("contentListGenerarQR").innerHTML = `
        <div class="p-5 text-center text-gray-500">
          <i class="bi bi-emoji-astonished text-4xl mb-3 block"></i>
          <p class="font-medium">${json.msg || "No se encontraron datos"}</p>
          <p class="text-sm mt-2 text-gray-400">No se encontraron alumnos sin código QR</p>
        </div>
      `;
      document.getElementById("totalMenusAvailable").textContent = "0";
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function ListarCarnet() {
  document.getElementById("contentListCarnet").innerHTML = "";
  try {
    let resp = await fetch(
      "../../../app/routes/estudiante.route.php?op=listar",
    );
    let json = await resp.json();
    if (json.status) {
      todosLosEstudiantesCarnet = json.data;
      document.getElementById("totalCarnetAvailable").textContent =
        json.data.length;
      paginatorCarnet.setData(json.data);
      inicializarBusquedaCarnet();
      updateCountersCarnet();
    }
  } catch (error) {
    console.error(error);
  }
}

// ✅ Modificar filtro para que trabaje con el paginador
function filtrarEstudiantesQR(searchText) {
  if (!searchText) {
    paginatorQR.setData(todosLosEstudiantesQR); // 👈 restaura los originales
    return;
  }

  const datosFiltrados = todosLosEstudiantesQR.filter((item) => {
    // 👈 filtra desde los originales
    const searchData =
      `${item.nom_estudiante} ${item.apa_estudiante} ${item.ama_estudiante} ${item.desc_grado} ${item.seccion_aula} ${item.doc_estudiante}`.toLowerCase();
    return searchData.includes(searchText);
  });

  if (datosFiltrados.length > 0) {
    paginatorQR.setData(datosFiltrados);
  } else {
    paginatorQR.setData([]);
    document.getElementById("contentListGenerarQR").innerHTML = `
      <div class="p-5 text-center text-gray-500">
        <i class="bi bi-search text-4xl mb-3 block"></i>
        <p class="font-medium">No se encontraron estudiantes</p>
        <p class="text-sm mt-2 text-gray-400">Búsqueda: "${searchText}"</p>
      </div>
    `;
  }
}

// Resto de las funciones permanecen igual...
function renderRows(item) {
  let existingRow = document.getElementById("row_" + item.id_estudiante);
  if (existingRow) {
    existingRow.remove();
  }

  const gradeColors = {
    1: "bg-sky-200/70 text-sky-800",
    2: "bg-emerald-200/70 text-emerald-800",
    3: "bg-violet-200/70 text-violet-800",
    4: "bg-amber-200/70 text-amber-900",
    5: "bg-cyan-200/70 text-cyan-900",
    6: "bg-yellow-200/70 text-yellow-900",
    7: "bg-orange-200/70 text-orange-900",
    8: "bg-rose-200/70 text-rose-900",
    9: "bg-amber-300/70 text-amber-950",
  };

  let newdiv = document.createElement("div");
  newdiv.id = "row_" + item.id_estudiante;
  newdiv.className =
    "flex lg:flex-row flex-col gap-5 p-5 hover:bg-neutral-100 duration-300 ease-linear justify-between";

  newdiv.innerHTML = `
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-3 items-center">
        <h5 class="font-bold text-lg text-gray-700">
          ${item.apa_estudiante} ${item.ama_estudiante} ${item.nom_estudiante}
        </h5>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${
          item.id_tipodocumento === 1
            ? "bg-blue-200/50 text-blue-700"
            : "bg-green-200/50 text-green-700"
        }">
          Cod.: ${item.doc_estudiante}
        </span>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${
          gradeColors[item.id_grado] || "bg-gray-200 text-gray-600"
        }">
          ${item.desc_grado} - ${item.seccion_aula}
        </span>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${
          item.id_nivel === 1
            ? "bg-indigo-200/70 text-indigo-900"
            : "bg-teal-200/70 text-teal-900"
        }">
          ${item.desc_nivel}
        </span>
      </div>
      <p class="text-neutral-500 text-sm">
        ${item.id_sexo === 1 ? "Masculino" : "Femenino"}
      </p>
      <div class="inline-flex self-start items-center gap-2 px-2 py-0.5 rounded-full ${item.est_matricula === 1 ? "bg-green-100" : "bg-blue-100"} ">
        <span class="w-2 h-2 rounded-full ${item.est_matricula === 1 ? "bg-green-500" : "bg-blue-500"}"></span>
        <span class="text-xs font-semibold ${item.est_matricula === 1 ? "text-green-700" : "text-blue-700"}"> Matricula: 
        ${item.est_matricula === 1 ? "Normal" : "Traslado"}
        </span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <custom-button-fab
          icon="bi bi-eye-fill"
          btn-class="bg-sky-500 text-white hover:bg-sky-700"
          tooltip="Ver información"
          onclick="openModalInfo(${item.id_estudiante})">
      </custom-button-fab>
      ${
        !item.qr_estudiante
          ? `
      <custom-button-fab
          icon="bi bi-qr-code"
          btn-class="bg-orange-500 text-white hover:bg-orange-700"
          tooltip="Generar QR"
          onclick="generarQRIndividual(${item.id_estudiante})">
      </custom-button-fab>
      `
          : ""
      }
      <custom-button-fab
          icon="bi bi-tag-fill"
          btn-class="bg-purple-500 text-white hover:bg-purple-700"
          tooltip="Editar"
          onclick="openModalForm(${item.id_estudiante})">
      </custom-button-fab>
      <custom-button-fab
          icon="bi bi-trash-fill"
          btn-class="bg-red-500 text-white hover:bg-red-700"
          tooltip="Eliminar"
          onclick="onDelete(${item.id_estudiante})">
      </custom-button-fab>
  </div>
  `;

  document.getElementById("contentList").appendChild(newdiv);
}

function renderRowsGenerarQR(item) {
  let existingRow = document.getElementById("rowGenQR_" + item.id_estudiante);
  if (existingRow) {
    existingRow.remove();
  }

  const gradeColors = {
    1: "bg-sky-200/70 text-sky-800",
    2: "bg-emerald-200/70 text-emerald-800",
    3: "bg-violet-200/70 text-violet-800",
    4: "bg-amber-200/70 text-amber-900",
    5: "bg-cyan-200/70 text-cyan-900",
    6: "bg-yellow-200/70 text-yellow-900",
    7: "bg-orange-200/70 text-orange-900",
    8: "bg-rose-200/70 text-rose-900",
    9: "bg-amber-300/70 text-amber-950",
  };

  let newdiv = document.createElement("div");
  newdiv.id = "rowGenQR_" + item.id_estudiante;
  newdiv.className =
    "flex lg:flex-row flex-col gap-5 p-5 hover:bg-neutral-100 duration-300 ease-linear justify-between items-center";

  newdiv.innerHTML = `
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-3 items-center">
        <h5 class="font-bold text-lg text-gray-700">
          ${item.apa_estudiante} ${item.ama_estudiante} ${item.nom_estudiante}
        </h5>
      </div>
      
      <div class="flex flex-wrap gap-3">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${
          item.id_tipodocumento === 1
            ? "bg-purple-200/50 text-purple-700"
            : "bg-green-200/50 text-green-700"
        }">
          Cod.: ${item.doc_estudiante}
        </span>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${
          gradeColors[item.id_grado] || "bg-gray-200 text-gray-600"
        }">
          ${item.desc_grado} - ${item.seccion_aula}
        </span>
      </div>
    </div>
    <input 
      type="checkbox" 
      id="estudiante-${item.id_estudiante}"
      value="${item.id_estudiante}"
      class="menu-checkbox w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer" 
      data-parent="true">
  `;

  document.getElementById("contentListGenerarQR").appendChild(newdiv);

  const checkbox = document.getElementById("estudiante-" + item.id_estudiante);
  if (checkbox) {
    checkbox.addEventListener("change", function () {
      toggleCheckboxQR(item.id_estudiante, this.checked);
    });
  }
  if (estudiantesSeleccionados.has(item.id_estudiante)) {
    checkbox.checked = true;
  }
}

function renderRowsCarnet(item) {
  let existingRow = document.getElementById("rowCarnet_" + item.id_estudiante);
  if (existingRow) existingRow.remove();

  const gradeColors = {
    1: "bg-sky-200/70 text-sky-800",
    2: "bg-emerald-200/70 text-emerald-800",
    3: "bg-violet-200/70 text-violet-800",
    4: "bg-amber-200/70 text-amber-900",
    5: "bg-cyan-200/70 text-cyan-900",
    6: "bg-yellow-200/70 text-yellow-900",
    7: "bg-orange-200/70 text-orange-900",
    8: "bg-rose-200/70 text-rose-800",
    9: "bg-amber-300/70 text-amber-950",
  };

  let newdiv = document.createElement("div");
  newdiv.id = "rowCarnet_" + item.id_estudiante;
  newdiv.className =
    "flex lg:flex-row flex-col gap-5 p-5 hover:bg-neutral-100 duration-300 ease-linear justify-between items-center";

  newdiv.innerHTML = `
        <div class="flex flex-col gap-2">
            <div class="flex flex-wrap gap-3 items-center">
                <h5 class="font-bold text-lg text-gray-700">
                    ${item.apa_estudiante} ${item.ama_estudiante} ${item.nom_estudiante}
                </h5>
            </div>
            <div class="flex flex-wrap gap-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-200/50 text-teal-700">
                    Cod.: ${item.doc_estudiante}
                </span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${gradeColors[item.id_grado] || "bg-gray-200 text-gray-600"}">
                    ${item.desc_grado} - ${item.seccion_aula}
                </span>
                ${
                  !item.qr_estudiante
                    ? `
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                    <i class="bi bi-exclamation-triangle"></i> Sin QR
                </span>`
                    : ""
                }
            </div>
        </div>
        <input 
            type="checkbox"
            id="carnet-${item.id_estudiante}"
            value="${item.id_estudiante}"
            class="carnet-checkbox w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
            ${!item.qr_estudiante ? "disabled" : ""}>
    `;

  document.getElementById("contentListCarnet").appendChild(newdiv);

  const checkbox = document.getElementById("carnet-" + item.id_estudiante);
  if (checkbox && item.qr_estudiante) {
    checkbox.addEventListener("change", function () {
      toggleCheckboxCarnet(item.id_estudiante, this.checked);
    });
    if (estudiantesSeleccionadosCarnet.has(item.id_estudiante)) {
      checkbox.checked = true;
    }
  }
}

function inicializarBusquedaQR() {
  inputSearchQR = document.querySelector("#searchTextQR");

  if (inputSearchQR) {
    inputSearchQR.addEventListener("input", function (e) {
      const searchValue = e.target.value || inputSearchQR.getValue?.() || "";
      filtrarEstudiantesQR(searchValue.toLowerCase().trim());
    });
  }
}

function inicializarBusquedaCarnet() {
  const inputSearchCarnet = document.querySelector("#searchTextCarnet");
  if (inputSearchCarnet) {
    inputSearchCarnet.addEventListener("input", function (e) {
      const searchValue = e.target.value.toLowerCase().trim();
      if (!searchValue) {
        paginatorCarnet.setData(todosLosEstudiantesCarnet);
        return;
      }
      const filtrados = todosLosEstudiantesCarnet.filter((item) => {
        const searchData =
          `${item.nom_estudiante} ${item.apa_estudiante} ${item.ama_estudiante} ${item.desc_grado} ${item.seccion_aula} ${item.doc_estudiante}`.toLowerCase();
        return searchData.includes(searchValue);
      });
      paginatorCarnet.setData(filtrados.length > 0 ? filtrados : []);
      if (filtrados.length === 0) {
        document.getElementById("contentListCarnet").innerHTML = `
                    <div class="p-5 text-center text-gray-500">
                        <i class="bi bi-search text-4xl mb-3 block"></i>
                        <p class="font-medium">No se encontraron estudiantes</p>
                    </div>`;
      }
    });
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

async function Buscar() {
  document.getElementById("contentList").innerHTML = "";
  let searchText = inputSearch.getValue().trim();

  try {
    let formData = new FormData();
    formData.append("textsearch", searchText);
    let resp = await fetch(
      "../../../app/routes/estudiante.route.php?op=buscar",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData,
      },
    );
    let json = await resp.json();

    if (json.status) {
      let data = json.data;

      // ✅ Actualizar paginador con resultados de búsqueda
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

// ... resto del código permanece igual (GuardaryEditar, getAula, Mostrar, etc.)

async function GuardaryEditar() {
  try {
    let form = document.getElementById("formStudent");
    const data = new FormData(form);
    let resp = await fetch(
      "../../../app/routes/estudiante.route.php?op=guardaryeditar",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: data,
      },
    );
    let json = await resp.json();
    if (json.status) {
      AlertService.success("¡Exito!", json.msg);
      Listar();
      closeModalForm();
    } else {
      alert("Error al grabar: " + json.msg);
    }
  } catch (error) {
    console.error(error);
  }
}

async function verDetalles(id) {
  try {
    const formData = new FormData();
    formData.append("id", id);
    let resp = await fetch(
      "../../../app/routes/estudiante.route.php?op=mostrar",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData,
      },
    );
    let json = await resp.json();
    if (json.status) {
      const data = json.data;
      poblarInfoEstudiante(data);
    }
  } catch (error) {
    console.error(error);
    AlertService.error("Error", "No se pudieron cargar los detalles");
  }
}

function poblarInfoEstudiante(data) {
  const studentName = document.getElementById("studentName");
  const tipoDocStudent = document.getElementById("tipoDocStudent");
  const numDocStudent = document.getElementById("numDocStudent");
  const fechaNacimientoStudent = document.getElementById(
    "fechaNacimientoStudent",
  );
  const gradoSeccionStudent = document.getElementById("gradoSeccionStudent");
  const nivelAcademicoStudent = document.getElementById(
    "nivelAcademicoStudent",
  );
  const sexoStudent = document.getElementById("sexoStudent");
  const nombreApoderado = document.getElementById("nombreApoderado");
  const telefonoApoderado = document.getElementById("telefonoApoderado");

  const qrStudent = document.getElementById("qrStudent");
  const qrContainer = document.getElementById("qrContainer");

  if (studentName)
    studentName.textContent = `${data.apaEstudiante} ${data.amaEstudiante} ${data.nomEstudiante}`;
  if (tipoDocStudent)
    tipoDocStudent.textContent = data.idTipoDocumento === 1 ? "D.N.I." : "C.E.";
  if (numDocStudent) numDocStudent.textContent = data.docEstudiante;
  if (fechaNacimientoStudent)
    fechaNacimientoStudent.textContent = formatearFecha(data.fechaNacimiento);
  if (sexoStudent)
    sexoStudent.textContent = data.idSexo === 1 ? "Masculino" : "Femenino";
  if (gradoSeccionStudent)
    gradoSeccionStudent.textContent = `${data.descGrado} - ${data.seccionAula}`;
  if (nivelAcademicoStudent) nivelAcademicoStudent.textContent = data.descNivel;
  if (nombreApoderado) nombreApoderado.textContent = data.nomApoderado;
  if (telefonoApoderado) telefonoApoderado.textContent = data.telApoderado;

  if (qrStudent && qrContainer) {
    // Eliminar span previo si existe
    const spanPrevio = qrContainer.querySelector("span");
    if (spanPrevio) spanPrevio.remove();

    // Resetear onerror para evitar conflictos entre aperturas
    qrStudent.onerror = null;

    if (data.qrEstudiante && data.qrEstudiante !== "") {
      qrStudent.classList.remove("hidden");
      qrStudent.src = `../../../../public/qr-students/${data.qrEstudiante}`;

      qrStudent.onerror = () => {
        qrStudent.classList.add("hidden");
        qrStudent.onerror = null;
        const span = document.createElement("span");
        span.className = "text-xs text-gray-400 font-medium text-center";
        span.textContent = "QR no generado";
        qrContainer.appendChild(span);
      };
    } else {
      qrStudent.classList.add("hidden");
      qrStudent.src = "";
      const span = document.createElement("span");
      span.className = "text-xs text-gray-400 font-medium text-center";
      span.textContent = "QR no generado";
      qrContainer.appendChild(span);
    }
  }
}

async function getAula() {
  try {
    let resp = await fetch("../../../app/routes/genericList.route.php?op=aula");
    let json = await resp.json();
    if (json.status) {
      let data = json.data;
      let ops = data.map((p) => ({
        value: p.id_aula,
        desc: `${p.desc_grado} - ${p.seccion_aula}`,
      }));
      return ops;
    }
  } catch (error) {
    console.error(error);
  }
}

async function Mostrar(id) {
  const formData = new FormData();
  formData.append("id", id);
  try {
    let resp = await fetch(
      "../../../app/routes/estudiante.route.php?op=mostrar",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData,
      },
    );
    let json = await resp.json();
    if (json.status) {
      document.getElementById("idEstudiante").value = json.data.idEstudiante;
      initCustomValues(json.data);
    }
  } catch (error) {
    console.error(error);
  }
}

window.onDelete = async function (id) {
  AlertService.confirm(
    "¿Estás seguro?",
    "Esta acción no se puede deshacer",
  ).then(async (result) => {
    if (result) {
      let formData = new FormData();
      formData.append("id", id);
      try {
        let resp = await fetch(
          "../../../app/routes/estudiante.route.php?op=eliminar",
          {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            body: formData,
          },
        );
        let json = await resp.json();
        if (json.status) {
          AlertService.success("¡Exito!", json.msg);
          Listar();
        } else {
          AlertService.warning("¡Atención!", json.msg);
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
};

window.openModalForm = async function (id = null) {
  if (!DialogFormStudent) return;
  const aulaAutocomplete = document.querySelector(
    "custom-autocomplete[name='idAula']",
  );
  if (aulaAutocomplete) {
    const opciones = await getAula();
    aulaAutocomplete.setOptions(opciones);
  }

  DialogFormStudent.open();
  formStudent = document.getElementById("formStudent");

  setTimeout(() => {
    if (id === null) {
      initInput();
    } else {
      Mostrar(id);
    }
  });
};

window.seleccionarPaginaQR = function () {
  const checkboxes = document.querySelectorAll(".menu-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
    const id = parseInt(checkbox.value);
    estudiantesSeleccionados.add(id);
  });
  updateCounters();
};

window.seleccionarTodosQR = function () {
  const todosLosDatos = paginatorQR.getData();
  todosLosDatos.forEach((item) => {
    estudiantesSeleccionados.add(item.id_estudiante);
  });

  // Marcar visualmente los visibles
  const checkboxes = document.querySelectorAll(".menu-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
  });

  updateCounters();
};

window.limpiarSeleccionQR = function () {
  estudiantesSeleccionados.clear();

  const checkboxes = document.querySelectorAll(".menu-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  updateCounters();
};

window.toggleCheckboxQR = function (id, checked) {
  if (checked) {
    estudiantesSeleccionados.add(id);
  } else {
    estudiantesSeleccionados.delete(id);
  }
  updateCounters();
};

window.toggleCheckboxCarnet = function (id, checked) {
  if (checked) estudiantesSeleccionadosCarnet.add(id);
  else estudiantesSeleccionadosCarnet.delete(id);
  updateCountersCarnet();
};

function updateCounters() {
  document.getElementById("countSelected").textContent =
    estudiantesSeleccionados.size;
}

function updateCountersCarnet() {
  document.getElementById("countSelectedCarnet").textContent =
    estudiantesSeleccionadosCarnet.size;
}

window.seleccionarPaginaCarnet = function () {
  document.querySelectorAll(".carnet-checkbox:not(:disabled)").forEach((cb) => {
    cb.checked = true;
    estudiantesSeleccionadosCarnet.add(parseInt(cb.value));
  });
  updateCountersCarnet();
};

window.seleccionarTodosCarnet = function () {
  todosLosEstudiantesCarnet
    .filter((i) => i.qr_estudiante)
    .forEach((i) => {
      estudiantesSeleccionadosCarnet.add(i.id_estudiante);
    });
  document
    .querySelectorAll(".carnet-checkbox:not(:disabled)")
    .forEach((cb) => (cb.checked = true));
  updateCountersCarnet();
};

window.limpiarSeleccionCarnet = function () {
  estudiantesSeleccionadosCarnet.clear();
  document
    .querySelectorAll(".carnet-checkbox")
    .forEach((cb) => (cb.checked = false));
  updateCountersCarnet();
};

window.generarQRMasivo = async function () {
  if (estudiantesSeleccionados.size === 0) {
    AlertService.warning(
      "¡Atención!",
      "Debe seleccionar al menos un estudiante para generar los códigos QR",
    );
    return;
  }

  const datosEstudiantes = Array.from(estudiantesSeleccionados).map((id) => ({
    idEstudiante: id,
  }));

  try {
    let formData = new FormData();
    formData.append("estudiantes", JSON.stringify(datosEstudiantes));

    let resp = await fetch(
      "../../../app/routes/estudiante.route.php?op=generarqrmasivo",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData,
      },
    );

    let json = await resp.json();

    if (json.status) {
      const mensaje =
        json.errores > 0
          ? `${json.generados} código${json.generados !== 1 ? "s" : ""} QR generado${json.generados !== 1 ? "s" : ""} correctamente. ${json.errores} con errores.`
          : `${json.generados} código${json.generados !== 1 ? "s" : ""} QR generado${json.generados !== 1 ? "s" : ""} correctamente`;

      AlertService.success("¡Éxito!", mensaje);

      closeModalGenerarQRMasivo();
      Listar();
    } else {
      AlertService.error(
        "Error",
        json.msg || "No se pudieron generar los códigos QR",
      );
    }
  } catch (error) {
    AlertService.error("Error", "Error en la conexión con el servidor");
  }
};

window.generarQRIndividual = async function (id) {
  try {
    let formData = new FormData();
    formData.append("idEstudiante", id);

    let resp = await fetch(
      "../../../app/routes/estudiante.route.php?op=generarqr",
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
    AlertService.error("Error", "Error en la conexión con el servidor");
  }
};

window.generarCarnetMasivo = async function () {
  if (estudiantesSeleccionadosCarnet.size === 0) {
    AlertService.warning(
      "¡Atención!",
      "Debe seleccionar al menos un estudiante",
    );
    return;
  }
  const ids = Array.from(estudiantesSeleccionadosCarnet).map((id) => ({
    idEstudiante: id,
  }));
  window.open(
    "../../../app/routes/carnet.route.php?estudiantes=" +
      encodeURIComponent(JSON.stringify(ids)),
  );
};

window.openModalGenerarQRMasivo = async function () {
  if (!DialogGenararQRMasivo) return;
  DialogGenararQRMasivo.open();
  document.getElementById("searchTextQR").value = "";
  await ListarSinQR();
};

window.closeModalForm = function () {
  if (!DialogFormStudent) return;
  initInput();
  DialogFormStudent.close();
};

window.closeModalGenerarQRMasivo = function () {
  if (!DialogGenararQRMasivo) return;
  limpiarSeleccionQR();
  DialogGenararQRMasivo.close();
};

window.openModalInfo = function (id) {
  if (id === undefined || id === null) return;
  if (!DialogInfoStudent) return;
  verDetalles(id);
  DialogInfoStudent.open();
};
window.closeModalInfo = function () {
  if (!DialogInfoStudent) return;
  DialogInfoStudent.close();
};

window.openModalGenerarCarnet = async function () {
  if (!DialogGenerarCarnet) return;
  DialogGenerarCarnet.open();
  document.getElementById("searchTextCarnet").value = "";
  estudiantesSeleccionadosCarnet.clear();
  await ListarCarnet();
};

window.closeModalGenerarCarnet = function () {
  if (!DialogGenerarCarnet) return;
  limpiarSeleccionCarnet();
  DialogGenerarCarnet.close();
};

function initInput() {
  document.getElementById("idEstudiante").value = "";
  campos = formStudent.querySelectorAll(
    "custom-select, custom-text-field, custom-datepicker, custom-autocomplete",
  );
  campos.forEach((campo) => {
    if (typeof campo.initInput === "function") {
      campo.initInput();
    }
  });
}

function validateForm() {
  let valid = true;
  campos.forEach((campo) => {
    if (!campo.checkValidity()) valid = false;
  });

  return valid;
}

init();
