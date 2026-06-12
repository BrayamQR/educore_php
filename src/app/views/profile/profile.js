import { AlertService } from "../../../shared/js/globalscripts.js";

let DialogformProfile = null;
let DialogInfoProfile = null;
let DialogAssign = null;
let formProfile = null;
let campos = [];
let inputSearch = null;
let idsOriginalesAsignados = [];
let idPerfilActual = null;

let paginatorList = null;

function init() {
  DialogformProfile = document.getElementById("DialogformProfile");
  DialogInfoProfile = document.getElementById("DialogInfoProfile");
  DialogAssign = document.getElementById("DialogAssign");

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
  formProfile = document.getElementById("formProfile");

  if (formProfile && !formProfile.hasSubmitListener) {
    formProfile.addEventListener("submit", (e) => {
      e.preventDefault();
      campos = formProfile.querySelectorAll(
        "custom-text-field, custom-textarea",
      );

      if (!validateForm()) {
        console.log("Formulario con errores 🚫");
        return;
      }

      GuardaryEditar();
    });
    formProfile.hasSubmitListener = true;
  }

  inputSearch = document.querySelector("custom-text-field[name='searchText']");
  if (inputSearch) {
    inputSearch.addEventListener("input", InputSearch);
  }
}

async function listar() {
  document.getElementById("contentList").innerHTML = "";
  try {
    let resp = await fetch("../../../app/routes/perfil.route.php?op=listar");
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
    let resp = await fetch("../../../app/routes/perfil.route.php?op=buscar", {
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
    listar();
  } else {
    Buscar();
  }
}

async function Mostrar(id) {
  const formData = new FormData();
  formData.append("id", id);
  try {
    let resp = await fetch("../../../app/routes/perfil.route.php?op=mostrar", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      body: formData,
    });
    let json = await resp.json();
    if (json.status) {
      document.getElementById("idPerfil").value = json.data.idPerfil;
      initCustomValues(json.data);
    }
  } catch (error) {
    console.error(error);
  }
}

async function GuardaryEditar() {
  try {
    let form = document.getElementById("formProfile");
    const data = new FormData(form);
    let resp = await fetch(
      "../../../app/routes/perfil.route.php?op=guardaryeditar",
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
      alert("Error al guardar:" + json.msg);
    }
  } catch (error) {
    console.error(error);
  }
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
          "../../../app/routes/perfil.route.php?op=eliminar",
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

window.onChange = async function (id) {
  AlertService.confirm(
    "¿Estás seguro?",
    "Se cambiara el estado del perfil",
  ).then(async (result) => {
    if (result) {
      let formData = new FormData();
      formData.append("id", id);
      try {
        let resp = await fetch(
          "../../../app/routes/perfil.route.php?op=cambiarestado",
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

function renderRows(item) {
  let existingRow = document.getElementById("row_" + item.id_perfil);
  if (existingRow) {
    existingRow.remove();
  }

  let newdiv = document.createElement("div");
  newdiv.id = "row_" + item.id_perfil;
  newdiv.className =
    "flex lg:flex-row flex-col gap-5 p-5 hover:bg-neutral-100 duration-300 ease-linear justify-between";
  newdiv.innerHTML = `
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-3 items-center">
        <h5 class="font-bold text-lg text-gray-700">${item.nom_perfil}</h5>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${
          item.total_menus > 0
            ? "bg-blue-300/40 text-blue-700"
            : "bg-yellow-300/40 text-yellow-700"
        }">${item.total_menus} 
        ${item.total_menus != 1 ? "permisos" : "permiso"}</span>
      </div>
      <p class="text-neutral-500 text-sm">${item.desc_perfil}</p>
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
        tooltip="Deshabilitar" onclick="onChange(${item.id_perfil})"></custom-button-fab>
        `
        : `
        <custom-button-fab
        icon="bi bi-check2-circle"
        btn-class="bg-green-500 text-white hover:bg-green-700"
        tooltip="Habilitar" onclick="onChange(${item.id_perfil})"></custom-button-fab>
        `
    }
      <custom-button-fab
        icon="bi bi-eye-fill"
        btn-class="bg-sky-500 text-white hover:bg-sky-700"
        tooltip="Ver información" onclick="openModalInfo(${
          item.id_perfil
        })"></custom-button-fab>
      <custom-button-fab
        icon="bi bi-shield-lock-fill"
        btn-class="bg-amber-500 text-white hover:bg-amber-700"
        tooltip="Asignar permisos" onclick="openModalAsignar(${
          item.id_perfil
        })"></custom-button-fab>
      <custom-button-fab
        icon="bi bi-tag-fill"
        btn-class="bg-purple-500 text-white hover:bg-purple-700"
        tooltip="Editar" onclick="openModalForm(${
          item.id_perfil
        })"></custom-button-fab>
      <custom-button-fab
        icon="bi bi-trash-fill"
        btn-class="bg-red-500 text-white hover:bg-red-700"
        tooltip="Eliminar" onclick="onDelete(${
          item.id_perfil
        })"></custom-button-fab>
    </div>
  `;
  document.getElementById("contentList").appendChild(newdiv);
}

function validateForm() {
  let valid = true;
  campos.forEach((campo) => {
    if (!campo.checkValidity()) valid = false;
  });
  return valid;
}

async function verDetalles(id) {
  try {
    const formData = new FormData();
    formData.append("id", id);
    let respPerfil = await fetch(
      "../../../app/routes/perfil.route.php?op=mostrar",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData,
      },
    );

    let jsonPerfil = await respPerfil.json();
    if (!jsonPerfil.status) {
      AlertService.error("Error", jsonPerfil.msg || "No se encontraron datos");
      return;
    }
    const perfil = jsonPerfil.data;
    poblarInfoPerfil(perfil);

    let respMenus = await fetch(
      "../../../app/routes/menu.route.php?op=listarByPerfil",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData,
      },
    );
    let jsonMenus = await respMenus.json();
    if (jsonMenus.status) {
      const menus = Array.isArray(jsonMenus.data) ? jsonMenus.data : [];
      renderizarMenus(menus);
    } else {
      renderizarMenus([]);
    }
    let respAsignados = await fetch(
      "../../../app/routes/menu.route.php?op=listarByPerfil",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData,
      },
    );

    let jsonAsignados = await respAsignados.json();
    const idsAsignados = extraerIdsMenus(jsonAsignados.data || []);

    renderizarCheckboxMenus(jsonMenus.data || [], idsAsignados);
  } catch (error) {
    console.error(error);
    AlertService.error("Error", "No se pudieron cargar los detalles");
  }
}

async function verPermisos(id) {
  idPerfilActual = id;
  try {
    const formData = new FormData();
    formData.append("id", id);

    let respPerfil = await fetch(
      "../../../app/routes/perfil.route.php?op=mostrar",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData,
      },
    );
    let jsonPerfil = await respPerfil.json();

    if (!jsonPerfil.status) {
      AlertService.error("Error", jsonPerfil.msg || "No se encontraron datos");
      return;
    }

    const perfil = jsonPerfil.data;
    poblarInfoPerfil(perfil, "assign");

    let respMenus = await fetch(
      "../../../app/routes/menu.route.php?op=listar",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
      },
    );

    let jsonMenus = await respMenus.json();

    if (!jsonMenus.status || !Array.isArray(jsonMenus.data)) {
      renderizarCheckboxMenus([]);
      return;
    }

    let respAsignados = await fetch(
      "../../../app/routes/menu.route.php?op=listarByPerfil",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData,
      },
    );

    let jsonAsignados = await respAsignados.json();
    const idsAsignados = extraerIdsMenus(jsonAsignados.data || []);

    idsOriginalesAsignados = [...idsAsignados];
    renderizarCheckboxMenus(jsonMenus.data || [], idsAsignados);
  } catch (error) {
    console.error(error);
    AlertService.error("Error", "No se pudieron cargar los datos");
  }
}

function poblarInfoPerfil(perfil, prefix = "") {
  const nameEl = document.getElementById(`${prefix}profileName`);
  const descEl = document.getElementById(`${prefix}profileDesc`);
  const badgeEl = document.getElementById(`${prefix}profileStatusBadge`);
  const dotEl = document.getElementById(`${prefix}profileStatusDot`);
  const textEl = document.getElementById(`${prefix}profileStatusText`);
  const totalMenus = document.getElementById(`${prefix}totalMenus`);
  const menusPrincipales = document.getElementById(`${prefix}menusPrincipales`);

  if (nameEl) nameEl.textContent = perfil.nomPerfil;
  if (descEl) descEl.textContent = perfil.descPerfil;
  if (totalMenus)
    totalMenus.textContent = `${perfil.totalMenus} ${
      perfil.totalMenus != 1 ? "permisos" : "permiso"
    }`;
  if (menusPrincipales)
    menusPrincipales.textContent = `${perfil.totalMenusPrincipales} ${
      perfil.totalMenusPrincipales != 1
        ? "módulos principales"
        : "módulo principal"
    }`;

  badgeEl?.classList.remove(
    "bg-green-100",
    "text-green-700",
    "bg-orange-100",
    "text-orange-700",
  );
  dotEl?.classList.remove("bg-green-500", "bg-orange-500");

  const isActive = Boolean(Number(perfil.estado));

  if (isActive) {
    badgeEl?.classList.add("bg-green-100", "text-green-700");
    dotEl?.classList.add("bg-green-500");
    if (textEl) textEl.textContent = "Activo";
  } else {
    badgeEl?.classList.add("bg-orange-100", "text-orange-700");
    dotEl?.classList.add("bg-orange-500");
    if (textEl) textEl.textContent = "Inactivo";
  }
}

function renderizarMenus(menus) {
  const container = document.getElementById("menusContainer");
  if (!container) return;
  container.innerHTML = "";
  if (!menus || menus.length === 0) {
    container.innerHTML = `
    <div class="col-span-full">
      <div class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-sm mb-4">
          <i class="bi bi-key text-gray-400 text-4xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">
          Sin permisos asignados
        </h3>
        <p class="text-sm text-gray-500 max-w-sm mx-auto">
          Este perfil aún no tiene menús o módulos configurados. 
          Asigna permisos para habilitar funcionalidades.
        </p>
      </div>
    </div>
  `;
    return;
  }

  menus.forEach((menu) => {
    const menuCard = crearCardMenu(menu);
    container.appendChild(menuCard);
  });
}

function crearCardMenu(menu) {
  const card = document.createElement("div");
  card.className =
    "border border-gray-200 rounded-lg hover:shadow-md transition-shadow";
  const tieneHijos = menu.children && menu.children.length > 0;
  card.innerHTML = `
    <div class="bg-gray-50 px-4 py-3 flex items-center gap-3 ${
      !tieneHijos ? "rounded-t-lg" : ""
    }">
      <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <i class="${menu.icon_menu} text-blue-600"></i>
      </div>
      <div class="flex-1">
        <p class="font-semibold text-gray-800">${menu.titulo_menu}</p>
        ${
          tieneHijos
            ? `<p class="text-xs text-gray-500">${menu.children.length} submenús</p>`
            : ""
        }
      </div>
      <i class="bi bi-check-circle-fill text-green-500"></i>
    </div>
  `;
  if (tieneHijos) {
    const childrenContainer = document.createElement("div");
    childrenContainer.className = "px-4 py-2 bg-white";
    menu.children.forEach((child) => {
      childrenContainer.innerHTML += `
        <div class="flex items-center gap-2 py-2 text-sm text-gray-700">
          <i class="bi bi-dot text-blue-400 text-xl"></i>
          <span>${child.titulo_menu}</span>
        </div>
      `;
    });
    card.appendChild(childrenContainer);
  }
  return card;
}

function renderizarCheckboxMenus(menus, idsAsignados = []) {
  const container = document.getElementById("menusCheckboxContainer");
  const totalEl = document.getElementById("totalMenusAvailable");

  if (!container) return;

  // ✅ VALIDAR que menus sea un array antes de usarlo
  if (!menus || !Array.isArray(menus)) {
    menus = []; // Asignar array vacío por defecto
  }

  // Limpiar contenedor
  container.innerHTML = "";

  // Actualizar total de menús disponibles
  if (totalEl) totalEl.textContent = menus.length; // Ahora menus siempre es un array

  // Validar si hay menús
  if (menus.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="bi bi-inbox text-3xl mb-2 block"></i>
        <p>No hay menús disponibles</p>
      </div>
    `;
    return;
  }

  // Renderizar cada menú con checkbox
  menus.forEach((menu) => {
    const menuItem = crearCheckboxMenu(menu, idsAsignados);
    container.appendChild(menuItem);
  });

  // Agregar listeners para la lógica padre-hijo
  agregarLogicaPadreHijo();

  // Inicializar eventos de los botones y búsqueda
  inicializarEventosModal();

  // Actualizar contador inicial
  actualizarContador();
}

