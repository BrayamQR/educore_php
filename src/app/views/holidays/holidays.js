import {
  AlertService,
  formatearFecha,
  normalizarTexto,
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
let anioLectivoActivo = null;

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

  if (document.getElementById("contentList")) {
    //initFiltros();
  }
  formHoliday = document.getElementById("formHoliday");

  /*
    paginatorList = document.getElementById("paginatorList");
  if (paginatorList) {
    paginatorList.addEventListener("page-change", (e) => {
      const container = document.getElementById("contentList");
      container.innerHTML = "";
      e.detail.data.forEach(renderRows);
      container.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  }*/
}

async function Listar() {
  document.getElementById("contentList").innerHTML = "";
  try {
    let resp = await fetch(
      "../../../app/routes/dianolectivo.route.php?op=listar",
    );
    let json = await resp.json();
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
  } catch (error) {
    console.error(error);
  }
}

function renderRows(item) {
  let existingRow = document.getElementById("row_" + item.id_feriado);
  if (existingRow) {
    existingRow.remove();
  }

  let newdiv = document.createElement("div");
  newdiv.id = "row_" + item.id_feriado;
  newdiv.className =
    "flex lg:flex-row flex-col gap-5 p-5 hover:bg-neutral-100 duration-300 ease-linear justify-between";
  newdiv.innerHTML = `
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-3 items-center">
        <h5 class="font-bold text-lg text-gray-700">${item.nom_feriado}</h5>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-300/40 text-blue-700">${formatearFecha(item.fecha_feriado)}</span>
      </div>
      <p class="text-neutral-500 text-sm"> ${item.desc_feriado || "Sin descripción"}</p>
      <div class="inline-flex self-start items-center gap-2 px-2 py-0.5 rounded-full ${
        item.id_tipoferiado === 1
          ? "bg-orange-100"
          : item.id_tipoferiado === 2
            ? "bg-blue-100"
            : "bg-neutral-100"
      }">
        <span class="w-2 h-2 rounded-full ${item.id_tipoferiado === 1 ? "bg-orange-500" : item.id_tipoferiado === 2 ? "bg-blue-500" : "bg-neutral-500"}"></span>
        <span class="text-xs font-semibold ${item.id_tipoferiado === 1 ? "text-orange-700" : item.id_tipoferiado === 2 ? "text-blue-700" : "text-neutral-700"}">${item.id_tipoferiado === 1 ? "Feriado nacional" : "Feriado institucional"}</span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <custom-button-fab
        icon="bi bi-eye-fill"
        btn-class="bg-sky-500 text-white hover:bg-sky-700"
        tooltip="Ver información"
        onclick="openModalInfo(${item.id_feriado})">
      </custom-button-fab>
      <custom-button-fab
        icon="bi bi-tag-fill"
        btn-class="bg-purple-500 text-white hover:bg-purple-700"
        tooltip="Editar"
        onclick="openModalForm(${item.id_feriado})">
      </custom-button-fab>
      <custom-button-fab
        icon="bi bi-trash-fill"
        btn-class="bg-red-500 text-white hover:bg-red-700"
        tooltip="Eliminar"
        onclick="onDelete(${item.id_feriado})">
      </custom-button-fab>
    </div>
  `;

  document.getElementById("contentList").appendChild(newdiv);
}

