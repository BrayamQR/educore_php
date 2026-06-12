import { AlertService } from "../../../shared/js/globalscripts.js";

let DialogFormUser = null;
let DialogInfoUser = null;
let formUser = null;
let campos = [];
let inputSearch = null;
let paginatorList = null;

function init() {
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

  DialogFormUser = document.getElementById("DialogFormUser");
  DialogInfoUser = document.getElementById("DialogInfoUser");
  if (document.getElementById("contentList")) {
    Listar();
  }
  setupPasswordValidation();

  formUser = document.getElementById("formUser");
  if (formUser && !formUser.hasSubmitListener) {
    formUser.addEventListener("submit", (e) => {
      e.preventDefault();
      campos = formUser.querySelectorAll("custom-text-field, custom-select");
      if (!validateForm()) {
        console.warn("formulario con errores 🚫");
        return;
      }
      GuardaryEditar();
    });
    formUser.hasSubmitListener = true;
  }

  inputSearch = document.querySelector("custom-text-field[name='searchText']");
  if (inputSearch) {
    inputSearch.addEventListener("input", InputSearch);
  }
}

async function Listar() {
  document.getElementById("contentList").innerHTML = "";
  try {
    let resp = await fetch("../../../app/routes/usuario.route.php?op=listar");
    let json = await resp.json();
    if (json.status) {
      paginatorList.setData(json.data);
    } else {
      document.getElementById("contentList").innerHTML = `
        <div class="p-5 text-center text-gray-500">
          <i class="bi bi-emoji-astonished text-4xl mb-3 block"></i>
          <p class="font-medium">${json.msg || "No se encontraron datos"}</p>
          <p class="text-sm mt-2 text-gray-400">No se encontraron usuarios registrados</p>
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
    let resp = await fetch("../../../app/routes/usuario.route.php?op=mostrar", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      body: formData,
    });
    let json = await resp.json();
    if (json.status) {
      console.log(json.data);
      document.getElementById("idUsuario").value = json.data.idUsuario;
      initCustomValues(json.data);
    }
  } catch (error) {
    console.error(error);
  }
}

async function getPerfil() {
  try {
    let resp = await fetch(
      "../../../app/routes/genericList.route.php?op=perfil",
    );
    let json = await resp.json();
    if (json.status) {
      let data = json.data;
      let ops = data.map((p) => ({ value: p.id_perfil, desc: p.nom_perfil }));
      return ops;
    }
  } catch (error) {
    console.error(error);
  }
}

async function GuardaryEditar() {
  try {
    let form = document.getElementById("formUser");
    const data = new FormData(form);

    let resp = await fetch(
      "../../../app/routes/usuario.route.php?op=guardaryeditar",
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
    let resp = await fetch("../../../app/routes/usuario.route.php?op=mostrar", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      body: formData,
    });
    let json = await resp.json();
    if (json.status) {
      const data = json.data;
      poblarInfoUsuario(data);
    }
  } catch (error) {
    console.error(error);
    AlertService.error("Error", "No se pudieron cargar los detalles");
  }
}

function poblarInfoUsuario(data) {
  document.getElementById("nomUsuarioInfo").textContent =
    data.nomUsuario || "-";
  document.getElementById("codUsuarioInfo").textContent =
    data.codUsuario || "-";
  document.getElementById("telUsuarioInfo").textContent =
    data.telUsuario || "-";
  document.getElementById("emailUsuarioInfo").textContent =
    data.emailUsuario || "-";
  document.getElementById("dirUsuarioInfo").textContent =
    data.dirUsuario || "-";
  document.getElementById("usuUsuarioInfo").textContent =
    data.usuUsuario || "-";
  document.getElementById("nomPerfilInfo").textContent = data.nomPerfil || "-";
}

function renderRows(item) {
  let existingRow = document.getElementById("row_" + item.id_usuario);
  if (existingRow) {
    existingRow.remove();
  }
  let newdiv = document.createElement("div");
  newdiv.id = "row_" + item.id_usuario;
  newdiv.className =
    "flex lg:flex-row flex-col gap-5 p-5 hover:bg-neutral-100 duration-300 ease-linear justify-between";
  newdiv.innerHTML = `
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-3 items-center">
        <h5 class="font-bold text-lg text-gray-700">${item.nom_usuario}</h5>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-300/40 text-yellow-700">
          ${item.usu_usuario}
        </span>
      </div> 
      <p class="text-neutral-500 text-sm">Rol: ${item.nomPerfil}</p>
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
        tooltip="Deshabilitar"
        onclick="onChange(${item.id_usuario})"></custom-button-fab>
        `
        : `
        <custom-button-fab
        icon="bi bi-check2-circle"
        btn-class="bg-green-500 text-white hover:bg-green-700"
        tooltip="Habilitar"
        onclick="onChange(${item.id_usuario})"></custom-button-fab>
        `
    }
      <custom-button-fab
        icon="bi bi-key-fill"
        btn-class="bg-amber-500 text-white hover:bg-amber-700"
        tooltip="Restaurar contraseña"
        onclick="onRestaurarPassword(${item.id_usuario})"></custom-button-fab>
      <custom-button-fab
        icon="bi bi-eye-fill"
        btn-class="bg-sky-500 text-white hover:bg-sky-700"
        tooltip="Ver información"
        onclick="openModalInfo(${item.id_usuario})"></custom-button-fab>
      <custom-button-fab
        icon="bi bi-tag-fill"
        btn-class="bg-purple-500 text-white hover:bg-purple-700"
        tooltip="Editar"
        onclick="openModalForm(${item.id_usuario})"></custom-button-fab>
      <custom-button-fab
        icon="bi bi-trash-fill"
        btn-class="bg-red-500 text-white hover:bg-red-700"
        tooltip="Eliminar"
        onclick="onDelete(${item.id_usuario})"></custom-button-fab>
    </div>
  `;

  document.getElementById("contentList").appendChild(newdiv);
}

async function Buscar() {
  document.getElementById("contentList").innerHTML = "";
  let searchText = inputSearch.getValue().trim();
  try {
    let formData = new FormData();
    formData.append("textsearch", searchText);
    let resp = await fetch("../../../app/routes/usuario.route.php?op=buscar", {
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

window.openModalForm = async function (id = null) {
  if (!DialogFormUser) return;

  const perfilSelect = document.querySelector("custom-select[name='idPerfil']");
  if (perfilSelect) {
    const opciones = await getPerfil();
    perfilSelect.setOptions(opciones);
  }

  const passFields = document.getElementById("passFields");
  const passUsuario = document.querySelector("[name='passUsuario']");
  const confPassword = document.querySelector("[name='confPassword']");

  if (id === null) {
    passFields?.classList.remove("hidden");
    passUsuario?.setAttribute("required", "");
    confPassword?.setAttribute("required", "");
  } else {
    passFields?.classList.add("hidden");
    passUsuario?.removeAttribute("required");
    confPassword?.removeAttribute("required");
  }

  DialogFormUser.open();
  formUser = document.getElementById("formUser");

  setTimeout(() => {
    setupPasswordValidation();
    if (id === null) {
      initInput();
    } else {
      Mostrar(id);
    }
  }, 0);
};

function InputSearch() {
  let searchText = inputSearch.getValue().trim();
  if (searchText === "") {
    Listar();
  } else {
    Buscar();
  }
}

window.closeModalForm = function () {
  if (!DialogFormUser) return;
  initInput();
  DialogFormUser.close();
};

window.openModalInfo = function (id) {
  if (id === undefined || id === null) return;
  if (!DialogInfoUser) return;
  verDetalles(id);
  DialogInfoUser.open();
};
window.closeModalInfo = function () {
  if (!DialogInfoUser) return;
  DialogInfoUser.close();
};

window.onChange = async function (id) {
  AlertService.confirm(
    "¿Estás seguro?",
    "Se cambiara el estado del usuario",
  ).then(async (result) => {
    if (result) {
      let formData = new FormData();
      formData.append("id", id);
      try {
        let resp = await fetch(
          "../../../app/routes/usuario.route.php?op=cambiarestado",
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
          "../../../app/routes/usuario.route.php?op=eliminar",
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

window.onRestaurarPassword = async function (id) {
  AlertService.confirm(
    "¿Restaurar contraseña?",
    "La contraseña se restaurará al nombre de usuario.",
  ).then(async (result) => {
    if (result) {
      let formData = new FormData();
      formData.append("id", id);
      try {
        let resp = await fetch(
          "../../../app/routes/usuario.route.php?op=restaurarpassword",
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
        } else {
          AlertService.warning("¡Atención!", json.msg);
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
};

function initInput() {
  document.getElementById("idUsuario").value = "";
  campos = formUser.querySelectorAll("custom-text-field, custom-select");
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

function setupPasswordValidation() {
  const passUsuario = document.querySelector(
    'custom-text-field[name="passUsuario"]',
  );
  const confPassword = document.querySelector(
    'custom-text-field[name="confPassword"]',
  );

  if (passUsuario && confPassword && passUsuario.input && confPassword.input) {
    passUsuario.input.addEventListener("blur", () => {
      const confValue = confPassword.getValue().trim();
      if (confPassword.input.classList.contains("error") || confValue) {
        confPassword.checkValidity();
      }
    });
  }
}

init();
