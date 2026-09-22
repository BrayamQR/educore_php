import {
  apiRequest,
  ROUTES,
  formatearFecha,
  formatearHora,
  esLocale,
  sumarDias,
  hexToRgb,
  crearGestorFiltros,
} from "../../../shared/js/globalscripts.js";

let calendar;
let ultimoAnio = null;

const FILTROS_CONFIG = [
  {
    key: "anioLectivo",
    selector: "custom-select[name='filtroAnioLectivo']",
    event: "change",
    getValue: (el) => el.getValue() || "",
  },
  {
    key: "tipoEvento",
    selector: "custom-select[name='filtroTipoEvento']",
    event: "change",
    getValue: (el) => el.getValue() || "",
  },
];

const gestorFiltros = crearGestorFiltros(FILTROS_CONFIG, Filtrar);

async function init() {
  await obtenerUltimoAnio();

  if (document.getElementById("calendar")) {
    initFiltros();

    // Poblar los selects de filtro una vez que gestorFiltros ya cacheó los elementos
    const { anioLectivo, tipoEvento } = gestorFiltros.elementos;

    if (anioLectivo) {
      const anios = await getAnioLectivo();
      anioLectivo.setOptions(anios);
      if (ultimoAnio) {
        anioLectivo.setValue(ultimoAnio.id_aniolectivo);
        gestorFiltros.controlador.sincronizar(
          anioLectivo,
          ultimoAnio.id_aniolectivo,
        );
      }
    }

    if (tipoEvento) {
      const evento = await getTipoEvento();
      tipoEvento.setOptions(evento);
    }

    cargarCalendario();
  }
}

async function cargarCalendario() {
  const data = await Listar();
  if (!data) return;
  renderizarCalendario(data);
}

function renderizarCalendario(data) {
  const calendarEl = document.getElementById("calendar");

  const validRange = {
    start: data.fecha_inicio,
    end: sumarDias(data.fecha_fin),
  };

  const periodos = prepararPeriodos(data.periodos);
  const eventos = data.eventos.map(mapearEvento);

  if (calendar) {
    calendar.destroy();
  }

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
    locales: [esLocale],
    height: "auto",
    firstDay: 0,
    validRange: validRange,
    nowIndicator: true,
    dayHeaderFormat: { weekday: "short", day: "numeric" },
    slotLabelFormat: {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
    eventTimeFormat: {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
    slotMinTime: "06:00:00",
    slotMaxTime: "24:00:00",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    buttonText: {
      today: "Hoy",
      month: "Mes",
      week: "Semana",
      day: "Día",
    },
    events: eventos,
    eventDisplay: "block",
    eventContent: renderizarEvento,
    eventDidMount: aplicarEstiloEvento,
    eventClick: mostrarDetalleEvento,
    dayCellDidMount: (arg) => marcarPeriodo(arg, periodos),
  });

  calendar.render();
}

function prepararPeriodos(periodos) {
  return periodos.map((p) => ({
    ...p,
    inicio: new Date(p.fecha_inicio + "T00:00:00"),
    fin: new Date(p.fecha_fin + "T00:00:00"),
  }));
}

function marcarPeriodo(arg, periodos) {
  const fecha = arg.date;
  const periodo = periodos.find((p) => fecha >= p.inicio && fecha <= p.fin);
  if (!periodo) return;

  const rgb = hexToRgb(periodo.color);
  if (rgb) {
    arg.el.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`;
  }

  if (fecha.getTime() === periodo.inicio.getTime()) {
    arg.el.style.position = "relative";

    const label = document.createElement("div");
    label.textContent = periodo.desc_periodo;
    label.style.cssText = `
      position: absolute;
      bottom: 2px;
      left: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      color: ${periodo.color};
      white-space: nowrap;
      pointer-events: none;
      z-index: 1;
    `;
    arg.el.appendChild(label);
  }
}

function mapearEvento(row) {
  const evento = {
    id: row.origen + "_" + row.id,
    title: row.titulo,
    color: row.color,
    extendedProps: {
      tipo: row.tipo,
      descripcion: row.descripcion,
      lugar: row.lugar,
      fechaInicio: row.fecha_inicio,
      horaIngreso: row.hora_ingreso,
      horaSalida: row.hora_salida,
    },
  };

  if (row.todo_el_dia == 1) {
    evento.start = row.fecha_inicio;
    evento.end = sumarDias(row.fecha_fin);
    evento.allDay = true;
  } else if (row.fecha_inicio === row.fecha_fin) {
    evento.start = row.fecha_inicio + "T" + row.hora_ingreso;
    evento.end = row.fecha_fin + "T" + row.hora_salida;
  } else {
    evento.startRecur = row.fecha_inicio;
    evento.endRecur = sumarDias(row.fecha_fin);
    evento.startTime = row.hora_ingreso;
    evento.endTime = row.hora_salida;
  }

  return evento;
}

function renderizarEvento(arg) {
  const horaTexto = arg.timeText;
  const titulo = arg.event.title;

  const html = horaTexto
    ? `
      <div class="evento-chip">
        <div class="evento-fila">
          <span class="evento-dot"></span>
          <span class="evento-hora">${horaTexto}</span>
        </div>
        <div class="evento-titulo">${titulo}</div>
      </div>
    `
    : `
      <div class="evento-chip">
        <div class="evento-fila">
          <span class="evento-dot"></span>
          <span class="evento-titulo">${titulo}</span>
        </div>
      </div>
    `;

  return { html };
}

function aplicarEstiloEvento(info) {
  const color =
    info.event.backgroundColor || info.event.extendedProps.color || "#2563eb";
  const rgb = hexToRgb(color);
  if (!rgb) return;

  info.el.style.setProperty("--evento-color", color);
  info.el.style.setProperty(
    "--evento-bg",
    `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.20)`,
  );
}

async function Listar() {
  const json = await apiRequest(ROUTES.CALENDARIO, "listar");
  if (!json.status) return null;
  return json.data;
}

function mostrarDetalleEvento(info) {
  const props = info.event.extendedProps;
  const color = info.event.backgroundColor || props.color || "#2563eb";

  const fechaTexto = formatearFecha(props.fechaInicio);

  let horaTexto = "";
  if (!info.event.allDay) {
    horaTexto = formatearHora(props.horaIngreso);
    if (props.horaSalida) {
      horaTexto += " - " + formatearHora(props.horaSalida);
    }
  }

  const mensajesPorTipo = {
    Feriado: "No hay actividades académicas programadas este día.",
    Vacaciones: "Periodo de vacaciones, no hay clases.",
    Suspensión: "Las clases están suspendidas este día.",
  };

  const descripcionTexto =
    props.descripcion || mensajesPorTipo[props.tipo] || "";

  const fila = (icono, texto) => `
    <div class="flex items-center gap-3">
      <div style="background-color:${color}15; width:32px; height:32px; border-radius:9999px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
        <i class="bi ${icono}" style="color:${color}; font-size:1rem;"></i>
      </div>
      <span class="text-sm text-gray-700">${texto}</span>
    </div>
  `;

  Swal.fire({
    title: info.event.title,
    html: `
      <div class="text-left">
        ${
          props.tipo
            ? `<span style="background-color:${color}20; color:${color}; padding:4px 12px; border-radius:9999px; font-size:0.75rem; font-weight:700; display:inline-block; margin-bottom:16px;">
                ${props.tipo}
              </span>`
            : ""
        }

        <div class="flex flex-col gap-3">
          ${fila("bi-calendar-event", fechaTexto)}
          ${horaTexto ? fila("bi-clock", horaTexto) : ""}
          ${props.lugar ? fila("bi-geo-alt", props.lugar) : ""}
        </div>

        ${
          descripcionTexto
            ? `<hr style="margin:16px 0; border-color:#e5e7eb;">
               <p class="text-sm text-gray-600" style="line-height:1.5;">${descripcionTexto}</p>`
            : ""
        }
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: "Cerrar",
    confirmButtonColor: color,
    customClass: {
      popup: "rounded-xl",
    },
  });
}

