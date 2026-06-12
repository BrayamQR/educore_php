import {
  AlertService,
  formatearFecha,
  formatearHora,
} from "../../../shared/js/globalscripts.js";

// ── CONSTANTES ──────────────────────────────────────────────
const HORA_CIERRE = 9;

function obtenerEstadoCierre() {
  const ahora = new Date();
  const hora = 10; // simulamos las 10am
  const hoy = ahora.toISOString().split("T")[0];
  return { hora, hoy, listo: hora >= HORA_CIERRE };
}

const CAMPOS_POR_TIPO = {
  estudiante: ["estudiante", "rangoFechas", "estado"],
  fecha: ["fechaEspecifica", "aula", "estado"],
  resumen: ["rangoFechas", "aula", "estado"],
};

// ── VARIABLES ───────────────────────────────────────────────
let paginatorList = null;
let paginatorCierre = null;
let paginatorJustificar = null;
let DialogCierreDia = null;
let DialogJustificarFaltas = null;
let DialogReportes = null;
let fechasSeleccionadas = new Set();
let todasLasFechas = [];
let faltasSeleccionadas = new Set(); // ← faltaba
let todasLasFaltas = [];
let formReporte = null;
let campos = [];

// ── INIT ────────────────────────────────────────────────────
function init() {
  DialogCierreDia = document.getElementById("DialogCierreDia");
  DialogReportes = document.getElementById("DialogReportes");

  paginatorList = document.getElementById("paginatorList");
  if (paginatorList) {
    paginatorList.addEventListener("page-change", (e) => {
      const container = document.getElementById("contentList");
      container.innerHTML = "";
      e.detail.data.forEach(renderRows);
      container.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  DialogJustificarFaltas = document.getElementById("DialogJustificarFaltas");

  paginatorJustificar = document.getElementById("paginatorJustificar");
  if (paginatorJustificar) {
    paginatorJustificar.addEventListener("page-change", (e) => {
      const container = document.getElementById("contentListJustificar");
      container.innerHTML = "";
      e.detail.data.forEach(renderRowsJustificar);
      container.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  paginatorCierre = document.getElementById("paginatorCierre");
  if (paginatorCierre) {
    paginatorCierre.addEventListener("page-change", (e) => {
      const container = document.getElementById("contentListCierre");
      container.innerHTML = "";
      e.detail.data.forEach(renderRowsCierre);
      container.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (document.getElementById("contentList")) {
    Listar();
    verificarAlertaCierre();
    initFiltros();
  }

  formReporte = document.getElementById("formReporte");

  if (formReporte && !formReporte.hasSubmitListener) {
    formReporte.addEventListener("submit", function (e) {
      e.preventDefault();
      campos = formReporte.querySelectorAll(
        "custom-select, custom-autocomplete,custom-datepicker",
      );
      if (!validateForm()) {
        console.log("Formulario no válido 🚫");
        return;
      }
      GenerarReporte();
    });
    formReporte.hasSubmitListener = true;
  }
}

function initFiltros() {
  const searchText = document.querySelector(
    "custom-text-field[name='searchText']",
  );
  const fechaInicio = document.querySelector(
    "custom-datepicker[name='fechaInicio']",
  );
  const fechaFin = document.querySelector("custom-datepicker[name='fechaFin']");
  const estado = document.querySelector("custom-select[name='filtroEstado']");

  if (searchText) searchText.addEventListener("input", Filtrar);

  if (fechaInicio) {
    fechaInicio.fp?.config?.onChange?.push(() => Filtrar());
  }
  if (fechaFin) {
    fechaFin.fp?.config?.onChange?.push(() => Filtrar());
  }

  if (estado) {
    estado.addEventListener("change", () => Filtrar());
  }
}

async function Filtrar() {
  const dato =
    document
      .querySelector("custom-text-field[name='searchText']")
      ?.getValue()
      ?.trim() || "";
  const fechaInicio =
    document
      .querySelector("custom-datepicker[name='fechaInicio']")
      ?.getValue() || "";
  const fechaFin =
    document.querySelector("custom-datepicker[name='fechaFin']")?.getValue() ||
    "";
  const estado =
    document.querySelector("custom-select[name='filtroEstado']")?.getValue() ||
    "";

  if (!dato && !fechaInicio && !fechaFin && !estado) {
    Listar();
    return;
  }

  document.getElementById("contentList").innerHTML = "";

  try {
    let formData = new FormData();
    formData.append("dato", dato);
    formData.append("fechaInicio", fechaInicio);
    formData.append("fechaFin", fechaFin);
    formData.append("estado", estado);

    let resp = await fetch(
      "../../../app/routes/historial.route.php?op=buscar",
      { method: "POST", mode: "cors", cache: "no-cache", body: formData },
    );

    let json = await resp.json();
    if (json.status) {
      paginatorList.setData(json.data);
    } else {
      paginatorList.setData([]);
      document.getElementById("contentList").innerHTML = `
                <div class="p-5 text-center text-gray-500">
                    <i class="bi bi-search text-4xl mb-3 block"></i>
                    <p class="font-medium">No se encontraron resultados</p>
                    <p class="text-sm mt-2 text-gray-400">Intenta con otros filtros</p>
                </div>`;
    }
  } catch (error) {
    console.error(error);
  }
}

// ── LISTAR HISTORIAL ────────────────────────────────────────
async function Listar() {
  document.getElementById("contentList").innerHTML = "";
  try {
    let resp = await fetch("../../../app/routes/historial.route.php?op=listar");
    let json = await resp.json();
    if (json.status) {
      paginatorList.setData(json.data);
    } else {
      document.getElementById("contentList").innerHTML = `
                <div class="p-5 text-center text-gray-500">
                    <i class="bi bi-emoji-astonished text-4xl mb-3 block"></i>
                    <p class="font-medium">${json.msg || "No se encontraron datos"}</p>
                    <p class="text-sm mt-2 text-gray-400">No se encontraron alumnos registrados</p>
                </div>`;
    }
  } catch (error) {
    console.error(error);
  }
}

// ── VERIFICAR ALERTA CIERRE ─────────────────────────────────
async function verificarAlertaCierre() {
  try {
    const { hoy, listo } = obtenerEstadoCierre();

    const [respFechas, respHoy] = await Promise.all([
      fetch(
        "../../../app/routes/historial.route.php?op=listarfechaspendientes",
      ),
      fetch("../../../app/routes/historial.route.php?op=tieneregistroshoy"),
    ]);

    const jsonFechas = await respFechas.json();
    const jsonHoy = await respHoy.json();

    const banner = document.getElementById("bannerCierre");
    if (!banner) return;

    const fechasPasadas = jsonFechas.status
      ? jsonFechas.data.filter((item) => item.fecha < hoy)
      : [];

    const hoyListoParaCerrar = listo && jsonHoy.tiene_registros;

    if (fechasPasadas.length > 0 && hoyListoParaCerrar) {
      banner.className =
        "bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between gap-3";
      banner.innerHTML = `
                <div class="flex items-center gap-3">
                    <i class="bi bi-exclamation-triangle-fill text-red-500 text-xl"></i>
                    <div>
                        <p class="font-semibold text-red-700">Hay ${fechasPasadas.length} fecha${fechasPasadas.length !== 1 ? "s" : ""} pendiente${fechasPasadas.length !== 1 ? "s" : ""} de cierre</p>
                        <p class="text-sm text-red-500">El día de hoy también está listo para cerrar</p>
                    </div>
                </div>
                <custom-button
                    btn-class="bg-red-500 hover:bg-red-700 text-white text-sm"
                    label="Cerrar ahora"
                    icon="bi bi-calendar-check"
                    onclick="openModalCierre()">
                </custom-button>
            `;
    } else if (fechasPasadas.length > 0) {
      banner.className =
        "bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between gap-3";
      banner.innerHTML = `
                <div class="flex items-center gap-3">
                    <i class="bi bi-exclamation-triangle-fill text-red-500 text-xl"></i>
                    <div>
                        <p class="font-semibold text-red-700">Hay ${fechasPasadas.length} fecha${fechasPasadas.length !== 1 ? "s" : ""} pendiente${fechasPasadas.length !== 1 ? "s" : ""} de cierre</p>
                        <p class="text-sm text-red-500">Revisa y realiza el cierre de los días anteriores</p>
                    </div>
                </div>
                <custom-button
                    btn-class="bg-red-500 hover:bg-red-700 text-white text-sm"
                    label="Ver fechas"
                    icon="bi bi-calendar-check"
                    onclick="openModalCierre()">
                </custom-button>
            `;
    } else if (hoyListoParaCerrar) {
      banner.className =
        "bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between gap-3";
      banner.innerHTML = `
                <div class="flex items-center gap-3">
                    <i class="bi bi-clock-fill text-amber-500 text-xl"></i>
                    <div>
                        <p class="font-semibold text-amber-700">El día de hoy está listo para cerrar</p>
                        <p class="text-sm text-amber-500">Ya son más de las 9:00am y hay registros de asistencia</p>
                    </div>
                </div>
                <custom-button
                    btn-class="bg-amber-500 hover:bg-amber-700 text-white text-sm"
                    label="Cerrar día"
                    icon="bi bi-calendar-check"
                    onclick="openModalCierre()">
                </custom-button>
            `;
    } else {
      banner.className = "hidden";
      banner.innerHTML = "";
    }
  } catch (error) {
    console.error(error);
  }
}

// ── LISTAR FECHAS PENDIENTES ────────────────────────────────
async function ListarFechasPendientes() {
  document.getElementById("contentListCierre").innerHTML = "";
  try {
    const { hoy, listo } = obtenerEstadoCierre();

    const [respFechas, respHoy] = await Promise.all([
      fetch(
        "../../../app/routes/historial.route.php?op=listarfechaspendientes",
      ),
      fetch("../../../app/routes/historial.route.php?op=tieneregistroshoy"),
    ]);

    const jsonFechas = await respFechas.json();
    const jsonHoy = await respHoy.json();

    const incluirHoy = listo && jsonHoy.tiene_registros;

    if (jsonFechas.status) {
      let data = incluirHoy
        ? jsonFechas.data
        : jsonFechas.data.filter((item) => item.fecha < hoy);

      todasLasFechas = data;
      document.getElementById("totalCierre").textContent = data.length;

      if (data.length > 0) {
        paginatorCierre.setData(data);
      } else {
        document.getElementById("contentListCierre").innerHTML = `
                    <div class="p-5 text-center text-gray-500">
                        <i class="bi bi-check-circle text-4xl mb-3 block text-green-500"></i>
                        <p class="font-medium">No hay fechas pendientes de cierre</p>
                        <p class="text-sm mt-2 text-gray-400">Todos los días están al día</p>
                    </div>`;
        document.getElementById("totalCierre").textContent = "0";
      }
    } else {
      document.getElementById("contentListCierre").innerHTML = `
                <div class="p-5 text-center text-gray-500">
                    <i class="bi bi-check-circle text-4xl mb-3 block text-green-500"></i>
                    <p class="font-medium">No hay fechas pendientes de cierre</p>
                    <p class="text-sm mt-2 text-gray-400">Todos los días están al día</p>
                </div>`;
      document.getElementById("totalCierre").textContent = "0";
    }
    updateCountersCierre();
  } catch (error) {
    console.error(error);
  }
}

// ── RENDER FILAS CIERRE ─────────────────────────────────────
function renderRowsCierre(item) {
  let newdiv = document.createElement("div");
  newdiv.id = "rowCierre_" + item.fecha;
  newdiv.className =
    "flex items-center justify-between gap-5 p-4 hover:bg-neutral-100 duration-300 ease-linear";
  newdiv.innerHTML = `
        <div class="flex items-center gap-4">
            <input 
                type="checkbox"
                id="fecha-${item.fecha}"
                value="${item.fecha}"
                class="cierre-checkbox w-4 h-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer">
            <div class="flex flex-col">
                <span class="font-semibold text-gray-700">${formatearFecha(item.fecha)}</span>
                <span class="text-xs text-gray-500">${item.fecha}</span>
            </div>
        </div>
        <div class="flex items-center gap-3">
            ${
              item.total_faltas > 0
                ? `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                    <i class="bi bi-person-x"></i> ${item.total_faltas} falta${item.total_faltas !== 1 ? "s" : ""}
                   </span>`
                : `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                    <i class="bi bi-check-circle"></i> Sin faltas
                   </span>`
            }
            <span class="text-xs text-gray-400">${item.total_alumnos} alumnos</span>
        </div>
    `;

  document.getElementById("contentListCierre").appendChild(newdiv);

  const checkbox = document.getElementById("fecha-" + item.fecha);
  if (checkbox) {
    checkbox.addEventListener("change", function () {
      if (this.checked) fechasSeleccionadas.add(item.fecha);
      else fechasSeleccionadas.delete(item.fecha);
      updateCountersCierre();
    });
    if (fechasSeleccionadas.has(item.fecha)) checkbox.checked = true;
  }
}

function updateCountersCierre() {
  document.getElementById("countSelectedCierre").textContent =
    fechasSeleccionadas.size;
}

// ── RENDER FILAS HISTORIAL ──────────────────────────────────
function renderRows(item) {
  let existingRow = document.getElementById("row_" + item.id_asistencia);
  if (existingRow) existingRow.remove();

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
  newdiv.id = "row_" + item.id_asistencia;
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
                ${formatearFecha(item.fecha_asistencia)} - ${item.hora_asistencia !== null ? formatearHora(item.hora_asistencia) : ""}
            </p>
            <div class="inline-flex self-start items-center gap-2 px-2 py-0.5 rounded-full ${
              item.id_estado === 1
                ? "bg-green-100"
                : item.id_estado === 2
                  ? "bg-orange-100"
                  : item.id_estado === 4
                    ? "bg-blue-100"
                    : "bg-red-100"
            }">
                <span class="w-2 h-2 rounded-full ${
                  item.id_estado === 1
                    ? "bg-green-500"
                    : item.id_estado === 2
                      ? "bg-orange-500"
                      : item.id_estado === 4
                        ? "bg-blue-500"
                        : "bg-red-500"
                }"></span>
                <span class="text-xs font-semibold ${
                  item.id_estado === 1
                    ? "text-green-500"
                    : item.id_estado === 2
                      ? "text-orange-500"
                      : item.id_estado === 4
                        ? "text-blue-500"
                        : "text-red-500"
                }">
                    ${item.estado}
                </span>
            </div>
        </div>
    `;

  document.getElementById("contentList").appendChild(newdiv);
}

async function ListarFaltas() {
  document.getElementById("contentListJustificar").innerHTML = "";
  try {
    let resp = await fetch(
      "../../../app/routes/historial.route.php?op=listarfaltas",
    );
    let json = await resp.json();
    if (json.status) {
      todasLasFaltas = json.data;
      document.getElementById("totalJustificar").textContent = json.data.length;
      paginatorJustificar.setData(json.data);
      inicializarBusquedaJustificar();
      updateCountersJustificar();
    } else {
      document.getElementById("contentListJustificar").innerHTML = `
                <div class="p-5 text-center text-gray-500">
                    <i class="bi bi-check-circle text-4xl mb-3 block text-green-500"></i>
                    <p class="font-medium">No hay faltas registradas</p>
                    <p class="text-sm mt-2 text-gray-400">Todos los alumnos tienen asistencia al día</p>
                </div>`;
      document.getElementById("totalJustificar").textContent = "0";
    }
  } catch (error) {
    console.error(error);
  }
}

function renderRowsJustificar(item) {
  let newdiv = document.createElement("div");
  newdiv.id = "rowJustificar_" + item.id_asistencia;
  newdiv.className =
    "flex lg:flex-row flex-col gap-5 p-4 hover:bg-neutral-100 duration-300 ease-linear justify-between items-center";
  newdiv.innerHTML = `
        <div class="flex flex-col gap-2">
            <div class="flex flex-wrap gap-3 items-center">
                <h5 class="font-bold text-gray-700">
                    ${item.apa_estudiante} ${item.ama_estudiante} ${item.nom_estudiante}
                </h5>
            </div>
            <div class="flex flex-wrap gap-2">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
                    Cod.: ${item.doc_estudiante}
                </span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                    <i class="bi bi-calendar-x"></i> ${formatearFecha(item.fecha_asistencia)}
                </span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    ${item.desc_grado} - ${item.seccion_aula}
                </span>
            </div>
        </div>
        <input 
            type="checkbox"
            id="falta-${item.id_asistencia}"
            value="${item.id_asistencia}"
            class="justificar-checkbox w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer">
    `;

  document.getElementById("contentListJustificar").appendChild(newdiv);

  const checkbox = document.getElementById("falta-" + item.id_asistencia);
  if (checkbox) {
    checkbox.addEventListener("change", function () {
      if (this.checked) faltasSeleccionadas.add(item.id_asistencia);
      else faltasSeleccionadas.delete(item.id_asistencia);
      updateCountersJustificar();
    });
    if (faltasSeleccionadas.has(item.id_asistencia)) checkbox.checked = true;
  }
}

function inicializarBusquedaJustificar() {
  const input = document.querySelector("#searchTextJustificar");
  if (input) {
    // Limpiar listener previo
    input.replaceWith(input.cloneNode(true));
    const inputNuevo = document.querySelector("#searchTextJustificar");
    inputNuevo.addEventListener("input", function (e) {
      const searchValue = e.target.value.toLowerCase().trim();
      if (!searchValue) {
        paginatorJustificar.setData(todasLasFaltas);
        return;
      }
      const filtrados = todasLasFaltas.filter((item) => {
        const searchData =
          `${item.nom_estudiante} ${item.apa_estudiante} ${item.ama_estudiante} ${item.doc_estudiante} ${item.desc_grado} ${item.seccion_aula}`.toLowerCase();
        return searchData.includes(searchValue);
      });
      if (filtrados.length > 0) {
        paginatorJustificar.setData(filtrados);
      } else {
        paginatorJustificar.setData([]);
        document.getElementById("contentListJustificar").innerHTML = `
                    <div class="p-5 text-center text-gray-500">
                        <i class="bi bi-search text-4xl mb-3 block"></i>
                        <p class="font-medium">No se encontraron resultados</p>
                    </div>`;
      }
    });
  }
}

// ── ACCIONES CIERRE ─────────────────────────────────────────
window.seleccionarPaginaCierre = function () {
  document.querySelectorAll(".cierre-checkbox").forEach((cb) => {
    cb.checked = true;
    fechasSeleccionadas.add(cb.value);
  });
  updateCountersCierre();
};

window.seleccionarTodasFechas = function () {
  todasLasFechas.forEach((item) => fechasSeleccionadas.add(item.fecha));
  document
    .querySelectorAll(".cierre-checkbox")
    .forEach((cb) => (cb.checked = true));
  updateCountersCierre();
};

window.limpiarSeleccionFechas = function () {
  fechasSeleccionadas.clear();
  document
    .querySelectorAll(".cierre-checkbox")
    .forEach((cb) => (cb.checked = false));
  updateCountersCierre();
};

window.realizarCierre = async function () {
  if (fechasSeleccionadas.size === 0) {
    AlertService.warning(
      "¡Atención!",
      "Debe seleccionar al menos una fecha para cerrar",
    );
    return;
  }

  const confirmado = await AlertService.confirm(
    "¿Realizar cierre?",
    `Se marcarán como falta los alumnos sin registro en las fechas seleccionadas`,
  );
  if (!confirmado) return;

  try {
    let formData = new FormData();
    formData.append("fechas", JSON.stringify(Array.from(fechasSeleccionadas)));

    let resp = await fetch(
      "../../../app/routes/historial.route.php?op=realizarcierre",
      { method: "POST", mode: "cors", cache: "no-cache", body: formData },
    );

    let json = await resp.json();
    if (json.status) {
      AlertService.success("¡Éxito!", json.msg);
      fechasSeleccionadas.clear();
      closeModalCierre();
      Listar();
      verificarAlertaCierre();
    } else {
      AlertService.error("Error", json.msg);
    }
  } catch (error) {
    AlertService.error("Error", "Error en la conexión con el servidor");
  }
};

function updateCountersJustificar() {
  document.getElementById("countSelectedJustificar").textContent =
    faltasSeleccionadas.size;
}

window.seleccionarPaginaJustificar = function () {
  document.querySelectorAll(".justificar-checkbox").forEach((cb) => {
    cb.checked = true;
    faltasSeleccionadas.add(parseInt(cb.value));
  });
  updateCountersJustificar();
};

window.seleccionarTodasJustificar = function () {
  todasLasFaltas.forEach((item) => faltasSeleccionadas.add(item.id_asistencia));
  document
    .querySelectorAll(".justificar-checkbox")
    .forEach((cb) => (cb.checked = true));
  updateCountersJustificar();
};

window.limpiarSeleccionJustificar = function () {
  faltasSeleccionadas.clear();
  document
    .querySelectorAll(".justificar-checkbox")
    .forEach((cb) => (cb.checked = false));
  updateCountersJustificar();
};

window.justificarFaltas = async function () {
  if (faltasSeleccionadas.size === 0) {
    AlertService.warning(
      "¡Atención!",
      "Debe seleccionar al menos una falta para justificar",
    );
    return;
  }

  const confirmado = await AlertService.confirm(
    "¿Justificar faltas?",
    "Se justificarán las faltas seleccionadas.",
  );
  if (!confirmado) return;

  try {
    let formData = new FormData();
    formData.append("faltas", JSON.stringify(Array.from(faltasSeleccionadas)));

    let resp = await fetch(
      "../../../app/routes/historial.route.php?op=justificarfalta",
      { method: "POST", mode: "cors", cache: "no-cache", body: formData },
    );

    let json = await resp.json();
    if (json.status) {
      AlertService.success("¡Éxito!", json.msg);
      faltasSeleccionadas.clear();
      closeModalJustificar();
      Listar();
    } else {
      AlertService.error("Error", json.msg);
    }
  } catch (error) {
    AlertService.error("Error", "Error en la conexión con el servidor");
  }
};

async function getEstudiante() {
  try {
    let resp = await fetch(
      "../../../app/routes/genericList.route.php?op=estudiante",
    );
    let json = await resp.json();
    if (json.status) {
      let data = json.data;
      let ops = data.map((p) => ({
        value: p.id_estudiante,
        desc: `${p.doc_estudiante} - ${p.apa_estudiante} ${p.ama_estudiante} ${p.nom_estudiante}`,
      }));
      return ops;
    }
  } catch (error) {
    console.error(error);
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

async function GenerarReporte() {
  const tipoRadio = document.querySelector(".reporte-radio:checked");
  if (!tipoRadio) {
    AlertService.warning("¡Atención!", "Selecciona un tipo de reporte");
    return;
  }

  const tipo = tipoRadio.value;

  const opMap = {
    estudiante: "porEstudiante",
    fecha: "porFecha",
    resumen: "porPeriodo",
  };

  try {
    const form = document.getElementById("formReporte");
    const data = new FormData(form);
    data.append("tipo", tipo); // por si el PHP lo necesita saber
    for (let [key, value] of data.entries()) {
      console.log(key, "→", value);
    }

    const resp = await fetch(
      `../../../app/routes/historial.route.php?op=${opMap[tipo]}`,
      { method: "POST", mode: "cors", cache: "no-cache", body: data },
    );

    const json = await resp.json();

    if (json.status) {
      const params = new URLSearchParams();
      params.append("tipo", tipo);

      // Reutilizar el FormData que ya tienes
      for (let [key, value] of data.entries()) {
        params.append(key, value);
      }

      window.open(
        `../../../app/routes/reporte.route.php?${params.toString()}`,
        "_blank",
      );
    } else {
      AlertService.warning(
        "Sin resultados",
        json.msg || "No se encontraron registros",
      );
    }
  } catch (error) {
    console.error(error);
    AlertService.error("Error", "Error en la conexión con el servidor");
  }
}

function actualizarCamposReporte(tipo) {
  const contenedor = document.getElementById("camposReporte");
  contenedor.classList.remove("hidden");

  const camposVisibles = CAMPOS_POR_TIPO[tipo] || [];

  document.querySelectorAll(".campo-reporte").forEach((el) => {
    const campo = el.dataset.campo;
    if (camposVisibles.includes(campo)) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
      // Limpiar valor al ocultar
      el.querySelectorAll(
        "custom-autocomplete, custom-datepicker, custom-select",
      ).forEach((c) => c.initInput?.());
    }
  });

  // Actualizar estilos de card seleccionada
  const colores = {
    estudiante: { border: "border-sky-500", bg: "bg-sky-50" },
    fecha: { border: "border-violet-500", bg: "bg-violet-50" },
    resumen: { border: "border-emerald-500", bg: "bg-emerald-50" },
  };

  document.querySelectorAll(".reporte-card-inner").forEach((card) => {
    card.classList.remove(
      "border-sky-500",
      "bg-sky-50",
      "border-violet-500",
      "bg-violet-50",
      "border-emerald-500",
      "bg-emerald-50",
      "border-gray-200",
    );
    card.classList.add("border-gray-200");
  });

  const selectedCard = document
    .querySelector(`.reporte-radio[value="${tipo}"]`)
    ?.closest(".reporte-card")
    ?.querySelector(".reporte-card-inner");

  if (selectedCard && colores[tipo]) {
    selectedCard.classList.remove("border-gray-200");
    selectedCard.classList.add(colores[tipo].border, colores[tipo].bg);
  }
}

window.limpiarReporte = function () {
  initInput();
};

function initReporteCards() {
  document.querySelectorAll(".reporte-radio").forEach((radio) => {
    const clone = radio.cloneNode(true);
    radio.parentNode.replaceChild(clone, radio);
    clone.addEventListener("change", function () {
      actualizarCamposReporte(this.value);
      initInput();
    });
  });
}

window.openModalJustificar = async function () {
  if (!DialogJustificarFaltas) return;
  faltasSeleccionadas.clear();
  document.getElementById("searchTextJustificar").value = "";
  DialogJustificarFaltas.open();
  await ListarFaltas();
};

window.closeModalJustificar = function () {
  if (!DialogJustificarFaltas) return;
  limpiarSeleccionJustificar();
  DialogJustificarFaltas.close();
};

window.openModalCierre = async function () {
  if (!DialogCierreDia) return;
  fechasSeleccionadas.clear();
  DialogCierreDia.open();
  await ListarFechasPendientes();
};

window.closeModalCierre = function () {
  if (!DialogCierreDia) return;
  limpiarSeleccionFechas();
  DialogCierreDia.close();
};
window.openModalReportes = async function () {
  if (!DialogReportes) return;

  document
    .querySelectorAll(".reporte-radio")
    .forEach((r) => (r.checked = false));
  document.querySelectorAll(".reporte-card-inner").forEach((card) => {
    card.classList.remove(
      "border-sky-500",
      "bg-sky-50",
      "border-violet-500",
      "bg-violet-50",
      "border-emerald-500",
      "bg-emerald-50",
    );
    card.classList.add("border-gray-200");
  });
  document.getElementById("camposReporte").classList.add("hidden");
  document
    .querySelectorAll(".campo-reporte")
    .forEach((el) => el.classList.add("hidden"));

  const selectAula = document.querySelector(
    "custom-autocomplete[name='reporteAula']",
  );
  if (selectAula) {
    const aulas = await getAula();
    selectAula.setOptions(aulas);
  }

  const ac = document.querySelector(
    "custom-autocomplete[name='reporteEstudiante']",
  );
  if (ac) {
    const opciones = await getEstudiante();
    ac.setOptions(opciones);
  }
  initInput();
  DialogReportes.open();
  initReporteCards();
};

window.closeModalReportes = function () {
  if (!DialogReportes) return;
  initInput();
  DialogReportes.close();
};

function initInput() {
  campos = formReporte.querySelectorAll(
    "custom-select, custom-autocomplete,custom-datepicker",
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

window.LimpiarFiltros = function () {
  document.querySelector("custom-text-field[name='searchText']")?.initInput();
  document.querySelector("custom-datepicker[name='fechaInicio']")?.initInput();
  document.querySelector("custom-datepicker[name='fechaFin']")?.initInput();
  document.querySelector("custom-select[name='filtroEstado']")?.initInput();
  Listar();
};

init();
