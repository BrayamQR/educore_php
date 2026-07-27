import {
  AlertService,
  apiRequest,
  ROUTES,
} from "../../../shared/js/globalscripts.js";

let formLogin = null;
let campos = [];

function init() {
  formLogin = document.getElementById("formLogin");

  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    campos = formLogin.querySelectorAll("custom-text-field");

    if (!validateForm()) {
      console.log("Formulario con errores 🚫");
      return;
    }
    Login();
  });
}

function validateForm() {
  let valid = true;
  campos.forEach((campo) => {
    if (!campo.checkValidity()) valid = false;
  });
  return valid;
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
