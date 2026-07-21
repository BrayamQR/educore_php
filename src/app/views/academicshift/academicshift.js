import {
  AlertService,
  apiRequest,
  formatearFechaCorta,
  formatearHora,
  ROUTES,
  crearControladorFiltros,
} from "../../../shared/js/globalscripts.js";

let DialogFormAcademicShift = null;
let DialogInfoAcademicShift = null;
let campos = [];
let inputSearch = null;
let paginatorList = null;
let formAcademicShift = null;
let checkboxesDias = [];
let diasError = null;
let anioLectivoActivo = null;
let selectFiltroAnioLectivo = null;
let ultimoAnio = null;
let valorAnioAnterior = null;
let valorTextoAnterior = "";
let controladorFiltros = null;

async function init() {
  await obtenerAnioActivo();
  await obtenerUltimoAnio();

  DialogFormAcademicShift = document.getElementById("DialogFormAcademicShift");
  DialogInfoAcademicShift = document.getElementById("DialogInfoAcademicShift");
  formAcademicShift = document.getElementById("formAcademicShift");
  diasError = document.getElementById("diasError");

  paginatorList = document.getElementById("paginatorList");
  if (paginatorList) {
    paginatorList.addEventListener("page-change", (e) => {
      const container = document.getElementById("contentList");
      container.innerHTML = "";
      e.detail.data.forEach(renderRows);
      container.scrollTo({ top: 0, behavior: "smooth" });
    });
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

  if (formAcademicShift && !formAcademicShift.hasSubmitListener) {
    formAcademicShift.addEventListener("submit", (e) => {
      e.preventDefault();
      campos = formAcademicShift.querySelectorAll(
        "custom-text-field, custom-timepicker, custom-number-field",
      );
      checkboxesDias = formAcademicShift.querySelectorAll(
        'input[name="dias[]"]',
      );

      if (!validateForm()) {
        console.log("Formulario no válido");
        return;
      }
      GuardaryEditar();
    });
    formAcademicShift.hasSubmitListener = true;

    formAcademicShift.addEventListener("change", (e) => {
      if (e.target.name === "dias[]") {
        const algunoMarcado =
          formAcademicShift.querySelectorAll('input[name="dias[]"]:checked')
            .length > 0;
        if (algunoMarcado) ocultarErrorDias();
      }
    });
  }
}

function getDiasSeleccionados() {
  return Array.from(
    formAcademicShift.querySelectorAll('input[name="dias[]"]:checked'),
  ).map((chk) => chk.value);
}

function mostrarErrorDias() {
  if (diasError) diasError.classList.remove("hidden");
}

function ocultarErrorDias() {
  if (diasError) diasError.classList.add("hidden");
}

async function ObtenerTurno(id) {
  const json = await apiRequest(ROUTES.TURNO_ACADEMICO, "mostrar", { id });
  if (!json.status) {
    AlertService.error("Error", json.msg || "No se encontraron datos");
    return null;
  }
  return json.data;
}

async function Mostrar(id) {
  const turno = await ObtenerTurno(id);
  if (!turno) return;
  document.getElementById("idTurno").value = turno.idTurno;
  initCustomValues(turno);
  marcarDiasSeleccionados(turno.dias);
}

function marcarDiasSeleccionados(dias) {
  checkboxesDias = formAcademicShift.querySelectorAll('input[name="dias[]"]');
  const diasSeleccionados = (dias || []).map((d) => String(d.diaSemana));
  checkboxesDias.forEach((chk) => {
    chk.checked = diasSeleccionados.includes(chk.value);
  });
}

async function GuardaryEditar() {
  let form = document.getElementById("formAcademicShift");
  const data = new FormData(form);

  const dias = getDiasSeleccionados();
  data.delete("dias[]");
  dias.forEach((dia) => data.append("dias[]", dia));

  data.append("idAnioLectivo", anioLectivoActivo.id_aniolectivo);
  data.append("idUsuario", ID_USUARIO);

  const json = await apiRequest(ROUTES.TURNO_ACADEMICO, "guardaryeditar", data);
  if (json.status) {
    AlertService.success("¡Exito!", json.msg);
    Listar();
    closeModalForm();
  } else {
    alert("Error al guardar:" + json.msg);
  }
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

  const contDescCambio = document.getElementById("contDescCambio");
  const campoDescCambio = formAcademicShift.querySelector(
    'custom-textarea[name="descCambio"]',
  );

  if (id === null) {
    contDescCambio?.classList.add("hidden");
    campoDescCambio?.removeAttribute("required");
  } else {
    contDescCambio?.classList.remove("hidden");
    campoDescCambio?.setAttribute("required", "");
  }

  if (!DialogFormAcademicShift) return;
  DialogFormAcademicShift.open();
  setTimeout(() => {
    if (id === null) {
      initInput();
    } else {
      Mostrar(id);
    }
  });
};

window.closeModalForm = function () {
  if (!DialogFormAcademicShift) return;
  initInput();
  DialogFormAcademicShift.close();
};

window.openModalInfo = function (id = null) {
  if (id === undefined || id === null) return;
  if (!DialogInfoAcademicShift) return;
  verDetalles(id);
  DialogInfoAcademicShift.open();
};

window.closeModalInfo = function () {
  if (!DialogInfoAcademicShift) return;
  DialogInfoAcademicShift.close();
};

async function verDetalles(id) {
  const turno = await ObtenerTurno(id);
  if (!turno) return;
  poblarInfoTurno(turno);
}

function poblarInfoTurno(data) {
  document.getElementById("nomTurnoInfo").textContent = data.nomTurno || "-";

  document.getElementById("horarioInfo").textContent =
    `${formatearHora(data.horaIngreso)} - ${formatearHora(data.horaSalida)}`;

  document.getElementById("toleranciaInfo").textContent =
    `Tolerancia: ${data.minTolerancia} min`;

  document.getElementById("anioLectivoInfo").textContent = data.anio || "-";

  // Estado (Activo/Inactivo)
  const dot = document.getElementById("dotEstadoInfo");
  const badge = document.getElementById("badgeEstadoInfo");
  const nomEstado = document.getElementById("nomEstadoInfo");

  if (data.estado === 1) {
    badge.className =
      "inline-flex self-start items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700";
    dot.className = "w-2 h-2 rounded-full bg-green-500";
    nomEstado.textContent = "Activo";
  } else {
    badge.className =
      "inline-flex self-start items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600";
    dot.className = "w-2 h-2 rounded-full bg-gray-500";
    nomEstado.textContent = "Inactivo";
  }

  // Días activos
  const contenedor = document.getElementById("listaDiasInfo");
  contenedor.innerHTML = "";

  data.dias.forEach((dia) => {
    const div = document.createElement("div");
    div.className =
      "flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-gray-100";
    div.innerHTML = `
      <span class="text-sm font-semibold text-gray-700">${dia.nomDiasemana}</span>
      <span class="text-xs text-gray-500">
        ${formatearHora(dia.horaIngreso)} - ${formatearHora(dia.horaSalida)}
      </span>
    `;
    contenedor.appendChild(div);
  });
}

function initInput() {
  document.getElementById("idTurno").value = "";
  campos = formAcademicShift.querySelectorAll(
    "custom-text-field, custom-timepicker, custom-number-field, custom-textarea",
  );
  campos.forEach((campo) => {
    if (typeof campo.initInput === "function") {
      campo.initInput();
    }
  });

  checkboxesDias = formAcademicShift.querySelectorAll('input[name="dias[]"]');
  checkboxesDias.forEach((chk) => (chk.checked = false));
  ocultarErrorDias();

  const campoDescCambio = formAcademicShift.querySelector(
    'custom-textarea[name="descCambio"]',
  );
  if (campoDescCambio && typeof campoDescCambio.initInput === "function") {
    campoDescCambio.initInput();
  }
}

function validateForm() {
  let valid = true;

  campos.forEach((campo) => {
    if (!campo.checkValidity()) valid = false;
  });

  const contDescCambio = document.getElementById("contDescCambio");
  const campoDescCambio = formAcademicShift.querySelector(
    'custom-textarea[name="descCambio"]',
  );
  const descVisible =
    contDescCambio && !contDescCambio.classList.contains("hidden");
  if (descVisible && campoDescCambio && !campoDescCambio.checkValidity()) {
    valid = false;
  }

  const algunoMarcado = getDiasSeleccionados().length > 0;
  if (!algunoMarcado) {
    mostrarErrorDias();
    valid = false;
  } else {
    ocultarErrorDias();
  }

  return valid;
}

async function obtenerAnioActivo() {
  const json = await apiRequest(ROUTES.ANIO_LECTIVO, "obteneranioactivo");
  if (json.status) {
    anioLectivoActivo = json.data;
  } else {
    anioLectivoActivo = null;
  }
}

async function Listar() {
  document.getElementById("contentList").innerHTML = "";
  const json = await apiRequest(ROUTES.TURNO_ACADEMICO, "listar");
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
  let existingRow = document.getElementById("row_" + item.id_turno);
  if (existingRow) {
    existingRow.remove();
  }

  let newdiv = document.createElement("div");
  newdiv.id = "row_" + item.id_turno;
  newdiv.className =
    "flex lg:flex-row flex-col gap-5 p-5 hover:bg-neutral-100 duration-300 ease-linear justify-between";
  newdiv.innerHTML = `
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-3 items-center">
        <h5 class="font-bold text-lg text-gray-700">${item.nom_turno}</h5>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold 
            bg-blue-300/40 text-blue-700
        ">Año lectivo: ${item.anio}</span>
      </div>
      <p class="text-neutral-500 text-sm">
        De <span class="font-semibold text-neutral-600">${formatearHora(item.hora_ingreso)}</span> a <span class="font-semibold text-neutral-600">${formatearHora(item.hora_salida)}</span>
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
        tooltip="Deshabilitar" onclick="onChange(${item.id_turno})"></custom-button-fab>
        `
        : `
        <custom-button-fab
        icon="bi bi-check2-circle"
        btn-class="bg-green-500 text-white hover:bg-green-700"
        tooltip="Habilitar" onclick="onChange(${item.id_turno})"></custom-button-fab>
        `
    }
      <custom-button-fab
        icon="bi bi-eye-fill"
        btn-class="bg-sky-500 text-white hover:bg-sky-700"
        tooltip="Ver información" onclick="openModalInfo(${
          item.id_turno
        })"></custom-button-fab>
      <custom-button-fab
        icon="bi bi-tag-fill"
        btn-class="bg-purple-500 text-white hover:bg-purple-700"
        tooltip="Editar" onclick="openModalForm(${
          item.id_turno
        })"></custom-button-fab>
      <custom-button-fab
        icon="bi bi-trash-fill"
        btn-class="bg-red-500 text-white hover:bg-red-700"
        tooltip="Eliminar" onclick="onDelete(${
          item.id_turno
        })"></custom-button-fab>
    </div>
  `;
  document.getElementById("contentList").appendChild(newdiv);
}

window.onDelete = async function (id) {
  AlertService.confirm(
    "¿Estás seguro?",
    "Esta acción no se puede deshacer.",
  ).then(async (result) => {
    if (result) {
      const json = await apiRequest(ROUTES.TURNO_ACADEMICO, "eliminar", { id });
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
    "Se modificará el estado del Turno académico",
  ).then(async (result) => {
    if (result) {
      const json = await apiRequest(ROUTES.TURNO_ACADEMICO, "cambiarestado", {
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

function initFiltros() {
  const searchText = document.querySelector(
    "custom-text-field[name='searchText']",
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
    anioLectivo,
    "change",
    (el) => el.getValue() || "",
  );
}

window.LimpiarFiltros = function () {
  const searchText = document.querySelector(
    "custom-text-field[name='searchText']",
  );
  if (searchText) {
    controladorFiltros?.sincronizar(searchText, "");
    searchText.initInput();
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

async function Filtrar() {
  const dato =
    document
      .querySelector("custom-text-field[name='searchText']")
      ?.getValue()
      ?.trim() || "";

  const anioLectivo =
    document
      .querySelector("custom-select[name='filtroAnioLectivo']")
      ?.getValue() || "";
  if (!dato && !anioLectivo) {
    Listar();
    return;
  }
  document.getElementById("contentList").innerHTML = "";
  const json = await apiRequest(ROUTES.TURNO_ACADEMICO, "buscar", {
    dato,
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
async function obtenerUltimoAnio() {
  const json = await apiRequest(ROUTES.ANIO_LECTIVO, "obtenerultimoanio");
  if (json.status) {
    ultimoAnio = json.data;
  } else {
    ultimoAnio = null;
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

init();
