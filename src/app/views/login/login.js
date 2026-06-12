import { AlertService } from "../../../shared/js/globalscripts.js";

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

  try {
    const resp = await fetch("../../../app/routes/usuario.route.php?op=login", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      body: data,
    });

    // primero leemos como texto para ver qué devuelve
    const text = await resp.text();
    console.log("Respuesta PHP:", text);

    const json = JSON.parse(text);

    if (json.status) {
      window.location.href = "../home/home.php";
    } else {
      AlertService.warning("¡Atencion!", json.msg);
    }
  } catch (error) {
    console.error(error);
    AlertService.error("¡Error!", "Error al conectar con el servidor");
  }
}

init();
