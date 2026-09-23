import {
  AlertService,
  apiRequest,
  ROUTES,
  crearGestorFormulario,
} from "../../../shared/js/globalscripts.js";

let formLogin = null;

const gestorForm = crearGestorFormulario(() => formLogin, {
  selectorCampos: "custom-text-field",
});

function init() {
  formLogin = document.getElementById("formLogin");

  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log("Formulario con errores 🚫");
      return;
    }
    Login();
  });
}

function validateForm() {
  return gestorForm.validar();
}

async function Login() {
  let form = document.getElementById("formLogin");
  const data = new FormData(form);
  const json = await apiRequest(ROUTES.USUARIO, "login", data);
  if (json.status) {
    window.location.href = "../home/home.php";
  } else {
    AlertService.warning("¡Atencion!", json.msg);
  }
}

init();
