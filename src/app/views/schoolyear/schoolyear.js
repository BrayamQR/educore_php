import {
  AlertService,
  formatearFecha,
} from "../../../shared/js/globalscripts.js";

let DialogFormSchoolYear = null;
let DialogConfigPeriod = null;
let formSchoolYear;
let campos = [];
let paginatorList = null;

let valoresOriginales = {};

const CONFIG_PERIODO = {
  1: {
    label: "Bimestre",
    cantidad: 4,
    msgInfo:
      "Al guardar, se crearán automáticamente 4 periodos (bimestres) para este año académico",
    msgImportante:
      'Después de guardar, podrás configurar las fechas de inicio y fin de cada bimestre desde la opción de "Configurar periodos"',
  },
  2: {
    label: "Trimestre",
    cantidad: 3,
    msgInfo:
      "Al guardar, se crearán automáticamente 3 periodos (trimestres) para este año académico",
    msgImportante:
      'Después de guardar, podrás configurar las fechas de inicio y fin de cada trimestre desde la opción de "Configurar periodos"',
  },
};

// ── INIT ─────────────────────────────────────────────────────
function init() {
  paginatorList = document.getElementById("paginatorList");
  if (paginatorList) {
    paginatorList.addEventListener("page-change", (e) => {
      const container = document.getElementById("contentList");
      container.innerHTML = "";
      e.detail.data.forEach(renderRows);
      container.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  DialogFormSchoolYear = document.getElementById("DialogFormSchoolYear");
  DialogConfigPeriod = document.getElementById("DialogConfigPeriod");

  if (document.getElementById("contentList")) {
    Listar();
  }

  formSchoolYear = document.getElementById("formSchoolYear");
  if (formSchoolYear && !formSchoolYear.hasSubmitListener) {
    formSchoolYear.addEventListener("submit", async (e) => {
      e.preventDefault();
      campos = formSchoolYear.querySelectorAll(
        "custom-text-field, custom-datepicker, custom-select",
      );
      if (!validateForm()) return;
      GuardaryEditar();
    });
    formSchoolYear.hasSubmitListener = true;
  }
}

// ── MODALES ───────────────────────────────────────────────────
window.openModalForm = async function (id = null) {
  if (!DialogFormSchoolYear) return;

  if (id === null) {
    const [vencidos, noCerrados] = await Promise.all([
      obtenerAniosVencidos(),
      obtenerAniosNoCerrados(),
    ]);

    if (vencidos.length > 0) {
      AlertService.warning(
        "¡Atención!",
        "Tienes años lectivos vencidos pendientes de cierre. Ciérralos antes de crear uno nuevo.",
      );
      return;
    }
    if (noCerrados.length > 0) {
      AlertService.warning(
        "¡Atención!",
        "Ya existe un año lectivo en curso. Solo puede haber uno activo a la vez.",
      );
      return;
    }
  }

  DialogFormSchoolYear.open();
  setTimeout(() => {
    id === null ? initInput() : Mostrar(id);
    initSelectTipoPeriodo();
  }, 0);
};

window.closeModalForm = function () {
  if (!DialogFormSchoolYear) return;
  initInput();
  DialogFormSchoolYear.close();
};

window.openModalConfigPeriod = async function (id) {
  if (!DialogConfigPeriod) return;
  await ObtenerPeriodos(id);
  DialogConfigPeriod.open();
};

window.closeModalConfigPeriod = function () {
  if (!DialogConfigPeriod) return;
  DialogConfigPeriod.close();
};

// ── LISTAR ────────────────────────────────────────────────────
async function Listar() {
  document.getElementById("contentList").innerHTML = "";
  try {
    let resp = await fetch(
      "../../../app/routes/aniolectivo.route.php?op=listar",
    );
    let json = await resp.json();
    if (json.status) {
      paginatorList.setData(json.data);
    } else {
      document.getElementById("contentList").innerHTML = `
        <div class="p-5 text-center text-gray-500">
          <i class="bi bi-emoji-astonished text-4xl mb-3 block"></i>
          <p class="font-medium">${json.msg || "No se encontraron datos"}</p>
          <p class="text-sm mt-2 text-gray-400">No se encontraron registros</p>
        </div>
      `;
    }
  } catch (error) {
    console.error(error);
  }

  verificarAniosVencidos(); // ✅ llamada independiente
}

// ── SELECT TIPO PERIODO ───────────────────────────────────────
function initSelectTipoPeriodo() {
  const select = document.querySelector("custom-select[name='idTipoPeriodo']");
  if (!select) return;
  select.addEventListener("change", (e) => {
    const esEdicion = Object.keys(valoresOriginales).length > 0;
    // ✅ en edición solo mostrar si cambió el tipo
    if (esEdicion && e.detail.value === valoresOriginales.idTipoPeriodo) {
      // volvió al valor original → ocultar secciones
      [
        "seccionInfoPeriodo",
        "seccionListaPeriodos",
        "seccionImportante",
      ].forEach((id) => {
        const sec = document.getElementById(id);
        if (sec) {
          sec.classList.add("hidden");
          sec.classList.remove("fade-in");
        }
      });
      return;
    }
    actualizarSeccionesPeriodo(e.detail.value);
  });
}

function actualizarSeccionesPeriodo(value) {
  const secInfo = document.getElementById("seccionInfoPeriodo");
  const secLista = document.getElementById("seccionListaPeriodos");
  const secImportante = document.getElementById("seccionImportante");

  const config = CONFIG_PERIODO[value];
  if (!config) return;

  secInfo.querySelector("p").textContent = config.msgInfo;
  secImportante.querySelector("p").textContent = config.msgImportante;

  secLista.querySelectorAll(".periodo-item").forEach((el) => el.remove());
  for (let i = 1; i <= config.cantidad; i++) {
    const div = document.createElement("div");
    div.className = "flex gap-3 items-center periodo-item";
    div.innerHTML = `
      <i class="bi bi-check-circle text-blue-600"></i>
      <span>${config.label} ${i}</span>
    `;
    secLista.appendChild(div);
  }

  [secInfo, secLista, secImportante].forEach((sec) => {
    sec.classList.remove("hidden", "fade-in");
    void sec.offsetWidth;
    sec.classList.remove("hidden");
    sec.classList.add("fade-in");
  });
}

// ── RENDER ROWS ───────────────────────────────────────────────
function renderRows(item) {
  let existingRow = document.getElementById("row_" + item.id_aniolectivo);
  if (existingRow) existingRow.remove();

  const estadoBadge = () => {
    switch (Number(item.estado)) {
      case 1:
        return `<div class="inline-flex self-start items-center gap-2 px-2 py-0.5 rounded-full bg-green-100">
        <span class="w-2 h-2 rounded-full bg-green-500"></span>
        <span class="text-xs font-semibold text-green-700">Activo</span>
      </div>`;
      case 2:
        return `<div class="inline-flex self-start items-center gap-2 px-2 py-0.5 rounded-full bg-red-100">
        <span class="w-2 h-2 rounded-full bg-red-400"></span>
        <span class="text-xs font-semibold text-red-500">Cerrado</span>
      </div>`;
      default:
        return `<div class="inline-flex self-start items-center gap-2 px-2 py-0.5 rounded-full bg-orange-100">
        <span class="w-2 h-2 rounded-full bg-orange-500"></span>
        <span class="text-xs font-semibold text-orange-700">Pendiente</span>
      </div>`;
    }
  };

  const accionesBadge = () => {
    const verInfo = `<custom-button-fab icon="bi bi-eye-fill" btn-class="bg-sky-500 text-white hover:bg-sky-700" tooltip="Ver información" onclick="openModalInfo(${item.id_aniolectivo})"></custom-button-fab>`;

    if (Number(item.estado) !== 0) return verInfo;

    const activar =
      item.total_periodos == item.periodos_configurados
        ? `<custom-button-fab icon="bi bi-play-fill" btn-class="bg-blue-500 text-white hover:bg-blue-700" tooltip="Activar año lectivo" onclick="onActive(${item.id_aniolectivo})"></custom-button-fab>`
        : "";

    return `
    ${verInfo}
    ${activar}
    <custom-button-fab icon="bi bi-calendar-range-fill" btn-class="bg-green-500 text-white hover:bg-green-700" tooltip="Configurar periodo" onclick="openModalConfigPeriod(${item.id_aniolectivo})"></custom-button-fab>
    <custom-button-fab icon="bi bi-tag-fill" btn-class="bg-purple-500 text-white hover:bg-purple-700" tooltip="Editar" onclick="openModalForm(${item.id_aniolectivo})"></custom-button-fab>
    <custom-button-fab icon="bi bi-trash-fill" btn-class="bg-red-500 text-white hover:bg-red-700" tooltip="Eliminar" onclick="onDelete(${item.id_aniolectivo})"></custom-button-fab>
  `;
  };

  let newdiv = document.createElement("div");
  newdiv.id = "row_" + item.id_aniolectivo;
  newdiv.className =
    "flex lg:flex-row flex-col gap-5 p-5 hover:bg-neutral-100 duration-300 ease-linear justify-between";
  newdiv.innerHTML = `
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-3 items-center">
        <h5 class="font-bold text-lg text-gray-700">Año lectivo ${item.anio}</h5>
        ${
          Number(item.id_tipoperiodo) === 1
            ? `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-300/40 text-purple-700">Bimestral</span>`
            : `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-300/40 text-blue-700">Trimestral</span>`
        }
        ${
          item.total_periodos == item.periodos_configurados
            ? `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                <i class="bi bi-check-circle"></i> Configurado
             </span>`
            : `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                <i class="bi bi-exclamation-circle"></i> Pendiente configurar (${item.periodos_configurados}/${item.total_periodos})
             </span>`
        }
      </div>
      <div class="text-neutral-500 text-sm font-light">
        del <span class="font-semibold">${formatearFecha(item.fecha_inicio)}</span>
        al <span class="font-medium">${formatearFecha(item.fecha_fin)}</span>
      </div>
      ${estadoBadge()}
    </div>
    <div class="flex items-center gap-2">
      ${accionesBadge()}
    </div>
  `;
  document.getElementById("contentList").appendChild(newdiv);
}

// ── INIT INPUT ────────────────────────────────────────────────
function initInput() {
  document.getElementById("idAnioLectivo").value = "";
  campos = formSchoolYear.querySelectorAll(
    "custom-text-field, custom-datepicker, custom-select",
  );
  campos.forEach((campo) => {
    if (typeof campo.initInput === "function") campo.initInput();
  });
  valoresOriginales = {};
  ["seccionInfoPeriodo", "seccionListaPeriodos", "seccionImportante"].forEach(
    (id) => {
      const sec = document.getElementById(id);
      if (sec) {
        sec.classList.add("hidden");
        sec.classList.remove("fade-in");
      }
    },
  );
}

async function Mostrar(id) {
  const formData = new FormData();
  formData.append("id", id);
  try {
    let resp = await fetch(
      "../../../app/routes/aniolectivo.route.php?op=mostrar",
      { method: "POST", mode: "cors", cache: "no-cache", body: formData },
    );
    let json = await resp.json();
    if (json.status) {
      document.getElementById("idAnioLectivo").value = json.data.idAnioLectivo;
      initCustomValues(json.data);

      valoresOriginales = {
        fechaInicio: json.data.fechaInicio,
        fechaFin: json.data.fechaFin,
        idTipoPeriodo: String(json.data.idTipoPeriodo),
      };
      initSelectTipoPeriodo();
    }
  } catch (error) {
    console.error(error);
  }
}

window.onActive = async function (id) {
  AlertService.confirm(
    "¿Estas seguro?",
    "Una vez activado, este año lectivo entrará en uso y no podrá ser editado, eliminado ni tendrá cambios en sus períodos.",
  ).then(async (result) => {
    if (result) {
      let formData = new FormData();
      formData.append("id", id);
      try {
        let resp = await fetch(
          "../../../app/routes/aniolectivo.route.php?op=activaranio",
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
          "../../../app/routes/aniolectivo.route.php?op=eliminar",
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

// ── OBTENER PERIODOS ──────────────────────────────────────────
async function ObtenerPeriodos(id) {
  const formData = new FormData();
  formData.append("id", id);
  try {
    let resp = await fetch(
      "../../../app/routes/aniolectivo.route.php?op=obtenerperiodos",
      { method: "POST", mode: "cors", cache: "no-cache", body: formData },
    );
    let json = await resp.json();
    if (json.status) {
      poblarModalConfigPeriod(json.data);
    } else {
      AlertService.warning("¡Atención!", json.msg);
    }
  } catch (error) {
    console.error(error);
  }
}

// ── POBLAR MODAL CONFIG PERIOD ────────────────────────────────
function poblarModalConfigPeriod(data) {
  document.getElementById("infoAnio").textContent = data.anio;
  document.getElementById("infoTipoPeriodo").textContent = data.descTipoPeriodo;
  document.getElementById("infoCantidadPeriodos").textContent =
    `${data.periodos.length} ${data.descTipoPeriodo === "Bimestral" ? "bimestres" : "trimestres"}`;
  document.getElementById("notaRango").textContent =
    `Las fechas de los períodos deben estar dentro del rango del año académico (${formatearFecha(data.fechaInicio)} - ${formatearFecha(data.fechaFin)})`;

  const lista = document.getElementById("listaPeriodos");
  lista.innerHTML = "";

  data.periodos.forEach((periodo, index) => {
    const estadoClass =
      periodo.fechaInicio && periodo.fechaFin
        ? "bg-green-100 text-green-700"
        : "bg-orange-100 text-orange-700";
    const estadoDot =
      periodo.fechaInicio && periodo.fechaFin
        ? "bg-green-500"
        : "bg-orange-500";
    const estadoLabel =
      periodo.fechaInicio && periodo.fechaFin ? "Completo" : "Falta configurar";
    const minDateInicio = index === 0 ? data.fechaInicio : null;

    const div = document.createElement("div");
    div.id = `rowPeriodo_${periodo.idPeriodo}`;
    div.className =
      "grid grid-cols-[60px_1fr_1fr_1fr_130px] gap-4 px-4 py-3 items-center hover:bg-gray-50 duration-200";
    div.innerHTML = `
      <span class="font-medium text-gray-500">${periodo.ordenPeriodo}</span>
      <span class="font-medium text-gray-700">${periodo.descPeriodo}</span>
      <custom-datepicker
        id="dpInicio_${periodo.idPeriodo}"
        label="Fecha inicial"
        name="fechaInicio_${periodo.idPeriodo}"
        ${minDateInicio ? `min-date="${minDateInicio}"` : ""}
        max-date="${data.fechaFin}"
        disable-saturdays
        disable-sundays>
      </custom-datepicker>
      <custom-datepicker
        id="dpFin_${periodo.idPeriodo}"
        label="Fecha final"
        name="fechaFin_${periodo.idPeriodo}"
        max-date="${data.fechaFin}"
        disable-saturdays
        disable-sundays>
      </custom-datepicker>
      <span id="estadoPeriodo_${periodo.idPeriodo}" class="inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold ${estadoClass}">
        <span class="w-2 h-2 rounded-full ${estadoDot}"></span>
        ${estadoLabel}
      </span>
    `;
    lista.appendChild(div);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const dpInicio = document.getElementById(
          `dpInicio_${periodo.idPeriodo}`,
        );
        const dpFin = document.getElementById(`dpFin_${periodo.idPeriodo}`);

        // ✅ Setear valores solo si existen
        if (periodo.fechaInicio && dpInicio)
          dpInicio.setValue(periodo.fechaInicio);
        if (periodo.fechaFin && dpFin) dpFin.setValue(periodo.fechaFin);

        // ✅ Registrar listeners aquí dentro, una sola vez, cuando el elemento ya existe
        if (dpInicio && dpFin) {
          dpInicio.addEventListener("change", (e) => {
            if (!e.detail || !e.detail.value) return;
            dpFin.setMinDate(e.detail.value);
          });

          dpFin.addEventListener("change", (e) => {
            if (!e.detail || !e.detail.value) return;
            const fechaFin = e.detail.value;

            const spanEstado = document.getElementById(
              `estadoPeriodo_${periodo.idPeriodo}`,
            );
            const inicioVal = dpInicio.getValue();
            if (inicioVal && spanEstado) {
              spanEstado.className =
                "inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700";
              spanEstado.innerHTML = `<span class="w-2 h-2 rounded-full bg-green-500"></span> Completo`;
            }

            const siguiente = data.periodos[index + 1];
            if (siguiente) {
              const nextDay = new Date(fechaFin + "T00:00:00");
              nextDay.setDate(nextDay.getDate() + 1);
              while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
                nextDay.setDate(nextDay.getDate() + 1);
              }
              const nextDayStr = nextDay.toISOString().split("T")[0];
              const dpInicioSiguiente = document.getElementById(
                `dpInicio_${siguiente.idPeriodo}`,
              );
              const dpFinSiguiente = document.getElementById(
                `dpFin_${siguiente.idPeriodo}`,
              );
              if (dpInicioSiguiente) {
                dpInicioSiguiente.setMinDate(nextDayStr);
                dpInicioSiguiente.setValue(nextDayStr);
                dpFinSiguiente.setMinDate(nextDayStr);
              }
            }
          });
        }
      });
    });
  });
}

// ── GUARDAR PERIODOS ──────────────────────────────────────────
window.guardarPeriodos = async function () {
  const lista = document.getElementById("listaPeriodos");
  const filas = lista.querySelectorAll("[id^='rowPeriodo_']");

  const periodos = [];
  let hayIncompleto = false;

  filas.forEach((fila) => {
    const id = fila.id.replace("rowPeriodo_", "");
    const dpInicio = document.getElementById(`dpInicio_${id}`);
    const dpFin = document.getElementById(`dpFin_${id}`);
    const inicio = dpInicio?.getValue() || null;
    const fin = dpFin?.getValue() || null;

    if ((inicio && !fin) || (!inicio && fin)) {
      hayIncompleto = true;
      return;
    }
    if (inicio && fin) {
      periodos.push({ idPeriodo: id, fechaInicio: inicio, fechaFin: fin });
    }
  });

  if (hayIncompleto) {
    AlertService.warning(
      "¡Atención!",
      "Hay períodos con fecha de inicio o fin incompleta. Completa ambas fechas o déjalos vacíos",
    );
    return;
  }
  if (periodos.length === 0) {
    AlertService.warning(
      "¡Atención!",
      "Debes configurar al menos un período con fecha de inicio y fin",
    );
    return;
  }

  try {
    const formData = new FormData();
    formData.append("periodos", JSON.stringify(periodos));
    let resp = await fetch(
      "../../../app/routes/aniolectivo.route.php?op=guardarperiodos",
      { method: "POST", mode: "cors", cache: "no-cache", body: formData },
    );
    let json = await resp.json();
    if (json.status) {
      AlertService.success("¡Éxito!", json.msg);
      closeModalConfigPeriod();
      Listar();
    } else {
      AlertService.warning("¡Atención!", json.msg);
    }
  } catch (error) {
    console.error(error);
  }
};

// ── GUARDAR Y EDITAR AÑO ──────────────────────────────────────
async function GuardaryEditar() {
  try {
    let form = document.getElementById("formSchoolYear");
    const data = new FormData(form);
    const idAnioLectivo = data.get("idAnioLectivo");

    if (idAnioLectivo) {
      const fechaInicio = data.get("fechaInicio");
      const fechaFin = data.get("fechaFin");
      const idTipoPeriodo = data.get("idTipoPeriodo");

      const cambioFechas =
        fechaInicio !== valoresOriginales.fechaInicio ||
        fechaFin !== valoresOriginales.fechaFin;
      const cambioTipoPeriodo =
        idTipoPeriodo !== valoresOriginales.idTipoPeriodo;

      if (cambioFechas || cambioTipoPeriodo) {
        let detalle = "";
        if (cambioFechas && cambioTipoPeriodo) {
          detalle = "Cambiaste las fechas y el tipo de periodo.";
        } else if (cambioFechas) {
          detalle = "Cambiaste las fechas del año lectivo.";
        } else {
          detalle = "Cambiaste el tipo de periodo.";
        }
        const confirmado = await AlertService.confirm(
          "¿Estás seguro?",
          `${detalle} Las configuraciones de periodos realizadas anteriormente se perderán.`,
        );
        if (!confirmado) return;
      }
    }

    let resp = await fetch(
      "../../../app/routes/aniolectivo.route.php?op=guardaryeditar",
      { method: "POST", mode: "cors", cache: "no-cache", body: data },
    );
    let json = await resp.json();
    if (json.status) {
      AlertService.success("¡Éxito!", json.msg);
      Listar();
      closeModalForm();
    } else {
      AlertService.warning("¡Atención!", json.msg);
    }
  } catch (error) {
    console.error(error);
  }
}

// ── BANNER AÑOS VENCIDOS ──────────────────────────────────────

async function verificarAniosVencidos() {
  const banner = document.getElementById("bannerAniosVencidos");
  if (!banner) return;
  const vencidos = await obtenerAniosVencidos();
  if (vencidos.length > 0) {
    banner.className =
      "bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between gap-3";
    banner.innerHTML = `
        <div class="flex items-center gap-3">
          <i class="bi bi-exclamation-triangle-fill text-red-500 text-xl"></i>
          <div>
            <p class="font-semibold text-red-700">
              Hay ${vencidos.length} año${vencidos.length !== 1 ? "s" : ""} lectivo${vencidos.length !== 1 ? "s" : ""} pendiente${vencidos.length !== 1 ? "s" : ""} de cierre
            </p>
            <p class="text-sm text-red-500">
              ${vencidos.map((v) => `Año lectivo ${v.anio}`).join(", ")}
            </p>
          </div>
        </div>
        <custom-button
          btn-class="bg-red-500 hover:bg-red-700 text-white text-sm"
          label="Cerrar años"
          icon="bi bi-lock-fill"
          onclick="cerrarAniosVencidos()">
        </custom-button>
      `;
  } else {
    banner.className = "hidden";
    banner.innerHTML = "";
  }
}

async function obtenerAniosVencidos() {
  try {
    const resp = await fetch(
      "../../../app/routes/aniolectivo.route.php?op=obtenervencidos",
    );
    const json = await resp.json();
    return json.status ? json.data : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function obtenerAniosNoCerrados() {
  try {
    const resp = await fetch(
      "../../../app/routes/aniolectivo.route.php?op=obteneractivos",
    );
    const json = await resp.json();
    return json.status ? json.data : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

// ── CERRAR AÑOS VENCIDOS ──────────────────────────────────────
window.cerrarAniosVencidos = async function () {
  const confirmado = await AlertService.confirm(
    "¿Cerrar años vencidos?",
    "Esta acción cerrará todos los años lectivos que han superado su fecha de fin. ¿Deseas continuar?",
  );
  if (!confirmado) return;

  try {
    const resp = await fetch(
      "../../../app/routes/aniolectivo.route.php?op=cerrarvencidos",
      { method: "POST", mode: "cors", cache: "no-cache" },
    );
    const json = await resp.json();
    if (json.status) {
      AlertService.success("¡Éxito!", json.msg);
      Listar();
    } else {
      AlertService.warning("¡Atención!", json.msg);
    }
  } catch (error) {
    console.error(error);
  }
};

// ── VALIDAR FORM ──────────────────────────────────────────────
function validateForm() {
  let valid = true;
  campos.forEach((campo) => {
    if (!campo.checkValidity()) valid = false;
  });
  return valid;
}

init();
