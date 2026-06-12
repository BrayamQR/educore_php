import { AlertService } from "../../../shared/js/globalscripts.js";

let DialogFormTeacher = null;
let formTeacher = null;
let inputSearch = null;
let campos = [];
let DialogInfoTeacher = null;

let paginatorList = null;

function init() {
  DialogFormTeacher = document.getElementById("DialogFormTeacher");
  DialogInfoTeacher = document.getElementById("DialogInfoTeacher");

  paginatorList = document.getElementById("paginatorList");
  if (paginatorList) {
    paginatorList.addEventListener("page-change", (e) => {
      const container = document.getElementById("contentList");
      container.innerHTML = "";
      e.detail.data.forEach(renderRows);
      container.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (document.getElementById("contentList")) {
    listar();
  }
  formTeacher = document.getElementById("formTeacher");

  if (formTeacher && !formTeacher.hasSubmitListener) {
    formTeacher.addEventListener("submit", (e) => {
      e.preventDefault();
      campos = formTeacher.querySelectorAll("custom-select, custom-text-field");
      if (!validateForm()) {
        console.log("Formulario con errores 🚫");
        return;
      }
      GuardaryEditar();
    });
    formTeacher.hasSubmitListener = true;
  }

  inputSearch = document.querySelector("custom-text-field[name='searchText']");
  if (inputSearch) {
    inputSearch.addEventListener("input", InputSearch);
  }
}

async function listar() {
  document.getElementById("contentList").innerHTML = "";
  try {
    let resp = await fetch("../../../app/routes/docente.route.php?op=listar");
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

function renderRows(item) {
  let existingRow = document.getElementById("row_" + item.id_docente);
  if (existingRow) {
    existingRow.remove();
  }

  let newdiv = document.createElement("div");
  newdiv.id = "row_" + item.id_docente;
  newdiv.className =
    "flex lg:flex-row flex-col gap-5 p-5 hover:bg-neutral-100 duration-300 ease-linear justify-between";
  newdiv.innerHTML = `
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-3 items-center">
        <h5 class="font-bold text-lg text-gray-700">${item.nom_docente}</h5>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${
          item.id_tipodocumento === 1
            ? "bg-blue-300/40 text-blue-700"
            : "bg-green-300/40 text-green-700"
        }">${item.doc_docente}</span>
      </div>
      <p class="text-neutral-500 text-sm">
        ${item.id_cargo === 1 ? "Docente de aula" : "Auxiliar de aula"} - ${item.id_tipocontrato === 2 ? "Contratado" : "Nombrado"}
      </p>
      <div class="inline-flex self-start items-center gap-2 px-2 py-0.5 rounded-full bg-green-100">
        <span class="text-xs font-semibold text-green-700">Cel: ${item.tel_docente}</span>
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      <custom-button-fab
        icon="bi bi-eye-fill"
        btn-class="bg-sky-500 text-white hover:bg-sky-700"
        tooltip="Ver información"
        onclick="openModalInfo(${item.id_docente})">
      </custom-button-fab>
      <custom-button-fab
        icon="bi bi-tag-fill"
        btn-class="bg-purple-500 text-white hover:bg-purple-700"
        tooltip="Editar"
        onclick="openModalForm(${item.id_docente})">
      </custom-button-fab>
      <custom-button-fab
        icon="bi bi-trash-fill"
        btn-class="bg-red-500 text-white hover:bg-red-700"
        tooltip="Eliminar"
        onclick="onDelete(${item.id_docente})">
      </custom-button-fab>
    </div>
  `;
  document.getElementById("contentList").appendChild(newdiv);
}

function InputSearch() {
  let searchText = inputSearch.getValue().trim();
  if (searchText === "") {
    listar();
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

    let resp = await fetch("../../../app/routes/docente.route.php?op=buscar", {
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
          ${searchText ? `<p class="text-sm mt-2 text-gray-400">Búsqueda: "${searchText}"</p>` : ""}
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
    let resp = await fetch("../../../app/routes/docente.route.php?op=mostrar", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      body: formData,
    });
    let json = await resp.json();
    if (json.status) {
      document.getElementById("idDocente").value = json.data.idDocente;
      initCustomValues(json.data);
    }
  } catch (error) {
    console.error(error);
  }
}

async function GuardaryEditar() {
  try {
    let form = document.getElementById("formTeacher");
    const data = new FormData(form);
    let resp = await fetch(
      "../../../app/routes/docente.route.php?op=guardaryeditar",
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
      listar();
      closeModalForm();
    } else {
      alert("Error al guardar: " + json.msg);
    }
  } catch (error) {
    console.error(error);
  }
}

async function verDetalles(id) {
  try {
    const formData = new FormData();
    formData.append("id", id);
    let resp = await fetch("../../../app/routes/docente.route.php?op=mostrar", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      body: formData,
    });
    let json = await resp.json();
    if (json.status) {
      const data = json.data;
      poblarInfoDocente(data);
    }
  } catch (error) {
    console.error(error);
    AlertService.error("Error", "No se pudieron cargar los detalles");
  }
}

function poblarInfoDocente(data) {
  const teacherName = document.getElementById("teacherName");
  const tipoDocumentoDocente = document.getElementById("tipoDocumentoDocente");
  const numDocumento = document.getElementById("numDocumento");
  const correoDocente = document.getElementById("correoDocente");
  const telefonoDocente = document.getElementById("telefonoDocente");
  const direccionDocente = document.getElementById("direccionDocente");
  const cargoDocente = document.getElementById("cargoDocente");
  const tipoContratoDocente = document.getElementById("tipoContratoDocente");
  if (teacherName) teacherName.textContent = data.nomDocente;
  if (tipoDocumentoDocente)
    tipoDocumentoDocente.textContent =
      data.idTipoDocumento === 1 ? "D.N.I." : "C.E.";
  if (numDocumento) numDocumento.textContent = data.docDocente;
  if (correoDocente) correoDocente.textContent = data.emailDocente;
  if (telefonoDocente) telefonoDocente.textContent = data.telDocente;
  if (direccionDocente) direccionDocente.textContent = data.dirDocente;
  if (cargoDocente)
    cargoDocente.textContent =
      data.idCargo === 1 ? "Docente de aula" : "Auxiliar de aula";
  if (tipoContratoDocente)
    tipoContratoDocente.textContent =
      data.idTipoContrato === 2 ? "Contratado" : "Nombrado";
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
          "../../../app/routes/docente.route.php?op=eliminar",
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
          listar();
        } else {
          AlertService.warning("¡Atención!", json.msg);
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
};

window.openModalForm = function (id = null) {
  if (!DialogFormTeacher) return;

  DialogFormTeacher.open();
  formTeacher = document.getElementById("formTeacher");

  setTimeout(() => {
    if (id === null) {
      initInput();
    } else {
      Mostrar(id);
    }
  });
};

window.closeModalForm = function () {
  if (!DialogFormTeacher) return;
  initInput();
  DialogFormTeacher.close();
};

window.openModalInfo = function (id) {
  if (id === undefined || id === null) return;
  if (!DialogInfoTeacher) return;
  verDetalles(id);
  DialogInfoTeacher.open();
};

window.closeModalInfo = function () {
  if (!DialogInfoTeacher) return;
  DialogInfoTeacher.close();
};

function initInput() {
  document.getElementById("idDocente").value = "";
  campos = formTeacher.querySelectorAll("custom-select, custom-text-field");
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
