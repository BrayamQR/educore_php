import {
  AlertService,
  formatearFecha,
  normalizarTexto,
  formatearFechaCorta,
  obtenerMesDia,
  apiRequest,
  ROUTES,
  crearControladorFiltros,
} from "../../../shared/js/globalscripts.js";

let DialogFormHoliday = null;
let DialogInfoHoliday = null;
let paginatorList = null;
let formHoliday = null;
let campos = [];
let paginatorFeriadoNacional = null;
let todosLosFeriadosNacionales = [];
let feriadosNacionalesSeleccionados = new Set();
let selectFiltroTipoFeriado = null;
let selectFiltroAnioLectivo = null;
let anioLectivoActivo = null;
let ultimoAnio = null;
let controladorFiltros = null;

const CONTENIDO_POR_TIPO = {
  nacional: "contentFeriadosNacionales",
  especifica: "camposFeriadoManual",
  rango: "camposFeriadoManual",
};

const CAMPOS_POR_TIPO_HOLIDAY = {
  especifica: ["nomEvento", "fechaEspecifica", "tipoDiaNoLectivo"],
  rango: ["nomEvento", "rangoFechas", "tipoDiaNoLectivo"],
};

async function init() {
  await obtenerAnioActivo();
  await obtenerUltimoAnio();

  DialogFormHoliday = document.getElementById("DialogFormHoliday");
  DialogInfoHoliday = document.getElementById("DialogInfoHoliday");
  paginatorFeriadoNacional = document.getElementById(
    "paginatorFeriadoNacional",
  );

  selectFiltroTipoFeriado = document.querySelector(
    "custom-select[name='filtroTipoFeriado']",
  );
  if (selectFiltroTipoFeriado) {
    const tipo = await getTipoDiaNoLectivo();
    selectFiltroTipoFeriado.setOptions(tipo);
  }

  selectFiltroAnioLectivo = document.querySelector(
    "custom-select[name='filtroAnioLectivo']",
  );

  if (selectFiltroAnioLectivo) {
    const anios = await getAnioLectivo();
    selectFiltroAnioLectivo.setOptions(anios);
    if (ultimoAnio) {
      selectFiltroAnioLectivo.setValue(ultimoAnio.id_aniolectivo);
    }
  }

  if (document.getElementById("contentList")) {
    initFiltros();
    Listar();
  }

  paginatorList = document.getElementById("paginatorList");
  if (paginatorList) {
    paginatorList.addEventListener("page-change", (e) => {
      const container = document.getElementById("contentList");
      container.innerHTML = "";
      e.detail.data.forEach(renderRows);
      container.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  formHoliday = document.getElementById("formHoliday");
}

async function Listar() {
  document.getElementById("contentList").innerHTML = "";
  const json = await apiRequest(ROUTES.DIA_NO_LECTIVO, "listar");
  if (json.status) {
    paginatorList.setData(json.data);
  } else {
    document.getElementById("contentList").innerHTML = `
                <div class="p-5 text-center text-gray-500">
                    <i class="bi bi-emoji-astonished text-4xl mb-3 block"></i>
                    <p class="font-medium">${json.msg || "No se encontraron datos"}</p>
                    <p class="text-sm mt-2 text-gray-400">No se encontraron días no lectivos registrados</p>
                </div>`;
  }
}

function renderRows(item) {
  let existingRow = document.getElementById("row_" + item.id_dianolectivo);
  if (existingRow) {
    existingRow.remove();
  }

  let newdiv = document.createElement("div");
  newdiv.id = "row_" + item.id_dianolectivo;
  newdiv.className =
    "flex lg:flex-row flex-col gap-5 p-5 hover:bg-neutral-100 duration-300 ease-linear justify-between";
  newdiv.innerHTML = `
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-3 items-center">
        <h5 class="font-bold text-lg text-gray-700">${item.nom_evento}</h5>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-300/40 text-blue-700">Año lectivo: ${item.anio}</span>
      </div>
      <p class="text-neutral-500 text-sm"> 
      ${
        item.fecha_inicio === item.fecha_fin
          ? `<span class="font-semibold text-neutral-600">${formatearFecha(item.fecha_inicio)}</span>`
          : `De <span class="font-semibold text-neutral-600">${formatearFecha(item.fecha_inicio)}</span> a <span class="font-semibold text-neutral-600">${formatearFecha(item.fecha_fin)}</span>`
      } 
      </p>
      <div class="inline-flex self-start items-center gap-2 px-2 py-0.5 rounded-full ${
        item.id_tipodianolectivo === 1
          ? "bg-green-100"
          : item.id_tipodianolectivo === 2
            ? "bg-blue-100"
            : "bg-purple-100"
      }">
        <span class="w-2 h-2 rounded-full ${item.id_tipodianolectivo === 1 ? "bg-green-500" : item.id_tipodianolectivo === 2 ? "bg-blue-500" : "bg-purple-500"}"></span>
        <span class="text-xs font-semibold ${item.id_tipodianolectivo === 1 ? "text-green-700" : item.id_tipodianolectivo === 2 ? "text-blue-700" : "text-purple-700"}">${item.nom_tipodianolectivo}</span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <custom-button-fab
        icon="bi bi-eye-fill"
        btn-class="bg-sky-500 text-white hover:bg-sky-700"
        tooltip="Ver información"
        onclick="openModalInfo(${item.id_dianolectivo})">
      </custom-button-fab>
      <custom-button-fab
        icon="bi bi-trash-fill"
        btn-class="bg-red-500 text-white hover:bg-red-700"
        tooltip="Eliminar"
        onclick="onDelete(${item.id_dianolectivo})">
      </custom-button-fab>
    </div>
  `;

  document.getElementById("contentList").appendChild(newdiv);
}

async function ObtenerFeriadosPendientes() {
  const json = await apiRequest(
    ROUTES.DIA_NO_LECTIVO,
    "obtenerferiadospendientes",
  );
  if (json.status) {
    paginatorFeriadoNacional.setData(json.data);
    todosLosFeriadosNacionales = json.data;
    document.getElementById("totalFeriadoNacional").textContent =
      json.data.length;
    inicializarBusquedaFeriado();
    updateCountersFeriadosNacionales();
  } else {
    document.getElementById("contentListFeriadoNacional").innerHTML = `
                <div class="p-5 text-center text-gray-500">
                    <i class="bi bi-check-circle text-4xl mb-3 block text-green-500"></i>
                    <p class="font-medium">No hay faltas registradas</p>
                    <p class="text-sm mt-2 text-gray-400">Todos los alumnos tienen asistencia al día</p>
                </div>`;
    document.getElementById("totalFeriadoNacional").textContent = "0";
  }
}

function renderRowFeriadoPendiente(item) {
  let newdiv = document.createElement("div");
  newdiv.id = "rowFeriado_" + item.idPlantilla;
  newdiv.className =
    "flex lg:flex-row flex-col gap-3 p-4 hover:bg-neutral-100 duration-300 ease-linear lg:justify-between lg:items-center";
  newdiv.className =
    "flex lg:flex-row flex-col gap-3 p-4 hover:bg-neutral-100 duration-300 ease-linear lg:justify-between items-center";
  newdiv.innerHTML = `
    <div class="flex flex-col gap-2 lg:items-start items-center lg:text-left text-center">
        <h5 class="font-bold text-gray-700">${item.nomEvento}</h5>
        <div class="flex flex-wrap gap-2 justify-center lg:justify-start">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                <i class="bi bi-calendar-event"></i>
                ${
                  item.fechaInicio === item.fechaFin
                    ? `${item.diaInicio} - ${formatearFecha(item.fechaInicio)}`
                    : `${item.diaInicio} - ${formatearFecha(item.fechaInicio)} al ${item.diaFin} - ${formatearFecha(item.fechaFin)}`
                }
            </span>
        </div>
    </div>
    <input 
        type="checkbox"
        id="feriado-${item.idPlantilla}"
        value="${item.idPlantilla}"
        class="feriado-checkbox w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer">
  `;

  document.getElementById("contentListFeriadoNacional").appendChild(newdiv);

  const checkbox = document.getElementById("feriado-" + item.idPlantilla);
  if (checkbox) {
    if (feriadosNacionalesSeleccionados.has(item.idPlantilla)) {
      checkbox.checked = true;
    }
    checkbox.addEventListener("change", function () {
      if (this.checked) feriadosNacionalesSeleccionados.add(item.idPlantilla);
      else feriadosNacionalesSeleccionados.delete(item.idPlantilla);
      updateCountersFeriadosNacionales();
    });
  }
}

function inicializarBusquedaFeriado() {
  const input = document.querySelector("#searchTextFeriado");
  if (input) {
    input.replaceWith(input.cloneNode(true));
    const inputNuevo = document.querySelector("#searchTextFeriado");
    inputNuevo.addEventListener("input", function (e) {
      const searchValue = normalizarTexto(e.target.value.trim());
      if (!searchValue) {
        paginatorFeriadoNacional.setData(todosLosFeriadosNacionales);
        return;
      }
      const filtrados = todosLosFeriadosNacionales.filter((item) => {
        const searchData = normalizarTexto(`${item.nomEvento}`);
        return searchData.includes(searchValue);
      });
      if (filtrados.length > 0) {
        paginatorFeriadoNacional.setData(filtrados);
      } else {
        paginatorFeriadoNacional.setData([]);
        document.getElementById("contentListFeriadoNacional").innerHTML = `
                    <div class="p-5 text-center text-gray-500">
                        <i class="bi bi-search text-4xl mb-3 block"></i>
                        <p class="font-medium">No se encontraron resultados</p>
                    </div>`;
      }
    });
  }
}

async function actualizarCamposHoliday(tipo) {
  const contenedoresUnicos = new Set(Object.values(CONTENIDO_POR_TIPO));
  contenedoresUnicos.forEach((id) => {
    document.getElementById(id)?.classList.add("hidden");
  });

  if (tipo === "nacional") {
    document
      .getElementById("contentFeriadosNacionales")
      ?.classList.remove("hidden");
    document.getElementById("searchTextFeriado").value = "";
    if (paginatorFeriadoNacional) {
      paginatorFeriadoNacional.addEventListener("page-change", (e) => {
        const container = document.getElementById("contentListFeriadoNacional");
        container.innerHTML = "";
        e.detail.data.forEach(renderRowFeriadoPendiente);
        container.scrollTo({ top: 0, behavior: "smooth" });
      });

      ObtenerFeriadosPendientes();
    }
  } else {
    initInput();
    const contenedor = document.getElementById("camposFeriadoManual");
    contenedor.classList.remove("hidden");

    const camposVisibles = CAMPOS_POR_TIPO_HOLIDAY[tipo] || [];

    document.querySelectorAll(".campo-feriado").forEach((el) => {
      const campo = el.dataset.campo;
      if (camposVisibles.includes(campo)) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
        // Limpiar valor al ocultar
        el.querySelectorAll(
          "custom-text-field, custom-datepicker, custom-select",
        ).forEach((c) => c.initInput?.());
      }
    });
    const selectTipoDiaNoLectivo = document.querySelector(
      "custom-select[name='idTipoDiaNoLectivo']",
    );
    if (selectTipoDiaNoLectivo) {
      const tipo = await getTipoDiaNoLectivo();
      selectTipoDiaNoLectivo.setOptions(tipo);
    }
  }

  // Actualizar estilos de card seleccionada
  const colores = {
    nacional: { border: "border-sky-500", bg: "bg-sky-50" },
    especifica: { border: "border-violet-500", bg: "bg-violet-50" },
    rango: { border: "border-emerald-500", bg: "bg-emerald-50" },
  };

  document.querySelectorAll(".holiday-card-inner").forEach((card) => {
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

  const selectedCard = document
    .querySelector(`.typeholiday-radio[value="${tipo}"]`)
    ?.closest(".typeholiday-card")
    ?.querySelector(".holiday-card-inner");

  if (selectedCard && colores[tipo]) {
    selectedCard.classList.remove("border-gray-200");
    selectedCard.classList.add(colores[tipo].border, colores[tipo].bg);
  }
}

function initHolidayCards() {
  document.querySelectorAll(".typeholiday-radio").forEach((radio) => {
    const clone = radio.cloneNode(true);
    radio.parentNode.replaceChild(clone, radio);
    clone.addEventListener("change", function () {
      actualizarCamposHoliday(this.value);
    });
  });
}

function ResetHolidayCard() {
  document
    .querySelectorAll(".typeholiday-radio")
    .forEach((r) => (r.checked = false));

  document.querySelectorAll(".holiday-card-inner").forEach((card) => {
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
  document.getElementById("contentFeriadosNacionales")?.classList.add("hidden");
  document.getElementById("camposFeriadoManual")?.classList.add("hidden");
  document
    .querySelectorAll(".campo-feriado")
    .forEach((el) => el.classList.add("hidden"));
}

async function getTipoDiaNoLectivo() {
  const json = await apiRequest(ROUTES.GENERIC_LIST, "tipodianolectivo");
  if (json.status) {
    let data = json.data;
    let ops = data.map((p) => ({
      value: p.id_tipodianolectivo,
      desc: p.nom_tipodianolectivo,
    }));
    return ops;
  }
}

async function getAnioLectivo() {
  const json = await apiRequest(ROUTES.ANIO_LECTIVO, "listar");
  if (json.status) {
    let data = json.data;
    let ops = data.map((p) => ({
      value: p.id_aniolectivo,
      desc: p.anio,
    }));
    return ops;
  }
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

function initFiltros() {
  const searchText = document.querySelector(
    "custom-text-field[name='searchText']",
  );
  const fechaInicio = document.querySelector(
    "custom-datepicker[name='fechaInicio']",
  );
  const fechaFin = document.querySelector("custom-datepicker[name='fechaFin']");
  const tipoFeriado = document.querySelector(
    "custom-select[name='filtroTipoFeriado']",
  );
  const anioLectivo = document.querySelector(
    "custom-select[name='filtroAnioLectivo']",
  );
  controladorFiltros = crearControladorFiltros(Filtrar);

  controladorFiltros.registrar(
    searchText,
    "input",
    (el) => el.getValue()?.trim() || "",
  );

  controladorFiltros.registrar(
    fechaInicio,
    "change",
    (el) => el.getValue() || "",
  );

  controladorFiltros.registrar(fechaFin, "change", (el) => el.getValue() || "");

  controladorFiltros.registrar(
    tipoFeriado,
    "change",
    (el) => el.getValue() || "",
  );

  controladorFiltros.registrar(
    anioLectivo,
    "change",
    (el) => el.getValue() || "",
  );
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
  const tipoFeriado =
    document
      .querySelector("custom-select[name='filtroTipoFeriado']")
      ?.getValue() || "";
  const anioLectivo =
    document
      .querySelector("custom-select[name='filtroAnioLectivo']")
      ?.getValue() || "";

  if (!dato && !fechaInicio && !fechaFin && !tipoFeriado && !anioLectivo) {
    Listar();
    return;
  }
  document.getElementById("contentList").innerHTML = "";
  const json = await apiRequest(ROUTES.DIA_NO_LECTIVO, "buscar", {
    dato,
    fechaInicio,
    fechaFin,
    idTipoFeriado: tipoFeriado,
    idAnioLectivo: anioLectivo,
  });
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
}

async function verDetalles(id) {
  const json = await apiRequest(ROUTES.DIA_NO_LECTIVO, "mostrar", { id });
  if (json.status) {
    poblarInfoDiaNoLectivo(json.data);
  }
}

function calcularEstadoTemporal(fechaInicio, fechaFin) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicio = new Date(fechaInicio + "T00:00:00");
  const fin = new Date(fechaFin + "T00:00:00");

  if (hoy < inicio) {
    return { texto: "Próximo", bg: "bg-amber-100", text: "text-amber-700" };
  }
  if (hoy > fin) {
    return { texto: "Finalizado", bg: "bg-gray-200", text: "text-gray-600" };
  }
  return { texto: "En curso", bg: "bg-emerald-100", text: "text-emerald-700" };
}

function poblarInfoDiaNoLectivo(data) {
  document.getElementById("nomEventoInfo").textContent = data.nomEvento || "-";

  const esMismoDia = data.fechaInicio === data.fechaFin;

  document.getElementById("fechaInfo").textContent = esMismoDia
    ? formatearFechaCorta(data.fechaInicio)
    : `${formatearFechaCorta(data.fechaInicio)} - ${formatearFechaCorta(data.fechaFin)}`;

  document.getElementById("diaSemanaInfo").textContent = esMismoDia
    ? data.diaInicio
    : `${data.diaInicio} - ${data.diaFin}`;

  document.getElementById("anioLectivoInfo").textContent = data.anio || "-";
  document.getElementById("nomTipoInfo2").textContent =
    data.nomTipoDiaNoLectivo || "-";

  // Estado temporal
  const estado = calcularEstadoTemporal(data.fechaInicio, data.fechaFin);
  const estadoEl = document.getElementById("estadoTemporalInfo");
  estadoEl.textContent = estado.texto;
  estadoEl.className = `inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${estado.bg} ${estado.text}`;

  const calendarioDiaUnico = document.getElementById("calendarioDiaUnico");
  const calendarioRango = document.getElementById("calendarioRango");

  if (esMismoDia) {
    calendarioDiaUnico.classList.remove("hidden");
    calendarioDiaUnico.classList.add("flex");
    calendarioRango.classList.add("hidden");
    calendarioRango.classList.remove("flex");
    const { mes, dia } = obtenerMesDia(data.fechaInicio);
    document.getElementById("mesCortoInfo").textContent = mes;
    document.getElementById("diaNumeroInfo").textContent = dia;
  } else {
    calendarioDiaUnico.classList.add("hidden");
    calendarioDiaUnico.classList.remove("flex");
    calendarioRango.classList.remove("hidden");
    calendarioRango.classList.add("flex");
    const inicio = obtenerMesDia(data.fechaInicio);
    const fin = obtenerMesDia(data.fechaFin);
    document.getElementById("mesCortoInicioInfo").textContent = inicio.mes;
    document.getElementById("diaNumeroInicioInfo").textContent = inicio.dia;
    document.getElementById("mesCortoFinInfo").textContent = fin.mes;
    document.getElementById("diaNumeroFinInfo").textContent = fin.dia;
  }

  const dot = document.getElementById("dotTipoInfo");
  const badge = document.getElementById("badgeTipoInfo");
  const colores = {
    1: { bg: "bg-green-100", dot: "bg-green-500", text: "text-green-700" },
    2: { bg: "bg-blue-100", dot: "bg-blue-500", text: "text-blue-700" },
    3: { bg: "bg-purple-100", dot: "bg-purple-500", text: "text-purple-700" },
  };
  const color = colores[data.idTipoDiaNoLectivo] || colores[1];

  badge.className = `inline-flex self-start items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${color.bg} ${color.text}`;
  dot.className = `w-2 h-2 rounded-full ${color.dot}`;
  document.getElementById("nomTipoInfo").textContent =
    data.nomTipoDiaNoLectivo || "-";
}

window.onDelete = async function (id) {
  AlertService.confirm(
    "¿Estás seguro?",
    "Esta acción no se puede deshacer.",
  ).then(async (result) => {
    if (result) {
      const json = await apiRequest(ROUTES.DIA_NO_LECTIVO, "eliminar", { id });
      if (json.status) {
        AlertService.success("¡Éxito!", json.msg);
        Listar();
      } else {
        AlertService.error("Error", json.msg);
      }
    }
  });
};
window.LimpiarFiltros = function () {
  const searchText = document.querySelector(
    "custom-text-field[name='searchText']",
  );
  if (searchText) {
    controladorFiltros?.sincronizar(searchText, "");
    searchText.initInput();
  }
  const fechaInicio = document.querySelector(
    "custom-datepicker[name='fechaInicio']",
  );
  if (fechaInicio) {
    controladorFiltros?.sincronizar(fechaInicio, "");
    fechaInicio.initInput();
  }

  const fechaFin = document.querySelector("custom-datepicker[name='fechaFin']");
  if (fechaFin) {
    controladorFiltros?.sincronizar(fechaFin, "");
    fechaFin.initInput();
  }
  const filtroTipoFeriado = document.querySelector(
    "custom-select[name='filtroTipoFeriado']",
  );
  if (filtroTipoFeriado) {
    controladorFiltros?.sincronizar(filtroTipoFeriado, "");
    filtroTipoFeriado.initInput();
  }

  const selectAnio = document.querySelector(
    "custom-select[name='filtroAnioLectivo']",
  );
  if (selectAnio) {
    const valorReset = ultimoAnio ? ultimoAnio.id_aniolectivo : "";
    controladorFiltros?.sincronizar(selectAnio, valorReset);
    if (ultimoAnio) {
      selectAnio.setValue(ultimoAnio.id_aniolectivo);
    } else {
      selectAnio.initInput();
    }
  }

  Listar();
};

window.openModalForm = async function () {
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
    `${formatearFecha(anioLectivoActivo.fecha_inicio)} - ${formatearFecha(anioLectivoActivo.fecha_fin)}`;

  ResetHolidayCard();
  ModalManager.open(DialogFormHoliday);
  initHolidayCards();
  limpiarSeleccionFeriadoNacional();
};

window.closeModalForm = function () {
  if (!DialogFormHoliday) return;
  initHolidayCards();
  DialogFormHoliday.close();
};

window.seleccionarPaginaFeriadoNacional = function () {
  feriadosNacionalesSeleccionados.clear();
  document.querySelectorAll(".feriado-checkbox").forEach((cb) => {
    cb.checked = true;
    feriadosNacionalesSeleccionados.add(parseInt(cb.value));
  });
  updateCountersFeriadosNacionales();
};

window.seleccionarTodasFeriadoNacional = function () {
  todosLosFeriadosNacionales.forEach((item) =>
    feriadosNacionalesSeleccionados.add(item.idPlantilla),
  );
  document
    .querySelectorAll(".feriado-checkbox")
    .forEach((cb) => (cb.checked = true));
  updateCountersFeriadosNacionales();
};

window.limpiarSeleccionFeriadoNacional = function () {
  feriadosNacionalesSeleccionados.clear();
  document
    .querySelectorAll(".feriado-checkbox")
    .forEach((cb) => (cb.checked = false));
  updateCountersFeriadosNacionales();
};

window.toggleFiltros = function () {
  const panel = document.getElementById("panelFiltros");
  const btn = document.getElementById("btnToggleFiltros");

  const estaOculto = panel.classList.contains("hidden");

  if (estaOculto) {
    // Abrir
    panel.classList.remove("hidden");
    panel.classList.add("flex");

    const alturaFinal = panel.scrollHeight;
    panel.style.height = "0px";
    panel.style.overflow = "hidden";
    panel.style.opacity = "0";
    panel.style.transition = "height 0.3s ease, opacity 0.3s ease";

    requestAnimationFrame(() => {
      panel.style.height = alturaFinal + "px";
      panel.style.opacity = "1";
    });

    panel.addEventListener(
      "transitionend",
      () => {
        panel.style.height = "auto";
        panel.style.overflow = "visible";
      },
      { once: true },
    );
  } else {
    // Cerrar
    const alturaActual = panel.scrollHeight;
    panel.style.height = alturaActual + "px";
    panel.style.overflow = "hidden";

    requestAnimationFrame(() => {
      panel.style.height = "0px";
      panel.style.opacity = "0";
    });

    panel.addEventListener(
      "transitionend",
      () => {
        panel.classList.add("hidden");
        panel.classList.remove("flex");
        panel.style.height = "";
        panel.style.overflow = "";
        panel.style.opacity = "";
        panel.style.transition = "";
      },
      { once: true },
    );
  }

  btn.classList.toggle("bg-blue-100");
  btn.classList.toggle("text-blue-600");
  btn.classList.toggle("border-blue-300");
};

function updateCountersFeriadosNacionales() {
  document.getElementById("countSelectedFeriadoNacional").textContent =
    feriadosNacionalesSeleccionados.size;
}

window.grabar = async function () {
  const tipoSeleccionado = document.querySelector(
    ".typeholiday-radio:checked",
  )?.value;
  if (!tipoSeleccionado) {
    AlertService.warning(
      "¡Atención!",
      "Por favor, seleccione un tipo de dia no lectivo antes de continuar.",
    );
    return;
  }
  if (tipoSeleccionado === "nacional") {
    if (feriadosNacionalesSeleccionados.size === 0) {
      AlertService.warning("¡Atención!", "Selecciona al menos un feriado");
      return;
    }
    GuardarFeriadosNacionales();
  } else {
    campos = formHoliday.querySelectorAll(
      "custom-text-field, custom-datepicker, custom-select",
    );
    if (!validateForm()) return;
    await GuardarFeriadoManual(tipoSeleccionado);
  }
};

async function GuardarFeriadosNacionales() {
  const json = await apiRequest(
    ROUTES.DIA_NO_LECTIVO,
    "guardarferiadosnacionales",
    {
      idAnioLectivo: anioLectivoActivo.id_aniolectivo,
      feriados: JSON.stringify(
        Array.from(feriadosNacionalesSeleccionados).map((id) => ({
          idPlantilla: id,
        })),
      ),
    },
  );
  if (json.status) {
    AlertService.success("¡Éxito!", json.msg);
    Listar();
    closeModalForm();
  } else {
    AlertService.warning("¡Atención!", json.msg);
  }
}

async function GuardarFeriadoManual(tipo) {
  const formData = new FormData(formHoliday);
  formData.append("idAnioLectivo", anioLectivoActivo.id_aniolectivo);
  formData.append("tipoOrigen", "2");

  // ✅ mapear fechas según tipo
  if (tipo === "especifica") {
    const fecha = formData.get("fechaEspecifica");
    formData.append("fechaInicio", fecha);
    formData.append("fechaFin", fecha);
  } else if (tipo === "rango") {
    formData.append("fechaInicio", formData.get("fechaInicioRango"));
    formData.append("fechaFin", formData.get("fechaFinRango"));
  }
  const json = await apiRequest(
    ROUTES.DIA_NO_LECTIVO,
    "guardarmanual",
    formData,
  );
  if (json.status) {
    AlertService.success("¡Éxito!", json.msg);
    Listar();
    closeModalForm();
  } else {
    AlertService.warning("¡Atención!", json.msg);
  }
}

window.openModalInfo = function (id) {
  if (id === undefined || id === null) return;
  if (!DialogInfoHoliday) return;
  verDetalles(id);
  ModalManager.open(DialogInfoHoliday);
};

window.closeModalInfo = function () {
  if (!DialogInfoHoliday) return;
  DialogInfoHoliday.close();
};

function initInput() {
  campos = formHoliday.querySelectorAll(
    "custom-text-field, custom-datepicker, custom-select",
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
    const contenedor = campo.closest(".campo-feriado");
    if (contenedor && contenedor.classList.contains("hidden")) return;
    if (!campo.checkValidity()) valid = false;
  });
  return valid;
}
init();
