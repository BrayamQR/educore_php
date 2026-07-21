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
  const periodo = h >= 12 ? "p.m." : "a.m.";
  const h12 = h % 12 || 12;
  return `${h12}:${mm} ${periodo}`;
}

export function formatearFechaCorta(fecha) {
  if (!fecha) return "";
  const [anio, mes, dia] = fecha.split("-");
  const mesesCortos = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  return `${parseInt(dia)} ${mesesCortos[parseInt(mes) - 1]} ${anio}`;
}

export function formatearFechaNumerica(fecha) {
  if (!fecha) return "";
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

const MESES_CORTOS_MAYUS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

export function obtenerMesDia(fecha) {
  if (!fecha) return { mes: "-", dia: "-" };
  const date = new Date(fecha + "T00:00:00");
  return {
    mes: MESES_CORTOS_MAYUS[date.getMonth()],
    dia: date.getDate(),
  };
}

export function sumarDias(fecha, dias = 1) {
  if (!fecha) return "";
  const date = new Date(fecha + "T00:00:00");
  date.setDate(date.getDate() + dias);
  return date.toISOString().split("T")[0];
}