async function getAnioLectivo() {
  const json = await apiRequest(ROUTES.ANIO_LECTIVO, "listar");
  if (json.status) {
    let data = json.data;
    let ops = data.map((p) => ({
      value: p.id_aniolectivo,
      desc: p.anio,
    }));
    return ops;
  }
}

async function getTipoEvento() {
  const json = await apiRequest(ROUTES.GENERIC_LIST, "tipoevento");
  if (json.status) {
    let data = json.data;
    let ops = data.map((p) => ({
      value: p.value,
      desc: p.label,
    }));
    return ops;
  }
}

async function obtenerUltimoAnio() {
  const json = await apiRequest(ROUTES.ANIO_LECTIVO, "obtenerultimoanio");
  ultimoAnio = json.status ? json.data : null;
}

window.toggleFiltros = function () {
  const panel = document.getElementById("panelFiltros");
  const btn = document.getElementById("btnToggleFiltros");

  const estaOculto = panel.classList.contains("hidden");

  if (estaOculto) {
    panel.classList.remove("hidden");
    panel.classList.add("flex");

    const alturaFinal = panel.scrollHeight;
    panel.style.height = "0px";
    panel.style.overflow = "hidden";
    panel.style.opacity = "0";
    panel.style.transition = "height 0.3s ease, opacity 0.3s ease";

    requestAnimationFrame(() => {
      panel.style.height = alturaFinal + "px";
      panel.style.opacity = "1";
    });

    panel.addEventListener(
      "transitionend",
      () => {
        panel.style.height = "auto";
        panel.style.overflow = "visible";
      },
      { once: true },
    );
  } else {
    const alturaActual = panel.scrollHeight;
    panel.style.height = alturaActual + "px";
    panel.style.overflow = "hidden";

    requestAnimationFrame(() => {
      panel.style.height = "0px";
      panel.style.opacity = "0";
    });

    panel.addEventListener(
      "transitionend",
      () => {
        panel.classList.add("hidden");
        panel.classList.remove("flex");
        panel.style.height = "";
        panel.style.overflow = "";
        panel.style.opacity = "";
        panel.style.transition = "";
      },
      { once: true },
    );
  }

  btn.classList.toggle("bg-blue-100");
  btn.classList.toggle("text-blue-600");
  btn.classList.toggle("border-blue-300");
};

function initFiltros() {
  gestorFiltros.inicializar();
}

async function Filtrar() {
  const { anioLectivo, tipoEvento } = gestorFiltros.obtenerValores();

  if (!gestorFiltros.hayFiltrosActivos()) {
    await cargarCalendario();
    return;
  }

  const json = await apiRequest(ROUTES.CALENDARIO, "buscar", {
    id: anioLectivo,
    tipoEvento: tipoEvento,
  });

  if (json.status) {
    renderizarCalendario(json.data);
  } else {
    if (calendar) {
      calendar.destroy();
      calendar = null;
    }
    document.getElementById("calendar").innerHTML = `
      <div class="p-5 text-center text-gray-500">
        <i class="bi bi-search text-4xl mb-3 block"></i>
        <p class="font-medium">No se encontraron resultados</p>
        <p class="text-sm mt-2 text-gray-400">Intenta con otros filtros</p>
      </div>`;
  }
}

window.LimpiarFiltros = function () {
  gestorFiltros.limpiar({
    anioLectivo: ultimoAnio ? ultimoAnio.id_aniolectivo : "",
  });
  cargarCalendario();
};

init();
