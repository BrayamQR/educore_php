document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");
  const avatarBtn = document.getElementById("avatarBtn");
  const avatarDropdown = document.getElementById("avatarDropdown");
  const avatarContainer = document.getElementById("avatarContainer");

  // --- SIDEBAR ---
  // Solo se inicializa si estos elementos existen en la página actual
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const isClosed = sidebar.classList.contains("-translate-x-full");
      isClosed ? abrirSidebar() : cerrarSidebar();
    });

    document.addEventListener("click", (event) => {
      const isOpen = !sidebar.classList.contains("-translate-x-full");
      if (
        isOpen &&
        !sidebar.contains(event.target) &&
        !menuBtn.contains(event.target)
      ) {
        cerrarSidebar();
      }
    });

    function abrirSidebar() {
      sidebar.classList.remove("hidden");
      sidebar.classList.add("flex");
      requestAnimationFrame(() => {
        sidebar.classList.remove("-translate-x-full");
        sidebar.classList.add("translate-x-0");
      });
    }

    function cerrarSidebar() {
      sidebar.classList.remove("translate-x-0");
      sidebar.classList.add("-translate-x-full");
      setTimeout(() => {
        sidebar.classList.add("hidden");
        sidebar.classList.remove("flex");
      }, 300);
    }
  }

  // --- AVATAR DROPDOWN ---
  // Solo se inicializa si estos elementos existen en la página actual
  if (avatarBtn && avatarDropdown && avatarContainer) {
    avatarBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const isHidden = avatarDropdown.classList.contains("opacity-0");
      if (isHidden) {
        avatarDropdown.classList.remove(
          "opacity-0",
          "scale-95",
          "pointer-events-none",
        );
        avatarDropdown.classList.add("opacity-100", "scale-100");
      } else {
        avatarDropdown.classList.add(
          "opacity-0",
          "scale-95",
          "pointer-events-none",
        );
        avatarDropdown.classList.remove("opacity-100", "scale-100");
      }
    });

    document.addEventListener("click", (event) => {
      if (!avatarContainer.contains(event.target)) {
        avatarDropdown.classList.add(
          "opacity-0",
          "scale-95",
          "pointer-events-none",
        );
        avatarDropdown.classList.remove("opacity-100", "scale-100");
      }
    });
  }
});

// --- CERRAR SESIÓN ---
window.CerrarSesion = async function () {
  await fetch("../../../app/routes/usuario.route.php?op=cerrarsesion", {
    method: "POST",
  });
  window.location.href = "../../../app/views/login/login.php";
};
