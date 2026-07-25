import {
  AlertService,
  formatearFechaCorta,
  apiRequest,
  ROUTES,
  formatearFecha,
  formatearFechaNumerica,
  obtenerMesDia,
  formatearHora,
  crearControladorFiltros,
} from "../../../shared/js/globalscripts.js";

let DialogFormAcademicActivity = null;
let DialogInfoAcademicActivity = null;
let formAcademicActivity = null;
let campos = [];
let checkboxesParticipantes = [];
let fielsetParticipantes = null;
let fieldsetLegentParticipante = null;
let fecha = null;
let participantesError = null;
let anioLectivoActivo = null;
let paginatorList = null;
let ultimoAnio = null;
let chkRango = null;
let selectFiltroTipoActividad = null;
let selectFiltroAnioLectivo = null;
let controladorFiltros = null;

async function init() {
  await obtenerAnioActivo();
  await obtenerUltimoAnio();

  DialogFormAcademicActivity = document.getElementById(
    "DialogFormAcademicActivity",
  );
  DialogInfoAcademicActivity = document.getElementById(
    "DialogInfoAcademicActivity",
  );
  formAcademicActivity = document.getElementById("formAcademicActivity");
  participantesError = document.getElementById("participantesError");
  fielsetParticipantes = document.getElementById("fielsetParticipantes");
  fieldsetLegentParticipante = document.getElementById(
    "fieldsetLegentParticipante",
  );

  paginatorList = document.getElementById("paginatorList");
  if (paginatorList) {
    paginatorList.addEventListener("page-change", (e) => {
      const container = document.getElementById("contentList");
      container.innerHTML = "";
      e.detail.data.forEach(renderRows);
      container.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const selectTipoActividad = document.querySelector(
    "custom-select[name='idTipoActividad']",
  );
  if (selectTipoActividad) {
    const tipo = await getTipoActividad();
    selectTipoActividad.setOptions(tipo);
  }

  selectFiltroTipoActividad = document.querySelector(
    "custom-select[name='filtroTipoActividad']",
  );

  if (selectFiltroTipoActividad) {
    const tipo = await getTipoActividad();
    selectFiltroTipoActividad.setOptions(tipo);
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

  const tipoParticipante = await getTipoParticipante();
  if (tipoParticipante) renderParticipantes(tipoParticipante);

  if (formAcademicActivity && !formAcademicActivity.hasSubmitListener) {
    formAcademicActivity.addEventListener("submit", (e) => {
      e.preventDefault();
      campos = formAcademicActivity.querySelectorAll(
        "custom-text-field, custom-select,custom-datepicker, custom-timepicker, custom-textarea",
      );
      if (!validateForm()) {
        console.log("Formulario no válido");
        return;
      }
      GuardaryEditar();
    });
    formAcademicActivity.hasSubmitListener = true;

    formAcademicActivity.addEventListener("change", (e) => {
      if (e.target.name === "participantes[]") {
        const algunoMarcado =
          formAcademicActivity.querySelectorAll(
            'input[name="participantes[]"]:checked',
          ).length > 0;
        if (algunoMarcado) ocultarErrorParticipantes();
      }
    });
  }
  chkRango = document.getElementById("chkRangoFechas");
  if (chkRango) {
    chkRango.addEventListener("change", (e) =>
      toggleFechaFin(e.target.checked),
    );
  }

  if (document.getElementById("contentList")) {
    initFiltros();
    Listar();
  }
}

window.openModalForm = function (id = null) {
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

  if (!DialogFormAcademicActivity) return;
  ModalManager.open(DialogFormAcademicActivity);
  setTimeout(() => {
    if (id === null) {
      initInput();
    } else {
      Mostrar(id);
    }
  });
};

window.closeModalForm = function () {
  if (!DialogFormAcademicActivity) return;
  initInput();
  DialogFormAcademicActivity.close();
};

window.openModalInfo = function (id = null) {
  if (id === undefined || id === null) return;
  if (!DialogInfoAcademicActivity) return;
  verDetalles(id);
  ModalManager.open(DialogInfoAcademicActivity);
};

window.closeModalInfo = function () {
  if (!DialogInfoAcademicActivity) return;
  DialogInfoAcademicActivity.close();
};

async function verDetalles(id) {
  const actividad = await ObtenerActividad(id);
  if (!actividad) return;
  poblarInfoActividad(actividad);
}

function poblarInfoActividad(data) {
  document.getElementById("nomActividadInfo").textContent =
    data.nomActividad || "-";

  document.getElementById("descActividadInfo").textContent =
    data.descActividad || "-";

  const esMismoDia = data.fechaInicio === data.fechaFin;

  // ---- Fecha ----
  document.getElementById("fechaInfo").textContent = esMismoDia
    ? formatearFechaCorta(data.fechaInicio)
    : `${formatearFechaCorta(data.fechaInicio)} - ${formatearFechaCorta(data.fechaFin)}`;

  document.getElementById("diaSemanaInfo").textContent = esMismoDia
    ? data.diaInicio
    : `${data.diaInicio} - ${data.diaFin}`;

  // ---- Estado temporal ----
  const estado = calcularEstadoTemporal(data.fechaInicio, data.fechaFin);
  const estadoEl = document.getElementById("estadoTemporalInfo");
  estadoEl.textContent = estado.texto;
  estadoEl.className = `inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${estado.bg} ${estado.text}`;

  // ---- Hoja de calendario ----
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

  // ---- Tipo de actividad ----
  const dot = document.getElementById("dotTipoInfo");
  const badge = document.getElementById("badgeTipoInfo");

  dot.style.cssText = `background-color: ${data.color};`;
  badge.style.cssText = `
    background-color: color-mix(in srgb, ${data.color} 15%, white);
    color: ${data.color};
  `;
  document.getElementById("nomTipoInfo").textContent =
    data.descTipoActividad || "-";

  // ---- Horario ----
  document.getElementById("horarioInfo").textContent =
    `${formatearHora(data.horaIngreso)} - ${formatearHora(data.horaSalida)}`;

  // ---- Lugar ----
  document.getElementById("lugarInfo").textContent = data.lugar || "-";

  // ---- Registra asistencia ----
  const badgeAsistencia = document.getElementById("badgeAsistenciaInfo");
  if (data.registraAsistencia) {
    badgeAsistencia.className =
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700";
  } else {
    badgeAsistencia.className = "hidden";
  }

  // ---- Suspende clases ----
  const badgeSuspension = document.getElementById("badgeSuspensionInfo");
  if (data.suspendeClases) {
    badgeSuspension.className =
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700";
  } else {
    badgeSuspension.className = "hidden";
  }

  // ---- Participantes ----
  const contenedorParticipantes = document.getElementById(
    "listaParticipantesInfo",
  );
  contenedorParticipantes.innerHTML = "";

  (data.participantes || []).forEach((p) => {
    const chip = document.createElement("span");
    chip.className =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100";
    chip.textContent = p.descTipoParticipante;
    contenedorParticipantes.appendChild(chip);
  });

  document.getElementById("anioLectivoInfo").textContent = data.anio || "-";

  // ---- Lugar ----
  document.getElementById("lugarInfo").textContent = data.lugar || "-";
}

function initInput() {
  document.getElementById("idActividad").value = "";
  campos = formAcademicActivity.querySelectorAll(
    "custom-text-field, custom-select,custom-datepicker, custom-timepicker, custom-textarea",
  );
  campos.forEach((campo) => {
    if (typeof campo.initInput === "function") {
      campo.initInput();
    }
  });

  checkboxesParticipantes = formAcademicActivity.querySelectorAll(
    'input[name="participantes[]"]',
  );
  checkboxesParticipantes.forEach((chk) => (chk.checked = false));
  if (chkRango) chkRango.checked = false;
  toggleFechaFin(false);
}

function validateForm() {
  let valid = true;

  campos.forEach((campo) => {
    if (!campo.checkValidity()) valid = false;
  });

  const algunoMarcado = getParticipantesSelect().length > 0;
  if (!algunoMarcado) {
    mostrarErrorParticipantes();
    valid = false;
  } else {
    ocultarErrorParticipantes();
  }
  return valid;
}

async function getTipoParticipante() {
  const json = await apiRequest(ROUTES.GENERIC_LIST, "tipoparticipante");
  if (json.status) {
    let data = json.data;
    let ops = data.map((p) => ({
      value: p.id_tipoparticipante,
      desc: p.desc_tipoparticipante,
    }));
    return ops;
  }
}

async function getTipoActividad() {
  const json = await apiRequest(ROUTES.GENERIC_LIST, "tipoactividad");
  if (json.status) {
    let data = json.data;
    let ops = data.map((p) => ({
      value: p.id_tipoactividad,
      desc: p.desc_tipoactividad,
    }));
    return ops;
  }
}

function toggleFechaFin(mostrar) {
  const fechaFinField = document.getElementById("fechaFinField");
  const fechaInicioField = document.getElementById("fechaInicioField");
  const fechaInicio = document.querySelector("[name='fechaInicio']");
  const fechaFin = document.querySelector("[name='fechaFin']");
  if (!fechaFinField || !fechaInicioField || !fechaFin) return;

  fechaInicioField.classList.toggle("lg:col-span-2", !mostrar);
  fechaFinField.classList.toggle("hidden", !mostrar);

  if (mostrar) {
    fechaFinField?.classList.remove("hidden");
    fechaInicio.setLabel("Fecha de inicio");
    fechaFin.setRequired(true);
  } else {
    fechaFinField?.classList.add("hidden");
    fechaInicio.setLabel("Fecha");
    fechaFin.setRequired(false);
  }
}

function renderParticipantes(tipos) {
  const container = document.getElementById("participantesContainer");
  if (!container) return;

  container.innerHTML = tipos
    .map((tipo) => {
      const id = `participante-${tipo.value}`;
      return `
        <div class="flex items-center gap-2">
            <input type="checkbox"
                class="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
                name="participantes[]"
                id="participante${id}"
                value="${tipo.value}">
            <label for="participante${id}" class="text-sm text-gray-700 cursor-pointer">
                ${tipo.desc}
            </label>
        </div>
      `;
    })
    .join("");
}

function getParticipantesSelect() {
  return Array.from(
    formAcademicActivity.querySelectorAll(
      'input[name="participantes[]"]:checked',
    ),
  ).map((chk) => chk.value);
}

function mostrarErrorParticipantes() {
  if (participantesError) {
    participantesError.classList.remove("hidden");
    fielsetParticipantes.classList.remove("border-gray-200");
    fielsetParticipantes.classList.add("border-red-700");
    fieldsetLegentParticipante.classList.remove("text-gray-700");
    fieldsetLegentParticipante.classList.add("text-red-700");
  }
}

function ocultarErrorParticipantes() {
  if (participantesError) {
    participantesError.classList.add("hidden");
    fielsetParticipantes.classList.remove("border-red-700");
    fielsetParticipantes.classList.add("border-gray-200");
    fieldsetLegentParticipante.classList.remove("text-red-700");
    fieldsetLegentParticipante.classList.add("text-gray-700");
  }
}

async function GuardaryEditar() {
  let form = document.getElementById("formAcademicActivity");
  const data = new FormData(form);
  const participantes = getParticipantesSelect();
  data.delete("participantes[]");
  participantes.forEach((participante) =>
    data.append("participantes[]", participante),
  );
  data.append("idAnioLectivo", anioLectivoActivo.id_aniolectivo);
  const registraAsistencia = document.getElementById("registraAsistencia");
  const suspendeClases = document.getElementById("suspendeClases");
  const chkRangoFechas = document.getElementById("chkRangoFechas");

  data.set("registraAsistencia", registraAsistencia?.checked ? 1 : 0);
  data.set("suspendeClases", suspendeClases?.checked ? 1 : 0);
  const json = await apiRequest(
    ROUTES.ACTIVIDAD_ACADEMICA,
    "guardaryeditar",
    data,
  );
  if (json.status) {
    AlertService.success("¡Exito!", json.msg);
    Listar();
    closeModalForm();
  } else {
    alert("Error al guardar:" + json.msg);
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

async function Listar() {
  document.getElementById("contentList").innerHTML = "";
  const json = await apiRequest(ROUTES.ACTIVIDAD_ACADEMICA, "listar");
  if (json.status) {
    paginatorList.setData(json.data);
  } else {
    document.getElementById("contentList").innerHTML = `
        <div class="p-5 text-center text-gray-500">
          <i class="bi bi-emoji-astonished text-4xl mb-3 block"></i>
          <p class="font-medium">${json.msg || "No se encontraron datos"}</p>
          <p class="text-sm mt-2 text-gray-400">No se encontraron perfiles registrados</p>
        </div>
      `;
  }
}

function renderRows(item) {
  let existingRow = document.getElementById("row_" + item.id_actividad);
  if (existingRow) {
    existingRow.remove();
  }
  let newdiv = document.createElement("div");
  newdiv.id = "row_" + item.id_actividad;
  newdiv.className =
    "flex lg:flex-row flex-col gap-5 p-5 hover:bg-neutral-100 duration-300 ease-linear justify-between";
  newdiv.innerHTML = `
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-3 items-center">
        <h5 class="font-bold text-lg text-gray-700">${item.nom_actividad}</h5>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold 
            bg-blue-300/40 text-blue-700
        ">Año lectivo: ${item.anio}</span>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" style="color: ${item.color}; background-color: color-mix(in srgb, ${item.color} 15%, white);">${item.desc_tipoactividad}</span>
      </div>
      <p class="text-neutral-500 text-sm">
        ${item.desc_actividad}
      </p>
      <p class="text-neutral-500 text-sm">
      ${
        item.fecha_inicio === item.fecha_fin
          ? `Fecha: <span class="font-semibold text-neutral-600">
              ${formatearFechaCorta(item.fecha_inicio)}
            </span>`
          : `Fecha: De <span class="font-semibold text-neutral-600">
              ${formatearFechaCorta(item.fecha_inicio)}
            </span> a 
            <span class="font-semibold text-neutral-600">
              ${formatearFechaCorta(item.fecha_fin)}
            </span>`
      }
        
      </p>
      ${
        Number(item.estado) === 1
          ? `
            <div class="inline-flex self-start items-center gap-2 px-2 py-0.5 rounded-full bg-green-100">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              <span class="text-xs font-semibold text-green-700">Activo</span>
            </div>
          `
          : `
            <div class="inline-flex self-start items-center gap-2 px-2 py-0.5 rounded-full bg-orange-100">
              <span class="w-2 h-2 rounded-full bg-orange-500"></span>
              <span class="text-xs font-semibold text-orange-700">Inactivo</span>
            </div>
          `
      }
    </div>
    <div class="flex flex-wrap gap-2">
    ${
      item.estado === 1
        ? `
        <custom-button-fab
        icon="bi bi-x-circle"
        btn-class="bg-orange-500 text-white hover:bg-orange-700"
        tooltip="Deshabilitar" onclick="onChange(${item.id_actividad})"></custom-button-fab>
        `
        : `
        <custom-button-fab
        icon="bi bi-check2-circle"
        btn-class="bg-green-500 text-white hover:bg-green-700"
        tooltip="Habilitar" onclick="onChange(${item.id_actividad})"></custom-button-fab>
        `
    }
      <custom-button-fab
        icon="bi bi-eye-fill"
        btn-class="bg-sky-500 text-white hover:bg-sky-700"
        tooltip="Ver información" onclick="openModalInfo(${
          item.id_actividad
        })"></custom-button-fab>
      <custom-button-fab
        icon="bi bi-tag-fill"
        btn-class="bg-purple-500 text-white hover:bg-purple-700"
        tooltip="Editar" onclick="openModalForm(${
          item.id_actividad
        })"></custom-button-fab>
      <custom-button-fab
        icon="bi bi-trash-fill"
        btn-class="bg-red-500 text-white hover:bg-red-700"
        tooltip="Eliminar" onclick="onDelete(${
          item.id_actividad
        })"></custom-button-fab>
    </div>
  `;
  document.getElementById("contentList").appendChild(newdiv);
}

async function ObtenerActividad(id) {
  const json = await apiRequest(ROUTES.ACTIVIDAD_ACADEMICA, "mostrar", { id });
  if (!json.status) {
    AlertService.error("Error", json.msg || "No se encontraron datos");
    return null;
  }
  return json.data;
}

async function Mostrar(id) {
  const actividad = await ObtenerActividad(id);
  if (!actividad) return;
  if (actividad.fechaInicio !== actividad.fechaFin) {
    chkRango.checked = true;
    toggleFechaFin(true);
  } else {
    chkRango.cheched = false;
    toggleFechaFin(false);
  }
  document.getElementById("idActividad").value = actividad.idActividad;
  initCustomValues(actividad);
  marcarActividadesSeleccionadas(actividad.participantes);

  const registraAsistencia = document.getElementById("registraAsistencia");
  const suspendeClases = document.getElementById("suspendeClases");

  if (registraAsistencia) {
    registraAsistencia.checked = Number(actividad.registraAsistencia) === 1;
  }
  if (suspendeClases) {
    suspendeClases.checked = Number(actividad.suspendeClases) === 1;
  }
}

function marcarActividadesSeleccionadas(participantes) {
  checkboxesParticipantes = formAcademicActivity.querySelectorAll(
    'input[name="participantes[]"]',
  );
  const partSeleccionados = (participantes || []).map((p) =>
    String(p.idTipoParticipante),
  );
  checkboxesParticipantes.forEach((chk) => {
    chk.checked = partSeleccionados.includes(chk.value);
  });
}

window.onDelete = async function (id) {
  AlertService.confirm(
    "¿Estás seguro?",
    "Esta acción no se puede deshacer.",
  ).then(async (result) => {
    if (result) {
      const json = await apiRequest(ROUTES.ACTIVIDAD_ACADEMICA, "eliminar", {
        id,
      });
      if (json.status) {
        AlertService.success("¡Exito!", json.msg);
        Listar();
      } else {
        AlertService.warning("¡Atención!", json.msg);
      }
    }
  });
};

window.onChange = async function (id) {
  AlertService.confirm(
    "¿Estás seguro?",
    "Se modificará el estado de la Actividad académica",
  ).then(async (result) => {
    if (result) {
      const json = await apiRequest(
        ROUTES.ACTIVIDAD_ACADEMICA,
        "cambiarestado",
        {
          id,
        },
      );
      if (json.status) {
        AlertService.success("¡Exito!", json.msg);
        Listar();
      } else {
        AlertService.warning("¡Atención!", json.msg);
      }
    }
  });
};

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

function initFiltros() {
  const searchText = document.querySelector(
    "custom-text-field[name='searchText']",
  );
  const fechaInicio = document.querySelector(
    "custom-datepicker[name='fechaInicio']",
  );
  const fechaFin = document.querySelector("custom-datepicker[name='fechaFin']");
  const tipoActividad = document.querySelector(
    "custom-select[name='filtroTipoActividad']",
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
    tipoActividad,
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
  const tipoActividad =
    document
      .querySelector("custom-select[name='filtroTipoActividad']")
      ?.getValue() || "";
  const anioLectivo =
    document
      .querySelector("custom-select[name='filtroAnioLectivo']")
      ?.getValue() || "";

  if (!dato && !fechaInicio && !fechaFin && !tipoActividad && !anioLectivo) {
    Listar();
    return;
  }
  document.getElementById("contentList").innerHTML = "";
  const json = await apiRequest(ROUTES.ACTIVIDAD_ACADEMICA, "buscar", {
    dato,
    fechaInicio,
    fechaFin,
    idTipoActividad: tipoActividad,
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
  const filtroTipoActividad = document.querySelector(
    "custom-select[name='filtroTipoActividad']",
  );
  if (filtroTipoActividad) {
    controladorFiltros?.sincronizar(filtroTipoActividad, "");
    filtroTipoActividad.initInput();
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

init();
