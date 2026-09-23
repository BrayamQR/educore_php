export function initCustomValues(initialValues, options = {}) {
  const { validate = true, root = document } = options;

  const customEls = [...root.querySelectorAll("*")].filter((el) =>
    el.tagName.includes("-"),
  );

  Promise.all(
    customEls.map((el) => customElements.whenDefined(el.tagName.toLowerCase())),
  ).then(() => {
    setTimeout(() => {
      const yaAsignados = new Set();

      customEls.forEach((field) => {
        if (typeof field.setValue !== "function") return;

        const nameInicio = field.getAttribute?.("name-inicio");
        const nameFin = field.getAttribute?.("name-fin");

        if (nameInicio && nameFin) {
          if (yaAsignados.has(nameInicio) || yaAsignados.has(nameFin)) return;
          if (!(nameInicio in initialValues) && !(nameFin in initialValues))
            return;

          const inicio = initialValues[nameInicio] ?? "";
          const fin = initialValues[nameFin] ?? "";
          field.setValue({ inicio, fin }, { validate });
          yaAsignados.add(nameInicio);
          yaAsignados.add(nameFin);
          return;
        }

        const name = field.getAttribute?.("name");
        if (!name || !(name in initialValues)) return;
        if (yaAsignados.has(name)) return;

        try {
          field.setValue(initialValues[name], { validate });
        } catch (err) {
          console.error(`Error al setear valor de "${name}":`, err);
        }
        yaAsignados.add(name);
      });
    }, 200);
  });
}