function agregarLogicaPadreHijo() {
  const checkboxes = document.querySelectorAll(".menu-checkbox");

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const isParent = this.dataset.parent === "true";
      const parentId = this.dataset.parentId;
      const menuId = this.value;

      if (isParent) {
        // ✅ Si es padre: marcar/desmarcar todos los hijos
        const children = document.querySelectorAll(
          `[data-parent-id="${menuId}"]`,
        );
        children.forEach((child) => {
          child.checked = this.checked;
        });
      } else {
        // ✅ Si es hijo: marcar el padre si se selecciona
        if (this.checked && parentId) {
          const parent = document.getElementById(`menu-${parentId}`);
          if (parent) parent.checked = true;
        }

        // ✅ Desmarcar padre si todos los hijos están desmarcados
        if (!this.checked && parentId) {
          const siblings = document.querySelectorAll(
            `[data-parent-id="${parentId}"]`,
          );
          const algunoChecked = Array.from(siblings).some((s) => s.checked);

          if (!algunoChecked) {
            const parent = document.getElementById(`menu-${parentId}`);
            if (parent) parent.checked = false;
          }
        }
      }

      // Actualizar contador
      actualizarContador();
    });
  });
}

function crearCheckboxMenu(menu, idsAsignados = []) {
  const div = document.createElement("div");
  div.className = "mb-3";

  const tieneHijos = menu.children && menu.children.length > 0;
  const isChecked = idsAsignados.includes(menu.id_menu); // ✅ Verificar si está asignado

  // Menú padre
  div.innerHTML = `
    <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <input 
        type="checkbox" 
        id="menu-${menu.id_menu}"
        value="${menu.id_menu}"
        class="menu-checkbox w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
        data-parent="true"
        ${isChecked ? "checked" : ""}
      />
      <label for="menu-${
        menu.id_menu
      }" class="flex-1 flex items-center gap-3 cursor-pointer">
        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <i class="${menu.icon_menu} text-blue-600"></i>
        </div>
        <div>
          <p class="font-medium text-gray-800">${menu.titulo_menu}</p>
          ${
            tieneHijos
              ? `<p class="text-xs text-gray-500">${menu.children.length} submenús</p>`
              : ""
          }
        </div>
      </label>
    </div>
  `;

  // Si tiene hijos, agregar submenús indentados
  if (tieneHijos) {
    const childrenContainer = document.createElement("div");
    childrenContainer.className = "ml-10 mt-2 space-y-2";

    menu.children.forEach((child) => {
      const isChildChecked = idsAsignados.includes(child.id_menu); // ✅ Verificar hijo

      childrenContainer.innerHTML += `
        <div class="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
          <input 
            type="checkbox" 
            id="menu-${child.id_menu}"
            value="${child.id_menu}"
            class="menu-checkbox w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            data-parent="false"
            data-parent-id="${menu.id_menu}"
            ${isChildChecked ? "checked" : ""}
          />
          <label for="menu-${
            child.id_menu
          }" class="flex-1 cursor-pointer text-sm text-gray-700">
            <i class="bi bi-dot text-blue-400"></i>
            ${child.titulo_menu}
          </label>
        </div>
      `;
    });

    div.appendChild(childrenContainer);
  }

  return div;
}

