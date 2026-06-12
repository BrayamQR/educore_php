import { AlertService } from "../../../shared/js/globalscripts.js";

let DialogFormClassroom = null;
let DialogInfoClassroom = null;
let formClassroom = null;
let campos = [];
let inputSearch = null;

let paginatorList = null;

function init() {
  DialogFormClassroom = document.getElementById("DialogFormClassroom");
  DialogInfoClassroom = document.getElementById("DialogInfoClassroom");

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
      campos = formClassroom.querySelectorAll(
        "custom-select, custom-text-field, custom-autocomplete",
      );
      if (!validateForm()) {
        console.log("Formulario no válido");
        return;
      }
      GuardaryEditar();
    });
    formClassroom.hasSubmitListener = true;
  }

  inputSearch = document.querySelector("custom-text-field[name='searchText']");
  if (inputSearch) {
    inputSearch.addEventListener("input", InputSearch);
  }
}
async function Listar() {
  document.getElementById("contentList").innerHTML = "";
  try {
    let resp = await fetch("../../../app/routes/aula.route.php?op=listar");
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

async function Mostrar(id) {
  const formData = new FormData();
  formData.append("id", id);
  try {
    let resp = await fetch("../../../app/routes/aula.route.php?op=mostrar", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      body: formData,
    });
    let json = await resp.json();
    if (json.status) {
      document.getElementById("idAula").value = json.data.idAula;
      initCustomValues(json.data);
    }
  } catch (error) {
    console.error(error);
  }
}

async function GuardaryEditar() {
  try {
    let form = document.getElementById("formClassroom");
    const data = new FormData(form);
    let resp = await fetch(
      "../../../app/routes/aula.route.php?op=guardaryeditar",
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
      alert("Error al guardar:" + json.msg);
    }
  } catch (error) {
    console.error(error);
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
      console;
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
  try {
    let resp = await fetch(
      "../../../app/routes/genericList.route.php?op=docente",
    );
    let json = await resp.json();
    if (json.status) {
      let data = json.data;
      let ops = data.map((p) => ({ value: p.id_docente, desc: p.nom_docente }));
      return ops;
    }
  } catch (error) {
    console.error(error);
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
        onclick="openModalInfo(${item.id_aula})">
      </custom-button-fab>
      <custom-button-fab
        icon="bi bi-tag-fill"
        btn-class="bg-purple-500 text-white hover:bg-purple-700"
        tooltip="Editar"
        onclick="openModalForm(${item.id_aula})">
      </custom-button-fab>
      <custom-button-fab
        icon="bi bi-trash-fill"
        btn-class="bg-red-500 text-white hover:bg-red-700"
        tooltip="Eliminar"
        onclick="onDelete(${item.id_aula})">
      </custom-button-fab>
    </div>
  `;
  document.getElementById("contentList").appendChild(newdiv);
}

window.openModalForm = async function (id = null) {
  if (!DialogFormClassroom) return;
  const docenteAutocomplete = document.querySelector(
    "custom-autocomplete[name='idDocente']",
  );
  if (docenteAutocomplete) {
    const opciones = await getDocente();
    docenteAutocomplete.setOptions(opciones);
  }
  DialogFormClassroom.open();
  formClassroom = document.getElementById("formClassroom");
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

function initInput() {
  document.getElementById("idAula").value = "";
  campos = formClassroom.querySelectorAll(
    "custom-select, custom-text-field, custom-autocomplete",
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
