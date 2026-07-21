function init() {
  const timepicker = document.querySelector(
    'custom-timepicker[name="horaprueba"]',
  );

  if (!timepicker) {
    console.error("No se encontró el custom-timepicker 'horaprueba'");
    return;
  }

  // El evento 'change' se dispara solo al confirmar (botón "Aceptar"),
  // no en cada movimiento del dial.
  timepicker.addEventListener("change", (e) => {
    // e.detail.value ya viene en formato 24h ("HH:MM")
    console.log("Hora seleccionada (24h):", e.detail.value);

    // Alternativa equivalente usando el método público del componente:
    console.log("getValue():", timepicker.getValue());
  });
}

init();
