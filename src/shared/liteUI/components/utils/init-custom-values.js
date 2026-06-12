function initCustomValues(initialValues) {
  const customEls = [...document.querySelectorAll("*")].filter(
    (el) => typeof el.setValue === "function" || el.tagName.includes("-"),
  );

  Promise.all(
    customEls.map((el) => customElements.whenDefined(el.tagName.toLowerCase())),
  ).then(() => {
    setTimeout(() => {
      Object.keys(initialValues).forEach((name) => {
        const field = document.querySelector(`[name="${name}"]`);

        if (field && typeof field.setValue === "function") {
          field.setValue(initialValues[name]);
        }
      });
    }, 200);
  });
}

window.initCustomValues = initCustomValues;