function actualizarContador() {
  const checkboxes = document.querySelectorAll(".menu-checkbox:checked");
  const countEl = document.getElementById("countSelected");

  if (countEl) {
    countEl.textContent = checkboxes.length;
  }
}

function seleccionarTodos() {
  const checkboxes = document.querySelectorAll(".menu-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
  });
  actualizarContador();
}

function limpiarSeleccion() {
  const checkboxes = document.querySelectorAll(".menu-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  actualizarContador();
}

function buscarMenus() {
  const searchTerm = document
    .getElementById("searchMenu")
    .value.toLowerCase()
    .trim();
  const menuItems = document.querySelectorAll("#menusCheckboxContainer > div");

  // Limpiar mensaje previo si existe
  const prevMsg = document.getElementById("noResultsMenu");
  if (prevMsg) prevMsg.remove();

  if (!searchTerm) {
    menuItems.forEach((item) => {
      item.style.display = "";
    });
    return;
  }

  let hayCoincidencias = false;

  menuItems.forEach((item) => {
    const parentLabel = item.querySelector("label");
    const parentText = parentLabel ? parentLabel.textContent.toLowerCase() : "";

    const childrenLabels = item.querySelectorAll(".ml-10 label");
    const childrenTexts = Array.from(childrenLabels).map((label) =>
      label.textContent.toLowerCase(),
    );

    const parentMatch = parentText.includes(searchTerm);
    const childMatch = childrenTexts.some((text) => text.includes(searchTerm));

    if (parentMatch || childMatch) {
      item.style.display = "";
      hayCoincidencias = true; // 👈 encontró al menos uno

      if (childMatch && !parentMatch) {
        const childrenContainer = item.querySelector(".ml-10");
        if (childrenContainer) {
          const childDivs = childrenContainer.querySelectorAll(".flex");
          childDivs.forEach((childDiv) => {
            const childLabel = childDiv.querySelector("label");
            const childText = childLabel
              ? childLabel.textContent.toLowerCase()
              : "";
            childDiv.style.display = childText.includes(searchTerm)
              ? ""
              : "none";
          });
        }
      } else {
        const childrenContainer = item.querySelector(".ml-10");
        if (childrenContainer) {
          childrenContainer.querySelectorAll(".flex").forEach((childDiv) => {
            childDiv.style.display = "";
          });
        }
      }
    } else {
      item.style.display = "none";
    }
  });

  // 👇 Si no encontró nada, mostrar mensaje
  if (!hayCoincidencias) {
    const msg = document.createElement("div");
    msg.id = "noResultsMenu";
    msg.className = "p-5 text-center text-gray-500";
    msg.innerHTML = `
      <i class="bi bi-search text-4xl mb-3 block"></i>
      <p class="font-medium">No se encontraron menús</p>
      <p class="text-sm mt-2 text-gray-400">Búsqueda: "${searchTerm}"</p>
    `;
    document.getElementById("menusCheckboxContainer").appendChild(msg);
  }
}

function inicializarEventosModal() {
  // Botón: Seleccionar todos
  const btnSelectAll = document.getElementById("btnSelectAll");
  if (btnSelectAll) {
    btnSelectAll.onclick = seleccionarTodos;
  }

  // Botón: Limpiar
  const btnClearAll = document.getElementById("btnClearAll");
  if (btnClearAll) {
    btnClearAll.onclick = limpiarSeleccion;
  }

  // Botón: Resetear
  const btnReset = document.getElementById("btnResetPermisos");
  if (btnReset) {
    btnReset.onclick = resetearPermisos;
  }

  // ✅ Botón: Guardar permisos
  const btnGuardar = document.getElementById("btnGuardarPermisos");
  if (btnGuardar) {
    btnGuardar.onclick = guardarPermisos;
  }

  // Input: Búsqueda en tiempo real
  const searchInput = document.getElementById("searchMenu");
  if (searchInput) {
    searchInput.addEventListener("input", buscarMenus);
  }
}

function resetearPermisos() {
  // Desmarcar todos primero
  const checkboxes = document.querySelectorAll(".menu-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // ✅ Marcar solo los que estaban originalmente
  idsOriginalesAsignados.forEach((id) => {
    const checkbox = document.getElementById(`menu-${id}`);
    if (checkbox) {
      checkbox.checked = true;
    }
  });

  // Actualizar contador
  actualizarContador();
}

// Escuchar cambios en los checkboxes
document.addEventListener("change", (e) => {
  if (e.target.classList.contains("menu-checkbox")) {
    actualizarContador();
  }
});

function extraerIdsMenus(menus) {
  const ids = [];

  menus.forEach((menu) => {
    // Agregar ID del padre
    ids.push(menu.id_menu);

    // Agregar IDs de los hijos si existen
    if (menu.children && Array.isArray(menu.children)) {
      menu.children.forEach((child) => {
        ids.push(child.id_menu);
      });
    }
  });

  return ids;
}

async function guardarPermisos() {
  const checkboxes = document.querySelectorAll(".menu-checkbox");
  const permisos = [];

  checkboxes.forEach((checkbox) => {
    permisos.push({
      idPerfil: idPerfilActual,
      idMenu: parseInt(checkbox.value),
      seleccionado: checkbox.checked,
    });
  });

  console.log(permisos); // Para verificar

  try {
    const formData = new FormData();
    formData.append("idPerfil", idPerfilActual);
    formData.append("permisos", JSON.stringify(permisos));

    let resp = await fetch(
      "../../../app/routes/perfil.route.php?op=asignarpermisos",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData,
      },
    );

    let json = await resp.json();

    if (json.status) {
      AlertService.success("Éxito", json.msg);
      closeModalAsignar();
      listar();
    } else {
      AlertService.error("Error", json.msg);
    }
  } catch (error) {
    console.error(error);
    AlertService.error("Error", "No se pudieron guardar los permisos");
  }
}

window.openModalForm = function (id = null) {
  if (!DialogformProfile) return;

  DialogformProfile.open();
  formProfile = document.getElementById("formProfile");

  setTimeout(() => {
    if (id === null) {
      initInput();
    } else {
      Mostrar(id);
    }
  }, 0);
};

window.closeModalForm = function () {
  if (!DialogformProfile) return;
  initInput();
  DialogformProfile.close();
};
window.openModalInfo = function (id = null) {
  if (id === undefined || id === null) return;
  if (!DialogInfoProfile) return;
  verDetalles(id);
  DialogInfoProfile.open();
};

window.closeModalInfo = function () {
  if (!DialogInfoProfile) return;
  DialogInfoProfile.close();
};

window.openModalAsignar = function (id = null) {
  if (!DialogAssign) return;
  if (id !== null) {
    document.getElementById("searchMenu").value = "";
    verPermisos(id);
  }
  DialogAssign.open();
};

window.closeModalAsignar = function () {
  if (!DialogAssign) return;
  DialogAssign.close();
};

function initInput() {
  document.getElementById("idPerfil").value = "";
  campos = formProfile.querySelectorAll("custom-text-field, custom-textarea");
  campos.forEach((campo) => {
    if (typeof campo.initInput === "function") {
      campo.initInput();
    }
  });
}

init();
