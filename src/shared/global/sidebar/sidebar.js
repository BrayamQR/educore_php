document.addEventListener("DOMContentLoaded", () => {
  init();
});

async function mostrarMenu(id) {
  const formData = new FormData();
  formData.append("id", id);

  try {
    let resp = await fetch(
      "../../../app/routes/menu.route.php?op=listarByPerfil",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData,
      },
    );

    const json = await resp.json();

    if (json.status) {
      const sidebar = document.getElementById("sidebar");
      sidebar.innerHTML = "";
      renderMenu(json.data, sidebar);
      marcarActivo();
    } else {
      console.warn("No se encontraron menús");
    }
  } catch (error) {
    console.error(error);
  }
}

function renderMenu(items, container) {
  container.innerHTML = "";

  items.forEach((item) => {
    const hasChildren = item.children && item.children.length > 0;

    const wrapper = document.createElement("div");
    wrapper.className = "mb-1";

    if (!hasChildren) {
      const link = document.createElement("a");
      link.href = `../${item.path_menu}/${item.path_menu}.php`;
      link.className =
        "p-2.5 flex font-semibold items-center rounded-md cursor-pointer hover:bg-gray-800 text-white gap-3 duration-300 ease-linear";

      const iconDiv = document.createElement("div");
      iconDiv.className =
        "flex w-8 h-8 justify-center items-center rounded-full bg-gray-700";
      iconDiv.innerHTML = `<i class="bi ${item.icon_menu} text-sm"></i>`;

      const span = document.createElement("span");
      span.className = "text-sm";
      span.textContent = item.titulo_menu;

      link.appendChild(iconDiv);
      link.appendChild(span);
      wrapper.appendChild(link);
    } else {
      const link = document.createElement("div");
      link.className =
        "p-2.5 flex font-semibold items-center rounded-md cursor-pointer hover:bg-gray-800 text-white gap-3 duration-300 ease-linear";

      const iconDiv = document.createElement("div");
      iconDiv.className =
        "flex w-8 h-8 justify-center items-center rounded-full bg-gray-700";
      iconDiv.innerHTML = `<i class="bi ${item.icon_menu} text-sm"></i>`;

      const span = document.createElement("span");
      span.textContent = item.titulo_menu;

      link.appendChild(iconDiv);
      link.appendChild(span);
      wrapper.appendChild(link);

      if (hasChildren) {
        const childContainer = document.createElement("div");
        childContainer.className = "ml-10 flex flex-col gap-1";

        item.children.forEach((child) => {
          const childLink = document.createElement("a");
          childLink.href = `../${child.path_menu}/${child.path_menu}.php`;
          childLink.className =
            "py-1.5 px-2.5 flex font-normal items-center rounded-md cursor-pointer hover:bg-gray-800 text-neutral-300 hover:text-neutral-100 gap-3 duration-300 ease-linear";

          const childIcon = document.createElement("div");
          childIcon.className =
            "flex w-7 h-7 justify-center items-center rounded-full bg-gray-700";
          childIcon.innerHTML = `<i class="bi ${child.icon_menu} text-sm"></i>`;

          const childSpan = document.createElement("span");
          childSpan.textContent = child.titulo_menu;
          childSpan.className = "text-sm";

          childLink.appendChild(childIcon);
          childLink.appendChild(childSpan);
          childContainer.appendChild(childLink);
        });

        wrapper.appendChild(childContainer);
      }
    }

    container.appendChild(wrapper);
  });
}

function marcarActivo() {
  const currentPath = window.location.pathname.split("/").pop();

  document.querySelectorAll("#sidebar a").forEach((link) => {
    const linkPath = link.getAttribute("href").split("/").pop();
    if (linkPath === currentPath) {
      link.classList.add("bg-gray-700");
      link.classList.add("text-white");
      const iconCircle = link.querySelector("div.rounded-full");
      if (iconCircle) {
        iconCircle.classList.remove("bg-gray-700");
        iconCircle.classList.remove("text-neutral-300");
        iconCircle.classList.add("bg-blue-500");
        iconCircle.classList.add("text-white");
      }
    }
  });
}

function init() {
  if (document.getElementById("sidebar")) {
    mostrarMenu(ID_PERFIL);
  }
}