async function ObtenerFeriadosPendientes() {
  try {
    let resp = await fetch(
      "../../../app/routes/dianolectivo.route.php?op=obtenerferiadospendientes",
    );
    let json = await resp.json();
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
  } catch (error) {
    console.error(error);
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
  try {
    let resp = await fetch(
      "../../../app/routes/genericList.route.php?op=tipodianolectivo",
    );
    let json = await resp.json();
    if (json.status) {
      let data = json.data;
      let ops = data.map((p) => ({
        value: p.id_tipodianolectivo,
        desc: p.nom_tipodianolectivo,
      }));
      return ops;
    }
  } catch (error) {
    console.error(error);
  }
}

async function obtenerAnioActivo() {
  try {
    let resp = await fetch(
      "../../../app/routes/aniolectivo.route.php?op=obteneranioactivo",
    );
    let json = await resp.json();
    if (json.status) {
      anioLectivoActivo = json.data;
      document.getElementById("infoAnioActivo").textContent =
        anioLectivoActivo.anio;
      document.getElementById("infoVigenciaActiva").textContent =
        `${formatearFecha(anioLectivoActivo.fecha_inicio)} - ${formatearFecha(anioLectivoActivo.fecha_fin)}`;
    } else {
      anioLectivoActivo = null;
    }
  } catch (error) {
    console.error(error);
  }
}
/*
async function GuardaryEditar() {
  try {
    let form = document.getElementById("formHoliday");
    const data = new FormData(form);
    let resp = await fetch(
      "../../../app/routes/feriado.route.php?op=guardaryeditar",
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
      AlertService.warning("¡Atención!", json.msg);
    }
  } catch (error) {
    console.error(error);
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

  if (searchText) searchText.addEventListener("input", Filtrar);

  if (fechaInicio) {
    fechaInicio.fp?.config?.onChange?.push(() => Filtrar());
  }
  if (fechaFin) {
    fechaFin.fp?.config?.onChange?.push(() => Filtrar());
  }

  if (tipoFeriado) {
    tipoFeriado.addEventListener("change", () => Filtrar());
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
      document
        .querySelector("custom-datepicker[name='fechaFin']")
        ?.getValue() || "";
    const tipoFeriado =
      document
        .querySelector("custom-select[name='filtroTipoFeriado']")
        ?.getValue() || "";
    if (!dato && !fechaInicio && !fechaFin && !tipoFeriado) {
      Listar();
      return;
    }
    document.getElementById("contentList").innerHTML = "";
    try {
      let formData = new FormData();
      formData.append("dato", dato);
      formData.append("fechaInicio", fechaInicio);
      formData.append("fechaFin", fechaFin);
      formData.append("tipoFeriado", tipoFeriado);
      let resp = await fetch(
        "../../../app/routes/feriado.route.php?op=buscar",
        {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          body: formData,
        },
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
}

async function verDetalles(id) {
  try {
    const formData = new FormData();
    formData.append("id", id);
    let resp = await fetch("../../../app/routes/feriado.route.php?op=mostrar", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      body: formData,
    });
    let json = await resp.json();
    if (json.status) {
      poblarInfoFeriado(json.data);
    }
  } catch (error) {
    console.error(error);
  }
}

function poblarInfoFeriado(data) {
  document.getElementById("nomFeriadoInfo").textContent =
    data.nomFeriado || "-";
  document.getElementById("fechaFeriadoInfo").textContent = data.fechaFeriado
    ? formatearFecha(data.fechaFeriado)
    : "-";
  document.getElementById("descFeriadoInfo").textContent =
    data.descFeriado || "Sin descripción";

  const tipoTexto =
    data.idTipoFeriado == 1
      ? "Feriado nacional"
      : data.idTipoFeriado == 2
        ? "Feriado institucional"
        : "-";
  document.getElementById("tipoFeriadoInfo").textContent = tipoTexto;
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
          "../../../app/routes/feriado.route.php?op=eliminar",
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

;*/
window.LimpiarFiltros = function () {
  document.querySelector("custom-text-field[name='searchText']")?.initInput();
  document.querySelector("custom-datepicker[name='fechaInicio']")?.initInput();
  document.querySelector("custom-datepicker[name='fechaFin']")?.initInput();
  document
    .querySelector("custom-select[name='filtroTipoFeriado']")
    ?.initInput();
  Listar();
};

window.openModalForm = async function (id = null) {
  await obtenerAnioActivo();
  if (!anioLectivoActivo) {
    AlertService.warning(
      "¡Atención!",
      "No hay un año lectivo activo. Por favor, configure un año lectivo activo antes de continuar.",
    );
    return;
  }
  ResetHolidayCard();
  DialogFormHoliday.open();
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
  const formData = new FormData();
  formData.append("idAnioLectivo", anioLectivoActivo.id_aniolectivo);
  formData.append(
    "feriados",
    JSON.stringify(
      Array.from(feriadosNacionalesSeleccionados).map((id) => ({
        idPlantilla: id,
      })),
    ),
  );
  try {
    let resp = await fetch(
      "../../../app/routes/dianolectivo.route.php?op=guardarferiadosnacionales",
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
      // Listar();
      closeModalForm();
    } else {
      AlertService.warning("¡Atención!", json.msg);
    }
  } catch (error) {
    console.error(error);
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

  try {
    let resp = await fetch(
      "../../../app/routes/dianolectivo.route.php?op=guardarmanual",
      { method: "POST", mode: "cors", cache: "no-cache", body: formData },
    );
    let json = await resp.json();
    if (json.status) {
      AlertService.success("¡Éxito!", json.msg);
      // Listar();
      closeModalForm();
    } else {
      AlertService.warning("¡Atención!", json.msg);
    }
  } catch (error) {
    console.error(error);
  }
}

/*
window.openModalInfo = function (id) {
  if (id === undefined || id === null) return;
  if (!DialogInfoHoliday) return;
  verDetalles(id);
  DialogInfoHoliday.open();
};

window.closeModalInfo = function () {
  if (!DialogInfoHoliday) return;
  DialogInfoHoliday.close();
};
*/

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
