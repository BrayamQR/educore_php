export function formatearFecha(fecha) {
  if (!fecha) return "";
  const [anio, mes, dia] = fecha.split("-");
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} del ${anio}`;
}

export function formatearHora(hora) {
  if (!hora) return "";
  const [hh, mm] = hora.split(":");
  const h = parseInt(hh);
  const periodo = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mm} ${periodo}`;
}
