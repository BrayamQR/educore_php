import {
  AlertService,
  formatearFecha,
} from "../../../shared/js/globalscripts.js";

let DialogFormHoliday = null;
let DialogInfoHoliday = null;
let paginatorList = null;
let formHoliday = null;
let campos = [];

function init() {
  DialogFormHoliday = document.getElementById("DialogFormHoliday");
  DialogInfoHoliday = document.getElementById("DialogInfoHoliday");

  if (document.getElementById("contentList")) {
    Listar();
    initFiltros();
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
  if (formHoliday && !formHoliday.hasSubmitListener) {
    formHoliday.addEventListener("submit", (e) => {
      e.preventDefault();
      campos = formHoliday.querySelectorAll(
        "custom-text-field, custom-textarea, custom-datepicker, custom-select",
      );
      if (!validateForm()) {
        console.log("Formulario no válido");
        return;
      }
      GuardaryEditar();
    });
    formHoliday.hasSubmitListener = true;
  }
}

async function Listar() {
  document.getElementById("contentList").innerHTML = "";
  try {
    let resp = await fetch("../../../app/routes/feriado.route.php?op=listar");
    let json = await resp.json();
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
  } catch (error) {
    console.error(error);
  }
}

async function Mostrar(id) {
  const formData = new FormData();
  formData.append("id", id);
  try {
    let resp = await fetch("../../../app/routes/feriado.route.php?op=mostrar", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      body: formData,
    });
    let json = await resp.json();
    if (json.status) {
      document.getElementById("idFeriado").value = json.data.idFeriado;
      initCustomValues(json.data);
    }
  } catch (error) {
    console.error(error);
  }
}

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

window.LimpiarFiltros = function () {
  document.querySelector("custom-text-field[name='searchText']")?.initInput();
  document.querySelector("custom-datepicker[name='fechaInicio']")?.initInput();
  document.querySelector("custom-datepicker[name='fechaFin']")?.initInput();
  document
    .querySelector("custom-select[name='filtroTipoFeriado']")
    ?.initInput();
  Listar();
};

window.openModalForm = function (id = null) {
  if (!DialogFormHoliday) return;

  DialogFormHoliday.open();
  formHoliday = document.getElementById("formHoliday");
  setTimeout(() => {
    if (id === null) {
      initInput();
    } else {
      Mostrar(id);
    }
  });
};

window.closeModalForm = function () {
  if (!DialogFormHoliday) return;
  DialogFormHoliday.close();
};

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

function initInput() {
  document.getElementById("idFeriado").value = "";
  campos = formHoliday.querySelectorAll(
    "custom-text-field, custom-textarea, custom-datepicker, custom-select",
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
