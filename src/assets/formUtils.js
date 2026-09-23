import { initCustomValues } from "../shared/liteUI/components/utils/init-custom-values.js";

export { initCustomValues };

export function crearGestorFormulario(getForm, config = {}) {
  const {
    selectorCampos = "custom-autocomplete, custom-text-field, custom-select, custom-datepicker, custom-timepicker, custom-textarea, custom-number-field",
  } = config;

  let campos = [];

  function refrescarCampos() {
    const form = getForm();
    campos = form ? Array.from(form.querySelectorAll(selectorCampos)) : [];
    return campos;
  }

  function initInput() {
    refrescarCampos();
    campos.forEach((campo) => {
      if (typeof campo.initInput === "function") campo.initInput();
    });
  }

  function validar(validacionesExtra = []) {
    refrescarCampos();
    let valid = true;

    campos.forEach((campo) => {
      if (!campo.checkValidity()) valid = false;
    });

    validacionesExtra.forEach((fn) => {
      if (!fn()) valid = false;
    });

    return valid;
  }

  function poblar(data, options = {}) {
    const form = getForm();
    initCustomValues(data, { root: form, ...options });
  }

  return {
    get campos() {
      return campos;
    },
    refrescarCampos,
    initInput,
    validar,
    poblar,
  };
}
