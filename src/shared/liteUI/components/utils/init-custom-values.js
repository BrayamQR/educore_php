function initCustomValues(initialValues, options = {}) {
  const { validate = true } = options; // <- default true

  const customEls = [...document.querySelectorAll("*")].filter(
    (el) => typeof el.setValue === "function" || el.tagName.includes("-"),
  );

  Promise.all(
    customEls.map((el) => customElements.whenDefined(el.tagName.toLowerCase())),
  ).then(() => {
    setTimeout(() => {
      // Evita procesar dos veces el mismo par range (una vez por
      // "fechaInicio" y otra por "fechaFin"): al resolver el primero se
      // marcan ambas claves como ya asignadas.
      const yaAsignados = new Set();

      Object.keys(initialValues).forEach((name) => {
        if (yaAsignados.has(name)) return;

        let field = document.querySelector(`[name="${name}"]`);
        if (!field) return;

        // Caso range: el "name" matcheó un input interno plano (el hidden
        // que arma custom-datepicker en modo range para name-inicio/
        // name-fin), no el componente en sí. Ese hidden no tiene setValue
        // -> hay que subir al ancestro que sí lo tenga.
        if (typeof field.setValue !== "function") {
          let ancestro = field.parentElement;
          while (ancestro && typeof ancestro.setValue !== "function") {
            ancestro = ancestro.parentElement;
          }
          if (ancestro) field = ancestro;
        }

        if (!field || typeof field.setValue !== "function") return;

        // Si el componente encontrado expone name-inicio/name-fin (modo
        // range), se arma el valor combinado {inicio, fin} usando AMBAS
        // claves del initialValues, y se marcan las dos como resueltas
        // para no volver a procesarlas cuando el forEach llegue a la otra.
        const nameInicio = field.getAttribute?.("name-inicio");
        const nameFin = field.getAttribute?.("name-fin");

        if (nameInicio && nameFin) {
          const inicio = initialValues[nameInicio] ?? "";
          const fin = initialValues[nameFin] ?? "";
          field.setValue({ inicio, fin }, { validate });
          yaAsignados.add(nameInicio);
          yaAsignados.add(nameFin);
          return;
        }

        field.setValue(initialValues[name], { validate });
      });
    }, 200);
  });
}

window.initCustomValues = initCustomValues;
